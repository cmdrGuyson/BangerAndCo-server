const { model, Schema } = require("mongoose");

/*Regular expressions for data*/
const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const NICRegEx = /^\d{9}(v|V)$/;
const contactRegEx = /^\d{10}$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Must not be empty"],
      validate: {
        validator: (email) => emailRegEx.test(email),
        message: "Not a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Must not be empty"],
    },
    role: {
      type: String,
      required: [true, "Must not be empty"],
      enum: ["user", "admin"],
    },
    firstName: {
      type: String,
      required: [true, "Must not be empty"],
    },
    lastName: {
      type: String,
      required: [true, "Must not be empty"],
    },
    dateOfBirth: {
      type: String,
      required: [true, "Must not be empty"],
    },
    NIC: {
      type: String,
      unique: true,
      required: [true, "Must not be empty"],
      validate: {
        validator: (NIC) => NICRegEx.test(NIC),
        message: "Not a valid NIC",
      },
    },
    DLN: {
      type: String,
      unique: true,
      required: [true, "Must not be empty"],
    },
    contactNumber: {
      type: String,
      unique: true,
      required: [true, "Must not be empty"],
      validate: {
        validator: (contactNumber) => contactRegEx.test(contactNumber),
        message: "Not a valid contact number",
      },
    },
    isBlacklisted: {
      type: Boolean,
      required: true,
    },
    isPremiumCustomer: {
      type: Boolean,
      required: true,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    licenseImageURL: {
      type: String,
    },
    alternateIdentificationImageURL: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
