import { describe, expect, it } from "vitest";
import { el } from "./dom";
import { uiText } from "./i18n";

describe("Chinese editor copy", () => {
  it("localises visible copy and accessibility names together", () => {
    const button = el("button", {
      "aria-label": "Add fill",
      "data-tip": "Add fill",
      text: "Add fill",
    });

    expect(button.textContent).toBe("添加填充");
    expect(button.getAttribute("aria-label")).toBe("添加填充");
    expect(button.dataset.tip).toBe("添加填充");
  });

  it("localises dynamic labels without changing their project data", () => {
    expect(uiText("Reorder LoginScreen")).toBe("重新排序 LoginScreen");
    expect(uiText("Coding agent: Codex, model: default")).toBe(
      "编程助手：Codex，模型：默认"
    );
  });

  it("localises the live verification status", () => {
    expect(uiText("Verifying the applied change")).toBe(
      "正在验证已应用的更改…"
    );
    expect(uiText("cancelled")).toBe("已取消");
    expect(uiText("Cancelled. Your change is still pending")).toBe(
      "已取消；这项更改仍在待处理列表中"
    );
  });

  it("leaves token names, font names, file paths and content untouched", () => {
    for (const value of [
      "--color-cobalt-glow",
      "ui-sans-serif",
      "LoginScreen",
      "src/components/LoginScreen.tsx",
    ]) {
      expect(uiText(value)).toBe(value);
    }
  });
});
