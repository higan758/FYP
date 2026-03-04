import React from "react";
import styles from "../styles/quizBattle.module.css";

export default function Modal({ open, title, children, actions, onClose }) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        <div>{children}</div>
        <div className={styles.modalActions}>
          {actions}
        </div>
      </div>
    </div>
  );
}
