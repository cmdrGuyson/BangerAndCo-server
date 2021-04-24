const { model, Schema } = require("mongoose");

const rentSchema = new Schema(
  {
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Must not be empty"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Must not be empty"],
    },
    rentedFrom: {
      type: Date,
      required: [true, "Must not be empty"],
    },
    rentedTo: {
      type: Date,
      required: [true, "Must not be empty"],
    },
    additionalEquipment: [{ type: Schema.Types.ObjectId, ref: "Equipment" }],
    total: {
      type: Number,
      required: [true, "Must not be empty"],
    },
    status: {
      type: String,
      required: [true, "Must not be empty"],
      enum: ["pending", "collected", "returned"],
    },
    isInsured: {
      type: Boolean,
      required: [true, "Must not be empty"],
    },
  },
  { timestamps: true }
);

const Rent = model("Rent", rentSchema);

module.exports = Rent;
