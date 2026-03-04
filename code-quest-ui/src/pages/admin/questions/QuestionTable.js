import React from "react";
import styles from "./questionTable.module.css";

export default function QuestionTable({ questions, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <span>Loading questions...</span>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <p className={styles.emptyText}>No questions yet. Create your first question to get started.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>Question</th>
            <th style={{ width: "80px" }}>A</th>
            <th style={{ width: "80px" }}>B</th>
            <th style={{ width: "80px" }}>C</th>
            <th style={{ width: "80px" }}>D</th>
            <th style={{ width: "80px" }}>Correct</th>
            <th style={{ width: "80px" }}>Damage</th>
            <th style={{ width: "150px", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, idx) => (
            <tr key={question.id}>
              <td className={styles.index}>{idx + 1}</td>
              <td className={styles.questionText}>{question.text}</td>
              <td className={styles.optionCell}>
                {question.optionA?.length > 40
                  ? question.optionA.substring(0, 40) + "..."
                  : question.optionA}
              </td>
              <td className={styles.optionCell}>
                {question.optionB?.length > 40
                  ? question.optionB.substring(0, 40) + "..."
                  : question.optionB}
              </td>
              <td className={styles.optionCell}>
                {question.optionC?.length > 40
                  ? question.optionC.substring(0, 40) + "..."
                  : question.optionC}
              </td>
              <td className={styles.optionCell}>
                {question.optionD?.length > 40
                  ? question.optionD.substring(0, 40) + "..."
                  : question.optionD}
              </td>
              <td>
                <span className={styles.correct}>{question.correctAnswer}</span>
              </td>
              <td>
                <div className={styles.damage}>{question.damage}</div>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={() => onEdit(question)}
                    title="Edit question"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => onDelete(question)}
                    title="Delete question"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
