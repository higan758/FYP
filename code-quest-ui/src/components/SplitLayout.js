import React from "react";
import styles from "../styles/splitLayout.module.css";

export default function SplitLayout({ left, right }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.left}>{left}</div>
      <div className={styles.right}>{right}</div>
    </div>
  );
}
