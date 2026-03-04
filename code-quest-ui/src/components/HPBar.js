import React from "react";
import styles from "../styles/hpbar.module.css";

export default function HPBar({ label, value, max = 100, color = "#10b981", hit = false, damage = 0 }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
  return (
    <div className={styles.wrap}>
      <div className={styles.meta}>
        <strong>{label}</strong>
        <span className={styles.muted}>{value}/{max}</span>
      </div>
      <div className={styles.bar}>
        <div
          className={`${styles.fill} ${hit ? styles.hit : ""}`}
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        {damage > 0 ? (
          <span className={styles.damage} style={{ color }}>
            -{damage}
          </span>
        ) : null}
      </div>
    </div>
  );
}
