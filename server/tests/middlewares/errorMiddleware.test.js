import { describe, expect, it, vi } from "vitest";

const { logErrorMock } = vi.hoisted(() => ({
  logErrorMock: vi.fn()
}));

vi.mock("../../src/utils/logger.js", () => ({
  logError: logErrorMock
}));

const { errorHandler } = await import("../../src/middlewares/errorMiddleware.js");

const createResponse = () => {
  const response = {
    status: vi.fn(),
    json: vi.fn()
  };

  response.status.mockReturnValue(response);
  return response;
};

describe("errorHandler", () => {
  it("returns a safe 500 response without exposing internal errors", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/test"
    };
    const res = createResponse();
    const error = new Error("MongoServerSelectionError: mongodb://user:secret@example");

    errorHandler(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR"
    });
    expect(JSON.stringify(res.json.mock.calls[0][0])).not.toContain("mongodb://");
    expect(logErrorMock).toHaveBeenCalledWith(
      "HTTP",
      "Unhandled request error",
      expect.objectContaining({
        method: "GET",
        path: "/api/test",
        error: error.message
      })
    );
  });

  it("returns a safe 400 response for malformed JSON", () => {
    const req = {
      method: "POST",
      originalUrl: "/api/test"
    };
    const res = createResponse();

    errorHandler(
      {
        status: 400,
        type: "entity.parse.failed",
        message: "Unexpected token } in JSON at position 10",
        body: '{"secret":"value"}'
      },
      req,
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid JSON payload",
      code: "INVALID_JSON"
    });
  });

  it("preserves explicit safe 4xx messages", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/test"
    };
    const res = createResponse();

    errorHandler(
      {
        status: 404,
        message: "Resource not found",
        expose: true,
        type: "RESOURCE_NOT_FOUND"
      },
      req,
      res,
      vi.fn()
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Resource not found",
      code: "RESOURCE_NOT_FOUND"
    });
  });

  it("never falls back to Express's default 200 status", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/test"
    };
    const res = createResponse();

    errorHandler(new Error("unexpected failure"), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
