import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { NAV_ITEMS } from "@/lib/constants";
import styles from "./Footer.module.css";

const FOOTER_NAV_ITEMS = [
  { label: "Начало", href: "/" },
  ...NAV_ITEMS,
] as const;

const SOCIAL_LABELS = ["Instagram", "Facebook", "X", "LinkedIn"] as const;

export function Footer() {
  return (
    <footer
      className={styles.footer}
      data-footer
      data-cursor-theme="dark"
    >
      <Container className={styles.viewportInner}>
        <div className={styles.content}>
          <div className={styles.columns}>
            <nav
              className={styles.column}
              aria-labelledby="footer-navigation-label"
            >
              <p className={styles.label} id="footer-navigation-label">
                Навигация
              </p>
              <ul className={styles.list}>
                {FOOTER_NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link className={styles.link} href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <section
              className={styles.column}
              aria-labelledby="footer-social-label"
            >
              <p className={styles.label} id="footer-social-label">
                Социални мрежи
              </p>
              <ul className={`${styles.list} ${styles.socialList}`}>
                {SOCIAL_LABELS.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </section>

            <section
              className={styles.column}
              aria-labelledby="footer-contact-label"
            >
              <p className={styles.label} id="footer-contact-label">
                Контакти
              </p>
              <div className={styles.contactValues}>
                <Link className={styles.link} href="/contact">
                  Контактна форма
                </Link>
                <p>Ямбол, България</p>
              </div>
            </section>
          </div>

          <Link
            className={styles.svgWordmark}
            href="/"
            aria-label="Coweborate — начало"
          >
            <Image
              className={styles.svgWordmarkImage}
              src="/logo-on-dark.svg"
              alt="Coweborate"
              width={729}
              height={113}
              unoptimized
            />
          </Link>
        </div>
      </Container>
    </footer>
  );
}
