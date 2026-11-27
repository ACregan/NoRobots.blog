import { isRouteErrorResponse } from "react-router";

// React Router logs every error it hands to `handleError`, and that includes
// its own 4xx responses: "No route matches URL" (404) and "Method not
// allowed" (405) each come with a full stack trace. Bots probing for
// /www.bak, /.wgetrc and the like turned that into gigabytes of PM2 error
// log. A 4xx is the visitor's mistake, not ours, so only real failures are
// logged, and nothing is logged for a request the client already abandoned.
export function shouldLogServerError(error: unknown, request: Request): boolean {
  if (request.signal.aborted) return false;
  if (isRouteErrorResponse(error) && error.status < 500) return false;
  return true;
}
