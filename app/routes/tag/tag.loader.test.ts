import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchSite: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./tag";
import { fetchSite } from "@scribe-atp/core";
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
  vi.mocked(fetchSite).mockResolvedValue(mockSite);
});

describe("tag loader", () => {
  it("returns every article across every group tagged with the given tag", async () => {
    const result = await loader(makeArgs("ai"));

    expect(result.tag).toBe("ai");
    expect(result.matches).toHaveLength(2);
    expect(result.matches).toEqual(
      expect.arrayContaining([
        { article: mockSite.groups[0].articles[0], groupSlug: "technology" },
        { article: mockSite.groups[1].articles[0], groupSlug: "travel" },
      ]),
    );
  });

  it("only returns articles tagged with the exact tag, not untagged articles", async () => {
    const result = await loader(makeArgs("web"));

    expect(result.matches).toEqual([
      { article: mockSite.groups[0].articles[0], groupSlug: "technology" },
    ]);
  });

  it("throws a 404 Response when no article carries the tag", async () => {
    let thrown: unknown;
    try {
      await loader(makeArgs("nonexistent"));
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });
});
