const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const Offence = require("../mdb_models/offence");
const User = require("../mdb_models/user");
const Rent = require("../mdb_models/rent");
const { forEach } = require("p-iteration");
const getCSV = require("get-csv");

//Sync offence table with CSV provided by DMV
exports.syncDmvLicenses = async () => {
  console.log("---SYNCING BLACKLISTED LICENSES---");

  try {
    //Clear collection
    await Offence.deleteMany();

    //Get data rows from csv as json
    let rows = await getCSV("http://localhost:5000/dmv.csv");

    await forEach(rows, async (row) => {
      //Convert date and time to date/time format
      const _dateTimeReported = moment(
        `${row.date} ${row.time}`,
        "DD/MM/YYYY HH:mm"
      );

      const dateTimeReported = _dateTimeReported.format();

      let data = {
        dateTimeReported,
        DLN: row.licenseNumber,
        offence: row.offence,
      };

      //Save offence
      let result = await Offence.create(data);

      console.log(`[INFO] Saved entry ${result.DLN}`);
    });
    console.log("CSV file successfully processed");
  } catch (error) {
    console.log(error);
  }
};

//Check if there are any unclaimed rents and blacklist users failed to pickup rented vehicles
exports.syncUnclaimedRents = async () => {
  try {
    console.log("---SYNCING UNCLAIMED RENTS---");

    //Get all pending rents
    const rents = await Rent.find({ status: "pending" }).populate("user");

    await forEach(rents, async (rent) => {
      const today = moment();
      const pickup = moment(rent.rentedFrom);

      //If there are any unclaimed pickups for today
      if (pickup.isSameOrBefore(today, "day")) {
        //Set rent status as returned
        rent.status = "returned";
        await rent.save();

        //Blacklist user
        const user = await User.findById(rent.user._id).orFail();
        user.isBlacklisted = true;
        await user.save();

        console.log(
          `[INFO] Failed to pickup rent: ${rent._id}. User: ${rent.user._id} blacklisted.`
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
};
