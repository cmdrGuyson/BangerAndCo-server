const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const Rent = require("../models/rent");
const { request, response } = require("express");
const moment = require("moment");

const { isOver25 } = require("../utils/validators");

exports.getList = async (pickup, dropoff) => {
  const vehicles = await Vehicle.find();

  const unavailableVehicleIds = [];

  const rents = await Rent.find({
    $or: [{ status: "pending" }, { status: "collected" }],
  });

  //If car has previous rents that are pending
  if (rents.length > 0) {
    rents.forEach((rent) => {
      let possibleDropOffDate = new Date(
        moment(rent.rentedFrom).subtract(1, "day")
      );
      let possiblePickUpDate = new Date(moment(rent.rentedTo).add(1, "day"));
      if (dropoff > possibleDropOffDate && pickup < possiblePickUpDate) {
        unavailableVehicleIds.push(rent.vehicle._id.toString());
      }
    });
  }

  //Create list of available vehicles
  let availableVehicles = vehicles.filter((vehicle) => {
    return !unavailableVehicleIds.includes(vehicle._id.toString());
  });

  return availableVehicles;
};

exports.rentVehicle = async (request, response) => {
  const vehicleID = request.params.id;
  const userID = request.user.id;

  //Get user input
  const rentData = {
    pickupDate: request.body.pickupDate,
    pickupTime: request.body.pickupTime,
    dropoffDate: request.body.dropoffDate,
    dropoffTime: request.body.dropoffTime,
    addtionalEquipment: request.body.addtionalEquipment,
  };

  try {
    const vehicle = await Vehicle.findById(vehicleID);
    const user = await User.findById(userID);

    //Check if vehicle exists
    if (!vehicle)
      return response
        .status(404)
        .json({ error: { message: "Vehicle not found" } });

    //Check if user is not blacklisted and is verified
    if (user.isBlacklisted)
      response.status(403).json({ message: "You are blacklisted" });

    if (!user.isVerified)
      response.status(403).json({ message: "You are not verified" });

    //Validate user input

    //Pickup and Dropoff as Date objects
    const pickup = moment(
      `${rentData.pickupDate} ${rentData.pickupTime}`,
      "DD/MM/YYYY HH:mm"
    ).format();

    const dropoff = moment(
      `${rentData.dropoffDate} ${rentData.dropoffTime}`,
      "DD/MM/YYYY HH:mm"
    ).format();

    //Check if vehicle is rentable
    let availableVehicles = await getList(new Date(pickup), new Date(dropoff));
    availableVehicles.forEach((vehicle) => {
      if (vehicle._id.toString() === vehicleID)
        return response.status(400).json("Vehicle unavailable");
    });

    //Check if vehicle can be insured for user
    const isInsured = isOver25(user.dateOfBirth);

    //Create rent object and save
    const rent_data = {
      vehicle,
      user,
      rentedFrom: pickup,
      rentedTo: dropoff,
      rent: vehicle.rent,
      status: "pending",
      isInsured,
    };

    const rent = await Rent.create(rent_data);

    rent.save();

    return response.status(200).json({ rent });
  } catch (error) {
    return response.status(500).json({ error });
  }
};
