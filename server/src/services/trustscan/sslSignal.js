import tls from "tls";
import { normalizeTarget } from "./urlUtils.js";

const SSL_TIMEOUT_MS = 6000;

export const runSslTlsCheck = async (rawUrl) => {
  try {
    const { hostname, port } = normalizeTarget(rawUrl);

    return await new Promise((resolve) => {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false
        },
        () => {
          const cert = socket.getPeerCertificate();

          if (!cert || Object.keys(cert).length === 0) {
            socket.end();
            resolve({
              valid: false,
              issuer: "Unknown",
              expiresAt: null,
              daysRemaining: null,
              error: "No certificate returned",
              reason: "network_error"
            });
            return;
          }

          const expiresAt = cert.valid_to ? new Date(cert.valid_to) : null;
          const daysRemaining = expiresAt
            ? Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

          const validByDate = typeof daysRemaining === "number" ? daysRemaining >= 0 : false;
          const hasAuthorizationError = Boolean(socket.authorizationError);
          const hasTrustedChain = Boolean(socket.authorized) && !hasAuthorizationError;
          const valid = hasTrustedChain && validByDate;

          resolve({
            valid,
            issuer: cert.issuer?.CN || cert.issuer?.O || "Unknown",
            expiresAt: expiresAt ? expiresAt.toISOString() : null,
            daysRemaining,
            error: socket.authorizationError || null,
            reason: "success"
          });

          socket.end();
        }
      );

      socket.setTimeout(SSL_TIMEOUT_MS, () => {
        socket.destroy();
        resolve({
          valid: false,
          issuer: "Unknown",
          expiresAt: null,
          daysRemaining: null,
          error: "TLS handshake timed out",
          reason: "network_error"
        });
      });

      socket.on("error", (error) => {
        resolve({
          valid: false,
          issuer: "Unknown",
          expiresAt: null,
          daysRemaining: null,
          error: error.message || "TLS handshake failed",
          reason: "network_error"
        });
      });
    });
  } catch (error) {
    return {
      valid: false,
      issuer: "Unknown",
      expiresAt: null,
      daysRemaining: null,
      error: error.message || "Invalid target",
      reason: "network_error"
    };
  }
};
