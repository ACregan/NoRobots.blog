import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import Tag from "./tag";
import type { ArticleRef } from "@scribe-atp/core";
import type { Route } from "./+types/tag";

function makeArticle(overrides: Partial<ArticleRef> = {}): ArticleRef {
  return {
    uri: "at://did/site.standard.document/post-1",
    title: "An Article",
    splashImageUrl: null,
    createdAt: "2024-03-15T12:00:00.000Z",
    ...overrides,
  };
}

function renderTag(matches: Array<{ article: ArticleRef; groupSlug: string }>) {
  const props = {
    loaderData: { tag: "ai", matches },
    params: { tag: "ai" },
  } as Route.ComponentProps;
  return render(
    <MemoryRouter>
      <Tag {...props} />
    </MemoryRouter>,
  );
}

describe("Tag route component", () => {
  it("renders the tag as a heading", () => {
    renderTag([{ article: makeArticle(), groupSlug: "technology" }]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("#ai");
  });

  it("renders one tile per matching article", () => {
    renderTag([
      { article: makeArticle({ uri: "at://did/a/1", title: "First" }), groupSlug: "technology" },
      { article: makeArticle({ uri: "at://did/a/2", title: "Second" }), groupSlug: "travel" },
    ]);
    expect(screen.getByRole("heading", { level: 2, name: "First" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Second" })).toBeInTheDocument();
  });

  it("links each tile to its own group's slug", () => {
    renderTag([
      { article: makeArticle({ uri: "at://did/a/1", slug: "first-post" }), groupSlug: "technology" },
    ]);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/technology/first-post");
  });

  it("renders nothing in the articles list when there are no matches", () => {
    renderTag([]);
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0);
  });
});
