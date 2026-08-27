import {
  chmodSync,
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const extensionRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = resolve(extensionRoot, "../..");
const pkg = JSON.parse(
  readFileSync(join(extensionRoot, "package.json"), "utf8")
);
const artifacts = join(workspaceRoot, "artifacts");
const kitName = `映证-Verlay-测试环境安装包-v${pkg.version}`;
const kitRoot = join(artifacts, kitName);
const extensionDir = join(kitRoot, "浏览器扩展");
const helperDir = join(kitRoot, "本地助手");
const extensionArchive = join(
  artifacts,
  `映证-Verlay-Chrome扩展-v${pkg.version}.zip`
);
const outputArchive = join(artifacts, `${kitName}.zip`);

rmSync(kitRoot, { force: true, recursive: true });
rmSync(outputArchive, { force: true });
mkdirSync(extensionDir, { recursive: true });
mkdirSync(helperDir, { recursive: true });

copyFileSync(extensionArchive, join(extensionDir, basename(extensionArchive)));

const pack = spawnSync(
  "corepack",
  [
    "pnpm",
    "--filter",
    "@airshiplabs/cli",
    "pack",
    "--pack-destination",
    helperDir,
  ],
  { cwd: workspaceRoot, encoding: "utf8" }
);
if (pack.status !== 0) {
  throw new Error(pack.stderr || pack.stdout || "local helper packaging failed");
}

cpSync(join(extensionRoot, "test-kit"), kitRoot, { recursive: true });
chmodSync(join(kitRoot, "安装与启动.command"), 0o755);

const zip = spawnSync("zip", ["-q", "-r", outputArchive, kitName], {
  cwd: artifacts,
  encoding: "utf8",
});
if (zip.status !== 0) {
  throw new Error(zip.stderr || "test kit zip failed");
}

const webDownloads = join(workspaceRoot, "apps", "web", "public", "downloads");
mkdirSync(webDownloads, { recursive: true });
copyFileSync(outputArchive, join(webDownloads, `${kitName}.zip`));

console.log(`Packaged test kit ${outputArchive}`);
