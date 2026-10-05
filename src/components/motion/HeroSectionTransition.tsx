"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";
import {
  addSectionReveal,
  SECTION_TRANSITION,
  type SectionTransitionMode,
} from "@/components/motion/sectionTransition";

const TRANSITION_END = "top 12%";
const FULL_CLIP = "inset(0px 0px 0px 0px)";

export function HeroSectionTransition() {
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

      const hero = document.querySelector<HTMLElement>(
        "[data-hero-editorial]",
      );
      const mediaUnit = hero?.querySelector<HTMLElement>(
        "[data-hero-media-unit]",
      );
      const takeover = hero?.querySelector<HTMLElement>(
        "[data-hero-surface-transition]",
      );
      const primaryLine = hero?.querySelector<HTMLElement>(
        "[data-hero-primary]",
      );
      const characterLine = hero?.querySelector<HTMLElement>(
        "[data-hero-character]",
      );
      const finalLine = hero?.querySelector<HTMLElement>(
        "[data-hero-final]",
      );
      const about = document.querySelector<HTMLElement>(
        "[data-about-transition-root]",
      );
      const aboutViewport = about?.querySelector<HTMLElement>(
        "[data-about-transition-viewport]",
      );
      const aboutInner = aboutViewport?.querySelector<HTMLElement>(
        ".about-teaser-inner",
      );
      const reveal = aboutViewport?.querySelector<HTMLElement>(
        "[data-about-color-reveal]",
      );
      const whiteTitleLayer = aboutViewport?.querySelector<HTMLElement>(
        "[data-about-title-white]",
      );

      if (
        !hero ||
        !mediaUnit ||
        !takeover ||
        !primaryLine ||
        !characterLine ||
        !finalLine ||
        !about ||
        !aboutViewport ||
        !aboutInner ||
        !reveal ||
        !whiteTitleLayer
      ) {
        return;
      }

      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        const revealLayers = [reveal, whiteTitleLayer];
        const headlineLines = [primaryLine, characterLine, finalLine];
        let transitionIsActive = false;

        const getBottomClearance = () =>
          document
            .querySelector<HTMLElement>(".bottom-navigation")
            ?.getBoundingClientRect().height ?? 0;

        const getTransitionStart = () =>
          `top bottom-=${Math.round(getBottomClearance())}`;

        const setRevealState = (complete: boolean) => {
          aboutViewport.dataset.revealComplete = complete ? "true" : "false";
          about.dataset.cursorTheme = complete ? "dark" : "light";
        };

        const setTransitionState = (active: boolean) => {
          if (active === transitionIsActive) return;
          transitionIsActive = active;
          hero.dataset.heroTransitionActive = active ? "true" : "false";
          hero.dispatchEvent(
            new CustomEvent("hero-transition-state", {
              detail: { active },
            }),
          );
        };

        const createTransition = (mode: SectionTransitionMode) => {
          hero.dataset.heroTransitionEnabled = "true";
          gsap.set(revealLayers, { clipPath: FULL_CLIP });
          gsap.set(takeover, {
            clipPath: SECTION_TRANSITION.hiddenClip,
            visibility: "visible",
          });
          gsap.set([aboutInner, whiteTitleLayer], { autoAlpha: 0 });
          gsap.set(mediaUnit, { autoAlpha: 1, x: 0, y: 0 });
          setRevealState(false);
          setTransitionState(false);

          const getDesktopShift = () =>
            Math.min(34, window.innerWidth * 0.02);
          const getMobileExit = (element: HTMLElement, direction: -1 | 1) => {
            const bounds = element.getBoundingClientRect();
            return direction === -1
              ? -(bounds.right + 24)
              : window.innerWidth - bounds.left + 24;
          };

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: aboutViewport,
              start: getTransitionStart,
              end: TRANSITION_END,
              scrub: SECTION_TRANSITION.scrub,
              invalidateOnRefresh: true,
              onRefreshInit: () => {
                setTransitionState(false);
                gsap.set(mediaUnit, { autoAlpha: 1, x: 0, y: 0 });
              },
              onUpdate: (self) => {
                setTransitionState(self.progress > 0.001);
                setRevealState(self.progress >= 0.76);
              },
              onRefresh: (self) => {
                setTransitionState(self.progress > 0.001);
                setRevealState(self.progress >= 0.76);
              },
            },
          });

          addSectionReveal(timeline, takeover, {
            direction: "forward",
            mode,
          });

          timeline
            .to(
              mediaUnit,
              {
                autoAlpha: 0,
                x: mode === "desktop" ? -18 : -10,
                y: 0,
                duration: 0.42,
                ease: "power1.in",
              },
              0.08,
            )
            .to(
              [aboutInner, whiteTitleLayer],
              {
                autoAlpha: 1,
                duration: 0.14,
                ease: "power1.out",
              },
              0.74,
            );

          if (mode === "desktop") {
            timeline
              .fromTo(
                primaryLine,
                { x: 0 },
                {
                  x: () => -getDesktopShift() * 0.6,
                  duration: 0.72,
                },
                0.02,
              )
              .fromTo(
                characterLine,
                { x: 0 },
                {
                  x: () => -getDesktopShift() * 1.15,
                  duration: 0.72,
                },
                0.02,
              )
              .fromTo(
                finalLine,
                { x: 0 },
                {
                  x: () => getDesktopShift(),
                  duration: 0.72,
                },
                0.02,
              );
          } else {
            timeline
              .fromTo(
                primaryLine,
                { x: 0 },
                {
                  x: () => getMobileExit(primaryLine, -1),
                  duration: 0.72,
                  ease: "power1.inOut",
                },
                0.02,
              )
              .fromTo(
                characterLine,
                { x: 0 },
                {
                  x: () => getMobileExit(characterLine, -1),
                  duration: 0.72,
                  ease: "power1.inOut",
                },
                0.02,
              )
              .fromTo(
                finalLine,
                { x: 0 },
                {
                  x: () => getMobileExit(finalLine, 1),
                  duration: 0.72,
                  ease: "power1.inOut",
                },
                0.02,
              );
          }

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            setTransitionState(false);
            setRevealState(false);
            delete hero.dataset.heroTransitionEnabled;
            gsap.set(headlineLines, { x: 0 });
            gsap.set(mediaUnit, {
              clearProps: "opacity,visibility",
              x: 0,
              y: 0,
            });
            gsap.set(takeover, { clearProps: "clip-path,visibility" });
            gsap.set([aboutInner, whiteTitleLayer], {
              clearProps: "opacity,visibility",
            });
          };
        };

        media.add(
          "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
          () => createTransition("desktop"),
        );
        media.add(
          "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => createTransition("mobile"),
        );
        media.add("(prefers-reduced-motion: reduce)", () => {
          delete hero.dataset.heroTransitionEnabled;
          hero.dataset.heroTransitionActive = "false";
          gsap.set(revealLayers, { clipPath: FULL_CLIP });
          gsap.set(takeover, { visibility: "hidden" });
          gsap.set(headlineLines, { x: 0 });
          gsap.set(mediaUnit, {
            clearProps: "opacity,visibility",
            x: 0,
            y: 0,
          });
          gsap.set([aboutInner, whiteTitleLayer], {
            clearProps: "opacity,visibility",
          });
          setRevealState(true);

          return () => setRevealState(false);
        });

        cleanupAnimation = () => media.revert();
      }, hero);

      refreshFrame = window.requestAnimationFrame(() =>
        ScrollTrigger.refresh(),
      );
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
