const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");

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
} = require("./controllers/vehicles");

//Import equipment controllers
const {
  addEquipment,
  getAllEquipment,
  incrementQuantity,
  decrementQuantity,
} = require("./controllers/equipments");

//Import rent controllers
const { rentVehicle } = require("./controllers/rents");

const app = express();

app.use(cors());
app.use(express.json());

/* Log HTTP requests */
app.use(morgan("dev"));

app.use(express.static(__dirname + "/data"));

/* USER ROUTES */
app.post("/signup", signup);
app.post("/login", login);
app.post("/license-image", auth(), uploadLicenseImage);
app.post("/alternate-id-image", auth(), uploadAlternateIDImage);
app.post("/user/:id", auth("admin"), changeUserData);
app.get("/user", auth(), getLoggedUser);
app.get("/users", auth("admin"), getUsers);
app.get("/user/:id", auth(), getUser);
app.get("/user/set-verified/:id", auth("admin"), changeIsVerified);
app.get("/user/set-premium/:id", auth("admin"), changeIsPremiumCustomer);
app.get("/user/set-blacklisted/:id", auth("admin"), changeIsBlacklisted);

/* VEHICLE ROUTES */
app.post("/vehicle", auth("admin"), addVehicle);
app.post("/change-rent/:id", auth("admin"), changeRent);
app.get("/vehicles", getAllVehicles);
app.get("/vehicle/:id", auth(), getVehicle);
app.post("/vehicle-image/:id", auth("admin"), uploadVehicleImage);
app.delete("/vehicle/:id", auth("admin"), deleteVehicle);
app.get("/available-vehicles/:pickupDate/:dropoffDate", getAvailableVehicles);

/* EQUIPMENT ROUTES */
app.post("/equipment", auth("admin"), addEquipment);
app.get("/equipment", auth(), getAllEquipment);
app.get("/equipment/increment/:id", auth("admin"), incrementQuantity);
app.get("/equipment/decrement/:id", auth("admin"), decrementQuantity);

/* RENT ROUTES */
app.post("/rent/:id", auth(), rentVehicle);

const port = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log("Server online at http://localhost:5000");
  /* Connect to database */
  mongoose
    .connect("mongodb://localhost:27017/BangerAndCo", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("Connected to database!");
    })
    .catch((error) => {
      console.log(error);
    });
});
