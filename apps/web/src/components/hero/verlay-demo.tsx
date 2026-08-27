import type { ReactNode } from "react";
import { AGENT_MARKS } from "#/content/agent-marks";
import { publicAsset } from "#/lib/public-asset";
import { FIGMA_ASSETS } from "../../../../../packages/overlay/src/figma-assets";

function getCodexMark() {
  const mark = AGENT_MARKS.find((candidate) => candidate.name === "Codex");
  if (!mark) {
    throw new Error("Missing Codex agent mark");
  }
  return mark;
}

const CODEX_MARK = getCodexMark();

/**
 * A CSS-driven product walkthrough: small enough to loop like a GIF, but kept
 * as real vector/text UI so it remains sharp at every responsive size.
 */
export function VerlayDemo() {
  return (
    <div
      aria-label="映证演示：选择网页标题，修改颜色，确认后由 Codex 写回代码并保存成功"
      className="verlay-demo"
      role="img"
    >
      <div aria-hidden="true" className="verlay-demo-scene">
        <MockWebsite />
        <VerlayPanel />
        <DemoCursor />
      </div>
    </div>
  );
}

function MockWebsite() {
  return (
    <div className="verlay-demo-site">
      <div className="verlay-demo-site-nav">
        <span className="verlay-demo-site-brand">
          <img
            alt=""
            height="20"
            src={publicAsset("brand/verlay-spark-logo-blue.png")}
            width="20"
          />
          映证 Verlay
        </span>
      </div>

      <div className="verlay-demo-site-hero">
        <div className="verlay-demo-title-wrap">
          <p className="verlay-demo-site-title">
            让每一次发布
            <br />
            都更有把握
          </p>
          <SelectionBox />
        </div>
        <p className="verlay-demo-site-copy">
          从想法到产品，用更清晰的协作方式完成每一步。
        </p>
        <div className="verlay-demo-site-actions">
          <span className="verlay-demo-site-cta">开始体验</span>
        </div>
      </div>

      <div className="verlay-demo-site-cards">
        <div className="verlay-demo-feature-card">
          <i aria-hidden="true" className="verlay-demo-feature-icon">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M16.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path d="M3 19c0-3 2-5 5-5s5 2 5 5" />
              <path d="M14 14c2.8 0 5 1.8 5 4.5" />
            </svg>
          </i>
          <div className="verlay-demo-feature-copy">
            <strong>实时协作</strong>
            <small>在本地页面直接点选和调整。</small>
          </div>
        </div>
        <div className="verlay-demo-feature-card">
          <i aria-hidden="true" className="verlay-demo-feature-icon">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M12 3 5 6v5c0 4.5 2.8 7.5 7 9 4.2-1.5 7-4.5 7-9V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </i>
          <div className="verlay-demo-feature-copy">
            <strong>安全发布</strong>
            <small>修改确认后再写回本地源码。</small>
          </div>
        </div>
        <div className="verlay-demo-feature-card">
          <i aria-hidden="true" className="verlay-demo-feature-icon">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M20 11a8 8 0 1 0-2.3 5.7" />
              <path d="M20 5v6h-6" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </i>
          <div className="verlay-demo-feature-copy">
            <strong>持续验证</strong>
            <small>自动验证每一次修改结果。</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerlayPanel() {
  return (
    <div className="verlay-demo-panel">
      <div className="verlay-demo-tabs">
        <span className="verlay-demo-tab verlay-demo-tab-edit">编辑元素</span>
        <span className="verlay-demo-tab verlay-demo-tab-codex">Codex助手</span>
      </div>

      <div className="verlay-demo-panel-stage">
        <EditPane />
        <CodexPane />
      </div>

      <ColorPickerBoard />

      <div className="verlay-demo-edit-footer">
        <span className="verlay-demo-change-count">
          <span>当前修改元素&nbsp; 0 条</span>
          <span>当前修改元素&nbsp; 1 条</span>
        </span>
        <span className="verlay-demo-confirm">确定</span>
      </div>
    </div>
  );
}

function EditPane() {
  return (
    <div className="verlay-demo-pane verlay-demo-edit-pane">
      <section className="verlay-ui-geometry">
        <h3>位置</h3>
        <div className="verlay-ui-grid">
          <DemoField icon="X" value="0" />
          <DemoField icon="Y" value="0" />
          <DemoField icon="W" value="387" />
          <DemoField icon="H" value="188" />
          <div className="verlay-ui-corner-row">
            <DemoField asset="geometry-corners" value="12" />
            <DemoIconButton asset="spacing-independent" />
          </div>
        </div>
      </section>

      <DemoSection title="内外边距">
        <div className="verlay-ui-spacing-row">
          <div className="verlay-ui-grid">
            <DemoField asset="padding-horizontal" value="20" />
            <DemoField asset="padding-vertical" value="20" />
          </div>
          <DemoIconButton asset="spacing-independent" />
        </div>
        <div className="verlay-ui-spacing-row">
          <div className="verlay-ui-grid">
            <DemoField asset="margin-horizontal" value="0" />
            <DemoField asset="margin-vertical" value="0" />
          </div>
          <DemoIconButton asset="spacing-independent" />
        </div>
      </DemoSection>

      <DemoSection action title="填充">
        <DemoPaint animated color="#FFFFFF" hex="FFFFFF" opacity="100" />
      </DemoSection>

      <DemoSection action title="描边">
        <div className="verlay-ui-stroke-row">
          <DemoField icon="☰" value="0" />
          <DemoIconButton asset="geometry-corners" />
        </div>
      </DemoSection>

      <DemoSection action title="阴影">
        <div className="verlay-ui-grid verlay-ui-shadow-grid">
          <DemoField icon="X" value="0" />
          <DemoField icon="Y" value="0" />
          <DemoField icon="模糊" value="0" />
          <DemoField icon="扩展" value="1" />
        </div>
        <DemoPaint color="#0A1B33" hex="0A1B33" opacity="10" />
      </DemoSection>
    </div>
  );
}

type FigmaAsset = keyof typeof FIGMA_ASSETS;

function DemoIcon({ asset }: { asset: FigmaAsset }) {
  return <img alt="" height="20" src={FIGMA_ASSETS[asset]} width="20" />;
}

function DemoIconButton({ asset }: { asset: FigmaAsset }) {
  return (
    <span className="verlay-ui-icon-button">
      <DemoIcon asset={asset} />
    </span>
  );
}

function DemoField({
  asset,
  icon,
  value,
}: {
  asset?: FigmaAsset;
  icon?: string;
  value: string;
}) {
  return (
    <span className="verlay-ui-field">
      <span className="verlay-ui-field-icon">
        {asset ? <DemoIcon asset={asset} /> : (icon ?? "")}
      </span>
      <span>{value}</span>
    </span>
  );
}

function DemoSection({
  action = false,
  children,
  title,
}: {
  action?: boolean;
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="verlay-ui-section">
      <div className="verlay-ui-section-head">
        <h3>{title}</h3>
        {action ? <DemoIcon asset="add-fill" /> : null}
      </div>
      <div className="verlay-ui-section-body">{children}</div>
    </section>
  );
}

function DemoPaint({
  animated = false,
  color,
  hex,
  opacity,
}: {
  animated?: boolean;
  color: string;
  hex: string;
  opacity: string;
}) {
  return (
    <div
      className={
        animated
          ? "is-animated-fill verlay-ui-paint-row"
          : "verlay-ui-paint-row"
      }
    >
      <i style={{ background: color }} />
      <span className="verlay-ui-paint-hex">
        <span>#{hex}</span>
        {animated ? <span>#3157F6</span> : null}
      </span>
      <span className="verlay-ui-paint-opacity">{opacity} %</span>
    </div>
  );
}

function ColorPickerBoard() {
  return (
    <div className="verlay-demo-color-picker">
      <div className="verlay-demo-picker-sv">
        <i />
      </div>
      <div className="verlay-demo-picker-hue">
        <i />
      </div>
      <div className="verlay-demo-picker-values">
        <i />
        <span>#3157F6</span>
        <span>100 %</span>
      </div>
      <div className="verlay-demo-picker-swatches">
        <i style={{ background: "#FFFFFF" }} />
        <i style={{ background: "#0A1B33" }} />
        <i className="is-target" style={{ background: "#3157F6" }} />
        <i style={{ background: "#7C3AED" }} />
        <i style={{ background: "#16A36A" }} />
      </div>
    </div>
  );
}

function CodexPane() {
  return (
    <div className="verlay-demo-pane verlay-demo-codex-pane">
      <div className="verlay-demo-codex-tools">
        <CodexIcon />
        <span>＋</span>
        <HistoryIcon />
      </div>

      <div className="verlay-ui-codex-transcript">
        <div className="verlay-ui-user-message">
          将选中标题颜色更新为 #3157F6，并安全写回源码
        </div>
        <div className="verlay-ui-codex-status">
          <span>
            <CodexIcon /> Codex 正在写回
          </span>
          <i className="verlay-demo-codex-pulse" />
        </div>
        <div className="verlay-demo-agent-steps">
          <div className="verlay-demo-agent-step is-step-one">
            <i />
            <span>
              <strong>读取</strong> src/components/Hero.tsx
            </span>
          </div>
          <div className="verlay-demo-agent-step is-step-two">
            <i />
            <span>
              <strong>更新</strong> 标题文字颜色
            </span>
          </div>
        </div>
        <div className="verlay-demo-success">
          <span className="verlay-demo-success-icon">✓</span>
          <span>
            <strong>保存成功</strong>
            <small>已写回本地源码，并自动验证修改结果</small>
          </span>
        </div>
      </div>

      <div className="verlay-demo-composer">
        <span className="verlay-demo-composer-chip">标题 ×</span>
        <span className="verlay-demo-composer-placeholder">
          描述需要修改的内容…
        </span>
        <span className="verlay-demo-composer-send">↑</span>
      </div>
    </div>
  );
}

function SelectionBox() {
  return (
    <div className="verlay-demo-selection">
      <span>h1.hero-title</span>
      <i className="is-nw" />
      <i className="is-ne" />
      <i className="is-se" />
      <i className="is-sw" />
    </div>
  );
}

function DemoCursor() {
  return (
    <svg
      aria-hidden="true"
      className="verlay-demo-cursor"
      fill="none"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.4 1.8L15.2 9.2L9.8 10.6L7.2 15.8L2.4 1.8Z"
        fill="white"
        stroke="#12151b"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function CodexIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: AGENT_MARKS is
          trusted module-level SVG markup and never contains caller input. */}
      <g dangerouslySetInnerHTML={{ __html: CODEX_MARK.body }} />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(-0.8 -0.8) scale(1.067)">
        <path
          d="M12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18C8.79 18 6.17 15.48 6.01 12.31C6 12.14 6.14 12 6.31 12H6.74C6.89 12 7 12.11 7.01 12.26C7.14 14.9 9.32 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C10.36 7 8.91 7.79 8 9H9.5C9.78 9 10 9.22 10 9.5C10 9.78 9.78 10 9.5 10H6.5C6.22 10 6 9.78 6 9.5V6.5C6 6.22 6.22 6 6.5 6C6.78 6 7 6.22 7 6.5V8.69C8.07 7.07 9.91 6 12 6ZM12 9C12.28 9 12.5 9.22 12.5 9.5V11.79L13.85 13.15L13.92 13.22C14.05 13.42 14.02 13.68 13.85 13.85C13.68 14.02 13.42 14.05 13.22 13.92L13.15 13.85L11.65 12.35C11.55 12.26 11.5 12.13 11.5 12V9.5C11.5 9.22 11.72 9 12 9Z"
          fill="currentColor"
          fillOpacity="0.9"
        />
      </g>
    </svg>
  );
}
