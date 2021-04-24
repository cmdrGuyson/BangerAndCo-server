const { model, Schema } = require("mongoose");

const offenceSchema = new Schema(
  {
    DLN: {
      type: String,
      required: [true, "Must not be empty"],
    },
    offence: {
      type: String,
      required: [true, "Must not be empty"],
    },
    dateTimeReported: {
      type: Date,
      required: [true, "Must not be empty"],
    },
  },
  { timestamps: true }
);

const Offence = model("Offence", offenceSchema);

module.exports = Offence;
