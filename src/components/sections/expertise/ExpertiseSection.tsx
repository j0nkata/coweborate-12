import { EXPERTISE_ITEMS } from "./expertiseData";
import styles from "../services/ServicesShowcase.module.css";

const EXPERTISE_INTRO =
  "Съчетаваме техническо разбиране, търговска логика и практически опит в дигитални системи, които трябва да работят надеждно в реален бизнес.";

export function ExpertiseSection() {
  return (
    <section
      className={styles.section}
      id="expertise"
      aria-labelledby="expertise-title"
      data-expertise-section
      data-cursor-theme="dark"
    >
      <div className={styles.composition}>
        <div className={styles.titleColumn}>
          <h2
            className={styles.title}
            id="expertise-title"
            data-expertise-sticky-title
          >
            <span>ЕКСПЕРТИЗА.</span>
          </h2>
        </div>

        <div className={styles.intro} data-expertise-intro>
          <p className={styles.introText}>{EXPERTISE_INTRO}</p>
        </div>

        <ol className={styles.servicesRail} data-expertise-rail>
          {EXPERTISE_ITEMS.map((item) => {
            const titleId = `expertise-${item.id}-title`;
            const descriptionId = `expertise-${item.id}-description`;

            return (
              <li className={styles.item} key={item.id}>
                <article
                  className={styles.row}
                  tabIndex={0}
                  aria-labelledby={titleId}
                  aria-describedby={descriptionId}
                  data-cursor="interactive"
                  data-expertise-row
                >
                  <h3 id={titleId} data-expertise-title>
                    {item.title}
                  </h3>
                  <p id={descriptionId} data-expertise-description>
                    {item.description}
                  </p>
                  <span
                    className={styles.indicator}
                    data-expertise-indicator
                    aria-hidden="true"
                  >
                    <span className={styles.indicatorDot} />
                  </span>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
