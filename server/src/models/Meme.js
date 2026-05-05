import mongoose from "mongoose";

const memeSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ["SCAM", "AWARENESS", "FUN"],
      default: "FUN",
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
      enum: ["VISIBLE", "FLAGGED", "REMOVED"],
      default: "VISIBLE",
      index: true
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    votingEnabled: {
      type: Boolean,
      default: true
    },
    commentsEnabled: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Add compound indexes for common queries
memeSchema.index({ status: 1, createdAt: -1 });
memeSchema.index({ createdBy: 1, createdAt: -1 });
memeSchema.index({ category: 1, status: 1 });

export default mongoose.model("Meme", memeSchema);