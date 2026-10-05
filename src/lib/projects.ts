import type { CSSProperties } from "react";

export type ProjectTheme = "blue" | "paper" | "black";
export type ProjectGalleryLayout = "full" | "half";

export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  objectPosition?: string;
};

export type ProjectGalleryItem = ProjectImage & {
  layout: ProjectGalleryLayout;
};

export type ProjectDetailMedia = ProjectImage & {
  isFallback?: boolean;
};

export type ProjectDetail = {
  title: string;
  shortDescription: string;
  intro: readonly string[];
  websiteUrl: string;
  websiteUrlIsTemporary?: boolean;
  media: readonly ProjectDetailMedia[];
  platform: string;
  scope: readonly string[];
  results: readonly string[];
};

export type CaseStudyEntry = {
  title: string;
  text: string;
};

export type CaseStudyResult = CaseStudyEntry & {
  metric?: string;
  metricLabel?: string;
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  capabilities: string[];
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  theme: ProjectTheme;
  stageBackground: "#0000EE" | "var(--paper)" | "#101010";
  desktopImageScale: number;
  mobileImageScale: number;
  desktopPadding: string;
  mobilePadding: string;
  objectPosition: string;
  introduction: string;
  year?: string;
  status?: string;
  recognition?: readonly string[];
  url?: string;
  detail: ProjectDetail;
  caseStudy: {
    heading: string;
    context: string[];
    goals: CaseStudyEntry[];
    goalsImage?: ProjectImage;
    solution: CaseStudyEntry[];
    solutionImage?: ProjectImage;
    results: CaseStudyResult[];
  };
  gallery: ProjectGalleryItem[];
};

// Temporary demo contributions, inferred from the existing category/copy.
// Edit these centrally when the final project scope is available.
const TEMPORARY_PROJECT_CAPABILITIES = {
  "project-one": [
    "E-commerce структура",
    "UX/UI дизайн",
    "Front-end разработка",
  ],
  "project-two": ["Мобилен UX/UI дизайн", "Интерактивен прототип"],
  "project-three": [
    "Бранд идентичност",
    "Уеб дизайн",
    "Front-end разработка",
  ],
} satisfies Record<string, string[]>;

const PROJECT_VISUALS = {
  abBagsStorefront: {
    src: "/project-section-current.png",
    width: 1514,
    height: 723,
    alt: "Начална страница на онлайн магазина A&BBAGS с представяне на чанти и аксесоари.",
    objectPosition: "50% 50%",
  },
  silhouetteTablet: {
    src: "/project-mockup-1.png",
    width: 736,
    height: 479,
    alt: "Интерфейс Silhouette Mockups върху таблет на наситен син фон.",
    objectPosition: "50% 50%",
  },
  silhouetteMobile: {
    src: "/project-mockup-2.png",
    width: 1199,
    height: 781,
    alt: "Мобилен интерфейс Silhouette Mockups върху телефон на син фон.",
    objectPosition: "50% 50%",
  },
  gogoLaptop: {
    src: "/project-mockup-3.png",
    width: 735,
    height: 919,
    alt: "Бранд концепцията Gogo върху екран на лаптоп.",
    objectPosition: "50% 50%",
  },
} satisfies Record<string, ProjectImage>;

