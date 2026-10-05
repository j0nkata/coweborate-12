import Link from "next/link";
import { SERVICES } from "./servicesData";
import styles from "./ServicesShowcase.module.css";

const SERVICES_INTRO =
  "От ясната посока до развитието след старта — една система за реалния бизнес.";

function ServicesTitle() {
  return (
    <>
      <span>КАКВО</span>
      <span>ПРАВИМ.</span>
    </>
  );
}

export function ServicesShowcase() {
  return (
    <section
      className={styles.section}
      id="services"
      aria-labelledby="services-showcase-title"
      data-services-section
      data-cursor-theme="dark"
    >
      <div className={styles.composition}>
        <div className={styles.titleColumn}>
          <h2
            className={styles.title}
            id="services-showcase-title"
            data-services-sticky-title
          >
            <ServicesTitle />
          </h2>
        </div>

        <div className={styles.intro} data-services-intro>
          <p className={styles.introText}>{SERVICES_INTRO}</p>
        </div>

        <ol className={styles.servicesRail} data-services-rail>
          {SERVICES.map((service) => (
            <li className={styles.item} key={service.slug}>
              <Link
                className={styles.row}
                href={`/services/${service.slug}`}
                aria-label={`Научи повече за ${service.title}`}
                data-service-row
              >
                <h3 data-service-title>{service.title}</h3>
                <p data-service-description>{service.shortDescription}</p>
                <span
                  className={styles.indicator}
                  data-service-indicator
                  aria-hidden="true"
                >
                  <span className={styles.indicatorDot} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
