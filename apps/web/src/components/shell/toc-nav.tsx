import { type MouseEvent, useCallback } from "react";
import { GitHubIcon } from "#/components/ui/github-icon";
import { TOC_EXTERNAL_LINKS, TOC_LINKS } from "#/content/nav";
import { scrollToLinkedSection } from "#/lib/scroll-to-section";

/**
 * The table of contents.
 *
 * `aria-current="true"` rather than a class alone, so the active entry is
 * announced and not merely coloured. The scroll-spy that sets it lives in the
 * header, which owns the state — this component only renders.
 */
export function TocNav({
  activeId,
  onNavigate,
}: {
  activeId: string;
  onNavigate: () => void;
}) {
  const handleInternalNavigation = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      scrollToLinkedSection(event);
      onNavigate();
    },
    [onNavigate]
  );

  return (
    <nav aria-label="本页导航" className="toc" id="toc-nav">
      <div className="toc-inner">
        {TOC_LINKS.map((link) => (
          <a
            aria-current={activeId === link.id ? "true" : undefined}
            className="toc-link"
            href={`#${link.id}`}
            key={link.id}
            onClick={handleInternalNavigation}
          >
            {link.label}
          </a>
        ))}

        {TOC_EXTERNAL_LINKS.length > 0 ? (
          <div aria-hidden="true" className="toc-sep" />
        ) : null}

        {TOC_EXTERNAL_LINKS.map((link) => (
          <a
            aria-label={link.label}
            className="toc-link"
            href={link.href}
            key={link.href}
            onClick={onNavigate}
            rel="noopener"
            target="_blank"
          >
            <GitHubIcon />
          </a>
        ))}
      </div>
    </nav>
  );
}
