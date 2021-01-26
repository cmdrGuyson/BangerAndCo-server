const request = require("supertest");
const app = require("../server");
const mongoose = require("mongoose");
const User = require("../models/user");
const Vehicle = require("../models/vehicle");
const bcrypt = require("bcrypt");

const URL = "mongodb://localhost:27017/BangerAndCoTest";

let token, id, vehicle_id;

beforeAll((done) => {
  mongoose
    .connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      return bcrypt.hash("password", 6);
    })
    .then((password) => {
      User.create({
        firstName: "Guyson",
        lastName: "Kuruppu",
        email: "guyson@email.com",
        password,
        NIC: "983647564V",
        DLN: "B434243275",
        dateOfBirth: "11/09/1998",
        contactNumber: "0717463849",
        role: "admin",
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
      DLN: "B43243275",
      confirmPassword: "password",
      dateOfBirth: "11/09/1998",
      contactNumber: "0718475638",
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
      DLN: "B43243275",
      confirmPassword: "password",
      dateOfBirth: "11/09/1998",
      contactNumber: "0718475638",
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
      .get(`/users`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("users");
    expect(response.body.users.length).toBe(2);
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
    expect(response.body.vehicles.length).toBe(2);
  });

  it("Delete vehicle", async () => {
    const response = await request(app)
      .delete(`/vehicle/${vehicle_id}`)
      .set("Authorization", "Bearer " + token);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty("message");
  });
});

afterAll(async (done) => {
  // Clearing test database and closing connection
  try {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    done();
  } catch (error) {
    console.log(error);
    done();
  }
  app.close();
});
