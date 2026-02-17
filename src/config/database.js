const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://debabrataroy1998_db_user:Hanuman221998@cluster0.dc6diaw.mongodb.net/devTinder",
  );
};

module.exports = connectDB;
