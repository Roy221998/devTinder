const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();

// get all pending connection request for the logged in user
userRouter.get("/user/request/received", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const pendingRequests = await ConnectionRequest.find({
      toUserId: loggedInUserId,
      status: "interested",
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "age",
        "gender",
        "photoUrl",
        "about",
        "skills",
      ])
      .lean();

    res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      data: pendingRequests,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending requests",
      error: err.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all accepted connections where the logged-in user is either
    // the sender (fromUserId)
    // OR the receiver (toUserId)
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUserId, status: "accepted" },
        { toUserId: loggedInUserId, status: "accepted" },
      ],
    })
      .populate(
        "fromUserId toUserId",
        "firstName lastName age gender photoUrl about skills",
      )
      .lean();

    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUserId.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).json({
      success: true,
      message: "Connections fetched successfully",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching connections",
      error: err.message,
    });
  }
});
module.exports = userRouter;
