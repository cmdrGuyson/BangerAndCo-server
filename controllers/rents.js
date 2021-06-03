const { request, response } = require("express");
const moment = require("moment");
const nodemailer = require("nodemailer");

const User = require("../mdb_models/user");
const Vehicle = require("../mdb_models/vehicle");
const Rent = require("../mdb_models/rent");
const Offence = require("../mdb_models/offence");
const Equipment = require("../mdb_models/equipment");

const {
  isOver25,
  getList,
  isTimesValid,
  isUserFraudulent,
} = require("../utils/validators");
const { generateHtml } = require("../utils/mail");

exports.rentVehicle = async (request, response) => {
  const vehicleID = request.params.id;
  const userID = request.user.id;

  //Get user input
  const rentData = {
    pickupDate: request.body.pickupDate,
    pickupTime: request.body.pickupTime,
    dropoffDate: request.body.dropoffDate,
    dropoffTime: request.body.dropoffTime,
    additionalEquipment: request.body.additionalEquipment,
  };

  try {
    const vehicle = await Vehicle.findById(vehicleID);
    const user = await User.findById(userID).orFail();

    //Check if vehicle exists
    if (!vehicle)
      return response.status(404).json({ error: "Vehicle not found" });

    //Check if user is blacklisted by DMV
    const isBlacklisted_dmv = await handleOffences(user);

    //console.log(isBlacklisted_dmv);

    if (isBlacklisted_dmv)
      return response.status(403).json({ error: "Blacklisted by dmv" });

    // Check if the user is fraudulent
    const isFraudulent = await isUserFraudulent(userID);

    if (isFraudulent)
      return response.status(403).json({ error: "Insurance fraud" });

    //Check if user is not blacklisted and is verified
    if (user.isBlacklisted)
      response.status(403).json({ error: "You are blacklisted" });

    if (!user.isVerified)
      response.status(403).json({ error: "You are not verified" });

    //Validate user input

    //Pickup and Dropoff as Date objects
    const _pickup = moment(
      `${rentData.pickupDate} ${rentData.pickupTime}`,
      "YYYY-MM-DD HH:mm"
    );

    const _dropoff = moment(
      `${rentData.dropoffDate} ${rentData.dropoffTime}`,
      "YYYY-MM-DD HH:mm"
    );

    //Check validity of pickup and dropoff times
    if (!isTimesValid(rentData))
      return response
        .status(400)
        .json({ error: "Invalid pickup and dropoff times" });

    const pickup = _pickup.format();
    const dropoff = _dropoff.format();

    //Check if vehicle is rentable
    let check = false;
    let availableVehicles = await getList(new Date(pickup), new Date(dropoff));
    availableVehicles.forEach((vehicle) => {
      if (vehicle._id.toString() === vehicleID) {
        check = true;
      }
    });

    //If vehicle isnt available
    if (!check) {
      return response.status(400).json({ error: "Vehicle unavailable" });
    }

    //Check if vehicle can be insured for user
    const isInsured = isOver25(user.dateOfBirth);

    let total = 0;

    //Calculate totals
    let minutesRented = _dropoff.diff(_pickup, "minutes");

    /* Calculate total of vehicle */

    //Rent duration is equal to 5 hours
    if (minutesRented === 300) {
      total = vehicle.rent / 2;
    }
    // Rent duration is less than 24 hours
    else if (minutesRented <= 1440) {
      total = vehicle.rent;
    } else {
      let daysRented = Math.floor(minutesRented / 60 / 24);
      let remainingMins = minutesRented - daysRented * 60 * 24;
      if (remainingMins === 0) total = vehicle.rent * daysRented;
      else if (remainingMins <= 300)
        total = vehicle.rent * daysRented + vehicle.rent / 2;
      else total = (daysRented + 1) * vehicle.rent;
    }

    let equipments = [];

    /* Calculate total of Equipment */
    if (
      rentData.additionalEquipment &&
      rentData.additionalEquipment.length > 0
    ) {
      equipments = await Equipment.find()
        .where("_id")
        .in(rentData.additionalEquipment)
        .exec();

      equipments.forEach((equipment) => {
        let rentAmount = 0;
        let rent = equipment.rent;

        //Rent duration is equal to 5 hours
        if (minutesRented <= 300) {
          rentAmount = rent / 2;
        }
        // Rent duration is less than 24 hours
        else if (minutesRented <= 1440) {
          rentAmount = rent;
        } else {
          let daysRented = Math.floor(minutesRented / 60 / 24);
          let remainingMins = minutesRented - daysRented * 60 * 24;
          if (remainingMins === 0) rentAmount = rent * daysRented;
          else if (remainingMins <= 300)
            rentAmount = rent * daysRented + rent / 2;
          else rentAmount = (daysRented + 1) * rent;
        }
        total += rentAmount;
      });
    }

    //Create rent object and save
    const rent_data = {
      vehicle,
      user,
      rentedFrom: pickup,
      rentedTo: dropoff,
      total,
      status: "pending",
      isInsured,
      additionalEquipment: equipments,
    };

    const rent = await Rent.create(rent_data);

    rent.save();

    //Increase rented amount of equipment
    if (
      rentData.additionalEquipment &&
      rentData.additionalEquipment.length > 0
    ) {
      rentData.additionalEquipment.forEach(async (element) => {
        const equipment = await Equipment.findById(element);
        equipment.rentedAmount++;
        equipment.save();
      });
    }

    return response.status(201).json({ rent });
  } catch (error) {
    //console.log(error);
    return response.status(500).json({ error: "Something went wrong" });
  }
};

