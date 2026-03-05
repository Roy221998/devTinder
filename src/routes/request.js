const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

/**
 * Send Connection Request
 */
requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = requestRouter;