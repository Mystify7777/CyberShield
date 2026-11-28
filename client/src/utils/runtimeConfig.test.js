import assert from "node:assert/strict";
import test from "node:test";

import { resolveApiBaseUrl } from "./runtimeConfig.js";

test("fails in production when VITE_API_URL is missing", () => {
  assert.throws(
    () => resolveApiBaseUrl("", { isProduction: true, isDevelopment: false }),
    /VITE_API_URL is required in production/
  );
});

test("fails in production when VITE_API_URL is whitespace", () => {
  assert.throws(
    () => resolveApiBaseUrl("   ", { isProduction: true, isDevelopment: false }),
    /VITE_API_URL is required in production/
  );
});

test("keeps the development localhost fallback", () => {
  assert.equal(
    resolveApiBaseUrl("", { isProduction: false, isDevelopment: true }),
    "http://localhost:5000/api"
  );
});

test("normalizes a configured API URL", () => {
  assert.equal(
    resolveApiBaseUrl("https://api.example.com/", { isProduction: true, isDevelopment: false }),
    "https://api.example.com/api"
  );

  assert.equal(
    resolveApiBaseUrl("https://api.example.com/api///", { isProduction: true, isDevelopment: false }),
    "https://api.example.com/api"
  );
});

test("accepts a configured /api base without adding another /api", () => {
  assert.equal(
    resolveApiBaseUrl("https://api.example.com/api", { isProduction: true, isDevelopment: false }),
    "https://api.example.com/api"
  );
});
