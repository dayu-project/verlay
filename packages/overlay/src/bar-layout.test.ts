import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AirshipApp, type Stage } from "./app";
import { ChromeLayer } from "./chrome-layer";
import { cls } from "./dom";
import { uiText } from "./i18n";
import { InlineResolver } from "./surface";

/*
 * Where things sit in the bottom bar.
 *
 * The bar is `left: 50%` with a `-50%` translate, so it is the *bar* that is
 * centred and any control's offset from the middle is (what precedes it − what
 * follows it) / 2. The two help buttons used to precede the mode toggle and
 * almost nothing followed it, which pushed Edit/View — the one control you aim
 * at without looking — well right of centre with a pair of glyphs sitting in the
 * middle instead.
 *
 * happy-dom does no layout, so what is asserted here is the *order*, which is
 * the input to that arithmetic. The pixels are a matter for the browser tier and
 * for looking at it.
 *
 * `localStorage` is stubbed for the reason `app.destroy.test.ts` gives: happy-dom
 * exposes a bare object, so the dock-geometry reads and writes in `mount` would
 * silently no-op and take a chunk of the mount path with them.
 */

/** A stage with nothing in it, which is all `mount` requires. */
function stubStage(): Stage & { editing: boolean } {
  const layer = new ChromeLayer();
  return {
    destroy() {
      // Nothing to take down.
    },
    editing: true,
    layer,
    mount() {
      layer.mount(document.body);
    },
    onLayoutChange() {
      // Nothing moves under a stage with no content.
    },
    resolver: new InlineResolver(),
    setEditing(on) {
      this.editing = on;
    },
    swallowPresses: true,
  };
}

function stubStorage(): void {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      clear: () => store.clear(),
      getItem: (k: string) => store.get(k) ?? null,
      key: () => null,
      length: 0,
      removeItem: (k: string) => store.delete(k),
      setItem: (k: string, v: string) => store.set(k, v),
    },
  });
}

const apps: AirshipApp[] = [];

function mount(): AirshipApp {
  const app = new AirshipApp(
    { mode: "inline", wsPath: "/__airship/ws" },
    stubStage()
  );
  app.mount();
  apps.push(app);
  return app;
}

function bar(): HTMLElement {
  const found = document.querySelector<HTMLElement>(`.${cls("bar")}`);
  if (!found) {
    throw new Error("The bar is not mounted.");
  }
  return found;
}

/** Index of a bar child by the command it is wired to. */
function at(command: string): number {
  return [...bar().children].findIndex(
    (node) => node.getAttribute("data-key") === command
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  stubStorage();
  vi.stubGlobal(
    "WebSocket",
    class {
      onclose: (() => void) | null = null;
      addEventListener() {
        // Never opens; nothing here is about what the socket carries.
      }
      close() {
        this.onclose?.();
      }
      send() {
        // Nothing to send.
      }
    }
  );
});

