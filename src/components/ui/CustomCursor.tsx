"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  '[role="button"]',
  "input",
  "select",
  "textarea",
  "label[for]",
  "label:has(input, select, textarea)",
  "summary",
  '[data-cursor="interactive"]',
].join(",");

function CursorLayer({
  variant,
}: {
  variant: "additive" | "difference" | "fallback";
}) {
  return (
    <span className={`custom-cursor__layer custom-cursor__layer--${variant}`}>
      <i className="custom-cursor__square" />
      <span className="custom-cursor__frame">
        <i className="custom-cursor__corner custom-cursor__corner--top-left" />
        <i className="custom-cursor__corner custom-cursor__corner--top-right" />
        <i className="custom-cursor__corner custom-cursor__corner--bottom-left" />
        <i className="custom-cursor__corner custom-cursor__corner--bottom-right" />
      </span>
    </span>
  );
}

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const supportsPixelSwap =
      CSS.supports("mix-blend-mode", "difference") &&
      CSS.supports("mix-blend-mode", "plus-lighter");
    let enabled = false;
    let hasPosition = false;
    let targetX = 0;
    let targetY = 0;

    const syncPointerMode = () => {
      enabled = finePointer.matches;
      document.body.classList.toggle("has-custom-cursor", enabled);

      if (!enabled) {
        cursor.classList.remove(
          "is-visible",
          "is-interactive",
          "is-over-dark",
        );
        hasPosition = false;
      }
    };

    const syncTargetState = () => {
      if (!enabled || !hasPosition) return;

      const target = document.elementFromPoint(targetX, targetY);
      cursor.classList.toggle(
        "is-interactive",
        Boolean(target?.closest(INTERACTIVE_SELECTOR)),
      );

      if (!supportsPixelSwap) {
        const theme = target
          ?.closest<HTMLElement>("[data-cursor-theme]")
          ?.getAttribute("data-cursor-theme");
        cursor.classList.toggle("is-over-dark", theme === "dark");
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!enabled) return;

      targetX = event.clientX;
      targetY = event.clientY;
      cursor.style.setProperty("--custom-cursor-x", `${targetX}px`);
      cursor.style.setProperty("--custom-cursor-y", `${targetY}px`);
      hasPosition = true;
      syncTargetState();
      cursor.classList.add("is-visible");
    };

    const hideCursor = () => cursor.classList.remove("is-visible");
    const showCursor = () => {
      if (enabled && hasPosition) cursor.classList.add("is-visible");
    };
    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) hideCursor();
    };

    cursor.classList.toggle("has-pixel-swap", supportsPixelSwap);
    syncPointerMode();
    finePointer.addEventListener("change", syncPointerMode);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerout", handlePointerOut);
    window.addEventListener("pointerenter", showCursor);
    window.addEventListener("scroll", syncTargetState, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", syncTargetState, { passive: true });
    window.addEventListener("blur", hideCursor);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      finePointer.removeEventListener("change", syncPointerMode);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerout", handlePointerOut);
      window.removeEventListener("pointerenter", showCursor);
      window.removeEventListener("scroll", syncTargetState, true);
      window.removeEventListener("resize", syncTargetState);
      window.removeEventListener("blur", hideCursor);
    };
  }, []);

  return (
    <div className="custom-cursor" ref={cursorRef} aria-hidden="true">
      <span className="custom-cursor__visual">
        <CursorLayer variant="fallback" />
        <CursorLayer variant="difference" />
        <CursorLayer variant="additive" />
      </span>
    </div>
  );
}
