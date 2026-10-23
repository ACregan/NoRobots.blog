import { describe, it, expect } from "vitest";
import { canonicalLink } from "~/lib/canonical";
import { SITE_URL } from "~/config";

describe("canonicalLink", () => {
  it("anchors a page path to SITE_URL", () => {
    expect(canonicalLink("/travel")).toEqual({
      tagName: "link",
      rel: "canonical",
      href: `${SITE_URL}/travel`,
    });
  });

  it("gives the home page a trailing slash", () => {
    expect(canonicalLink("/").href).toBe(`${SITE_URL}/`);
  });
});
