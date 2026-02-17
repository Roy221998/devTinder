const mongoose = require("mongoose");
var validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 4,
      maxLength: 20,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 20,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true, // DB-level uniqueness
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // 🔐 hide password in queries
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender data is not valid: " + value);
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://gravatar.com/avatar/4e53088ff1e57597e4f0f211b6c51fae?s=400&d=robohash&r=x",
      validate: {
        validator: validator.isURL,
        message: "Invalid photo URL",
      },
    },
    about: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Maximum 5 skills allowed",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
