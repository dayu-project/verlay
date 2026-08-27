import type { MouseEvent } from "react";

const SCROLL_DURATION_MS = 650;
let activeScrollFrame: number | undefined;
let interruptedScrollBehavior: string | undefined;

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function animateScrollTo(top: number) {
  if (activeScrollFrame !== undefined) {
    window.cancelAnimationFrame(activeScrollFrame);
    document.documentElement.style.scrollBehavior =
      interruptedScrollBehavior ?? "";
    activeScrollFrame = undefined;
    interruptedScrollBehavior = undefined;
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const startTop = window.scrollY;
  const distance = top - startTop;
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;

  interruptedScrollBehavior = previousScrollBehavior;
  root.style.scrollBehavior = "auto";
  root.getBoundingClientRect();

  if (reduceMotion || Math.abs(distance) < 1) {
    window.scrollTo({ left: 0, top });
    root.style.scrollBehavior = previousScrollBehavior;
    activeScrollFrame = undefined;
    interruptedScrollBehavior = undefined;
    return;
  }

  const startedAt = window.performance.now();

  const move = (now: number) => {
    const progress = Math.min((now - startedAt) / SCROLL_DURATION_MS, 1);
    window.scrollTo({
      left: 0,
      top: startTop + distance * easeOutCubic(progress),
    });

    if (progress < 1) {
      activeScrollFrame = window.requestAnimationFrame(move);
      return;
    }

    activeScrollFrame = undefined;
    root.style.scrollBehavior = previousScrollBehavior;
    interruptedScrollBehavior = undefined;
  };

  activeScrollFrame = window.requestAnimationFrame(move);
}

export function scrollToSection(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string
) {
  event.preventDefault();

  const target = document.getElementById(sectionId);
  if (!target) {
    window.location.hash = sectionId;
    return;
  }

  const scrollPaddingTop = Number.parseFloat(
    window.getComputedStyle(document.documentElement).scrollPaddingTop
  );
  const scrollMarginTop = Number.parseFloat(
    window.getComputedStyle(target).scrollMarginTop
  );
  const top =
    target.getBoundingClientRect().top +
    window.scrollY -
    (Number.isFinite(scrollPaddingTop) ? scrollPaddingTop : 0) -
    (Number.isFinite(scrollMarginTop) ? scrollMarginTop : 0);

  animateScrollTo(top);

  const nextHash = `#${sectionId}`;
  if (window.location.hash !== nextHash) {
    window.history.pushState(null, "", nextHash);
  }
}

export function scrollToLinkedSection(event: MouseEvent<HTMLAnchorElement>) {
  const sectionId = event.currentTarget.hash.slice(1);
  scrollToSection(event, sectionId);
}
