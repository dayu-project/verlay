import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "src");
const output = join(root, "dist");
const overlayBundle = join(root, "..", "..", "packages", "overlay", "dist", "extension.global.js");
const manifest = JSON.parse(readFileSync(join(source, "manifest.json"), "utf8"));
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

if (manifest.version !== pkg.version) {
  throw new Error(
    `manifest version ${manifest.version} does not match package version ${pkg.version}`
  );
}

rmSync(output, { force: true, recursive: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });
if (!existsSync(overlayBundle)) {
  throw new Error(`missing extension overlay bundle: ${overlayBundle}`);
}
copyFileSync(overlayBundle, join(output, "content.js"));

console.log(`Built 映证 Verlay Chrome extension ${pkg.version} in ${output}`);
