/** Runtime failures captured in each app realm for post-edit verification. */

const KEY = "__airshipRuntimeErrors";
const LIMIT = 40;

interface RuntimeErrorStore {
  errors: string[];
  installed: boolean;
}

type RuntimeWindow = Window & typeof globalThis & { [KEY]?: RuntimeErrorStore };

function text(value: unknown): string {
  if (value instanceof Error) {
    return value.stack || value.message;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function push(store: RuntimeErrorStore, message: string): void {
  if (!message || message.includes("__airship")) {
    return;
  }
  store.errors.push(message.slice(0, 2000));
  if (store.errors.length > LIMIT) {
    store.errors.splice(0, store.errors.length - LIMIT);
  }
}

/** Install before DOMContentLoaded so app startup errors are observable. */
export function installRuntimeErrorCapture(
  win: RuntimeWindow = window as RuntimeWindow
): void {
  const existing = win[KEY];
  if (existing?.installed) {
    return;
  }
  const store: RuntimeErrorStore = existing ?? { errors: [], installed: true };
  store.installed = true;
  win[KEY] = store;
  const original = win.console.error.bind(win.console);
  win.console.error = (...args: unknown[]) => {
    push(store, args.map(text).join(" "));
    original(...args);
  };
  win.addEventListener("error", (event) => {
    push(store, event.error ? text(event.error) : event.message);
  });
  win.addEventListener("unhandledrejection", (event) => {
    push(store, `Unhandled rejection: ${text(event.reason)}`);
  });
}

export function clearRuntimeErrors(win: Window = window): void {
  ((win as RuntimeWindow)[KEY]?.errors ?? []).splice(0);
}

export function runtimeErrors(win: Window = window): string[] {
  return [...((win as RuntimeWindow)[KEY]?.errors ?? [])];
}
