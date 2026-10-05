"use client";

import { useLayoutEffect } from "react";
import { loadGsap } from "@/lib/gsapClient";

const SCRAMBLE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-";
const originalText = new WeakMap<HTMLElement, string>();

function restoreScramble(targets: HTMLElement[]) {
  targets.forEach((target) => {
    const original = originalText.get(target);
    if (original !== undefined) target.textContent = original;
  });
}

function renderScramble(
  targets: HTMLElement[],
  intensity: number,
  frame: number,
) {
  targets.forEach((target, targetIndex) => {
    const original = originalText.get(target) ?? target.textContent ?? "";
    originalText.set(target, original);
    const level = Number(target.dataset.workScrambleLevel ?? "1");
    const amount = intensity * level;

    target.textContent = Array.from(original)
      .map((character, characterIndex) => {
        if (/\s/.test(character)) return character;

        const seed =
          (targetIndex + 1) * 19.19 +
          (characterIndex + 1) * 12.9898 +
          frame * 7.71;
        const noise = Math.abs(Math.sin(seed) * 43758.5453) % 1;
        if (noise > amount) return character;

        const glyphIndex = Math.floor(
          (noise * 97 + characterIndex * 11 + frame * 5) %
            SCRAMBLE_GLYPHS.length,
        );
        return SCRAMBLE_GLYPHS[glyphIndex];
      })
      .join("");
  });
}

type LiquidTarget = {
  travel: number;
  distortion: number;
  opacity: number;
  direction: number;
};

type LiquidController = {
  destroy: () => void;
  setVelocity: (velocity: number) => void;
  updateLayout: () => void;
};

type SpringValue = {
  value: number;
  velocity: number;
};

