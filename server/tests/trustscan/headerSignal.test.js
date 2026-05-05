import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  httpRequest: vi.fn(),
  httpsRequest: vi.fn(),
  normalizeTarget: vi.fn()
}));

vi.mock("http", () => ({
  default: {
    request: mocks.httpRequest
  }
}));

vi.mock("https", () => ({
  default: {
    request: mocks.httpsRequest
  }
}));

vi.mock("../../src/services/trustscan/urlUtils.js", () => ({
  normalizeTarget: mocks.normalizeTarget
}));

import { checkSecurityHeaders } from "../../src/services/trustscan/headerSignal.js";

const createRequestHarness = (onEnd) => {
  const handlers = {};

  return {
    on(event, handler) {
      handlers[event] = handler;
      return this;
    },
    end() {
      onEnd?.(handlers);
    },
    destroy(error) {
      handlers.error?.(error);
    }
  };
};

const buildResponse = ({ statusCode, headers = {} }) => ({
  statusCode,
  headers,
  resume: vi.fn()
});

describe("checkSecurityHeaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.normalizeTarget.mockImplementation((rawUrl) => {
      if (rawUrl.includes("/next")) {
        return {
          url: "https://example.com/next",
          hostname: "example.com",
          protocol: "https:",
          port: 443,
          pathname: "/next",
          search: ""
        };
      }

      return {
        url: "https://example.com/",
        hostname: "example.com",
        protocol: "https:",
        port: 443,
        pathname: "/",
        search: ""
      };
    });

    mocks.httpRequest.mockImplementation(() => {
      throw new Error("http.request should not be called for https targets");
    });
  });

  it("returns strong result when HEAD provides key headers", async () => {
    mocks.httpsRequest.mockImplementation((options, callback) => createRequestHarness(() => {
      callback(buildResponse({
        statusCode: 200,
        headers: {
          "content-security-policy": "default-src 'self'",
          "strict-transport-security": "max-age=63072000",
          "x-frame-options": "DENY",
          "referrer-policy": "strict-origin-when-cross-origin",
          "x-content-type-options": "nosniff"
        }
      }));
    }));

    const result = await checkSecurityHeaders("example.com");

    expect(result.checkedUrl).toBe("https://example.com/");
    expect(result.statusCode).toBe(200);
    expect(result.grade).toBe("Strong");
    expect(result.present).toEqual(expect.arrayContaining(["CSP", "HSTS", "XFO"]));
    expect(result.scoreDelta).toBeGreaterThan(0);
  });

  it("falls back to GET when HEAD responds with 405", async () => {
    mocks.httpsRequest
      .mockImplementationOnce((options, callback) => createRequestHarness(() => {
        expect(options.method).toBe("HEAD");
        callback(buildResponse({ statusCode: 405, headers: {} }));
      }))
      .mockImplementationOnce((options, callback) => createRequestHarness(() => {
        expect(options.method).toBe("GET");
        callback(buildResponse({
          statusCode: 200,
          headers: {
            "x-content-type-options": "nosniff"
          }
        }));
      }));

    const result = await checkSecurityHeaders("https://example.com");

    expect(result.statusCode).toBe(200);
    expect(result.present).toContain("XCTO");
    expect(mocks.httpsRequest).toHaveBeenCalledTimes(2);
  });

  it("follows redirects and evaluates headers from final target", async () => {
    mocks.httpsRequest
      .mockImplementationOnce((options, callback) => createRequestHarness(() => {
        callback(buildResponse({
          statusCode: 302,
          headers: {
            location: "/next"
          }
        }));
      }))
      .mockImplementationOnce((options, callback) => createRequestHarness(() => {
        callback(buildResponse({
          statusCode: 200,
          headers: {
            "strict-transport-security": "max-age=31536000"
          }
        }));
      }));

    const result = await checkSecurityHeaders("https://example.com");

    expect(mocks.httpsRequest).toHaveBeenCalledTimes(2);
    expect(result.present).toContain("HSTS");
  });

  it("returns negative score when critical headers are missing", async () => {
    mocks.httpsRequest.mockImplementation((options, callback) => createRequestHarness(() => {
      callback(buildResponse({ statusCode: 200, headers: {} }));
    }));

    const result = await checkSecurityHeaders("https://example.com");

    expect(result.grade).toBe("Poor");
    expect(result.scoreDelta).toBeLessThan(0);
    expect(result.missing).toEqual(expect.arrayContaining(["CSP", "HSTS", "XFO"]));
  });

  it("returns poor result when HEAD and GET both time out", async () => {
    mocks.httpsRequest.mockImplementation(() => createRequestHarness((handlers) => {
      handlers.timeout?.();
    }));

    const result = await checkSecurityHeaders("https://example.com");

    expect(result.grade).toBe("Poor");
    expect(result.scoreDelta).toBe(-25);
    expect(result.error).toBe("Header request timed out");
    expect(mocks.httpsRequest).toHaveBeenCalledTimes(2);
  });
});
