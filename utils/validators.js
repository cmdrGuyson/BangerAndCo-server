const User = require("../models/user");

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

    if (data.password !== data.confirmPassword)
      errors.confirmPassword = "Passwords don't match";

    if (!isOver18(data.dateOfBirth)) errors.dateOfBirth = "You are not over 18";

    return errors;
  } catch (error) {
    return error;
  }
};

//Utility function to determine is age is greater than 18
const isOver18 = (birthday_string) => {
  let birthday = new Date(birthday_string);
  let ageDifMs = Date.now() - birthday.getTime();
  let ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) > 18;
};

//Utility function to determine is age is greater than 25
exports.isOver25 = (birthday_string) => {
  let birthday = new Date(birthday_string);
  let ageDifMs = Date.now() - birthday.getTime();
  let ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970) > 25;
};
