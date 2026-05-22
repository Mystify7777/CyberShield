import { validationResult } from "express-validator";
import Video from "../models/Video.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { incrementMetric, METRIC_KEYS } from "../utils/metrics.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createVideo = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { title, url, category } = req.body;

  const video = await Video.create({
    title,
    url,
    category,
    createdBy: req.user._id
  });

  return sendSuccess(res, video, 201, "Video submitted for review");
});

export const getVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ status: "APPROVED" })
    .sort({ createdAt: -1 });

  return sendSuccess(res, videos);
});

export const getPendingVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ status: "PENDING" })
    .populate("createdBy", "name alias email")
    .sort({ createdAt: -1 });

  return sendSuccess(res, videos);
});

export const updateVideoStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, "Validation failed", errors.array());
  }

  const { status } = req.body;
  const video = await Video.findById(req.params.id);

  if (!video) {
    return sendError(res, 404, "Video not found");
  }

  video.status = status;
  await video.save();

  await incrementMetric(METRIC_KEYS.MODERATION_ACTIONS);

  return sendSuccess(res, video, 200, `Video ${status.toLowerCase()}`);
});
