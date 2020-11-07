const isEmpty = (string) => {
  if (!string) return true;
  return string.trim() === "" ? true : false;
};

const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regEx) ? true : false;
};

const isNIC = (NIC) => {
  const regEx = /^\d{9}(v|V)$/;
  return NIC.match(regEx) ? true : false;
};

const isContactNumber = (contact) => {
  const regEx = /^\d{10}$/;
  return contact.match(regEx) ? true : false;
};

//Validate user input of user request when registering user
exports.validateSignupData = (data) => {
  let errors = {};

  //Validate email
  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  //Validate passwords
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";

  //Validate Names
  if (isEmpty(data.firstName)) errors.firstName = "Must not be empty";
  if (isEmpty(data.lastName)) errors.lastName = "Must not be empty";

  //Validate NIC
  if (isEmpty(data.NIC)) {
    errors.NIC = "Must not be empty";
  } else if (!isNIC(data.NIC)) {
    errors.NIC = "Must be a valid NIC address";
  }

  //Validate contact number
  if (isEmpty(data.contactNumber)) {
    errors.contactNumber = "Must not be empty";
  } else if (!isContactNumber(data.contactNumber)) {
    errors.contactNumber = "Must be a valid phone number";
  }

  //Validate DLN
  if (isEmpty(data.DLN)) errors.DLN = "Must not be empty";

  //Validate date of birth
  if (isEmpty(data.dateOfBirth)) errors.dateOfBirth = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

exports.validateLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (isEmpty(data.password)) errors.password = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};
