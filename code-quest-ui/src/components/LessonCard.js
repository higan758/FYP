import { useNavigate } from "react-router-dom";
import styles from "../styles/lessons.module.css";
import ProgressBar from "./ProgressBar";

export default function LessonCard({ lesson, locked, progressPct = 0 }) {
  const nav = useNavigate();

  function openLesson() {
    if (!locked) {
      nav(`/lesson/${lesson.id}`, { state: lesson });
    }
  }

  return (
    <div
      className={`${styles.card} ${locked ? styles.locked : ""}`}
      onClick={openLesson}
      style={{ cursor: locked ? "not-allowed" : "pointer" }}
    >
      <div className={styles.topRow}>
        <h3>{lesson.title}</h3>
        <span className="badge">{`Level ${lesson.levelNumber}`}</span>
      </div>
      <p className={styles.muted} style={{ marginTop: 6 }}>{lesson.description}</p>

      <div className={styles.progressRow}>
        <div className={styles.progressMeta}>
          <span className={styles.muted}>Progress</span>
          <span className={styles.muted}>{Math.max(0, Math.min(100, progressPct))}%</span>
        </div>
        <ProgressBar value={progressPct} max={100} color="#2563eb" />
      </div>

      {locked ? (
        <span className="badge badge-gray" style={{ marginTop: 8, display: "inline-block" }}>Locked</span>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); openLesson(); }}
          className={`btn btn-primary ${styles.enterBtn}`}

        >
          Enter Lesson
        </button>
      )}
    </div>
  );
}
