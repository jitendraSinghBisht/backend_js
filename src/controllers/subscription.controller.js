import mongoose, { isValidObjectId } from "mongoose";
import { User, Subscription } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = req.user;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400,"Invalid channel id")
  }

  let subscription = await Subscription.findOneAndDelete({
    channel: channelId,
    subscriber: user._id,
  });

  if (!subscription) {
    subscription = await Subscription.create({
        channel: channelId,
        subscriber: user._id,
    })
  }

  res.status(200).json(new ApiResponse(200,{},"Subscription toggled"))
});

// TODO: controller to return subscriber list of a channel 
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// TODO: controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};