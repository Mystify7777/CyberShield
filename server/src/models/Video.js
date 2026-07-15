import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["AWARENESS", "SCAM", "TIPS"],
      default: "AWARENESS",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    }
  },
  { timestamps: true }
);

// Add compound indexes for common queries
videoSchema.index({ status: 1, createdAt: -1 });
videoSchema.index({ createdBy: 1, createdAt: -1 });
videoSchema.index({ category: 1, status: 1 });

export default mongoose.model("Video", videoSchema);
