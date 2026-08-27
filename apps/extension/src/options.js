import { controlSocketUrl, DEFAULT_EDITOR_URL } from "./local-bridge.js";

const message = document.getElementById("message");
const testButton = document.getElementById("test-connection");

function setMessage(text, tone = "success") {
  message.dataset.tone = tone;
  message.textContent = text;
}

function testConnection() {
  const socketUrl = controlSocketUrl(DEFAULT_EDITOR_URL);
  if (!socketUrl) {
    setMessage("本机连接地址无效。", "error");
    return;
  }

  testButton.disabled = true;
  setMessage("正在连接本机映证服务…", "muted");
  const socket = new WebSocket(socketUrl);
  const timeout = setTimeout(() => {
    socket.close();
    testButton.disabled = false;
    setMessage("未找到本机服务，请在 VS Code 底部点击“启动映证”。", "error");
  }, 3500);

  socket.addEventListener("open", () => {
    clearTimeout(timeout);
    testButton.disabled = false;
    setMessage("连接成功：插件已连接本机 Codex 和当前项目。", "success");
    socket.close();
  });
  socket.addEventListener("error", () => {
    clearTimeout(timeout);
    testButton.disabled = false;
    setMessage("未找到本机服务，请在 VS Code 底部点击“启动映证”。", "error");
  });
}

testButton.addEventListener("click", testConnection);
