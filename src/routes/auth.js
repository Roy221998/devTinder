const express = require("express");
const { sanitizeInput, validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * SIGNUP USER
 */
authRouter.post("/signup", async (req, res) => {
  try {
    // Sanitize inputs
    req.body.firstName = sanitizeInput(req.body.firstName);
    req.body.lastName = sanitizeInput(req.body.lastName);
    req.body.emailId = sanitizeInput(req.body.emailId);

    // Validate request
    validateSignUpData(req.body);
    const { firstName, lastName, emailId, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(409).send("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();
    res.status(201).send("User added successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
/**
 * LOGIN USER
 */
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    // Explicitly include password
    const user = await User.findOne({ emailId }).select("+password");
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // create a JWT Token
    // const token = await jwt.sign({ _id: user._id }, "DevPassword@secrateKey", {
    //   expiresIn: "1d",
    // });
    const token = await user.getJWT();

    // Add the token to cookie and send the response to the user
    res.cookie("token", token, {
      httpOnly: true,
    });

    res.send("Login successful");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
/**
 * LOGOUT USER
 */
authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token");

    res.send("Logout successful");
  } catch (err) {
    res.status(400).send(err.message);
  }
});
module.exports = authRouter;
