const { model, Schema } = require("mongoose");

const equipmentSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Must not be empty"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Must not be empty"],
    },
    rentedAmount: {
      type: Number,
      required: [true, "Must not be empty"],
    },
    availableAmount: {
      type: Number,
      required: [true, "Must not be empty"],
    },
    rent: {
      type: Number,
      required: [true, "Must not be empty"],
    },
  },
  { timestamps: true }
);

const Equipment = model("Equipment", equipmentSchema);

module.exports = Equipment;
