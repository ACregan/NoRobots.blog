import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("~/hooks/GoogleAnalytics", () => ({
  trackClientAnalyticsEvent: vi.fn(),
  AnalyticsEvent: { postLinkClick: "post_link_click" },
}));

vi.mock("~/utils", () => ({
  formatDate: (iso: string) => `Formatted(${iso})`,
}));

import ArticleTile from "./ArticleTile";
import { trackClientAnalyticsEvent } from "~/hooks/GoogleAnalytics";

const defaultProps = {
  groupSlug: "creative-writing",
  url: "my-article",
  title: "My Article Title",
  synopsis: "A brief synopsis of the article.",
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

beforeEach(() => {
  vi.clearAllMocks();
});

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

  it("fires the post_link_click analytics event with the article url on click", () => {
    renderTile();
    fireEvent.click(screen.getByRole("link"));
    expect(trackClientAnalyticsEvent).toHaveBeenCalledWith("post_link_click", {
      page: "my-article",
    });
  });
});
