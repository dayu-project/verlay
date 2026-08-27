import { cls, el } from "../../dom";
import { measureXY } from "../constraints";
import { createCorners, CORNER_PROPERTIES } from "../controls/corners";
import { parseLength } from "../css-length";
import { type Axis, layoutSize, writeResize } from "../sizing";
import { readValue } from "../style-model";
import type { SectionContext } from "./context";
import { moveTo } from "./position";

const SIZE_UNITS = ["px", "%", "em", "rem", "vw", "vh"];

/**
 * The compact geometry block directly beneath the Element information title.
 *
 * The Figma skin hides the larger Position, Size and Appearance sections, but
 * those sections used to be the only route to X/Y, W/H and corner radius. This
 * block deliberately uses the same measurement and write paths so the compact
 * controls are real editor controls (including undo, refresh and multi-select),
 * rather than a second, display-only model of the element.
 */
export function renderElementInfo(
  ctx: SectionContext,
  node: Element
): HTMLElement {
  const root = el("div", {
    "aria-label": "元素几何属性",
    class: cls("element-geometry"),
    "data-section": "element-info",
  });
  const title = el("div", {
    class: cls("element-geometry-title"),
    text: "位置",
  });
  const grid = el("div", { class: cls("element-geometry-grid") });

  for (const axis of ["x", "y"] as const) {
    const label = axis === "x" ? "X position" : "Y position";
    const field = ctx.numControl(
      {
        fieldKey: `element-pos-${axis}`,
        glyph: axis.toUpperCase(),
        label,
        unit: "px",
      },
      String(Math.round(measureXY(node)[axis])),
      (css) => {
        const target = Number.parseFloat(css);
        if (!Number.isNaN(target)) {
          moveTo(ctx, node, axis, target);
        }
      },
      [
        "left",
        "top",
        "right",
        "bottom",
        "translate",
        "position",
        "margin-left",
        "margin-top",
      ],
      () => String(Math.round(measureXY(node)[axis]))
    );
    grid.append(field.element);
  }

  for (const axis of ["w", "h"] as const) {
    const property = axis === "w" ? "width" : "height";
    const field = ctx.numControl(
      {
        fieldKey: `element-${property}`,
        glyph: axis.toUpperCase(),
        label: axis === "w" ? "Width" : "Height",
        min: 0,
        unit: "px",
        units: SIZE_UNITS,
      },
      String(Math.round(layoutSize(node, axis))),
      (css) => writeSize(ctx, node, axis, css),
      [property, "flex", "align-self"],
      () => String(Math.round(layoutSize(node, axis)))
    );
    grid.append(field.element);
  }

  const corners = createCorners(
    new Map(CORNER_PROPERTIES.map((p) => [p, readValue(node, p) || "0px"])),
    ctx.onChange,
    ctx.gestures,
    (properties) => ctx.tokenSlot(node, properties),
    ctx.batch
  );
  ctx.register(corners);
  corners.element.classList.add(cls("element-geometry-corners"));
  grid.append(corners.element);

  root.append(title, grid);
  return root;
}

function writeSize(
  ctx: SectionContext,
  node: Element,
  axis: Axis,
  css: string
): void {
  const property = axis === "w" ? "width" : "height";
  if (!parseLength(css, SIZE_UNITS)) {
    ctx.onChange(property, css);
    return;
  }
  ctx.batch(() => {
    for (const declaration of writeResize(node, axis, "fixed", css)) {
      ctx.onChange(declaration.property, declaration.value);
    }
  });
}
