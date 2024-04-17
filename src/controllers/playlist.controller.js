import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/index.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;

  if (!name || !description) {
    throw new ApiError(400, "Data is required to create a playlist");
  }

  const playlistExist = await Playlist.findOne({
    owner: user._id,
    name,
  });
  if (playlistExist) {
    throw new ApiError(
      400,
      "This playlist already exist for this user change name"
    );
  }

  const playlist = await Playlist.create({
    name,
    description: description || "",
    owner: user._id,
  });
  if (!playlist) {
    throw new ApiError(500, "Unable to create playlist in database");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const playlists = await Playlist.find({ owner: userId });

  if (!playlists) {
    throw new ApiError(500, "Unable to fetch from database");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, "Unable to fetch from database");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $push: { videos: videoId } }
  );

  if (!playlist) {
    throw new ApiError(500, "Unable to add video to playlist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user._id },
    { $pull: { videos: videoId } }
  );

  if (!playlist) {
    throw new ApiError(
      500,
      "Unable to remove video from playlist database error"
    );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(500, "Unable to get playlist from database");
  }

  if (playlist.owner === req.user._id) {
    await Playlist.findByIdAndDelete(playlistId);
  } else {
    throw new ApiError(
      400,
      "Unauthorized Access needs to be owner to delete the playlist"
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlists deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlistOld = await Playlist.findById(playlistId);

  if (playlistOld.owner !== req.user._id) {
    throw new ApiError(400, "Unauthorized to update the playlist");
  }

  const playlistExist = await Playlist.findOne({
    owner: req.user._id,
    name,
  });
  if (playlistExist) {
    throw new ApiError(
      400,
      "This playlist already exist for this user change name"
    );
  }

  const playlist = await Playlist.findByIdAndUpdate(playlistId, {
    name: name || this.name,
    description: description || this.description,
  });

  if (!playlist) {
    throw new ApiError(500, "Unable to update playlist database error");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
