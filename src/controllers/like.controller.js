import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  let like = await Like.findOneAndDelete({
    likedBy: user._id,
    reference: videoId,
    model_type: "Video",
  });

  if (!like) {
    like = await Subscription.create({
        likedBy: user._id,
        reference: videoId,
        model_type: "Video",
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200,{},"Video like toggled"))
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const user = req.user
  //TODO: toggle like on comment

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }

  let like = await Like.findOneAndDelete({
    likedBy: user._id,
    reference: commentId,
    model_type: "Comment",
  });

  if (!like) {
    like = await Subscription.create({
        likedBy: user._id,
        reference: commentId,
        model_type: "Comment",
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200,{},"Comment like toggled"))
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const user = req.user
  //TODO: toggle like on tweet

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  let like = await Like.findOneAndDelete({
    likedBy: user._id,
    reference: tweetId,
    model_type: "Tweet",
  });

  if (!like) {
    like = await Subscription.create({
        likedBy: user._id,
        reference: tweetId,
        model_type: "Tweet",
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200,{},"Tweet like toggled"))
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
