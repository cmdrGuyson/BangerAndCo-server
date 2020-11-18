const { request, response } = require("express");
const Vehicle = require("../models/vehicle");

exports.addVehicle = async (request, response) => {
  //Create new vehicle object from request data
  let new_vehicle = {
    type: request.body.type,
    fuelType: request.body.fuelType,
    transmission: request.body.transmission,
    vehicleNumber: request.body.vehicleNumber,
    rent: request.body.rent,
    model: request.body.model,
    brand: request.body.brand,
  };

  try {
    const vehicle = await Vehicle.create(new_vehicle);
    return response.status(200).json(vehicle);
  } catch (error) {
    return response.status(500).json({ error });
  }
};

exports.changeRent = async (request, response) => {
  let rent = request.body.rent;
  let id = request.params.id;

  if (!rent || typeof rent !== "number")
    return response.status(400).json({ error: { message: "Invalid input" } });

  try {
    let vehicle = await Vehicle.findById(id).orFail();
    vehicle.rent = rent;
    vehicle.save();
    return response.status(200).json({ message: "Rent changed successfully" });
  } catch (error) {
    return response.status(500).error({ error });
  }
};
