import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, fetchSite: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./tag";
import { fetchSite } from "@scribe-atp/core";
import { PdsFetchError } from "@scribe-atp/core";
import type { Site } from "@scribe-atp/core";

const mockSite: Site = {
  uri: "at://did/site.standard.publication/test",
  title: "Test Site",
  url: "test.example.com",
  urlPrefix: "",
  groups: [
    {
      slug: "technology",
      title: "Technology",
      articles: [
        {
          uri: "at://did/site.standard.document/post-1",
          title: "Tagged in tech",
          splashImageUrl: null,
          createdAt: "2024-01-01T00:00:00Z",
          tags: ["ai", "web"],
        },
        {
          uri: "at://did/site.standard.document/post-2",
          title: "Untagged tech post",
          splashImageUrl: null,
          createdAt: "2024-01-02T00:00:00Z",
        },
      ],
    },
    {
      slug: "travel",
      title: "Travel",
      articles: [
        {
          uri: "at://did/site.standard.document/post-3",
          title: "Tagged in travel",
          splashImageUrl: null,
          createdAt: "2024-01-03T00:00:00Z",
          tags: ["ai"],
        },
      ],
    },
  ],
  ungroupedArticles: [],
};

const makeArgs = (tag: string) =>
  ({ request: new Request("https://example.com"), params: { tag } }) as never;

beforeEach(() => {
  vi.mocked(fetchSite).mockReset();
});

describe("tag loader", () => {
  it("returns every article across every group tagged with the given tag", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    const result = await loader(makeArgs("ai"));

    expect(result.status).toBe("ok");
    expect(result.status === "ok" && result.data).toHaveLength(2);
    expect(result.status === "ok" && result.data).toEqual(
      expect.arrayContaining([
        { article: mockSite.groups[0].articles[0], groupSlug: "technology" },
        { article: mockSite.groups[1].articles[0], groupSlug: "travel" },
      ]),
    );
  });

  it("only returns articles tagged with the exact tag, not untagged articles", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    const result = await loader(makeArgs("web"));

    expect(result.status === "ok" && result.data).toEqual([
      { article: mockSite.groups[0].articles[0], groupSlug: "technology" },
    ]);
  });

  it("throws a 404 Response when no article carries the tag", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    let thrown: unknown;
    try {
      await loader(makeArgs("nonexistent"));
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });

  it("returns status retrying when the fetch fails transiently, resolving once a retry succeeds", async () => {
    vi.mocked(fetchSite)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce(mockSite);

    vi.useFakeTimers();
    try {
      const result = await loader(makeArgs("ai"));
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying"
          ? expect(result.data).resolves.toHaveLength(2)
          : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
