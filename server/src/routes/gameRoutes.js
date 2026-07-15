import express from "express";
import { body } from "express-validator";
import { rewardGame } from "../controllers/gameController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
  "/reward",
  protect,
  [body("correct").isBoolean().withMessage("correct must be boolean")],
  rewardGame
);

export default router;
