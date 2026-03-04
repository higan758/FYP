import React from "react";
import styles from "./CourseCard.module.css";

export default function CourseCard({ title, level, description, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{title}</h3>
        {typeof level !== "undefined" ? <span className={`badge ${styles.badge}`}>Level {level}</span> : null}
      </div>
      {description ? <p className={styles.desc}>{description}</p> : null}
    </div>
  );
}
