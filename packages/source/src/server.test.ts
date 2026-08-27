/**
 * Turning what the browser reports into a path on disk.
 *
 * The input is a dev-server URL path, not a filesystem path, and the two look
 * alike enough to be confused: `/src/App.tsx` is rooted as far as `resolve` is
 * concerned. Getting it wrong is quiet — the agent is handed context from the
 * wrong file, or none at all — so the cases are pinned here.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveServerSource } from "./server";

/** Native separators to URL ones, and the leading slash a URL path drops. */
const BACKSLASH = /\\/g;
const LEADING_SLASH = /^\//;

let cwd: string;

beforeEach(() => {
  cwd = mkdtempSync(join(tmpdir(), "airship-source-test-"));
  mkdirSync(join(cwd, "src"), { recursive: true });
  writeFileSync(join(cwd, "src", "App.tsx"), "const App = () => null;\n");
});

afterEach(() => {
  rmSync(cwd, { force: true, recursive: true });
});

const resolveFile = (file: string, line = 1) =>
  resolveServerSource(cwd, { source: { file, line } })?.file;

describe("resolveServerSource", () => {
  it("resolves a dev-server URL path against the project root", () => {
    expect(resolveFile("/src/App.tsx")).toBe("src/App.tsx");
  });

  it("resolves a project-relative path", () => {
    expect(resolveFile("src/App.tsx")).toBe("src/App.tsx");
  });

  it("resolves a genuinely absolute path inside the project", () => {
    expect(resolveFile(join(cwd, "src", "App.tsx"))).toBe("src/App.tsx");
  });

  it("resolves a /@fs/ path, which Vite uses for files outside its root", () => {
    // Built the way Vite builds it — `/@fs/` followed by the absolute path in
    // URL form: forward slashes, and no leading slash of its own. On POSIX that
    // reads `/@fs/Users/…`, on Windows `/@fs/C:/Users/…`, so the remainder has
    // a leading slash to restore in one case and a drive letter in the other.
    const abs = join(cwd, "src", "App.tsx");
    const url = `/@fs/${abs.replace(BACKSLASH, "/").replace(LEADING_SLASH, "")}`;
    expect(resolveFile(url)).toBe("src/App.tsx");
  });

  it("reports the path unchanged when the file cannot be located", () => {
    expect(resolveFile("/src/Missing.tsx")).toBe("/src/Missing.tsx");
  });

  it("attaches surrounding source as context once it locates the file", () => {
    const resolved = resolveServerSource(cwd, {
      source: { file: "/src/App.tsx", line: 1 },
    });
    expect(resolved?.context).toContain("const App");
  });

  it("emits forward slashes for a nested path", () => {
    // This value goes into the edit prompt, into the JSON an MCP tool returns
    // (where a backslash arrives doubled) and into the overlay as a label.
    mkdirSync(join(cwd, "src", "components"), { recursive: true });
    writeFileSync(join(cwd, "src", "components", "Button.tsx"), "x\n");
    const file = resolveFile("/src/components/Button.tsx");
    expect(file).toBe("src/components/Button.tsx");
    expect(file).not.toContain("\\");
  });

  it("uses an image src to distinguish otherwise identical icons", () => {
    writeFileSync(
      join(cwd, "index.html"),
      [
        '<img class="nav-item-icon" src="./assets/model-tune.svg" alt="" />',
        '<img class="nav-item-icon" src="./assets/dataset.svg" alt="" />',
      ].join("\n")
    );

    const resolved = resolveServerSource(cwd, {
      element: {
        attributes: { src: "./assets/dataset.svg" },
        classes: ["nav-item-icon"],
        displayName: null,
        tagName: "img",
        textPreview: "",
      },
    });

    expect(resolved).toMatchObject({ file: "index.html", line: 2 });
    expect(resolved?.context).toContain("./assets/dataset.svg");
  });

  it("does not guess when identical elements have no distinguishing signal", () => {
    writeFileSync(
      join(cwd, "index.html"),
      [
        '<img class="nav-item-icon" src="./assets/first.svg" alt="" />',
        '<img class="nav-item-icon" src="./assets/second.svg" alt="" />',
      ].join("\n")
    );

    const resolved = resolveServerSource(cwd, {
      element: {
        classes: ["nav-item-icon"],
        displayName: null,
        tagName: "img",
        textPreview: "",
      },
    });

    expect(resolved).toBeNull();
  });
});
