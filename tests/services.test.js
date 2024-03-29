const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../mdb_models/user");
const Vehicle = require("../mdb_models/vehicle");
const Offence = require("../mdb_models/offence");
const bcrypt = require("bcrypt");
//const mysql = require("mysql");
const { sequelize, User: SqlUser } = require("../models");

const URL = "mongodb://localhost:27017/BangerAndCoTest";

let fraud_email = "fraud@email.com";
let offender_email = "offender@email.com";
let fraud_nic = "987776464V";
let offender_nic = "987776999V";
let fraud_dln = "B54545454";
let offender_dln = "B434343999";
let fraud_id, offender_id;
let address = "16B/3, Abstern Avn";

let token, id, vehicle_id, rentable_vehicle_id, rent_id, equipment_id, password;

beforeAll((done) => {
  //Create test database and add users, vehicles
  mongoose
    .connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      return bcrypt.hash("password", 6);
    })
    .then((pass) => {
      password = pass;
      User.create({
        firstName: "Guyson",
        lastName: "Kuruppu",
        email: "guyson@email.com",
        password,
        NIC: "983647564V",
        DLN: "B434343275",
        dateOfBirth: "11/09/1998",
        contactNumber: "0717463849",
        role: "admin",
        address,
      });
    })
    .then(() => {
      //CREATE FRAUD USER
      return User.create({
        firstName: "Fraud",
        lastName: "User",
        email: fraud_email,
        password,
        NIC: fraud_nic,
        DLN: fraud_dln,
        dateOfBirth: "11/09/1998",
        contactNumber: "0776766885",
        role: "user",
        address,
        isVerified: true,
      });
    })
    .then((user) => {
      fraud_id = user._id;
    })
    .then(() => {
      //CREATE OFFENDER USER
      return User.create({
        firstName: "Offender",
        lastName: "User",
        email: offender_email,
        password,
        NIC: offender_nic,
        DLN: offender_dln,
        dateOfBirth: "11/09/1998",
        contactNumber: "0776766995",
        role: "user",
        address,
        isVerified: true,
      });
    })
    .then((user) => {
      offender_id = user._id;
    })
    .then(() => {
      Offence.create({
        dateTimeReported: "2021-03-17T12:00:00.000+00:00",
        DLN: offender_dln,
        offence: "Speeding",
      });
    })
    .then(() => {
      Vehicle.create({
        type: "suv",
        brand: "Toyota",
        model: "Corolla",
        fuelType: "petrol",
        transmission: "auto",
        vehicleNumber: "CAR-8764",
        rent: 40,
      });
    })
    .then(() => {
      return Vehicle.create({
        type: "suv",
        brand: "Toyota",
        model: "Corolla",
        fuelType: "petrol",
        transmission: "auto",
        vehicleNumber: "CAR-8233",
        rent: 40,
      });
    })
    .then((result) => {
      rentable_vehicle_id = result._id;
    })
    .then(() => {
      SqlUser.create({
        _id: fraud_id.toString(),
        NIC: fraud_nic,
        address,
        DLN: fraud_dln,
      });
    })
    .then(() => {
      SqlUser.create({
        _id: offender_id.toString(),
        NIC: offender_nic,
        address,
        DLN: offender_dln,
      });
    })
    .catch((error) => {
      console.log(error);
    });

  done();
});

