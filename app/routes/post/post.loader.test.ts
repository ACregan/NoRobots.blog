import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchArticleBySlug: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_SLUG: "test-slug" }));

import { loader } from "./post";
import { fetchArticleBySlug } from "@scribe-atp/core";
import type { Article } from "@scribe-atp/core";

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

const makeArgs = (articleSlug?: string) =>
  ({ request: new Request("https://example.com"), params: { articleSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchArticleBySlug).mockResolvedValue({ article: mockArticle, uri: documentUri });
});

describe("post loader", () => {
  it("fetches the article by slug and returns it with documentUri", async () => {
    const result = await loader(makeArgs("hello-world"));

    expect(result.title).toBe("Hello World");
    expect(result.content).toBe("<h2>Hello</h2><p>Some content here.</p>");
    expect(result.documentUri).toBe(documentUri);
    expect(fetchArticleBySlug).toHaveBeenCalledWith(
      "test-author",
      "test-slug",
      "hello-world",
      expect.any(AbortSignal),
    );
  });

  it("throws when articleSlug param is missing", async () => {
    await expect(loader(makeArgs())).rejects.toThrow("Missing route param: articleSlug");
  });
});