// Temporary demo case-study copy, limited to what the current project visuals
// and existing descriptions support. Replace centrally when final facts arrive.
const TEMPORARY_CASE_STUDIES = {
  "project-one": {
    goals: [
      {
        title: "Ясна продуктова структура",
        text: "Съдържанието и основните действия трябваше да се разбират бързо, без интерфейсът да натрупва излишна сложност.",
      },
      {
        title: "Последователно изживяване",
        text: "Визуалният ритъм трябваше да остане устойчив между различните продуктови и търговски моменти.",
      },
    ],
    solution: [
      {
        title: "E-commerce архитектура",
        text: "Организирахме продуктово съдържание и ключови действия в ясна йерархия, която подпомага ориентацията.",
      },
      {
        title: "Обща дизайн и development система",
        text: "UX/UI решенията и front-end основата бяха развити с едни и същи правила за типография, ритъм и поведение.",
      },
    ],
    results: [
      {
        title: "По-ясна основа",
        text: "Проектът има последователна структура, върху която съдържанието и функционалностите могат да се развиват.",
      },
      {
        title: "Единен продуктов език",
        text: "Търговската логика и визуалната система работят като едно цяло вместо като отделни слоеве.",
      },
    ],
  },
  "project-two": {
    goals: [
      {
        title: "Фокус върху малкия екран",
        text: "Продуктовото съдържание трябваше да остане четимо и лесно за използване при ограничено пространство.",
      },
      {
        title: "По-кратък път до действие",
        text: "Основните взаимодействия трябваше да бъдат директни и разбираеми още при първото използване.",
      },
    ],
    solution: [
      {
        title: "Мобилна UX/UI структура",
        text: "Подредихме съдържанието около ясни приоритети, четима типография и последователни действия между екраните.",
      },
      {
        title: "Интерактивен прототип",
        text: "Свързахме ключовите продуктови моменти в прототип, който позволява логиката и ритъмът да бъдат проверени като цялостно изживяване.",
      },
    ],
    results: [
      {
        title: "По-разбираем мобилен поток",
        text: "Съдържанието и действията следват ясна последователност без ненужни отклонения.",
      },
      {
        title: "Готова посока за развитие",
        text: "Прототипът създава обща основа за следващи продуктови решения и реализация.",
      },
    ],
  },
  "project-three": {
    goals: [
      {
        title: "Разпознаваем характер",
        text: "Брандът трябваше да има собствено присъствие, без това да намалява яснотата на дигиталното изживяване.",
      },
      {
        title: "Единство между бранд и интерфейс",
        text: "Идентичността и уеб посоката трябваше да бъдат изградени като една система, а не като отделни задачи.",
      },
    ],
    solution: [
      {
        title: "Визуален език",
        text: "Развихме ясни правила за типография, мащаб и композиция, които носят характера на бранда в дигитална среда.",
      },
      {
        title: "Уеб дизайн и front-end основа",
        text: "Пренесохме системата в интерфейс с директна навигация, четимо съдържание и последователно поведение.",
      },
    ],
    results: [
      {
        title: "Последователно присъствие",
        text: "Брандът и интерфейсът използват общ визуален ритъм и се възприемат като едно цяло.",
      },
      {
        title: "Система вместо единичен екран",
        text: "Посоката задава правила, които могат да бъдат прилагани при следващо развитие на проекта.",
      },
    ],
  },
} satisfies Record<
  string,
  {
    goals: CaseStudyEntry[];
    solution: CaseStudyEntry[];
    results: CaseStudyResult[];
  }
>;

