import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const workspace = resolve(root, "../..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const chromePkg = JSON.parse(
  readFileSync(join(workspace, "apps", "extension", "package.json"), "utf8")
);
const artifacts = join(workspace, "artifacts");
const platform = `${process.platform}-${process.arch}`;
const kitName = `映证-Verlay-VSCode与Chrome安装包-v${pkg.version}-${platform}`;
const kit = join(artifacts, kitName);
const archive = `${kit}.zip`;

rmSync(kit, { force: true, recursive: true });
rmSync(archive, { force: true });
mkdirSync(kit, { recursive: true });

copyFileSync(
  join(artifacts, `映证-Verlay-VSCode扩展-v${pkg.version}-${platform}.vsix`),
  join(kit, "映证-Verlay-VSCode扩展.vsix")
);
copyFileSync(
  join(artifacts, `映证-Verlay-Chrome扩展-v${chromePkg.version}.zip`),
  join(kit, "映证-Verlay-Chrome扩展.zip")
);
writeFileSync(
  join(kit, "安装说明.txt"),
  "映证 Verlay 第一阶段安装包\n\n1. 安装 VS Code 扩展\n   - 打开 VS Code 的扩展页面。\n   - 点击右上角“…”菜单，选择“从 VSIX 安装…”。\n   - 选择“映证-Verlay-VSCode扩展.vsix”。\n\n2. 安装 Chrome 扩展\n   - 解压“映证-Verlay-Chrome扩展.zip”。\n   - Chrome 打开 chrome://extensions/。\n   - 开启开发者模式，选择“加载已解压的扩展程序”。\n\n3. 使用\n   - 确保 Codex 已登录。\n   - 在 VS Code 打开网页项目。\n   - 点击底部“启动映证”。\n   - 第一次选择已运行的网页端口或项目 dev 脚本；以后会自动记住。\n\n说明：此安装包内置 macOS Apple Silicon 运行时，不需要安装 Airship CLI。\n",
  "utf8"
);

const result = spawnSync("zip", ["-q", "-r", archive, kitName], {
  cwd: artifacts,
  encoding: "utf8",
});
if (result.status !== 0) {
  throw new Error(result.stderr || "安装包压缩失败");
}
console.log(`Packaged ${archive}`);
