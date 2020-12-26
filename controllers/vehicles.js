const { request, response } = require("express");
const moment = require("moment");
const Vehicle = require("../models/vehicle");
const { uploadVehicleImageMW } = require("../middleware/multer");
const { getList } = require("../utils/validators");

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
    //find vehicle through vehicle number
    const _vehicle = await Vehicle.findOne({
      vehicleNumber: new_vehicle.vehicleNumber,
    });

    //if vehicle number exists
    if (_vehicle)
      return response
        .status(400)
        .json({ error: { vehicleNumber: "Vehicle already exists" } });

    const vehicle = await Vehicle.create(new_vehicle);
    return response.status(200).json(vehicle);
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* CHANGE RENT VALUE OF VEHICLE */
exports.changeRent = async (request, response) => {
  let rent = request.body.rent;
  let id = request.params.id;

  //if user input is not a number
  if (!rent || typeof rent !== "number")
    return response.status(400).json({ error: { message: "Invalid input" } });

  try {
    let vehicle = await Vehicle.findById(id).orFail();
    vehicle.rent = rent;
    vehicle.save();
    return response.status(200).json({ message: "Rent changed successfully" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* GET INFORMATION ON ALL VEHICLES */
exports.getAllVehicles = async (request, response) => {
  try {
    const vehicles = await Vehicle.find();
    return response.status(200).json({ vehicles });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* GET LIST OF AVAILABLE RENTS GIVEN DROP OFF AND PICKUP DATE */
exports.getAvailableVehicles = async (request, response) => {
  //Get user input
  const userInput = {
    pickupDate: request.params.pickupDate,
    dropoffDate: request.params.dropoffDate,
  };

  //Pickup and Dropoff as Date objects
  const pickup = moment(userInput.pickupDate, "YYYY-MM-DD")
    .add(1, "day")
    .format();

  const dropoff = moment(userInput.dropoffDate, "YYYY-MM-DD")
    .add(1, "day")
    .format();

  let vehicles = await getList(new Date(pickup), new Date(dropoff));

  return response.status(200).json({ vehicles });
};

/* GET INFORMATION ON SINGLE VEHICLE */
exports.getVehicle = async (request, response) => {
  const id = request.params.id;
  try {
    let vehicle = await Vehicle.findById(id);

    return response.status(200).json(vehicle);
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* DELETE A VEHICLE */
exports.deleteVehicle = async (request, response) => {
  const id = request.params.id;
  try {
    await Vehicle.findByIdAndDelete(id);

    return response.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* UPLOAD VEHICLE IMAGE */
exports.uploadVehicleImage = async (request, response) => {
  uploadVehicleImageMW(request, response, async (error) => {
    if (error) {
      //instanceof multer.MulterError

      if (error.code == "LIMIT_FILE_SIZE") {
        error.message = "File Size is too large.";
      }
      return response.status(500).json({ error });
    } else {
      if (!request.file) {
        return response
          .status(500)
          .json({ error: { message: "File not found" } });
      }

      try {
        //Find user from database
        const vehicle = await Vehicle.findById(request.params.id).orFail();

        //Create image URL from file name and update object
        vehicle.imageURL = `http://localhost:5000/vehicles/${request.file.filename}`;

        //Save edited user object
        vehicle.save();

        return response
          .status(200)
          .json({ message: "Image uploaded successfully" });
      } catch (error) {
        return response.status(500).json({ error });
      }
    }
  });
};
