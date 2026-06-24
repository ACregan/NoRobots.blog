import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", () => ({ fetchSite: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_SLUG: "test-site" }));

import { loader } from "./group";
import { fetchSite } from "@scribe-atp/core";
import type { Site } from "@scribe-atp/core";

const mockSite: Site = {
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
          title: "Tech Post",
          splashImageUrl: null,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ],
    },
    {
      slug: "travel",
      title: "Travel",
      articles: [],
    },
  ],
  ungroupedArticles: [],
};

const makeArgs = (groupSlug: string) =>
  ({ request: new Request("https://example.com"), params: { groupSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchSite).mockResolvedValue(mockSite);
});

describe("group loader", () => {
  it("returns the group matching the slug param", async () => {
    const result = await loader(makeArgs("technology"));

    expect(result.slug).toBe("technology");
    expect(result.title).toBe("Technology");
    expect(result.articles).toHaveLength(1);
  });

  it("throws a 404 Response when the slug does not match any group", async () => {
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
