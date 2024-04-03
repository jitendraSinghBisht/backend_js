import mongoose, { isValidObjectId } from "mongoose";
import { User, Subscription } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = req.user;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  let subscription = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: user._id,
  });

  if (!subscription) {
    subscription = await Subscription.create({
      channel: channelId,
      subscriber: user._id,
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Subscription toggled"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channelId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
      },
    },
    {
      $project: {
        "subscriber.username": 1,
        "subscriber.fullName": 1,
        "subscriber.avatar": 1,
        channel: 1,
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(500, "Database Error data not fetched");
  }

  res
    .status(200)
    .json(200, subscribers, "Subscribers fetched successfully");
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const channels = await Subscription.aggregate([
    {
      $match: {
        subscriber: subscriberId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $project: {
        "channel.username": 1,
        "channel.fullName": 1,
        "channel.avatar": 1,
        subscriber: 1,
      },
    },
  ]);

  if (!channels) {
    throw new ApiError(500, "Database Error data not fetched");
  }

  res
    .status(200)
    .json(200, channels, "Channels fetched successfully");
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};