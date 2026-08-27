import { describe, expect, it } from "vitest";
import { verlayLogo } from "./brand-assets";
import { cls } from "./dom";

describe("Verlay brand asset", () => {
  it("renders resolution-independent vector geometry", () => {
    const mark = verlayLogo(48);

    expect(mark.tagName.toLowerCase()).toBe("svg");
    expect(mark.classList.contains(cls("verlay-logo"))).toBe(true);
    expect(mark.getAttribute("viewBox")).toBe("0 0 64 64");
    expect(mark.getAttribute("width")).toBe("48");
    expect(mark.querySelectorAll("circle")).toHaveLength(8);
    expect(mark.querySelectorAll("rect").length).toBeGreaterThan(5);
    expect(mark.querySelector("image")).toBeNull();
  });
});
