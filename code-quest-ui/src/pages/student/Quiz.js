import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import HPBar from "../../components/HPBar";
import Modal from "../../components/Modal";
import styles from "../../styles/quizBattle.module.css";

export default function Quiz() {
  const { quizId } = useParams();
  const nav = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [lastPlayerHit, setLastPlayerHit] = useState(0);
  const [lastEnemyHit, setLastEnemyHit] = useState(0);
  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const storageKey = useMemo(() => `cq_quiz_progress_${quizId}`, [quizId]);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [nextLessonId, setNextLessonId] = useState(null);

  useEffect(() => {
    if (!quizId) return; 

    async function loadQuiz() {
      try {
        const res = await http.get(`/api/quizzes/${quizId}`);

        setQuiz(res);
        setQuestions(Array.isArray(res.questions) ? res.questions : []);
        try {
          const lessons = await http.get(endpoints.lessons);
          const arr = Array.isArray(lessons) ? lessons : [];
          const mine = arr.find(l => (l.id ?? l.Id) === (res.lessonId ?? res.LessonId));
          if (mine) {
            const next = arr.find(l => (l.levelNumber ?? l.LevelNumber) === ((mine.levelNumber ?? mine.LevelNumber) + 1));
            if (next) setNextLessonId(next.id ?? next.Id);
          }
        } catch {}
      } catch (err) {
        setError(err.message || "Failed to load quiz");
      }
    }

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setResumeOpen(true);
    } catch {}
  }, [storageKey]);

  if (!quizId) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        <h3>❌ Quiz Error</h3>
        <p>quizId is missing from URL.</p>
        <p>Expected route: <code>/quiz/:quizId</code></p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, color: "red" }}>
        <h3>❌ Error</h3>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Loading quiz…</h3>

        {/* DEBUG PANEL */}
        <pre style={{ background: "#eee", padding: 12 }}>
          quizId: {quizId}
          {"\n"}quiz loaded: {quiz ? "yes" : "no"}
          {"\n"}questions: {questions.length}
        </pre>
      </div>
    );
  }

  function choose(option) {
    setSelected(option);
    saveProgress({ selected: option });
  }

  async function nextQuestion() {
    const q = questions[currentIndex];
    if (!q || !selected) return;

    try {
      const check = await http.post(`${endpoints.quizzes}/${quizId}/check`, {
        questionId: q.id,
        answer: selected,
      });
      const toEnemy = check.damageToEnemy ?? check.DamageToEnemy ?? 0;
      const toPlayer = check.damageToPlayer ?? check.DamageToPlayer ?? 0;
      setEnemyHp(hp => Math.max(0, hp - toEnemy));
      setPlayerHp(hp => Math.max(0, hp - toPlayer));
      setLastEnemyHit(toEnemy);
      setLastPlayerHit(toPlayer);
      setTimeout(() => { setLastEnemyHit(0); setLastPlayerHit(0); }, 700);
    } catch (_) {
      // ignore check errors; proceed anyway
    }

    setAnswers(prev => ({
      ...prev,
      [q.id]: selected,
    }));

    setSelected(null);
    setCurrentIndex(i => i + 1);
    saveProgress({});
  }

  async function submitQuiz() {
    try {
      setSubmitting(true);

      // apply last question damage if not yet advanced
      const q = questions[currentIndex];
      if (q && selected) {
        try {
          const check = await http.post(`${endpoints.quizzes}/${quizId}/check`, {
            questionId: q.id,
            answer: selected,
          });
          const toEnemy = check.damageToEnemy ?? check.DamageToEnemy ?? 0;
          const toPlayer = check.damageToPlayer ?? check.DamageToPlayer ?? 0;
          setEnemyHp(hp => Math.max(0, hp - toEnemy));
          setPlayerHp(hp => Math.max(0, hp - toPlayer));
          setLastEnemyHit(toEnemy);
          setLastPlayerHit(toPlayer);
          setTimeout(() => { setLastEnemyHit(0); setLastPlayerHit(0); }, 700);
        } catch (_) {}
      }

      const finalAnswers = q && selected ? { ...answers, [q.id]: selected } : answers;
      setAnswers(finalAnswers);

      const payload = {
        quizId,
        answers: finalAnswers,
      };

      const res = await http.post(endpoints.submitAttempt, payload);
      setResult(res);
      clearProgress();
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function saveProgress(extra) {
    try {
      const data = {
        currentQuestionIndex: currentIndex,
        selectedAnswers: { ...answers, ...(selected ? { [questions[currentIndex]?.id]: selected } : {}) },
        playerHP: playerHp,
        enemyHP: enemyHp,
        timestamp: Date.now(),
        ...(extra || {}),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {}
  }
  function clearProgress() {
    try { localStorage.removeItem(storageKey); } catch {}
  }
  function resumeProgress() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return setResumeOpen(false);
      const data = JSON.parse(raw);
      setCurrentIndex(Number(data.currentQuestionIndex) || 0);
      setAnswers(data.selectedAnswers || {});
      setPlayerHp(typeof data.playerHP === "number" ? data.playerHP : 100);
      setEnemyHp(typeof data.enemyHP === "number" ? data.enemyHP : 100);
      setSelected(data.selected || null);
    } catch {}
    setResumeOpen(false);
  }
  function restartProgress() {
    clearProgress();
    setSelected(null);
    setAnswers({});
    setCurrentIndex(0);
    setPlayerHp(100);
    setEnemyHp(100);
    setResumeOpen(false);
  }

  if (result) {
    const rResult = result.result ?? result.Result;
    const rScore = result.score ?? result.Score ?? 0;
    const rTotal = result.totalQuestions ?? result.TotalQuestions ?? questions.length;
    const rPlayerHp = result.playerHp ?? result.PlayerHp ?? playerHp;
    const rEnemyHp = result.enemyHp ?? result.EnemyHp ?? enemyHp;
    const isVictory = rResult === "Victory";
    const totalDamageDealt = 100 - rEnemyHp;
    const totalDamageTaken = 100 - rPlayerHp;
    const resultAnswers = result.answers ?? result.Answers ?? [];
    return (
      <div className="page container">
        <div className={`${styles.resultBanner} ${isVictory ? styles.success : styles.fail}`}>
          {isVictory ? "Victory ✅" : "Defeat ❌"}
        </div>
        <div className={styles.resultGrid}>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{rScore} / {rTotal}</div>
            <div className={styles.resultLabel}>Score</div>
          </div>
          <div className={styles.resultCard}>
            <div className={styles.resultValue}>{Math.round((rScore / Math.max(1, rTotal)) * 100)}%</div>
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
            <div className={styles.resultValue}>{rPlayerHp} vs {rEnemyHp}</div>
            <div className={styles.resultLabel}>Final HP (You vs Enemy)</div>
          </div>
        </div>
        <div className={styles.reviewSection}>
          <h3>Question Review</h3>
          {(questions || []).map((q) => {
            const selectedAnswer = answers[q.id];
            const answerInfo = resultAnswers.find(a => (a.questionId ?? a.QuestionId) === q.id);
            const correct = (answerInfo?.correctAnswer ?? answerInfo?.CorrectAnswer ?? "").toUpperCase();
            const isCorrect = selectedAnswer && correct && selectedAnswer.toUpperCase() === correct;
            return (
              <div key={q.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>{q.text}</div>
                  <span className={isCorrect ? styles.badgeSuccess : styles.badgeFail}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <div className={styles.reviewMeta}>
                  Selected: {selectedAnswer ?? "—"} • Correct: {correct || "—"}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.resultActions}>
          <button className="btn" onClick={() => nav(`/quiz/${quizId}`)}>Retry Quiz</button>
          <button className="btn" onClick={() => nav("/lessons")}>Back to Lesson</button>
          {nextLessonId ? <button className="btn btn-primary" onClick={() => nav(`/lesson/${nextLessonId}`)}>Next Lesson</button> : null}
        </div>
      </div>
    );
  }


  const q = currentQuestion;

  return (
    <div className="page container">
      <Modal
        open={resumeOpen}
        title="Resume Quiz?"
        onClose={() => setResumeOpen(false)}
        actions={
          <>
            <button className="btn" onClick={restartProgress}>Restart</button>
            <button className="btn btn-primary" onClick={resumeProgress}>Continue</button>
          </>
        }
      >
        <p>We found saved progress for this quiz. Do you want to continue from where you left off?</p>
      </Modal>
      <div className={styles.wrap}>
        <div className={styles.topBars}>
          <HPBar label="Player HP" value={playerHp} max={100} color="#10b981" hit={lastPlayerHit > 0} damage={lastPlayerHit} />
          <HPBar label="Enemy HP" value={enemyHp} max={100} color="#ef4444" hit={lastEnemyHit > 0} damage={lastEnemyHit} />
        </div>
        <div className={styles.questionCard}>
          <div className={styles.titleRow}>
            <h2>Question {currentIndex + 1} / {questions.length}</h2>
            <span className="badge">Damage: {q.damage}</span>
          </div>
          <p className={styles.question}>{q.text}</p>
          <div className={styles.damageMeta}>Choose an answer to deal damage.</div>
          <div className={styles.choices}>
            {["A", "B", "C", "D"].map(opt => (
              <button
                key={opt}
                onClick={() => choose(opt)}
                className={`${styles.choiceBtn} ${selected === opt ? styles.selected : ""}`}
              >
                {opt}: {q[`option${opt}`]}
              </button>
            ))}
          </div>
          <div className={styles.actions}>
            {currentIndex < questions.length - 1 ? (
              <button className="btn btn-primary" disabled={!selected} onClick={nextQuestion}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" disabled={!selected || submitting} onClick={submitQuiz}>
                {submitting ? "Submitting…" : "Finish Quiz"}
              </button>
            )}
          </div>
          {(lastEnemyHit > 0 || lastPlayerHit > 0) ? (
            <div className={styles.feedback}>
              {lastEnemyHit > 0 ? <span className={styles.enemyHit}>You dealt {lastEnemyHit}!</span> : null}
              {" "}
              {lastPlayerHit > 0 ? <span className={styles.playerHit}>You took {lastPlayerHit}!</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
