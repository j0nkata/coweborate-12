import Image from "next/image";

type LogoProps = {
  variant?: "light" | "dark";
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "light",
  className = "",
  priority = false,
}: LogoProps) {
  const onDark = variant === "dark";

  return (
    <Image
      className={className}
      src={onDark ? "/logo-on-dark.svg" : "/logo-on-light.svg"}
      alt="COWEBORATE"
      width={onDark ? 729 : 807}
      height={onDark ? 113 : 110}
      priority={priority}
      unoptimized
    />
  );
}
