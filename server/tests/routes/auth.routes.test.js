import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  userFindById: vi.fn(),
  userCreate: vi.fn(),
  bcryptHash: vi.fn(),
  bcryptCompare: vi.fn(),
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

    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
    process.env.JWT_EXPIRES_IN = "15m";
    process.env.JWT_REFRESH_EXPIRES_IN = "7d";

    mocks.bcryptHash.mockResolvedValue("hashed-password");
    mocks.bcryptCompare.mockResolvedValue(true);
    mocks.sendEmail.mockResolvedValue(undefined);
    mocks.addXP.mockResolvedValue(undefined);
    mocks.addCoins.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.OTP_HASH_SECRET;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.JWT_REFRESH_EXPIRES_IN;
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
        password: "secret123"
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
    const sessionUser = {
      _id: "user_2",
      name: "Sam",
      email: "sam@example.com",
      role: "USER",
      isVerified: true,
      isSuspended: false,
      xp: 10,
      level: 1,
      streak: 1,
      coins: 55,
      dailyCoins: 0,
      badges: [],
      alias: "",
      bio: "",
      refreshTokenVersion: 0,
      lastActive: null,
      save
    };

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

    mocks.userFindById.mockResolvedValue(sessionUser);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "sam@example.com",
        password: "secret123"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      user: {
        _id: "user_2",
        name: "Sam",
        email: "sam@example.com",
        role: "USER"
      }
    });
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(res.headers["set-cookie"]?.join(";") || "").toContain("cybershield_refresh_token=");
    expect(mocks.bcryptCompare).toHaveBeenCalledWith("secret123", "hashed-password");
    expect(mocks.addXP).toHaveBeenCalledTimes(1);
    expect(mocks.addCoins).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(2);
  });

  it("rotates the refresh cookie and returns a new access token", async () => {
    const sessionUser = {
      _id: "user_3",
      name: "Rita",
      email: "rita@example.com",
      role: "USER",
      isVerified: true,
      isSuspended: false,
      xp: 0,
      level: 1,
      streak: 0,
      coins: 50,
      dailyCoins: 0,
      badges: [],
      alias: "",
      bio: "",
      refreshTokenVersion: 0,
      save: vi.fn().mockResolvedValue(undefined)
    };

    mocks.userFindById.mockResolvedValue(sessionUser);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "rita@example.com",
        password: "secret123"
      });

    const refreshCookie = loginResponse.headers["set-cookie"]?.[0];
    expect(refreshCookie).toContain("cybershield_refresh_token=");

    const refreshResponse = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", refreshCookie);

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.success).toBe(true);
    expect(typeof refreshResponse.body.data.accessToken).toBe("string");
    expect(refreshResponse.headers["set-cookie"]?.[0]).toContain("cybershield_refresh_token=");
    expect(refreshResponse.body.data.user).toMatchObject({
      _id: "user_3",
      email: "rita@example.com"
    });
  });

  it("clears the refresh cookie on logout", async () => {
    const sessionUser = {
      _id: "user_4",
      name: "Lee",
      email: "lee@example.com",
      role: "USER",
      isVerified: true,
      isSuspended: false,
      xp: 0,
      level: 1,
      streak: 0,
      coins: 50,
      dailyCoins: 0,
      badges: [],
      alias: "",
      bio: "",
      refreshTokenVersion: 0,
      save: vi.fn().mockResolvedValue(undefined)
    };

    mocks.userFindById.mockResolvedValue(sessionUser);

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "lee@example.com",
        password: "secret123"
      });

    const refreshCookie = loginResponse.headers["set-cookie"]?.[0];

    const logoutResponse = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", refreshCookie);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.data.loggedOut).toBe(true);
    expect(logoutResponse.headers["set-cookie"]?.[0]).toContain("Expires=");
  });
});