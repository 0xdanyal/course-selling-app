const mongoose = require("mongoose");
const connect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/courseApp");
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

module.exports = connect;