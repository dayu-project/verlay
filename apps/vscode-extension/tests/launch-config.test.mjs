import assert from "node:assert/strict";
import test from "node:test";

const modulePromise = import("../dist/launch-config.mjs");

test("builds package-manager script commands", async () => {
  const { commandForScript } = await modulePromise;
  assert.equal(commandForScript("pnpm", "dev"), "pnpm run dev");
  assert.equal(commandForScript("npm", "start:web"), "npm run start:web");
});

test("rejects shell syntax in script names", async () => {
  const { commandForScript } = await modulePromise;
  assert.throws(() => commandForScript("npm", "dev; touch /tmp/no"));
});

test("builds the stable Chrome editor URL", async () => {
  const { editorUrl } = await modulePromise;
  assert.equal(editorUrl(5175), "http://localhost:5175/?fix=fill-auto-open#");
});

test("recognizes only an Airship process bound to the requested port", async () => {
  const { isManagedAirshipCommand } = await modulePromise;
  assert.equal(
    isManagedAirshipCommand(
      "node apps/cli/dist/index.js --target 8080 --port 5175 --agent codex",
      5175
    ),
    true
  );
  assert.equal(
    isManagedAirshipCommand("node unrelated.js --port 5175", 5175),
    false
  );
  assert.equal(
    isManagedAirshipCommand("node apps/cli/dist/index.js --port 5190", 5175),
    false
  );
});

test("validates user-facing ports", async () => {
  const { validPort } = await modulePromise;
  assert.equal(validPort(5175), true);
  assert.equal(validPort(80), false);
  assert.equal(validPort(65_536), false);
  assert.equal(validPort("5175"), false);
});
