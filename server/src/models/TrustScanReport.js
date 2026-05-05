import mongoose from "mongoose";

const trustScanReportSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TrustScanJob",
      required: true,
      index: true
    },
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
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    verdict: {
      type: String,
      enum: ["LOW_RISK", "MEDIUM_RISK", "HIGH_RISK", "DANGEROUS", "RISKY", "CAUTION", "SAFE", "STRONG"],
      required: true
    },
    factors: {
      type: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
          impact: { type: Number, required: true },
          status: { type: String, required: true },
          reason: { type: String, default: "success" },
          detail: { type: String, required: true }
        }
      ],
      default: []
    },
    summary: {
      type: String,
      required: true
    },
    scanDurationMs: {
      type: Number,
      default: 0
    },
    scanEvidence: {
      type: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
          message: { type: String, required: true },
          reason: { type: String, default: "success" },
          status: { type: String, required: true },
          durationMs: { type: Number, default: 0 },
          occurredAt: { type: String, required: true }
        }
      ],
      default: []
    },
    scanMetadata: {
      ssl: { reason: { type: String, default: "success" } },
      headers: { reason: { type: String, default: "success" } },
      domain: { reason: { type: String, default: "success" } },
      reputation: { reason: { type: String, default: "success" } }
    }
  },
  { timestamps: true }
);

export default mongoose.model("TrustScanReport", trustScanReportSchema);
