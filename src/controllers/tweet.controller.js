import mongoose, { isValidObjectId } from "mongoose";
import { Tweet, User } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const content = req.body?.content.trim();

  if (!user) {
    throw new ApiError(400, "Unauthorized access cannot create tweet");
  }

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    owner: user._id,
    content: content,
  });

  if (!tweet) {
    throw new ApiError(500, "Tweet creation failed unable to save to database");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  let { page, limit, sortType } = req.query;
  const { userId } = req.params;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  sortType = sortType == "asc" ? 1 : -1;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const data = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $sort: {
        createdAt: sortType,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalCount" }],
        tweets: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      },
    },
  ]);

  if (!data) {
    throw new ApiError(500, "Unable to fetch data from database");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalTweets: data.metadata.totalCount, tweets: data.tweets },
        "Tweets fetched successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tweetId } = req.params;
  const content = req.body?.content.trim();

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const tweet = await Tweet.updateOne(
    {
      _id: tweetId,
      owner: user._id,
    },
    {
      $set: { content },
    },
    { new: true }
  );

  if (!tweet) {
    throw new ApiError(
      400,
      "Invalid operation tweet not avaliable or unauthorized"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet is successfully updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(400, "Tweet not available or Unauthorized access");
  }

  res.status(200).json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};