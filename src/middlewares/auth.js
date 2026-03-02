const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }
    const decodedToken = await jwt.verify(token, "DevPassword@secrateKey");
    const { _id } = decodedToken;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User dose not exists");
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { userAuth };
