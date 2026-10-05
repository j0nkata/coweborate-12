"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";

const DESKTOP_QUERY = "(min-width: 769px) and (min-height: 560px)";
const FLOW_QUERY = "(max-width: 768px), (max-height: 559px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
const ACTIVE_COVERAGE = 0.6;
const INCOMING_SCALE = 0.988;
const INCOMING_SCRUB = 0.75;

export function SelectedWorkLayeredMotion() {
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
            const panels = gsap.utils.toArray<HTMLElement>(
              "[data-work-panel]",
              section,
            );
            const visuals = gsap.utils.toArray<HTMLElement>(
              "[data-work-visual]",
              section,
            );
            const sticky =
              section.querySelector<HTMLElement>("[data-work-sticky]");
            const states = gsap.utils.toArray<HTMLElement>(
              "[data-work-state]",
              section,
            );
            const desktop =
              Boolean(match.conditions?.desktop) &&
              !Boolean(match.conditions?.reduce);

            let active = 0;
            let textTimeline: gsap.core.Timeline | undefined;
            let refreshFrame = 0;
            let setupRefreshFrame = 0;
            const sectionTriggers: ScrollTrigger[] = [];
            const activationTriggers: ScrollTrigger[] = [];
            const incomingTweens: gsap.core.Tween[] = [];

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

              if (immediate) {
                active = index;
                setSemantics(index);
                gsap.set(states, { autoAlpha: 0, y: 0 });
                gsap.set(states[index], { autoAlpha: 1, y: 0 });
                return;
              }

              const outgoing = states[active];
              const incoming = states[index];
              active = index;
              setSemantics(index);

              gsap.set(
                states.filter(
                  (state) => state !== outgoing && state !== incoming,
                ),
                { autoAlpha: 0, y: 0 },
              );
              gsap.set(outgoing, { autoAlpha: 1, y: 0 });
              gsap.set(incoming, { autoAlpha: 0, y: 12 });

              textTimeline = gsap
                .timeline({
                  defaults: { overwrite: "auto" },
                  onComplete: () => {
                    gsap.set(outgoing, { autoAlpha: 0, y: 0 });
                    gsap.set(incoming, { autoAlpha: 1, y: 0 });
                  },
                })
                .to(outgoing, {
                  y: -12,
                  autoAlpha: 0,
                  duration: 0.24,
                  ease: "power2.out",
                })
                .to(
                  incoming,
                  {
                    y: 0,
                    autoAlpha: 1,
                    duration: 0.32,
                    ease: "power2.out",
                  },
                  0.14,
                );
            };

            section.dataset.workMode = desktop ? "layered" : "flow";
            delete section.dataset.workWebgl;

            if (!desktop) {
              textTimeline?.kill();
              gsap.set([...states, ...panels, ...visuals], {
                clearProps: "opacity,visibility,transform,willChange",
              });
              states.forEach((state, index) => {
                state.inert = index !== 0;
                state.setAttribute("aria-hidden", String(index !== 0));
                state.dataset.active = String(index === 0);
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

            const getPinTop = () => {
              const value = sticky
                ? window.getComputedStyle(sticky).top
                : "0";
              return Number.parseFloat(value) || 0;
            };

            const getPanelPinStart = (panel: HTMLElement) => {
              const top = getPinTop();
              return panel.offsetHeight < window.innerHeight - top
                ? `top ${top}px`
                : "bottom bottom";
            };

            const getBoundaryLine = (panel: HTMLElement) => {
              const top = getPinTop();
              return Math.min(window.innerHeight, top + panel.offsetHeight);
            };

            const getActivationLine = (panel: HTMLElement) => {
              const top = getPinTop();
              const visibleHeight = Math.min(
                panel.offsetHeight,
                window.innerHeight - top,
              );
              return top + visibleHeight * (1 - ACTIVE_COVERAGE);
            };

            const getIncomingOffset = () => {
              return Math.min(64, Math.max(44, window.innerHeight * 0.06));
            };

            const syncActivePanel = (immediate = true) => {
              let next = 0;
              activationTriggers.forEach((trigger, index) => {
                if (window.scrollY >= trigger.start) next = index + 1;
              });
              showState(next, immediate);
            };

            gsap.set(states, { autoAlpha: 0, y: 0 });
            showState(0, true);

            panels.forEach((panel, index) => {
              sectionTriggers.push(
                ScrollTrigger.create({
                  id: `work-layer-pin-${index}`,
                  trigger: panel,
                  start: () => getPanelPinStart(panel),
                  endTrigger: section,
                  end: () => `bottom ${getBoundaryLine(panel)}px`,
                  pin: true,
                  pinSpacing: false,
                  invalidateOnRefresh: true,
                  anticipatePin: 1,
                }),
              );

              if (index === 0) return;

              const incomingTween = gsap.fromTo(
                visuals[index],
                {
                  y: () => getIncomingOffset(),
                  scale: INCOMING_SCALE,
                  transformOrigin: "50% 50%",
                },
                {
                  y: 0,
                  scale: 1,
                  ease: "power2.out",
                  scrollTrigger: {
                    id: `work-layer-incoming-${index}`,
                    trigger: panel,
                    start: "top bottom",
                    end: () => getPanelPinStart(panel),
                    scrub: INCOMING_SCRUB,
                    invalidateOnRefresh: true,
                  },
                },
              );
              incomingTweens.push(incomingTween);
              if (incomingTween.scrollTrigger) {
                sectionTriggers.push(incomingTween.scrollTrigger);
              }

              const activation = ScrollTrigger.create({
                id: `work-layer-active-${index}`,
                trigger: panel,
                start: () => `top ${getActivationLine(panel)}px`,
                endTrigger: section,
                end: "bottom top",
                invalidateOnRefresh: true,
                onEnter: () => showState(index),
                onLeaveBack: () => showState(index - 1),
                onRefresh: () => {
                  window.cancelAnimationFrame(refreshFrame);
                  refreshFrame = window.requestAnimationFrame(() =>
                    syncActivePanel(),
                  );
                },
              });
              activationTriggers.push(activation);
              sectionTriggers.push(activation);
            });

            sectionTriggers.push(
              ScrollTrigger.create({
                id: "work-layer-boundary",
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                invalidateOnRefresh: true,
                onLeaveBack: () => showState(0, true),
              }),
            );

            refreshFrame = window.requestAnimationFrame(() =>
              syncActivePanel(),
            );
            setupRefreshFrame = window.requestAnimationFrame(() => {
              ScrollTrigger.refresh();
            });

            return () => {
              window.cancelAnimationFrame(refreshFrame);
              window.cancelAnimationFrame(setupRefreshFrame);
              textTimeline?.kill();
              sectionTriggers.forEach((trigger) => trigger.kill(true));
              incomingTweens.forEach((tween) => tween.kill());

              gsap.set(states, {
                clearProps: "opacity,visibility,transform,willChange",
              });
              gsap.set(visuals.slice(1), {
                clearProps: "transform,transformOrigin,willChange",
              });
              states.forEach((state, index) => {
                state.inert = index !== 0;
                state.setAttribute("aria-hidden", String(index !== 0));
                state.dataset.active = String(index === 0);
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
