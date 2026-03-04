import React from "react";
import styles from "../styles/codePanel.module.css";

export default function TerminalOutput({ text = "", error = "" }) {
  return (
    <div className={styles.terminal}>
      {error ? (
        <pre className={styles.error}>{error}</pre>
      ) : (
        <pre>{text || "No output"}</pre>
      )}
    </div>
  );
}
