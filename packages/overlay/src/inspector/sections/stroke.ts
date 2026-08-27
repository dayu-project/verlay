import { cls, el } from "../../dom";
import { icon } from "../../icons";
import { createQuadField } from "../controls/quad-field";
import { sameColor } from "../css-value";
import { STROKE_SIDES } from "../descriptors";
import { hasStroke } from "../gates";
import { agreed } from "../mixed";
import { readValue } from "../style-model";
import type { SectionContext } from "./context";

/**
 * The Stroke section: a colour row and a weight field. CSS edits use the
 * product defaults: solid style and an inside (`border-box`) stroke.
 *
 * It used to be four flat things stacked — colour, widths, a full-width Style
 * segmented group, a full-width Position segmented group — so a section whose
 * everyday use is "make this border 1px grey" was four rows tall and the two
 * rows you set once and forget occupied half of it.
 *
 * The row deliberately reuses Fill's `.rows` chrome without `createRowList`:
 * that primitive's value model is "an array serialised into one CSS property"
 * and a border is four longhands, so routing it through would need a fake
 * `cssProperty`. Sharing the classes is the honest half of the reuse.
 */
/**
 * The four longhands for one border property, so this section never writes a shorthand.
 *
 * Everything else here writes `border-<side>-<prop>` — deliberately, because
 * "the shorthand was the one declaration in this section that could not describe what
 * the section was showing". Add and Remove did not, and the change set is keyed per
 * property, so *both* survived: set `border-top-width: 8px`, click Remove stroke, and
 * the payload carried `border-top-width: 8px` **and** `border-width: 0px`. Which one
 * landed in the source depended on emission order.
 *
 * A shorthand also cannot be taken back cleanly — `border-width: 0px` leaves the four
 * longhands in place and merely loses to them — which is why Remove looked like it had
 * worked while the quad field still read `8`.
 *
 * The first line was aspirational for a long time. Three writes still used the
 * shorthand — the eye, the width field's implied `solid`, and the Style select —
 * and the eye's was a live bug: `hasStroke` reads the longhands through
 * `ctx.gate`, which does no shorthand expansion, so once *Add stroke* had
 * written a pending `solid` on them the shorthand `none` could never win, and
 * the eye did nothing. All three go through `writeAllEdges` now.
 *
 * The reads had the mirror-image problem and are fixed the same way: every one
 * of them asked `border-top-*` and answered for the box. See `edgeValue`.
 */
const EDGES = ["top", "right", "bottom", "left"] as const;

function writeAllEdges(
  onChange: (property: string, value: string) => void,
  suffix: "width" | "style" | "color",
  value: string
): void {
  for (const edge of EDGES) {
    onChange(`border-${edge}-${suffix}`, value);
  }
}

/**
 * What all four edges say, or `MIXED` when they disagree.
 *
 * Every read in this section used to be `readValue(node, "border-top-*")` — the
 * top edge speaking for the box. That is the same mistake the *writes* were
 * fixed for: `.header { border-bottom: 1px solid #eee }` is the canonical
 * divider, and this section showed it as an unstroked element with a black
 * colour. Set three sides to red and the fourth to blue and the row claimed red
 * for all four, then imposed it on the first edit.
 *
 * Colours compare through `sameColor`, not `===`. These four values do not all
 * come from the same place once an edit is pending: `applyPreview` writes the
 * picker's `rgb(r g b / a)` into the inline style of the edges just written,
 * while the rest still read back the engine's legacy `rgb(r, g, b)`. String
 * equality calls that a disagreement and shows `Mixed` on a box the user just
 * made uniform. Note `panel.seed` compares with `===`, which is right for the
 * keywords and lengths it handles and would be wrong here.
 */
function edgeValue(
  node: Element,
  suffix: "width" | "style" | "color",
  fallback: string
): string {
  return agreed(
    EDGES.map((edge) => readValue(node, `border-${edge}-${suffix}`)),
    fallback,
    suffix === "color" ? (a, b) => sameColor(a, b, node) : undefined
  );
}

