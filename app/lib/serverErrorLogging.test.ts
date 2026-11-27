import { describe, expect, it } from "vitest";
import { shouldLogServerError } from "./serverErrorLogging";

// React Router's own "No route matches URL" error is an ErrorResponse with
// status 404 that carries the original Error; build one the same way.
function routeErrorResponse(status: number) {
  return {
    status,
    statusText: "",
    internal: true,
    data: `Error: No route matches URL "/www.bak"`,
    error: new Error(`No route matches URL "/www.bak"`),
  };
}

const request = () => new Request("https://norobots.blog/www.bak");

describe("shouldLogServerError", () => {
  it("skips a 404 for an unknown URL", () => {
    expect(shouldLogServerError(routeErrorResponse(404), request())).toBe(false);
  });

  it("skips a 405", () => {
    expect(shouldLogServerError(routeErrorResponse(405), request())).toBe(false);
  });

  it("logs a 5xx route error response", () => {
    expect(shouldLogServerError(routeErrorResponse(500), request())).toBe(true);
  });

  it("logs a thrown Error", () => {
    expect(shouldLogServerError(new Error("PDS down"), request())).toBe(true);
  });

  it("skips anything once the request is aborted", () => {
    const controller = new AbortController();
    controller.abort();
    const aborted = new Request("https://norobots.blog/", { signal: controller.signal });
    expect(shouldLogServerError(new Error("boom"), aborted)).toBe(false);
  });
});
