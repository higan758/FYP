import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import BattleScene from "../../components/game/BattleScene";
import VictoryModal from "../../components/game/VictoryModal";
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
  const [showVictory, setShowVictory] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [error, setError] = useState("");
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [lastPlayerHit, setLastPlayerHit] = useState(0);
  const [lastEnemyHit, setLastEnemyHit] = useState(0);
  const [battleEvent, setBattleEvent] = useState(null);
  const [battleLog, setBattleLog] = useState(["Battle started. Choose your answer!"]);
  const battleEventIdRef = useRef(0);
  const logRef = useRef(null);
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

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

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

  function emitBattleEvent(check, damageToEnemy, damageToPlayer) {
    const correct = Boolean(check.correct ?? check.Correct);
    setBattleEvent({
      id: battleEventIdRef.current++,
      correct,
      damageToEnemy,
      damageToPlayer,
    });
  }

  function pushBattleLog(message) {
    setBattleLog(prev => [...prev, message]);
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
      const correct = Boolean(check.correct ?? check.Correct);
      setEnemyHp(hp => Math.max(0, hp - toEnemy));
      setPlayerHp(hp => Math.max(0, hp - toPlayer));
      emitBattleEvent(check, toEnemy, toPlayer);
      pushBattleLog(`Q${currentIndex + 1}: ${correct ? "Correct" : "Wrong"}.`);
      if (toEnemy > 0) pushBattleLog(`You dealt ${toEnemy} damage to Slime.`);
      if (toPlayer > 0) pushBattleLog(`Slime dealt ${toPlayer} damage to you.`);
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
          const correct = Boolean(check.correct ?? check.Correct);
          setEnemyHp(hp => Math.max(0, hp - toEnemy));
          setPlayerHp(hp => Math.max(0, hp - toPlayer));
          emitBattleEvent(check, toEnemy, toPlayer);
          pushBattleLog(`Q${currentIndex + 1}: ${correct ? "Correct" : "Wrong"}.`);
          if (toEnemy > 0) pushBattleLog(`You dealt ${toEnemy} damage to Slime.`);
          if (toPlayer > 0) pushBattleLog(`Slime dealt ${toPlayer} damage to you.`);
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
      const rResult = res.result ?? res.Result;
      const rScore = res.score ?? res.Score ?? 0;
      const rTotal = res.totalQuestions ?? res.TotalQuestions ?? questions.length;
      const rPlayerHp = res.playerHp ?? res.PlayerHp ?? playerHp;
      const rEnemyHp = res.enemyHp ?? res.EnemyHp ?? enemyHp;
      const totalDamageDealt = Math.max(0, 100 - rEnemyHp);
      const totalDamageTaken = Math.max(0, 100 - rPlayerHp);
      const accuracy = Math.round((rScore / Math.max(1, rTotal)) * 100);
      const resultAnswers = res.answers ?? res.Answers ?? [];
      const questionReview = (questions || []).map((question) => {
        const selectedAnswer = finalAnswers[question.id];
        const answerInfo = resultAnswers.find(a => (a.questionId ?? a.QuestionId) === question.id);
        const correctAnswer = (answerInfo?.correctAnswer ?? answerInfo?.CorrectAnswer ?? "").toUpperCase();
        const isCorrect = Boolean(
          selectedAnswer &&
          correctAnswer &&
          selectedAnswer.toUpperCase() === correctAnswer
        );

        return {
          id: question.id,
          text: question.text,
          selectedAnswer,
          correctAnswer,
          isCorrect,
        };
      });

      pushBattleLog(rResult === "Victory" ? "Battle finished: Victory!" : "Battle finished: Defeat.");
      setResultData({
        score: rScore,
        totalQuestions: rTotal,
        accuracy,
        totalDamageDealt,
        totalDamageTaken,
        finalHP: {
          player: rPlayerHp,
          enemy: rEnemyHp,
        },
        questionReview,
        result: rResult,
      });
      setShowVictory(true);
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
    setBattleLog(["Battle restarted. Choose your answer!"]);
    setResumeOpen(false);
  }

  function restartQuiz() {
    setShowVictory(false);
    setResultData(null);
    restartProgress();
  }


  const q = currentQuestion;
  const progressPercent = Math.round(((currentIndex + 1) / Math.max(1, questions.length)) * 100);

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
      <VictoryModal
        isOpen={showVictory}
        resultData={resultData}
        onClose={() => setShowVictory(false)}
        onRetry={restartQuiz}
        onReturn={() => {
          setShowVictory(false);
          nav("/lessons");
        }}
        nextLessonId={nextLessonId}
        onNextLesson={() => {
          if (!nextLessonId) return;
          setShowVictory(false);
          nav(`/lesson/${nextLessonId}`);
        }}
      />
      <div className={styles.wrap}>
        <div className={styles.quizLayout}>
          <div className={styles.battlePanel}>
            {/* Battle Scene with Sprite Animations */}
            <BattleScene
              playerHP={playerHp}
              enemyHP={enemyHp}
              battleEvent={battleEvent}
              showResult={false}
            />
          </div>

          <div className={styles.questionPanel}>
            <div className={styles.questionCard}>
              <div className={styles.titleRow}>
                <h2>Question {currentIndex + 1} / {questions.length}</h2>
                <span className="badge">Damage: {q.damage}</span>
              </div>
              <div className={styles.progressMeta}>
                <span>{progressPercent}% complete</span>
                <span>{Math.max(0, questions.length - (currentIndex + 1))} remaining</span>
              </div>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
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
                    <span className={styles.choiceLabel}>{opt}</span>
                    <span className={styles.choiceText}>{q[`option${opt}`]}</span>
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

        <div className={styles.battleLogPanel}>
          <div className={styles.battleLogHeader}>Battle Log</div>
          <div className={styles.battleLogBody} ref={logRef}>
            {battleLog.map((line, idx) => (
              <div key={`${idx}-${line}`} className={styles.battleLogLine}>
                <span className={styles.battleLogMarker}>{">"}</span> {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