export function renderStroke(ctx: SectionContext, node: Element): HTMLElement {
  const body = el("div", { class: cls("sect-body") });

  /** The stroke's colour, or `MIXED`. Used as both the seed and the re-seed. */
  const strokeColor = (): string => edgeValue(node, "color", "#000000");

  // Colour writes the four longhands, not the `border-color` shorthand.
  // The widths beside it have always been longhands, so the shorthand was the
  // one declaration in this section that could not describe what the section
  // was showing — set three sides to 0 and the colour still claimed all four.
  const rows = el("div", { class: cls("rows") });
  // Owns the colour row it builds, so repainting drops the previous one rather
  // than leaving it registered against detached DOM.
  const repaintRows = ctx.repaintScope();
  const paintRows = (): void => repaintRows(() => paintRowsInto());
  const paintRowsInto = (): void => {
    if (!hasStroke(ctx.gate(node))) {
      // Empty, not a "None" row — see the note in `row-list.ts`'s render().
      rows.replaceChildren();
      return;
    }
    rows.replaceChildren(
      el("div", { class: cls("rows-row") }, [
        ctx.colorRow(
          strokeColor(),
          "Stroke colour",
          (next) => {
            ctx.batch(() => {
              for (const side of STROKE_SIDES) {
                ctx.onChange(`border-${side.name}-color`, next);
              }
            });
          },
          node,
          STROKE_SIDES.map((side) => `border-${side.name}-color`),
          /*
           * The sixth argument, and it is not optional here.
           *
           * Without it the re-seed pass pushes the raw per-property value
           * (`panel.colorRow`'s `setValue`), and this row registers *four*
           * properties — so it takes four `setValue` calls, one per edge, and
           * `border-left-color` wins. A `Mixed` row would settle on the left
           * edge's colour after the first undo, refresh or discard, which is
           * the panel changing what it claims for no reason the user can see.
           *
           * The same expression as the seed, deliberately: `vector.ts` states
           * the invariant — "the seed and the re-seed `read` have to agree on
           * this" — and the only way to keep it is to have one function.
           */
          strokeColor
        ),
        el(
          "button",
          {
            "aria-label": "Remove stroke",
            class: `${cls("row-icon")} ${cls("figma-remove")}`,
            "data-tip": "Remove stroke",
            onClick: () => {
              // Longhands, so this actually clears what the section's own fields wrote.
              ctx.batch(() => {
                writeAllEdges(ctx.onChange, "style", "none");
                writeAllEdges(ctx.onChange, "width", "0px");
              });
              ctx.refresh();
            },
            type: "button",
          },
          [icon("minus", "xs")]
        ),
      ])
    );
  };
  paintRows();
  body.append(rows);

  // Per-side widths, collapsed to one field until they disagree — the same
  // control as corner radius, which is the other four-longhands-behind-one-
  // number in this panel. The settings button sits on the same line, the way
  // A design tool puts its advanced-stroke affordance beside the weight.
  const widths = createQuadField(
    {
      batch: (run) => {
        ctx.batch(run);
        // A zero-to-positive width changes whether the stroke row exists.
        // Refresh after the batch so the shape key records the new structure;
        // undo can then rebuild back to the empty state in one pass.
        ctx.refresh();
      },
      collapsed: { glyph: "stroke-width", label: "Stroke width" },
      // A border with no style is invisible however wide it is; setting one
      // implies the other, and leaving that to the user is a trap.
      onWrote: (_property, css) => {
        /*
         * All four edges, and longhands out.
         *
         * `edgeValue` returns `none` only when every edge agrees on it, so an
         * element that already paints one edge is left alone — widening it
         * should not silently draw the other three. The old
         * `border-top-style === "none"` test asked one edge and then wrote the
         * shorthand across all four, which is both halves of the same mistake.
         */
        if (Number.parseFloat(css) > 0) {
          writeAllEdges(ctx.onChange, "style", "solid");
          ctx.onChange("box-sizing", "border-box");
        }
      },
      sides: STROKE_SIDES.map((s) => ({
        glyph: s.icon,
        label: s.label,
        property: `border-${s.name}-width`,
      })),
      toggle: { glyph: "corners-independent", label: "Independent sides" },
      tokenSlot: (properties) => ctx.tokenSlot(node, properties),
    },
    new Map(
      STROKE_SIDES.map((s) => [
        `border-${s.name}-width`,
        readValue(node, `border-${s.name}-width`) || "0px",
      ])
    ),
    ctx.onChange,
    ctx.gestures
  );
  ctx.register(widths);

  body.append(widths.element);

  /*
   * The `+` caps at one, and says why.
   *
   * CSS gives an element exactly one border. A design tool stacks strokes the way it
   * stacks fills, and there is no honest way to offer a second row here: an
   * `outline` is a real second ring but takes no per-side widths and no
   * per-corner radius, so row two would quietly be a different control from
   * row one. A disabled button that names the limit — and names the two real
   * workarounds — beats either a dead `+` or a fake row.
   */
  const add = ctx.headerAction("plus", "Add stroke", () => {
    ctx.batch(() => {
      writeAllEdges(ctx.onChange, "style", "solid");
      writeAllEdges(ctx.onChange, "width", "1px");
      writeAllEdges(
        ctx.onChange,
        "color",
        readValue(node, "color") || "#000000"
      );
      ctx.onChange("box-sizing", "border-box");
    });
    ctx.refresh();
  });
  const paintAdd = (): void => {
    const on = hasStroke(ctx.gate(node));
    add.toggleAttribute("disabled", on);
    add.dataset.tip = on ? "CSS gives an element one border" : "Add stroke";
  };
  paintAdd();

  return ctx.section("stroke", "描边", body, {
    actions: [add],
  });
}
