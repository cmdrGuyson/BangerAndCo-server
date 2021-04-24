const bcrypt = require("bcrypt");
const { request, response } = require("express");
const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("../config/env.json");
const { sequelize, User: SqlUser } = require("../models");
const User = require("../mdb_models/user");

const { generateUserDataErrors } = require("../utils/validators");

const {
  uploadLicenseImageMW,
  uploadAlternateIDImageMW,
  uploadUserImageMW,
} = require("../middleware/multer");

const { validateRegister, isOver25 } = require("../utils/validators");

/* REGISTER USER */
exports.signup = async (request, response) => {
  //Create new user object from user request
  const new_user = {
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    NIC: request.body.NIC,
    DLN: request.body.DLN,
    contactNumber: request.body.contactNumber,
    dateOfBirth: request.body.dateOfBirth,
    address: request.body.address,
    role: "user",
  };

  try {
    let errors = await validateRegister(new_user);

    if (Object.keys(errors).length > 0)
      return response.status(400).json({ error: errors });

    //Hash password
    new_user.password = new_user.password
      ? await bcrypt.hash(new_user.password, 6)
      : null;

    //Create new user object in database
    const user = await User.create(new_user);

    await SqlUser.create({
      _id: user._id.toString(),
      NIC: user.NIC,
      address: user.address,
      DLN: user.DLN,
    });

    const email = user.email;

    //Generate JWT
    let token = jwt.sign({ email }, JWT_SECRET, { expiresIn: 2 * 60 * 60 });

    //Send user object as response
    return response.status(201).json({ token });
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

    //If there are any errors return response JSON with errors
    if (Object.keys(errors).length > 0)
      return response.status(400).json({ error: errors });

    const user = await User.findOne({ email: email });

    if (!user)
      return response.status(404).json({ error: { email: "User not found" } });

    //Check password
    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      errors.password = "Password is incorrect";
      return response.status(400).json({ error: errors });
    }

    //Generate JWT
    let token = jwt.sign({ email }, JWT_SECRET, { expiresIn: 2 * 60 * 60 });

    return response.json({ token });
  } catch (error) {
    //console.log(error);
    return response.status(500).json({ error });
  }
};

/* UPLOAD DRIVING LICENSE IMAGE */
exports.uploadLicenseImage = async (request, response) => {
  uploadLicenseImageMW(request, response, async (error) => {
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
        const user = await User.findById(request.user._id).orFail();

        //Create image URL from file name and update object
        user.licenseImageURL = `http://localhost:5000/licenses/${request.file.filename}`;

        //Save edited user object
        user.save();

        return response
          .status(200)
          .json({ message: "Image uploaded successfully" });
      } catch (error) {
        return response.status(500).json({ error });
      }
    }
  });
};

/* UPLOAD ALTERNARE ID IMAGE */
exports.uploadAlternateIDImage = async (request, response) => {
  uploadAlternateIDImageMW(request, response, async (error) => {
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
        const user = await User.findById(request.user._id).orFail();

        //Create image URL from file name and update object
        user.alternateIDImageURL = `http://localhost:5000/alternates/${request.file.filename}`;

        //Save edited user object
        user.save();

        return response
          .status(200)
          .json({ message: "Image uploaded successfully" });
      } catch (error) {
        return response.status(500).json({ error });
      }
    }
  });
};

/* UPLOAD USER IMAGE */
exports.uploadUserImage = async (request, response) => {
  uploadUserImageMW(request, response, async (error) => {
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
        const user = await User.findById(request.user._id).orFail();

        //Create image URL from file name and update object
        user.userImageURL = `http://localhost:5000/users/${request.file.filename}`;

        //Save edited user object
        user.save();

        return response
          .status(200)
          .json({ message: "Image uploaded successfully" });
      } catch (error) {
        return response.status(500).json({ error });
      }
    }
  });
};

/* GET ALL USERS */
exports.getUsers = async (request, response) => {
  try {
    const users = await User.find().select(["-password"]);
    return response.status(200).json({ users });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* CHANGE USER VERIFICATION DATA */
exports.changeUserData = async (request, response) => {
  //use utility function to reduce user data
  const data = request.body;

  //Get errors
  const { valid, errors } = generateUserDataErrors(data);

  //If any errors in user input send error response
  if (!valid) return response.status(400).json(errors);

  try {
    const id = request.params.id;

    let user = await User.findById(id).orFail();

    //Update user details according to type of data passed
    if (data.isBlacklisted || data.isBlacklisted === false)
      user.isBlacklisted = data.isBlacklisted;
    if (data.isVerified || data.isVerified === false)
      user.isVerified = data.isVerified;
    if (data.isPremiumCustomer || data.isPremiumCustomer == false)
      user.isPremiumCustomer = data.isPremiumCustomer;

    user.save();

    return response.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* CHANGE isVerified PROPERTY */
exports.changeIsVerified = async (request, response) => {
  try {
    const id = request.params.id;
    let user = await User.findById(id).orFail();

    user.isVerified = !user.isVerified;

    user.save();

    return response.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* CHANGE isBlacklisted PROPERTY */
exports.changeIsBlacklisted = async (request, response) => {
  try {
    const id = request.params.id;
    let user = await User.findById(id).orFail();

    user.isBlacklisted = !user.isBlacklisted;

    user.save();

    return response.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* CHANGE isPremiumCustomer PROPERTY */
exports.changeIsPremiumCustomer = async (request, response) => {
  try {
    const id = request.params.id;
    let user = await User.findById(id).orFail();

    user.isPremiumCustomer = !user.isPremiumCustomer;

    user.save();

    return response.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    return response.status(500).json({ error });
  }
};

/* GET INFO ON SINGLE USER */
exports.getUser = async (request, response) => {
  const id = request.params.id;

  try {
    let user = await User.findById(id).select(["-password"]);
    if (!user)
      return response
        .status(404)
        .json({ error: { message: "User not found" } });

    //If user calling the request is not an admin and if the data is not the user's data
    if (
      JSON.stringify(user._id) !== JSON.stringify(request.user._id) &&
      request.user.role !== "admin"
    )
      return response.status(403).json({ error: "Unauthoraized" });

    return response.status(200).json(user);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error });
  }
};

/* GET DATA OF LOGGED IN USER */
exports.getLoggedUser = async (request, response) => {
  try {
    //Find user from database
    const user = await User.findById(request.user._id)
      .select(["-password"])
      .orFail();

    return response.status(200).json(user);
  } catch (error) {
    return response.status(500).json({ error });
  }
};
