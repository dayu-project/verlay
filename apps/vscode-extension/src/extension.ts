import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { request } from "node:http";
import { basename, join } from "node:path";
// VS Code's extension API is conventionally consumed as a namespace.
// biome-ignore lint/performance/noNamespaceImport: keeps API types and values readable
import * as vscode from "vscode";
import {
  commandForScript,
  editorUrl,
  isManagedAirshipCommand,
  type LaunchChoice,
  type ProjectScripts,
  validPort,
} from "./launch-config.js";

const CHOICE_KEY = "verlay.launchChoice";
const ACTIVE_SERVICE_KEY = "verlay.activeService";
const COMMON_PORTS = [3000, 3001, 3100, 3102, 4173, 5173, 5174, 8080];
const SCRIPT_PRIORITY = ["dev", "start", "serve", "preview"];
const WHITESPACE = /\s+/;

interface RuntimeInfo {
  url: string;
}

interface ActiveService {
  pid: number;
  port: number;
  root: string;
}

interface ProjectRoot {
  name: string;
  path: string;
}

class VerlayController implements vscode.Disposable {
  private readonly context: vscode.ExtensionContext;
  private readonly output = vscode.window.createOutputChannel("映证 Verlay");
  private readonly status = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    90
  );
  private child: ChildProcess | null = null;
  private currentUrl: string | null = null;
  private starting = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.renderStatus();
    this.status.show();
  }

  async start(forceConfigure = false): Promise<void> {
    if (this.child || this.starting) {
      if (this.currentUrl) {
        await this.open(this.currentUrl);
      }
      return;
    }

    const project = await this.pickProjectRoot();
    if (!project) {
      return;
    }

    this.starting = true;
    this.renderStatus();
    try {
      const key = `${CHOICE_KEY}:${project.path}`;
      let choice = forceConfigure
        ? undefined
        : this.context.workspaceState.get<LaunchChoice>(key);
      if (!choice) {
        choice = await this.chooseLaunch(project.path);
        if (!choice) {
          return;
        }
        await this.context.workspaceState.update(key, choice);
      }
      await this.launch(project, choice);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.output.appendLine(`\n启动失败：${message}`);
      this.output.show(true);
      await vscode.window.showErrorMessage(`映证启动失败：${message}`);
    } finally {
      this.starting = false;
      this.renderStatus();
    }
  }

  async configure(): Promise<void> {
    if (this.child) {
      const answer = await vscode.window.showWarningMessage(
        "重新配置会先停止当前映证服务。",
        { modal: true },
        "继续"
      );
      if (answer !== "继续") {
        return;
      }
      await this.stop();
    }
    await this.start(true);
  }

  async stop(): Promise<void> {
    const { child } = this;
    this.child = null;
    this.currentUrl = null;
    if (child && child.exitCode === null) {
      child.kill("SIGINT");
      await new Promise<void>((resolve) => {
        const timer = setTimeout(() => {
          if (child.exitCode === null) {
            child.kill("SIGTERM");
          }
          resolve();
        }, 3000);
        child.once("exit", () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
    this.output.appendLine("映证服务已停止。\n");
    this.renderStatus();
  }

  async open(url = this.currentUrl): Promise<void> {
    if (!url) {
      await vscode.window.showInformationMessage("请先启动映证。");
      return;
    }
    const preferChrome = vscode.workspace
      .getConfiguration("verlay")
      .get<boolean>("openInChrome", true);
    if (preferChrome && (await this.tryChrome(url))) {
      return;
    }
    await vscode.env.openExternal(vscode.Uri.parse(url));
  }

  dispose(): void {
    if (this.child?.exitCode === null) {
      this.child.kill("SIGINT");
    }
    this.child = null;
    this.output.dispose();
    this.status.dispose();
  }

  private async pickProjectRoot(): Promise<ProjectRoot | undefined> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length === 0) {
      await vscode.window.showErrorMessage(
        "请先在 VS Code 中打开网页项目文件夹。"
      );
      return undefined;
    }
    if (folders.length === 1) {
      return this.resolveProjectRoot(folders[0]);
    }
    const picked = await vscode.window.showQuickPick(
      folders.map((folder) => ({
        description: folder.uri.fsPath,
        folder,
        label: folder.name,
      })),
      { placeHolder: "选择 Codex 要修改的项目仓库" }
    );
    return picked ? this.resolveProjectRoot(picked.folder) : undefined;
  }

  private async resolveProjectRoot(
    folder: vscode.WorkspaceFolder
  ): Promise<ProjectRoot | undefined> {
    const root = folder.uri.fsPath;
    if (this.looksLikeProject(root)) {
      return { name: folder.name, path: root };
    }

    const candidates = readdirSync(root, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules"
      )
      .map((entry) => ({
        name: entry.name,
        path: join(root, entry.name),
      }))
      .filter((entry) => this.looksLikeProject(entry.path));

    if (candidates.length > 0) {
      const picked = await vscode.window.showQuickPick(
        candidates.map((candidate) => ({
          candidate,
          description: candidate.path,
          label: `$(folder) ${candidate.name}`,
        })),
        {
          placeHolder:
            "当前打开的是父文件夹，请选择 Codex 真正要修改的代码仓库",
        }
      );
      return picked?.candidate;
    }

    const action = await vscode.window.showWarningMessage(
      "当前文件夹不像代码仓库。继续后 Codex 无法提供可靠的差异与撤销。",
      { modal: true },
      "仍然使用",
      "打开其他文件夹"
    );
    if (action === "打开其他文件夹") {
      await vscode.commands.executeCommand("vscode.openFolder");
      return undefined;
    }
    return action === "仍然使用"
      ? { name: folder.name, path: root }
      : undefined;
  }

  private looksLikeProject(root: string): boolean {
    return (
      existsSync(join(root, ".git")) || existsSync(join(root, "package.json"))
    );
  }

  private async chooseLaunch(root: string): Promise<LaunchChoice | undefined> {
    const [runningPorts, project] = await Promise.all([
      this.runningPorts(),
      Promise.resolve(this.projectScripts(root)),
    ]);
    type Item = vscode.QuickPickItem & { choice?: LaunchChoice; manual?: true };
    const items: Item[] = [];
    for (const port of runningPorts) {
      items.push({
        choice: { label: `已运行网页 :${port}`, mode: "port", port },
        description: `http://localhost:${port}`,
        label: `$(globe) 使用已运行网页 :${port}`,
      });
    }
    for (const script of project.scripts) {
      const command = commandForScript(project.packageManager, script);
      items.push({
        choice: {
          command,
          label: `自动运行 ${command}`,
          mode: "script",
          script,
        },
        description: command,
        label: `$(play) 自动启动 ${script}`,
      });
    }
    items.push({ label: "$(settings-gear) 手动输入网页端口", manual: true });

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: "首次使用：选择网页启动方式（以后会自动记住）",
    });
    if (!picked) {
      return undefined;
    }
    if (picked.choice) {
      return picked.choice;
    }
    const value = await vscode.window.showInputBox({
      placeHolder: "例如 3000",
      prompt: "输入已经运行的本地网页端口",
      validateInput(input) {
        const port = Number(input);
        return validPort(port) ? undefined : "请输入 1024 到 65535 之间的端口";
      },
    });
    if (!value) {
      return undefined;
    }
    const port = Number(value);
    return { label: `已运行网页 :${port}`, mode: "port", port };
  }

  private async launch(
    project: ProjectRoot,
    choice: LaunchChoice
  ): Promise<void> {
    const root = project.path;
    const cli = join(
      this.context.extensionPath,
      "dist",
      "runtime",
      "dist",
      "index.js"
    );
    if (!existsSync(cli)) {
      throw new Error(`安装包缺少映证运行时：${cli}`);
    }
    const editorPort = vscode.workspace
      .getConfiguration("verlay")
      .get<number>("editorPort", 5175);
    if (!validPort(editorPort)) {
      throw new Error("映证端口配置无效，请设置为 1024 到 65535。 ");
    }
    await this.releasePreviousService(editorPort, root);

    const args = [
      cli,
      "--cwd",
      root,
      "--agent",
      "codex",
      "--safe",
      "--port",
      String(editorPort),
      "--json",
    ];
    if (choice.mode === "port") {
      args.push("--target", String(choice.port));
    } else {
      args.push("--exec", choice.command);
    }

    this.output.clear();
    this.output.show(true);
    this.output.appendLine(`目标仓库：${root}`);
    this.output.appendLine(`启动方式：${choice.label}`);
    this.output.appendLine("正在启动映证…\n");

    const child = spawn(process.execPath, args, {
      cwd: root,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    this.child = child;
    if (child.pid) {
      await this.context.globalState.update(ACTIVE_SERVICE_KEY, {
        pid: child.pid,
        port: editorPort,
        root,
      } satisfies ActiveService);
    }
    let stdout = "";
    let ready = false;

    child.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      this.output.append(text);
      if (ready) {
        return;
      }
      try {
        const info = JSON.parse(stdout.trim()) as RuntimeInfo;
        if (typeof info.url === "string") {
          ready = true;
          this.currentUrl = editorUrl(editorPort);
          this.output.appendLine(`\n映证已启动：${this.currentUrl}\n`);
          this.renderStatus();
          this.open(this.currentUrl).catch((error: unknown) => {
            this.output.appendLine(`打开 Chrome 失败：${String(error)}`);
          });
          vscode.window
            .showInformationMessage(`映证已连接：${project.name}`)
            .then(undefined, (error: unknown) => {
              this.output.appendLine(`显示启动提示失败：${String(error)}`);
            });
        }
      } catch {
        // JSON is emitted over several chunks; keep collecting until complete.
      }
    });
    child.stderr?.on("data", (chunk: Buffer) =>
      this.output.append(chunk.toString())
    );
    child.once("error", (error) => {
      this.output.appendLine(`\n启动失败：${error.message}`);
    });
    child.once("exit", (code, signal) => {
      const wasCurrent = this.child === child;
      if (wasCurrent) {
        this.child = null;
        this.currentUrl = null;
        this.renderStatus();
      }
      const active =
        this.context.globalState.get<ActiveService>(ACTIVE_SERVICE_KEY);
      if (active?.pid === child.pid) {
        this.context.globalState
          .update(ACTIVE_SERVICE_KEY, undefined)
          .then(undefined, (error: unknown) => {
            this.output.appendLine(`清理旧服务记录失败：${String(error)}`);
          });
      }
      if (!ready && wasCurrent) {
        vscode.window
          .showErrorMessage(
            `映证启动失败（${signal ?? code ?? "未知原因"}）。`,
            "查看日志",
            "重新选择启动方式"
          )
          .then((action) => {
            if (action === "查看日志") {
              this.output.show();
            } else if (action === "重新选择启动方式") {
              return this.start(true);
            }
          })
          .then(undefined, (error: unknown) => {
            this.output.appendLine(`错误处理失败：${String(error)}`);
          });
      }
    });
  }

  private async releasePreviousService(
    port: number,
    root: string
  ): Promise<void> {
    let previousRoot: string | undefined;
    const active =
      this.context.globalState.get<ActiveService>(ACTIVE_SERVICE_KEY);
    if (active && active.port === port) {
      if (this.processIsRunning(active.pid)) {
        previousRoot = active.root;
        await this.terminateProcess(active.pid, port);
      }
      await this.context.globalState.update(ACTIVE_SERVICE_KEY, undefined);
    }

    if (await this.portResponds(port)) {
      const legacyPids = await this.findLegacyAirshipPids(port);
      await Promise.all(
        legacyPids.map((pid) => this.terminateProcess(pid, port))
      );
    }

    if (await this.portResponds(port)) {
      throw new Error(
        `端口 ${port} 被其他程序占用。映证没有停止该程序，请在设置中更换映证端口。`
      );
    }

    if (previousRoot && previousRoot !== root) {
      this.output.appendLine(`已停止旧项目的映证服务：${previousRoot}`);
      await vscode.window.showInformationMessage(
        `已从 ${basename(previousRoot)} 切换到 ${basename(root)}`
      );
    }
  }

  private processIsRunning(pid: number): boolean {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  }

  private async terminateProcess(pid: number, port: number): Promise<void> {
    if (!this.processIsRunning(pid)) {
      return;
    }
    try {
      process.kill(pid, "SIGINT");
    } catch {
      return;
    }
    if (await this.waitForPortFree(port, 2000)) {
      return;
    }
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      return;
    }
    await this.waitForPortFree(port, 1500);
  }

  private async waitForPortFree(
    port: number,
    timeoutMs: number
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      // biome-ignore lint/performance/noAwaitInLoops: each poll depends on the previous port state
      if (!(await this.portResponds(port))) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return !(await this.portResponds(port));
  }

  private async findLegacyAirshipPids(port: number): Promise<number[]> {
    if (process.platform !== "darwin") {
      return [];
    }
    const output = await this.commandOutput("lsof", [
      "-nP",
      "-t",
      `-iTCP:${port}`,
      "-sTCP:LISTEN",
    ]);
    const pids = output
      .split(WHITESPACE)
      .map(Number)
      .filter((pid) => Number.isSafeInteger(pid) && pid > 1);
    const commands = await Promise.all(
      pids.map(async (pid) => ({
        command: await this.commandOutput("ps", [
          "-p",
          String(pid),
          "-o",
          "command=",
        ]),
        pid,
      }))
    );
    return commands
      .filter(({ command }) => isManagedAirshipCommand(command, port))
      .map(({ pid }) => pid);
  }

  private commandOutput(command: string, args: string[]): Promise<string> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: ["ignore", "pipe", "ignore"],
        windowsHide: true,
      });
      let stdout = "";
      child.stdout?.on("data", (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.once("error", () => resolve(""));
      child.once("exit", () => resolve(stdout.trim()));
    });
  }

  private projectScripts(root: string): ProjectScripts {
    let packageManager: ProjectScripts["packageManager"] = "npm";
    if (existsSync(join(root, "pnpm-lock.yaml"))) {
      packageManager = "pnpm";
    } else if (existsSync(join(root, "yarn.lock"))) {
      packageManager = "yarn";
    } else if (
      existsSync(join(root, "bun.lockb")) ||
      existsSync(join(root, "bun.lock"))
    ) {
      packageManager = "bun";
    }
    const packageFile = join(root, "package.json");
    if (!existsSync(packageFile)) {
      return { packageManager, scripts: [] };
    }
    try {
      const pkg = JSON.parse(readFileSync(packageFile, "utf8")) as {
        scripts?: Record<string, string>;
      };
      const names = Object.keys(pkg.scripts ?? {}).filter((name) =>
        SCRIPT_PRIORITY.includes(name)
      );
      names.sort(
        (a, b) => SCRIPT_PRIORITY.indexOf(a) - SCRIPT_PRIORITY.indexOf(b)
      );
      return { packageManager, scripts: names };
    } catch {
      return { packageManager, scripts: [] };
    }
  }

  private async runningPorts(): Promise<number[]> {
    const configured = vscode.workspace
      .getConfiguration("verlay")
      .get<number>("targetPort", 0);
    const ports = validPort(configured)
      ? [configured, ...COMMON_PORTS.filter((port) => port !== configured)]
      : COMMON_PORTS;
    const checks = await Promise.all(
      ports.map(async (port) => ((await this.portResponds(port)) ? port : null))
    );
    return checks.filter((port): port is number => port !== null);
  }

  private portResponds(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const req = request(
        { host: "127.0.0.1", method: "HEAD", path: "/", port, timeout: 450 },
        (response) => {
          response.resume();
          resolve(true);
        }
      );
      req.once("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.once("error", () => resolve(false));
      req.end();
    });
  }

  private tryChrome(url: string): Promise<boolean> {
    const commands: Array<{ args: string[]; command: string }> = [];
    if (process.platform === "darwin") {
      commands.push({ args: ["-a", "Google Chrome", url], command: "open" });
    } else if (process.platform === "win32") {
      commands.push({
        args: ["/c", "start", "", "chrome", url],
        command: "cmd",
      });
    } else {
      commands.push(
        { args: [url], command: "google-chrome" },
        { args: [url], command: "chromium" }
      );
    }
    return new Promise((resolve) => {
      const attempt = (index: number): void => {
        const candidate = commands[index];
        if (!candidate) {
          resolve(false);
          return;
        }
        const child = spawn(candidate.command, candidate.args, {
          stdio: "ignore",
          windowsHide: true,
        });
        child.once("error", () => attempt(index + 1));
        child.once("exit", (code) => {
          if (code === 0) {
            resolve(true);
          } else {
            attempt(index + 1);
          }
        });
      };
      attempt(0);
    });
  }

  private renderStatus(): void {
    if (this.starting) {
      this.status.text = "$(loading~spin) 映证启动中";
      this.status.command = undefined;
      this.status.tooltip = "正在启动映证 Verlay";
      return;
    }
    if (this.child) {
      this.status.text = "$(debug-stop) 映证：停止";
      this.status.command = "verlay.stop";
      this.status.tooltip = "映证正在运行；点击停止";
      return;
    }
    this.status.text = "$(rocket) 启动映证";
    this.status.command = "verlay.start";
    this.status.tooltip = "为当前 VS Code 项目启动映证 Verlay";
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const controller = new VerlayController(context);
  context.subscriptions.push(
    controller,
    vscode.commands.registerCommand("verlay.start", () => controller.start()),
    vscode.commands.registerCommand("verlay.stop", () => controller.stop()),
    vscode.commands.registerCommand("verlay.open", () => controller.open()),
    vscode.commands.registerCommand("verlay.configure", () =>
      controller.configure()
    )
  );
}

export function deactivate(): void {
  // VS Code disposes the controller and its managed child process.
}
