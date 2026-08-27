import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const artifacts = resolve(root, "../..", "artifacts");
const filename = `映证-Verlay-Chrome扩展-v${pkg.version}.zip`;
const archive = join(artifacts, filename);
const webDownloads = resolve(root, "..", "web", "public", "downloads");
const webArchive = join(webDownloads, filename);

mkdirSync(artifacts, { recursive: true });
rmSync(archive, { force: true });

const result = spawnSync("zip", ["-q", "-r", archive, "."], {
  cwd: join(root, "dist"),
  encoding: "utf8",
});

if (result.status !== 0) {
  throw new Error(result.stderr || "zip packaging failed");
}

mkdirSync(webDownloads, { recursive: true });
copyFileSync(archive, webArchive);

console.log(`Packaged ${archive}`);
console.log(`Copied website download to ${webArchive}`);
