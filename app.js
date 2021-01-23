const server = require("./server");
const mongoose = require("mongoose");

const port = process.env.PORT || 5000;
const URL = "mongodb://localhost:27017/BangerAndCo";

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
      console.log("Connected to database!");
    })
    .catch((error) => {
      console.log(error);
    });
});
