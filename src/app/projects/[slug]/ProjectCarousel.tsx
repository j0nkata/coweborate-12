"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import type { ProjectGalleryItem } from "@/lib/projects";

const AUTOPLAY_DELAY = 4500;

type ProjectCarouselProps = {
  images: readonly ProjectGalleryItem[];
  projectName: string;
};

export function ProjectCarousel({
  images,
  projectName,
}: ProjectCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const hasMultipleImages = images.length > 1;

  const showPrevious = useCallback(() => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setIsReducedMotion(mediaQuery.matches);
    const syncVisibility = () => setIsPageVisible(!document.hidden);

    syncMotionPreference();
    syncVisibility();
    mediaQuery.addEventListener("change", syncMotionPreference);
    document.addEventListener("visibilitychange", syncVisibility);

    return () => {
      mediaQuery.removeEventListener("change", syncMotionPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (
      !hasMultipleImages ||
      isReducedMotion ||
      !isPageVisible ||
      isInteracting
    ) {
      return;
    }

    const autoplayTimer = window.setTimeout(showNext, AUTOPLAY_DELAY);
    return () => window.clearTimeout(autoplayTimer);
  }, [activeIndex, hasMultipleImages, isInteracting, isPageVisible, isReducedMotion, showNext]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!hasMultipleImages) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!rootRef.current?.contains(event.relatedTarget as Node | null)) {
      setIsInteracting(false);
    }
  };

  return (
    <section
      className="case-study__carousel"
      ref={rootRef}
      role="region"
      aria-label={`Галерия за ${projectName}`}
      aria-roledescription="carousel"
      tabIndex={hasMultipleImages ? 0 : undefined}
      onBlurCapture={handleBlur}
      onFocusCapture={() => setIsInteracting(true)}
      onKeyDown={handleKeyDown}
      onPointerEnter={() => setIsInteracting(true)}
      onPointerLeave={() => setIsInteracting(false)}
    >
      <div className="case-study__carousel-stage">
        {images.map((image, index) => {
          const isActive = index === activeIndex;

          return (
            <figure
              className="case-study__carousel-slide"
              data-active={isActive ? "true" : "false"}
              aria-hidden={!isActive}
              key={`${image.src}-${index}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority={index === 0}
                sizes="100vw"
                style={{ objectPosition: image.objectPosition }}
              />
            </figure>
          );
        })}
      </div>

      {hasMultipleImages ? (
        <div className="case-study__carousel-controls">
          <p aria-label={`Снимка ${activeIndex + 1} от ${images.length}`}>
            {String(activeIndex + 1).padStart(2, "0")}
            <span aria-hidden="true"> / </span>
            {String(images.length).padStart(2, "0")}
          </p>
          <div>
            <button type="button" onClick={showPrevious} aria-label="Предишна снимка">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" onClick={showNext} aria-label="Следваща снимка">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
