import express from "express";
import { body } from "express-validator";
import { getQuestions, rewardGame } from "../controllers/gameController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET public questions (without answers)
router.get("/questions", getQuestions);

// POST answer for reward (requires authentication)
router.post(
  "/reward",
  protect,
  [
    body("questionId").isString().trim().notEmpty().withMessage("questionId is required"),
    body("answerId").isString().trim().notEmpty().withMessage("answerId is required")
  ],
  rewardGame
);

export default router;
