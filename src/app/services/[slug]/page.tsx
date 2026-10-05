import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/motion/ScrollToTop";
import { getServiceBySlug, SERVICES } from "@/components/sections/services/servicesData";
import { PrimaryCTA } from "@/components/ui/PrimaryCTA";
import styles from "./ServiceDetail.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) return {};

  return {
    title: `${service.title} — COWEBORATE`,
    description: service.shortDescription,
  };
}

export default async function ServicePage({
  params,
}: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) notFound();

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className={styles.page} id="top">
        <section className={styles.hero} aria-labelledby="service-title" data-cursor-theme="dark">
          <div className={styles.container}>
            <Link className={styles.back} href="/services">
              <span aria-hidden="true">←</span> ВСИЧКИ УСЛУГИ
            </Link>
            <p className={styles.label}>УСЛУГА</p>
            <h1 id="service-title">{service.title}</h1>
            <p className={styles.intro}>{service.shortDescription}</p>
          </div>
        </section>

        <section className={styles.content} aria-label="Повече за услугата" data-cursor-theme="light">
          <div className={`${styles.container} ${styles.contentGrid}`}>
            <h2>ПОДХОД</h2>
            <div className={styles.copy}>
              {service.content.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <PrimaryCTA className={styles.cta} href="/contact" variant="on-paper">
                ОБСЪДИ ПРОЕКТ
              </PrimaryCTA>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
