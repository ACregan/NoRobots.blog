import { SITE_URL } from "~/config";

/**
 * `<link rel="canonical">` descriptor for a page's `meta()` export. Anchored
 * to `SITE_URL`, never `request.url`, so copies of the site served from other
 * hosts still point search engines at the canonical domain.
 *
 * @param path - the page's path, e.g. "/travel" ("/" for the home page)
 */
export const canonicalLink = (path: string) => ({
  tagName: "link" as const,
  rel: "canonical",
  href: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
});
