import React from "react";
import styles from "./Hero.module.css";

export default function Hero({ title, subtitle, children }) {
  return (
    <div className={styles.hero}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <div className={styles.cta}>{children}</div>
      </div>
    </div>
  );
}
