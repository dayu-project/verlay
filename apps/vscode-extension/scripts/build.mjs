import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(root, "../..");
const output = join(root, "dist");
const runtime = join(output, "runtime");
const cliEntry = join(workspace, "apps", "cli", "dist", "index.js");

if (!existsSync(cliEntry)) {
  throw new Error("映证 CLI 尚未构建，请先运行 CLI build。");
}

rmSync(output, { force: true, recursive: true });
mkdirSync(join(output, "runtime"), { recursive: true });
mkdirSync(join(root, "media"), { recursive: true });

await Promise.all([
  build({
    bundle: true,
    entryPoints: [join(root, "src", "extension.ts")],
    external: ["vscode"],
    format: "cjs",
    outfile: join(output, "extension.cjs"),
    platform: "node",
    sourcemap: true,
    target: "node20",
  }),
  build({
    bundle: true,
    entryPoints: [join(root, "src", "launch-config.ts")],
    format: "esm",
    outfile: join(output, "launch-config.mjs"),
    platform: "node",
    target: "node20",
  }),
]);

copyFileSync(
  join(workspace, "apps", "extension", "src", "icons", "icon-128.png"),
  join(root, "media", "icon.png")
);

const staging = mkdtempSync(join(tmpdir(), "verlay-vscode-runtime-"));
const deploy = spawnSync(
  "corepack",
  [
    "pnpm",
    "--filter",
    "@airshiplabs/cli",
    "deploy",
    "--prod",
    "--legacy",
    "--config.node-linker=hoisted",
    staging,
  ],
  {
    cwd: workspace,
    encoding: "utf8",
    env: { ...process.env, CI: "true", PNPM_CONFIRM_MODULES_PURGE: "false" },
    stdio: "pipe",
  }
);
if (deploy.status !== 0) {
  throw new Error(deploy.stderr || deploy.stdout || "映证运行时部署失败");
}

// VS Code 版只提供 Codex。保留 Claude SDK 的 JavaScript 入口以满足 CLI
// 启动时的静态 import，但去掉不会被调用的 290MB Claude 原生二进制。
rmSync(
  join(
    staging,
    "node_modules",
    "@anthropic-ai",
    "claude-agent-sdk-darwin-arm64"
  ),
  {
    force: true,
    recursive: true,
  }
);
rmSync(
  join(staging, "node_modules", "@anthropic-ai", "claude-agent-sdk-darwin-x64"),
  {
    force: true,
    recursive: true,
  }
);
rmSync(
  join(
    staging,
    "node_modules",
    "@anthropic-ai",
    "claude-agent-sdk-linux-arm64"
  ),
  {
    force: true,
    recursive: true,
  }
);
rmSync(
  join(staging, "node_modules", "@anthropic-ai", "claude-agent-sdk-linux-x64"),
  {
    force: true,
    recursive: true,
  }
);
rmSync(
  join(
    staging,
    "node_modules",
    "@anthropic-ai",
    "claude-agent-sdk-win32-arm64"
  ),
  {
    force: true,
    recursive: true,
  }
);
rmSync(
  join(staging, "node_modules", "@anthropic-ai", "claude-agent-sdk-win32-x64"),
  {
    force: true,
    recursive: true,
  }
);
rmSync(join(staging, "node_modules", ".bin"), {
  force: true,
  recursive: true,
});

cpSync(staging, runtime, { dereference: false, recursive: true });
rmSync(staging, { force: true, recursive: true });

console.log(`Built 映证 Verlay VS Code extension in ${output}`);
