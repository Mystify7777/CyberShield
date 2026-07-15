import mongoose from "mongoose";

const forumPostSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      index: true
    },
    title: String,
    content: String,
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("ForumPost", forumPostSchema);
