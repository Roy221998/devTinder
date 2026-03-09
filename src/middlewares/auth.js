const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token || typeof token !== "string") {
      throw new Error("Token missing or invalid");
    }

    const decodedToken = jwt.verify(token, "DevPassword@secrateKey");

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new Error("User does not exist");
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(401).send(err.message);
  }
};

module.exports = { userAuth };
