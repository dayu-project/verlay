import { controlSocketUrl, DEFAULT_EDITOR_URL } from "./local-bridge.js";

const extensionApi = globalThis.chrome;
const HTTP_PAGE_PATTERN = /^https?:/;
const KEEPALIVE_MS = 20_000;

extensionApi.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    extensionApi.runtime.openOptionsPage();
  }
});

extensionApi.action.onClicked.addListener(async (tab) => {
  if (!(tab.id && tab.url && HTTP_PAGE_PATTERN.test(tab.url))) {
    return;
  }

  try {
    await extensionApi.tabs.sendMessage(tab.id, { type: "VERLAY_TOGGLE" });
  } catch {
    await extensionApi.scripting.executeScript({
      files: ["content.js"],
      target: { tabId: tab.id },
    });
    await extensionApi.tabs.sendMessage(tab.id, { type: "VERLAY_TOGGLE" });
  }
});

extensionApi.runtime.onConnect.addListener((port) => {
  if (port.name !== "verlay-airship-control") {
    return;
  }

  let socket = null;
  let reconnectTimer = 0;
  let keepaliveTimer = 0;
  let disposed = false;
  const queued = [];
  const socketUrl = controlSocketUrl(DEFAULT_EDITOR_URL);

  const report = (open, reason) => {
    try {
      port.postMessage({
        channel: "verlay:status",
        detail: {
          endpoint: DEFAULT_EDITOR_URL,
          mode: "local-codex-cli",
          reason,
        },
        open,
      });
    } catch {
      // The page closed between the state change and this message.
    }
  };

  const stopKeepalive = () => {
    clearInterval(keepaliveTimer);
    keepaliveTimer = 0;
  };

  const startKeepalive = () => {
    stopKeepalive();
    keepaliveTimer = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "history" }));
      }
    }, KEEPALIVE_MS);
  };

  const connect = () => {
    if (!(socketUrl && !disposed)) {
      report(false, "invalid-local-endpoint");
      return;
    }

    socket = new WebSocket(socketUrl);
    socket.addEventListener("open", () => {
      report(true);
      startKeepalive();
      for (const payload of queued.splice(0)) {
        socket.send(JSON.stringify(payload));
      }
    });
    socket.addEventListener("message", (event) => {
      try {
        port.postMessage({
          channel: "verlay:server",
          payload: JSON.parse(event.data),
        });
      } catch {
        // Ignore malformed daemon events or a tab that has just closed.
      }
    });
    socket.addEventListener("close", () => {
      socket = null;
      stopKeepalive();
      report(false, "local-cli-unavailable");
      if (!disposed) {
        reconnectTimer = setTimeout(connect, 1500);
      }
    });
    socket.addEventListener("error", () => socket?.close());
  };

  port.onMessage.addListener((message) => {
    if (message?.channel !== "verlay:client" || !message.payload) {
      return;
    }
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message.payload));
      return;
    }
    if (queued.length >= 100) {
      queued.shift();
    }
    queued.push(message.payload);
  });
  port.onDisconnect.addListener(() => {
    disposed = true;
    clearTimeout(reconnectTimer);
    stopKeepalive();
    socket?.close();
    socket = null;
  });

  connect();
});
