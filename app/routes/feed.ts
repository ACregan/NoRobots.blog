import { fetchSite, generateFeed } from "@scribe-atp/core";
import { SITE_AUTHOR, SITE_URL } from "~/config";

export async function loader({ request }: { request: Request }) {
  const origin = new URL(request.url).origin;
  const site = await fetchSite(SITE_AUTHOR, SITE_URL, request.signal);
  const xml = generateFeed(site, {
    baseUrl: origin,
    feedUrl: `${origin}/feed.xml`,
  });
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
