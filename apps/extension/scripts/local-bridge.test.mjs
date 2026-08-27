import assert from "node:assert/strict";
import test from "node:test";
import { controlSocketUrl, DEFAULT_EDITOR_URL } from "../src/local-bridge.js";

test("maps the fixed local editor URL to the Airship control socket", () => {
  assert.equal(
    controlSocketUrl(DEFAULT_EDITOR_URL),
    "ws://127.0.0.1:5175/__airship/ws"
  );
  assert.equal(
    controlSocketUrl("http://localhost:5175/anything?x=1#hash"),
    "ws://localhost:5175/__airship/ws"
  );
});

test("rejects non-local and non-http endpoints", () => {
  assert.equal(controlSocketUrl("https://example.com"), null);
  assert.equal(controlSocketUrl("file:///tmp/project"), null);
  assert.equal(controlSocketUrl("not a URL"), null);
});
