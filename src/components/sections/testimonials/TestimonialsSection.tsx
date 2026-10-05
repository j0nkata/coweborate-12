import Image from "next/image";
import { TestimonialsStackMotion } from "./TestimonialsStackMotion";
import styles from "./TestimonialsSection.module.css";

type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  image: string | null;
  project?: string;
  temporary: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: "placeholder-01",
    quote:
      "Тук ще бъде добавен одобрен клиентски отзив за съвместната работа по проекта.",
    name: "Име на клиент",
    role: "Роля",
    company: "Компания",
    image: "/testimonial-avatar-placeholder.svg",
    project: "Проект / услуга",
    temporary: true,
  },
  {
    id: "placeholder-02",
    quote:
      "Тук ще бъде добавен одобрен клиентски отзив за процеса и комуникацията.",
    name: "Име на клиент",
    role: "Роля",
    company: "Компания",
    image: "/testimonial-avatar-placeholder.svg",
    project: "Проект / услуга",
    temporary: true,
  },
  {
    id: "placeholder-03",
    quote:
      "Тук ще бъде добавен одобрен клиентски отзив за крайния резултат.",
    name: "Име на клиент",
    role: "Роля",
    company: "Компания",
    image: "/testimonial-avatar-placeholder.svg",
    project: "Проект / услуга",
    temporary: true,
  },
];

function TestimonialItem({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  return (
    <article
      className={styles.panel}
      style={{ zIndex: index + 1 }}
      data-testimonial
      data-testimonial-id={testimonial.id}
      data-testimonial-index={index}
      data-testimonial-temporary={testimonial.temporary ? "" : undefined}
    >
      <span className={styles.quoteMark} aria-hidden="true">
        “
      </span>

      <blockquote className={styles.quote} data-testimonial-quote>
        <p>{testimonial.quote}</p>
      </blockquote>

      <footer className={styles.person} data-testimonial-person>
        {testimonial.image ? (
          <Image
            className={styles.avatar}
            src={testimonial.image}
            alt=""
            width={104}
            height={104}
          />
        ) : null}
        <div className={styles.personCopy}>
          <cite>{testimonial.name}</cite>
          <p>
            {testimonial.role} / {testimonial.company}
          </p>
        </div>
      </footer>
    </article>
  );
}

export function TestimonialsSection() {
  return (
    <section
      className={styles.section}
      aria-labelledby="testimonials-title"
      data-testimonials-section
      data-cursor-theme="light"
    >
      <div className={styles.composition}>
        <header className={styles.intro} data-testimonials-intro>
          <h2 className={styles.title} id="testimonials-title">
            <span>КЛИЕНТИТЕ</span>
            <span>ГОВОРЯТ</span>
            <span>ВМЕСТО</span>
            <span>НАС.</span>
          </h2>
          <p className={styles.introText}>
            Тук ще подредим думите на клиентите ни, след като получим
            одобрение за публикуването им.
          </p>
        </header>

        <div className={styles.list} data-testimonials-list>
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialItem
              testimonial={testimonial}
              index={index}
              key={testimonial.id}
            />
          ))}
        </div>
      </div>
      <TestimonialsStackMotion />
    </section>
  );
}
