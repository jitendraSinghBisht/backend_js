import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

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
  const user = req.user;

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
  const user = req.user;

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
  const user = req.user;

  let allLikedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: user._id,
        model_type: "Video",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "reference",
        foreignField: "_id",
        as: "likedVideo",
      },
    },
    {
      $project: {
        likedVideo: 1,
        _id: 0,
        likedBy: 0,
        reference: 0,
        model_type: 0,
      },
    },
  ]);

  if (!allLikedVideos) {
    throw new ApiError(500, "Unable to fetch liked videos from database");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, allLikedVideos, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};
