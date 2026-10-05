"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { loadGsap } from "@/lib/gsapClient";

export function CaseStudyEditorial({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const initialRoot = rootRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (initialRoot && !reduceMotion) initialRoot.dataset.motionReady = "true";

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
      if (!root) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        const labels = gsap.utils.toArray<HTMLElement>("[data-case-label]");
        const introCopies = gsap.utils.toArray<HTMLElement>(
          "[data-case-intro-copy]",
        );
        const entries = gsap.utils.toArray<HTMLElement>("[data-case-entry]");
        const images = gsap.utils.toArray<HTMLElement>("[data-case-image]");

        media.add("(prefers-reduced-motion: no-preference)", () => {
          labels.forEach((label) => {
            gsap.fromTo(label, { autoAlpha: 0, y: 12 }, {
              autoAlpha: 1,
              y: 0,
              duration: 0.52,
              ease: "power2.out",
              scrollTrigger: { trigger: label, start: "top 85%", once: true },
            });
          });

          introCopies.forEach((copy) => {
            gsap.fromTo(copy, { autoAlpha: 0, y: 24 }, {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              ease: "power3.out",
              scrollTrigger: { trigger: copy, start: "top 84%", once: true },
            });
          });

          entries.forEach((entry) => {
            const divider = entry.querySelector<HTMLElement>("[data-case-divider]");
            const index = entry.querySelector<HTMLElement>("[data-case-index]");
            const title = entry.querySelector<HTMLElement>("[data-case-title]");
            const body = entry.querySelector<HTMLElement>("[data-case-body]");
            const metric = entry.querySelector<HTMLElement>("[data-case-metric]");
            const timeline = gsap.timeline({
              scrollTrigger: { trigger: entry, start: "top 84%", once: true },
            });

            if (divider) {
              timeline.fromTo(divider, { scaleX: 0 }, {
                scaleX: 1,
                duration: 0.78,
                ease: "power3.out",
                transformOrigin: "left center",
              }, 0);
            }
            if (index) {
              timeline.fromTo(index, { autoAlpha: 0, y: 10 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                ease: "power2.out",
              }, 0.12);
            }
            if (metric) {
              timeline.fromTo(metric, { autoAlpha: 0, y: 14 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.58,
                ease: "power2.out",
              }, 0.16);
            }
            if (title) {
              timeline.fromTo(title, { autoAlpha: 0, yPercent: 105 }, {
                autoAlpha: 1,
                yPercent: 0,
                duration: 0.7,
                ease: "power3.out",
              }, metric ? 0.26 : 0.18);
            }
            if (body) {
              timeline.fromTo(body, { autoAlpha: 0, y: 16 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
              }, metric ? 0.42 : 0.32);
            }
          });

          images.forEach((wrapper) => {
            const image = wrapper.querySelector("img");
            const timeline = gsap.timeline({
              scrollTrigger: { trigger: wrapper, start: "top 85%", once: true },
            });

            timeline.fromTo(wrapper, { clipPath: "inset(0 0 100% 0)" }, {
              clipPath: "inset(0 0 0% 0)",
              duration: 1.05,
              ease: "power3.out",
            });
            if (image) {
              timeline.fromTo(image, { scale: 1.035, y: 20 }, {
                scale: 1,
                y: 0,
                duration: 1.05,
                ease: "power3.out",
              }, 0);
            }
          });

          return () => {
            delete root.dataset.motionReady;
          };
        });

        media.add("(prefers-reduced-motion: reduce)", () => {
          delete root.dataset.motionReady;
          gsap.set([...labels, ...introCopies, ...entries, ...images], {
            clearProps: "all",
          });
        });

        cleanupAnimation = () => media.revert();
      }, root);

      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500);
      refreshOnPageShow = () => ScrollTrigger.refresh();
      window.addEventListener("pageshow", refreshOnPageShow);

      const previousCleanup = cleanupAnimation;
      cleanupAnimation = () => {
        previousCleanup?.();
        context.revert();
      };
    }

    void setupAnimation().catch(() => {
      if (rootRef.current) delete rootRef.current.dataset.motionReady;
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(refreshFrame);
      window.clearTimeout(refreshTimer);
      if (refreshOnPageShow) window.removeEventListener("pageshow", refreshOnPageShow);
      cleanupAnimation?.();
    };
  }, []);

  return <div className="case-study__editorial" ref={rootRef}>{children}</div>;
}
