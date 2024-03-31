import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (req.files?.videoFile[0].mimetype.search("video") === -1) {
    throw new ApiError(400, "Video not found");
  }

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
  //TODO: get video by id

  if (!req.user) {
    throw new ApiError(400,"Unauthorized access connot fetch video")
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video not available invalid videoId");
  }

  await User.findByIdAndUpdate(req.user._id,{
    $set:{
      watchHistory: this.watchHistory.push(video._id)
    },{new: true}
  })
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  let video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Video do not exist");
  }

  if (video.owner !== req.user?._id) {
    throw new ApiError(401,"Unauthorized access cannot update video")
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
  //TODO: delete video

  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(400, "Video not available or unable to delete");
  }

  await deleteOnCloudinary(video.videoFile, "video");
  await deleteOnCloudinary(video.thumbnail);

  res.status(200).json(new ApiResponse(200, {}, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: { $cond: [this.isPublished, false, true] },
      },
    },
    { new: true }
  );

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
