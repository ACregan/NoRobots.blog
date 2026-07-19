import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi } from "vitest";

vi.mock("~/utils", () => ({
  formatDate: (iso: string) => `Formatted(${iso})`,
}));

import ArticleTile from "./ArticleTile";

const defaultProps = {
  size: 3,
  groupSlug: "creative-writing",
  slug: "my-article",
  title: "My Article Title",
  description: "A brief synopsis of the article.",
  createdAt: "2024-03-15T12:00:00.000Z",
  author: "anthonycregan.dev",
};

function renderTile(props = defaultProps) {
  return render(
    <MemoryRouter>
      <ArticleTile {...props} />
    </MemoryRouter>,
  );
}

describe("ArticleTile", () => {
  it("renders the article title", () => {
    renderTile();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("My Article Title");
  });

  it("renders the author name", () => {
    renderTile();
    expect(screen.getByText("By anthonycregan.dev")).toBeInTheDocument();
  });

  it("renders the synopsis", () => {
    renderTile();
    expect(screen.getByText("A brief synopsis of the article.")).toBeInTheDocument();
  });

  it("links to the correct article path", () => {
    renderTile();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/creative-writing/my-article");
  });

  it("displays the formatted date via formatDate", () => {
    renderTile();
    expect(screen.getByText("Formatted(2024-03-15T12:00:00.000Z)")).toBeInTheDocument();
  });
});
