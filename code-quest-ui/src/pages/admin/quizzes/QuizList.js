import React, { useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import styles from "../../../styles/adminQuizzes.module.css";

export default function QuizList({ lessons, onRefresh }) {
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const quizzes = [];
  (lessons || []).forEach((l) => {
    (l.quizzes || []).forEach((q) => {
      quizzes.push({ ...q, lessonTitle: l.title, lessonLevel: l.levelNumber });
    });
  });

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await http.delete(endpoints.quizById ? endpoints.quizById(deleteId) : `/api/quizzes/${deleteId}`);
      setDeleteId(null);
      onRefresh?.();
    } catch (err) {
      alert(err.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  }

  if (quizzes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📋</span>
        <p className={styles.emptyText}>No quizzes yet. Create your first quiz above!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cardGrid}>
        {quizzes.map((q) => (
          <div key={q.id} className={styles.quizCard}>
            <div className={styles.quizCardHeader}>
              <span className={styles.levelPill}>Level {q.lessonLevel}</span>
              <span className={styles.questionCount}>
                {Array.isArray(q.questions) ? q.questions.length : 0} question{(Array.isArray(q.questions) ? q.questions.length : 0) !== 1 ? "s" : ""}
              </span>
            </div>
            <h3 className={styles.quizTitle}>{q.title}</h3>
            <p className={styles.quizLesson}>📚 {q.lessonTitle}</p>
            <div className={styles.quizActions}>
              <button className="btn btn-small btn-danger" onClick={() => setDeleteId(q.id)}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className={styles.modalWrap} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>🗑️ Delete Quiz</h3>
              <button className={styles.modalClose} onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <p className={styles.modalBody}>
              Are you sure you want to delete this quiz? All associated questions will also be deleted. This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
