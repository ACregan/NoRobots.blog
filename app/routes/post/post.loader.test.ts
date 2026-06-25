import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchArticle: vi.fn(), resolveDocumentUri: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_SLUG: "test-slug" }));

import { loader } from "./post";
import { fetchArticle, resolveDocumentUri } from "@scribe-atp/core";
import type { Article } from "@scribe-atp/core";

const mockArticle: Article = {
  title: "Hello World",
  content: "<h2>Hello</h2><p>Some content here.</p>",
  path: "/hello-world",
  site: "https://norobots.blog",
  description: "A brief intro.",
  createdAt: "2024-03-15T12:00:00Z",
  publishedAt: "2024-03-15T12:00:00Z",
  updatedAt: "2024-03-15T12:00:00Z",
};

const makeArgs = (articleSlug?: string) =>
  ({ request: new Request("https://example.com"), params: { articleSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchArticle).mockResolvedValue(mockArticle);
  vi.mocked(resolveDocumentUri).mockResolvedValue("at://did:plc:test/site.standard.document/hello-world");
});

describe("post loader", () => {
  it("fetches the article by slug and returns it", async () => {
    const result = await loader(makeArgs("hello-world"));

    expect(result.title).toBe("Hello World");
    expect(result.content).toBe("<h2>Hello</h2><p>Some content here.</p>");
    expect(fetchArticle).toHaveBeenCalledWith(
      "test-author",
      "hello-world",
      expect.any(AbortSignal),
    );
  });

  it("throws when articleSlug param is missing", async () => {
    await expect(loader(makeArgs())).rejects.toThrow("Missing route param: articleSlug");
  });
});
