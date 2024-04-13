import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const content = req.body?.content.trim();
  const user = req.user;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  const comment = Comment.create({
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
  // TODO: update a comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400,"Invalid comment id")
  }
  
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
