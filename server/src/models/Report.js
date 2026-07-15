import mongoose from "mongoose";
import {
  LEGACY_REPORT_CATEGORIES,
  LEGACY_REPORT_STATUSES,
  REPORT_AFFECTED_ASSET_VALUES,
  REPORT_CATEGORY_VALUES,
  REPORT_SEVERITY_VALUES,
  REPORT_SOURCE_CHANNEL_VALUES,
  REPORT_STATUS_VALUES,
  REPORT_SUBCATEGORY_VALUES
} from "../constants/reportTaxonomy.js";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [...REPORT_CATEGORY_VALUES, ...LEGACY_REPORT_CATEGORIES],
      default: "OTHER"
    },
    subcategory: {
      type: String,
      enum: REPORT_SUBCATEGORY_VALUES,
      default: "SUSPICIOUS_OTHER"
    },
    evidence: {
      type: String
    },
    severity: {
      type: String,
      enum: REPORT_SEVERITY_VALUES,
      default: "LOW"
    },
    sourceChannel: {
      type: String,
      enum: REPORT_SOURCE_CHANNEL_VALUES,
      default: "UNKNOWN"
    },
    affectedAsset: {
      type: String,
      enum: REPORT_AFFECTED_ASSET_VALUES,
      default: "OTHER"
    },
    estimatedLoss: {
      type: Number,
      min: 0
    },
    tags: [String],
    contactEmail: {
      type: String
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    isSensitive: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: [...REPORT_STATUS_VALUES, ...LEGACY_REPORT_STATUSES],
      default: "SUBMITTED"
    },
    history: [
      {
        status: String,
        date: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
