import { PREFIX } from "../dom";
import { ROOT } from "./const";

/** BOSS component recipes for plugin chrome outside the page being edited. */
export const css = `
/* The focused plugin layout keeps all editing chrome in the right inspector.
   The legacy chat dock and canvas command bar remain mounted so keyboard and
   state plumbing keep working, but they no longer occupy the visible canvas. */
.${PREFIX}-dock-left,
.${PREFIX}-pill-left,
.${PREFIX}-bar { display: none !important; }

/* Bottom command bar: a neutral BOSS surface over the dark work canvas. */
.${PREFIX}-bar {
  min-height: 40px;
  color: var(--boss-text-base);
  background: var(--boss-surface);
  border-color: var(--boss-border-base);
  border-radius: var(--boss-radius-lg);
  box-shadow: var(--boss-shadow-3);
  font-family: var(--boss-font-cn);
}
.${PREFIX}-bar-sep,
.${PREFIX}-fbar-sep { background: var(--boss-border-light); }
.${PREFIX}-seg-group {
  background: var(--boss-surface-secondary);
  border-color: var(--boss-border-light);
  border-radius: var(--boss-radius-md);
}
.${PREFIX}-seg {
  min-height: var(--boss-control-sm);
  color: var(--boss-text-secondary);
  border-radius: var(--boss-radius-sm);
  opacity: 1;
  font-family: var(--boss-font-cn);
  font-size: 12px;
}
.${PREFIX}-seg:hover { color: var(--boss-text-base); background: var(--boss-surface-hover); }
.${PREFIX}-seg-on {
  color: var(--boss-primary);
  background: var(--boss-primary-light);
  box-shadow: none;
}
.${PREFIX}-seg-on:hover { background: var(--boss-primary-light-hover); }
.${PREFIX}-tool,
.${PREFIX}-fbar-btn,
.${PREFIX}-fbar-zoom {
  width: var(--boss-control-md);
  height: var(--boss-control-md);
  color: var(--boss-icon-base);
  border-radius: var(--boss-radius-sm);
  font-family: var(--boss-font-en);
}
.${PREFIX}-fbar-zoom { width: auto; min-width: var(--boss-control-md); }
.${PREFIX}-tool:hover,
.${PREFIX}-fbar-btn:hover,
.${PREFIX}-fbar-zoom:hover { color: var(--boss-icon-dark); background: var(--boss-surface-hover); }
.${PREFIX}-tool-on { color: var(--boss-primary); background: var(--boss-primary-light); }
.${PREFIX}-tool-on:hover { color: var(--boss-primary); background: var(--boss-primary-light-hover); }
${ROOT} .${PREFIX}-tool .${PREFIX}-ic,
${ROOT} .${PREFIX}-fbar-btn .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-base); }
${ROOT} .${PREFIX}-tool:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-fbar-btn:hover .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-dark); }
${ROOT} .${PREFIX}-tool-on .${PREFIX}-ic,
${ROOT} .${PREFIX}-tool-on:hover .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-primary); }
.${PREFIX}-bar-job {
  color: var(--boss-text-secondary); background: var(--boss-surface-secondary);
  border-radius: var(--boss-radius-sm);
}
.${PREFIX}-bar-job:hover { color: var(--boss-text-base); background: var(--boss-surface-hover); }

/* Floating assistant launcher. */
.${PREFIX}-pill-right.${PREFIX}-design-launcher,
.${PREFIX}-pill-right.${PREFIX}-design-launcher.${PREFIX}-pill-float {
  color: var(--boss-primary); background: var(--boss-surface);
  border-color: var(--boss-border-base); box-shadow: var(--boss-shadow-4);
}
.${PREFIX}-design-launcher:hover { box-shadow: var(--boss-shadow-4); }
.${PREFIX}-design-launcher:focus-visible {
  outline: 1px solid var(--boss-border-focus); outline-offset: 2px;
  box-shadow: var(--boss-focus-ring), var(--boss-shadow-4);
}

/* Menus and palettes share one surface, spacing and state ladder. */
.${PREFIX}-pop,
.${PREFIX}-fc-menu {
  color: var(--boss-text-base);
  background: var(--boss-surface);
  border-color: var(--boss-border-base);
  border-radius: var(--boss-radius-lg);
  box-shadow: var(--boss-shadow-4);
  font-family: var(--boss-font-cn);
}
.${PREFIX}-pop-bar { background: var(--boss-surface); border-bottom-color: var(--boss-border-light); }
.${PREFIX}-pop-bar-title,
.${PREFIX}-pop-head,
.${PREFIX}-fc-menu-head { color: var(--boss-text-tertiary); }
.${PREFIX}-pop-item,
.${PREFIX}-pop-group-head,
.${PREFIX}-fc-menu-item,
.${PREFIX}-fc-dgroup-head { color: var(--boss-text-secondary); border-radius: var(--boss-radius-sm); }
.${PREFIX}-pop-item:hover,
.${PREFIX}-pop-item[data-pop-active],
.${PREFIX}-pop-group-head:hover,
.${PREFIX}-fc-menu-item:hover,
.${PREFIX}-fc-dgroup-head:hover { color: var(--boss-text-base); background: var(--boss-surface-hover); }
.${PREFIX}-pop-item-on,
.${PREFIX}-fc-menu-on { color: var(--boss-primary); }
.${PREFIX}-pop-sep,
.${PREFIX}-fc-dgroup + .${PREFIX}-fc-dgroup { border-color: var(--boss-border-light); }
.${PREFIX}-pop-item:focus-visible,
.${PREFIX}-fc-menu-item:focus-visible,
.${PREFIX}-fc-dgroup-head:focus-visible {
  outline: 1px solid var(--boss-border-focus); outline-offset: -1px;
  box-shadow: var(--boss-focus-ring);
}
.${PREFIX}-fc-menu-num {
  color: var(--boss-text-base); background: var(--boss-surface-secondary);
  border-color: var(--boss-border-input); border-radius: var(--boss-radius-sm);
}
.${PREFIX}-fc-menu-num:focus { outline: 0; border-color: var(--boss-border-focus); box-shadow: var(--boss-focus-ring); }
.${PREFIX}-fc-menu-go {
  color: #fff; background: var(--boss-primary); border-radius: var(--boss-radius-sm);
}
.${PREFIX}-fc-menu-go:hover { background: var(--boss-primary-hover); }

/*
 * Global interaction-state map.
 *
 * The plugin still contains the original dark editor recipes underneath this
 * light BOSS skin. A control that was not explicitly skinned therefore fell
 * back to the legacy active-surface token on hover and painted a charcoal square in an
 * otherwise white panel.  Keep the state vocabulary in one final cascade
 * layer so newly exposed controls inherit the same three BOSS states:
 * neutral hover, selected hover and primary-action hover.
 */
.${PREFIX}-iconbtn:hover,
.${PREFIX}-sect-act:hover,
.${PREFIX}-tree-act:hover,
.${PREFIX}-tree-node:hover,
.${PREFIX}-align-btn:hover:not(:disabled),
.${PREFIX}-css-prop:hover,
.${PREFIX}-css-val:hover,
.${PREFIX}-css-del:hover,
.${PREFIX}-css-bm-field-wrap:hover,
.${PREFIX}-css-rescan:hover,
.${PREFIX}-ctl-num:hover,
.${PREFIX}-ctl-seg-btn:hover:not(.${PREFIX}-ctl-seg-on),
.${PREFIX}-pad-cell:hover:not(.${PREFIX}-pad-on),
.${PREFIX}-pad-spread:hover,
.${PREFIX}-pad-mode:hover:not(.${PREFIX}-pad-mode-on),
.${PREFIX}-ctl-toggle:hover:not(.${PREFIX}-ctl-toggle-on),
.${PREFIX}-row-icon:hover,
.${PREFIX}-select:hover,
.${PREFIX}-pop-mode:hover,
.${PREFIX}-pop-eyedrop:hover,
.${PREFIX}-thread-item:hover,
.${PREFIX}-tl-head:hover,
.${PREFIX}-disc-head:hover,
.${PREFIX}-diff-head:hover,
.${PREFIX}-diff-more:hover,
.${PREFIX}-follow button:hover,
.${PREFIX}-fp-add:hover:not(:disabled),
.${PREFIX}-fp-row:hover {
  color: var(--boss-text-base);
  background: var(--boss-surface-hover);
}
.${PREFIX}-dock-right .${PREFIX}-pad-mode:hover:not(.${PREFIX}-pad-mode-on) {
  color: var(--boss-text-base);
  background: var(--boss-surface-hover);
}

/* Selected controls keep the blue state family when the pointer reaches them. */
.${PREFIX}-ctl-seg-on:hover,
.${PREFIX}-pad-on:hover,
.${PREFIX}-pad-mode-on:hover,
.${PREFIX}-ctl-toggle-on:hover,
.${PREFIX}-fp-row-on:hover,
.${PREFIX}-pop-item-on:hover,
.${PREFIX}-fc-menu-on:hover,
.${PREFIX}-dock-right .${PREFIX}-ctl-seg-on:hover {
  color: var(--boss-primary);
  background: var(--boss-primary-light-hover);
}
.${PREFIX}-pad-on:hover .${PREFIX}-pad-ink { --${PREFIX}-ink: var(--boss-icon-primary); }

/* Primary actions darken within the primary ramp, never into the grey ramp. */
.${PREFIX}-action.${PREFIX}-primary:not(:disabled):hover,
.${PREFIX}-design-save:hover:not(:disabled),
.${PREFIX}-fc-menu-go:hover {
  color: #fff;
  background: var(--boss-primary-hover);
  border-color: var(--boss-primary-hover);
}

/* Hovered glyphs follow their host state instead of the legacy dark icon role. */
${ROOT} button:hover .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-dark); }
${ROOT} .${PREFIX}-ctl-toggle:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-effect-kind:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-select:hover .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-dark);
}
${ROOT} .${PREFIX}-ctl-seg-on:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-pad-on:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-pad-mode-on:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-ctl-toggle-on:hover .${PREFIX}-ic,
${ROOT} .${PREFIX}-tool-on:hover .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-primary);
}
${ROOT} .${PREFIX}-action.${PREFIX}-primary:not(:disabled):hover .${PREFIX}-ic {
  --${PREFIX}-ic-tone: #fff;
}
.${PREFIX}-ctl-num:hover .${PREFIX}-ctl-glyph,
.${PREFIX}-ctl-glyph-action:hover,
.${PREFIX}-tree-node:hover .${PREFIX}-tree-kind,
.${PREFIX}-fp-more:hover {
  color: var(--boss-icon-dark);
}
.${PREFIX}-pad-cell:hover .${PREFIX}-pad-ink { --${PREFIX}-ink: var(--boss-icon-base); }
.${PREFIX}-pad-spread:hover span { background: var(--boss-icon-base); }
.${PREFIX}-tweak-chip:hover,
.${PREFIX}-chip-all:hover {
  color: var(--boss-text-base);
  border-color: var(--boss-border-input);
}

/* Swatches use the BOSS focus border; flat/disabled controls stay flat. */
.${PREFIX}-ctl-swatch:hover,
.${PREFIX}-pop-recent:hover { border-color: var(--boss-border-focus); }
.${PREFIX}-tl-flat > .${PREFIX}-tl-head:hover,
.${PREFIX}-tool:disabled:hover,
.${PREFIX}-pop-item[aria-disabled="true"]:hover,
.${PREFIX}-grad-del:disabled:hover,
.${PREFIX}-design-close:hover,
.${PREFIX}-figma-compare-button:hover { background: transparent; }
${ROOT} button:disabled:hover .${PREFIX}-ic { --${PREFIX}-ic-tone: var(--boss-icon-lighter); }

.${PREFIX}-tip {
  color: #fff; background: var(--boss-text-base);
  border-color: transparent; border-radius: var(--boss-radius-sm); box-shadow: var(--boss-shadow-2);
  font-family: var(--boss-font-cn); font-size: 12px; line-height: 20px;
}
.${PREFIX}-tip-key { color: rgba(255, 255, 255, .72); }
`;
