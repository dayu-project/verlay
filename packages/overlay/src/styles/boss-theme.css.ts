import { PREFIX } from "../dom";
import { ROOT } from "./const";

/**
 * BOSS light-theme semantic tokens used by the Verlay plugin chrome.
 *
 * These names deliberately describe roles instead of components. The attached
 * design-system reference defines the values once; panels, toolbars and menus
 * consume the same roles so interaction states cannot drift independently.
 */
export const css = `
${ROOT},
.${PREFIX}-layer,
.${PREFIX}-chrome-layer,
.${PREFIX}-canvas-viewport,
.${PREFIX}-toast-host {
  --boss-font-cn: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --boss-font-en: "Helvetica Neue", Helvetica, Arial, sans-serif;

  --boss-text-base: #0a1b33;
  --boss-text-secondary: #4c596a;
  --boss-text-tertiary: #878f9b;
  --boss-text-quaternary: #a7adb5;
  --boss-text-disabled: rgba(10, 27, 51, .22);

  --boss-icon-dark: #0a1b33;
  --boss-icon-base: #4c596a;
  --boss-icon-light: #878f9b;
  --boss-icon-lighter: #a7adb5;
  --boss-icon-primary: #1c64f2;

  --boss-surface: #fff;
  --boss-surface-secondary: #f7f8f9;
  --boss-surface-hover: #f1f2f3;
  --boss-surface-active: #e1e3e6;
  --boss-surface-selected: #eff4fe;

  --boss-primary: #1c64f2;
  --boss-primary-hover: #1959d8;
  --boss-primary-active: #164dbb;
  --boss-primary-light: #eff4fe;
  --boss-primary-light-hover: #d9e6ff;
  --boss-primary-light-active: #b3ccff;

  --boss-border-base: rgba(10, 27, 51, .12);
  --boss-border-light: rgba(10, 27, 51, .06);
  --boss-border-input: #e1e3e6;
  --boss-border-focus: #8db0f7;
  --boss-border-selected: #1c64f2;

  --boss-radius-xs: 4px;
  --boss-radius-sm: 6px;
  --boss-radius-md: 8px;
  --boss-radius-lg: 12px;
  --boss-radius-xl: 16px;
  --boss-radius-full: 9999px;

  --boss-control-xs: 24px;
  --boss-control-sm: 28px;
  --boss-control-md: 32px;
  --boss-control-lg: 40px;

  --boss-shadow-1: 0 0 1px rgba(10, 27, 51, .04), 0 1px 4px rgba(10, 27, 51, .10);
  --boss-shadow-2: 0 0 1px rgba(10, 27, 51, .12), 0 2px 8px rgba(10, 27, 51, .10);
  --boss-shadow-3: 0 0 1px rgba(10, 27, 51, .10), 0 4px 16px rgba(10, 27, 51, .14);
  --boss-shadow-4: 0 0 1px rgba(10, 27, 51, .14), 0 10px 24px -2px rgba(10, 27, 51, .16);
  --boss-focus-ring: 0 0 0 2px var(--boss-primary-light-hover);
}
`;
