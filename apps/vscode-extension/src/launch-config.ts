export type LaunchChoice =
  | { command: string; label: string; mode: "script"; script: string }
  | { label: string; mode: "port"; port: number };

export interface ProjectScripts {
  packageManager: "bun" | "npm" | "pnpm" | "yarn";
  scripts: string[];
}

const SAFE_SCRIPT_NAME = /^[A-Za-z0-9:_-]+$/;
const WHITESPACE = /\s+/;

export function commandForScript(
  packageManager: ProjectScripts["packageManager"],
  script: string
): string {
  if (!SAFE_SCRIPT_NAME.test(script)) {
    throw new Error(`不安全的 package.json 脚本名称：${script}`);
  }
  return `${packageManager} run ${script}`;
}

export function editorUrl(port: number): string {
  return `http://localhost:${port}/?fix=fill-auto-open#`;
}

export function isManagedAirshipCommand(
  command: string,
  port: number
): boolean {
  const tokens = command.trim().split(WHITESPACE);
  const portFlag = tokens.lastIndexOf("--port");
  const hasPort = portFlag >= 0 && tokens[portFlag + 1] === String(port);
  const hasCliEntry = tokens.some(
    (token) =>
      token.endsWith("apps/cli/dist/index.js") ||
      token.endsWith("dist/runtime/dist/index.js")
  );
  return hasPort && hasCliEntry;
}

export function validPort(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1024 &&
    value <= 65_535
  );
}
