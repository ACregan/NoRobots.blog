import { fetchSite, generateSitemap } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_SLUG } from "~/config";

export async function loader({ request }: { request: Request }) {
  const origin = new URL(request.url).origin;
  const site = await fetchSite(SITE_AUTHOR, SITE_SLUG, request.signal);
  const xml = generateSitemap(site, { baseUrl: origin });
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
