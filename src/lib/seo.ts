import { SITE_NAME, SITE_OG_IMAGE, SITE_URL } from "../config/site";

export type PageSeo = {
  title: string;
  description: string;
  /** When false, adds noindex,nofollow. Defaults to true. */
  index?: boolean;
};

const DEFAULT_SEO: PageSeo = {
  title: `${SITE_NAME} — Free Football Quiz Game`,
  description:
    "Pass-and-play football quiz. Guess iconic match lineups or top-10 lists with friends — free, no download.",
};

export const ROUTE_SEO: Record<string, PageSeo> = {
  "/": {
    title: `${SITE_NAME} — Free Football Quiz Game`,
    description:
      "Pass-and-play football quiz for friends. Guess the XI from real matches or play Top Order ranked lists. Free, mobile-friendly, no download.",
  },
  "/start": {
    title: `Start a Game — ${SITE_NAME}`,
    description:
      "Choose Guess the XI or Top Order and start a local football quiz with 2–10 players on one device.",
  },
  "/how-to-play": {
    title: `How to Play — ${SITE_NAME}`,
    description:
      "Learn how to play Toopchi: take turns guessing starters, score +100 per correct answer, and win the football quiz.",
  },
  "/setup": {
    title: `Guess the XI Setup — ${SITE_NAME}`,
    description:
      "Set up a Guess the XI game. Add player names, pick an iconic match, and guess who started.",
  },
  "/tenable/setup": {
    title: `Top Order Setup — ${SITE_NAME}`,
    description:
      "Set up Top Order — name entries from ranked football lists like Ballon d'Or, Premier League scorers, and more.",
  },
  "/premium": {
    title: `Create a Room — ${SITE_NAME}`,
    description:
      "Create a private Toopchi room to play the football quiz online with friends.",
  },
  "/create-account": {
    title: `Create Account — ${SITE_NAME}`,
    description: `Create a ${SITE_NAME} account to save progress and unlock online play.`,
    index: false,
  },
  "/game": {
    title: `Guess the XI — ${SITE_NAME}`,
    description: "Guess players from a real football match lineup.",
    index: false,
  },
  "/results": {
    title: `Results — ${SITE_NAME}`,
    description: "Final scores for your Guess the XI game.",
    index: false,
  },
  "/tenable/game": {
    title: `Top Order — ${SITE_NAME}`,
    description: "Name players on a ranked football top-10 list.",
    index: false,
  },
  "/tenable/results": {
    title: `Top Order Results — ${SITE_NAME}`,
    description: "Final scores for your Top Order game.",
    index: false,
  },
};

/** Paths included in sitemap.xml */
export const SITEMAP_PATHS = [
  "/",
  "/start",
  "/how-to-play",
  "/setup",
  "/tenable/setup",
  "/premium",
] as const;

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector('link[rel="canonical"]');

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

export function getSeoForPath(pathname: string): PageSeo {
  return ROUTE_SEO[pathname] ?? DEFAULT_SEO;
}

export function applyPageMeta(pathname: string) {
  const seo = getSeoForPath(pathname);
  const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;
  const shouldIndex = seo.index !== false;

  document.title = seo.title;
  upsertMeta("name", "description", seo.description);
  upsertMeta(
    "name",
    "robots",
    shouldIndex ? "index, follow" : "noindex, nofollow",
  );

  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", seo.title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", canonicalUrl);
  upsertMeta("property", "og:image", SITE_OG_IMAGE);

  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", seo.title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertMeta("name", "twitter:image", SITE_OG_IMAGE);

  if (shouldIndex) {
    upsertCanonical(canonicalUrl);
  } else {
    document.head.querySelector('link[rel="canonical"]')?.remove();
  }
}
