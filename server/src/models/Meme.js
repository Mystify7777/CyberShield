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
      default: "FUN"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["VISIBLE", "FLAGGED", "REMOVED"],
      default: "VISIBLE"
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

export default mongoose.model("Meme", memeSchema);