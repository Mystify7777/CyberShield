import test from "node:test";
import assert from "node:assert/strict";
import { getAssetUrl } from "./assetUrl.js";

test("returns an empty string for missing asset paths", () => {
  assert.equal(getAssetUrl(""), "");
  assert.equal(getAssetUrl(null), "");
  assert.equal(getAssetUrl("   "), "");
});

test("keeps absolute HTTP(S) asset URLs unchanged", () => {
  assert.equal(getAssetUrl("https://cdn.example.com/image.jpg"), "https://cdn.example.com/image.jpg");
  assert.equal(getAssetUrl("http://cdn.example.com/image.jpg"), "http://cdn.example.com/image.jpg");
});

test("resolves backend asset paths from the frontend origin", () => {
  assert.equal(getAssetUrl("/uploads/image.jpg"), "/uploads/image.jpg");
  assert.equal(getAssetUrl("uploads/image.jpg"), "/uploads/image.jpg");
});

test("rejects protocol-relative and non-HTTP schemes", () => {
  assert.equal(getAssetUrl("//evil.example/image.jpg"), "");
  assert.equal(getAssetUrl("javascript:alert(1)"), "");
  assert.equal(getAssetUrl("data:image/svg+xml;base64,abc"), "");
});
