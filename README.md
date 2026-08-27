# 映证 Verlay

映证 Verlay 是一套面向本地前端项目的可视化 UI 编辑工作流。你可以直接在正在运行的网页上选中元素，像使用设计工具一样调整间距、字体、填充、描边、圆角和阴影；确认修改后，VS Code 中的 Codex 会把结构化变更安全写回真实源码，并自动检查构建状态与页面结果。

整个过程基于本地开发环境运行，不需要迁移项目，也不需要维护一份脱离源码的在线副本。从页面点选、修改预览到代码写回和结果验证，都在同一条工作流中完成。

[产品介绍页](https://daaaayuuuu.github.io/verlay/) · [下载安装包](https://github.com/daaaayuuuu/verlay/releases/latest)

![映证 Verlay 产品界面](media/verlay-cover.png)

![映证 Verlay Codex 写回结果](media/verlay-codex-result.png)

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
