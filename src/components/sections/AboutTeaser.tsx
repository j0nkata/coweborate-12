import { AnimatedAboutWords } from "@/components/motion/AnimatedAboutWords";

export function AboutTeaser() {
  return (
    <section
      className="about-teaser"
      aria-labelledby="manifesto-title"
      data-cursor-theme="light"
      data-about-transition-root
    >
      <AnimatedAboutWords />
    </section>
  );
}
