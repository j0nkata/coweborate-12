let gsapModules: ReturnType<typeof createGsapModules> | undefined;

async function createGsapModules() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);

  gsap.registerPlugin(ScrollTrigger);

  return { gsap, ScrollTrigger };
}

export function loadGsap() {
  gsapModules ??= createGsapModules();
  return gsapModules;
}

let motionPathModules: ReturnType<typeof createMotionPathModules> | undefined;

async function createMotionPathModules() {
  const [{ gsap, ScrollTrigger }, { MotionPathPlugin }] = await Promise.all([
    loadGsap(),
    import("gsap/MotionPathPlugin"),
  ]);
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  return { gsap, ScrollTrigger, MotionPathPlugin };
}

// Called from client effects only; other sections keep the existing lightweight loader.
export function loadGsapMotionPath() {
  motionPathModules ??= createMotionPathModules();
  return motionPathModules;
}
