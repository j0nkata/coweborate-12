export const NAV_ITEMS = [
  { label: "Работа", href: "/work" },
  { label: "Услуги", href: "/services" },
  { label: "За нас", href: "/about" },
  { label: "Контакт", href: "/contact" },
] as const;

export const PROJECT_INQUIRY_HREF = "/contact";

export const SERVICES = [
  {
    title: "Стратегия",
    description: "Ясна посока, цели и структура преди първия екран.",
  },
  {
    title: "Уеб дизайн",
    description: "Уникални интерфейси, подредени около съдържанието и хората.",
  },
  {
    title: "Разработка",
    description: "Бързи, стабилни сайтове с чиста и поддържаема основа.",
  },
  {
    title: "Поддръжка",
    description: "Грижа, подобрения и спокойствие след пускането.",
  },
] as const;

export const PROCESS_STEPS = [
  { number: "01", title: "Разговор", detail: "Опознаваме задачата." },
  { number: "02", title: "Посока", detail: "Подреждаме правилния подход." },
  { number: "03", title: "Изработка", detail: "Проектираме и разработваме." },
  { number: "04", title: "Пускане", detail: "Тестваме и предаваме." },
] as const;
