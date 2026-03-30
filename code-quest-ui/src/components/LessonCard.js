import { useNavigate } from "react-router-dom";
import styles from "../styles/lessons.module.css";
import ProgressBar from "./ProgressBar";

export default function LessonCard({ lesson, locked, status = "locked", progressPct = 0 }) {
  const nav = useNavigate();
  const statusText = status === "completed" ? "Completed" : status === "unlocked" ? "Unlocked" : "Locked";
  const statusClass = status === "completed"
    ? styles.stateCompleted
    : status === "unlocked"
      ? styles.stateUnlocked
      : styles.stateLocked;

  function openLesson() {
    if (!locked) {
      nav(`/lesson/${lesson.id}`, { state: lesson });
    }
  }

  return (
    <div
      className={`${styles.card} ${locked ? styles.locked : ""} ${status === "completed" ? styles.completedCard : ""}`}
      onClick={openLesson}
      style={{ cursor: locked ? "not-allowed" : "pointer" }}
    >
      <div className={styles.topRow}>
        <h3>{lesson.title}</h3>
        <span className="badge">{`Level ${lesson.levelNumber}`}</span>
      </div>
      <p className={styles.description}>{lesson.description}</p>

      <div className={styles.progressRow}>
        <div className={styles.progressMeta}>
          <span className={styles.metaLabel}>Status</span>
          <span className={`${styles.statusPill} ${statusClass}`}>{statusText}</span>
        </div>
        <ProgressBar
          value={Math.max(0, Math.min(100, progressPct))}
          max={100}
          color={status === "completed" ? "#16a34a" : "#2563eb"}
        />
      </div>

      {locked ? (
        <div className={styles.lockedHint}>Complete the previous lesson to unlock this one.</div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); openLesson(); }}
          className={`btn btn-primary ${styles.enterBtn}`}
        >
          {status === "completed" ? "Review Lesson" : "Enter Lesson"}
        </button>
      )}
    </div>
  );
}
