import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  userFindById: vi.fn(),
  userCreate: vi.fn(),
  bcryptHash: vi.fn(),
  bcryptCompare: vi.fn(),
  generateToken: vi.fn(),
  sendEmail: vi.fn(),
  addXP: vi.fn(),
  addCoins: vi.fn()
}));

vi.mock("../../src/models/User.js", () => ({
  default: {
    findOne: mocks.userFindOne,
    findById: mocks.userFindById,
    create: mocks.userCreate
  }
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: mocks.bcryptHash,
    compare: mocks.bcryptCompare
  }
}));

vi.mock("../../src/utils/generateToken.js", () => ({
  generateToken: mocks.generateToken
}));

vi.mock("../../src/utils/sendEmail.js", () => ({
  sendEmail: mocks.sendEmail
}));

vi.mock("../../src/utils/gamification.js", () => ({
  addXP: mocks.addXP
}));

vi.mock("../../src/utils/economy.js", () => ({
  addCoins: mocks.addCoins
}));

import authRoutes from "../../src/routes/authRoutes.js";

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  return app;
};

describe("Auth Routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.bcryptHash.mockResolvedValue("hashed-password");
    mocks.bcryptCompare.mockResolvedValue(true);
    mocks.generateToken.mockReturnValue("jwt-token");
    mocks.sendEmail.mockResolvedValue(undefined);
    mocks.addXP.mockResolvedValue(undefined);
    mocks.addCoins.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.OTP_HASH_SECRET;
    delete process.env.JWT_SECRET;
  });

  it("registers a new user and dispatches verification email", async () => {
    mocks.userFindOne.mockResolvedValue(null);
    mocks.userCreate.mockResolvedValue({
      _id: "user_1",
      name: "Alex",
      email: "alex@example.com",
      role: "USER",
      isVerified: false
    });

    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Alex",
        email: "alex@example.com",
        password: "secret1"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      _id: "user_1",
      name: "Alex",
      email: "alex@example.com",
      role: "USER",
      isVerified: false
    });
    expect(mocks.sendEmail).toHaveBeenCalledTimes(1);
  });

  it("logs in a verified user and returns a token", async () => {
    const save = vi.fn().mockResolvedValue(undefined);

    mocks.userFindOne.mockResolvedValue({
      _id: "user_2",
      email: "sam@example.com",
      password: "hashed-password",
      isVerified: true,
      isSuspended: false,
      lastActive: null,
      streak: 0,
      save
    });

    mocks.userFindById.mockResolvedValue({
      _id: "user_2",
      name: "Sam",
      email: "sam@example.com",
      role: "USER",
      xp: 10,
      level: 1,
      streak: 1,
      coins: 55,
      dailyCoins: 0,
      badges: []
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "sam@example.com",
        password: "secret1"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      _id: "user_2",
      name: "Sam",
      email: "sam@example.com",
      token: "jwt-token"
    });
    expect(mocks.bcryptCompare).toHaveBeenCalledWith("secret1", "hashed-password");
    expect(mocks.addXP).toHaveBeenCalledTimes(1);
    expect(mocks.addCoins).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);
  });
});