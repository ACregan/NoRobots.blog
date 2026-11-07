import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@skyscribe-sdk/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@skyscribe-sdk/core")>();
  return { ...actual, fetchDocumentBySlug: vi.fn(), fetchPublication: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./post";
import { fetchDocumentBySlug, fetchPublication, PdsFetchError, NotFoundError } from "@skyscribe-sdk/core";
import type { StandardDocument, StandardPublication } from "@skyscribe-sdk/core";

const mockArticle: StandardDocument = {
  uri: "at://did:plc:test/site.standard.document/3jxtctq7kqm2y",
  title: "Hello World",
  content: "<h2>Hello</h2><p>Some content here.</p>",
  path: "/hello-world",
  site: "at://did:plc:test/site.standard.publication/test-slug",
  description: "A brief intro.",
  createdAt: "2024-03-15T12:00:00Z",
  publishedAt: "2024-03-15T12:00:00Z",
  updatedAt: "2024-03-15T12:00:00Z",
};

const documentUri = mockArticle.uri;
const publicationUri = "at://did:plc:test/site.standard.publication/test";

const mockSite: StandardPublication = {
  uri: publicationUri,
  name: "Test Site",
  domain: "test.example.com",
  basePath: "",
  categories: [],
};

const makeArgs = (articleSlug?: string) =>
  ({ request: new Request("https://example.com"), params: { articleSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchDocumentBySlug).mockReset();
  vi.mocked(fetchPublication).mockReset();
  vi.mocked(fetchDocumentBySlug).mockResolvedValue(mockArticle);
  vi.mocked(fetchPublication).mockResolvedValue(mockSite);
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
    expect(fetchDocumentBySlug).toHaveBeenCalledWith(
      "test-author",
      "https://test.example.com",
      "hello-world",
      expect.any(AbortSignal),
    );
  });

  it("throws when articleSlug param is missing", async () => {
    await expect(loader(makeArgs())).rejects.toThrow("Missing route param: articleSlug");
  });

  it("throws a 404 Response when the article slug does not exist", async () => {
    vi.mocked(fetchDocumentBySlug).mockRejectedValue(
      new NotFoundError("Article not found: nonexistent"),
    );

    let thrown: unknown;
    try {
      await loader(makeArgs("nonexistent"));
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });

  it("returns status retrying when either fetch fails transiently, resolving once a retry succeeds", async () => {
    vi.mocked(fetchDocumentBySlug)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce(mockArticle);

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
