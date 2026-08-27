import { FOOTER } from "#/content/footer";
import { SITE } from "#/content/site";
import { publicAsset } from "#/lib/public-asset";

/** The footer: a compact brand sign-off. */
export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-logo">
            <img
              alt=""
              aria-hidden="true"
              className="footer-brand-mark"
              height="20"
              src={publicAsset("brand/verlay-spark-logo-blue.png")}
              width="20"
            />
            <span className="footer-brand-name">{SITE.name}</span>
          </span>
          <p className="footer-blurb">{FOOTER.blurb}</p>
        </div>
      </div>
    </footer>
  );
}
