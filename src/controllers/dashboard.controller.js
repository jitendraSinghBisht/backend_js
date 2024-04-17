import { Video, Subscription, Like, Tweet } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const user = req.user;

  const videoData = await Video.aggregate([
    {
      $match: {
        owner: user._id,
      },
    },
    {
      $group: {
        _id: {},
        videoId: {
          $push: "$_id",
        },
        totalVideos: { $count: {} },
        totalViews: { $sum: "$views" },
      },
    },
    {
      $project: {
        _id: 0,
        videoId: 1,
        totalVideos: 1,
        totalViews: 1,
      },
    },
  ]);

  const subsData = await Subscription.aggregate([
    {
      $match: {
        channel: user._id,
      },
    },
    { $count: "totalSubs" },
  ]);

  const likeData = await Like.aggregate([
    {
      $match: {
        reference: { $in: videoData[0].videoId },
        model_type: "Video",
      },
    },
    { $count: "totalLikes" },
  ]);

  const tweetData = await Tweet.aggregate([
    {
      $match: {
        owner: user._id,
      },
    },
    { $count: "totalTweets" },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos: videoData[0].videoId,
        totalVideos: videoData[0].totalVideos,
        totalViews: videoData[0].totalViews,
        totalSubscribers: subsData[0].totalSubs,
        totalLikes: likeData[0].totalLikes,
        totalTweets: tweetData[0].totalTweets,
      },
      "Details fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  const videos = await Video.find({ owner: user._id });

  if (!videos?.length) {
    throw new ApiError(404, "Videos does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
