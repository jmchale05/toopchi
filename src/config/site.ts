export const SITE_NAME = "Toopchi";

/** Set VITE_SITE_URL in production to your live domain (no trailing slash). */
export const SITE_URL =
  import.meta.env.VITE_SITE_URL?.replace(/\/$/, "") ?? "https://toopchi.com";

export const SITE_DESCRIPTION =
  "Free pass-and-play football quiz. Guess real match lineups or name top-10 lists with friends on one phone.";

export const SITE_OG_IMAGE = `${SITE_URL}/favicon.svg`;