// The repository currently contains one visual per demo project. Gallery entries
// intentionally reuse only that project's asset until final case media arrives.
export const PROJECTS = [
  {
    slug: "project-one",
    name: "PROJECT ONE",
    category: "E-COMMERCE / WEB DEVELOPMENT",
    tagline: "Концепция за онлайн платформа за mockup ресурси.",
    capabilities: TEMPORARY_PROJECT_CAPABILITIES["project-one"],
    image: PROJECT_VISUALS.silhouetteTablet.src,
    imageWidth: PROJECT_VISUALS.silhouetteTablet.width,
    imageHeight: PROJECT_VISUALS.silhouetteTablet.height,
    imageAlt: PROJECT_VISUALS.silhouetteTablet.alt,
    theme: "black",
    stageBackground: "#101010",
    desktopImageScale: 0.96,
    mobileImageScale: 0.98,
    desktopPadding: "3%",
    mobilePadding: "2%",
    objectPosition: "50% 50%",
    introduction:
      "Временен преглед на дигитален продукт, представен чрез ясна търговска структура и прецизна разработка.",
    detail: {
      title: "A&BBAGS.",
      shortDescription: "E-commerce уебсайт за чанти и дамски аксесоари",
      intro: [
        "A&BBAGS е лидер в търговията с оригинални маратонки и един от най-популярните онлайн магазини в България.",
        "История на успеха, която започна скромно и се превърна в дигитален феномен благодарение на ясна визия, постоянство и партньорство, основано на взаимно доверие и непрекъснато развитие.",
      ],
      websiteUrl: "#project-overview",
      websiteUrlIsTemporary: true,
      media: [
        PROJECT_VISUALS.abBagsStorefront,
        { ...PROJECT_VISUALS.abBagsStorefront, isFallback: true },
        { ...PROJECT_VISUALS.abBagsStorefront, isFallback: true },
      ],
      platform: "Shopify",
      scope: [
        "UI/UX Дизайн",
        "Разработка",
        "Автоматизация на процеси",
        "Интеграции с външни API",
        "AI интеграции",
        "Интеграции с куриерски фирми",
        "Поддръжка и развитие",
      ],
      results: [
        "Подобрено потребителско изживяване",
        "Оптимизирани бизнес процеси",
        "Автоматизация на оперативни задачи",
        "По-добра mobile структура",
        "По-лесно управление на съдържание и продукти",
        "Интегрирана инфраструктура",
      ],
    },
    caseStudy: {
      heading: "ЗА ПРОЕКТА",
      context: [
        "Проектът организира дигитално продуктово съдържание в ясна търговска структура. Изградихме интерфейс, който извежда основните действия и улеснява ориентацията между съдържанието. UX/UI дизайнът и разработката са мислени като една система, а не като отделни етапи. Основният фокус е стабилна основа, която може да се развива последователно.",
      ],
      goals: TEMPORARY_CASE_STUDIES["project-one"].goals,
      goalsImage: PROJECT_VISUALS.silhouetteTablet,
      solution: TEMPORARY_CASE_STUDIES["project-one"].solution,
      results: TEMPORARY_CASE_STUDIES["project-one"].results,
    },
    gallery: [
      {
        ...PROJECT_VISUALS.silhouetteTablet,
        layout: "full",
      },
    ],
  },
  {
    slug: "project-two",
    name: "PROJECT TWO",
    category: "MOBILE DIGITAL PRODUCT / UX/UI",
    tagline: "Мобилна продуктова концепция за бърз достъп до mockup ресурси.",
    capabilities: TEMPORARY_PROJECT_CAPABILITIES["project-two"],
    image: PROJECT_VISUALS.silhouetteMobile.src,
    imageWidth: PROJECT_VISUALS.silhouetteMobile.width,
    imageHeight: PROJECT_VISUALS.silhouetteMobile.height,
    imageAlt: PROJECT_VISUALS.silhouetteMobile.alt,
    theme: "paper",
    stageBackground: "var(--paper)",
    desktopImageScale: 1.1,
    mobileImageScale: 1.14,
    desktopPadding: "2%",
    mobilePadding: "1%",
    objectPosition: "50% 50%",
    introduction:
      "Временен преглед на дигитален продукт с концентрирано мобилно изживяване и ясна визуална логика.",
    detail: {
      title: "PROJECT TWO",
      shortDescription: "Мобилна продуктова концепция за mockup ресурси",
      intro: [
        "Временен преглед на дигитален продукт с концентрирано мобилно изживяване и ясна визуална логика.",
        "Съдържанието е структурирано като гъвкава отправна точка за бъдещо развитие на казуса.",
      ],
      websiteUrl: "#project-overview",
      websiteUrlIsTemporary: true,
      media: [
        PROJECT_VISUALS.silhouetteMobile,
        { ...PROJECT_VISUALS.silhouetteMobile, isFallback: true },
        { ...PROJECT_VISUALS.silhouetteMobile, isFallback: true },
      ],
      platform: "Mobile product",
      scope: TEMPORARY_PROJECT_CAPABILITIES["project-two"],
      results: TEMPORARY_CASE_STUDIES["project-two"].results.map(
        (result) => result.title,
      ),
    },
    caseStudy: {
      heading: "ЗА ПРОЕКТА",
      context: [
        "Проектът пренася продуктово съдържание в концентрирано мобилно изживяване. Структурирахме интерфейса около четима типография, директни действия и ясна последователност между екраните. Интерактивният прототип проверява как съдържанието остава разбираемо при кратко взаимодействие и ограничено пространство. Решението е замислено като последователна система, която може да се развива с продукта.",
      ],
      goals: TEMPORARY_CASE_STUDIES["project-two"].goals,
      goalsImage: PROJECT_VISUALS.silhouetteTablet,
      solution: TEMPORARY_CASE_STUDIES["project-two"].solution,
      solutionImage: PROJECT_VISUALS.silhouetteMobile,
      results: TEMPORARY_CASE_STUDIES["project-two"].results,
    },
    gallery: [
      {
        ...PROJECT_VISUALS.silhouetteTablet,
        layout: "full",
      },
      {
        ...PROJECT_VISUALS.silhouetteMobile,
        layout: "full",
      },
    ],
  },
  {
    slug: "project-three",
    name: "PROJECT THREE",
    category: "BRAND IDENTITY / WEB DESIGN",
    tagline: "Бранд концепция, пренесена в последователно дигитално присъствие.",
    capabilities: TEMPORARY_PROJECT_CAPABILITIES["project-three"],
    image: PROJECT_VISUALS.gogoLaptop.src,
    imageWidth: PROJECT_VISUALS.gogoLaptop.width,
    imageHeight: PROJECT_VISUALS.gogoLaptop.height,
    imageAlt: PROJECT_VISUALS.gogoLaptop.alt,
    theme: "blue",
    stageBackground: "#0000EE",
    desktopImageScale: 0.96,
    mobileImageScale: 0.96,
    desktopPadding: "3%",
    mobilePadding: "2%",
    objectPosition: "50% 50%",
    introduction:
      "Временен преглед на бранд система, пренесена в уверено и последователно уеб присъствие.",
    detail: {
      title: "PROJECT THREE",
      shortDescription: "Бранд идентичност и последователно дигитално присъствие",
      intro: [
        "Временен преглед на бранд система, пренесена в уверено и последователно уеб присъствие.",
        "Тази структура запазва общия ритъм на казуса, докато бъде добавено окончателното проектно съдържание.",
      ],
      websiteUrl: "#project-overview",
      websiteUrlIsTemporary: true,
      media: [
        PROJECT_VISUALS.gogoLaptop,
        { ...PROJECT_VISUALS.gogoLaptop, isFallback: true },
        { ...PROJECT_VISUALS.gogoLaptop, isFallback: true },
      ],
      platform: "Web",
      scope: TEMPORARY_PROJECT_CAPABILITIES["project-three"],
      results: TEMPORARY_CASE_STUDIES["project-three"].results.map(
        (result) => result.title,
      ),
    },
    caseStudy: {
      heading: "ЗА ПРОЕКТА",
      context: [
        "Проектът развива разпознаваем бранд характер и го пренася в дигитална среда. Изградихме визуален език, уеб дизайн и front-end основа с общ ритъм и ясни правила. Системата балансира силно присъствие с четимост и директна навигация. Важното в решението е идентичността и интерфейсът да работят като едно цяло.",
      ],
      goals: TEMPORARY_CASE_STUDIES["project-three"].goals,
      solution: TEMPORARY_CASE_STUDIES["project-three"].solution,
      solutionImage: PROJECT_VISUALS.gogoLaptop,
      results: TEMPORARY_CASE_STUDIES["project-three"].results,
    },
    gallery: [
      {
        ...PROJECT_VISUALS.gogoLaptop,
        layout: "full",
      },
    ],
  },
] as const satisfies readonly Project[];

export type ProjectSlug = (typeof PROJECTS)[number]["slug"];

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug);
}

export function getNextProject(slug: string): Project {
  const currentIndex = PROJECTS.findIndex((project) => project.slug === slug);
  return PROJECTS[(currentIndex + 1) % PROJECTS.length];
}

export type ProjectVisualStyle = CSSProperties & {
  "--project-stage-background": string;
  "--project-image-scale-desktop": number;
  "--project-image-scale-mobile": number;
  "--project-image-padding-desktop": string;
  "--project-image-padding-mobile": string;
  "--project-image-position": string;
};

export function getProjectVisualStyle(project: Project): ProjectVisualStyle {
  return {
    "--project-stage-background": project.stageBackground,
    "--project-image-scale-desktop": project.desktopImageScale,
    "--project-image-scale-mobile": project.mobileImageScale,
    "--project-image-padding-desktop": project.desktopPadding,
    "--project-image-padding-mobile": project.mobilePadding,
    "--project-image-position": project.objectPosition,
  };
}
