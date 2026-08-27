import { describe, expect, it, vi } from "vitest";
import { SPACING_GROUP } from "../descriptors";
import { createPadding } from "./padding";

describe("paired spacing writes", () => {
  it("starts folded even when the existing sides differ", () => {
    const descriptors = SPACING_GROUP.descriptors.filter(
      (descriptor) => descriptor.compoundGroup === "margin"
    );
    const initial = new Map(
      descriptors.map((descriptor) => [
        descriptor.cssProperty,
        descriptor.cssProperty === "margin-right" ? "160px" : "0px",
      ])
    );
    const control = createPadding(
      {
        collapsed: { h: "gap-h", v: "gap-v" },
        descriptors,
        noun: "margin",
        signed: true,
        toggle: {
          glyph: "corners-independent",
          label: "Independent margin",
        },
      },
      initial,
      vi.fn()
    );

    expect(control.element.dataset.mode).toBe("pair");
    expect(control.element.querySelectorAll("input")).toHaveLength(2);
    expect(
      control.element.querySelector("button")?.getAttribute("aria-pressed")
    ).toBe("false");
  });

  it("batches a horizontal edit into one undo step", () => {
    const batch = vi.fn((run: () => void) => run());
    const change = vi.fn();
    const descriptors = SPACING_GROUP.descriptors.filter(
      (descriptor) => descriptor.compoundGroup === "padding"
    );
    const initial = new Map(
      descriptors.map((descriptor) => [descriptor.cssProperty, "8px"])
    );
    const control = createPadding(
      {
        batch,
        collapsed: { h: "pad-h", v: "pad-v" },
        descriptors,
        noun: "padding",
        toggle: {
          glyph: "pad-individual",
          label: "Independent padding",
        },
      },
      initial,
      change
    );
    const input = control.element.querySelector("input") as HTMLInputElement;

    input.value = "12";
    input.dispatchEvent(new Event("blur"));

    expect(batch).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(2);
  });
});