afterEach(() => {
  for (const app of apps.splice(0)) {
    app.destroy();
  }
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

describe("the bottom bar's order", () => {
  it("puts the two help surfaces last", () => {
    mount();

    const kids = [...bar().children];
    expect(kids.at(-2)?.getAttribute("data-key")).toBe("help.palette");
    expect(kids.at(-1)?.getAttribute("data-key")).toBe("help.shortcuts");
  });

  it("leaves the mode toggle with something on both sides of it", () => {
    // The whole point of moving them: a toggle with everything before it and
    // nothing after it cannot sit in the middle of a centred bar.
    mount();

    // By its content, not by a class: the surface switcher beside it is also a
    // `.seg-group`, and this case is about the Edit/View pair specifically.
    const toggle = [...bar().children].findIndex((node) =>
      [...node.querySelectorAll("button")].some(
        (btn) => btn.textContent?.trim() === uiText("Edit")
      )
    );

    expect(toggle).toBeGreaterThan(0);
    expect(toggle).toBeLessThan(bar().children.length - 1);
  });

  it("keeps the palette ahead of the shortcuts sheet", () => {
    // ⌘K before ?, which is the order they are learned in and the order the
    // Help group lists them in the catalog.
    mount();

    expect(at("help.palette")).toBeLessThan(at("help.shortcuts"));
  });

  it("divides them from the mode toggle with a separator of their own", () => {
    // Not `bar-sep-tools`, which the inline overlay hides along with the stage
    // slot it divides — inline that slot is empty, so a shared separator would
    // leave the pair welded to the toggle.
    mount();

    const kids = [...bar().children];
    const sep = kids[at("help.palette") - 1];

    expect(sep.classList.contains(cls("bar-sep"))).toBe(true);
    expect(sep.classList.contains(cls("bar-sep-tools"))).toBe(false);
  });
});

describe("the right inspector chrome", () => {
  it("only owns page editing while the plugin is open", () => {
    const app = mount();
    const internals = app as unknown as {
      controller: { isEditing: boolean };
      stage: { editing: boolean };
    };
    const launcher = document.querySelector<HTMLButtonElement>(
      `button.${cls("design-launcher")}`
    );
    const close = document.querySelector<HTMLButtonElement>(
      `button.${cls("design-close")}`
    );

    expect(internals.controller.isEditing).toBe(false);
    expect(internals.stage.editing).toBe(false);

    launcher?.click();
    expect(internals.controller.isEditing).toBe(true);
    expect(internals.stage.editing).toBe(true);

    close?.click();
    expect(internals.controller.isEditing).toBe(false);
    expect(internals.stage.editing).toBe(false);

    launcher?.click();
    expect(internals.controller.isEditing).toBe(true);
    expect(internals.stage.editing).toBe(true);
  });

  it("does not mount the removed top toolbar", () => {
    mount();

    const dock = document.querySelector(`.${cls("dock-right")}`);
    expect(dock?.querySelector(`.${cls("design-head")}`)).toBeNull();
    expect(dock?.querySelector(`.${cls("insp-tabs")}`)).toBeNull();
  });

  it("uses one Verlay launcher and removes the top-left Airship pill", () => {
    mount();

    expect(document.querySelector(`.${cls("pill-left")}`)).toBeNull();
    const launcher = document.querySelector<HTMLButtonElement>(
      `button.${cls("design-launcher")}`
    );
    expect(launcher?.getAttribute("aria-label")).toBe(uiText("Show design"));
    expect(launcher?.querySelector(`.${cls("verlay-logo")}`)).not.toBeNull();
    const logos = document.querySelectorAll(`svg.${cls("verlay-logo")}`);
    expect(logos).toHaveLength(3);
  });

  it("uses the exported Figma close control on the inspector footer", () => {
    mount();

    const close = document.querySelector(`.${cls("design-close")}`);
    expect(
      close?.querySelector('[data-figma-icon="panel-close"]')
    ).not.toBeNull();
  });

  it("shows a live pending-edit count instead of the project name", () => {
    const app = mount();
    const summary = document.querySelector<HTMLElement>(
      `.${cls("design-project")} > span:first-child`
    );
    const internals = app as unknown as {
      onVisualChanged: () => void;
      pendingCount: () => number;
    };

    expect(summary?.textContent).toBe("当前修改元素 0 条");
    expect(
      document.querySelector('[data-figma-icon="footer-caret"]')
    ).toBeNull();

    vi.spyOn(internals, "pendingCount").mockReturnValue(3);
    internals.onVisualChanged();

    expect(summary?.textContent).toBe("当前修改元素 3 条");
  });

  it("widens Codex to 320px and returns Edit to 280px", () => {
    const app = mount();
    const internals = app as unknown as {
      setInspectorMode: (mode: "codex" | "edit") => void;
    };
    const dock = document.querySelector<HTMLElement>(`.${cls("dock-right")}`);

    internals.setInspectorMode("codex");
    expect(
      document.documentElement.style.getPropertyValue("--__airship-right-w")
    ).toBe("320px");
    expect(dock?.classList.contains(cls("dock-codex"))).toBe(true);

    internals.setInspectorMode("edit");
    expect(
      document.documentElement.style.getPropertyValue("--__airship-right-w")
    ).toBe("280px");
    expect(dock?.classList.contains(cls("dock-codex"))).toBe(false);
  });
});
