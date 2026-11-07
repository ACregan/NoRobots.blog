import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@skyscribe-sdk/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@skyscribe-sdk/core")>();
  return { ...actual, fetchPublication: vi.fn() };
});
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author", SITE_URL: "https://test.example.com" }));

import { loader } from "./home";
import { fetchPublication, NotFoundError, PdsFetchError } from "@skyscribe-sdk/core";
import type { StandardPublication } from "@skyscribe-sdk/core";

const mockSite: StandardPublication = {
  uri: "at://did/site.standard.publication/test",
  name: "Test Site",
  domain: "test.example.com",
  basePath: "",
  categories: [],
};

const makeArgs = () => ({ request: new Request("https://example.com") }) as never;

beforeEach(() => {
  vi.mocked(fetchPublication).mockReset();
});

describe("home loader", () => {
  it("returns the site on the fast path", async () => {
    vi.mocked(fetchPublication).mockResolvedValue(mockSite);

    const result = await loader(makeArgs());

    expect(result).toEqual({ status: "ok", data: mockSite });
  });

  it("throws a 404 Response when the site itself doesn't exist", async () => {
    vi.mocked(fetchPublication).mockRejectedValue(new NotFoundError("Site not found: https://test.example.com"));

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
    vi.mocked(fetchPublication)
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
