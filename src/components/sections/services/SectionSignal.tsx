"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { loadGsapMotionPath } from "@/lib/gsapClient";
import styles from "./SectionSignal.module.css";

type SectionSignalProps = {
  rootRef: RefObject<HTMLElement | null>;
  compositionRef: RefObject<HTMLElement | null>;
  axisRef: RefObject<HTMLElement | null>;
  endpointRef: RefObject<HTMLElement | null>;
  surface?: "paper" | "blue";
};

const MASTER_DURATION = 5.25;
const ARRIVAL_TIME = MASTER_DURATION * 0.92;

export function SectionSignal({ rootRef, compositionRef, axisRef, endpointRef, surface = "paper" }: SectionSignalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setup() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([loadGsapMotionPath(), document.fonts.ready]);
      if (cancelled) return;
      const root = rootRef.current;
      const composition = compositionRef.current;
      const axis = axisRef.current;
      const endpoint = endpointRef.current;
      const svg = svgRef.current;
      const path = pathRef.current;
      const node = nodeRef.current;
      const cta = endpoint?.querySelector<HTMLAnchorElement>("a");
      if (!root || !composition || !axis || !endpoint || !svg || !path || !node || !cta) return;

      const context = gsap.context(() => {}, root);
      const media = gsap.matchMedia();
      cleanup = () => {
        media.revert();
        context.revert();
        delete root.dataset.signalProgress;
        delete root.dataset.signalReady;
        delete root.dataset.signalUsable;
      };

      context.add(() => {
        media.add({ desktop: "(min-width: 1101px)", tablet: "(min-width: 769px) and (max-width: 1100px)", mobile: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" }, (match) => {
          const reduce = Boolean(match.conditions?.reduce);
          let frame = 0;
          let pathLength = 0;
          let usable: boolean | undefined;

          const setUsable = (value: boolean) => {
            if (value === usable) return;
            usable = value;
            root.dataset.signalUsable = String(value);
            cta.tabIndex = value ? 0 : -1;
            cta.setAttribute("aria-disabled", String(!value));
            if (!value && document.activeElement === cta) {
              root.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus({ preventScroll: true });
            }
          };

          const measure = () => {
            const bounds = composition.getBoundingClientRect();
            const axisBounds = axis.getBoundingClientRect();
            const action = cta.getBoundingClientRect();
            const actionY = endpoint.getBoundingClientRect().top - bounds.top + action.height / 2;
            const x = axisBounds.left - bounds.left + axisBounds.width / 2;
            const startY = axisBounds.top - bounds.top;
            const endX = action.left - bounds.left - 12;
            const radius = Math.min(16, Math.max(0, (endX - x) / 2));
            svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
            path.setAttribute("d", `M ${x} ${startY} V ${actionY - radius} Q ${x} ${actionY} ${x + radius} ${actionY} H ${endX}`);
            pathLength = path.getTotalLength();
            gsap.set(path, { strokeDasharray: pathLength });
            // The square's local bounds stay constant across responsive layouts.
            // MotionPath also positions its initial state at the route start.
            gsap.set(node, { x: 0, y: 0 });
            gsap.set(node, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false, start: 0, end: 0 },
            });
          };

          root.dataset.signalReady = "true";
          measure();

          // No standalone reveal tween: all three visuals share this timeline's time.
          const master = gsap.timeline({ paused: true });
          master
            .fromTo(path, { strokeDashoffset: () => pathLength }, {
              strokeDashoffset: 0, duration: ARRIVAL_TIME, ease: "none",
            }, 0)
            .to(node, {
              motionPath: { path, align: path, alignOrigin: [0.5, 0.5], autoRotate: false },
              duration: ARRIVAL_TIME, ease: "none", immediateRender: true,
            }, 0)
            .fromTo(cta, { clipPath: "inset(0 100% 0 0)", y: 8 }, {
              clipPath: "inset(0 0% 0 0)", y: 0,
              duration: MASTER_DURATION - ARRIVAL_TIME, ease: "power2.out",
            }, ARRIVAL_TIME);

          const sync = () => {
            const progress = master.progress();
            root.dataset.signalProgress = progress.toFixed(4);
            const complete = progress >= 0.99999;
            setUsable(complete);
            // Keep the existing focus outline unclipped only at the fully open endpoint.
            if (complete) cta.style.clipPath = "none";
          };
          master.eventCallback("onUpdate", sync);

          const trigger = reduce ? undefined : ScrollTrigger.create({
            id: "services-signal", trigger: root, animation: master,
            start: "top 85%",
            end: () => `+=${Math.max(1, endpoint.offsetTop + composition.offsetTop + cta.offsetHeight + window.innerHeight * 0.3)}`,
            scrub: 0.7, invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: sync,
          });
          if (reduce) master.progress(1);
          else master.progress(trigger?.progress ?? 0);
          sync();

          const observer = new ResizeObserver(() => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
              if (trigger) trigger.refresh();
              else {
                measure();
                // Render both ends in the same frame so a completed paused timeline
                // recomputes MotionPath geometry after a reduced-motion layout change.
                master.invalidate().progress(0, true).progress(1);
                sync();
              }
            });
          });
          observer.observe(composition);

          return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            trigger?.kill();
            master.kill();
            gsap.set([cta, node], { clearProps: "clipPath,transform,transformOrigin" });
            setUsable(false);
          };
        });
      });
    }

    void setup().catch(() => cleanup?.());
    return () => { cancelled = true; cleanup?.(); };
  }, [rootRef, compositionRef, axisRef, endpointRef]);

  return (
    <svg className={styles.signal} ref={svgRef} data-surface={surface} aria-hidden="true" focusable="false">
      <path className={styles.line} ref={pathRef} />
      <g ref={nodeRef}>
        <rect className={styles.node} x="-4.5" y="-4.5" width="9" height="9" />
      </g>
    </svg>
  );
}
