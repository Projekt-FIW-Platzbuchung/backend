require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const mongoose = require("mongoose");
const { enrichSeatsWithBookingInformation } = require("./routes");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});