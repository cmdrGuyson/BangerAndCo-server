const { model, Schema } = require("mongoose");

const vehicleSchema = new Schema(
  {
    type: {
      type: String,
      required: [true, "Must not be empty"],
      enum: [
        "town-car",
        "hatchback",
        "family-saloon",
        "family-estate",
        "van",
        "suv",
        "exotic",
        "sports",
      ],
    },
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    fuelType: {
      type: String,
      required: [true, "Must not be empty"],
      enum: ["petrol", "diesel", "hybrid"],
    },
    transmission: {
      type: String,
      required: [true, "Must not be empty"],
      enum: ["auto", "manual"],
    },
    vehicleNumber: {
      type: String,
      required: [true, "Must not be empty"],
    },
    isAvailable: {
      type: Boolean,
      required: [true, "Must not be empty"],
      default: true,
    },
    rentedBy: {
      type: String,
    },
    imageURL: {
      type: String,
      required: true,
      default: "http://localhost:5000/vehicles/default_car.jpg",
    },
    rent: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Vehicle = model("Vehicle", vehicleSchema);

module.exports = Vehicle;
