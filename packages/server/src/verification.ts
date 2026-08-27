/**
 * Post-write verification for one agent turn.
 *
 * This module is intentionally independent of Git. It only decides whether the
 * edit is safe to keep; the server owns the transactional restore because it
 * already owns the exact before/after bundle for the turn.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import { isAbsolute, relative, resolve } from "node:path";
import type {
  FileDiff,
  JobVerification,
  VerificationCheck,
} from "@airship/protocol";

const OUTPUT_LIMIT = 12_000;

export interface VerificationOptions {
  /** A user-supplied build/check command. Empty means auto-detect `build`. */
  command?: string;
  cwd: string;
  pagePath?: string;
  targetHost: string;
  targetPort: number;
  timeoutMs?: number;
}

interface CommandSpec {
  args: string[];
  command: string;
  label: string;
  shell?: boolean;
}

function outputTail(value: string): string {
  return value.length <= OUTPUT_LIMIT
    ? value
    : `…${value.slice(value.length - OUTPUT_LIMIT)}`;
}

/** A repo-relative diff path must still resolve inside the configured cwd. */
export function verifyScope(cwd: string, diffs: FileDiff[]): VerificationCheck {
  const root = resolve(cwd);
  const escaped = diffs
    .map((diff) => diff.file)
    .filter((file) => {
      const rel = relative(root, resolve(root, file));
      return (
        rel === ".." ||
        rel.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
        isAbsolute(rel)
      );
    });
  return escaped.length
    ? {
        detail: `Files outside the project: ${escaped.join(", ")}`,
        kind: "scope",
        status: "failed",
      }
    : {
        detail: `${diffs.length} changed file${diffs.length === 1 ? "" : "s"} stayed inside the project`,
        kind: "scope",
        status: "passed",
      };
}

function packageJson(
  cwd: string
): { packageManager?: string; scripts?: Record<string, string> } | null {
  const file = resolve(cwd, "package.json");
  if (!existsSync(file)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(file, "utf8")) as {
      packageManager?: string;
      scripts?: Record<string, string>;
    };
  } catch {
    return null;
  }
}

/** The least-surprising package runner for an existing build script. */
export function discoverBuild(
  cwd: string,
  override?: string
): CommandSpec | null {
  if (override?.trim()) {
    return {
      args: [],
      command: override.trim(),
      label: override.trim(),
      shell: true,
    };
  }
  const pkg = packageJson(cwd);
  if (!pkg?.scripts?.build) {
    return null;
  }
  let runner = pkg.packageManager?.split("@")[0];
  if (!runner && existsSync(resolve(cwd, "pnpm-lock.yaml"))) {
    runner = "pnpm";
  } else if (!runner && existsSync(resolve(cwd, "yarn.lock"))) {
    runner = "yarn";
  } else if (
    !runner &&
    (existsSync(resolve(cwd, "bun.lockb")) ||
      existsSync(resolve(cwd, "bun.lock")))
  ) {
    runner = "bun";
  }
  runner ??= "npm";
  return {
    args: ["run", "build"],
    command: runner,
    label: `${runner} run build`,
  };
}

function runBuild(
  cwd: string,
  spec: CommandSpec | null,
  timeoutMs: number
): Promise<VerificationCheck> {
  if (!spec) {
    return Promise.resolve({
      detail: "No build script was found",
      kind: "build",
      status: "skipped",
    });
  }
  return new Promise((resolveCheck) => {
    let output = "";
    let settled = false;
    const child = spawn(spec.command, spec.args, {
      cwd,
      env: process.env,
      shell: spec.shell ?? false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    const finish = (check: VerificationCheck): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolveCheck(check);
    };
    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("error", (error) => {
      finish({
        detail: `${spec.label}: ${error.message}`,
        kind: "build",
        status: "failed",
      });
    });
    child.on("close", (code, signal) => {
      finish({
        detail: outputTail(
          `${spec.label} ${code === 0 ? "passed" : `exited ${code ?? signal ?? "unknown"}`}${output.trim() ? `\n${output.trim()}` : ""}`
        ),
        kind: "build",
        status: code === 0 ? "passed" : "failed",
      });
    });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      finish({
        detail: `${spec.label} exceeded ${Math.round(timeoutMs / 1000)}s`,
        kind: "build",
        status: "failed",
      });
    }, timeoutMs);
    timer.unref();
  });
}

function verifyPage(
  host: string,
  port: number,
  path: string,
  timeoutMs: number
): Promise<VerificationCheck> {
  return new Promise((resolveCheck) => {
    let settled = false;
    const finish = (check: VerificationCheck): void => {
      if (settled) {
        return;
      }
      settled = true;
      resolveCheck(check);
    };
    const req = http.get(
      { headers: { accept: "text/html" }, host, path, port },
      (res) => {
        res.resume();
        const status = res.statusCode ?? 0;
        finish({
          detail: `http://${host}:${port}${path} returned ${status}`,
          kind: "page",
          status: status >= 200 && status < 400 ? "passed" : "failed",
        });
      }
    );
    req.on("error", (error) =>
      finish({ detail: error.message, kind: "page", status: "failed" })
    );
    req.setTimeout(Math.min(timeoutMs, 10_000), () => {
      req.destroy();
      finish({
        detail: `Target page did not answer within ${Math.min(timeoutMs, 10_000) / 1000}s`,
        kind: "page",
        status: "failed",
      });
    });
  });
}

/** Run cheap safety first, then the expensive build, then prove the app lives. */
export async function verifyEdit(
  diffs: FileDiff[],
  options: VerificationOptions
): Promise<JobVerification> {
  const timeoutMs = options.timeoutMs ?? 120_000;
  const checks: VerificationCheck[] = [verifyScope(options.cwd, diffs)];
  if (checks[0].status !== "failed") {
    checks.push(
      await runBuild(
        options.cwd,
        discoverBuild(options.cwd, options.command),
        timeoutMs
      )
    );
  }
  if (!checks.some((check) => check.status === "failed")) {
    checks.push(
      await verifyPage(
        options.targetHost,
        options.targetPort,
        options.pagePath ?? "/",
        timeoutMs
      )
    );
  }
  return {
    checks,
    rolledBack: false,
    status: checks.some((check) => check.status === "failed")
      ? "failed"
      : "passed",
  };
}
