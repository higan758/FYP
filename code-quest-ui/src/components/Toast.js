import React, { useEffect } from "react";
import styles from "../styles/toast.module.css";

export default function Toast({ message, duration = 1500, onClose }) {
  useEffect(() => {
    const id = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);
  return (
    <div className={styles.container}>
      <div className={styles.toast}>{message}</div>
    </div>
  );
}
