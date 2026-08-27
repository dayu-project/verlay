import { SITE } from "#/content/site";
import { publicAsset } from "#/lib/public-asset";

/**
 * The brand mark and the wordmark, linking back to the top.
 *
 * The mark's path is the same geometry as assets/logo.svg — the file that is the
 * repo's geometry of record — inlined rather than loaded through an <img> so it
 * inherits `currentColor` and follows the bar's text colour without a second
 * asset.
 *
 * The wordmark is set at 500 and is the only word on the page at that weight
 * outside a heading; everything else in the header is 400. That is what makes it
 * read as a mark rather than as the first item of the navigation.
 */
export function LogoWordmark() {
  return (
    <a aria-label={`${SITE.name} — home`} className="header-logo" href="#top">
      <img
        alt=""
        aria-hidden="true"
        className="header-mark"
        height="22"
        src={publicAsset("brand/verlay-spark-logo-blue.png")}
        width="22"
      />
      <span className="header-wordmark">{SITE.name}</span>
    </a>
  );
}
