import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchSite: vi.fn(), generateFeed: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./feed";
import { fetchSite, generateFeed } from "@scribe-atp/core";
import type { Site } from "@scribe-atp/core";

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
  vi.mocked(generateFeed).mockReturnValue("<rss>mock feed</rss>");
});

describe("feed loader", () => {
  it("fetches the configured site and generates a feed anchored to the site's configured URL", async () => {
    await loader({ request: new Request("https://norobots.blog/feed.xml") });

    expect(fetchSite).toHaveBeenCalledWith(
      "test-author",
      "https://test.example.com",
      expect.any(AbortSignal),
    );
    expect(generateFeed).toHaveBeenCalledWith(mockSite, {
      baseUrl: "https://test.example.com",
      feedUrl: "https://test.example.com/feed.xml",
    });
  });

  it("anchors baseUrl/feedUrl to SITE_URL regardless of what origin the request actually arrived on", async () => {
    // Behind a reverse proxy that terminates TLS, request.url can report the
    // wrong scheme/host (e.g. http://internal-host) even though the site is
    // only ever served publicly at SITE_URL. baseUrl/feedUrl must not be
    // derived from the request.
    await loader({ request: new Request("http://staging.norobots.blog/feed.xml") });

    expect(generateFeed).toHaveBeenCalledWith(mockSite, {
      baseUrl: "https://test.example.com",
      feedUrl: "https://test.example.com/feed.xml",
    });
  });

  it("returns the generated XML as the response body with an RSS content type", async () => {
    const response = await loader({ request: new Request("https://norobots.blog/feed.xml") });

    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
    await expect(response.text()).resolves.toBe("<rss>mock feed</rss>");
  });
});
