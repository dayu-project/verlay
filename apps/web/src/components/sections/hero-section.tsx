import { HERO } from "#/content/hero";
import { publicAsset } from "#/lib/public-asset";
import { scrollToLinkedSection } from "#/lib/scroll-to-section";

interface HeroAgent {
  name: "VS Code" | "Codex";
  src: string;
}

const VS_CODE_AGENT: HeroAgent = {
  name: "VS Code",
  src: publicAsset("brand/vscode-official.svg"),
};

const CODEX_AGENT: HeroAgent = {
  name: "Codex",
  src: publicAsset("brand/chatgpt-official.png"),
};

function AgentLabel({ agent }: { agent: HeroAgent }) {
  return (
    <span className="hero-agent-label">
      <img
        alt=""
        className={
          agent.name === "VS Code"
            ? "hero-agent-icon hero-agent-icon--vscode"
            : "hero-agent-icon hero-agent-icon--chatgpt"
        }
        height="14"
        src={agent.src}
        width="14"
      />
      <span>{agent.name}</span>
    </span>
  );
}

/**
 * The hero's words. The animation that goes with them is `HeroStage`, which is
 * rendered as a sibling in routes/index.tsx rather than from here — it is
 * full-bleed and this section is a centred column, so they cannot share a box.
 */
export function HeroSection() {
  return (
    <section className="hero" id="overview">
      <p className="hero-eyebrow">
        <span>{HERO.eyebrow}</span>
        <AgentLabel agent={VS_CODE_AGENT} />
        <span>的</span>
        <AgentLabel agent={CODEX_AGENT} />
      </p>
      <h1 className="hero-heading">{HERO.heading}</h1>
      <p className="hero-sub">{HERO.sub}</p>

      <div className="cta-row desktop-only">
        <a
          className="cta-primary"
          href={HERO.ctaHref}
          onClick={scrollToLinkedSection}
        >
          <span>{HERO.ctaLabel}</span>
          <svg
            aria-hidden="true"
            className="cta-primary-arrow"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
          </svg>
        </a>
      </div>
    </section>
  );
}
