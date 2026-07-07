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
  it("fetches the configured site and generates a feed anchored to the request's own origin", async () => {
    await loader({ request: new Request("https://norobots.blog/feed.xml") });

    expect(fetchSite).toHaveBeenCalledWith(
      "test-author",
      "https://test.example.com",
      expect.any(AbortSignal),
    );
    expect(generateFeed).toHaveBeenCalledWith(mockSite, {
      baseUrl: "https://norobots.blog",
      feedUrl: "https://norobots.blog/feed.xml",
    });
  });

  it("derives baseUrl/feedUrl from whatever origin the request actually arrived on", async () => {
    await loader({ request: new Request("https://staging.norobots.blog/feed.xml") });

    expect(generateFeed).toHaveBeenCalledWith(mockSite, {
      baseUrl: "https://staging.norobots.blog",
      feedUrl: "https://staging.norobots.blog/feed.xml",
    });
  });

  it("returns the generated XML as the response body with an RSS content type", async () => {
    const response = await loader({ request: new Request("https://norobots.blog/feed.xml") });

    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
    await expect(response.text()).resolves.toBe("<rss>mock feed</rss>");
  });
});
