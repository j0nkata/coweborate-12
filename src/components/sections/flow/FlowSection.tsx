"use client";

import { useLayoutEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsapClient";
import { PROCESS_MORPH_STATES } from "./processMorphStates";
import { ProcessMorphVisual } from "./ProcessMorphVisual";
import styles from "./FlowSection.module.css";

const PROCESS_STEPS = [
  {
    number: "01",
    title: "ОПОЗНАВАНЕ",
    description: "Опознаваме бизнеса, аудиторията и реалната цел на проекта.",
  },
  {
    number: "02",
    title: "ПОСОКА И СТРУКТУРА",
    description: "Подреждаме съдържанието, функциите и ясната посока на продукта.",
  },
  {
    number: "03",
    title: "ДИЗАЙН И РАЗРАБОТКА",
    description: "Превръщаме посоката във визуална система и стабилен уеб продукт.",
  },
  {
    number: "04",
    title: "СТАРТ И РАЗВИТИЕ",
    description: "Тестваме, публикуваме и развиваме системата след старта.",
  },
] as const;

export function FlowSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setupMotion() {
      const [{ gsap, ScrollTrigger }, { MorphSVGPlugin }] = await Promise.all([
        loadGsap(),
        import("gsap/MorphSVGPlugin"),
        document.fonts.ready,
      ]);
      if (cancelled || !rootRef.current) return;
      gsap.registerPlugin(MorphSVGPlugin);

      const root = rootRef.current;
      const handoffBoundary = root.previousElementSibling as HTMLElement | null;
      const services = handoffBoundary?.previousElementSibling as HTMLElement | null;
      const endSentinel = services?.querySelector<HTMLElement>("[data-services-end-sentinel]");
      const servicesHeading = services?.querySelector<HTMLElement>("[data-services-heading]");
      const surface = root.querySelector<HTMLElement>("[data-process-surface]");
      const heading = root.querySelector<HTMLElement>("[data-process-heading]");
      const oldTitle = root.querySelector<HTMLElement>("[data-process-old-title]");
      const processTitle = root.querySelector<HTMLElement>("[data-process-title]");
      const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-process-step]"));
      const visual = root.querySelector<HTMLElement>('[data-process-visual="desktop"]');

      if (
        services?.id !== "services" ||
        !handoffBoundary?.hasAttribute("data-services-process-handoff") ||
        !endSentinel ||
        !servicesHeading ||
        !surface ||
        !heading ||
        !oldTitle ||
        !processTitle ||
        !visual ||
        steps.length !== PROCESS_STEPS.length
      ) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();

        media.add(
          {
            desktop: "(min-width: 769px)",
            mobile: "(max-width: 768px)",
            reduce: "(prefers-reduced-motion: reduce)",
          },
          (match) => {
            const mobile = Boolean(match.conditions?.mobile);
            const reduce = Boolean(match.conditions?.reduce);
            if (reduce) {
              root.dataset.processMotion = "reduced";
              return () => delete root.dataset.processMotion;
            }

            root.dataset.processMotion = "ready";
            const stickyTop = () => mobile ? 24 : Number.parseFloat(getComputedStyle(heading).top) || 0;
            const handoffDistance = () => window.innerHeight * 0.8;
            const absoluteTop = (element: Element) => element.getBoundingClientRect().top + window.scrollY;
            const paperRise = () => Math.max(
              0,
              absoluteTop(root) - absoluteTop(endSentinel) + stickyTop() - handoffDistance() * 0.6,
            );
            let headingBridgeActive = false;

            gsap.set(surface, { y: 0 });
            gsap.set(oldTitle, {
              autoAlpha: mobile ? 0 : 1,
              clipPath: "inset(0 0 0% 0)",
              color: "var(--paper)",
              y: 0,
            });
            gsap.set(processTitle, {
              autoAlpha: 0,
              clipPath: "inset(0 0 100% 0)",
              y: 24,
            });

            const syncHeadingAxis = () => {
              if (mobile || !headingBridgeActive) return;
              const currentY = Number(gsap.getProperty(heading, "y")) || 0;
              const baseTop = heading.getBoundingClientRect().top - currentY;
              gsap.set(heading, { y: stickyTop() - baseTop });
            };

            const handoff = gsap.timeline({ paused: true });
            const phase = { value: 0 };
            handoff.to(phase, { value: 1, duration: 1, ease: "none" }, 0);
            handoff.to(surface, {
              y: () => -paperRise(),
              duration: 0.6,
              ease: "none",
            }, 0);

            if (!mobile) {
              handoff
                .to(oldTitle, { clipPath: "inset(0 0 100% 0)", y: -24, autoAlpha: 0, duration: 0.2, ease: "power2.in" }, 0.45)
                .to(oldTitle, { color: "var(--ink)", duration: 0.05, ease: "none" }, 0.56);
            }
            handoff.to(processTitle, {
              autoAlpha: 1,
              clipPath: "inset(0 0 0% 0)",
              y: 0,
              duration: mobile ? 0.18 : 0.2,
              ease: "power2.out",
            }, mobile ? 0.78 : 0.6);

            handoff.eventCallback("onUpdate", () => {
              root.dataset.handoffProgress = handoff.progress().toFixed(4);
              syncHeadingAxis();
            });

            const handoffTrigger = ScrollTrigger.create({
              id: "services-process-handoff",
              trigger: endSentinel,
              animation: handoff,
              start: () => `top top+=${stickyTop()}`,
              end: () => `+=${handoffDistance()}`,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onEnter: () => {
                headingBridgeActive = true;
                if (!mobile) gsap.set(servicesHeading, { autoAlpha: 0 });
                syncHeadingAxis();
              },
              onEnterBack: () => {
                headingBridgeActive = true;
                if (!mobile) gsap.set(servicesHeading, { autoAlpha: 0 });
                syncHeadingAxis();
              },
              onLeaveBack: () => {
                headingBridgeActive = false;
                gsap.set(heading, { clearProps: "transform" });
                gsap.set(servicesHeading, { clearProps: "opacity,visibility,transform,clipPath" });
              },
              onRefresh: (self) => {
                root.dataset.handoffProgress = self.progress.toFixed(4);
                syncHeadingAxis();
              },
            });

            const bridgeTrigger = mobile ? undefined : ScrollTrigger.create({
              id: "process-heading-bridge",
              trigger: root,
              start: "top bottom",
              end: () => `top ${stickyTop()}px`,
              invalidateOnRefresh: true,
              onUpdate: () => {
                if (handoffTrigger.progress >= 0.999) syncHeadingAxis();
              },
              onLeave: () => {
                headingBridgeActive = false;
                gsap.set(heading, { y: 0 });
              },
              onEnterBack: () => {
                headingBridgeActive = true;
                syncHeadingAxis();
              },
            });

            const copyTriggers: ScrollTrigger[] = [];
            let resizeFrame = 0;
            let observedWidth = window.innerWidth;
            let observedHeight = window.innerHeight;
            let chapterPosition: number | null = null;
            let restoringPosition = false;
            const rememberChapter = () => {
              if (mobile || restoringPosition || window.innerWidth !== observedWidth || window.innerHeight !== observedHeight) return;
              const position = (window.scrollY - absoluteTop(root)) / window.innerHeight;
              chapterPosition = position >= 0 && position < PROCESS_STEPS.length ? position : null;
            };
            const restoreChapterOnResize = () => {
              const position = chapterPosition;
              observedWidth = window.innerWidth;
              observedHeight = window.innerHeight;
              if (mobile || position === null) return;
              restoringPosition = true;
              window.cancelAnimationFrame(resizeFrame);
              resizeFrame = window.requestAnimationFrame(() => {
                ScrollTrigger.refresh();
                window.scrollTo({
                  top: absoluteTop(root) + position * window.innerHeight,
                  behavior: "instant",
                });
                ScrollTrigger.update();
                restoringPosition = false;
                rememberChapter();
              });
            };
            if (!mobile) {
              window.addEventListener("scroll", rememberChapter, { passive: true });
              window.addEventListener("resize", restoreChapterOnResize);
              rememberChapter();
              const outline = visual.querySelector<SVGPathElement>("[data-morph-outline]");
              const spine = visual.querySelector<SVGPathElement>("[data-morph-spine]");
              const accent = visual.querySelector<SVGRectElement>("[data-morph-accent]");
              const details = Array.from(visual.querySelectorAll<SVGPathElement>("[data-morph-detail]"));
              if (outline && spine && accent && details.length === PROCESS_MORPH_STATES.length) {
                const visualTimeline = gsap.timeline({
                  scrollTrigger: {
                    id: "process-visual-morph",
                    trigger: steps[0],
                    start: "top top",
                    end: () => `+=${window.innerHeight * 3}`,
                    scrub: 0.8,
                    invalidateOnRefresh: true,
                  },
                });
                for (let index = 1; index < PROCESS_MORPH_STATES.length; index++) {
                  const next = PROCESS_MORPH_STATES[index];
                  const at = index - 1 + 0.2;
                  visualTimeline
                    .to(outline, { morphSVG: next.outline, duration: 0.8, ease: "none" }, at)
                    .to(spine, { morphSVG: next.spine, duration: 0.8, ease: "none" }, at)
                    .to(accent, { attr: next.accent, duration: 0.8, ease: "none" }, at)
                    .to(details[index - 1], { opacity: 0, duration: 0.25, ease: "none" }, at)
                    .to(details[index], { opacity: 1, duration: 0.3, ease: "none" }, at + 0.5);
                }
              }

              steps.forEach((step, index) => {
                const number = step.querySelector<HTMLElement>("[data-process-step-number]");
                const title = step.querySelector<HTMLElement>("[data-process-step-title]");
                const description = step.querySelector<HTMLElement>("[data-process-step-description]");
                if (!number || !title || !description) return;
                const copy = gsap.timeline({ paused: true });
                copy
                  .fromTo(number, { autoAlpha: 0.35, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "none" }, 0)
                  .fromTo(title, { clipPath: "inset(0 0 100% 0)", y: 18 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.55, ease: "none" }, 0.12)
                  .fromTo(description, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "none" }, 0.42);
                copyTriggers.push(ScrollTrigger.create({
                  id: `process-copy-${index + 1}`,
                  trigger: step,
                  animation: copy,
                  start: "top 85%",
                  end: "top 25%",
                  scrub: 0.7,
                  invalidateOnRefresh: true,
                }));
              });
            }

            const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
            return () => {
              window.cancelAnimationFrame(refreshFrame);
              window.cancelAnimationFrame(resizeFrame);
              window.removeEventListener("scroll", rememberChapter);
              window.removeEventListener("resize", restoreChapterOnResize);
              bridgeTrigger?.kill();
              handoffTrigger.kill();
              handoff.kill();
              copyTriggers.forEach((trigger) => trigger.kill());
              gsap.set([surface, heading, oldTitle, processTitle, servicesHeading], { clearProps: "all" });
              delete root.dataset.processMotion;
              delete root.dataset.handoffProgress;
            };
          },
        );

        cleanup = () => media.revert();
      }, root);

      const previousCleanup = cleanup;
      cleanup = () => {
        previousCleanup?.();
        context.revert();
      };
    }

    void setupMotion();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section className={styles.section} id="process" aria-labelledby="flow-title" data-cursor-theme="light" ref={rootRef}>
      <div className={styles.surface} data-process-surface aria-hidden="true" />
      <div className={styles.layout}>
        <header className={styles.heading} data-process-heading>
          <div className={styles.headingMask}>
            <span className={styles.oldTitle} data-process-old-title aria-hidden="true">КАКВО<br />ПРАВИМ</span>
            <h2 id="flow-title" data-process-title>ПРОЦЕС</h2>
          </div>
        </header>
        <ol className={styles.steps}>
          {PROCESS_STEPS.map((step, index) => (
            <li className={styles.step} data-process-step key={step.number}>
              <div className={styles.stepInner}>
                <span className={styles.stepNumber} data-process-step-number>{step.number} / 04</span>
                <div className={styles.stepTitleMask}>
                  <h3 data-process-step-title>{step.title}</h3>
                </div>
                <p data-process-step-description>{step.description}</p>
                <div className={styles.mobileVisual}>
                  <ProcessMorphVisual stateIndex={index} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className={styles.visualStage}>
          <ProcessMorphVisual desktop />
        </div>
      </div>
    </section>
  );
}
