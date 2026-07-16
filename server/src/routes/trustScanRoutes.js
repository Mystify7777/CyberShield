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
  ],
  createTrustScan
);

// Public readonly endpoint (no auth required) - must come before /:id
router.get("/report/:id/public", getPublicTrustScanReport);

router.get("/history", protect, getTrustScanHistory);
router.get("/:id", protect, getTrustScanById);

export default router;
