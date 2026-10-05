export type SectionTransitionMode = "desktop" | "mobile";
export type SectionTransitionDirection = "forward" | "reverse";

export const SECTION_TRANSITION = {
  scrub: 0.7,
  rangeViewportRatio: 0.22,
  firstPhaseDuration: 0.58,
  secondPhaseDuration: 0.42,
  hiddenClip: "polygon(0 101%, 100% 100%, 100% 100%, 0 100%)",
  fullClip: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
} as const;

export function getSectionTransitionMidClip(
  mode: SectionTransitionMode,
  direction: SectionTransitionDirection,
) {
  const [left, right] = mode === "desktop" ? [43, 39] : [45, 43];
  const leadingLeft = direction === "reverse" ? right : left;
  const leadingRight = direction === "reverse" ? left : right;

  return `polygon(0 ${leadingLeft}%, 100% ${leadingRight}%, 100% 100%, 0 100%)`;
}

type AddSectionRevealOptions = {
  direction: SectionTransitionDirection;
  mode: SectionTransitionMode;
  position?: number;
};

export function addSectionReveal(
  timeline: gsap.core.Timeline,
  target: HTMLElement,
  {
    direction,
    mode,
    position = 0,
  }: AddSectionRevealOptions,
) {
  timeline
    .fromTo(
      target,
      { clipPath: SECTION_TRANSITION.hiddenClip },
      {
        clipPath: getSectionTransitionMidClip(mode, direction),
        duration: SECTION_TRANSITION.firstPhaseDuration,
        ease: "none",
      },
      position,
    )
    .to(
      target,
      {
        clipPath: SECTION_TRANSITION.fullClip,
        duration: SECTION_TRANSITION.secondPhaseDuration,
        ease: "power1.inOut",
      },
      position + SECTION_TRANSITION.firstPhaseDuration,
    );

  return timeline;
}
