import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, fetchArticleBySlug: vi.fn(), fetchSite: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./post";
import { fetchArticleBySlug, fetchSite, PdsFetchError } from "@scribe-atp/core";
import type { Article, Site } from "@scribe-atp/core";

const mockArticle: Article = {
  title: "Hello World",
  content: "<h2>Hello</h2><p>Some content here.</p>",
  path: "/hello-world",
  site: "at://did:plc:test/site.standard.publication/test-slug",
  description: "A brief intro.",
  createdAt: "2024-03-15T12:00:00Z",
  publishedAt: "2024-03-15T12:00:00Z",
  updatedAt: "2024-03-15T12:00:00Z",
};

const documentUri = "at://did:plc:test/site.standard.document/3jxtctq7kqm2y";
const publicationUri = "at://did:plc:test/site.standard.publication/test";

const mockSite: Site = {
  uri: publicationUri,
  title: "Test Site",
  url: "test.example.com",
  urlPrefix: "",
  groups: [],
  ungroupedArticles: [],
};

const makeArgs = (articleSlug?: string) =>
  ({ request: new Request("https://example.com"), params: { articleSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchArticleBySlug).mockReset();
  vi.mocked(fetchSite).mockReset();
  vi.mocked(fetchArticleBySlug).mockResolvedValue({ article: mockArticle, uri: documentUri });
  vi.mocked(fetchSite).mockResolvedValue(mockSite);
});

describe("post loader", () => {
  it("fetches the article by slug and returns it with documentUri on the fast path", async () => {
    const result = await loader(makeArgs("hello-world"));

    expect(result.status).toBe("ok");
    if (result.status !== "ok") throw new Error("expected status ok");
    expect(result.data.article.title).toBe("Hello World");
    expect(result.data.article.content).toBe("<h2>Hello</h2><p>Some content here.</p>");
    expect(result.data.documentUri).toBe(documentUri);
    expect(result.data.publicationUri).toBe(publicationUri);
    expect(result.data.site).toBe(mockSite);
    expect(fetchArticleBySlug).toHaveBeenCalledWith(
      "test-author",
      "https://test.example.com",
      "hello-world",
      expect.any(AbortSignal),
    );
  });

  it("throws when articleSlug param is missing", async () => {
    await expect(loader(makeArgs())).rejects.toThrow("Missing route param: articleSlug");
  });

  it("returns status retrying when either fetch fails transiently, resolving once a retry succeeds", async () => {
    vi.mocked(fetchArticleBySlug)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce({ article: mockArticle, uri: documentUri });

    vi.useFakeTimers();
    try {
      const result = await loader(makeArgs("hello-world"));
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying"
          ? expect(result.data).resolves.toMatchObject({ documentUri, publicationUri })
          : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
