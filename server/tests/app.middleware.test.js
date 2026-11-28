import { describe, expect, it, vi } from "vitest";
import request from "supertest";

vi.mock("../src/controllers/aiController.js", () => ({
  detectScam: (req, res) => {
    res.status(200).json({
      success: true,
      body: req.body
    });
  }
}));

const { default: app } = await import("../src/app.js");

describe("backend middleware ordering", () => {
  it("parses JSON before sanitization middleware", async () => {
    const response = await request(app)
      .post("/api/ai/predict")
      .send({
        text: "<script>alert(1)</script>",
        $where: "should be removed"
      });

    expect(response.status).toBe(200);
    expect(response.body.body).toEqual({
      text: "&lt;script&gt;alert(1)&lt;/script&gt;"
    });
  });

  it("returns a safe JSON 400 response for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/ai/predict")
      .set("Content-Type", "application/json")
      .send('{"text":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Invalid JSON payload",
      code: "INVALID_JSON"
    });
  });

  it("returns a JSON 404 response for unknown routes", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route not found",
      code: "ROUTE_NOT_FOUND"
    });
  });
});
