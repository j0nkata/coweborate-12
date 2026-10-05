export type ExpertiseItem = {
  id: string;
  title: string;
  description: string;
};

export const EXPERTISE_ITEMS: readonly ExpertiseItem[] = [
  {
    id: "e-commerce",
    title: "E-COMMERCE",
    description:
      "WooCommerce, Shopify, продуктова логика, checkout и fulfillment.",
  },
  {
    id: "automations",
    title: "АВТОМАТИЗАЦИИ",
    description:
      "Поръчки, товарителници, наличности и автоматизирани бизнес процеси.",
  },
  {
    id: "ux-conversion",
    title: "UX & CONVERSION",
    description:
      "Информационна архитектура, потребителски потоци и conversion logic.",
  },
  {
    id: "integrations",
    title: "ИНТЕГРАЦИИ",
    description:
      "API, куриери, платежни системи и външни бизнес услуги.",
  },
  {
    id: "performance-reliability",
    title: "PERFORMANCE & RELIABILITY",
    description:
      "Скорост, стабилност, responsive поведение и техническа поддръжка.",
  },
] as const;
