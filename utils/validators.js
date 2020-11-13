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