const LIQUID_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  uniform float uTime;
  uniform float uProgress;
  uniform float uStretch;
  uniform float uVelocity;
  uniform float uDirection;

  void main() {
    vUv = uv;

    vec3 transformed = position;
    float top = smoothstep(0.04, 1.0, uv.y);
    float topCurve = pow(top, 1.7);
    float middle = sin(uv.y * 3.14159265);
    float strength = clamp(uStretch, 0.0, 1.25);
    float speed = clamp(abs(uVelocity), 0.0, 1.0);

    float softNeck = strength * 0.105 * pow(top, 3.4);
    float softBelly = strength * 0.042 * pow(middle, 1.35);
    float edgeFlow = strength * 0.009 * sin(
      uv.y * 6.8 + uDirection * 0.9
    ) * top;
    transformed.x *= 1.0 - softNeck + softBelly + edgeFlow;

    transformed.y += strength * (
      0.12 * topCurve +
      0.018 * middle * (0.35 + uProgress * 0.65) +
      0.016 * topCurve * sin(uv.x * 3.14159265)
    );

    float wobble = strength * speed * 0.009;
    float wave = sin(
      uv.y * 8.5 +
      uTime * 5.0 +
      uDirection * 1.7
    );
    transformed.x += wave * wobble * (0.3 + top * 0.7);
    transformed.y += sin(
      uv.x * 6.2831853 - uTime * 3.2
    ) * wobble * 0.22 * middle;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const LIQUID_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;

  uniform sampler2D uMap;
  uniform vec2 uTextureSize;
  uniform vec2 uPlaneSize;
  uniform float uOpacity;

  void main() {
    float planeAspect = uPlaneSize.x / max(uPlaneSize.y, 1.0);
    float textureAspect = uTextureSize.x / max(uTextureSize.y, 1.0);
    vec2 coverScale = vec2(
      min(planeAspect / textureAspect, 1.0),
      min(textureAspect / planeAspect, 1.0)
    );
    vec2 coverUv = (vUv - 0.5) * coverScale + 0.5;
    vec4 color = texture2D(uMap, coverUv);

    gl_FragColor = vec4(color.rgb, color.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

async function createLiquidController(
  THREE: typeof import("three"),
  section: HTMLElement,
  stage: HTMLElement,
  visuals: HTMLElement[],
  targets: LiquidTarget[],
  getActive: () => number,
): Promise<LiquidController> {
  const canvas = document.createElement("canvas");
  canvas.className = "selected-projects__webgl";
  canvas.setAttribute("aria-hidden", "true");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;
  const geometry = new THREE.PlaneGeometry(1, 1, 32, 24);
  const loader = new THREE.TextureLoader();
  const textures: import("three").Texture[] = [];

  try {
    for (const visual of visuals) {
      const image = visual.querySelector<HTMLImageElement>("img");
      if (!image) throw new Error("Selected Work image is missing");
      textures.push(await loader.loadAsync(image.currentSrc || image.src));
    }
  } catch (error) {
    textures.forEach((texture) => texture.dispose());
    geometry.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    throw error;
  }

  const materials: import("three").ShaderMaterial[] = [];
  const meshes: import("three").Mesh[] = [];
  const runtime = targets.map((target) => ({
    travel: { value: target.travel, velocity: 0 } satisfies SpringValue,
    distortion: {
      value: target.distortion,
      velocity: 0,
    } satisfies SpringValue,
    opacity: target.opacity,
  }));

  textures.forEach((texture, index) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const source = texture.image as {
      naturalHeight?: number;
      naturalWidth?: number;
      height?: number;
      width?: number;
    };
    const textureWidth = source.naturalWidth ?? source.width ?? 1;
    const textureHeight = source.naturalHeight ?? source.height ?? 1;
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uMap: { value: texture },
        uTextureSize: {
          value: new THREE.Vector2(textureWidth, textureHeight),
        },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uStretch: { value: 0 },
        uVelocity: { value: 0 },
        uDirection: { value: 1 },
        uOpacity: { value: index === 0 ? 1 : 0 },
      },
      vertexShader: LIQUID_VERTEX_SHADER,
      fragmentShader: LIQUID_FRAGMENT_SHADER,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    materials.push(material);
    meshes.push(mesh);
  });

  let stageWidth = 1;
  let stageHeight = 1;
  let canvasWidth = 1;
  let stageCenterY = 0;
  let exitDistance = 1;
  let incomingDistance = 1;
  let velocityTarget = 0;
  let velocityCurrent = 0;
  let velocitySpring = 0;
  let frame = 0;
  let running = false;
  let nearSection = false;
  let destroyed = false;
  let lastTime = performance.now();

  const stepSpring = (
    spring: SpringValue,
    target: number,
    stiffness: number,
    damping: number,
    frameScale: number,
  ) => {
    spring.velocity +=
      (target - spring.value) * stiffness * frameScale;
    spring.velocity *= Math.pow(damping, frameScale);
    spring.value += spring.velocity * frameScale;
  };

  const updateLayout = () => {
    if (destroyed) return;
    const rect = stage.getBoundingClientRect();
    stageWidth = Math.max(1, rect.width);
    stageHeight = Math.max(1, rect.height);
    const horizontalOverscan = Math.min(64, stageWidth * 0.06);
    canvasWidth = stageWidth + horizontalOverscan * 2;
    stageCenterY = window.innerHeight * 0.5 - (rect.top + rect.height * 0.5);
    exitDistance = rect.top + rect.height * 0.5 + 40;
    incomingDistance = rect.height * 0.84;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(canvasWidth, window.innerHeight, false);
    canvas.style.left = `${rect.left - horizontalOverscan}px`;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    camera.left = -canvasWidth * 0.5;
    camera.right = canvasWidth * 0.5;
    camera.top = window.innerHeight * 0.5;
    camera.bottom = -window.innerHeight * 0.5;
    camera.updateProjectionMatrix();

    meshes.forEach((mesh, index) => {
      mesh.scale.set(stageWidth, stageHeight, 1);
      materials[index].uniforms.uPlaneSize.value.set(
        stageWidth,
        stageHeight,
      );
    });
  };

  const render = (time: number) => {
    if (destroyed || !nearSection) {
      running = false;
      return;
    }

    const frameScale = Math.min((time - lastTime) / 16.667, 2);
    lastTime = time;
    velocitySpring += (velocityTarget - velocityCurrent) * 0.1 * frameScale;
    velocitySpring *= Math.pow(0.72, frameScale);
    velocityCurrent += velocitySpring * frameScale;
    velocityTarget *= Math.pow(0.82, frameScale);

    runtime.forEach((current, index) => {
      const target = targets[index];
      stepSpring(current.travel, target.travel, 0.105, 0.74, frameScale);
      stepSpring(
        current.distortion,
        target.distortion,
        0.09,
        0.72,
        frameScale,
      );
      current.opacity +=
        (target.opacity - current.opacity) * Math.min(1, 0.24 * frameScale);

      const material = materials[index];
      const mesh = meshes[index];
      const distortion = Math.max(0, current.distortion.value);
      const velocityBoost = Math.min(1, Math.abs(velocityCurrent));
      const travelDistance =
        current.travel.value < 0 ? exitDistance : incomingDistance;

      mesh.position.y =
        stageCenterY - current.travel.value * travelDistance;
      mesh.renderOrder = index === getActive() ? 2 : 1;
      mesh.visible = current.opacity > 0.002;
      material.uniforms.uTime.value = time * 0.001;
      material.uniforms.uProgress.value = distortion;
      material.uniforms.uStretch.value =
        distortion * (1 + velocityBoost * 0.22);
      material.uniforms.uVelocity.value = velocityCurrent;
      material.uniforms.uDirection.value = target.direction;
      material.uniforms.uOpacity.value = Math.min(
        1,
        Math.max(0, current.opacity),
      );
    });

    renderer.render(scene, camera);
    frame = window.requestAnimationFrame(render);
  };

  const start = () => {
    if (running || destroyed || !nearSection) return;
    running = true;
    lastTime = performance.now();
    frame = window.requestAnimationFrame(render);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      nearSection = entry.isIntersecting;
      if (nearSection) start();
    },
    { rootMargin: "75% 0px" },
  );
  observer.observe(section);
  window.addEventListener("resize", updateLayout, { passive: true });
  updateLayout();
  renderer.render(scene, camera);
  stage.appendChild(canvas);
  section.dataset.workWebgl = "true";

  return {
    setVelocity: (velocity) => {
      velocityTarget = Math.max(-1, Math.min(1, velocity / 2400));
      start();
    },
    updateLayout,
    destroy: () => {
      destroyed = true;
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
      delete section.dataset.workWebgl;
      canvas.remove();
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      geometry.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

export function SelectedWorkMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("#work");
    if (!root) return;

    const section = root;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function setup() {
      const [{ gsap, ScrollTrigger }] = await Promise.all([
        loadGsap(),
        document.fonts.ready,
      ]);
      if (cancelled) return;

      const context = gsap.context(() => {}, section);
      cleanup = () => context.revert();

      context.add(() => {
        const media = gsap.matchMedia();

        media.add(
          {
            desktop: "(min-width: 769px) and (min-height: 560px)",
            flow: "(max-width: 768px), (max-height: 559px)",
            reduce: "(prefers-reduced-motion: reduce)",
          },
          (match) => {
            const visuals = gsap.utils.toArray<HTMLElement>(
              "[data-work-visual]",
              section,
            );
            const items = gsap.utils.toArray<HTMLElement>(
              "[data-work-item]",
              section,
            );
            const reveals = visuals.map(
              (visual) =>
                visual.querySelector<HTMLElement>("[data-work-reveal]")!,
            );
            const states = gsap.utils.toArray<HTMLElement>(
              "[data-work-state]",
              section,
            );
            const sticky =
              section.querySelector<HTMLElement>("[data-work-sticky]")!;
            const reduced = Boolean(match.conditions?.reduce);
            const desktop = Boolean(match.conditions?.desktop) && !reduced;
            section.dataset.workMode = desktop ? "desktop" : "flow";

            const focusInFlow = (event: FocusEvent) => {
              const target = event.target as HTMLElement;
              if (target.matches(":focus-visible")) {
                target.scrollIntoView({
                  block: "nearest",
                  behavior: "instant",
                });
              }
            };

            if (!desktop) {
              gsap.set([...states, ...items, ...reveals], {
                clearProps:
                  "opacity,visibility,transform,clipPath,zIndex,willChange",
              });

              visuals.forEach((visual, index) => {
                visual.inert = false;
                visual.removeAttribute("aria-hidden");
                items[index].dataset.active = String(index === 0);
              });
              section.addEventListener("focusin", focusInFlow);

              if (!reduced) {
                reveals.forEach((reveal, index) => {
                  gsap.fromTo(
                    reveal,
                    {
                      clipPath: "inset(5% 0% 7% 0%)",
                      y: 14,
                      skewY: index % 2 === 0 ? 0.8 : -0.8,
                      scale: 1.015,
                    },
                    {
                      clipPath: "inset(0% 0% 0% 0%)",
                      y: 0,
                      skewY: 0,
                      scale: 1,
                      duration: 0.62,
                      ease: "power2.out",
                      scrollTrigger: {
                        id: `work-flow-${index}`,
                        trigger: visuals[index],
                        start: "top 90%",
                        once: true,
                        invalidateOnRefresh: true,
                      },
                    },
                  );
                });
              }

              return () => {
                section.removeEventListener("focusin", focusInFlow);
                gsap.set(reveals, {
                  clearProps: "clipPath,transform",
                });
                delete section.dataset.workMode;
              };
            }

            const transitions = gsap.utils.toArray<HTMLElement>(
              "[data-work-transition]",
              section,
            );
            const lines = states.map((state) =>
              Array.from(
                state.querySelectorAll<HTMLElement>("[data-work-copy-line]"),
              ),
            );
            const scrambleTargets = states.map((state) =>
              Array.from(
                state.querySelectorAll<HTMLElement>("[data-work-scramble]"),
              ),
            );
            const allScrambleTargets = scrambleTargets.flat();
            const deforms = visuals.map(
              (visual) =>
                visual.querySelector<HTMLElement>("[data-work-deform]")!,
            );
            const stage =
              section.querySelector<HTMLElement>("[data-work-stage]")!;
            const transitionTriggers: ScrollTrigger[] = [];
            const mediaTimelines: gsap.core.Timeline[] = [];
            let active = 0;
            let requested = 0;
            let stateTimeline: gsap.core.Timeline | undefined;
            let refreshFrame = 0;
            let liquidController: LiquidController | undefined;
            let liquidDisposed = false;
            const liquidTargets: LiquidTarget[] = visuals.map(
              (_, index) => ({
                travel: 0,
                distortion: 0,
                opacity: index === 0 ? 1 : 0,
                direction: index % 2 === 0 ? 1 : -1,
              }),
            );

            void import("three")
              .then((THREE) =>
                createLiquidController(
                  THREE,
                  section,
                  stage,
                  visuals,
                  liquidTargets,
                  () => active,
                ),
              )
              .then((controller) => {
                if (liquidDisposed) {
                  controller.destroy();
                  return;
                }
                liquidController = controller;
              })
              .catch(() => {
                delete section.dataset.workWebgl;
              });

            allScrambleTargets.forEach((target) => {
              originalText.set(target, target.textContent ?? "");
            });

            function selectPanel(index: number) {
              states.forEach((state, position) => {
                const selected = position === index;
                state.dataset.active = String(selected);
                state.inert = !selected;
                state.setAttribute("aria-hidden", String(!selected));
                gsap.set(state, { autoAlpha: selected ? 1 : 0 });
              });

              items.forEach((item, position) => {
                const selected = position === index;
                item.dataset.active = String(selected);
                visuals[position].inert = !selected;
                visuals[position].setAttribute(
                  "aria-hidden",
                  String(!selected),
                );
              });

              active = index;
              section.dataset.workActive = String(index);
            }

            function resetTextTransforms() {
              gsap.set(lines.flat(), {
                x: 0,
                skewX: 0,
                opacity: 1,
                clipPath: "inset(0% 0% 0% 0%)",
              });
            }

            function activate(index: number, immediate = false) {
              if (
                !immediate &&
                sticky.contains(document.activeElement) &&
                document.activeElement?.matches(":focus-visible")
              ) {
                return;
              }
              if (index === requested && !immediate) return;

              requested = index;
              stateTimeline?.kill();
              restoreScramble(allScrambleTargets);
              resetTextTransforms();
              section.dataset.workTextTransition = "false";

              if (immediate || index === active) {
                selectPanel(index);
                return;
              }

              const outgoing = active;
              const outgoingLines = lines[outgoing];
              const incomingLines = lines[index];
              const outgoingScramble = { amount: 0 };
              const incomingScramble = { amount: 1 };

              renderScramble(scrambleTargets[index], 1, 0);
              gsap.set(incomingLines, {
                x: -6,
                skewX: -1.8,
                opacity: 0.78,
                clipPath: "inset(0% 100% 0% 0%)",
              });

              section.dataset.workTextTransition = "true";
              stateTimeline = gsap.timeline({
                onComplete: () => {
                  restoreScramble(allScrambleTargets);
                  resetTextTransforms();
                  section.dataset.workTextTransition = "false";
                },
                onInterrupt: () => {
                  restoreScramble(allScrambleTargets);
                },
              });

              stateTimeline
                .to(
                  outgoingScramble,
                  {
                    amount: 1,
                    duration: 0.14,
                    ease: "none",
                    onUpdate: () => {
                      renderScramble(
                        scrambleTargets[outgoing],
                        outgoingScramble.amount,
                        Math.ceil(outgoingScramble.amount * 9),
                      );
                    },
                  },
                  0,
                )
                .to(
                  outgoingLines,
                  {
                    x: (lineIndex) => (lineIndex % 2 === 0 ? 5 : -4),
                    skewX: 1.8,
                    opacity: 0.82,
                    clipPath: "inset(0% 16% 0% 0%)",
                    duration: 0.05,
                    stagger: 0.008,
                    ease: "none",
                  },
                  0,
                )
                .to(outgoingLines, {
                  x: (lineIndex) => (lineIndex % 2 === 0 ? -3 : 4),
                  skewX: -1.2,
                  opacity: 0.92,
                  clipPath: "inset(0% 42% 0% 0%)",
                  duration: 0.045,
                  stagger: 0.006,
                  ease: "none",
                })
                .to(outgoingLines, {
                  x: 6,
                  skewX: 2,
                  opacity: 0,
                  clipPath: "inset(0% 100% 0% 0%)",
                  duration: 0.055,
                  stagger: 0.006,
                  ease: "power2.in",
                })
                .call(() => {
                  restoreScramble(scrambleTargets[outgoing]);
                  selectPanel(index);
                })
                .to(
                  incomingScramble,
                  {
                    amount: 0,
                    duration: 0.2,
                    ease: "none",
                    onUpdate: () => {
                      renderScramble(
                        scrambleTargets[index],
                        incomingScramble.amount,
                        Math.ceil(incomingScramble.amount * 9),
                      );
                    },
                  },
                  "<",
                )
                .to(
                  incomingLines,
                  {
                    x: 4,
                    skewX: 1.1,
                    opacity: 0.86,
                    clipPath: "inset(0% 48% 0% 0%)",
                    duration: 0.055,
                    stagger: 0.008,
                    ease: "none",
                  },
                  "<",
                )
                .to(incomingLines, {
                  x: -2,
                  skewX: -0.7,
                  opacity: 0.94,
                  clipPath: "inset(0% 14% 0% 0%)",
                  duration: 0.06,
                  stagger: 0.006,
                  ease: "none",
                })
                .to(incomingLines, {
                  x: 0,
                  skewX: 0,
                  opacity: 1,
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 0.08,
                  stagger: 0.006,
                  ease: "power2.out",
                });
            }

            gsap.set(states, { autoAlpha: 0 });
            resetTextTransforms();
            gsap.set(reveals, {
              autoAlpha: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
            });
            gsap.set(reveals[0], { autoAlpha: 1 });
            gsap.set(visuals, { yPercent: 0 });
            gsap.set(deforms, {
              xPercent: 0,
              yPercent: 0,
              scaleX: 1,
              scaleY: 1,
              skewY: 0,
            });
            selectPanel(0);

            const entry = gsap
              .timeline({
                defaults: { ease: "power2.out" },
                scrollTrigger: {
                  id: "work-entry",
                  trigger: section,
                  start: "top 80%",
                  once: true,
                  invalidateOnRefresh: true,
                },
              })
              .from(
                section.querySelector(".selected-projects__label"),
                { y: 16, opacity: 0, duration: 0.5 },
              )
              .fromTo(
                lines[0],
                {
                  x: -4,
                  opacity: 0,
                  clipPath: "inset(0% 100% 0% 0%)",
                },
                {
                  x: 0,
                  opacity: 1,
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: 0.5,
                  stagger: 0.035,
                },
                0.1,
              )
              .fromTo(
                reveals[0],
                {
                  clipPath: "inset(7% 0% 7% 0%)",
                  y: 18,
                  scale: 1.02,
                },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  y: 0,
                  scale: 1,
                  duration: 0.68,
                },
                0.06,
              );

            transitions.forEach((transition, index) => {
              const direction = index % 2 === 0 ? 1 : -1;
              const outgoingVisual = visuals[index];
              const incomingVisual = visuals[index + 1];
              const outgoingReveal = reveals[index];
              const incomingReveal = reveals[index + 1];
              const outgoingDeform = deforms[index];
              const incomingDeform = deforms[index + 1];
              const outgoingLiquid = liquidTargets[index];
              const incomingLiquid = liquidTargets[index + 1];

              const timeline = gsap.timeline({
                paused: true,
                defaults: { ease: "none" },
              });

              timeline
                .set(outgoingReveal, { autoAlpha: 1 }, 0)
                .set(
                  outgoingLiquid,
                  { opacity: 1, direction },
                  0,
                )
                .to(
                  outgoingLiquid,
                  { distortion: 1, duration: 0.34 },
                  0.14,
                )
                .fromTo(
                  outgoingDeform,
                  {
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    transformOrigin: "50% 0%",
                  },
                  {
                    scaleX: 0.992,
                    scaleY: 1.055,
                    skewY: 1.2 * direction,
                    duration: 0.32,
                    immediateRender: false,
                  },
                  0.14,
                )
                .to(
                  outgoingLiquid,
                  { travel: -1, duration: 0.56 },
                  0.18,
                )
                .fromTo(
                  outgoingVisual,
                  { yPercent: 0 },
                  {
                    yPercent: -125,
                    duration: 0.56,
                    immediateRender: false,
                  },
                  0.18,
                )
                .set(outgoingReveal, { autoAlpha: 0 }, 0.74)
                .set(outgoingLiquid, { opacity: 0 }, 0.74)
                .set(outgoingVisual, { yPercent: 0 }, 0.8)
                .set(
                  outgoingLiquid,
                  { travel: 0, distortion: 0 },
                  0.8,
                )
                .set(
                  outgoingDeform,
                  {
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                  },
                  0.8,
                )
                .set(
                  incomingLiquid,
                  {
                    travel: 1,
                    distortion: 1,
                    opacity: 0,
                    direction: -direction,
                  },
                  0.25,
                )
                .set(incomingVisual, { yPercent: 84 }, 0.25)
                .set(incomingReveal, { autoAlpha: 0 }, 0.25)
                .set(
                  incomingDeform,
                  {
                    scaleX: 0.992,
                    scaleY: 1.055,
                    skewY: -1.2 * direction,
                    transformOrigin: "50% 0%",
                  },
                  0.25,
                )
                .set(incomingReveal, { autoAlpha: 1 }, 0.27)
                .set(incomingLiquid, { opacity: 1 }, 0.27)
                .to(
                  incomingLiquid,
                  { travel: 0, duration: 0.53 },
                  0.27,
                )
                .to(
                  incomingVisual,
                  {
                    yPercent: 0,
                    duration: 0.53,
                  },
                  0.27,
                )
                .to(
                  incomingLiquid,
                  { distortion: 0, duration: 0.52 },
                  0.3,
                )
                .to(
                  incomingDeform,
                  {
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                    duration: 0.52,
                  },
                  0.3,
                )
                .set(
                  incomingLiquid,
                  { travel: 0, distortion: 0, opacity: 1 },
                  1,
                )
                .set(incomingVisual, { yPercent: 0 }, 1)
                .set(incomingReveal, { autoAlpha: 1 }, 1)
                .set(
                  incomingDeform,
                  {
                    scaleX: 1,
                    scaleY: 1,
                    skewY: 0,
                  },
                  1,
                );

              mediaTimelines.push(timeline);
              transitionTriggers.push(
                ScrollTrigger.create({
                  id: `work-liquid-transition-${index}`,
                  trigger: transition,
                  animation: timeline,
                  start: "top 50%",
                  end: "bottom 50%",
                  scrub: 0.22,
                  invalidateOnRefresh: true,
                  onUpdate: (trigger) => {
                    liquidController?.setVelocity(trigger.getVelocity());
                    liquidController?.updateLayout();
                    entry.progress(1);
                    let nextActive = 0;
                    transitionTriggers.forEach((trigger, position) => {
                      if (trigger.progress >= 0.5) {
                        nextActive = position + 1;
                      }
                    });
                    activate(nextActive);
                  },
                  onRefresh: () => {
                    liquidController?.updateLayout();
                    window.cancelAnimationFrame(refreshFrame);
                    refreshFrame = window.requestAnimationFrame(() => {
                      let nextActive = 0;
                      transitionTriggers.forEach((trigger, position) => {
                        if (trigger.progress >= 0.5) {
                          nextActive = position + 1;
                        }
                      });
                      entry.progress(1);
                      activate(nextActive, true);
                    });
                  },
                }),
              );
            });

            const focus = (event: FocusEvent) => {
              const target = event.target as HTMLElement;
              if (!target.matches(":focus-visible")) return;

              entry.progress(1);
              const visual =
                target.closest<HTMLElement>("[data-work-visual]");
              if (visual) activate(visuals.indexOf(visual), true);
              target.scrollIntoView({
                block: "nearest",
                behavior: "instant",
              });
            };
            section.addEventListener("focusin", focus);

            return () => {
              liquidDisposed = true;
              liquidController?.destroy();
              window.cancelAnimationFrame(refreshFrame);
              section.removeEventListener("focusin", focus);
              stateTimeline?.kill();
              mediaTimelines.forEach((timeline) => timeline.kill());
              restoreScramble(allScrambleTargets);

              states.forEach((state, index) => {
                state.inert = false;
                state.removeAttribute("aria-hidden");
                state.dataset.active = String(index === 0);
              });
              visuals.forEach((visual, index) => {
                visual.inert = false;
                visual.removeAttribute("aria-hidden");
                items[index].dataset.active = String(index === 0);
              });

              gsap.set(
                [
                  ...states,
                  ...lines.flat(),
                  ...visuals,
                  ...reveals,
                  ...deforms,
                  ...items,
                ],
                {
                  clearProps:
                    "opacity,visibility,transform,clipPath,zIndex,willChange",
                },
              );
              delete section.dataset.workMode;
              delete section.dataset.workActive;
              delete section.dataset.workTextTransition;
            };
          },
        );
      });
    }

    void setup().catch(() => {
      cleanup?.();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
