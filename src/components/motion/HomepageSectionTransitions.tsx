"use client";

import { useLayoutEffect } from "react";
import {
  addSectionReveal,
  SECTION_TRANSITION,
  type SectionTransitionDirection,
  type SectionTransitionMode,
} from "@/components/motion/sectionTransition";
import { loadGsap } from "@/lib/gsapClient";

const TRANSITION_ROOT_SELECTOR = "[data-section-transition]";
const TRANSITION_SURFACE_SELECTOR = "[data-section-transition-surface]";
const PROJECT_SHOWCASE_TRANSITION = {
  rangeViewportRatio: 0.38,
  scrub: 1,
} as const;

function getDirection(root: HTMLElement): SectionTransitionDirection {
  return root.dataset.sectionTransitionDirection === "reverse"
    ? "reverse"
    : "forward";
}

export function HomepageSectionTransitions() {
  useLayoutEffect(() => {
    let cancelled = false;
    let cleanupAnimation: (() => void) | undefined;
    let refreshFrame = 0;
    let refreshTimer = 0;
    let refreshOnPageShow: (() => void) | undefined;

    async function setupAnimation() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);

      if (cancelled) return;

      const main = document.querySelector<HTMLElement>("#main-content");
      if (!main) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();

        const createTransitions = (mode: SectionTransitionMode) => {
          const roots = gsap.utils.toArray<HTMLElement>(
            TRANSITION_ROOT_SELECTOR,
          );
          const cleanups: Array<() => void> = [];

          roots.forEach((root) => {
            const surface = root.querySelector<HTMLElement>(
              TRANSITION_SURFACE_SELECTOR,
            );

            if (!surface) return;

            const id = root.dataset.sectionTransition || "section";
            const transitionConfig =
              id === "project-showcase"
                ? PROJECT_SHOWCASE_TRANSITION
                : SECTION_TRANSITION;
            const getBottomClearance = () =>
              document
                .querySelector<HTMLElement>(".bottom-navigation")
                ?.getBoundingClientRect().height ?? 0;
            const getTransitionDistance = () =>
              Math.round(
                window.innerHeight * transitionConfig.rangeViewportRatio,
              );
            const measureSurface = () => {
              gsap.set(surface, {
                height: window.innerHeight,
                backgroundColor: getComputedStyle(root).backgroundColor,
                clipPath: SECTION_TRANSITION.hiddenClip,
                visibility: "visible",
              });
            };

            measureSurface();

            const timeline = gsap.timeline({
              paused: true,
              defaults: { ease: "none" },
            });

            addSectionReveal(timeline, surface, {
              direction: getDirection(root),
              mode,
            });

            const trigger = ScrollTrigger.create({
              id: `section-transition-${id}`,
              trigger: root,
              animation: timeline,
              start: () =>
                `top bottom-=${Math.round(getBottomClearance())}`,
              end: () => `+=${getTransitionDistance()}`,
              scrub: transitionConfig.scrub,
              invalidateOnRefresh: true,
              onRefreshInit: () => {
                measureSurface();
                timeline.invalidate();
              },
            });

            cleanups.push(() => {
              trigger.kill();
              timeline.kill();
              gsap.set(surface, {
                clearProps:
                  "height,background-color,clip-path,visibility,will-change",
              });
            });
          });

          return () => cleanups.forEach((cleanup) => cleanup());
        };

        media.add(
          "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
          () => createTransitions("desktop"),
        );
        media.add(
          "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => createTransitions("mobile"),
        );
        media.add("(prefers-reduced-motion: reduce)", () => {
          const surfaces = gsap.utils.toArray<HTMLElement>(
            TRANSITION_SURFACE_SELECTOR,
          );
          gsap.set(surfaces, {
            clearProps: "height,background-color,clip-path,will-change",
            visibility: "hidden",
          });

          return () =>
            gsap.set(surfaces, {
              clearProps:
                "height,background-color,clip-path,visibility,will-change",
            });
        });

        cleanupAnimation = () => media.revert();
      }, main);

      refreshFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500);
      refreshOnPageShow = () => ScrollTrigger.refresh();
      window.addEventListener("pageshow", refreshOnPageShow);

      const previousCleanup = cleanupAnimation;
      cleanupAnimation = () => {
        previousCleanup?.();
        context.revert();
      };
    }

    void setupAnimation();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      window.clearTimeout(refreshTimer);
      if (refreshOnPageShow) {
        window.removeEventListener("pageshow", refreshOnPageShow);
      }
      cleanupAnimation?.();
    };
  }, []);

  return null;
}
