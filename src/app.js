const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const { sanitizeInput, validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

/**
 * SIGNUP USER
 */
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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
    const token = user.getJWT();

    // Add the token to cookie and send the response to the user
    res.cookie("token", token);

    res.send("Login successful");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * GET USER PROFILE
 */
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * Send Connection Request
 */
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * GET USER BY EMAIL (query param)
 */
app.get("/user", async (req, res) => {
  try {
    const { emailId } = req.query;
    if (!emailId) return res.status(400).send("Email is required");

    const user = await User.findOne({ emailId });
    if (!user) return res.status(404).send("User not found");

    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * FETCH ALL USERS
 */
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong" + err.message);
  }
});

/**
 * DELETE USER
 */
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Error deleting user:" + err.message);
  }
});

/**
 * UPDATE USER
 */
app.patch("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;

    // Allow only safe fields updating photoUrl, about, gender, age, skills
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k),
    );
    if (!isUpdateAllowed) {
      return res.status(400).send("Invalid update fields");
    }

    // Validate skills length
    if (data.skills.length > 5) {
      throw new Error("Maximum skills are set");
    }

    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.send(updatedUser);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected.");
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(() => {
    console.error("Database connection failed");
  });
