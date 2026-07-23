import { SITE_URL } from "~/config";

export async function loader() {
  const body = ["User-agent: *", "Allow: /", "", `Sitemap: ${SITE_URL}/sitemap.xml`].join(
    "\n",
  );
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
