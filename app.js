const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname + "/data"));

/* Log HTTP requests */
app.use(morgan("dev"));

const { uploadLicenseImageMW } = require("./middleware/imageUpload");
const { signup, login, uploadLicenseImage } = require("./controllers/users");

/* USER ROUTES */
app.post("/signup", signup);
app.post("/login", login);
app.post("/licenseImage", uploadLicenseImageMW, uploadLicenseImage);

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
