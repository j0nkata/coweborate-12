import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/motion/ScrollToTop";
import { PrimaryCTA } from "@/components/ui/PrimaryCTA";
import {
  getProjectBySlug,
  PROJECTS,
  type Project,
  type ProjectDetailMedia,
} from "@/lib/projects";
import styles from "./ProjectDetail.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return {};

  return {
    title: `${project.detail.title} — COWEBORATE`,
    description: project.detail.shortDescription,
  };
}

function ProjectMedia({
  media,
  index,
  eager = false,
}: {
  media: ProjectDetailMedia;
  index: number;
  eager?: boolean;
}) {
  return (
    <section
      className={styles.mediaSection}
      aria-label={`Проектна визуализация ${index}`}
      data-project-media-section
      data-project-media-fallback={media.isFallback ? "true" : "false"}
    >
      <figure className={styles.mediaFigure}>
        <Image
          src={media.src}
          alt={media.alt}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes="100vw"
          style={{ objectPosition: media.objectPosition }}
        />
      </figure>
    </section>
  );
}

function ProjectOverview({ project }: { project: Project }) {
  const { detail } = project;

  return (
    <section
      className={styles.editorialSection}
      aria-labelledby="project-overview-title"
      data-project-detail-section
    >
      <div className={styles.sectionGrid}>
        <div className={styles.stickyColumn}>
          <h2
            className={styles.sectionTitle}
            id="project-overview-title"
            data-project-detail-sticky-title
          >
            КАКВО
            <br />
            НАПРАВИХМЕ
            <br />
            ЗА ТЯХ
          </h2>
        </div>

        <div className={styles.informationRail} data-project-detail-content>
          <div className={styles.platformRow} data-project-detail-item>
            <p className={styles.railLabel}>PLATFORM</p>
            <p className={styles.platformValue}>{detail.platform}</p>
          </div>

          <div className={styles.scopeGroup}>
            <p className={styles.railLabel}>SCOPE / EXPERTISE</p>
            <ul className={styles.railList}>
              {detail.scope.map((item, itemIndex) => (
                <li data-project-detail-item key={item}>
                  <span className={styles.itemIndex} aria-hidden="true">
                    {String(itemIndex + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectResults({ project }: { project: Project }) {
  return (
    <section
      className={styles.editorialSection}
      aria-labelledby="project-results-title"
      data-project-results-section
    >
      <div className={styles.sectionGrid}>
        <div className={styles.stickyColumn}>
          <h2
            className={styles.sectionTitle}
            id="project-results-title"
            data-project-results-title
          >
            РЕЗУЛТАТИ
          </h2>
        </div>

        <div className={styles.resultsRail}>
          <p className={styles.railLabel}>РЕЗУЛТАТИ ОТ ПРОЕКТА</p>
          <ol className={styles.railList}>
            {project.detail.results.map((result, resultIndex) => (
              <li data-project-result key={result}>
                <span className={styles.itemIndex} aria-hidden="true">
                  {String(resultIndex + 1).padStart(2, "0")}
                </span>
                <span>{result}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function OtherProjects({ currentProject }: { currentProject: Project }) {
  const otherProjects = PROJECTS.filter(
    (project) => project.slug !== currentProject.slug,
  );

  return (
    <section
      className={styles.otherProjects}
      aria-labelledby="other-projects-title"
      data-other-projects
      data-cursor-theme="dark"
    >
      <h2 className={styles.otherProjectsTitle} id="other-projects-title">
        ДРУГИ
        <br />
        ПРОЕКТИ
      </h2>

      <div className={styles.otherProjectsList}>
        {otherProjects.map((project, index) => (
          <Link
            className={styles.otherProjectRow}
            href={`/projects/${project.slug}`}
            data-other-project
            key={project.slug}
          >
            <span className={styles.otherProjectIndex} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className={styles.otherProjectName} data-other-project-title>
              {project.detail.title}
            </span>
            <span className={styles.otherProjectDescription}>
              {project.detail.shortDescription}
            </span>
            <span className={styles.otherProjectMedia} data-other-project-media>
              <Image
                src={project.detail.media[0].src}
                alt=""
                fill
                sizes="(max-width: 768px) 36vw, 18vw"
                style={{ objectPosition: project.detail.media[0].objectPosition }}
              />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const [firstMedia, secondMedia, thirdMedia] = project.detail.media;
  const websiteIsExternal = project.detail.websiteUrl.startsWith("http");

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className={styles.page} id="top">
        <article>
          <header
            className={styles.hero}
            id="project-overview"
            aria-labelledby="project-title"
            data-project-hero
            data-cursor-theme="dark"
          >
            <div className={styles.heroGrid}>
              <div className={styles.heroIdentity}>
                <h1 id="project-title">
                  {project.detail.title.endsWith(".") ? (
                    <>
                      {project.detail.title.slice(0, -1)}
                      <span className={styles.titleAccent}>.</span>
                    </>
                  ) : (
                    project.detail.title
                  )}
                </h1>
                <p>{project.detail.shortDescription}</p>
              </div>

              <div className={styles.heroIntro}>
                {project.detail.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <PrimaryCTA
                className={styles.heroCta}
                href={project.detail.websiteUrl}
                target={websiteIsExternal ? "_blank" : undefined}
                rel={websiteIsExternal ? "noreferrer" : undefined}
                aria-label={
                  project.detail.websiteUrlIsTemporary
                    ? "Посети сайта — временна връзка към началото на проекта"
                    : `Посети сайта на ${project.detail.title}`
                }
              >
                ПОСЕТИ САЙТА
              </PrimaryCTA>
            </div>
          </header>

          <ProjectMedia media={firstMedia} index={1} eager />
          <ProjectOverview project={project} />
          <ProjectMedia media={secondMedia ?? firstMedia} index={2} />
          <ProjectResults project={project} />
          <ProjectMedia media={thirdMedia ?? secondMedia ?? firstMedia} index={3} />
          <OtherProjects currentProject={project} />
        </article>
      </main>
      <Footer />
    </>
  );
}
