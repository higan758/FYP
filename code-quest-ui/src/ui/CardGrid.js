import React from "react";
import styles from "./CardGrid.module.css";
import Icon from "./Icon";

export function CardGrid({ children }) {
  return <div className={`${styles.grid} ${styles.auto}`}>{children}</div>;
}

export function FeatureCard({ title, icon, children }) {
  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <div className={styles.iconWrap}><Icon name={icon} /></div>
        <h3>{title}</h3>
      </div>
      <p className={styles.muted}>{children}</p>
    </div>
  );
}
