import Notification from "../models/Notification.js";
import { sendError, sendSuccess } from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  return sendSuccess(res, notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return sendError(res, 404, "Notification not found");
  }

  notification.isRead = true;
  await notification.save();

  return sendSuccess(res, notification);
});
