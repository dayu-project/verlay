/**
 * Chrome-extension entrypoint.
 *
 * Unlike the proxy entry, this bundle is injected into the active tab's
 * isolated extension world after the user clicks the toolbar action. It mounts
 * the inline editor directly over the existing document, so opening Verlay
 * never replaces the page with whatever app the local proxy happens to target.
 */
import type { AirshipWindowConfig } from "@airship/protocol";
import { boot } from "./app";
import { installRuntimeErrorCapture } from "./runtime-errors";

interface ExtensionRuntime {
  onMessage: {
    addListener(
      listener: (message: { type?: string }) => void
    ): void;
  };
}

interface ExtensionWindow extends Window {
  __AIRSHIP__?: AirshipWindowConfig;
  __airshipDestroy?: () => void;
  __verlayExtensionInstalled?: boolean;
}

const extensionWindow = window as ExtensionWindow;
const runtime = (
  globalThis as typeof globalThis & {
    chrome?: { runtime?: ExtensionRuntime };
  }
).chrome?.runtime;

function toggle(): void {
  if (extensionWindow.__airshipDestroy) {
    const destroy = extensionWindow.__airshipDestroy;
    extensionWindow.__airshipDestroy = undefined;
    destroy();
    return;
  }

  extensionWindow.__AIRSHIP__ = {
    mode: "inline",
    pathname: `${location.pathname}${location.search}${location.hash}`,
    wsPath: "extension://verlay-control",
  };
  boot();
}

if (!(extensionWindow.__verlayExtensionInstalled || !runtime)) {
  extensionWindow.__verlayExtensionInstalled = true;
  installRuntimeErrorCapture();
  runtime.onMessage.addListener((message) => {
    if (message?.type === "VERLAY_TOGGLE") {
      toggle();
    }
  });
}
