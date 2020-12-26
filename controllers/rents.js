const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Rent = require("../models/rent");
const { request, response } = require("express");
const moment = require("moment");

const { isOver25, getList } = require("../utils/validators");
const Equipment = require("../models/equipment");

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

  console.log(request.body);

  try {
    const vehicle = await Vehicle.findById(vehicleID);
    const user = await User.findById(userID);

    //Check if vehicle exists
    if (!vehicle)
      return response.status(404).json({ error: "Vehicle not found" });

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

    //Total of vehicle
    if (minutesRented <= 300) {
      total = vehicle.rent / 2;
    } else if (minutesRented <= 1440) {
      total = vehicle.rent;
    } else {
      let daysRented = Math.floor(minutesRented / 60 / 24);
      let remainingMins = minutesRented - daysRented * 60 * 24;
      if (remainingMins === 0) total = vehicle.rent * daysRented;
      else if (remainingMins <= 300)
        total = vehicle.rent * daysRented + vehicle.rent / 2;
      else total = (daysRented + 1) * vehicle.rent;
    }

    //Total of equipment
    if (
      rentData.additionalEquipment &&
      rentData.additionalEquipment.length > 0
    ) {
      const equipments = await Equipment.find()
        .where("_id")
        .in(rentData.additionalEquipment)
        .exec();

      equipments.forEach((equipment) => {
        let rentAmount = 0;
        let rent = equipment.rent;
        if (minutesRented <= 300) {
          rentAmount = rent / 2;
        } else if (minutesRented <= 1440) {
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
        console.log(rentAmount, total);
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
      addtionalEquipment: rentData.additionalEquipment,
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

    return response.status(200).json({ rent });
  } catch (error) {
    //console.log(error);
    return response.status(500).json({ error: "Something went wrong" });
  }
};
