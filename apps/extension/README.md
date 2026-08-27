# 映证 Verlay Chrome 扩展

这是映证的本机 Codex 桥接版。Chrome 扩展负责网页元素点选与交互，本机 Airship CLI 负责复用用户现有的 Codex 登录，并直接修改 VS Code 当前打开的同一项目目录。

## 最终链路

```text
Chrome 网页 + 映证扩展
  → ws://127.0.0.1:5175/__airship/ws
  → 本机 Airship CLI
  → @openai/codex-sdk / codex exec
  → CLI 启动目录中的源码
  → VS Code 文件监听 + 网页 HMR
```

不需要部署公网服务，不需要在扩展中填写或保存 OpenAI API Key，也不需要给扩展授权整个本地文件夹。

## 使用流程

1. 在 VS Code 打开网页项目，并确保 Codex 已经登录；如果没有，先运行 `codex login`。
2. 正常启动项目的开发服务器，例如 `pnpm dev`，记下网页端口。
3. 在同一个项目根目录运行：

   ```bash
   npx @airshiplabs/cli --target 3000 --port 5175 --agent codex --safe
   ```

   把 `3000` 换成项目网页的真实端口。

4. 用 Chrome 打开项目网页并点击映证图标。
5. 选择元素、描述修改并发送。Codex 会写入 CLI 启动目录，VS Code 和开发服务器会自动看到变化。

插件固定连接 `127.0.0.1:5175`。同一时间只应有一个映证 CLI 占用该端口。

## 构建与打包

```bash
corepack pnpm package:extension
```

ZIP 输出到仓库根目录的 `artifacts/`。
