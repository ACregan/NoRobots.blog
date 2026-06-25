import { fetchSite, getSitemapEntries } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";

export async function loader({ request }: { request: Request }) {
  const origin = new URL(request.url).origin;
  const site = await fetchSite(SITE_AUTHOR, SITE_URL, request.signal);
  const entries = getSitemapEntries(site, { baseUrl: origin });
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) =>
        `<url><loc>${e.url}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`,
    ),
    "</urlset>",
  ].join("");
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
