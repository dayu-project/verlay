import { cls } from "./dom";

const SVG_NS = "http://www.w3.org/2000/svg";
let logoSequence = 0;

/**
 * The compact Verlay spark used by overlay-only chrome.
 *
 * Keep it as vector geometry: the same mark is rendered at 28 px in the
 * launcher and 48 px in both empty states, often on a high-density display.
 * The former embedded 64 px bitmap was therefore upscaled and visibly soft.
 */
export function verlayLogo(size = 28): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");
  const maskId = `verlay-spark-cutout-${logoSequence++}`;
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", cls("verlay-logo"));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("width", String(size));
  svg.innerHTML = `
    <defs>
      <mask id="${maskId}">
        <rect width="64" height="64" fill="#fff" />
        <circle cx="41.5" cy="32" r="13" fill="#000" />
      </mask>
    </defs>
    <g fill="#3157F6" mask="url(#${maskId})">
      <rect x="29.5" y="4" width="7.5" height="29" rx="2.2" />
      <rect x="4" y="28.25" width="29" height="7.5" rx="2.2" />
      <rect x="14" y="8" width="7.5" height="28" rx="2.2"
        transform="rotate(-45 17.75 22)" />
      <rect x="14" y="28" width="7.5" height="28" rx="2.2"
        transform="rotate(45 17.75 42)" />
      <rect x="29.5" y="31" width="7.5" height="29" rx="2.2" />
    </g>
    <g fill="#3157F6">
      <circle cx="52.4" cy="14.9" r="3.75" />
      <circle cx="43.4" cy="23.8" r="3.75" />
      <circle cx="35.2" cy="33.25" r="3.75" />
      <circle cx="47.35" cy="33.25" r="3.75" />
      <circle cx="57.65" cy="33.25" r="3.75" />
      <circle cx="43.4" cy="42.45" r="3.75" />
      <circle cx="52.45" cy="50.9" r="3.75" />
    </g>
  `;
  return svg;
}
