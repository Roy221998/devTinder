const express = require("express");
const requestRouter = express.Router();
const mongoose = require("mongoose");

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

/**
 * Send Connection Request
 */
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Validate connection status
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send(`Invalid status type ${status}`);
      }

      // Validate Mongo ObjectId before querying DB.
      if (!mongoose.Types.ObjectId.isValid(toUserId)) {
        return res.status(400).send("Invalid User ID");
      }

      // Prevent self request earlier(Stops invalid request before DB call.Protects database integrity if someone bypasses the API.)
      if (fromUserId.equals(toUserId)) {
        return res.status(400).send("Cannot send request to yourself");
      }

      // Check if toUserId exists in the database
      const isToUserExistInDB = await User.findById(toUserId);
      if (!isToUserExistInDB) {
        return res.status(404).json({
          message:
            "whom are you sending the connection request that person is not exist in DataBase",
        });
      }

      // Check if a connection request already exists between the two users in either direction
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      
      if (existingConnectionRequest) {
        return res
          .status(400)
          .send({ message: "Connection Request Already Exists" });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} to ${toUserId}`,
        data,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
);

/**
 * Review Connection Request
 */
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status not allowed" });
      }

      if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(400).send("Invalid request ID");
      }

      const existingConnectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!existingConnectionRequest) {
        return res
          .status(400)
          .json({ message: "Connection request not found" });
      }

      existingConnectionRequest.status = status;

      const data = await existingConnectionRequest.save();

      res.json({
        message: `Connection request ${status} successfully`,
        data,
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
);
module.exports = requestRouter;
