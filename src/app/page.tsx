import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionController } from "@/components/motion/MotionController";
import { HomepageSectionTransitions } from "@/components/motion/HomepageSectionTransitions";
import { Contact } from "@/components/sections/Contact";
import { AboutTeaser } from "@/components/sections/AboutTeaser";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ServicesShowcase } from "@/components/sections/services/ServicesShowcase";
import { ExpertiseSection } from "@/components/sections/expertise/ExpertiseSection";
import { TestimonialsSection } from "@/components/sections/testimonials/TestimonialsSection";

export default function Home() {
  return (
    <>
      <MotionController />
      <HomepageSectionTransitions />
      <a className="skip-link" href="#main-content">
        Към основното съдържание
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <AboutTeaser />
        <SelectedWork />
        <ServicesShowcase />
        <TestimonialsSection />
        <ExpertiseSection />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
