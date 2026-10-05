"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { loadGsap } from "@/lib/gsapClient";

const TEAM_MEMBERS = [
  {
    name: "Васил",
    role: "Стратегия и развитие",
    image: "/vasil.png",
  },
  {
    name: "Валери",
    role: "Дизайн и визуална посока",
    image: "/valeri.png",
  },
  {
    name: "Александър",
    role: "Разработка",
    image: "/александър.png",
  },
] as const;

export function TeamSection() {
  const rootRef = useRef<HTMLElement>(null);

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
      if (!root) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        const heading = gsap.utils.toArray<HTMLElement>(
          "[data-team-heading]",
        );
        const portraits = gsap.utils.toArray<HTMLElement>(
          "[data-team-portrait]",
        );
        const memberCopy = gsap.utils.toArray<HTMLElement>(
          "[data-team-copy]",
        );

        media.add("(prefers-reduced-motion: no-preference)", () => {
          gsap.set(heading, { autoAlpha: 0, y: 16 });
          gsap.set(portraits, { autoAlpha: 0, y: 20 });
          gsap.set(memberCopy, { autoAlpha: 0, y: 10 });

          const timeline = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              toggleActions: "play none none none",
              invalidateOnRefresh: true,
            },
          });

          timeline.to(heading, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
          });

          portraits.forEach((portrait, index) => {
            const position = 0.22 + index * 0.12;

            timeline.to(
              portrait,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
              },
              position,
            );
            timeline.to(
              memberCopy[index],
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.36,
              },
              position + 0.18,
            );
          });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            gsap.set([...heading, ...portraits, ...memberCopy], {
              clearProps: "opacity,visibility,transform",
            });
          };
        });

        media.add("(prefers-reduced-motion: reduce)", () => {
          gsap.set([...heading, ...portraits, ...memberCopy], {
            autoAlpha: 1,
            x: 0,
            y: 0,
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
    <section
      className="team-section"
      id="team"
      aria-labelledby="team-title"
      data-cursor-theme="dark"
      ref={rootRef}
    >
      <header className="team-section__header">
        <p className="team-section__index" data-team-heading>
          03 / ЕДИН ЕКИП
        </p>
        <h2 id="team-title" data-team-heading>
          ЕКИПЪТ
        </h2>
        <p className="team-section__intro" data-team-heading>
          Малък екип с общ стандарт — ясна идея, силен дизайн и прецизна
          реализация.
        </p>
      </header>

      <ol className="team-section__members">
        {TEAM_MEMBERS.map((member, index) => (
          <li data-team-member key={member.name}>
            <div className="team-section__portrait" data-team-portrait>
              <Image
                src={member.image}
                alt={`Портрет на ${member.name}`}
                fill
                sizes="(max-width: 768px) calc(100vw - 32px), 33vw"
              />
            </div>
            <div className="team-section__member-copy" data-team-copy>
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
