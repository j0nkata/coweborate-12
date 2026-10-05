import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COWEBORATE — Уеб дизайн и разработка",
  description:
    "Независимо дигитално студио за стратегия, уеб дизайн и разработка в Ямбол, България.",
  applicationName: "COWEBORATE",
  keywords: [
    "уеб дизайн",
    "уеб разработка",
    "изработка на сайтове",
    "дигитално студио",
    "Ямбол",
  ],
  openGraph: {
    title: "COWEBORATE — Уеб дизайн и разработка",
    description: "Стратегия, дизайн и разработка в една ясна система.",
    locale: "bg_BG",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#F2F0E9",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
