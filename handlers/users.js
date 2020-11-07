const { request } = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");

const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validators");

//Register user
exports.signup = async (request, response) => {
  //Create new user object from user request
  const newUser = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    NIC: request.body.NIC,
    DLN: request.body.DLN,
    contactNumber: request.body.contactNumber,
    dateOfBirth: request.body.dateOfBirth,
    isBlacklisted: false,
    isPremiumCustomer: false,
    role: "user",
  };

  //Validate signup data using utilities
  //const { valid, errors } = validateSignupData(newUser);

  //Hash password
  newUser.password = await bcrypt.hash(newUser.password, 6);

  //If user input is invalid send error response
  //if (!valid) return response.status(400).json(errors);

  try {
    const user = await User.create(newUser);

    //Send user object as response
    return response.json(user);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: error });
  }
};

//User login
