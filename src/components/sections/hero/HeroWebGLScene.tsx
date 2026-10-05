"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  createRoundedGlassTile,
  createTileAssets,
  disposeTileAssets,
} from "@/components/sections/hero/createRoundedGlassTile";
import {
  DESKTOP_CAMERA,
  MOBILE_CAMERA,
  TILE_CONFIGS,
  type CameraConfig,
} from "@/components/sections/hero/heroSceneConfig";

export type HeroSceneAnimationState = {
  tiles: number;
  camera: number;
  light: number;
};

export type HeroSceneApi = {
  animation: HeroSceneAnimationState;
  setIntroComplete: () => void;
  snapToFinal: () => void;
  setReducedMotion: (reduced: boolean) => void;
};

type HeroWebGLSceneProps = {
  onReady: (api: HeroSceneApi) => void;
  onUnavailable: () => void;
};

type RuntimeTile = {
  object: THREE.Group;
  startPosition: THREE.Vector3;
  finalPosition: THREE.Vector3;
  startQuaternion: THREE.Quaternion;
  finalQuaternion: THREE.Quaternion;
  finalScale: THREE.Vector3;
};

function setVector(target: THREE.Vector3, values: readonly number[]) {
  target.set(values[0], values[1], values[2]);
}

function applyCameraConfig(
  camera: THREE.PerspectiveCamera,
  cameraStart: THREE.Vector3,
  cameraFinal: THREE.Vector3,
  cameraTarget: THREE.Vector3,
  config: CameraConfig,
) {
  camera.fov = config.fov;
  setVector(cameraStart, config.introPosition);
  setVector(cameraFinal, config.position);
  setVector(cameraTarget, config.target);
  camera.updateProjectionMatrix();
}

