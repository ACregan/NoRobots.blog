import { useAsyncError } from "react-router";
import { NotFoundError } from "@scribe-atp/core";
import errorStyles from "~/ErrorBoundary.module.css";

// Rendered by <Await errorElement> once all retries in a streamed PDS fetch
// are exhausted. A NotFoundError can still surface here (e.g. the record
// was deleted between the first attempt and a retry) — handled the same as
// the 404 thrown on the fast path, rather than the "PDS is down" message.
export default function PdsDownError() {
  const error = useAsyncError();

  if (error instanceof NotFoundError) {
    return (
      <div className={errorStyles.container}>
        <h1>404</h1>
        <p>The requested page could not be found.</p>
        <a href="/">
          <p>Return the Homepage</p>
        </a>
      </div>
    );
  }

  return (
    <div className={errorStyles.container}>
      <h1>We're having trouble connecting</h1>
      <p>
        NoRobots.blog reads its content directly from the AT Protocol
        network, and that connection is temporarily unavailable. This
        usually resolves itself within a few minutes.
      </p>
      <button type="button" onClick={() => window.location.reload()}>
        Try again
      </button>
    </div>
  );
}