describe("User Endpoints", () => {
  it("Register", async () => {
    const response = await request(app).post("/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@email.com",
      password: "password",
      NIC: "987469377V",
      DLN: "B43283275",
      confirmPassword: "password",
      dateOfBirth: "11/09/1998",
      contactNumber: "0718475638",
      address: "647/d, Root road",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("token");
  });

  it("Register with existing email", async () => {
    const response = await request(app).post("/signup").send({
      firstName: "John",
      lastName: "Doe",
      email: "john@email.com",
      password: "password",
      NIC: "987469377V",
      DLN: "B43293275",
      confirmPassword: "password",
      dateOfBirth: "11/09/1998",
      contactNumber: "0718475638",
      address: "643/d, Root road",
    });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Login", async () => {
    const response = await request(app).post("/login").send({
      email: "guyson@email.com",
      password: "password",
    });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("token");
    token = response.body.token;
  });

  it("Login with wrong email", async () => {
    const response = await request(app).post("/login").send({
      email: "jason@email.com",
      password: "password",
    });
    expect(response.statusCode).toEqual(404);
    expect(response.body).toHaveProperty("error");
  });

  it("Login with wrong password", async () => {
    const response = await request(app).post("/login").send({
      email: "john@email.com",
      password: "pass",
    });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Access unauthorized route", async () => {
    const response = await request(app).get(`/user/${id}`);
    expect(response.statusCode).toEqual(403);
    expect(response.body).toHaveProperty("error");
  });

  it("Get logged user details", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("_id");
    id = response.body._id;
  });

  it("Get specified user's details", async () => {
    const response = await request(app)
      .get(`/user/${id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("_id");
  });

  it("Get all users", async () => {
    const response = await request(app)
      .get("/users/")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("users");
    expect(response.body.users.length).toBe(4);
  });

  it("Change user status", async () => {
    const response = await request(app)
      .get(`/user/set-verified/${id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Data updated successfully");
  });
});

describe("Vehicle Endpoints", () => {
  it("Add vehicle", async () => {
    const response = await request(app)
      .post("/vehicle")
      .set("Authorization", "Bearer " + token)
      .send({
        type: "suv",
        brand: "KIA",
        model: "Sorrento",
        fuelType: "diesel",
        transmission: "auto",
        vehicleNumber: "KX-8764",
        rent: 60.5,
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("_id");
    vehicle_id = response.body._id;
  });

  it("Add vehicle with existing vehicle number", async () => {
    const response = await request(app)
      .post("/vehicle")
      .set("Authorization", "Bearer " + token)
      .send({
        type: "suv",
        brand: "KIA",
        model: "Sorrento",
        fuelType: "diesel",
        transmission: "auto",
        vehicleNumber: "KX-8764",
        rent: 60.5,
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body).toHaveProperty("error");
  });

  it("Get all available vehicles", async () => {
    const response = await request(app).get(
      "/available-vehicles/2021-01-01/2021-01-05"
    );
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("vehicles");
    expect(response.body.vehicles.length).toBe(3);
  });

  it("Delete vehicle", async () => {
    const response = await request(app)
      .delete(`/vehicle/${vehicle_id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("message");
  });
});

describe("Rent Endpoints", () => {
  it("Rent Vehicle", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-02-28",
        dropoffDate: "2021-03-03",
        pickupTime: "15:00",
        dropoffTime: "16:00",
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body.rent.total).toEqual(140);
    rent_id = response.body.rent._id;
  });

  it("Attempt to rent rented vehicle", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-02-28",
        dropoffDate: "2021-03-03",
        pickupTime: "15:00",
        dropoffTime: "16:00",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Vehicle unavailable");
  });

  it("Attempt to rent vehicle with invalid pickup time", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-03-04",
        dropoffDate: "2021-03-05",
        pickupTime: "07:00",
        dropoffTime: "15:00",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Invalid pickup and dropoff times");
  });

  it("Attempt to rent vehicle with invalid dropoff time", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-03-04",
        dropoffDate: "2021-03-05",
        pickupTime: "09:00",
        dropoffTime: "20:00",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Invalid pickup and dropoff times");
  });

  it("Attempt to rent vehicle with invalid rent duration (Higher)", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-03-04",
        dropoffDate: "2021-04-05",
        pickupTime: "09:00",
        dropoffTime: "15:00",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Invalid pickup and dropoff times");
  });

  it("Attempt to rent vehicle with invalid rent duration (Lower)", async () => {
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        pickupDate: "2021-03-04",
        dropoffDate: "2021-04-04",
        pickupTime: "09:00",
        dropoffTime: "09:30",
      });
    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("Invalid pickup and dropoff times");
  });

  it("Change rent status", async () => {
    const response = await request(app)
      .post(`/rent-status/${rent_id}`)
      .set("Authorization", "Bearer " + token)
      .send({
        status: "returned",
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body.message).toEqual("Successfully changed status");
  });

  it("Get all rents", async () => {
    const response = await request(app)
      .get("/rents")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.rents.length).toBe(1);
  });

  it("Get my rents", async () => {
    const response = await request(app)
      .get("/my-rents")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.rents.length).toBe(1);
  });
});

describe("Equipment Endpoints", () => {
  it("Add Equipment", async () => {
    const response = await request(app)
      .post("/equipment")
      .set("Authorization", "Bearer " + token)
      .send({
        name: "Wine Chiller",
        rent: 10,
      });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty("_id");
    equipment_id = response.body._id;
  });

  it("Increment equipment count", async () => {
    const response = await request(app)
      .get(`/equipment/increment/${equipment_id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.amount).toEqual(2);
  });

  it("Decrement equipment count", async () => {
    const response = await request(app)
      .get(`/equipment/decrement/${equipment_id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.amount).toEqual(1);
  });

  it("Get all available equipment", async () => {
    const response = await request(app)
      .get("/available-equipment/2021-01-01/2021-01-05")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.availableEquipment.length).toBe(1);
  });
});

describe("Evaluate Integrations", () => {
  let offender_token, fraud_token;

  it("Block rent attempt by offender", async () => {
    const _response = await request(app).post("/login").send({
      email: offender_email,
      password: "password",
    });
    expect(_response.statusCode).toEqual(200);
    expect(_response.body).toHaveProperty("token");
    offender_token = _response.body.token;

    //Try to rent vehicle
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + offender_token)
      .send({
        pickupDate: "2021-05-28",
        dropoffDate: "2021-05-30",
        pickupTime: "15:00",
        dropoffTime: "16:00",
      });
    console.log(response.body);
    expect(response.statusCode).toEqual(403);
    expect(response.body.error).toEqual("Blacklisted by dmv");
  });

  it("Offender is blacklisted after failed rent attempt by offender", async () => {
    const response = await request(app)
      .get("/user")
      .set("Authorization", "Bearer " + offender_token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.isBlacklisted).toEqual(true);
  });

  it("Rent has not been made after failed rent attempt by offender", async () => {
    const response = await request(app)
      .get("/my-rents")
      .set("Authorization", "Bearer " + offender_token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.rents.length).toBe(0);
  });

  it("Block rent attempt by fraudant user", async () => {
    const _response = await request(app).post("/login").send({
      email: fraud_email,
      password: "password",
    });
    expect(_response.statusCode).toEqual(200);
    expect(_response.body).toHaveProperty("token");
    fraud_token = _response.body.token;

    //Try to rent vehicle
    const response = await request(app)
      .post(`/rent/${rentable_vehicle_id}`)
      .set("Authorization", "Bearer " + fraud_token)
      .send({
        pickupDate: "2021-05-28",
        dropoffDate: "2021-05-30",
        pickupTime: "15:00",
        dropoffTime: "16:00",
      });
    console.log(response.body);
    expect(response.statusCode).toEqual(403);
    expect(response.body.error).toEqual("Insurance fraud");
  });

  it("Rent has not been made after failed rent attempt by frauder", async () => {
    const response = await request(app)
      .get("/my-rents")
      .set("Authorization", "Bearer " + fraud_token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.rents.length).toBe(0);
  });

  it("Scrape referential pricing", async () => {
    const response = await request(app)
      .get("/prices")
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body.prices.length).toBeGreaterThan(0);
  });
});

afterAll(async (done) => {
  // Clearing test database and closing connection
  try {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();

    await SqlUser.destroy({
      where: { NIC: [offender_nic, fraud_nic, "987469377V"] },
    });

    done();
  } catch (error) {
    console.log(error);
    done();
  }

  app.close();
});
