import Image from "next/image";
import { HeroEditorialMotion } from "@/components/motion/HeroEditorialMotion";
import { HeroSectionTransition } from "@/components/motion/HeroSectionTransition";

const HERO_PROJECT_MEDIA = [
  {
    src: "/project-mockup-1.png",
    alt: "Екранен продуктов макет върху син фон.",
    position: "50% 50%",
  },
  {
    src: "/project-mockup-2.png",
    alt: "Мобилен продуктов интерфейс върху син фон.",
    position: "50% 45%",
  },
  {
    src: "/project-mockup-3.png",
    alt: "Лаптоп с надпис Gogo върху дълбок син екран.",
    position: "50% 43%",
  },
] as const;

export function HeroExperience() {
  return (
    <section
      className="hero hero-editorial"
      id="top"
      aria-labelledby="hero-title"
      data-cursor-theme="dark"
      data-hero-editorial
    >
      <div className="hero-editorial__inner">
        <h1 className="hero-editorial__headline" id="hero-title">
          <span className="hero-editorial__line hero-editorial__line--primary">
            <span data-hero-line data-hero-primary data-hero-project-target="0">
              САЙТОВЕ С
            </span>
          </span>

          <span className="hero-editorial__middle" data-hero-middle>
            <span
              className="hero-editorial__media-unit"
              data-hero-media-unit
              aria-hidden="true"
            >
              <span className="hero-editorial__media" data-hero-media>
                {HERO_PROJECT_MEDIA.map((project, index) => (
                  <Image
                    className="hero-editorial__media-image"
                    data-hero-media-image
                    data-current={index === 0 ? "true" : "false"}
                    src={project.src}
                    alt=""
                    fill
                    loading="eager"
                    sizes="(max-width: 768px) 74vw, 20vw"
                    style={{ objectPosition: project.position }}
                    key={project.src}
                  />
                ))}
              </span>
              <span className="hero-editorial__project-counter">
                <span data-hero-project-index>01</span>
                <span> / {String(HERO_PROJECT_MEDIA.length).padStart(2, "0")}</span>
              </span>
            </span>

            <span className="hero-editorial__line hero-editorial__line--character">
              <span
                data-hero-line
                data-hero-character
                data-hero-project-target="1"
              >
                ХАРАКТЕР.
              </span>
            </span>
          </span>

          <span className="hero-editorial__line hero-editorial__line--final">
            <span data-hero-line data-hero-final data-hero-project-target="2">
              КОД С ЦЕЛ.
            </span>
          </span>
        </h1>

        <a className="hero-editorial__cta" data-hero-action href="#work">
          <span>ВИЖ ПРОЕКТИТЕ</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div
        className="hero-editorial__surface-transition"
        data-hero-surface-transition
        aria-hidden="true"
      />

      <HeroEditorialMotion />
      <HeroSectionTransition />
    </section>
  );
}
