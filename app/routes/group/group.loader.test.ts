import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, fetchSite: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./group";
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
  vi.mocked(fetchSite).mockReset();
});

describe("group loader", () => {
  it("returns the group matching the slug param on the fast path", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    const result = await loader(makeArgs("technology"));

    expect(result).toEqual({ status: "ok", data: mockSite.groups[0] });
  });

  it("throws a 404 Response when the slug does not match any group", async () => {
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
      const result = await loader(makeArgs("technology"));
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying"
          ? expect(result.data).resolves.toEqual(mockSite.groups[0])
          : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
