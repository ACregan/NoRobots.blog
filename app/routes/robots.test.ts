import { describe, it, expect } from "vitest";
import { loader } from "./robots";

function makeRequest(url = "https://norobots.blog/robots.txt") {
  return { request: new Request(url) };
}

describe("robots loader", () => {
  it("allows all crawlers", async () => {
    const response = await loader(makeRequest());
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Allow: /");
  });

  it("points to the sitemap anchored to the request's own origin", async () => {
    const response = await loader(makeRequest());
    const body = await response.text();
    expect(body).toContain("Sitemap: https://norobots.blog/sitemap.xml");
  });

  it("returns a plain text content type", async () => {
    const response = await loader(makeRequest());
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });
});
