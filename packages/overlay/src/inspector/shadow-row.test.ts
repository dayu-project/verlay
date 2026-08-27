import { describe, expect, it, vi } from "vitest";
import { cls } from "../dom";
import { uiText } from "../i18n";
import { blankShadow } from "./css-value";
import { createShadowList, shadowRow } from "./paint";

/*
 * The shape of a shadow row, which is the whole reason it was rebuilt.
 *
 * Four number fields across gave each of them 65px at the default dock width —
 * 39px of typable text after the glyph, about five characters, for values like
 * "-12.5px". The fix is not a track list with a minimum: with four equal
 * columns the count goes 4, 3, 2 as the panel narrows, and the three-wide band
 * (X, Y, Blur on one line, Spread orphaned under them) covers the default width
 * exactly. Pairing them in the DOM makes the *pair* the unit that wraps, so the
 * row is four across or a 2x2 and never 3+1 — which only holds while the pairs
 * are actually there, hence this.
 */

const row = () => shadowRow(blankShadow(), vi.fn());

const glyphs = (element: HTMLElement): string[] =>
  [...element.querySelectorAll(`.${cls("ctl-glyph-txt")}`)].map(
    (node) => node.textContent ?? ""
  );

describe("a shadow row", () => {
  it("groups its four numbers into two pairs", () => {
    const pairs = row().querySelectorAll(`.${cls("effect-pair")}`);
    expect(pairs).toHaveLength(2);
    for (const pair of pairs) {
      expect(pair.querySelectorAll(`.${cls("ctl-num")}`)).toHaveLength(2);
    }
  });

  it("pairs the offsets together and blur with spread", () => {
    const pairs = [
      ...row().querySelectorAll<HTMLElement>(`.${cls("effect-pair")}`),
    ];
    expect(glyphs(pairs[0])).toEqual(["X", "Y"]);
    expect(glyphs(pairs[1])).toEqual(["模糊", "扩展"]);
  });

  it("still offers all four, in order", () => {
    expect(glyphs(row())).toEqual(["X", "Y", "模糊", "扩展"]);
  });

  it("has no shadow-type selector", () => {
    expect(row().querySelector(`.${cls("effect-kind")}`)).toBeNull();
  });

  it("removes the hide action and keeps the delete action", () => {
    const list = createShadowList("0 4px 8px #0003", vi.fn());
    const head = list.element.querySelector(`.${cls("effect-head")}`);
    const labels = [...(head?.querySelectorAll("button") ?? [])].map((b) =>
      b.getAttribute("aria-label")
    );
    expect(labels).toEqual([uiText("Remove")]);
    const rowEl = list.element.querySelector(`.${cls("rows-row")}`);
    expect(rowEl?.children).toHaveLength(1);
  });

  it("creates outer shadows by default", () => {
    expect(blankShadow().inset).toBe(false);
  });
});
