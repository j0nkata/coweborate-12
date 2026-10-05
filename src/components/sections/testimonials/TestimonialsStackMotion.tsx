"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";

const SECTION_SELECTOR = "[data-testimonials-section]";
const CARD_SELECTOR = "[data-testimonial]";

type DepthConfig = {
  scale: number;
  opacity: number;
  y: number;
  edge: number;
  scrub: number;
};

const DEPTH = {
  desktop: { scale: 0.98, opacity: 0.92, y: -10, edge: 10, scrub: 0.5 },
  tablet: { scale: 0.985, opacity: 0.94, y: -8, edge: 8, scrub: 0.45 },
  mobile: { scale: 0.99, opacity: 0.96, y: -6, edge: 6, scrub: 0.4 },
} satisfies Record<"desktop" | "tablet" | "mobile", DepthConfig>;

function getStickyTop(card: HTMLElement) {
  return Number.parseFloat(getComputedStyle(card).top) || 0;
}

function getOverlapStart(card: HTMLElement) {
  const stickyTop = getStickyTop(card);
  const navigationHeight =
    document
      .querySelector<HTMLElement>(".bottom-navigation")
      ?.getBoundingClientRect().height ?? 0;
  const visibleViewportBottom = window.innerHeight - navigationHeight - 16;

  return Math.min(
    stickyTop + card.getBoundingClientRect().height,
    visibleViewportBottom,
  );
}

export function TestimonialsStackMotion() {
  useLayoutEffect(() => {
    let cancelled = false;
    let cleanupAnimation: (() => void) | undefined;
    let refreshFrame = 0;
    let refreshTimer = 0;
    let resizeFrame = 0;
    let refreshOnPageShow: (() => void) | undefined;

    async function setupAnimation() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);

      if (cancelled) return;

      const root = document.querySelector<HTMLElement>(SECTION_SELECTOR);
      if (!root) return;

      const cards = gsap.utils.toArray<HTMLElement>(CARD_SELECTOR, root);
      if (cards.length < 2) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();

        const createDepthResponse = (config: DepthConfig) => {
          const tweens = cards.slice(0, -1).map((card, index) => {
            const incomingCard = cards[index + 1];
            const tween = gsap.to(card, {
              scale: config.scale,
              opacity: config.opacity,
              y: config.y,
              ease: "none",
              paused: true,
            });

            const trigger = ScrollTrigger.create({
              id: `testimonial-stack-${index + 1}`,
              trigger: incomingCard,
              animation: tween,
              start: () => `top ${Math.round(getOverlapStart(card))}px`,
              end: () =>
                `top ${Math.round(getStickyTop(incomingCard) + config.edge)}px`,
              scrub: config.scrub,
              invalidateOnRefresh: true,
            });

            return { trigger, tween };
          });

          return () => {
            tweens.forEach(({ trigger, tween }) => {
              trigger.kill();
              tween.kill();
            });
            gsap.set(cards, {
              clearProps: "opacity,transform,transformOrigin,willChange",
            });
          };
        };

        media.add(
          "(min-width: 1101px) and (prefers-reduced-motion: no-preference)",
          () => createDepthResponse(DEPTH.desktop),
        );
        media.add(
          "(min-width: 769px) and (max-width: 1100px) and (prefers-reduced-motion: no-preference)",
          () => createDepthResponse(DEPTH.tablet),
        );
        media.add(
          "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => createDepthResponse(DEPTH.mobile),
        );
        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set(cards, {
            clearProps: "opacity,transform,transformOrigin,willChange",
          });
        });

        cleanupAnimation = () => media.revert();
      }, root);

      const resizeObserver = new ResizeObserver(() => {
        window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(() =>
          ScrollTrigger.refresh(),
        );
      });
      resizeObserver.observe(root);

      refreshFrame = window.requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500);
      refreshOnPageShow = () => ScrollTrigger.refresh();
      window.addEventListener("pageshow", refreshOnPageShow);

      const previousCleanup = cleanupAnimation;
      cleanupAnimation = () => {
        resizeObserver.disconnect();
        previousCleanup?.();
        context.revert();
      };
    }

    void setupAnimation();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      window.cancelAnimationFrame(resizeFrame);
      window.clearTimeout(refreshTimer);
      if (refreshOnPageShow) {
        window.removeEventListener("pageshow", refreshOnPageShow);
      }
      cleanupAnimation?.();
    };
  }, []);

  return null;
}
