const bcrypt = require("bcrypt");
const { request, response } = require("express");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/env.json");
const User = require("../models/user");

const {
  validateSignupData,
  validateLoginData,
} = require("../utils/validators");

/* REGISTER USER */
exports.signup = async (request, response) => {
  //Create new user object from user request
  const newUser = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    password: request.body.password,
    NIC: request.body.NIC,
    DLN: request.body.DLN,
    contactNumber: request.body.contactNumber,
    dateOfBirth: request.body.dateOfBirth,
    isBlacklisted: false,
    isPremiumCustomer: false,
    isVerified: false,
    role: "user",
  };

  console.log(request);

  try {
    //Hash password
    newUser.password = await bcrypt.hash(newUser.password, 6);

    //Create new user object in database
    const user = await User.create(newUser);

    //Send user object as response
    return response.json(user);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error });
  }
};

/* USER LOGIN */
exports.login = async (request, response) => {
  const { email, password } = request.body;
  let errors = {};
  try {
    if (!email || email.trim() === "") errors.email = "Email must not be empty";
    if (!password || password === "")
      errors.password = "Password must not be empty";

    if (Object.keys(errors).length > 0)
      return response.status(400).json({ error: errors });

    const user = await User.findOne({ email: email });

    if (!user) return response.status(404).json({ error: "User not found" });

    //Check password
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      errors.password = "password is incorrect";
      response.status(400).json({ error: errors });
    }

    //Generate JWT
    let token = jwt.sign({ email }, JWT_SECRET, { expiresIn: 60 * 60 });

    return response.json({ token });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error });
  }
};

/* UPLOAD DRIVING LICENSE IMAGE */
exports.uploadLicenseImage = (request, response) => {
  const fileName = request.file.filename;

  return response.json({ filename });
};
