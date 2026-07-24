import styles from "./PdsRetrySpinner.module.css";

export default function PdsRetrySpinner() {
  return (
    <div className={styles.container} role="status">
      <div className={styles.spinner} aria-hidden="true" />
      <span>Reconnecting to the AT Protocol network…</span>
    </div>
  );
}
