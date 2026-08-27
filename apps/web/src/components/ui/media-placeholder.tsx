import { cn } from "#/lib/cn";

export function MediaPlaceholder({
  className,
  compact = false,
  index,
  title,
}: {
  className?: string;
  compact?: boolean;
  index?: string;
  title: string;
}) {
  return (
    <div
      aria-label={`${title}，待替换产品图`}
      className={cn(
        "media-placeholder",
        compact && "media-placeholder-compact",
        className
      )}
      role="img"
    >
      <div aria-hidden="true" className="media-placeholder-grid" />
      <div className="media-placeholder-content">
        {index ? (
          <span className="media-placeholder-index">{index}</span>
        ) : null}
        <svg
          aria-hidden="true"
          className="media-placeholder-icon"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            height="15"
            rx="2.5"
            stroke="currentColor"
            width="18"
            x="3"
            y="4.5"
          />
          <path
            d="m6.5 16 3.5-3.5 2.5 2.5 2.3-2.3 2.7 3.3"
            stroke="currentColor"
          />
          <circle cx="16.5" cy="8.5" fill="currentColor" r="1.25" />
        </svg>
        <div>
          <strong>{title}</strong>
          <span>稍后替换为插件实机画面</span>
        </div>
      </div>
    </div>
  );
}
