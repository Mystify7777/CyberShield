import express from "express";
import { body } from "express-validator";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createTrustScan,
  getTrustScanById,
  getTrustScanHistory,
  getPublicTrustScanReport
} from "../controllers/trustScanController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("url")
      .isString()
      .withMessage("URL must be a string")
      .trim()
      .notEmpty()
      .withMessage("URL is required")
      .isURL({ require_protocol: false })
      .withMessage("Invalid URL format")
      .isLength({ min: 5, max: 2048 })
      .withMessage("URL must be between 5 and 2048 characters"),
    // Prevent scanning of localhost, internal IPs, or reserved TLDs
    body("url")
      .custom((value) => {
        const hostname = new URL(value.includes("://") ? value : `https://${value}`).hostname;
        
        // Reject localhost and loopback
        if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
          throw new Error("Cannot scan localhost");
        }

        // Reject private IP ranges (basic check)
        if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
          throw new Error("Cannot scan private IP addresses");
        }

        // Reject invalid TLDs (must end with valid extension)
        if (!/\.[a-z]{2,}$/i.test(hostname)) {
          throw new Error("Invalid domain - must have valid TLD");
        }

        return true;
      })
  ],
  createTrustScan
);

// Public readonly endpoint (no auth required) - must come before /:id
router.get("/report/:id/public", getPublicTrustScanReport);

router.get("/history", protect, getTrustScanHistory);
router.get("/:id", protect, getTrustScanById);

export default router;
