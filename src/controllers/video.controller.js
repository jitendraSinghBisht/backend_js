import mongoose, { isValidObjectId } from "mongoose";
import { Video, User } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  let { page, limit, query, sortBy, sortType } = req.query;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 10;
  sortType = sortType == "asc" ? 1 : -1;

  if (["views", "duration", "createdAt"].includes(sortBy) === -1) {
    throw new ApiError(400, "Invalid sortBy parameter");
  }

  const data = await Video.aggregate([
    {
      $match: {
        $text: {
          $search: query,
        },
      },
    },
    {
      $sort: {
        sortBy: sortType,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "totalCount" }],
        videos: [{ $skip: (page - 1) * limit }, { $limit: limit }],
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
        { totalVideos: data.metadata.totalCount, videos: data.videos },
        "Videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  if (req.files?.videoFile[0].mimetype.search("video") === -1) {
    throw new ApiError(400, "Video not found");
  }

  const { title, description } = req.body;
  const user = req.user;
  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!(title && description && videoLocalPath && thumbnailLocalPath && user)) {
    throw new ApiError(400, "All feilds are neccessary");
  }

  const videoCloud = await uploadOnCloudinary(videoLocalPath);
  const thumbnailCloud = await uploadOnCloudinary(thumbnailLocalPath);

  if (!(videoCloud && thumbnailCloud)) {
    throw new ApiError(500, "Unable to upload to cloudinary");
  }

  const video = await Video.create({
    videoFile: videoCloud.url,
    thumbnail: thumbnailCloud.url,
    title,
    description,
    owner: user._id,
    duration: videoCloud.duration,
  });

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video Uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Object Id");
  }

  if (!req.user) {
    throw new ApiError(400, "Unauthorized access connot fetch video");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: videoId,
      },
    },
    {
      $set: {
        views: this.views + 1,
      },
    },
    {
      $merge: {
        into: "videos",
        on: "_id",
        whenMatched: "replace",
        whenNotMatched: "discard",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
  ]);

  if (!video) {
    throw new ApiError(400, "Video not available invalid videoId");
  }

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        watchHistory: this.watchHistory.push(video._id),
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Object Id");
  }

  let video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video do not exist");
  }

  if (video.owner !== req.user?._id) {
    throw new ApiError(401, "Unauthorized access cannot update video");
  }

  if (thumbnailLocalPath) {
    await deleteOnCloudinary(video.videoFile, "video");
    const videoCloud = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoCloud) {
      throw new ApiError(400, "Error while uploading thumbnail on cloudinary");
    }

    video.thumbnail = videoCloud.url;
  }

  if (title) {
    video.title = title;
  }

  if (description) {
    video.description = description;
  }

  await video.save();

  res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Object Id");
  }

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(400, "Video not available or Unauthorized");
  }

  await deleteOnCloudinary(video.videoFile, "video");
  await deleteOnCloudinary(video.thumbnail);

  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Object Id");
  }

  const video = await Video.findOneAndUpdate(
    {
      _id: videoId,
      owner: req.user._id,
    },
    {
      $set: {
        isPublished: { $cond: [this.isPublished, false, true] },
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(400, "Unauthorized or video not found");
  }

  res
    .status(202)
    .json(new ApiResponse(202, {}, "Publish status updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
