import React from "react";
import styles from "./questionTable.module.css";

export default function DeleteConfirmModal({ open, questionText, onConfirm, onCancel, isDeleting }) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitleDanger}>🗑️ Delete Question</h3>
          <button className={styles.modalClose} onClick={onCancel} disabled={isDeleting}>✕</button>
        </div>
        <p className={styles.modalBody}>
          Are you sure you want to delete this question?
        </p>
        {questionText && (
          <div className={styles.deletePreview}>
            <strong>Question:</strong> {questionText?.substring(0, 100)}
            {questionText?.length > 100 ? "..." : ""}
          </div>
        )}
        <p className={styles.dangerNote}>⚠️ This action cannot be undone.</p>
        <div className={styles.modalFooter}>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
