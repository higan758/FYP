import React from "react";
import styles from "./GradientSection.module.css";

export default function GradientSection({ variant = "gradient", title, subtitle, children }) {
  const cls = `${styles.section} ${variant === "dark" ? styles.dark : styles.gradient}`;
  return (
    <div className={cls}>
      <div className={styles.wrap}>
        {title ? <h2 className={styles.title}>{title}</h2> : null}
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        {children}
      </div>
    </div>
  );
}
