import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comments = await Comment.find({ video: videoId })
    .skip(page * limit)
    .limit(limit);

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments found successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const content = req.body?.content.trim();
  const user = req.user;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Comment not added database error");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, comment, "Comment added to the video successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const content = req.body?.content.trim();

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  const comment = await Comment.findByIdAndUpdate(commentId, { content });

  if (!comment) {
    throw new ApiError(500, "Comment not found cannot update");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  await Comment.findByIdAndDelete(commentId);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
