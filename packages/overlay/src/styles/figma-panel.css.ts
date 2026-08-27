import { PREFIX } from "../dom";
import { FIGMA_ASSETS } from "../figma-assets";
import { ROOT } from "./const";

/**
 * The v1.2 Figma inspector skin (file DjnWU8w0mLI56AMZo9BaYe, node 0:598).
 *
 * Kept as the final visual layer so the inspector's existing controls retain
 * their behaviour while this file owns only their presentation and geometry.
 */
export const css = `
.${PREFIX}-figma-icon {
  display: block; flex: none; max-width: none; pointer-events: none; user-select: none;
}
.${PREFIX}-dock-right {
  top: 16px; right: 16px; bottom: 16px;
  width: var(--${PREFIX}-right-w, 280px);
  overflow: visible;
  color: var(--boss-text-base);
  background: var(--boss-surface);
  border: 0;
  border-radius: var(--boss-radius-lg);
  box-shadow: var(--boss-shadow-3);
  filter: none;
  font-family: var(--boss-font-cn);
}

/* Exact colour roles from the Figma node. The legacy editor theme gives icons
   #BEBEBE/#666 by default; pin the inspector glyphs here so those old theme
   colours cannot leak into this light panel. */
${ROOT} .${PREFIX}-dock-right .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-light);
}

.${PREFIX}-design-head {
  min-height: 52px; height: 52px;
  padding: 12px 16px;
  cursor: default;
  border-bottom: 1px solid var(--boss-border-light);
}
.${PREFIX}-design-head-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.${PREFIX}-design-head .${PREFIX}-iconbtn {
  width: var(--boss-control-sm); height: var(--boss-control-sm); border-radius: var(--boss-radius-xs); color: var(--boss-icon-dark);
}
.${PREFIX}-design-head .${PREFIX}-iconbtn:hover { background: var(--boss-surface-hover); }
.${PREFIX}-design-avatar {
  display: grid; place-items: center; width: 20px; height: 20px; margin: 4px;
  overflow: hidden; border-radius: 50%;
}

.${PREFIX}-design-head .${PREFIX}-insp-tabs {
  display: flex; flex: 0 0 auto; width: 156px; height: 28px; gap: 4px;
  align-items: center; padding: 0; border: 0; background: transparent;
}
.${PREFIX}-design-head .${PREFIX}-insp-tab-group {
  display: flex; flex: 0 0 88px; width: 88px; height: 28px; gap: 2px;
  border-radius: var(--boss-radius-xs); background: var(--boss-surface-secondary);
}
.${PREFIX}-design-head .${PREFIX}-insp-tab {
  flex: 0 0 28px; width: 28px; height: 28px; padding: 0; gap: 0;
  border: 0; border-radius: var(--boss-radius-xs); color: var(--boss-icon-dark); opacity: 1;
}
.${PREFIX}-design-head .${PREFIX}-insp-tab-label { display: none; }
.${PREFIX}-design-head .${PREFIX}-insp-tab > .${PREFIX}-figma-icon { object-fit: contain; }
.${PREFIX}-design-head .${PREFIX}-insp-tab:hover { background: var(--boss-surface-hover); }
.${PREFIX}-design-head .${PREFIX}-insp-tab:disabled { cursor: default; opacity: 1; }
.${PREFIX}-design-head .${PREFIX}-figma-compare-button:hover { background: transparent; }
.${PREFIX}-figma-compare { position: relative; display: block; width: 28px; height: 28px; }
.${PREFIX}-figma-compare > [data-figma-icon="toolbar-compare-shape"] {
  position: absolute; left: 6.45px; top: 7.12px;
}
.${PREFIX}-figma-compare > [data-figma-icon="toolbar-compare-divider"] {
  position: absolute; left: 14px; top: 4.5px;
}
.${PREFIX}-figma-toolbar-divider {
  position: relative; display: block; flex: 0 0 0; width: 0; height: 20px;
}
.${PREFIX}-figma-toolbar-divider > .${PREFIX}-figma-icon {
  position: absolute; left: -10.25px; top: 9.75px; transform: rotate(90deg);
}
.${PREFIX}-design-head .${PREFIX}-insp-tab-on {
  color: var(--boss-primary); background: var(--boss-surface);
  box-shadow: var(--boss-shadow-1);
}
${ROOT} .${PREFIX}-design-head .${PREFIX}-insp-tab-on .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-primary);
}

.${PREFIX}-dock-right > .${PREFIX}-insp {
  min-height: 0; overflow: hidden; color: var(--boss-text-base);
  border-radius: var(--boss-radius-lg) var(--boss-radius-lg) 0 0;
}
.${PREFIX}-insp-element-head {
  display: flex; align-items: stretch;
  width: 100%; height: 52px; padding: 0 16px;
  border-bottom: 1px solid var(--boss-border-light);
  cursor: grab;
}
.${PREFIX}-dock-moving .${PREFIX}-insp-element-head { cursor: grabbing; }
.${PREFIX}-insp-element-head button { cursor: pointer; }
.${PREFIX}-insp-element-tabs {
  display: flex; align-items: stretch; gap: 20px; height: 52px;
}
.${PREFIX}-insp-element-tab {
  position: relative; display: flex; align-items: center; height: 52px; padding: 0;
  border: 0; border-radius: 0; background: transparent; color: var(--boss-text-tertiary);
  font: inherit; font-size: 14px; line-height: 22px; font-weight: 600;
  cursor: pointer;
}
.${PREFIX}-insp-element-tab:hover { color: var(--boss-text-base); }
.${PREFIX}-insp-element-tab-on { color: var(--boss-text-base); }
.${PREFIX}-insp-element-tab-on::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  border-radius: 2px 2px 0 0; background: var(--boss-primary);
}
.${PREFIX}-dock-right > .${PREFIX}-insp-shell-codex {
  flex: 0 0 auto;
}
.${PREFIX}-design-codex {
  position: relative; flex: 1 1 auto; min-height: 0;
  display: flex; flex-direction: column; overflow: hidden;
  --verlay-codex-ink: var(--boss-text-base);
  --verlay-codex-text: var(--boss-text-secondary);
  --verlay-codex-muted: var(--boss-text-tertiary);
  --verlay-codex-placeholder: var(--boss-text-quaternary);
  --verlay-codex-border: var(--boss-border-base);
  --verlay-codex-border-strong: var(--boss-border-input);
  --verlay-codex-surface: var(--boss-surface);
  --verlay-codex-surface-soft: var(--boss-surface-secondary);
  --verlay-codex-surface-hover: var(--boss-surface-hover);
  --verlay-codex-accent: var(--boss-primary);
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface);
  border-radius: 0 0 var(--boss-radius-lg) var(--boss-radius-lg); isolation: isolate;
}
/* With no selection the element header collapses to zero, making Codex the
   panel's first painted surface. It must own the top corners in that state. */
.${PREFIX}-dock-right.${PREFIX}-dock-codex:has(
    > .${PREFIX}-insp-shell-codex > .${PREFIX}-insp-head.${PREFIX}-hidden
  ) > .${PREFIX}-design-codex {
  border-radius: var(--boss-radius-lg);
}
.${PREFIX}-design-codex-actions {
  display: flex; flex: 0 0 44px; align-items: center; justify-content: flex-end;
  padding: 8px 12px; background: var(--verlay-codex-surface);
  border-bottom: 0;
}
.${PREFIX}-design-codex-actions .${PREFIX}-head-actions {
  display: flex; align-items: center; gap: 4px;
}
.${PREFIX}-design-codex-actions .${PREFIX}-iconbtn,
.${PREFIX}-design-codex-actions .${PREFIX}-agent-btn {
  width: var(--boss-control-sm); height: var(--boss-control-sm); border-radius: var(--boss-radius-sm);
  color: var(--verlay-codex-muted); background: transparent;
}
.${PREFIX}-design-codex-actions .${PREFIX}-iconbtn:hover,
.${PREFIX}-design-codex-actions .${PREFIX}-agent-btn:hover,
.${PREFIX}-design-codex-actions .${PREFIX}-iconbtn-on {
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
}
.${PREFIX}-design-codex-actions .${PREFIX}-iconbtn:focus-visible,
.${PREFIX}-design-codex-actions .${PREFIX}-agent-btn:focus-visible {
  outline: 1px solid var(--boss-border-focus); outline-offset: -1px;
  box-shadow: var(--boss-focus-ring);
}
${ROOT} .${PREFIX}-design-codex .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--verlay-codex-muted);
}
.${PREFIX}-design-codex .${PREFIX}-transcript {
  gap: 20px; padding: 16px;
  color: var(--verlay-codex-text); background: var(--verlay-codex-surface);
}
.${PREFIX}-design-codex .${PREFIX}-msg {
  color: var(--verlay-codex-text); font-size: 13px; line-height: 20px;
}
.${PREFIX}-design-codex .${PREFIX}-msg-user {
  max-width: 90%; padding: 8px 10px;
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
  border: 1px solid var(--verlay-codex-border); border-radius: 10px 10px 2px 10px;
}
.${PREFIX}-design-codex .${PREFIX}-msg-assistant {
  align-self: stretch; width: 100%; max-width: none; padding: 0;
  color: var(--verlay-codex-text); background: transparent;
  border: 0; border-radius: 0;
}
.${PREFIX}-design-codex .${PREFIX}-msg-assistant.${PREFIX}-msg-err {
  --verlay-codex-ink: #111827;
  --verlay-codex-text: #111827;
  --verlay-codex-muted: #111827;
  --ap-text-primary: #111827;
  --ap-text-secondary: #111827;
  --ap-text-tertiary: #111827;
  padding: 10px; color: #111827; background: #fff7f7;
  border: 1px solid rgba(198, 47, 67, .24); border-radius: 8px;
}
.${PREFIX}-design-codex .${PREFIX}-msg-body h4,
.${PREFIX}-design-codex .${PREFIX}-msg-body h5,
.${PREFIX}-design-codex .${PREFIX}-msg-body h6 {
  color: var(--verlay-codex-ink); font-size: 13px;
}
.${PREFIX}-design-codex .${PREFIX}-msg-body a {
  color: var(--boss-primary); text-decoration-color: var(--boss-border-focus);
}
.${PREFIX}-design-codex .${PREFIX}-md-code,
.${PREFIX}-design-codex .${PREFIX}-md-pre,
.${PREFIX}-design-codex .${PREFIX}-tl-out {
  color: var(--verlay-codex-text); background: var(--verlay-codex-surface-soft);
  border-color: var(--verlay-codex-border); border-radius: 8px;
}
.${PREFIX}-design-codex .${PREFIX}-chat-empty .${PREFIX}-empty-art-verlay {
  color: inherit; opacity: 1;
}
.${PREFIX}-design-codex .${PREFIX}-chat-empty .${PREFIX}-verlay-logo {
  width: 48px; height: 48px;
}
.${PREFIX}-design-codex .${PREFIX}-chat-empty .${PREFIX}-empty-title {
  color: var(--verlay-codex-ink); font-size: 14px; line-height: 22px; font-weight: 600;
}
.${PREFIX}-design-codex .${PREFIX}-chat-empty .${PREFIX}-empty-body {
  max-width: 26ch; color: var(--verlay-codex-muted); font-size: 12px; line-height: 18px;
}
.${PREFIX}-design-codex .${PREFIX}-composer {
  padding: 12px 16px 16px; background: var(--verlay-codex-surface);
  border-top: 0;
}
.${PREFIX}-design-codex .${PREFIX}-field {
  gap: 6px; padding: 10px;
  background: var(--verlay-codex-surface); border: 1px solid var(--verlay-codex-border);
  border-radius: var(--boss-radius-lg); box-shadow: var(--boss-shadow-2);
}
.${PREFIX}-design-codex .${PREFIX}-field:focus-within {
  border-color: var(--boss-border-focus);
  box-shadow: var(--boss-focus-ring), var(--boss-shadow-2);
}
.${PREFIX}-design-codex .${PREFIX}-input {
  min-height: 40px; padding: 2px 40px 2px 0;
  color: var(--verlay-codex-ink); font-size: 13px; line-height: 20px;
}
.${PREFIX}-design-codex .${PREFIX}-input::placeholder {
  color: var(--verlay-codex-placeholder);
}
.${PREFIX}-design-codex .${PREFIX}-sel-chip,
.${PREFIX}-design-codex .${PREFIX}-tweak-chip,
.${PREFIX}-design-codex .${PREFIX}-chip {
  color: var(--verlay-codex-text); background: var(--verlay-codex-surface-soft);
  border-color: var(--verlay-codex-border); border-radius: 6px;
}
.${PREFIX}-design-codex .${PREFIX}-sel-chip .${PREFIX}-chip-subject {
  color: var(--verlay-codex-ink); font-weight: 500;
}
.${PREFIX}-design-codex .${PREFIX}-sel-chip:hover,
.${PREFIX}-design-codex .${PREFIX}-tweak-chip:hover,
.${PREFIX}-design-codex .${PREFIX}-chip:hover {
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
  border-color: var(--verlay-codex-border-strong);
}
.${PREFIX}-design-codex .${PREFIX}-field-btn {
  border-radius: 6px; background: transparent;
}
.${PREFIX}-design-codex .${PREFIX}-field-btn:hover {
  background: var(--verlay-codex-surface-hover);
}
.${PREFIX}-design-codex .${PREFIX}-action {
  height: 28px; color: var(--verlay-codex-text);
  background: var(--verlay-codex-surface-soft); border-color: var(--verlay-codex-border);
  border-radius: 6px; font-size: 12px;
}
.${PREFIX}-design-codex .${PREFIX}-action:not(:disabled):hover {
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
  border-color: var(--verlay-codex-border-strong);
}
.${PREFIX}-design-codex .${PREFIX}-action.${PREFIX}-primary {
  width: 28px; padding: 0; color: #fff; background: var(--boss-primary);
  border-color: var(--boss-primary); border-radius: var(--boss-radius-full);
}
.${PREFIX}-design-codex .${PREFIX}-action.${PREFIX}-primary:not(:disabled):hover {
  color: #fff; background: var(--boss-primary-hover); border-color: var(--boss-primary-hover);
}
.${PREFIX}-design-codex .${PREFIX}-action.${PREFIX}-primary:disabled {
  color: #fff; background: var(--verlay-codex-muted); border-color: var(--verlay-codex-muted);
}
${ROOT} .${PREFIX}-design-codex .${PREFIX}-action.${PREFIX}-primary .${PREFIX}-ic {
  --${PREFIX}-ic-tone: #fff;
}
.${PREFIX}-design-codex .${PREFIX}-step,
.${PREFIX}-design-codex .${PREFIX}-turn-status {
  color: var(--verlay-codex-muted); font-size: 12px;
}
.${PREFIX}-design-codex .${PREFIX}-dot { background: var(--verlay-codex-muted); }
.${PREFIX}-design-codex .${PREFIX}-tl-head {
  color: var(--verlay-codex-text); border-radius: 6px;
}
.${PREFIX}-design-codex .${PREFIX}-tl-head:hover,
.${PREFIX}-design-codex .${PREFIX}-thread-item:hover,
.${PREFIX}-design-codex .${PREFIX}-disc-head:hover {
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
}
.${PREFIX}-design-codex .${PREFIX}-tl-name,
.${PREFIX}-design-codex .${PREFIX}-diff-file {
  color: var(--verlay-codex-ink);
}
.${PREFIX}-design-codex .${PREFIX}-tl-args,
.${PREFIX}-design-codex .${PREFIX}-tl-think-label,
.${PREFIX}-design-codex .${PREFIX}-tl-trunc,
.${PREFIX}-design-codex .${PREFIX}-meta,
.${PREFIX}-design-codex .${PREFIX}-thread-meta {
  color: var(--verlay-codex-muted);
}
.${PREFIX}-design-codex .${PREFIX}-tl-res,
.${PREFIX}-design-codex .${PREFIX}-tl-think-text,
.${PREFIX}-design-codex .${PREFIX}-prompt-text,
.${PREFIX}-design-codex .${PREFIX}-disc-head {
  color: var(--verlay-codex-text);
}
.${PREFIX}-design-codex .${PREFIX}-diff {
  border-color: var(--verlay-codex-border); border-radius: 8px;
}
.${PREFIX}-design-codex .${PREFIX}-diff-head,
.${PREFIX}-design-codex .${PREFIX}-diff-body {
  background: var(--verlay-codex-surface-soft);
}
.${PREFIX}-design-codex .${PREFIX}-diff-head:hover {
  background: var(--verlay-codex-surface-hover);
}
.${PREFIX}-design-codex .${PREFIX}-follow button {
  color: var(--verlay-codex-text); background: var(--verlay-codex-surface-soft);
  border-color: var(--verlay-codex-border); border-radius: 6px;
}
.${PREFIX}-design-codex .${PREFIX}-follow button:hover {
  color: var(--verlay-codex-ink); background: var(--verlay-codex-surface-hover);
  border-color: var(--verlay-codex-border-strong);
}
.${PREFIX}-design-codex .${PREFIX}-drawer,
.${PREFIX}-design-codex .${PREFIX}-pane {
  color: var(--verlay-codex-text); background: var(--verlay-codex-surface);
}
/* The model picker is mounted in the global popover host rather than inside the
   assistant. Its caller adds this shell class so the associated surface still
   follows the Codex light-component system instead of the legacy dark theme. */
.${PREFIX}-pop.${PREFIX}-codex-menu {
  color: var(--boss-text-base); background: var(--boss-surface);
  border: 1px solid var(--boss-border-base); border-radius: var(--boss-radius-lg);
  box-shadow: var(--boss-shadow-4);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-menu { padding: 4px; }
.${PREFIX}-codex-menu .${PREFIX}-pop-group + .${PREFIX}-pop-group {
  border-top-color: var(--boss-border-base);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-group-head,
.${PREFIX}-codex-menu .${PREFIX}-pop-item {
  color: var(--boss-text-secondary); background: transparent; border-radius: var(--boss-radius-sm);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-group-head:hover,
.${PREFIX}-codex-menu .${PREFIX}-pop-item:hover,
.${PREFIX}-codex-menu .${PREFIX}-pop-item[data-pop-active] {
  color: var(--boss-text-base); background: var(--boss-surface-hover);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-item-on { color: var(--boss-primary); font-weight: 600; }
.${PREFIX}-codex-menu .${PREFIX}-pop-item-hint { color: var(--boss-text-tertiary); opacity: 1; }
.${PREFIX}-codex-menu .${PREFIX}-pop-sep { background: var(--boss-border-base); }
.${PREFIX}-codex-menu .${PREFIX}-pop-custom {
  border-top: 1px solid var(--boss-border-light);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-custom-input {
  color: var(--boss-text-base); background: var(--boss-surface-secondary);
  border-color: var(--boss-border-input); border-radius: var(--boss-radius-sm);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-custom-input::placeholder { color: var(--boss-text-quaternary); }
.${PREFIX}-codex-menu .${PREFIX}-pop-custom-input:focus {
  border-color: var(--boss-border-focus); box-shadow: var(--boss-focus-ring);
}
.${PREFIX}-codex-menu .${PREFIX}-pop-custom-go {
  color: #fff; background: var(--boss-primary); border-radius: var(--boss-radius-sm);
}
${ROOT} .${PREFIX}-codex-menu .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-light);
}
.${PREFIX}-element-geometry {
  padding: 12px 16px;
  border-bottom: 1px solid var(--boss-border-light);
}
.${PREFIX}-element-geometry-title {
  margin-bottom: 8px;
  color: var(--boss-text-base); font-size: 14px; line-height: 22px; font-weight: 600;
}
.${PREFIX}-element-geometry-grid {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.${PREFIX}-element-geometry-corners { grid-column: 1 / -1; }
.${PREFIX}-element-geometry-corners .${PREFIX}-pad-fields {
  flex: 0 1 calc((100% - 8px) / 2);
}
.${PREFIX}-element-geometry-corners .${PREFIX}-pad-mode { margin-left: auto; }
.${PREFIX}-element-geometry .${PREFIX}-ctl-glyph-txt {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px; font-weight: 400; line-height: 16px; letter-spacing: .03px;
}
.${PREFIX}-element-geometry-corners .${PREFIX}-ctl-glyph .${PREFIX}-ic {
  width: 20px; height: 20px;
  background: url("${FIGMA_ASSETS["geometry-corners"]}") center / 20px 20px no-repeat;
}
.${PREFIX}-element-geometry-corners .${PREFIX}-ctl-glyph .${PREFIX}-ic > svg { visibility: hidden; }
.${PREFIX}-dock-right .${PREFIX}-insp-body { color: var(--boss-text-base); background: var(--boss-surface); }
.${PREFIX}-dock-right .${PREFIX}-insp-empty-default .${PREFIX}-empty-art-verlay {
  opacity: 1;
}
.${PREFIX}-dock-right .${PREFIX}-insp-empty-default .${PREFIX}-verlay-logo {
  width: 48px; height: 48px;
}
.${PREFIX}-dock-right .${PREFIX}-insp-empty-default .${PREFIX}-empty-title {
  color: var(--boss-text-base); font-weight: 600;
}
.${PREFIX}-dock-right .${PREFIX}-scope-row,
.${PREFIX}-dock-right .${PREFIX}-align-row,
.${PREFIX}-dock-right [data-section="source"],
.${PREFIX}-dock-right [data-section="position"],
.${PREFIX}-dock-right [data-section="constraints"],
.${PREFIX}-dock-right [data-section="size"],
.${PREFIX}-dock-right [data-section="auto-layout"],
.${PREFIX}-dock-right [data-section="appearance"],
.${PREFIX}-dock-right [data-section="media"],
.${PREFIX}-dock-right [data-section="vector"],
.${PREFIX}-dock-right [data-section="filters"] { display: none; }
.${PREFIX}-dock-right .${PREFIX}-sect { border-bottom: 1px solid var(--boss-border-light); }
.${PREFIX}-dock-right .${PREFIX}-sect-head {
  min-height: 46px; padding: 12px 16px;
  gap: 8px; opacity: 1; color: var(--boss-text-base);
  font-family: inherit; font-size: 14px; line-height: 22px; font-weight: 600;
  letter-spacing: 0; text-transform: none;
}
.${PREFIX}-dock-right .${PREFIX}-sect-head:has(+ .${PREFIX}-sect-body:not(.${PREFIX}-hidden)) {
  min-height: 42px; padding-bottom: 8px;
}
.${PREFIX}-dock-right .${PREFIX}-sect-head:hover { opacity: 1; }
.${PREFIX}-dock-right .${PREFIX}-sect-actions { gap: 0; }
.${PREFIX}-dock-right .${PREFIX}-sect-act {
  width: 20px; height: 20px; border-radius: var(--boss-radius-xs); color: var(--boss-icon-light);
}
.${PREFIX}-dock-right .${PREFIX}-sect-act:hover { background: var(--boss-surface-hover); }
.${PREFIX}-dock-right .${PREFIX}-sect-body {
  gap: 8px; padding: 0 16px 12px;
}
.${PREFIX}-dock-right .${PREFIX}-grid {
  gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr));
}
.${PREFIX}-dock-right .${PREFIX}-group:not(:first-child) { margin-top: 0; }

/* Spacing is the two compact Figma rows: Padding and Margin labels are carried
   by their glyphs, so the old 68px text rail disappears. */
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-row-label { display: none; }
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-row { gap: 0; }
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-row {
  flex: 1 1 100%; gap: 8px; min-width: 0;
}
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-fields {
  gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr));
}
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-mode {
  width: 20px; height: 28px; flex-basis: 20px;
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-h"] .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-v"] .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-h"] .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-v"] .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-mode .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="fill"] .${PREFIX}-sect-act .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="stroke"] .${PREFIX}-sect-act .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-sect-act .${PREFIX}-ic {
  background-position: center; background-repeat: no-repeat; background-size: 20px 20px;
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-h"] .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["padding-horizontal"]}");
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-v"] .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["padding-vertical"]}");
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-h"] .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["margin-horizontal"]}");
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-v"] .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["margin-vertical"]}");
}
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-mode .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["spacing-independent"]}");
  opacity: .543;
}
.${PREFIX}-dock-right [data-section="fill"] .${PREFIX}-sect-act .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="stroke"] .${PREFIX}-sect-act .${PREFIX}-ic,
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-sect-act .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["add-fill"]}");
}
.${PREFIX}-dock-right .${PREFIX}-figma-remove .${PREFIX}-ic {
  width: 20px; height: 20px;
  background: url("${FIGMA_ASSETS["remove-paint"]}") center / 20px 20px no-repeat;
}
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-h"] .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="padding-v"] .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-h"] .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="spacing"] [data-field="margin-v"] .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="spacing"] .${PREFIX}-pad-mode .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="fill"] .${PREFIX}-sect-act .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="stroke"] .${PREFIX}-sect-act .${PREFIX}-ic > svg,
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-sect-act .${PREFIX}-ic > svg { visibility: hidden; }
.${PREFIX}-dock-right .${PREFIX}-figma-remove .${PREFIX}-ic > svg { visibility: hidden; }

/* Typography follows the exact six-row field order from the selected node. */
.${PREFIX}-dock-right [data-section="typography"] > .${PREFIX}-sect-body { padding-right: 44px; }
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-content-field {
  width: 100%; padding-left: 6px; padding-right: 6px;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-content-field > .${PREFIX}-ctl-glyph {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-content-field > .${PREFIX}-ctl-input {
  text-align: left;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras {
  order: -1; margin: 0;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras > .${PREFIX}-ctl-num {
  width: 100%; padding-left: 6px; padding-right: 4px;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras > .${PREFIX}-ctl-num > .${PREFIX}-ctl-glyph-static {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras > .${PREFIX}-ctl-num > .${PREFIX}-ctl-glyph-action .${PREFIX}-ic {
  width: 20px; height: 20px;
  background: url("${FIGMA_ASSETS["control-caret"]}") center / 20px 20px no-repeat;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras > .${PREFIX}-ctl-num > .${PREFIX}-ctl-glyph-action .${PREFIX}-ic > svg {
  visibility: hidden;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras + .${PREFIX}-grid > .${PREFIX}-span2 {
  grid-column: 1 / -1;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-text-extras > :not(:first-child),
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-sect-actions,
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-token-badge,
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="paragraphSpacing"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="paragraphSpacing"]) {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="fontWeight"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="fontWeight"]) {
  order: 1; grid-column: auto;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="fontSize"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="fontSize"]) { order: 2; }
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="lineHeight"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="lineHeight"]) { order: 3; }
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="letterSpacing"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="letterSpacing"]) { order: 4; }
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="color"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="color"]) {
  order: 5; grid-column: 1 / -1;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > [data-field="textAlign"],
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > :has([data-field="textAlign"]) {
  order: 6; grid-column: auto;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > .${PREFIX}-row:has([data-field]) > .${PREFIX}-row-label {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] .${PREFIX}-grid > .${PREFIX}-row:has([data-field]) {
  display: block; margin: 0;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="letterSpacing"] .${PREFIX}-ic {
  position: relative;
  background-image: url("${FIGMA_ASSETS["letter-spacing-line"]}"), url("${FIGMA_ASSETS["letter-spacing-line"]}");
  background-position: 4px center, 15px center; background-repeat: no-repeat;
  background-size: .8px 11.8px, .8px 11.8px;
  color: transparent; font-family: "PingFang SC", sans-serif; font-size: 10px;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="letterSpacing"] .${PREFIX}-ic::after {
  content: "A"; position: absolute; inset: 0; display: grid; place-items: center;
  color: var(--boss-text-tertiary); line-height: 16px; pointer-events: none;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="letterSpacing"] .${PREFIX}-ic > svg { visibility: hidden; }
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn:nth-child(n + 4) {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="fontSize"] {
  position: relative; padding-right: 24px;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="fontSize"] > .${PREFIX}-ctl-glyph {
  display: none;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="fontSize"]::after {
  content: ""; position: absolute; top: 4px; right: 4px; width: 20px; height: 20px;
  pointer-events: none;
  background: url("${FIGMA_ASSETS["control-caret"]}") center / 20px 20px no-repeat;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="fontSize"] > .${PREFIX}-ctl-input {
  padding-left: 4px;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] {
  width: 108px;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn .${PREFIX}-ic {
  width: 100%; height: 20px; background-position: center; background-repeat: no-repeat; background-size: 31px 20px;
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn:nth-child(1) .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["align-left"]}");
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn:nth-child(2) .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["align-center"]}");
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn:nth-child(3) .${PREFIX}-ic {
  background-image: url("${FIGMA_ASSETS["align-right"]}");
}
.${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ctl-seg-btn .${PREFIX}-ic > svg {
  visibility: hidden;
}

/* Figma's 28px secondary fields. */
.${PREFIX}-dock-right .${PREFIX}-ctl-num,
.${PREFIX}-dock-right .${PREFIX}-select,
.${PREFIX}-dock-right .${PREFIX}-ctl-seg {
  min-height: 28px; height: 28px;
  color: var(--boss-text-base); background: var(--boss-surface-secondary);
  border: 0; border-radius: var(--boss-radius-sm);
  box-shadow: none;
}
.${PREFIX}-dock-right .${PREFIX}-ctl-num { padding-left: 4px; }
.${PREFIX}-dock-right .${PREFIX}-ctl-num:hover,
.${PREFIX}-dock-right .${PREFIX}-select:hover { background: var(--boss-surface-hover); border: 0; }
.${PREFIX}-dock-right .${PREFIX}-ctl-num:focus-within,
.${PREFIX}-dock-right .${PREFIX}-select[aria-expanded="true"] {
  background: var(--boss-surface); border: 1px solid var(--boss-border-focus);
  box-shadow: var(--boss-focus-ring);
}
.${PREFIX}-dock-right .${PREFIX}-ctl-input,
.${PREFIX}-dock-right .${PREFIX}-select {
  color: var(--boss-text-base); font-family: inherit; font-size: 12px; line-height: 20px;
}
.${PREFIX}-dock-right .${PREFIX}-ctl-glyph { color: var(--boss-icon-light); }
.${PREFIX}-dock-right .${PREFIX}-ctl-suffix { color: var(--boss-text-secondary); font-family: inherit; font-size: 11px; }
.${PREFIX}-dock-right .${PREFIX}-ctl-seg { gap: 4px; padding: 4px; }
.${PREFIX}-dock-right .${PREFIX}-ctl-seg[data-variant="icon"] .${PREFIX}-ctl-seg-btn {
  min-width: 0; height: 20px; border-radius: var(--boss-radius-xs); color: var(--boss-icon-light);
}
.${PREFIX}-dock-right .${PREFIX}-ctl-seg-on,
.${PREFIX}-dock-right .${PREFIX}-ctl-seg-on:hover { color: var(--boss-primary); background: var(--boss-surface); }
${ROOT} .${PREFIX}-dock-right .${PREFIX}-ctl-seg-on .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-primary);
}
${ROOT} .${PREFIX}-dock-right [data-section="typography"] [data-field="textAlign"] .${PREFIX}-ic {
  --${PREFIX}-ic-tone: var(--boss-icon-light);
}
.${PREFIX}-dock-right .${PREFIX}-paint-row { gap: 0; height: 28px; padding-left: 8px; background: var(--boss-surface-secondary); border-radius: var(--boss-radius-sm); }
.${PREFIX}-dock-right .${PREFIX}-paint-row .${PREFIX}-ctl-num { background: transparent; }
.${PREFIX}-dock-right .${PREFIX}-paint-row .${PREFIX}-paint-pct {
  border-left: 1px solid var(--boss-surface); border-radius: 0 var(--boss-radius-sm) var(--boss-radius-sm) 0;
}
.${PREFIX}-dock-right .${PREFIX}-paint-row:not([data-token]) .${PREFIX}-paint-hex::before {
  content: "#"; flex: none; color: var(--boss-text-base); font-size: 12px; line-height: 20px;
}
.${PREFIX}-dock-right .${PREFIX}-paint-row:not([data-token]) .${PREFIX}-paint-hex { gap: 0; }
.${PREFIX}-dock-right .${PREFIX}-paint-row:not([data-token]) .${PREFIX}-paint-hex .${PREFIX}-ctl-input {
  padding-left: 0;
}
.${PREFIX}-dock-right .${PREFIX}-paint-row .${PREFIX}-paint-pct { gap: 0; }
.${PREFIX}-dock-right .${PREFIX}-paint-row .${PREFIX}-paint-pct .${PREFIX}-ctl-suffix {
  padding-right: 0; font-size: 12px; line-height: 20px;
}
.${PREFIX}-dock-right [data-section="fill"] .${PREFIX}-rows-row,
.${PREFIX}-dock-right [data-section="stroke"] .${PREFIX}-rows-row {
  gap: 8px;
}
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-effect-row {
  position: relative; gap: 8px; padding: 0 28px 0 0; border-top: 0;
}
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-effect-head {
  position: absolute; top: 4px; right: 0;
}
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-effect-nums {
  display: grid; grid-template-columns: 1fr; gap: 8px;
}
.${PREFIX}-dock-right [data-section="effects"] .${PREFIX}-effect-pair {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px;
}
.${PREFIX}-dock-right [data-section="effects"] [data-field="shadow-blur"] > .${PREFIX}-ctl-glyph,
.${PREFIX}-dock-right [data-section="effects"] [data-field="shadow-spread"] > .${PREFIX}-ctl-glyph {
  width: 36px; justify-content: flex-start;
}
.${PREFIX}-dock-right [data-section="effects"] [data-field="shadow-blur"] .${PREFIX}-ctl-glyph-txt,
.${PREFIX}-dock-right [data-section="effects"] [data-field="shadow-spread"] .${PREFIX}-ctl-glyph-txt {
  font-family: inherit; font-size: 12px; color: var(--boss-text-secondary);
}

/* Selected layer box model: the CSS-pane diagram alone, compacted and recoloured
   for the white inspector. Unlike value rows it needs the full content width so
   all four nested rings and their side values remain legible. */
.${PREFIX}-dock-right .${PREFIX}-design-box-model.${PREFIX}-css-bm {
  flex: 0 0 auto; flex-direction: column; justify-content: stretch;
  margin: 0 16px 12px; padding: 12px 0 0;
  border-bottom: 0; color: var(--boss-text-base); background: var(--boss-surface);
  font-family: var(--boss-font-mono); font-size: 11px;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model-title {
  margin: 0 0 8px; color: var(--boss-text-base);
  font-family: var(--boss-font-cn); font-size: 14px; line-height: 22px; font-weight: 600;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model > .${PREFIX}-css-bm-ring {
  width: 100%;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-ring {
  padding: 18px 24px; border-color: var(--boss-border-input);
  border-radius: var(--boss-radius-sm);
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-margin {
  background: #f8f9fb;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-border {
  background: #f3f6fa;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-padding {
  background: #edf3fb;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-content {
  padding: 16px 4px; background: #e4eefc;
  border-color: var(--boss-border-input); border-radius: var(--boss-radius-sm);
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-label {
  color: var(--boss-text-tertiary);
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-size,
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-ctl-input {
  color: var(--boss-text-base);
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-field-wrap .${PREFIX}-ctl-input {
  width: 24px; padding-left: 0; padding-right: 0; font-size: 10px;
}
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-field-wrap,
.${PREFIX}-dock-right .${PREFIX}-design-box-model .${PREFIX}-css-bm-field-wrap:hover {
  background: transparent;
}

.${PREFIX}-design-footer {
  position: relative; z-index: 2; pointer-events: auto;
  display: flex; flex: 0 0 72px; align-items: center; gap: 16px;
  padding: 16px; background: var(--boss-surface); border-radius: 0 0 var(--boss-radius-lg) var(--boss-radius-lg);
  border-top: 1px solid var(--boss-border-light); box-shadow: none;
}
.${PREFIX}-design-project {
  display: flex; flex: 1 1 auto; min-width: 0; align-items: center;
  height: var(--boss-control-lg); padding: 0 12px; gap: 4px; border-radius: var(--boss-radius-md); background: var(--boss-surface-secondary);
  color: var(--boss-text-base); font-size: 14px; line-height: 22px;
}
.${PREFIX}-design-project > span:first-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${PREFIX}-design-save {
  position: relative; z-index: 1; pointer-events: auto;
  display: inline-flex; flex: 0 0 auto; align-items: center; justify-content: center;
  height: var(--boss-control-lg); padding: 0 20px; border: 0; border-radius: var(--boss-radius-full);
  color: #fff; background: var(--boss-primary); cursor: pointer;
  font-family: inherit; font-size: 14px; font-weight: 600;
}
.${PREFIX}-design-save:hover:not(:disabled) { background: var(--boss-primary-hover); }
.${PREFIX}-design-save:active:not(:disabled) { background: var(--boss-primary-active); }
.${PREFIX}-design-save:focus-visible { outline: 0; box-shadow: var(--boss-focus-ring); }
.${PREFIX}-design-save:disabled {
  color: var(--boss-text-disabled); background: var(--boss-surface-secondary);
  border: 1px solid var(--boss-border-input); cursor: default;
}
.${PREFIX}-design-save[data-state="writing"] {
  color: var(--boss-primary); background: var(--boss-primary-light); border-color: var(--boss-primary-light-hover);
}
.${PREFIX}-design-close {
  position: absolute; left: -13px; bottom: 15px;
  width: 13px; height: 36px; padding: 0; border-radius: 0;
  color: var(--boss-icon-light); background: transparent; box-shadow: none;
}
.${PREFIX}-design-close:hover { background: transparent; }
`;
