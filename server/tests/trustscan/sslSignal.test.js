import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connect: vi.fn(),
  normalizeTarget: vi.fn()
}));

vi.mock("tls", () => ({
  default: {
    connect: mocks.connect
  }
}));

vi.mock("../../src/services/trustscan/urlUtils.js", () => ({
  normalizeTarget: mocks.normalizeTarget
}));

import { runSslTlsCheck } from "../../src/services/trustscan/sslSignal.js";

const createSocket = ({
  cert,
  authorized = false,
  authorizationError = null,
  onSetTimeout,
  onErrorHandlerRegistered
} = {}) => {
  const eventHandlers = {};

  return {
    authorized,
    authorizationError,
    getPeerCertificate: vi.fn(() => cert),
    setTimeout: vi.fn((timeoutMs, handler) => {
      onSetTimeout?.(timeoutMs, handler);
    }),
    on: vi.fn((event, handler) => {
      eventHandlers[event] = handler;
      if (event === "error") {
        onErrorHandlerRegistered?.(handler);
      }
      return this;
    }),
    end: vi.fn(),
    destroy: vi.fn()
  };
};

describe("runSslTlsCheck", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.normalizeTarget.mockReturnValue({
      hostname: "example.com",
      port: 443
    });
  });

  it("returns valid result for valid certificate", async () => {
    const socket = createSocket({
      cert: {
        valid_to: "Jan 01 2030 GMT",
        issuer: { CN: "Lets Encrypt" }
      },
      authorized: true
    });

    mocks.connect.mockImplementation((options, callback) => {
      queueMicrotask(() => callback());
      return socket;
    });

    const result = await runSslTlsCheck("https://example.com");

    expect(result.valid).toBe(true);
    expect(result.issuer).toBe("Lets Encrypt");
    expect(result.expiresAt).toBeTruthy();
  });

  it("returns invalid result for expired certificate", async () => {
    const socket = createSocket({
      cert: {
        valid_to: "Jan 01 2000 GMT",
        issuer: { O: "Old CA" }
      },
      authorized: false,
      authorizationError: "CERT_HAS_EXPIRED"
    });

    mocks.connect.mockImplementation((options, callback) => {
      queueMicrotask(() => callback());
      return socket;
    });

    const result = await runSslTlsCheck("https://example.com");

    expect(result.valid).toBe(false);
    expect(result.issuer).toBe("Old CA");
    expect(result.error).toBe("CERT_HAS_EXPIRED");
  });

  it("returns invalid result for self-signed or untrusted cert chain", async () => {
    const socket = createSocket({
      cert: {
        valid_to: "Jan 01 2035 GMT",
        issuer: { CN: "Self-Signed" }
      },
      authorized: false,
      authorizationError: "SELF_SIGNED_CERT_IN_CHAIN"
    });

    mocks.connect.mockImplementation((options, callback) => {
      queueMicrotask(() => callback());
      return socket;
    });

    const result = await runSslTlsCheck("https://self-signed.badssl.com");

    expect(result.valid).toBe(false);
    expect(result.issuer).toBe("Self-Signed");
    expect(result.error).toBe("SELF_SIGNED_CERT_IN_CHAIN");
  });

  it("returns no certificate error when peer cert is missing", async () => {
    const socket = createSocket({ cert: {} });

    mocks.connect.mockImplementation((options, callback) => {
      queueMicrotask(() => callback());
      return socket;
    });

    const result = await runSslTlsCheck("https://example.com");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("No certificate returned");
  });

  it("returns timeout result when handshake exceeds timeout", async () => {
    const socket = createSocket({
      cert: null,
      onSetTimeout: (timeoutMs, handler) => handler()
    });

    mocks.connect.mockImplementation(() => socket);

    const result = await runSslTlsCheck("https://example.com");

    expect(socket.destroy).toHaveBeenCalled();
    expect(result.valid).toBe(false);
    expect(result.error).toBe("TLS handshake timed out");
  });

  it("returns socket error when connection fails", async () => {
    const socket = createSocket({
      cert: null,
      onErrorHandlerRegistered: (handler) => handler(new Error("connect failed"))
    });

    mocks.connect.mockImplementation(() => socket);

    const result = await runSslTlsCheck("https://example.com");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("connect failed");
  });
});
