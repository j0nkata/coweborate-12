import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SERVICES } from "@/lib/constants";

export function Services() {
  return (
    <section
      className="section services-section"
      id="services"
      aria-labelledby="services-title"
      data-cursor-theme="dark"
    >
      <Container>
        <div className="section-intro section-intro--split" data-reveal>
          <SectionLabel index="02">УСЛУГИ</SectionLabel>
          <h2 id="services-title">От идея до работещ продукт.</h2>
        </div>

        <ol className="service-list">
          {SERVICES.map((service, index) => (
            <li key={service.title} data-reveal>
              <span className="service-number">0{index + 1}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <span className="service-mark" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
