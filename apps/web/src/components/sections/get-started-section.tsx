import { SectionHeading } from "#/components/ui/section-heading";
import {
  type DownloadKind,
  GET_STARTED_DOWNLOADS,
  GET_STARTED_GUIDES,
  GET_STARTED_SECTION,
} from "#/content/get-started";
import { publicAsset } from "#/lib/public-asset";

function PackageIcon({ kind }: { kind: DownloadKind }) {
  return (
    <img
      alt=""
      height="32"
      src={
        kind === "vscode"
          ? publicAsset("brand/vscode-official.svg")
          : publicAsset("brand/google-chrome-official.svg")
      }
      width="32"
    />
  );
}

function DownloadArrow() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="M8 2.5v7M5.5 7.5 8 10l2.5-2.5M3 12.5h10" />
    </svg>
  );
}

export function GetStartedSection() {
  return (
    <section className="section">
      <SectionHeading
        desc={GET_STARTED_SECTION.desc}
        title={GET_STARTED_SECTION.heading}
      />

      <div className="download-package-grid">
        {GET_STARTED_DOWNLOADS.map((download) => (
          <a
            className="download-package-card"
            download={download.fileName}
            href={download.href}
            key={download.id}
          >
            <span className="download-package-icon">
              <PackageIcon kind={download.kind} />
            </span>
            <span className="download-package-copy">
              <strong>{download.title}</strong>
              <small>{download.meta}</small>
            </span>
            <span className="download-package-action">
              {download.action}
              <DownloadArrow />
            </span>
          </a>
        ))}
      </div>

      <div className="install-guide-heading">
        <div>
          <h3 className="section-heading">安装说明</h3>
          <p className="section-desc">{GET_STARTED_SECTION.guideDesc}</p>
        </div>
      </div>

      <div className="install-guide-grid">
        {GET_STARTED_GUIDES.map((guide) => (
          <article className="install-guide-card" key={guide.id}>
            <h4>{guide.title}</h4>
            <ol>
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}
