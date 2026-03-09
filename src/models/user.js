const mongoose = require("mongoose");
var validator = require("validator");
const jwt = require("jsonwebtoken");

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
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is incorrect status type`,
      },
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Gender data is not valid: " + value);
      //   }
      // },
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

userSchema.methods.getJWT = function () {
  const user = this;

  const token = jwt.sign({ _id: user._id }, "DevPassword@secrateKey", {
    expiresIn: "1d",
  });

  return token;
};

// userSchema.methods.validatePassword = async function (passwordInput) {
//   const user = this;
//   const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
//   return isPasswordValid;
// };

module.exports = mongoose.model("User", userSchema);
