import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const required = [
  "manifest.json",
  "background.js",
  "content.js",
  "local-bridge.js",
  "options.html",
  "options.css",
  "options.js",
  "icons/icon-16.png",
  "icons/icon-32.png",
  "icons/icon-48.png",
  "icons/icon-64.png",
  "icons/icon-128.png",
  "安装说明.md",
];

for (const file of required) {
  if (!existsSync(join(dist, file))) {
    throw new Error(`missing extension artifact: ${file}`);
  }
}

const manifest = JSON.parse(readFileSync(join(dist, "manifest.json"), "utf8"));
if (manifest.manifest_version !== 3) {
  throw new Error("extension must use Manifest V3");
}
if (manifest.permissions.includes("<all_urls>")) {
  throw new Error("<all_urls> must not be requested");
}
if (
  JSON.stringify(manifest.host_permissions) !==
  JSON.stringify(["http://127.0.0.1/*", "http://localhost/*"])
) {
  throw new Error("extension host access must stay limited to localhost");
}
if (existsSync(join(dist, "offscreen.html"))) {
  throw new Error("cloud transport must not be packaged");
}
if (existsSync(join(dist, "repository.js"))) {
  throw new Error("browser-side repository writer must not be packaged");
}

const background = readFileSync(join(dist, "background.js"), "utf8");
if (
  !(background.includes("new WebSocket") && background.includes("local-bridge"))
) {
  throw new Error("extension must bridge the overlay to the local CLI");
}
if (background.includes("api/extension/edit")) {
  throw new Error("extension must not depend on the cloud edit endpoint");
}

console.log("Local Codex bridge extension validation passed");
