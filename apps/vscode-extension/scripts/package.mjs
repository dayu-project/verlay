import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(root, "../..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const artifacts = join(workspace, "artifacts");
const platform = `${process.platform}-${process.arch}`;
const filename = `映证-Verlay-VSCode扩展-v${pkg.version}-${platform}.vsix`;
const output = join(artifacts, filename);

mkdirSync(artifacts, { recursive: true });

for (const [command, args, cwd] of [
  ["corepack", ["pnpm", "--filter", "@airshiplabs/cli", "build"], workspace],
  [
    "corepack",
    ["pnpm", "--filter", "./apps/vscode-extension", "build"],
    workspace,
  ],
  ["corepack", ["pnpm", "install", "--offline"], workspace],
  [
    join(root, "node_modules", ".bin", "vsce"),
    [
      "package",
      "--target",
      platform,
      "--no-dependencies",
      "--out",
      output,
    ],
    root,
  ],
]) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed`);
  }
}

console.log(`Packaged ${output}`);
