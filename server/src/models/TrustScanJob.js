import mongoose from "mongoose";

const trustScanJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    url: {
      type: String,
      required: true
    },
    normalizedDomain: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
      index: true
    },
    startedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    error: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("TrustScanJob", trustScanJobSchema);
