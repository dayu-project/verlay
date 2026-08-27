import { VerlayDemo } from "#/components/hero/verlay-demo";

export function HeroStage() {
  return (
    <div className="hero-visual">
      <div className="hero-product-window">
        <div aria-hidden="true" className="hero-window-bar">
          <span className="hero-window-left">
            <span className="hero-window-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="hero-window-nav">
              <NavArrow />
              <NavArrow forward />
            </span>
          </span>
          <span className="hero-window-url">
            localhost:3000
            <ReloadIcon />
          </span>
          <span className="hero-window-share">
            <ShareIcon />
          </span>
        </div>

        <VerlayDemo />
      </div>
    </div>
  );
}

function NavArrow({ forward = false }: { forward?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={forward ? "M3.8 2L6.8 5L3.8 8" : "M6.2 2L3.2 5L6.2 8"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 5a3 3 0 1 1-.9-2.1M8 1.4v1.9H6.1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 10 10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 1v5.4M3.2 2.6L5 .9l1.8 1.7M2 5.6v3h6v-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}
