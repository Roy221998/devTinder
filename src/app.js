const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use(authRouter);
app.use(profileRouter);
app.use(requestRouter);

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
