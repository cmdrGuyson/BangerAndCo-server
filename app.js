const server = require("./server");
const mongoose = require("mongoose");
const { sequelize } = require("./models");

const port = process.env.PORT || 5000;
const URL = process.env.DATABASE_URL;

server.listen(port, () => {
  console.log("Server online at http://localhost:5000");
  /* Connect to database */
  mongoose
    .connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("Connected to primary database!");
    })
    .then(() => {
      sequelize.authenticate();
    })
    .then(() => {
      console.log("Connected to secondary database");
    })
    .catch((error) => {
      console.log(error);
    });
});
