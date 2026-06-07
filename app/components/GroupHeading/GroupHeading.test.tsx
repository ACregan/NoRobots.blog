import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, it, expect } from "vitest";
import GroupHeading from "./GroupHeading";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("GroupHeading", () => {
  it("renders a plain h1 when no link prop is provided", () => {
    renderWithRouter(<GroupHeading>Technology</GroupHeading>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Technology");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("wraps the heading in a link when a link prop is provided", () => {
    renderWithRouter(<GroupHeading link="technology">Technology</GroupHeading>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/technology");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Technology");
  });

  it("renders children as the heading text", () => {
    renderWithRouter(<GroupHeading>Creative Writing</GroupHeading>);

    expect(screen.getByRole("heading").textContent).toBe("Creative Writing");
  });
});
