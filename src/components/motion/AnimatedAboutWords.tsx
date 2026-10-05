"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsapClient";

const ABOUT_COPY =
  "Събираме стратегия, ясна визуална посока и чист код в сайтове, които имат характер и работят за бизнеса.";

const WORDS = ABOUT_COPY.split(" ");

type AnimationMode = "desktop" | "mobile";

type StartPoint = {
  x: number;
};

function getStartPoints(
  words: HTMLElement[],
  viewport: HTMLElement,
  mode: AnimationMode,
): Map<HTMLElement, StartPoint> {
  const viewportRect = viewport.getBoundingClientRect();
  const points = new Map<HTMLElement, StartPoint>();
  const outsideGap = mode === "desktop" ? 80 : 44;
  const laneStride = mode === "desktop" ? 90 : 48;
  const indexStride = mode === "desktop" ? 16 : 8;

  words.forEach((word, index) => {
    const rect = word.getBoundingClientRect();
    const extraDistance =
      outsideGap + (index % 5) * laneStride + index * indexStride;
    const startX = viewportRect.right - rect.left + extraDistance;

    points.set(word, { x: startX });
  });

  return points;
}

export function AnimatedAboutWords() {
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

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

      const root = rootRef.current;
      const viewport = viewportRef.current;
      const paragraph = paragraphRef.current;
      const link = linkRef.current;

      if (!root || !viewport || !paragraph || !link) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        const words = gsap.utils.toArray<HTMLElement>(".about-word");

        const createTimeline = (mode: AnimationMode) => {
          let points = new Map<HTMLElement, StartPoint>();
          let linkIsVisible = false;

          viewport.dataset.aboutMotionReady = "true";

          const measure = () => {
            gsap.set(words, { x: 0, y: 0, rotation: 0, scale: 1 });
            points = getStartPoints(words, viewport, mode);
          };
          const applyStartingTransforms = () => {
            gsap.set(words, {
              x: (_index, element) =>
                points.get(element as HTMLElement)?.x ?? 0,
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              transformOrigin: "left center",
            });
          };
          const setLinkInitialState = () => {
            linkIsVisible = false;
            gsap.killTweensOf(link);
            gsap.set(link, {
              autoAlpha: 0,
              y: 14,
              pointerEvents: "none",
            });
          };

          measure();
          applyStartingTransforms();
          setLinkInitialState();

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: root,
              pin: viewport,
              start: "top top",
              end: () =>
                `+=${Math.round(
                  window.innerHeight *
                    (mode === "desktop"
                      ? 4
                      : window.innerHeight <= 667
                        ? 3.2
                        : 3.5),
                )}`,
              scrub: 1.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefreshInit: () => {
                timeline.progress(0).invalidate();
                measure();
                applyStartingTransforms();
                setLinkInitialState();
                timeline.invalidate();
              },
            },
          });

          words.forEach((word, index) => {
            const progress = index / Math.max(words.length - 1, 1);
            const start = progress * 0.68;

            timeline.to(
              word,
              {
                x: 0,
                duration: 0.14,
                ease: "none",
              },
              start,
            );
          });
          timeline.to({}, { duration: 0.18 }, 0.82);
          timeline.eventCallback("onUpdate", () => {
            const shouldShowLink = timeline.time() >= 0.83;

            if (shouldShowLink === linkIsVisible) return;

            linkIsVisible = shouldShowLink;
            gsap.killTweensOf(link);

            if (shouldShowLink) {
              gsap.to(link, {
                autoAlpha: 1,
                y: 0,
                duration: 0.42,
                ease: "power2.out",
                overwrite: true,
                onStart: () => gsap.set(link, { pointerEvents: "auto" }),
              });
            } else {
              gsap.set(link, { pointerEvents: "none" });
              gsap.to(link, {
                autoAlpha: 0,
                y: 14,
                duration: 0.2,
                ease: "power1.out",
                overwrite: true,
              });
            }
          });

          return () => {
            viewport.dataset.aboutMotionReady = "false";
            gsap.killTweensOf(link);
            timeline.scrollTrigger?.kill();
            timeline.kill();
            gsap.set(link, {
              clearProps: "opacity,visibility,transform,pointer-events",
            });
          };
        };

        media.add(
          "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
          () => createTimeline("desktop"),
        );
        media.add(
          "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => createTimeline("mobile"),
        );
        media.add("(prefers-reduced-motion: reduce)", () => {
          viewport.dataset.aboutMotionReady = "false";
          gsap.set(words, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
          });
          gsap.set(link, {
            autoAlpha: 1,
            y: 0,
            pointerEvents: "auto",
          });
        });

        cleanupAnimation = () => media.revert();
      }, root);

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

  return (
    <div className="about-teaser-scroll" ref={rootRef}>
      <div
        className="about-teaser-viewport"
        ref={viewportRef}
        data-about-transition-viewport
        data-about-motion-ready="false"
        data-reveal-complete="false"
      >
        <div
          className="about-color-reveal"
          data-about-color-reveal
          aria-hidden="true"
        />

        <div className="container about-teaser-inner">
          <h2
            className="about-teaser-title about-teaser-title--base"
            id="manifesto-title"
          >
            „Manifesto“
          </h2>

          <p className="sr-only">{ABOUT_COPY}</p>
          <p
            className="about-teaser-copy"
            ref={paragraphRef}
            aria-hidden="true"
          >
            {WORDS.map((word, index) => (
              <span className="about-word" key={`${word}-${index}`}>
                {word}
              </span>
            ))}
          </p>

          <Link
            className="about-teaser-link"
            ref={linkRef}
            href="/about"
          >
            Повече за нас
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div
          className="about-title-white-layer"
          data-about-title-white
          aria-hidden="true"
        >
          <div className="container about-title-white-layer__inner">
            <span className="about-teaser-title about-teaser-title--white">
              „Manifesto“
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
