# 映证 Verlay

在本地网页上直接点选和调整 UI，由 VS Code 中的 Codex 安全写回源码，并自动验证修改结果。

[产品介绍页](https://daaaayuuuu.github.io/verlay/) · [下载安装包](https://github.com/daaaayuuuu/verlay/releases/latest)

![映证 Verlay 产品界面](media/verlay-cover.png)

## 开始使用

当前版本需要同时安装 Chrome 扩展和 VS Code 扩展：

1. 从 [Releases](https://github.com/daaaayuuuu/verlay/releases/latest) 下载两个安装包。
2. 在 `chrome://extensions/` 开启开发者模式，加载解压后的 Chrome 扩展。
3. 在 VS Code 扩展页右上角菜单选择“从 VSIX 安装…”，安装 VSIX 文件。
4. 在 VS Code 中打开网页项目，并从状态栏启动映证。

## 本地开发

需要 Node.js 22.13+ 和 pnpm 11。

```bash
corepack pnpm install
corepack pnpm --filter @airship/web dev
```

构建产品介绍页：

```bash
corepack pnpm --filter @airship/web build
```

## 项目结构

- `apps/web`：产品介绍页与下载入口
- `apps/extension`：Chrome 扩展
- `apps/vscode-extension`：VS Code 扩展
- `apps/cli`：本地代理与启动入口
- `packages/overlay`：页面编辑器与 Codex 助手 UI
- `packages/protocol`：客户端与本地服务之间的协议

## 致谢与许可

映证基于 [Airship](https://github.com/0xnyn/airship) 持续开发，并保留原项目的 MIT 许可与署名。详见 [LICENSE](LICENSE)。
