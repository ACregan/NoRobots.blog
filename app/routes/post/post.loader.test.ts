import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/atproto", () => ({ getArticle: vi.fn() }));
vi.mock("~/config", () => ({ SITE_AUTHOR: "test-author" }));

import { loader } from "./post";
import { getArticle } from "~/atproto";
import type { Article } from "~/atproto";

const mockArticle: Article = {
  title: "Hello World",
  content: "## Hello\n\nSome content here.",
  url: "hello-world",
  synopsis: "A brief intro.",
  createdAt: "2024-03-15T12:00:00Z",
};

beforeEach(() => {
  vi.mocked(getArticle).mockResolvedValue(mockArticle);
});

describe("post loader", () => {
  it("fetches the article by slug and returns it", async () => {
    const result = await loader({ params: { articleId: "hello-world" } } as never);

    expect(result.title).toBe("Hello World");
    expect(result.content).toBe("## Hello\n\nSome content here.");
    expect(getArticle).toHaveBeenCalledWith("test-author", "hello-world");
  });

  it("throws when articleId param is missing", async () => {
    await expect(loader({ params: {} } as never)).rejects.toThrow(
      "No article ID provided",
    );
  });
});
