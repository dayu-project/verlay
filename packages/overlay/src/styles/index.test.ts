import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buildCss, design } from "@airship/editor-tokens";
import { describe, expect, it } from "vitest";
import { PREFIX } from "../dom";
import { FIGMA_ASSETS } from "../figma-assets";
import { ROOT } from "./const";
import { overlayCss } from "./index";

const VAR_USE = /var\(\s*(--ap-[a-z0-9-]+)/gi;
const VAR_DECL = /^\s*(--ap-[a-z0-9-]+)\s*:/gm;
const CSS_COMMENT = /\/\*[\s\S]*?\*\//g;

function declared(): Set<string> {
  const out = new Set<string>();
  for (const match of buildCss().matchAll(VAR_DECL)) {
    out.add(match[1]);
  }
  return out;
}

/**
 * Comments are stripped first.
 *
 * These stylesheets carry a lot of prose, and that prose names token families as
 * `var(--ap-motion-*)` — a real reference in a sentence, not a declaration. Left
 * in, the wildcard reads as a token called `--ap-motion-` that nothing emits,
 * and the check fails on its own documentation.
 */
function used(css: string): Set<string> {
  const out = new Set<string>();
  for (const match of css.replace(CSS_COMMENT, "").matchAll(VAR_USE)) {
    out.add(match[1]);
  }
  return out;
}

describe("overlay stylesheet", () => {
  it("hides the legacy left dock and bottom command bar", () => {
    const css = overlayCss();

    expect(css).toContain(
      `.${PREFIX}-dock-left,\n.${PREFIX}-pill-left,\n.${PREFIX}-bar { display: none !important; }`
    );
  });

  it("only references tokens the palette actually emits", () => {
    // An undefined custom property is not a fallback to the initial value — the
    // whole declaration is invalid at computed-value time and is dropped, with
    // no error anywhere. A typo'd token is therefore a rule that silently stops
    // existing, which is a great deal harder to notice than a build failure.
    const available = declared();
    const missing = [...used(overlayCss())].filter(
      (name) => !available.has(name)
    );
    expect(missing).toEqual([]);
  });

  it("carries the motion vocabulary the modules are written against", () => {
    const available = declared();
    for (const name of [
      "--ap-motion-dur-micro",
      "--ap-motion-dur-base",
      "--ap-motion-ease",
      "--ap-motion-ease-out",
      "--ap-box-padding",
      "--ap-box-margin",
      "--ap-box-gap",
    ]) {
      expect(available.has(name)).toBe(true);
    }
  });

  it("uses the size tokens it emits, or does not emit them", () => {
    /*
     * The inverse of the check above, and the one that would have caught the
     * icon-sizing drift.
     *
     * `--ap-icon-size-*` was emitted for a long time and referenced by exactly
     * zero rules: icon size is applied as SVG `width`/`height` attributes, so
     * the real scale lived in a hand-copied literal in `icons.ts` that happened
     * to agree with the tokens. Editing `EDITOR.md` moved the variables and
     * changed nothing on screen — the two could drift apart silently, and a
     * "single source of truth" that nothing reads is worse than none, because
     * it reads as though it is being obeyed.
     *
     * `icons.ts` now imports `design.iconSize` directly, which is why the group
     * is allowed here rather than asserted-on: its consumer is JavaScript, and
     * a CSS test cannot see it. Everything else in the size families has to be
     * live in the stylesheet or be deleted.
     */
    const SIZE_FAMILIES = ["space", "radius", "font-size", "control"];
    const live = used(overlayCss());
    // Per family, not per token: a scale is allowed steps nobody has reached
    // for yet — `radius-pill` and `space-section` are real parts of a complete
    // ramp. A whole family with no references is the thing that means someone
    // is sizing from somewhere else.
    const dead = SIZE_FAMILIES.filter((family) => {
      const members = [...declared()].filter((name) =>
        name.startsWith(`--ap-${family}-`)
      );
      return members.length > 0 && !members.some((name) => live.has(name));
    });
    expect(dead).toEqual([]);
  });

  it("keeps the icon scale and the icon-size tokens the same numbers", () => {
    // `icons.ts` reads `design.iconSize`, so this cannot drift by construction
    // — but it is the assertion that says so, and the thing that fails loudly
    // if anyone reintroduces a local copy of the scale.
    const css = buildCss();
    for (const [name, px] of Object.entries(design.iconSize)) {
      expect(css).toContain(`--ap-icon-size-${name}: ${px}px;`);
    }
  });

  it("honours reduced motion, once, at the end", () => {
    const css = overlayCss();
    const at = css.indexOf("prefers-reduced-motion");
    expect(at).toBeGreaterThan(-1);
    // Exactly one block: the policy is centralised in `motion.css.ts`
    // specifically so it cannot drift into a hand-kept list of selectors.
    expect(css.indexOf("prefers-reduced-motion", at + 1)).toBe(-1);
    // And last, so it outranks the modules it overrides on order alone.
    expect(css.slice(at)).not.toContain("transition:");
  });

  it("keeps the letter-spacing mark inside its glyph and out of hit testing", () => {
    const css = overlayCss();
    const glyph = `.${PREFIX}-dock-right [data-section="typography"] [data-field="letterSpacing"] .${PREFIX}-ic`;
    expect(css).toContain(`${glyph} {\n  position: relative;`);
    expect(css).toContain(
      `${glyph}::after {\n  content: "A"; position: absolute; inset: 0; display: grid; place-items: center;\n  color: var(--boss-text-tertiary); line-height: 16px; pointer-events: none;`
    );
  });

  it("keeps the Figma inspector on the BOSS semantic colour roles", () => {
    const css = overlayCss();
    const dock = `.${PREFIX}-dock-right`;

    expect(css).toContain(`${dock} {\n  top: 16px; right: 16px; bottom: 16px;`);
    expect(css).toContain("border-radius: var(--boss-radius-lg);");
    expect(css).toContain(
      "border-radius: 0 0 var(--boss-radius-lg) var(--boss-radius-lg);"
    );
    expect(css).toContain(
      "position: absolute; left: -13px; bottom: 15px;\n  width: 13px; height: 36px;"
    );
    expect(css).toContain("box-shadow: var(--boss-shadow-3);");
    expect(css).toContain(
      "border-top: 1px solid var(--boss-border-light); box-shadow: none;"
    );
    expect(css).toContain(
      "font: inherit; font-size: 14px; line-height: 22px; font-weight: 600;"
    );
    expect(css).toContain(
      "color: var(--verlay-codex-ink); background: var(--verlay-codex-surface);"
    );
    expect(css).toContain(
      "border-radius: var(--boss-radius-lg) var(--boss-radius-lg) 0 0;"
    );
    expect(css).toContain("color: var(--boss-text-base); font-weight: 600;");
    expect(css).toContain(
      "color: var(--boss-text-base);\n  background: var(--boss-surface);"
    );
    expect(css).toContain("background: var(--boss-surface-secondary);");
    expect(css).toContain("color: var(--boss-primary);");
    expect(css).toContain("background: var(--boss-primary);");
    expect(css).toContain(
      `${ROOT} ${dock} .${PREFIX}-ic {\n  --${PREFIX}-ic-tone: var(--boss-icon-light);`
    );
    expect(css).toContain(
      `${dock} .${PREFIX}-ctl-suffix { color: var(--boss-text-secondary);`
    );
    expect(css).toContain(
      `[data-field="textAlign"] .${PREFIX}-ic {\n  --${PREFIX}-ic-tone: var(--boss-icon-light);`
    );
    expect(css).toContain(
      `.${PREFIX}-figma-remove .${PREFIX}-ic {\n  width: 20px; height: 20px;`
    );
    expect(css).toContain(FIGMA_ASSETS["remove-paint"]);
    expect(css).toContain(FIGMA_ASSETS["geometry-corners"]);
    expect(css).toContain(FIGMA_ASSETS["control-caret"]);
    expect(css).toContain(FIGMA_ASSETS["align-left"]);
    expect(css).toContain(FIGMA_ASSETS["align-center"]);
    expect(css).toContain(FIGMA_ASSETS["align-right"]);
    expect(css).toContain(
      `.${PREFIX}-element-geometry .${PREFIX}-ctl-glyph-txt {\n  font-family: "Helvetica Neue"`
    );
    expect(css).toContain(
      `[data-field="fontSize"] > .${PREFIX}-ctl-glyph {\n  display: none;`
    );
    expect(css).toContain(
      `.${PREFIX}-paint-row:not([data-token]) .${PREFIX}-paint-hex::before {\n  content: "#";`
    );
  });

  it("isolates the Codex assistant from the legacy dark chat theme", () => {
    const css = overlayCss();
    const codex = `.${PREFIX}-design-codex`;

    expect(css).toContain(`${codex} {\n  position: relative;`);
    expect(css).toContain("--verlay-codex-ink: var(--boss-text-base);");
    expect(css).toContain("--verlay-codex-surface: var(--boss-surface);");
    expect(css).toContain(
      `.${PREFIX}-design-codex-actions {\n  display: flex; flex: 0 0 44px; align-items: center; justify-content: flex-end;\n  padding: 8px 12px; background: var(--verlay-codex-surface);\n  border-bottom: 0;`
    );
    expect(css).toContain(
      `.${PREFIX}-dock-right.${PREFIX}-dock-codex:has(\n    > .${PREFIX}-insp-shell-codex > .${PREFIX}-insp-head.${PREFIX}-hidden\n  ) > .${PREFIX}-design-codex {\n  border-radius: var(--boss-radius-lg);`
    );
    expect(css).toContain(
      `.${PREFIX}-design-codex .${PREFIX}-composer {\n  padding: 12px 16px 16px; background: var(--verlay-codex-surface);\n  border-top: 0;`
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-msg-assistant {\n  align-self: stretch; width: 100%; max-width: none; padding: 0;`
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-msg-assistant.${PREFIX}-msg-err {\n  --verlay-codex-ink: #111827;`
    );
    expect(css).toContain("--ap-text-secondary: #111827;");
    expect(css).toContain(
      "padding: 10px; color: #111827; background: #fff7f7;"
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-field {\n  gap: 6px; padding: 10px;`
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-sel-chip .${PREFIX}-chip-subject {\n  color: var(--verlay-codex-ink); font-weight: 500;`
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-chat-empty .${PREFIX}-empty-title {\n  color: var(--verlay-codex-ink); font-size: 14px; line-height: 22px; font-weight: 600;`
    );
    expect(css).toContain(
      `${codex} .${PREFIX}-action.${PREFIX}-primary {\n  width: 28px; padding: 0; color: #fff; background: var(--boss-primary);`
    );
    expect(css).toContain(
      `.${PREFIX}-pop.${PREFIX}-codex-menu {\n  color: var(--boss-text-base); background: var(--boss-surface);`
    );
    expect(css).toContain(
      `.${PREFIX}-codex-menu .${PREFIX}-pop-item-on { color: var(--boss-primary); font-weight: 600; }`
    );
  });

  it("publishes the BOSS light semantic tokens used by plugin chrome", () => {
    const css = overlayCss();

    expect(css).toContain("--boss-text-base: #0a1b33;");
    expect(css).toContain("--boss-text-secondary: #4c596a;");
    expect(css).toContain("--boss-primary: #1c64f2;");
    expect(css).toContain("--boss-primary-hover: #1959d8;");
    expect(css).toContain("--boss-surface-hover: #f1f2f3;");
    expect(css).toContain("--boss-border-focus: #8db0f7;");
    expect(css).toContain("--boss-control-lg: 40px;");
    expect(css).toContain("--boss-radius-lg: 12px;");
    expect(css).toContain(
      "--boss-focus-ring: 0 0 0 2px var(--boss-primary-light-hover);"
    );
  });

  it("keeps every plugin hover in the BOSS interaction-state ladder", () => {
    const css = overlayCss();

    expect(css).toContain(
      `.${PREFIX}-pad-mode:hover:not(.${PREFIX}-pad-mode-on),`
    );
    expect(css).toContain(
      `.${PREFIX}-ctl-seg-btn:hover:not(.${PREFIX}-ctl-seg-on),`
    );
    expect(css).toContain(
      `.${PREFIX}-fp-row:hover {\n  color: var(--boss-text-base);\n  background: var(--boss-surface-hover);`
    );
    expect(css).toContain(
      `.${PREFIX}-dock-right .${PREFIX}-ctl-seg-on:hover {\n  color: var(--boss-primary);\n  background: var(--boss-primary-light-hover);`
    );
    expect(css).toContain(
      `.${PREFIX}-action.${PREFIX}-primary:not(:disabled):hover,`
    );
    expect(css).toContain("background: var(--boss-primary-hover);");
    expect(css).toContain(
      `${ROOT} button:hover .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-dark); }`
    );
    expect(css).toContain(`.${PREFIX}-pop-item[aria-disabled="true"]:hover,`);
  });
});

/*
 * A class the product applies must be a class the stylesheet defines.
 *
 * `.pop-palette` and `.pop-shortcuts` were passed as `className` by the palette
 * and the shortcuts sheet, and neither had a rule anywhere. Both silently took
 * their whole box from `.pop-modal` — right for the palette, and wrong for a
 * sixty-row two-column reference that got a container sized for ten results.
 *
 * `scripts/check-css.mjs` cannot see this: it checks backtick escaping and the
 * no-transition rule against the stylesheet alone, and an applied-but-undefined
 * class is only visible by comparing the sheet with the call sites.
 *
 * Scoped to `className:` popover options rather than every `cls()` call in the
 * product. Those are the ones whose entire purpose is to carry styling — a
 * `cls()` used as a query hook legitimately has no rule.
 */
const POPOVER_CLASS = /className:\s*"([a-z][\w-]*)"/g;

/**
 * The overlay's own sources, found from the working directory.
 *
 * `import.meta.url` is an http URL under happy-dom, and vitest's root is the
 * package while turbo can run from the repo root — the same two facts
 * `tooltip.copy.test.ts` resolves the same way.
 */
const SRC = [
  join(process.cwd(), "src"),
  join(process.cwd(), "packages/overlay/src"),
  process.cwd(),
].find((dir) => existsSync(join(dir, "tooltip.ts"))) as string;

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      sourceFiles(path, found);
    } else if (
      entry.name.endsWith(".ts") &&
      !(entry.name.includes(".test.") || entry.name.includes(".stories."))
    ) {
      found.push(path);
    }
  }
  return found;
}

describe("popover classNames", () => {
  const css = overlayCss().replace(CSS_COMMENT, "");
  const files = sourceFiles(SRC);

  it("finds the sources to scan", () => {
    // A scan that matched nothing would make the case below pass forever.
    expect(files.length).toBeGreaterThan(20);
  });

  /**
   * Whether the stylesheet has a rule for `.${PREFIX}-<name>`.
   *
   * The boundary matters in both directions. A bare `includes` would accept
   * `.ap-pop-menu-hint` as a definition of `pop-menu`, and would *reject* a real
   * rule written `.ap-pop-foo:hover` or `.ap-pop-foo{`. So: the name, then
   * anything that can legally end a class in a selector.
   */
  const defines = (name: string): boolean =>
    new RegExp(`\\.[\\w-]*-${name}(?![\\w-])`).test(css);

  it("agrees with itself about what counts as defined", () => {
    // The matcher is the whole case below; a broken one passes silently.
    expect(defines("pop-modal")).toBe(true);
    expect(defines("pop-menu")).toBe(true);
    expect(defines("definitely-not-a-class")).toBe(false);
    // A prefix of a real class is not that class.
    expect(defines("pop-mod")).toBe(false);
  });

  it("defines every class a popover asks for", () => {
    const undefinedClasses: string[] = [];
    for (const path of files) {
      const src = readFileSync(path, "utf8");
      for (const [, name] of src.matchAll(POPOVER_CLASS)) {
        if (!defines(name)) {
          undefinedClasses.push(`${path.slice(SRC.length)} "${name}"`);
        }
      }
    }

    expect(undefinedClasses.sort((a, b) => a.localeCompare(b))).toEqual([]);
  });
});
