const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

/**
 * GET USER PROFILE
 */
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});
/**
 * EDIT USER PROFILE
 */
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile update successfully`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * UPDATE PASSWORD
 */
const bcrypt = require("bcrypt");

/**
 * UPDATE PASSWORD
 */
profileRouter.patch("/profile/update-password", userAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Password not strong enough");
    }
    const loggedInUser = await User.findById(req.user._id).select("+password");

    // Compare current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      loggedInUser.password,
    );

    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    loggedInUser.password = passwordHash;

    await loggedInUser.save();

    res.send("Password updated successfully");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = profileRouter;