//Get all rents in the system
exports.getRents = async (request, response) => {
  try {
    const rents = await Rent.find()
      .populate("user")
      .populate("vehicle")
      .populate("additionalEquipment");

    rents.reverse();
    return response.status(200).json({ rents });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

//Get all rents of logged in user
exports.getMyRents = async (request, response) => {
  const id = request.user.id;
  try {
    const rents = await Rent.find({ user: id })
      .populate("user")
      .populate("vehicle")
      .populate("additionalEquipment");

    const _rents = [...rents];
    return response.status(200).json({ rents: _rents });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

exports.setRentStatus = async (request, response) => {
  const id = request.params.id;
  const status = request.body.status;

  try {
    const rent = await Rent.findById(id);

    //If rent is not found
    if (!rent) return response.status(404).json({ error: "Rent not found." });

    //If invalid status
    if (status !== "pending" && status !== "collected" && status !== "returned")
      response.status(400).json({ error: "Invalid status." });

    //Set new status and save
    rent.status = status;
    rent.save();

    return response
      .status(200)
      .json({ message: "Successfully changed status" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

exports.updateRentEquipment = async (request, response) => {
  const id = request.params.id;

  try {
    const rent = await Rent.findById(id);

    //If rent is not found
    if (!rent) return response.status(404).json({ error: "Rent not found." });

    //If invalid status
    if (rent.status !== "pending")
      response.status(400).json({ error: "Rent should be pending." });

    const _equipment = request.body.equipment;
    const newTotal = request.body.newTotal;

    const equipment = await Equipment.find({ _id: { $in: _equipment } });
    //console.log(equipment);

    rent.additionalEquipment = equipment;
    rent.total = newTotal;

    rent.save();

    return response.status(200).json({ message: "Successfully updated!" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

// Send email if license is blacklisted
const handleOffences = async (user) => {
  try {
    //const user = await User.findById(id);

    //Check if any offences are there for license number
    const offence = await Offence.findOne({ DLN: user.DLN });

    //If there are no offences return false
    if (!offence) return false;

    //If there are offences

    //Set user as blaclisted
    user.isBlacklisted = true;
    await user.save();

    //Connect to mail account
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.FROM_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    //Generate and send email
    let userImageFilename = user.userImageURL
      ? user.userImageURL.slice(28)
      : null;
    let licenseFilename = user.licenseImageURL
      ? user.licenseImageURL.slice(31)
      : null;

    const data = {
      userImageUrl: user.userImageURL,
      userImageFilename,
      licenseImageUrl: user.licenseImageURL,
      licenseFilename,
      name: `${user.firstName} ${user.lastName}`,
      DLN: offence.DLN,
      offence: offence.offence,
      reportedTime: moment(offence.dateTimeReported)
        .format("h:mm A", {
          timeZone: "Asia/Colombo",
        })
        .toString(),
      reportedDate: moment(offence.dateTimeReported)
        .format("DD/MM/YYYY", {
          timeZone: "Asia/Colombo",
        })
        .toString(),
      incidentDate: moment()
        .format("DD/MM/YYYY", {
          timeZone: "Asia/Colombo",
        })
        .toString(),
      incidentTime: moment()
        .format("h:mm A", {
          timeZone: "Asia/Colombo",
        })
        .toString(),
    };

    const html = generateHtml(data);

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: "Attempted use of blacklisted license",
      text: "A blacklisted license was used to rent a vehicle from our website. Please find the information relating to the incident below",
      html,
      attachments: [
        {
          filename: data.userImageFilename,
          path: data.userImageUrl,
          cid: "user",
        },
        {
          filename: data.licenseFilename,
          path: data.licenseImageUrl,
          cid: "license",
        },
      ],
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return true;
};
