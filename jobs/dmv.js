const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const Offence = require("../models/offence");

exports.syncDmvLicenses = async () => {
  console.log("---SYNCING BLACKLISTED LICENSES---");

  //Clear collection
  await Offence.deleteMany();

  fs.createReadStream("./data/dmv.csv")
    .pipe(csv())
    .on("data", async (row) => {
      try {
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
      } catch (error) {
        console.log(error);
      }
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
};
