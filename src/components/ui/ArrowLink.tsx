import type { AnchorHTMLAttributes, ReactNode } from "react";

type ArrowLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  tone?: "light" | "dark";
  variant?: "solid" | "text";
};

export function ArrowLink({
  children,
  className = "",
  tone = "light",
  variant = "solid",
  ...props
}: ArrowLinkProps) {
  return (
    <a
      className={`arrow-link arrow-link--${tone} arrow-link--${variant} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      <span className="arrow-link-icon" aria-hidden="true">
        <i />
      </span>
    </a>
  );
}
