import { MediaPlaceholder } from "#/components/ui/media-placeholder";
import { SectionHeading } from "#/components/ui/section-heading";
import { STEPS, STEPS_SECTION } from "#/content/steps";

/**
 * Two cards, each an illustration over the claim it illustrates.
 *
 * This is the layout that pushed every section from 640px to the header's own
 * 1120px: at 640 two cards side by side are ~310px each, which is too narrow for
 * a figure to say anything. The 640 measure still exists, but as a cap on prose
 * inside a section rather than on the section — see `.section` in shell.css.
 */
export function HowItWorksSection() {
  return (
    <section className="section" id="how-it-works">
      <SectionHeading desc={STEPS_SECTION.desc} title={STEPS_SECTION.heading} />

      <div className="steps-grid">
        {STEPS.map((step, index) => (
          <article className="step-card" key={step.id}>
            <MediaPlaceholder
              compact
              index={`0${index + 1}`}
              title={index === 0 ? "点选与可视化修改" : "写回与验证结果"}
            />
            <h3 className="step-title">{step.title}</h3>
            <p className="step-card-desc">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
