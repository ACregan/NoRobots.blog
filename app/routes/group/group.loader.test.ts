import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@skyscribe-sdk/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@skyscribe-sdk/core")>();
  return { ...actual, fetchPublication: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./group";
import { fetchPublication } from "@skyscribe-sdk/core";
import { PdsFetchError } from "@skyscribe-sdk/core";
import type { StandardPublication } from "@skyscribe-sdk/core";

const mockSite: StandardPublication = {
  uri: "at://did/site.standard.publication/test",
  name: "Test Site",
  domain: "test.example.com",
  basePath: "",
  categories: [
    {
      slug: "technology",
      title: "Technology",
      documents: [
        {
          uri: "at://did/site.standard.document/post-1",
          title: "Tech Post",
          coverImageUrl: null,
          createdAt: "2024-01-01T00:00:00Z",
        },
      ],
    },
    {
      slug: "travel",
      title: "Travel",
      documents: [],
    },
  ],
};

const makeArgs = (groupSlug: string) =>
  ({ request: new Request("https://example.com"), params: { groupSlug } }) as never;

beforeEach(() => {
  vi.mocked(fetchPublication).mockReset();
});

describe("group loader", () => {
  it("returns the group matching the slug param on the fast path", async () => {
    vi.mocked(fetchPublication).mockResolvedValue(mockSite);

    const result = await loader(makeArgs("technology"));

    expect(result).toEqual({
      status: "ok",
      data: mockSite.categories[0],
      publicationUri: mockSite.uri,
    });
  });

  it("throws a 404 Response when the slug does not match any group", async () => {
    vi.mocked(fetchPublication).mockResolvedValue(mockSite);

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
    vi.mocked(fetchPublication)
      .mockRejectedValueOnce(new PdsFetchError("network blip"))
      .mockResolvedValueOnce(mockSite);

    vi.useFakeTimers();
    try {
      const result = await loader(makeArgs("technology"));
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying"
          ? expect(result.data).resolves.toEqual(mockSite.categories[0])
          : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
