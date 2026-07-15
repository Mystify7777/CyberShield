import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["PHISHING", "SCAM", "PRIVACY", "GENERAL"],
      default: "GENERAL",
      index: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

// Add compound indexes for common queries
articleSchema.index({ status: 1, createdAt: -1 });
articleSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Article", articleSchema);
