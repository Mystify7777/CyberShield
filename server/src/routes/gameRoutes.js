import express from "express";
import { body } from "express-validator";
import { getQuestions, rewardGame } from "../controllers/gameController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/questions", getQuestions);

router.post(
  "/reward",
  protect,
  [
    body("questionId").trim().notEmpty().withMessage("questionId is required"),
    body("answerId").trim().notEmpty().withMessage("answerId is required")
  ],
  rewardGame
);

export default router;
