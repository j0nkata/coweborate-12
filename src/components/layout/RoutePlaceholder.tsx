import { Container } from "@/components/layout/Container";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type RoutePlaceholderProps = {
  title: string;
};

export function RoutePlaceholder({ title }: RoutePlaceholderProps) {
  return (
    <>
      <Header />
      <main className="route-placeholder" id="top" data-cursor-theme="light">
        <Container className="route-placeholder-inner">
          <p>Страницата се разработва</p>
          <h1>{title}</h1>
        </Container>
      </main>
      <Footer />
    </>
  );
}
