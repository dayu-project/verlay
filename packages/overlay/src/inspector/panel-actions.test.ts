import type { DesignToken } from "@airship/protocol/tokens";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cls } from "../dom";
import { uiText } from "../i18n";
import { setRuntimeTokens } from "../tokens/registry";
import { DesignPanel } from "./panel";
import {
  harness,
  mount,
  resetDocument,
  selectionOf,
  sizeOf,
} from "./test-support";

function pointerUp(target: Element): void {
  target.dispatchEvent(
    new PointerEvent("pointerup", { bubbles: true, button: 0 })
  );
}

describe("inspector section actions", () => {
  beforeEach(resetDocument);
  afterEach(() => {
    setRuntimeTokens({ framework: "unknown", tokens: [] });
  });

  it("removes project variable controls and records literal values", () => {
    const spacing: DesignToken = {
      category: "spacing",
      kind: "css-var",
      name: "--space-md",
      origin: "runtime",
      values: { "": "20px" },
    };
    setRuntimeTokens({ framework: "custom", tokens: [spacing] });
    const h = harness({ showDesignTokens: false });
    const panel = new DesignPanel(h.deps);
    const node = mount("div", {
      style: "--space-md: 16px; padding-top: var(--space-md)",
    });
    sizeOf(node, { height: 44, width: 120 });
    panel.setSelection(selectionOf(node));

    expect(panel.element.querySelector(`.${cls("token-badge")}`)).toBeNull();
    expect(panel.element.querySelector("[data-token]")).toBeNull();
    expect(panel.element.textContent).not.toContain("space-md");

    panel.recordOn(node, "padding-top", "20px");
    expect(h.changeSet.changesFor(node)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: "padding-top", token: undefined }),
      ])
    );
    panel.destroy();
  });

  it("uses the Verlay brand in the default inspector state", () => {
    const panel = new DesignPanel(harness().deps);

    const empty = panel.element.querySelector(`.${cls("insp-empty-default")}`);
    expect(empty?.querySelector(`.${cls("verlay-logo")}`)).not.toBeNull();
    expect(empty?.querySelector(`.${cls("empty-title")}`)?.textContent).toBe(
      uiText("Pick an element to start tweaking")
    );
    panel.destroy();
  });

  it("activates a header action on pointer-up without double-running click", () => {
    const run = vi.fn();
    const button = DesignPanel.headerAction("plus", "Add fill", run);
    document.body.append(button);

    pointerUp(button);
    button.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));

    expect(run).toHaveBeenCalledTimes(1);
  });

  it("keeps keyboard and assistive click activation", () => {
    const run = vi.fn();
    const button = DesignPanel.headerAction("plus", "Add fill", run);
    document.body.append(button);

    button.click();

    expect(run).toHaveBeenCalledTimes(1);
  });

  it("keeps inspector sections permanently expanded", () => {
    const h = harness();
    const panel = new DesignPanel(h.deps);
    const node = mount("p", { text: "Description" });
    sizeOf(node, { height: 44, width: 347 });
    panel.setSelection(selectionOf(node));

    const section = panel.element.querySelector(
      '[data-section="fill"]'
    ) as HTMLElement;
    const body = section.querySelector(`.${cls("sect-body")}`) as HTMLElement;
    const header = section.querySelector(`.${cls("sect-head")}`) as HTMLElement;

    expect(body.classList.contains(cls("hidden"))).toBe(false);
    expect(header.hasAttribute("role")).toBe(false);
    expect(header.hasAttribute("tabindex")).toBe(false);
    expect(header.hasAttribute("aria-expanded")).toBe(false);
    expect(section.querySelector(`.${cls("sect-chev")}`)).toBeNull();

    pointerUp(header);
    header.click();
    expect(body.classList.contains(cls("hidden"))).toBe(false);
    panel.destroy();
  });

  it("keeps the edit and Codex switch as the first row for a selection", () => {
    const h = harness();
    const onModeChange = vi.fn();
    const panel = new DesignPanel({ ...h.deps, onModeChange });
    const node = mount("div");
    sizeOf(node, { height: 44, width: 120 });
    panel.setSelection(selectionOf(node));

    expect(panel.element.firstElementChild).toBe(panel.headerElement);
    const tabs = Array.from(
      panel.headerElement.querySelectorAll<HTMLButtonElement>(
        `.${cls("insp-element-tab")}`
      )
    );
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      "编辑元素",
      "Codex助手",
    ]);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("false");
    expect(
      panel.headerElement.querySelector(`.${cls("insp-element-badge")}`)
    ).toBeNull();
    expect(panel.element.querySelector(`.${cls("insp-tabs")}`)).toBeNull();

    tabs[1]?.click();
    expect(onModeChange).toHaveBeenLastCalledWith("codex");
    expect(
      panel.headerElement.querySelector<HTMLButtonElement>(
        `.${cls("insp-element-tab-on")}`
      )?.textContent
    ).toBe("Codex助手");

    panel.headerElement
      .querySelectorAll<HTMLButtonElement>(`.${cls("insp-element-tab")}`)[0]
      ?.click();
    expect(onModeChange).toHaveBeenLastCalledWith("edit");
    expect(
      panel.headerElement.querySelector<HTMLButtonElement>(
        `.${cls("insp-element-tab-on")}`
      )?.textContent
    ).toBe("编辑元素");
    panel.destroy();
  });

  it("renders editable geometry directly beneath element information", () => {
    const h = harness();
    const panel = new DesignPanel(h.deps);
    const node = mount("div", {
      style: "border-radius: 6px; width: 120px; height: 44px",
    });
    sizeOf(node, { height: 44, left: 12, top: 18, width: 120 });
    panel.setSelection(selectionOf(node));

    const body = panel.element.querySelector(`.${cls("insp-body")}`);
    const geometry = panel.element.querySelector(
      '[data-section="element-info"]'
    ) as HTMLElement;
    expect(body?.firstElementChild).toBe(geometry);
    expect(
      geometry.querySelector(`.${cls("element-geometry-title")}`)?.textContent
    ).toBe("位置");
    expect(geometry.querySelectorAll(`.${cls("ctl-num")}`)).toHaveLength(5);
    expect(panel.element.querySelector('[data-section="layers"]')).toBeNull();

    const width = geometry.querySelector<HTMLInputElement>(
      '[data-field="element-width"] input'
    );
    expect(width?.value).toBe("120");
    if (width) {
      width.value = "160";
      width.dispatchEvent(new Event("blur"));
    }
    expect(h.changeSet.changesFor(node)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: "width", to: "160px" }),
      ])
    );

    const radius = geometry.querySelector<HTMLInputElement>(
      '[data-field="border-top-left-radius-all"] input'
    );
    if (radius) {
      radius.value = "12";
      radius.dispatchEvent(new Event("blur"));
    }
    for (const property of [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ]) {
      expect(h.changeSet.changesFor(node)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property, to: "12px" }),
        ])
      );
    }
    panel.destroy();
  });

  it("shows the selected layer box model directly below Shadow", () => {
    const panel = new DesignPanel(harness().deps);
    const node = mount("div", {
      style:
        "width: 120px; height: 44px; margin-right: 16px; padding: 8px; border: 1px solid #ccc",
    });
    sizeOf(node, { height: 62, width: 138 });
    panel.setSelection(selectionOf(node));

    const effects = panel.element.querySelector('[data-section="effects"]');
    const diagram = panel.element.querySelector(
      `.${cls("design-box-model")}`
    ) as HTMLElement;
    expect(effects?.nextElementSibling).toBe(diagram);
    expect(
      diagram.querySelector(`.${cls("design-box-model-title")}`)?.textContent
    ).toBe("图层信息");
    expect(diagram.querySelector(`.${cls("css-bm-margin")}`)).not.toBeNull();
    expect(diagram.querySelector(`.${cls("css-bm-border")}`)).not.toBeNull();
    expect(diagram.querySelector(`.${cls("css-bm-padding")}`)).not.toBeNull();
    expect(diagram.querySelector(`.${cls("css-bm-content")}`)).not.toBeNull();
    expect(
      [...diagram.querySelectorAll<HTMLInputElement>("input")].every(
        (input) => input.readOnly
      )
    ).toBe(true);
    panel.destroy();
  });

  it("adds a fill while the section stays expanded", () => {
    const h = harness();
    const panel = new DesignPanel(h.deps);
    const node = mount("div");
    sizeOf(node, { height: 44, width: 120 });
    panel.setSelection(selectionOf(node));

    const section = panel.element.querySelector(
      '[data-section="fill"]'
    ) as HTMLElement;
    const body = section.querySelector(`.${cls("sect-body")}`) as HTMLElement;
    const add = section.querySelector(
      `button[aria-label="${uiText("Add fill")}"]`
    ) as HTMLButtonElement;

    pointerUp(add);

    expect(body.classList.contains(cls("hidden"))).toBe(false);
    expect(h.changeSet.changesFor(node)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: "background-color",
          to: "#FFFFFF",
        }),
      ])
    );
    panel.destroy();
  });

  it("keeps the typography controls free of covering tooltips", () => {
    const h = harness();
    const panel = new DesignPanel(h.deps);
    const node = mount("h1", { text: "Apps" });
    sizeOf(node, { height: 32, width: 40 });
    panel.setSelection(selectionOf(node));

    const typography = panel.element.querySelector(
      '[data-section="typography"]'
    ) as HTMLElement;
    const content = typography.querySelector<HTMLInputElement>(
      `input[aria-label="${uiText("Content")}"]`
    );

    expect(typography.hasAttribute("data-no-tooltip")).toBe(true);
    expect(content).not.toBeNull();
    expect(content?.closest(`.${cls("row")}`)).toBeNull();
    expect(
      content?.parentElement?.classList.contains(cls("text-content-field"))
    ).toBe(true);
    panel.destroy();
  });
});
