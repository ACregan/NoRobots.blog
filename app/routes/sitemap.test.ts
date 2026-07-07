import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchSite: vi.fn(), getSitemapEntries: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./sitemap";
import { fetchSite, getSitemapEntries } from "@scribe-atp/core";
import type { Site, SitemapEntry } from "@scribe-atp/core";

const mockSite: Site = {
  uri: "at://did/site.standard.publication/test",
  title: "Test Site",
  url: "test.example.com",
  urlPrefix: "",
  groups: [],
  ungroupedArticles: [],
};

beforeEach(() => {
  vi.mocked(fetchSite).mockResolvedValue(mockSite);
});

function makeRequest(url = "https://norobots.blog/sitemap.xml") {
  return { request: new Request(url) };
}

describe("sitemap loader", () => {
  it("fetches the configured site and requests entries anchored to the request's own origin", async () => {
    vi.mocked(getSitemapEntries).mockReturnValue([]);

    await loader(makeRequest());

    expect(fetchSite).toHaveBeenCalledWith(
      "test-author",
      "https://test.example.com",
      expect.any(AbortSignal),
    );
    expect(getSitemapEntries).toHaveBeenCalledWith(mockSite, { baseUrl: "https://norobots.blog" });
  });

  it("wraps entries in a valid urlset with each entry as a url element", async () => {
    const entries: SitemapEntry[] = [
      { url: "https://norobots.blog/" },
      { url: "https://norobots.blog/technology" },
    ];
    vi.mocked(getSitemapEntries).mockReturnValue(entries);

    const response = await loader(makeRequest());
    const xml = await response.text();

    expect(xml).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        "<url><loc>https://norobots.blog/</loc></url>" +
        "<url><loc>https://norobots.blog/technology</loc></url>" +
        "</urlset>",
    );
  });

  it("includes a lastmod element only for entries that have one", async () => {
    vi.mocked(getSitemapEntries).mockReturnValue([
      { url: "https://norobots.blog/with-date", lastmod: "2024-03-15" },
      { url: "https://norobots.blog/without-date" },
    ]);

    const response = await loader(makeRequest());
    const xml = await response.text();

    expect(xml).toContain(
      "<url><loc>https://norobots.blog/with-date</loc><lastmod>2024-03-15</lastmod></url>",
    );
    expect(xml).toContain("<url><loc>https://norobots.blog/without-date</loc></url>");
  });

  it("produces a well-formed empty urlset when there are no entries", async () => {
    vi.mocked(getSitemapEntries).mockReturnValue([]);

    const response = await loader(makeRequest());
    expect(await response.text()).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        "</urlset>",
    );
  });

  it("returns the XML with the correct content type", async () => {
    vi.mocked(getSitemapEntries).mockReturnValue([]);
    const response = await loader(makeRequest());
    expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
  });
});
