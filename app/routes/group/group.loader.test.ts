import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/atproto", () => ({ getSite: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_SLUG: "test-site" }));

import { loader } from "./group";
import { getSite } from "~/atproto";
import type { Site } from "~/atproto";

const mockSite: Site = {
  title: "Test Site",
  url: "https://test.example.com",
  urlPrefix: "article/",
  groups: [
    {
      slug: "technology",
      title: "Technology",
      articles: [
        {
          uri: "at://did/app.scribe.article/post-1",
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

beforeEach(() => {
  vi.mocked(getSite).mockResolvedValue(mockSite);
});

describe("group loader", () => {
  it("returns the group matching the slug param", async () => {
    const result = await loader({ params: { groupSlug: "technology" } } as never);

    expect(result.slug).toBe("technology");
    expect(result.title).toBe("Technology");
    expect(result.articles).toHaveLength(1);
  });

  it("throws a 404 Response when the slug does not match any group", async () => {
    let thrown: unknown;
    try {
      await loader({ params: { groupSlug: "nonexistent" } } as never);
    } catch (e) {
      thrown = e;
    }

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(404);
  });
});
