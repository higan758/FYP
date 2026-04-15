import { useEffect } from "react";
import styles from "../../styles/quizBattle.module.css";

export default function VictoryModal({
  isOpen,
  resultData,
  onClose,
  onRetry,
  onReturn,
  nextLessonId,
  onNextLesson,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resultData) return null;

  const {
    score = 0,
    totalQuestions = 0,
    accuracy = 0,
    totalDamageDealt = 0,
    totalDamageTaken = 0,
    finalHP = {},
    questionReview = [],
    result = "Defeat",
  } = resultData;

  const isVictory = result === "Victory";

  return (
    <div className={styles.victoryModalOverlay} onClick={onClose}>
      <div
        className={styles.victoryModalCard}
        role="dialog"
        aria-modal="true"
        aria-label="Quiz result"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.victoryModalHeader}>
          <h2 className={styles.victoryModalTitle}>Quiz Result</h2>
          <button type="button" className={styles.victoryModalClose} onClick={onClose} aria-label="Close quiz result">
            ×
          </button>
        </div>

        <div className={`${styles.resultBanner} ${isVictory ? styles.success : styles.fail}`}>
          {isVictory ? "Victory ✅" : "Defeat ❌"}
        </div>

        <div className={styles.resultGrid}>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{score} / {totalQuestions}</div>
            <div className={styles.resultLabel}>Score</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{accuracy}%</div>
            <div className={styles.resultLabel}>Accuracy</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{Math.max(0, totalDamageDealt)}</div>
            <div className={styles.resultLabel}>Total Damage Dealt</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{Math.max(0, totalDamageTaken)}</div>
            <div className={styles.resultLabel}>Total Damage Taken</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{finalHP.player ?? 0} vs {finalHP.enemy ?? 0}</div>
            <div className={styles.resultLabel}>Final HP (You vs Enemy)</div>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <h3>Question Review</h3>
          {(questionReview || []).map((item) => (
            <div key={item.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div>{item.text}</div>
                <span className={item.isCorrect ? styles.badgeSuccess : styles.badgeFail}>
                  {item.isCorrect ? "Correct" : "Incorrect"}
                </span>
              </div>
              <div className={styles.reviewMeta}>
                Selected: {item.selectedAnswer ?? "—"} • Correct: {item.correctAnswer || "—"}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.resultActions}>
          <button className="btn" onClick={onRetry}>Retry Quiz</button>
          <button className="btn" onClick={onReturn}>Back to Lesson</button>
          {nextLessonId ? (
            <button className="btn btn-primary" onClick={onNextLesson}>
              Next Lesson
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
