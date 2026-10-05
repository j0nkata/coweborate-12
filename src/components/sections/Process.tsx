import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PROCESS_STEPS } from "@/lib/constants";

export function Process() {
  return (
    <section
      className="section process-section"
      id="process"
      aria-labelledby="process-title"
      data-cursor-theme="light"
    >
      <Container>
        <div className="process-heading" data-reveal>
          <SectionLabel index="03">ПРОЦЕС</SectionLabel>
          <h2 id="process-title">
            Четири стъпки.
            <br />
            Една посока.
          </h2>
        </div>

        <ol className="process-grid">
          {PROCESS_STEPS.map((step) => (
            <li key={step.number} data-reveal>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
