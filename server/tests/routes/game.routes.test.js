import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  protect: vi.fn(),
  userFindById: vi.fn(),
  addXP: vi.fn(),
  addCoins: vi.fn()
}));

vi.mock("../../src/middlewares/authMiddleware.js", () => ({
  protect: (req, res, next) => {
    return mocks.protect(req, res, next);
  }
}));

vi.mock("../../src/models/User.js", () => ({
  default: {
    findById: mocks.userFindById
  }
}));

vi.mock("../../src/utils/gamification.js", () => ({
  addXP: mocks.addXP
}));

vi.mock("../../src/utils/economy.js", () => ({
  addCoins: mocks.addCoins
}));

import gameRoutes from "../../src/routes/gameRoutes.js";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/game", gameRoutes);
  return app;
};

describe("Game Routes", () => {
  const app = createApp();
  const userId = "507f191e810c19729de860ea";

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.protect.mockImplementation((req, res, next) => {
      req.user = { _id: userId };
      return next();
    });

    mocks.addXP.mockResolvedValue(undefined);
    mocks.addCoins.mockResolvedValue(undefined);
    mocks.userFindById.mockResolvedValue({
      _id: userId,
      lastPlayedGame: null,
      save: vi.fn().mockResolvedValue(undefined)
    });
  });

  it("returns public phishing questions without answers", async () => {
    const res = await request(app).get("/api/game/questions");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.questions)).toBe(true);
    expect(res.body.data.questions[0]).not.toHaveProperty("answer");
  });

  it("rewards a correct answer server-side", async () => {
    const res = await request(app)
      .post("/api/game/reward")
      .send({ questionId: "q1", answerId: "SCAM" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rewarded).toBe(true);
    expect(mocks.userFindById).toHaveBeenCalledWith(userId);
    expect(mocks.addXP).toHaveBeenCalledTimes(1);
    expect(mocks.addCoins).toHaveBeenCalledTimes(1);
  });

  it("does not reward an incorrect answer", async () => {
    const res = await request(app)
      .post("/api/game/reward")
      .send({ questionId: "q1", answerId: "SAFE" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rewarded).toBe(false);
    expect(res.body.message).toBe("Incorrect answer");
    expect(mocks.userFindById).not.toHaveBeenCalled();
    expect(mocks.addXP).not.toHaveBeenCalled();
    expect(mocks.addCoins).not.toHaveBeenCalled();
  });
});