export default function HeroWebGLScene({
  onReady,
  onUnavailable,
}: HeroWebGLSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    let renderer: THREE.WebGLRenderer;

    try {
      if (!window.WebGLRenderingContext) throw new Error("WebGL unavailable");

      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      onUnavailable();
      return;
    }

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("role", "presentation");
    canvas.tabIndex = -1;
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000006, 0.035);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 45);
    const cameraStart = new THREE.Vector3();
    const cameraFinal = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();

    const tileAssets = createTileAssets();
    const tileGroup = new THREE.Group();
    const runtimeTiles: RuntimeTile[] = TILE_CONFIGS.map((config) => {
      const object = createRoundedGlassTile(tileAssets, config.tone);
      tileGroup.add(object);

      return {
        object,
        startPosition: new THREE.Vector3(),
        finalPosition: new THREE.Vector3(),
        startQuaternion: new THREE.Quaternion(),
        finalQuaternion: new THREE.Quaternion(),
        finalScale: new THREE.Vector3(),
      };
    });
    scene.add(tileGroup);

    const backdropGeometry = new THREE.PlaneGeometry(32, 20);
    const backdropMaterial = new THREE.MeshStandardMaterial({
      color: 0x000005,
      roughness: 0.96,
      metalness: 0.04,
    });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.z = -0.8;
    scene.add(backdrop);

    const ambientLight = new THREE.AmbientLight(0x071338, 0.28);
    const keyLight = new THREE.DirectionalLight(0x225cff, 2.25);
    keyLight.position.set(-4.5, 5.5, 7);

    const movingLight = new THREE.PointLight(0x6ba7ff, 66, 22, 1.8);
    movingLight.position.set(-6, -0.2, 3.2);

    const leftRim = new THREE.PointLight(0x0000ee, 24, 14, 2);
    leftRim.position.set(-6.5, -3, 2.2);
    const rightRim = new THREE.PointLight(0x004cff, 18, 13, 2);
    rightRim.position.set(6.5, -0.5, 1.8);
    scene.add(ambientLight, keyLight, movingLight, leftRim, rightRim);

    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.88;

    const animation: HeroSceneAnimationState = {
      tiles: 0,
      camera: 0,
      light: 0,
    };
    let introComplete = false;
    let reducedMotion = false;
    let isMobile = false;
    let isIntersecting = true;
    let documentVisible = !document.hidden;
    let animationFrame = 0;
    let idleTime = 0;
    let lastFrameTime = performance.now();
    const pointerTarget = new THREE.Vector2();
    const pointerCurrent = new THREE.Vector2();
    const pointerNeutral = new THREE.Vector2();
    const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");

    const applyResponsiveLayout = () => {
      const { width, height } = mount.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      isMobile = width < 768;
      const cameraConfig = isMobile ? MOBILE_CAMERA : DESKTOP_CAMERA;
      applyCameraConfig(
        camera,
        cameraStart,
        cameraFinal,
        cameraTarget,
        cameraConfig,
      );

      runtimeTiles.forEach((tile, index) => {
        const config = TILE_CONFIGS[index];
        const transform = isMobile ? config.mobile : config.desktop;
        const finalEuler = new THREE.Euler(...transform.rotation);
        const startEuler = new THREE.Euler(
          transform.rotation[0] + (index % 2 === 0 ? 0.12 : -0.1),
          transform.rotation[1] + (index % 3 === 0 ? 0.1 : -0.06),
          transform.rotation[2] + (index % 2 === 0 ? -0.08 : 0.07),
        );

        tile.object.visible = transform.visible !== false;
        setVector(tile.finalPosition, transform.position);
        tile.startPosition
          .copy(tile.finalPosition)
          .add(new THREE.Vector3(...config.entrance));
        tile.finalQuaternion.setFromEuler(finalEuler);
        tile.startQuaternion.setFromEuler(startEuler);
        setVector(tile.finalScale, transform.scale);
      });

      camera.aspect = width / height;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5),
      );
      renderer.setSize(width, height, false);
      camera.updateProjectionMatrix();
    };

    const renderFrame = (now: number) => {
      animationFrame = 0;
      if (!isIntersecting || !documentVisible) return;

      const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      if (introComplete && !reducedMotion) idleTime += delta;

      const tileProgress = THREE.MathUtils.smootherstep(animation.tiles, 0, 1);
      const cameraProgress = THREE.MathUtils.smootherstep(animation.camera, 0, 1);

      runtimeTiles.forEach((tile) => {
        tile.object.position.lerpVectors(
          tile.startPosition,
          tile.finalPosition,
          tileProgress,
        );
        tile.object.quaternion.slerpQuaternions(
          tile.startQuaternion,
          tile.finalQuaternion,
          tileProgress,
        );
        tile.object.scale.copy(tile.finalScale);
      });

      if (!isMobile && !reducedMotion && introComplete) {
        pointerCurrent.lerp(pointerTarget, 0.035);
      } else {
        pointerCurrent.lerp(pointerNeutral, 0.08);
      }

      cameraPosition.lerpVectors(cameraStart, cameraFinal, cameraProgress);
      cameraPosition.x += pointerCurrent.x * 0.16;
      cameraPosition.y += pointerCurrent.y * 0.1;
      camera.position.copy(cameraPosition);
      lookTarget.copy(cameraTarget);
      lookTarget.x += pointerCurrent.x * 0.05;
      lookTarget.y += pointerCurrent.y * 0.035;
      camera.lookAt(lookTarget);

      const lightPhase = introComplete
        ? Math.sin(idleTime * 0.32) * 0.5 + 0.5
        : THREE.MathUtils.smoothstep(animation.light, 0, 1);
      movingLight.position.x = THREE.MathUtils.lerp(-6.2, 6.2, lightPhase);
      movingLight.position.y = -0.5 + Math.cos(idleTime * 0.27) * 0.32;
      movingLight.position.z = 3.1 + Math.sin(idleTime * 0.2) * 0.24;
      movingLight.intensity = reducedMotion
        ? 58
        : 62 + Math.sin(idleTime * 0.46) * 5;
      movingLight.color.setHSL(
        0.61 + Math.sin(idleTime * 0.18) * 0.008,
        0.92,
        0.66,
      );

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const startRendering = () => {
      if (animationFrame || !isIntersecting || !documentVisible) return;
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const stopRendering = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (isMobile || reducedMotion || !pointerMedia.matches) return;
      const rect = mount.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        pointerTarget.set(0, 0);
        return;
      }

      pointerTarget.set(
        THREE.MathUtils.clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1),
      );
    };

    const handlePointerLeave = () => pointerTarget.set(0, 0);
    const handleVisibility = () => {
      documentVisible = !document.hidden;
      if (documentVisible) startRendering();
      else stopRendering();
    };

    const resizeObserver = new ResizeObserver(applyResponsiveLayout);
    resizeObserver.observe(mount);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) startRendering();
        else stopRendering();
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );
    intersectionObserver.observe(mount);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("visibilitychange", handleVisibility);

    applyResponsiveLayout();

    const api: HeroSceneApi = {
      animation,
      setIntroComplete: () => {
        introComplete = true;
      },
      snapToFinal: () => {
        animation.tiles = 1;
        animation.camera = 1;
        animation.light = 1;
        introComplete = true;
      },
      setReducedMotion: (reduced) => {
        reducedMotion = reduced;
        if (reduced) pointerTarget.set(0, 0);
      },
    };

    onReady(api);
    startRendering();

    return () => {
      stopRendering();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
      disposeTileAssets(tileAssets);
      backdropGeometry.dispose();
      backdropMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [onReady, onUnavailable]);

  return <div className="hero-webgl-mount" ref={mountRef} aria-hidden="true" />;
}
