import type { Metadata } from "next";
import { RoutePlaceholder } from "@/components/layout/RoutePlaceholder";

export const metadata: Metadata = {
  title: "За нас — COWEBORATE",
};

export default function AboutPage() {
  return <RoutePlaceholder title="За нас" />;
}
