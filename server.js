//Configure environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const schedule = require("node-schedule");

const auth = require("./middleware/auth");

//Import user controllers
const {
  signup,
  login,
  uploadLicenseImage,
  uploadAlternateIDImage,
  getUsers,
  changeUserData,
  getUser,
  getLoggedUser,
  changeIsVerified,
  changeIsBlacklisted,
  changeIsPremiumCustomer,
  uploadUserImage,
} = require("./controllers/users");

//Import vehicle controllers
const {
  addVehicle,
  changeRent,
  getAllVehicles,
  getVehicle,
  uploadVehicleImage,
  deleteVehicle,
  getAvailableVehicles,
  getPrices,
} = require("./controllers/vehicles");

//Import equipment controllers
const {
  addEquipment,
  getAllEquipment,
  incrementQuantity,
  decrementQuantity,
  getAvailableEquipment,
} = require("./controllers/equipments");

//Import rent controllers
const {
  rentVehicle,
  getMyRents,
  getRents,
  setRentStatus,
  updateRentEquipment,
} = require("./controllers/rents");

//Import scheduled jobs
const { syncDmvLicenses } = require("./jobs/dmv");

const app = express();

app.use(cors());
app.use(express.json());

/* Log HTTP requests */
app.use(morgan("dev"));

app.use(express.static(__dirname + "/data"));

/* USER ROUTES */
app.post("/signup", signup); //Register to system
app.post("/login", login); //Login to system
app.post("/license-image", auth(), uploadLicenseImage); //Upload licence images
app.post("/alternate-id-image", auth(), uploadAlternateIDImage); //Upload alternative id images
app.post("/user-image", auth(), uploadUserImage); //Upload user image
app.post("/user/:id", auth("admin"), changeUserData); //Change a selected user's data
app.get("/user", auth(), getLoggedUser); //Get information about logged in user
app.get("/users", auth("admin"), getUsers); //Get all users in the system
app.get("/user/:id", auth(), getUser); //Get information about a specific user
app.get("/user/set-verified/:id", auth("admin"), changeIsVerified); //Change isVerified property of selected user
app.get("/user/set-premium/:id", auth("admin"), changeIsPremiumCustomer); //Change isPremium property of selected user
app.get("/user/set-blacklisted/:id", auth("admin"), changeIsBlacklisted); //Change isBlacklisted property of selected user

/* VEHICLE ROUTES */
app.post("/vehicle", auth("admin"), addVehicle); //Add a vehicle to the system
app.post("/change-rent/:id", auth("admin"), changeRent); //Change rent amount of a selected vehicle
app.get("/vehicles", getAllVehicles); //Get all vehicles in the system
app.get("/vehicle/:id", auth(), getVehicle); //Get a single vehicle's information
app.post("/vehicle-image/:id", auth("admin"), uploadVehicleImage); //Upload vehicle's image
app.delete("/vehicle/:id", auth("admin"), deleteVehicle); //Delete vehicle
app.get("/available-vehicles/:pickupDate/:dropoffDate", getAvailableVehicles); //Get all available vehicles in a selected time period
app.get("/prices", getPrices); //Scrape and get referencial pricing

/* EQUIPMENT ROUTES */
app.post("/equipment", auth("admin"), addEquipment); //Add equipment to the system
app.get("/equipment", auth(), getAllEquipment); //Get all equipment in thesystem
app.get(
  "/available-equipment/:pickupDate/:dropoffDate",
  auth(),
  getAvailableEquipment
); //Get available equipment within a selected time period
app.get("/equipment/increment/:id", auth("admin"), incrementQuantity); //Increment equipment count of selected equipment
app.get("/equipment/decrement/:id", auth("admin"), decrementQuantity); //Decrement equipement count of selected equipement

/* RENT ROUTES */
app.post("/rent/:id", auth(), rentVehicle); //Rent a specified vehicle
app.get("/rents", auth("admin"), getRents); //Get all rents within system
app.get("/my-rents", auth(), getMyRents); //Get all rents of logged in user
app.post("/rent-status/:id", auth("admin"), setRentStatus); //Change rent status of given rent
app.post("/update-equipment/:id", auth(), updateRentEquipment); //Update equipment within a rent

/* SCHEDULE JOBS */
const rule = new schedule.RecurrenceRule();
rule.hour = 21;
rule.minute = 28;
rule.second = 00;
rule.tz = process.env.TIME_ZONE;

const job = schedule.scheduleJob(rule, function () {
  syncDmvLicenses();
});

module.exports = http.createServer(app);
