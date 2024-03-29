const User = require("../mdb_models/user");
const Vehicle = require("../mdb_models/vehicle");
const Rent = require("../mdb_models/rent");
const moment = require("moment");
const { sequelize, FraudulentUser } = require("../models");

//Used to create error object if invalid data types are sent to update user data
exports.generateUserDataErrors = (data) => {
  let errors = {};

  if (
    data.isBlacklisted &&
    !(data.isBlacklisted === true || data.isBlacklisted === false)
  )
    errors.isBlacklisted = "Invalid data type";
  if (
    data.isVerified &&
    !(data.isVerified === true || data.isVerified === false)
  )
    errors.isVerified = "Invalid data type";
  if (
    data.isPremiumCustomer &&
    !(data.isPremiumCustomer === true || data.isPremiumCustomer === false)
  )
    errors.isPremiumCustomer = "Invalid data type";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

//Used to validate errors on register
exports.validateRegister = async (data) => {
  let errors = {};

  try {
    let user = await User.findOne({ email: data.email });
    if (user) errors.email = "Email already exists";

    user = await User.findOne({ NIC: data.NIC });
    if (user) errors.NIC = "NIC number already exists";

    user = await User.findOne({ DLN: data.DLN });
    if (user) errors.DLN = "Driver's license number already exists";

    user = await User.findOne({ contactNumber: data.contactNumber });
    if (user) errors.contactNumber = "This contact number is already in use";

    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords don't match";

    if (!isOver18(data.dateOfBirth)) errors.dateOfBirth = "You are not over 18";

    return errors;
  } catch (error) {
    return error;
  }
};

//Validate pickup and dropoff times
exports.isTimesValid = (rent_data) => {
  const pickup_time = moment(rent_data.pickupTime, "HH:mm");
  const dropoff_time = moment(rent_data.dropoffTime, "HH:mm");

  const opening_time = moment("07:59", "HH:mm");
  const closing_time = moment("18:01", "HH:mm");

  //Pickup and dropoff times are between working hours
  if (!pickup_time.isBetween(opening_time, closing_time)) return false;
  if (!dropoff_time.isBetween(opening_time, closing_time)) return false;

  //Validate rent duration
  const pickup = moment(
    `${rent_data.pickupDate} ${rent_data.pickupTime}`,
    "YYY-MM-DD HH:mm"
  );
  const dropoff = moment(
    `${rent_data.dropoffDate} ${rent_data.dropoffTime}`,
    "YYY-MM-DD HH:mm"
  );

  const diff = dropoff.diff(pickup, "minutes");

  console.log(diff);

  if (diff < 300) return false;
  if (diff > 20160) return false;

  return true;
};

//Utility function to determine if age is greater than 18
const isOver18 = (birthday_string) => {
  let birthday = new Date(birthday_string);
  let ageDifMs = Date.now() - birthday.getTime();
  let ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) >= 18;
};

//Utility function to determine is age is greater than 25
exports.isOver25 = (birthday_string) => {
  let birthday = new Date(birthday_string);
  let ageDifMs = Date.now() - birthday.getTime();
  let ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) >= 25;
};

exports.getList = async (pickup, dropoff) => {
  const vehicles = await Vehicle.find({ isAvailable: true });

  const unavailableVehicleIds = [];

  const rents = await Rent.find({
    $or: [{ status: "pending" }, { status: "collected" }],
  });

  //If car has previous rents that are pending
  if (rents.length > 0) {
    rents.forEach((rent) => {
      let possibleDropOffDate = new Date(
        moment(rent.rentedFrom).set({ hour: 0, minute: 0, second: 0 })
      );
      let possiblePickUpDate = new Date(
        moment(rent.rentedTo)
          .add(2, "day")
          .set({ hour: 0, minute: 0, second: 0 })
      );
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

/*CHECK IF USER IS A INSUARANCE FRAUDER*/
exports.isUserFraudulent = async (uid) => {
  try {
    const user = await FraudulentUser.findOne({
      where: { _id: uid.toString() },
    });
    if (user) return true;
    return false;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
