const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const mongoUri = process.env.MONGO_URI;

const connectDB = async () => {
  await mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("db connected");
    })
    .catch(() => {
      console.log("failed");
    });
};

module.exports = connectDB;
