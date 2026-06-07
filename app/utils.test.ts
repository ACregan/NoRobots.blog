import { describe, it, expect } from "vitest";
import { formatDate } from "./utils";

// These tests assume the system timezone is UTC or ahead of UTC.
// A noon-UTC timestamp avoids day-boundary shifts in all common timezones.
describe("formatDate", () => {
  it("formats an ISO timestamp to en-GB long date", () => {
    expect(formatDate("2024-03-15T12:00:00.000Z")).toBe("15 March 2024");
  });

  it("formats a December date", () => {
    expect(formatDate("2024-12-25T12:00:00.000Z")).toBe("25 December 2024");
  });

  it("formats a single-digit day without padding", () => {
    expect(formatDate("2024-01-05T12:00:00.000Z")).toBe("5 January 2024");
  });

  it("returns a non-empty string for any valid ISO date", () => {
    expect(formatDate("2020-06-01T00:00:00.000Z")).toBeTruthy();
  });
});
