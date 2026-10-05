"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";

type ProjectTransitionMode = "desktop" | "mobile";

type CycleController = {
  refresh: () => void;
  setHovering: (hovering: boolean) => void;
  stop: () => void;
};

export function HeroEditorialMotion() {
  useLayoutEffect(() => {
    let cancelled = false;
    let cleanupAnimation: (() => void) | undefined;
    let refreshFrame = 0;
    let refreshTimer = 0;

    async function setupAnimation() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);

      if (cancelled) return;

      const root = document.querySelector<HTMLElement>(
        "[data-hero-editorial]",
      );
      if (!root) return;

      const context = gsap.context(() => {
        const media = gsap.matchMedia();
        const primaryLine = root.querySelector<HTMLElement>(
          "[data-hero-primary]",
        );
        const characterLine = root.querySelector<HTMLElement>(
          "[data-hero-character]",
        );
        const finalLine = root.querySelector<HTMLElement>(
          "[data-hero-final]",
        );
        const middleLine = root.querySelector<HTMLElement>(
          "[data-hero-middle]",
        );
        const mediaUnit = root.querySelector<HTMLElement>(
          "[data-hero-media-unit]",
        );
        const mediaFrame = root.querySelector<HTMLElement>(
          "[data-hero-media]",
        );
        const projectIndex = root.querySelector<HTMLElement>(
          "[data-hero-project-index]",
        );
        const action = root.querySelector<HTMLElement>("[data-hero-action]");
        const projectImages = gsap.utils.toArray<HTMLElement>(
          "[data-hero-media-image]",
          root,
        );

        if (
          !primaryLine ||
          !characterLine ||
          !finalLine ||
          !middleLine ||
          !mediaUnit ||
          !mediaFrame ||
          !projectIndex ||
          !action ||
          projectImages.length === 0
        ) {
          return;
        }

        const headlineLines = [primaryLine, characterLine, finalLine];
        let currentProject = 0;
        let entranceComplete = false;
        let projectTimeline: gsap.core.Timeline | undefined;
        let counterTimeline: gsap.core.Timeline | undefined;
        let cycleController: CycleController | undefined;

        const normalizeProjectImages = (visibleIndex: number) => {
          projectImages.forEach((image, index) => {
            const isVisible = index === visibleIndex;
            image.dataset.current = isVisible ? "true" : "false";
            gsap.set(image, {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: isVisible ? 1 : 0,
              xPercent: 0,
              zIndex: isVisible ? 2 : 1,
            });
          });
        };

        const showFirstProject = () => {
          projectTimeline?.kill();
          counterTimeline?.kill();
          currentProject = 0;
          projectIndex.textContent = "01";
          normalizeProjectImages(0);
        };

        const animateCounter = (nextProject: number) => {
          counterTimeline?.kill();
          counterTimeline = gsap
            .timeline()
            .to(projectIndex, {
              autoAlpha: 0,
              y: -5,
              duration: 0.18,
              ease: "power2.in",
            })
            .call(() => {
              projectIndex.textContent = String(nextProject + 1).padStart(
                2,
                "0",
              );
            })
            .set(projectIndex, { y: 5 })
            .to(projectIndex, {
              autoAlpha: 1,
              y: 0,
              duration: 0.26,
              ease: "power2.out",
            });
        };

        const showProject = (
          nextProject: number,
          mode: ProjectTransitionMode,
        ) => {
          const normalizedNext =
            (nextProject + projectImages.length) % projectImages.length;

          projectTimeline?.kill();
          counterTimeline?.kill();
          normalizeProjectImages(currentProject);

          if (normalizedNext === currentProject) {
            projectIndex.textContent = String(currentProject + 1).padStart(
              2,
              "0",
            );
            return;
          }

          const previousProject = currentProject;
          const currentImage = projectImages[previousProject];
          const nextImage = projectImages[normalizedNext];
          currentProject = normalizedNext;
          nextImage.dataset.current = "true";
          animateCounter(normalizedNext);

          const directionalTravel = mode === "mobile" ? 18 : 12;
          gsap.set(nextImage, {
            clipPath: "inset(0% 0% 0% 100%)",
            opacity: 1,
            xPercent: directionalTravel,
            zIndex: 3,
          });

          projectTimeline = gsap.timeline({
            defaults: {
              duration: mode === "mobile" ? 0.62 : 0.56,
              ease: "power2.inOut",
            },
            onComplete: () => normalizeProjectImages(normalizedNext),
          });
          projectTimeline
            .to(
              currentImage,
              {
                clipPath: "inset(0% 100% 0% 0%)",
                xPercent: -directionalTravel,
              },
              0,
            )
            .to(
              nextImage,
              {
                clipPath: "inset(0% 0% 0% 0%)",
                xPercent: 0,
              },
              0,
            );
        };

        const revealStaticLayout = () => {
          root.dataset.heroReady = "true";
          root.dataset.heroTransitionActive = "false";
          gsap.set(headlineLines, { clearProps: "transform" });
          gsap.set(middleLine, { clearProps: "transform" });
          gsap.set(mediaUnit, { clearProps: "transform" });
          gsap.set(mediaFrame, { clearProps: "clip-path,transform" });
          gsap.set([projectIndex, action], {
            clearProps: "transform,opacity,visibility",
          });
          showFirstProject();
        };

        const createCycleController = (
          mode: ProjectTransitionMode,
          delay: number,
        ) => {
          let cycleCall: ReturnType<typeof gsap.delayedCall> | undefined;
          let hovering = false;
          let transitionActive =
            root.dataset.heroTransitionActive === "true";

          const isPaused = () =>
            document.hidden || hovering || transitionActive || !entranceComplete;
          const stopTimer = () => {
            cycleCall?.kill();
            cycleCall = undefined;
          };
          const schedule = () => {
            stopTimer();
            if (isPaused()) return;
            cycleCall = gsap.delayedCall(delay, () => {
              showProject(currentProject + 1, mode);
              schedule();
            });
          };
          const handleVisibility = () => schedule();
          const handleTransitionState = (event: Event) => {
            transitionActive = Boolean(
              (event as CustomEvent<{ active: boolean }>).detail?.active,
            );
            schedule();
          };

          document.addEventListener("visibilitychange", handleVisibility);
          root.addEventListener(
            "hero-transition-state",
            handleTransitionState,
          );

          const controller: CycleController = {
            refresh: schedule,
            setHovering: (isHovering) => {
              hovering = isHovering;
              schedule();
            },
            stop: () => {
              stopTimer();
              document.removeEventListener(
                "visibilitychange",
                handleVisibility,
              );
              root.removeEventListener(
                "hero-transition-state",
                handleTransitionState,
              );
            },
          };

          cycleController = controller;
          showFirstProject();
          schedule();

          return () => {
            controller.stop();
            if (cycleController === controller) cycleController = undefined;
          };
        };

        media.add("(prefers-reduced-motion: no-preference)", () => {
          root.dataset.heroReady = "false";
          root.dataset.heroTransitionActive = "false";
          gsap.set(headlineLines, { yPercent: 108 });
          gsap.set(mediaFrame, { clipPath: "inset(0 100% 0 0)" });
          gsap.set([projectIndex, action], { autoAlpha: 0, y: 12 });
          showFirstProject();

          const entrance = gsap.timeline({
            defaults: { ease: "power3.out" },
            onComplete: () => {
              entranceComplete = true;
              root.dataset.heroReady = "true";
              cycleController?.refresh();
            },
          });

          entrance
            .to(primaryLine, { yPercent: 0, duration: 0.82 })
            .to(
              mediaFrame,
              { clipPath: "inset(0 0% 0 0)", duration: 0.92 },
              0.12,
            )
            .to(characterLine, { yPercent: 0, duration: 0.86 }, 0.26)
            .to(finalLine, { yPercent: 0, duration: 0.86 }, 0.4)
            .to(
              [projectIndex, action],
              { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 },
              0.64,
            );

          return () => {
            entranceComplete = false;
            entrance.kill();
            projectTimeline?.kill();
            counterTimeline?.kill();
            gsap.killTweensOf([...projectImages, projectIndex, action]);
          };
        });

        media.add(
          "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
          () => createCycleController("desktop", 2.8),
        );
        media.add(
          "(max-width: 768px) and (prefers-reduced-motion: no-preference)",
          () => createCycleController("mobile", 2.8),
        );

        media.add(
          "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
          () => {
            const targets = gsap.utils.toArray<HTMLElement>(
              "[data-hero-project-target]",
              root,
            );
            let activeTarget: HTMLElement | undefined;
            let pointerTarget: HTMLElement | undefined;
            let resizeFrame = 0;

            const getPositionForTarget = (target: HTMLElement) => {
              const targetIndex = Number(target.dataset.heroProjectTarget ?? 1);
              const rootRect = root.getBoundingClientRect();
              const unitRect = mediaUnit.getBoundingClientRect();
              const currentX = Number(gsap.getProperty(mediaUnit, "x")) || 0;
              const currentY = Number(gsap.getProperty(mediaUnit, "y")) || 0;
              const defaultRect = {
                left: unitRect.left - currentX,
                top: unitRect.top - currentY,
                width: unitRect.width,
                height: unitRect.height,
              };

              if (rootRect.width < 1180 || rootRect.height < 650) {
                return { x: 0, y: 0 };
              }

              const targetRect = target.getBoundingClientRect();
              const edge = Math.max(24, Math.min(64, rootRect.width * 0.045));
              const gap = Math.max(24, Math.min(40, rootRect.width * 0.025));
              let left = defaultRect.left;
              let top = defaultRect.top;

              if (targetIndex === 0) {
                left = targetRect.right + gap;
                top =
                  targetRect.top + targetRect.height / 2 - defaultRect.height / 2;
              } else if (targetIndex === 2) {
                left = targetRect.left - gap - defaultRect.width;
                top =
                  targetRect.top + targetRect.height / 2 - defaultRect.height / 2;
              }

              left = gsap.utils.clamp(
                rootRect.left + edge,
                rootRect.right - edge - defaultRect.width,
                left,
              );
              top = gsap.utils.clamp(
                rootRect.top + edge,
                rootRect.bottom - edge - defaultRect.height,
                top,
              );

              return {
                x: left - defaultRect.left,
                y: top - defaultRect.top,
              };
            };

            const setActiveTarget = (target?: HTMLElement) => {
              targets.forEach((candidate) => {
                candidate.dataset.heroProjectActive =
                  candidate === target ? "true" : "false";
              });
              activeTarget = target;
            };

            const moveToTarget = (target: HTMLElement) => {
              const position = getPositionForTarget(target);
              gsap.to(mediaUnit, {
                ...position,
                duration: 0.72,
                ease: "power3.inOut",
                overwrite: "auto",
              });
            };

            const activateTarget = (target: HTMLElement) => {
              if (root.dataset.heroTransitionActive === "true") return;
              setActiveTarget(target);
              cycleController?.setHovering(true);
              showProject(
                Number(target.dataset.heroProjectTarget ?? 0),
                "desktop",
              );
              moveToTarget(target);
            };

            const returnToDefault = (restoreProject = true) => {
              setActiveTarget();
              cycleController?.setHovering(false);
              if (restoreProject) showProject(0, "desktop");
              gsap.to(mediaUnit, {
                x: 0,
                y: 0,
                duration: 0.68,
                ease: "power3.inOut",
                overwrite: "auto",
              });
            };
            const getFocusedTarget = () =>
              targets.find((target) => target === document.activeElement);
            const handleRootLeave = () => {
              pointerTarget = undefined;
              const focusedTarget = getFocusedTarget();
              if (focusedTarget) {
                activateTarget(focusedTarget);
              } else {
                returnToDefault();
              }
            };
            const handleResize = () => {
              window.cancelAnimationFrame(resizeFrame);
              resizeFrame = window.requestAnimationFrame(() => {
                if (activeTarget) moveToTarget(activeTarget);
              });
            };
            const handleTransitionState = (event: Event) => {
              const isActive = Boolean(
                (event as CustomEvent<{ active: boolean }>).detail?.active,
              );
              if (isActive) {
                pointerTarget = undefined;
                returnToDefault();
                return;
              }

              const focusedTarget = getFocusedTarget();
              if (focusedTarget) activateTarget(focusedTarget);
            };

            const listeners = targets.map((target) => {
              const previousTabIndex = target.getAttribute("tabindex");
              const handleEnter = () => {
                pointerTarget = target;
                activateTarget(target);
              };
              const handleFocus = () => activateTarget(target);
              const handleBlur = (event: FocusEvent) => {
                const nextTarget = event.relatedTarget;
                if (
                  nextTarget instanceof HTMLElement &&
                  targets.includes(nextTarget)
                ) {
                  return;
                }
                if (pointerTarget) {
                  activateTarget(pointerTarget);
                } else {
                  returnToDefault();
                }
              };

              target.tabIndex = 0;
              target.addEventListener("pointerenter", handleEnter);
              target.addEventListener("focus", handleFocus);
              target.addEventListener("blur", handleBlur);
              return {
                target,
                previousTabIndex,
                handleEnter,
                handleFocus,
                handleBlur,
              };
            });

            root.addEventListener("pointerleave", handleRootLeave);
            window.addEventListener("resize", handleResize, { passive: true });
            root.addEventListener(
              "hero-transition-state",
              handleTransitionState,
            );

            return () => {
              window.cancelAnimationFrame(resizeFrame);
              listeners.forEach(
                ({
                  target,
                  previousTabIndex,
                  handleEnter,
                  handleFocus,
                  handleBlur,
                }) => {
                  target.removeEventListener("pointerenter", handleEnter);
                  target.removeEventListener("focus", handleFocus);
                  target.removeEventListener("blur", handleBlur);
                  delete target.dataset.heroProjectActive;
                  if (previousTabIndex === null) {
                    target.removeAttribute("tabindex");
                  } else {
                    target.setAttribute("tabindex", previousTabIndex);
                  }
                },
              );
              root.removeEventListener("pointerleave", handleRootLeave);
              window.removeEventListener("resize", handleResize);
              root.removeEventListener(
                "hero-transition-state",
                handleTransitionState,
              );
              gsap.killTweensOf(mediaUnit);
              gsap.set(mediaUnit, { x: 0, y: 0 });
            };
          },
        );

        media.add("(prefers-reduced-motion: reduce)", () => {
          revealStaticLayout();
        });

        cleanupAnimation = () => media.revert();
      }, root);

      refreshFrame = window.requestAnimationFrame(() =>
        ScrollTrigger.refresh(),
      );
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 500);

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
      cleanupAnimation?.();
    };
  }, []);

  return null;
}
