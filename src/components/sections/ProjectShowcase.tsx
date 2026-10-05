"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { PrimaryCTA } from "@/components/ui/PrimaryCTA";
import type { Project } from "@/lib/projects";
import styles from "./ProjectShowcase.module.css";

type ProjectShowcaseProps = {
  project: Project;
  id: string;
};

export function ProjectShowcase({ project, id }: ProjectShowcaseProps) {
  const href = `/projects/${project.slug}`;
  const titleId = `${id}-${project.slug}-title`;
  const mediaRef = useRef<HTMLAnchorElement>(null);
  const titleTextRef = useRef<HTMLSpanElement>(null);
  const titleImageTextRef = useRef<HTMLSpanElement>(null);
  const descriptionTextRef = useRef<HTMLSpanElement>(null);
  const descriptionImageTextRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const media = mediaRef.current;
    const textLayers = [
      [titleTextRef.current, titleImageTextRef.current],
      [descriptionTextRef.current, descriptionImageTextRef.current],
    ] as const;

    if (!media || textLayers.some(([text, layer]) => !text || !layer)) return;

    let frame = 0;
    let disposed = false;

    const updateClipPaths = () => {
      const mediaRect = media.getBoundingClientRect();

      textLayers.forEach(([text, layer]) => {
        if (!text || !layer) return;

        const textRect = text.getBoundingClientRect();
        const intersection = {
          top: Math.max(textRect.top, mediaRect.top),
          right: Math.min(textRect.right, mediaRect.right),
          bottom: Math.min(textRect.bottom, mediaRect.bottom),
          left: Math.max(textRect.left, mediaRect.left),
        };

        if (
          intersection.right <= intersection.left ||
          intersection.bottom <= intersection.top
        ) {
          layer.style.clipPath = "inset(0 100% 0 0)";
          return;
        }

        layer.style.clipPath = `inset(${intersection.top - textRect.top}px ${
          textRect.right - intersection.right
        }px ${textRect.bottom - intersection.bottom}px ${
          intersection.left - textRect.left
        }px)`;
      });
    };

    const scheduleUpdate = () => {
      if (disposed) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateClipPaths);
    };

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(media);
    textLayers.forEach(([text]) => {
      if (text) resizeObserver.observe(text);
    });

    window.addEventListener("resize", scheduleUpdate);
    void document.fonts.ready.then(scheduleUpdate);
    scheduleUpdate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section
      id={id}
      className={styles.section}
      aria-labelledby={titleId}
      data-project-section
      data-project-slug={project.slug}
      data-section-transition="project-showcase"
      data-section-transition-direction="reverse"
      data-cursor-theme="light"
    >
      <div
        className="section-transition-surface"
        data-section-transition-surface
        aria-hidden="true"
      />
      <div className={styles.composition}>
        <h2 id={titleId} className={styles.title} data-project-title>
          <span className={styles.textStack} ref={titleTextRef}>
            <span className={styles.textBase}>{project.name}</span>
            <span
              className={styles.textImageLayer}
              ref={titleImageTextRef}
              aria-hidden="true"
            >
              {project.name}
            </span>
          </span>
        </h2>

        <p className={styles.meta} data-project-meta>
          {project.category}
        </p>

        <Link
          className={styles.media}
          ref={mediaRef}
          href={href}
          aria-label={`Виж проекта: ${project.name}`}
          data-project-media
        >
          <Image
            className={styles.image}
            src={project.image}
            alt={project.imageAlt}
            width={project.imageWidth}
            height={project.imageHeight}
            sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 959px) 60vw, (max-width: 1808px) 46vw, 828px"
            style={{ objectPosition: project.objectPosition }}
          />
        </Link>

        <p className={styles.description} data-project-description>
          <span className={styles.textStack} ref={descriptionTextRef}>
            <span className={styles.textBase}>{project.introduction}</span>
            <span
              className={styles.textImageLayer}
              ref={descriptionImageTextRef}
              aria-hidden="true"
            >
              {project.introduction}
            </span>
          </span>
        </p>

        <PrimaryCTA
          className={styles.cta}
          variant="on-paper"
          href={href}
          aria-label={`Виж проекта: ${project.name}`}
          data-project-cta
        >
          ВИЖ ПРОЕКТА
        </PrimaryCTA>
      </div>
    </section>
  );
}
