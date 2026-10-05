import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ScrollToTop } from "@/components/motion/ScrollToTop";
import { ServicesShowcase } from "@/components/sections/services/ServicesShowcase";

export const metadata: Metadata = {
  title: "Услуги — COWEBORATE",
  description: "Стратегия, уеб дизайн, разработка и развитие на дигитални продукти.",
};

export default function ServicesPage() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <ServicesShowcase />
      </main>
      <Footer />
    </>
  );
}
