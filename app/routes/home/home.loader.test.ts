import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@scribe-atp/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@scribe-atp/core")>();
  return { ...actual, fetchSite: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./home";
import { fetchSite, NotFoundError, PdsFetchError } from "@scribe-atp/core";
import type { Site } from "@scribe-atp/core";

const mockSite: Site = {
  uri: "at://did/site.standard.publication/test",
  title: "Test Site",
  url: "test.example.com",
  urlPrefix: "",
  groups: [],
  ungroupedArticles: [],
};

const makeArgs = () => ({ request: new Request("https://example.com") }) as never;

beforeEach(() => {
  vi.mocked(fetchSite).mockReset();
});

describe("home loader", () => {
  it("returns the site on the fast path", async () => {
    vi.mocked(fetchSite).mockResolvedValue(mockSite);

    const result = await loader(makeArgs());

    expect(result).toEqual({ status: "ok", data: mockSite });
  });

  it("throws a 404 Response when the site itself doesn't exist", async () => {
    vi.mocked(fetchSite).mockRejectedValue(new NotFoundError("Site not found: https://test.example.com"));

    let thrown: unknown;
    try {
      await loader(makeArgs());
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
      const result = await loader(makeArgs());
      expect(result.status).toBe("retrying");

      const assertion =
        result.status === "retrying" ? expect(result.data).resolves.toEqual(mockSite) : undefined;
      await vi.runAllTimersAsync();
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
