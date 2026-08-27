import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { FileDiff } from "@airship/protocol";
import { describe, expect, it } from "vitest";
import { discoverBuild, verifyScope } from "./verification";

function diff(file: string): FileDiff {
  return {
    additions: 1,
    deletions: 0,
    file,
    isDeleted: false,
    isNew: false,
    patch: "",
  };
}

describe("post-edit verification", () => {
  it("accepts only paths contained by the configured project", () => {
    const cwd = mkdtempSync(join(tmpdir(), "airship-verify-"));
    expect(verifyScope(cwd, [diff("src/app.tsx")]).status).toBe("passed");
    expect(verifyScope(cwd, [diff("../outside.ts")])).toMatchObject({
      kind: "scope",
      status: "failed",
    });
  });

  it("detects the declared package manager and build script", () => {
    const cwd = mkdtempSync(join(tmpdir(), "airship-verify-"));
    writeFileSync(
      join(cwd, "package.json"),
      JSON.stringify({
        packageManager: "pnpm@11.9.0",
        scripts: { build: "vite build" },
      })
    );
    expect(discoverBuild(cwd)).toEqual({
      args: ["run", "build"],
      command: "pnpm",
      label: "pnpm run build",
    });
  });

  it("uses an explicit verification command even without package.json", () => {
    const cwd = mkdtempSync(join(tmpdir(), "airship-verify-"));
    expect(discoverBuild(cwd, "npm run check")).toEqual({
      args: [],
      command: "npm run check",
      label: "npm run check",
      shell: true,
    });
  });
});
