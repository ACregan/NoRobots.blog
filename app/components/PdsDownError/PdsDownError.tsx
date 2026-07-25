import { useAsyncError } from "react-router";
import { NotFoundError } from "@scribe-atp/core";
import FourOhFour from "~/components/FourOhFour/FourOhFour";
import errorStyles from "~/ErrorBoundary.module.css";

// Rendered by <Await errorElement> once all retries in a streamed PDS fetch
// are exhausted. A NotFoundError can still surface here (e.g. the record
// was deleted between the first attempt and a retry) — handled the same as
// the 404 thrown on the fast path, rather than the "PDS is down" message.
export default function PdsDownError() {
  const error = useAsyncError();

  if (error instanceof NotFoundError) {
    return <FourOhFour />;
  }

  return (
    <div className={errorStyles.container}>
      <h1>We're having trouble connecting</h1>
      <p>
        NoRobots.blog reads its content directly from the AT Protocol network,
        and that connection is temporarily unavailable. This usually resolves
        itself within a few minutes.
      </p>
      <button
        className={errorStyles.tryAgainButton}
        type="button"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  );
}
