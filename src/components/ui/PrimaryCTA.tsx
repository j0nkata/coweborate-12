import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./PrimaryCTA.module.css";

type PrimaryCTAProps = ComponentProps<typeof Link> & {
  variant?: "on-paper" | "on-blue";
};

export function PrimaryCTA({
  children,
  className = "",
  variant = "on-paper",
  ...props
}: PrimaryCTAProps) {
  return (
    <Link className={`${styles.cta} ${styles[variant]} ${className}`.trim()} {...props}>
      <span>{children}</span>
      <span className={styles.arrow} aria-hidden="true">→</span>
    </Link>
  );
}
