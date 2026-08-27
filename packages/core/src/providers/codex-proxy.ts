import { execFileSync } from "node:child_process";

const PROXY_ENV_KEYS = [
  "HTTP_PROXY",
  "HTTPS_PROXY",
  "ALL_PROXY",
  "http_proxy",
  "https_proxy",
  "all_proxy",
] as const;
const PROXY_HOST_PATTERN = /^[a-zA-Z0-9._:-]+$/;

function stringEnvironment(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(
      (entry): entry is [string, string] => entry[1] !== undefined
    )
  );
}

function proxyValue(output: string, key: string): string | undefined {
  const match = output.match(new RegExp(`^\\s*${key}\\s*:\\s*(.+?)\\s*$`, "m"));
  return match?.[1];
}

export function macSystemProxy(output: string): string | undefined {
  const enabled = proxyValue(output, "HTTPSEnable");
  const host = proxyValue(output, "HTTPSProxy");
  const portText = proxyValue(output, "HTTPSPort");
  if (enabled !== "1" || !host || !portText) {
    return undefined;
  }

  const port = Number(portText);
  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535 ||
    !PROXY_HOST_PATTERN.test(host)
  ) {
    return undefined;
  }

  const formattedHost = host.includes(":") ? `[${host}]` : host;
  return `http://${formattedHost}:${port}`;
}

function readMacSystemProxy(): string | undefined {
  try {
    return macSystemProxy(
      execFileSync("/usr/sbin/scutil", ["--proxy"], {
        encoding: "utf8",
        timeout: 1000,
      })
    );
  } catch {
    return undefined;
  }
}

/**
 * Codex runs as a child process, so it cannot see macOS proxy settings unless
 * they are represented as environment variables. Preserve explicit env
 * configuration, otherwise bridge the active system HTTPS proxy into the
 * child. The bridge is intentionally Codex-only and leaves Airship itself
 * untouched.
 */
export function codexEnvironment(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  systemProxy: () => string | undefined = readMacSystemProxy
): Record<string, string> {
  const result = stringEnvironment(env);
  if (PROXY_ENV_KEYS.some((key) => result[key])) {
    return result;
  }
  if (platform !== "darwin") {
    return result;
  }

  const proxy = systemProxy();
  if (proxy) {
    result.HTTP_PROXY = proxy;
    result.HTTPS_PROXY = proxy;
    result.http_proxy = proxy;
    result.https_proxy = proxy;
  }
  return result;
}
