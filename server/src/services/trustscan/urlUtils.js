import { isIP } from "net";

export const normalizeTarget = (rawUrl) => {
  const hasProtocol = /^https?:\/\//i.test(rawUrl);
  const parsed = new URL(hasProtocol ? rawUrl : `https://${rawUrl}`);

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are supported");
  }

  return {
    url: parsed.toString(),
    hostname: parsed.hostname,
    protocol: parsed.protocol,
    pathname: parsed.pathname,
    search: parsed.search,
    port: parsed.port ? Number(parsed.port) : parsed.protocol === "http:" ? 80 : 443
  };
};

export const getRegistrableDomain = (hostname) => {
  if (!hostname || isIP(hostname)) {
    return null;
  }

  const parts = hostname.toLowerCase().split(".").filter(Boolean);

  if (parts.length < 2) {
    return null;
  }

  if (parts.length === 2) {
    return parts.join(".");
  }

  const commonSecondLevelTlds = new Set([
    "co.uk",
    "org.uk",
    "ac.uk",
    "gov.uk",
    "co.jp",
    "com.au",
    "net.au",
    "org.au",
    "co.nz",
    "com.br",
    "com.mx",
    "com.tr",
    "co.in",
    "firm.in",
    "net.in",
    "org.in",
    "gen.in"
  ]);

  const lastTwo = parts.slice(-2).join(".");
  if (commonSecondLevelTlds.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join(".");
  }

  if (parts[0] === "www" && parts.length >= 3) {
    return parts.slice(-2).join(".");
  }

  return lastTwo;
};
