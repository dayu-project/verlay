import assert from "node:assert/strict";
import test from "node:test";
import { isRepositorySource, safeRepositoryPath } from "../src/repository.js";

test("safeRepositoryPath rejects traversal and absolute paths", () => {
  assert.equal(safeRepositoryPath("src/App.tsx"), "src/App.tsx");
  assert.equal(safeRepositoryPath("./src/App.tsx"), "src/App.tsx");
  assert.equal(safeRepositoryPath("../secret.txt"), null);
  assert.equal(safeRepositoryPath("/etc/passwd"), null);
  assert.equal(safeRepositoryPath("src//App.tsx"), null);
});

test("repository scan includes source while excluding build output and secrets", () => {
  assert.equal(isRepositorySource("src/App.tsx"), true);
  assert.equal(isRepositorySource("styles/app.css"), true);
  assert.equal(isRepositorySource("node_modules/pkg/index.js"), false);
  assert.equal(isRepositorySource("dist/app.js"), false);
  assert.equal(isRepositorySource(".env.local"), false);
  assert.equal(isRepositorySource("certs/private.key"), false);
});
