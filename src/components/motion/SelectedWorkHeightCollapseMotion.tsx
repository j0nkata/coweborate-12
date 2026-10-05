"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";

const DESKTOP_QUERY = "(min-width: 769px) and (min-height: 560px)";
const FLOW_QUERY = "(max-width: 768px), (max-height: 559px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-_";

export function SelectedWorkHeightCollapseMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("#work");
    if (!root) return;
    const section: HTMLElement = root;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setup() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);
      if (cancelled) return;

      const context = gsap.context(() => {}, section);
      const media = gsap.matchMedia();

      context.add(() => {
        media.add(
          {
            desktop: DESKTOP_QUERY,
            flow: FLOW_QUERY,
            reduce: REDUCED_QUERY,
          },
          (match) => {
            const sequence = section.querySelector<HTMLElement>(
              "[data-work-media-sequence]",
            );
            const panels = gsap.utils.toArray<HTMLElement>(
              "[data-work-panel]",
              section,
            );
            const visuals = gsap.utils.toArray<HTMLElement>(
              "[data-work-visual]",
              section,
            );
            const states = gsap.utils.toArray<HTMLElement>(
              "[data-work-state]",
              section,
            );
            const desktop =
              Boolean(match.conditions?.desktop) &&
              !Boolean(match.conditions?.reduce);

            section.dataset.workMode = desktop ? "collapse" : "flow";
            delete section.dataset.workWebgl;

            if (!desktop || !sequence) {
              gsap.set([...states, ...panels, ...visuals], {
                clearProps:
                  "height,opacity,visibility,transform,transformOrigin,zIndex,willChange",
              });
              sequence?.style.removeProperty("--work-media-height");

              states.forEach((state, index) => {
                const selected = index === 0;
                state.dataset.active = String(selected);
                state.inert = !selected;
                state.setAttribute("aria-hidden", String(!selected));
              });
              panels.forEach((panel, index) => {
                panel.dataset.active = String(index === 0);
                visuals[index].inert = false;
                visuals[index].removeAttribute("aria-hidden");
              });

              return () => {
                delete section.dataset.workMode;
                delete section.dataset.workActive;
              };
            }

            const collapsibleImages = panels.slice(0, -1);
            const collapseTimelines: gsap.core.Timeline[] = [];
            const sectionTriggers: ScrollTrigger[] = [];
            const textThresholds: ScrollTrigger[] = [];
            const originals = new Map<HTMLElement, string>();
            let active = 0;
            let textTimeline: gsap.core.Timeline | undefined;
            let refreshFrame = 0;
            let setupRefreshFrame = 0;

            const scrambleTargets = states.map((state) =>
              Array.from(
                state.querySelectorAll<HTMLElement>("[data-work-scramble]"),
              ),
            );
            const allScrambleTargets = scrambleTargets.flat();
            const copyTargets = states.map((state) =>
              Array.from(state.querySelectorAll<HTMLElement>("[data-work-copy-line]")),
            );
            const capabilityTargets = states.map((state) =>
              Array.from(state.querySelectorAll<HTMLElement>("[data-work-capability]")),
            );
            const resetMetadata = () => {
              gsap.set([...copyTargets.flat(), ...capabilityTargets.flat()], {
                clearProps: "opacity,visibility,transform",
              });
            };
            const ctaTargets = states.map((state) =>
              state.querySelector<HTMLElement>(
                ".work-copy__link > span:first-child",
              ),
            );

            allScrambleTargets.forEach((target) => {
              originals.set(target, target.textContent ?? "");
            });

            const restoreText = (targets = allScrambleTargets) => {
              targets.forEach((target) => {
                const original = originals.get(target);
                if (original !== undefined) target.textContent = original;
              });
            };

            const renderScramble = (
              targets: HTMLElement[],
              intensity: number,
              frame: number,
            ) => {
              targets.forEach((target, targetIndex) => {
                const original = originals.get(target) ?? "";
                const level = Number(target.dataset.workScrambleLevel ?? "1");
                const amount = Math.max(0, Math.min(1, intensity * level));

                target.textContent = Array.from(original)
                  .map((character, characterIndex) => {
                    if (/\s/.test(character)) return character;

                    const seed =
                      (targetIndex + 1) * 17.17 +
                      (characterIndex + 1) * 12.9898 +
                      frame * 5.73;
                    const noise = Math.abs(Math.sin(seed) * 43758.5453) % 1;
                    if (noise > amount) return character;

                    const glyphIndex = Math.floor(
                      (noise * 101 + characterIndex * 7 + frame * 3) %
                        SCRAMBLE_GLYPHS.length,
                    );
                    return SCRAMBLE_GLYPHS[glyphIndex];
                  })
                  .join("");
              });
            };

            const setSemantics = (index: number) => {
              states.forEach((state, position) => {
                const selected = position === index;
                state.dataset.active = String(selected);
                state.inert = !selected;
                state.setAttribute("aria-hidden", String(!selected));
              });
              panels.forEach((panel, position) => {
                const selected = position === index;
                panel.dataset.active = String(selected);
                visuals[position].inert = !selected;
                visuals[position].setAttribute(
                  "aria-hidden",
                  String(!selected),
                );
              });
              section.dataset.workActive = String(index);
            };

            const showState = (index: number, immediate = false) => {
              if (index === active && !immediate) return;

              textTimeline?.kill();
              restoreText();
              resetMetadata();

              if (immediate) {
                active = index;
                setSemantics(index);
                gsap.set(states, { autoAlpha: 0, y: 0 });
                gsap.set(states[index], { autoAlpha: 1, y: 0 });
                gsap.set(ctaTargets.filter(Boolean), { opacity: 1, y: 0 });
                return;
              }

              const outgoingIndex = active;
              const outgoing = states[outgoingIndex];
              const incoming = states[index];
              const outgoingScramble = { amount: 0 };
              const incomingScramble = { amount: 1 };

              active = index;
              setSemantics(index);
              renderScramble(scrambleTargets[index], 1, 0);

              gsap.set(states, { autoAlpha: 0, y: 0 });
              gsap.set(outgoing, { autoAlpha: 1, y: 0 });
              gsap.set(incoming, { autoAlpha: 1, y: 0 });
              gsap.set(copyTargets[index], { autoAlpha: 0, y: 10 });
              gsap.set(capabilityTargets[index], { opacity: 0, y: 8 });
              if (ctaTargets[index]) {
                gsap.set(ctaTargets[index], { opacity: 0.45, y: 4 });
              }

              textTimeline = gsap.timeline({
                onComplete: () => {
                  restoreText();
                  resetMetadata();
                  gsap.set(outgoing, { autoAlpha: 0, y: 0 });
                  gsap.set(incoming, { autoAlpha: 1, y: 0 });
                  if (ctaTargets[index]) {
                    gsap.set(ctaTargets[index], { opacity: 1, y: 0 });
                  }
                },
                onInterrupt: () => {
                  restoreText();
                  resetMetadata();
                  gsap.set(states, { autoAlpha: 0, y: 0 });
                  gsap.set(states[active], { autoAlpha: 1, y: 0 });
                },
              });

              textTimeline
                .to(
                  outgoingScramble,
                  {
                    amount: 1,
                    duration: 0.14,
                    ease: "none",
                    onUpdate: () => {
                      renderScramble(
                        scrambleTargets[outgoingIndex],
                        outgoingScramble.amount,
                        Math.ceil(outgoingScramble.amount * 8),
                      );
                    },
                  },
                  0,
                )
                .to(
                  copyTargets[outgoingIndex],
                  {
                    autoAlpha: 0,
                    y: -8,
                    duration: 0.18,
                    ease: "power2.out",
                  },
                  0,
                )
                .call(
                  () => restoreText(scrambleTargets[outgoingIndex]),
                  [],
                  0.15,
                )
                .to(
                  incomingScramble,
                  {
                    amount: 0,
                    duration: 0.38,
                    ease: "none",
                    onUpdate: () => {
                      renderScramble(
                        scrambleTargets[index],
                        incomingScramble.amount,
                        Math.ceil((1 - incomingScramble.amount) * 11),
                      );
                    },
                  },
                  0.12,
                )
                .to(
                  copyTargets[index],
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.3,
                    ease: "power2.out",
                  },
                  0.12,
                );

              // Metadata shares the active-state timeline, without scrambling.
              textTimeline
                .to(capabilityTargets[outgoingIndex], {
                  opacity: 0,
                  y: -8,
                  duration: 0.18,
                  stagger: 0.05,
                  ease: "power2.out",
                }, 0)
                .to(capabilityTargets[index], {
                  opacity: 1,
                  y: 0,
                  duration: 0.3,
                  stagger: 0.05,
                  ease: "power2.out",
                }, 0.12);

              if (ctaTargets[index]) {
                textTimeline.to(
                  ctaTargets[index],
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.22,
                    ease: "power2.out",
                  },
                  0.2,
                );
              }
            };

            const updateMediaHeight = () => {
              const height = sequence.getBoundingClientRect().height;
              sequence.style.setProperty("--work-media-height", `${height}px`);
              gsap.set(panels, { height });
            };

            const syncActiveState = () => {
              let next = 0;
              textThresholds.forEach((trigger, index) => {
                if (window.scrollY >= trigger.start) next = index + 1;
              });
              showState(next, true);
            };

            ScrollTrigger.addEventListener("refreshInit", updateMediaHeight);
            updateMediaHeight();

            gsap.set(panels, {
              zIndex: (index, _target, targets) => targets.length - index,
            });
            gsap.set(states, {
              autoAlpha: 0,
              y: 0,
              zIndex: (index, _target, targets) => targets.length - index,
            });
            showState(0, true);

            collapsibleImages.forEach((image, index) => {
              const timeline = gsap.timeline({
                scrollTrigger: {
                  id: `work-height-collapse-${index}`,
                  trigger: section,
                  start: () =>
                    `top -${window.innerHeight * (index + 0.5)}`,
                  end: () => `+=${window.innerHeight}`,
                  scrub: true,
                  toggleActions: "play none reverse none",
                  invalidateOnRefresh: true,
                },
              });

              timeline.to(image, { height: 0 });
              collapseTimelines.push(timeline);
              if (timeline.scrollTrigger) {
                sectionTriggers.push(timeline.scrollTrigger);
              }

              const textThreshold = ScrollTrigger.create({
                id: `work-text-threshold-${index}`,
                trigger: section,
                start: () => `top -${window.innerHeight * (index + 1)}`,
                end: () => `+=${window.innerHeight}`,
                invalidateOnRefresh: true,
                onEnter: () => showState(index + 1),
                onLeaveBack: () => showState(index),
                onRefresh: () => {
                  window.cancelAnimationFrame(refreshFrame);
                  refreshFrame = window.requestAnimationFrame(syncActiveState);
                },
              });
              textThresholds.push(textThreshold);
              sectionTriggers.push(textThreshold);
            });

            sectionTriggers.push(
              ScrollTrigger.create({
                id: "work-height-collapse-pin",
                trigger: section,
                scrub: true,
                markers: false,
                pin: true,
                start: () => "top top",
                end: () =>
                  `+=${(collapsibleImages.length + 1) * window.innerHeight}`,
                invalidateOnRefresh: true,
              }),
            );

            setupRefreshFrame = window.requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });

            return () => {
              window.cancelAnimationFrame(refreshFrame);
              window.cancelAnimationFrame(setupRefreshFrame);
              ScrollTrigger.removeEventListener(
                "refreshInit",
                updateMediaHeight,
              );
              textTimeline?.kill();
              resetMetadata();
              collapseTimelines.forEach((timeline) => timeline.kill());
              sectionTriggers.forEach((trigger) => trigger.kill(true));
              restoreText();

              sequence.style.removeProperty("--work-media-height");
              gsap.set([...panels, ...visuals, ...states], {
                clearProps:
                  "height,opacity,visibility,transform,transformOrigin,zIndex,willChange",
              });
              gsap.set(ctaTargets.filter(Boolean), {
                clearProps: "opacity,transform",
              });

              states.forEach((state, index) => {
                const selected = index === 0;
                state.dataset.active = String(selected);
                state.inert = !selected;
                state.setAttribute("aria-hidden", String(!selected));
              });
              panels.forEach((panel, index) => {
                panel.dataset.active = String(index === 0);
                visuals[index].inert = false;
                visuals[index].removeAttribute("aria-hidden");
              });

              delete section.dataset.workMode;
              delete section.dataset.workActive;
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

  return null;
}
