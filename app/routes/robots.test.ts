import { describe, it, expect } from "vitest";
import { loader } from "./robots";

describe("robots loader", () => {
  it("allows all crawlers", async () => {
    const response = await loader();
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
  });

  it("points to the sitemap at the site's configured https origin, regardless of how the request arrived", async () => {
    const response = await loader();
    const body = await response.text();
    expect(body).toContain("Sitemap: https://norobots.blog/sitemap.xml");
  });

  it("returns a plain text content type", async () => {
    const response = await loader();
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });
});
