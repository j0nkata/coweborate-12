"use client";

import Image from "next/image";
import Link from "next/link";
import { PrimaryCTA } from "@/components/ui/PrimaryCTA";
import { useLayoutEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsapClient";
import { PROJECTS, type Project } from "@/lib/projects";

const DESKTOP_QUERY = "(min-width: 769px)";
const MOBILE_QUERY = "(max-width: 768px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const DESKTOP_PIXELS_PER_SECOND = 85;
const MOBILE_PIXELS_PER_SECOND = 48;
const MAX_VELOCITY_SCALE = 4;
const VELOCITY_DIVISOR = 900;

function ProjectMarqueeItem({
  project,
  duplicate = false,
}: {
  project: Project;
  duplicate?: boolean;
}) {
  const content = (
    <>
      <span className="project-marquee__visual">
        <Image
          className="project-marquee__image"
          src={project.image}
          alt={duplicate ? "" : project.imageAlt}
          fill
          sizes="(max-width: 768px) 72vw, 24vw"
        />
      </span>
      <span className="project-marquee__name">{project.name}</span>
    </>
  );

  return (
    <li className="project-marquee__item">
      {duplicate ? (
        <Link
          className="project-marquee__project"
          data-marquee-interaction-link
          href={`/projects/${project.slug}`}
          tabIndex={-1}
        >
          {content}
        </Link>
      ) : (
        <Link
          className="project-marquee__project"
          data-marquee-interaction-link
          data-marquee-project-link
          href={`/projects/${project.slug}`}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

export function ProjectMarquee() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setup() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);
      if (cancelled || !root) return;

      const context = gsap.context(() => {}, root);
      const media = gsap.matchMedia();

      context.add(() => {
        media.add(
          {
            desktop: DESKTOP_QUERY,
            mobile: MOBILE_QUERY,
            reduce: REDUCED_QUERY,
          },
          (match) => {
            const track = root.querySelector<HTMLElement>(
              "[data-marquee-track]",
            );
            const originalGroup = root.querySelector<HTMLElement>(
              "[data-marquee-group='original']",
            );
            const links = Array.from(
              root.querySelectorAll<HTMLElement>(
                "[data-marquee-interaction-link]",
              ),
            );
            const reduce = Boolean(match.conditions?.reduce);
            const desktop = Boolean(match.conditions?.desktop);

            root.dataset.marqueeMotion = reduce ? "reduced" : "running";

            if (reduce || !track || !originalGroup) {
              return () => {
                delete root.dataset.marqueeMotion;
              };
            }

            const pixelsPerSecond = desktop
              ? DESKTOP_PIXELS_PER_SECOND
              : MOBILE_PIXELS_PER_SECOND;
            let loop: gsap.core.Timeline | undefined;
            let velocityTween: gsap.core.Tween | undefined;
            let interactionTween: gsap.core.Tween | undefined;
            let velocityTrigger: ScrollTrigger | undefined;
            let resizeFrame = 0;
            let setupRefreshFrame = 0;
            let currentVelocityScale = 1;
            let pointerInside = false;
            let focusInside = false;
            const speed = { value: 1 };

            const applySpeed = () => {
              loop?.timeScale(speed.value);
            };

            const interactionScale = () => {
              if (focusInside) return 0;
              if (pointerInside) return 0.2;
              return 1;
            };

            const animateInteractionScale = () => {
              if (!loop) return;

              velocityTween?.kill();
              interactionTween?.kill();
              currentVelocityScale = 1;
              interactionTween = gsap.to(speed, {
                value: interactionScale(),
                duration: focusInside ? 0.24 : 0.38,
                ease: "power2.out",
                onUpdate: applySpeed,
              });
            };

            const createLoop = (progress = 0) => {
              velocityTween?.kill();
              interactionTween?.kill();
              loop?.kill();

              const distance = originalGroup.getBoundingClientRect().width;
              const duration = Math.max(1, distance / pixelsPerSecond);

              gsap.set(track, { x: 0, willChange: "transform" });
              loop = gsap
                .timeline({ repeat: -1 })
                .to(track, {
                  x: -distance,
                  duration,
                  ease: "none",
                });
              speed.value = interactionScale();
              loop.progress(progress).timeScale(speed.value);
              currentVelocityScale = 1;
            };

            const normalizeVelocity = (duration = 0.75) => {
              if (!loop || pointerInside || focusInside) return;

              velocityTween?.kill();
              currentVelocityScale = 1;
              velocityTween = gsap.to(speed, {
                value: 1,
                duration,
                ease: "power2.out",
                onUpdate: applySpeed,
              });
            };

            const boostFromVelocity = (velocity: number) => {
              if (!loop || pointerInside || focusInside) return;

              const targetScale = gsap.utils.clamp(
                1,
                MAX_VELOCITY_SCALE,
                1 + Math.max(0, velocity) / VELOCITY_DIVISOR,
              );
              if (targetScale <= currentVelocityScale + 0.12) return;

              currentVelocityScale = targetScale;
              velocityTween?.kill();
              velocityTween = gsap.to(speed, {
                keyframes: [
                  {
                    value: targetScale,
                    duration: 0.2,
                    ease: "power2.out",
                  },
                  { value: targetScale, duration: 0.18, ease: "none" },
                  { value: 1, duration: 1, ease: "power2.out" },
                ],
                onUpdate: applySpeed,
                onComplete: () => {
                  currentVelocityScale = 1;
                },
              });
            };

            const handlePointerEnter = () => {
              if (!desktop || !window.matchMedia("(hover: hover)").matches) {
                return;
              }
              pointerInside = true;
              animateInteractionScale();
            };

            const handlePointerLeave = () => {
              if (!pointerInside) return;
              pointerInside = false;
              animateInteractionScale();
            };

            const handleFocusIn = () => {
              focusInside = true;
              animateInteractionScale();
            };

            const handleFocusOut = () => {
              window.requestAnimationFrame(() => {
                focusInside = Boolean(
                  root.querySelector("[data-marquee-project-link]:focus"),
                );
                animateInteractionScale();
              });
            };

            createLoop();

            links.forEach((link) => {
              link.addEventListener("pointerenter", handlePointerEnter);
              link.addEventListener("pointerleave", handlePointerLeave);
              link.addEventListener("focusin", handleFocusIn);
              link.addEventListener("focusout", handleFocusOut);
            });

            if (desktop) {
              velocityTrigger = ScrollTrigger.create({
                id: "project-marquee-velocity",
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                  if (self.direction === 1) {
                    boostFromVelocity(self.getVelocity());
                  } else if (currentVelocityScale > 1) {
                    normalizeVelocity(0.55);
                  }
                },
                onLeave: () => normalizeVelocity(),
                onLeaveBack: () => normalizeVelocity(0.55),
              });
            }

            const handleResize = () => {
              window.cancelAnimationFrame(resizeFrame);
              resizeFrame = window.requestAnimationFrame(() => {
                createLoop(loop?.progress() ?? 0);
                ScrollTrigger.refresh();
              });
            };
            window.addEventListener("resize", handleResize, { passive: true });
            setupRefreshFrame = window.requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });

            return () => {
              window.cancelAnimationFrame(resizeFrame);
              window.cancelAnimationFrame(setupRefreshFrame);
              window.removeEventListener("resize", handleResize);
              links.forEach((link) => {
                link.removeEventListener("pointerenter", handlePointerEnter);
                link.removeEventListener("pointerleave", handlePointerLeave);
                link.removeEventListener("focusin", handleFocusIn);
                link.removeEventListener("focusout", handleFocusOut);
              });
              velocityTrigger?.kill();
              velocityTween?.kill();
              interactionTween?.kill();
              loop?.kill();
              gsap.set(track, { clearProps: "transform,willChange" });
              delete root.dataset.marqueeMotion;
            };
          },
        );
      });

      cleanup = () => {
        media.revert();
        context.revert();
      };
    }

    void setup().catch(() => cleanup?.());

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <section
      className="project-marquee"
      data-project-marquee
      data-cursor-theme="light"
      aria-label="Още проекти"
      ref={rootRef}
    >

      <div className="project-marquee__viewport" data-marquee-viewport>
        <div className="project-marquee__track" data-marquee-track>
          <ul
            className="project-marquee__group"
            data-marquee-group="original"
          >
            {PROJECTS.map((project) => (
              <ProjectMarqueeItem project={project} key={project.slug} />
            ))}
          </ul>
          <ul
            className="project-marquee__group project-marquee__group--duplicate"
            data-marquee-group="duplicate"
            aria-hidden="true"
          >
            {PROJECTS.map((project) => (
              <ProjectMarqueeItem
                project={project}
                duplicate
                key={`duplicate-${project.slug}`}
              />
            ))}
          </ul>
        </div>
      </div>

      <div className="project-marquee__cta">
        <PrimaryCTA variant="on-paper" href="/work">
          РАЗГЛЕДАЙ ВСИЧКИ ПРОЕКТИ
        </PrimaryCTA>
      </div>
    </section>
  );
}
