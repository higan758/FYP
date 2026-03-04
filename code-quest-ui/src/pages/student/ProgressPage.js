import React, { useEffect, useState } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import ProgressBar from "../../components/ProgressBar";
import styles from "../../styles/progress.module.css";

export default function ProgressPage() {
  const [items, setItems] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [progressRes, lessonsRes] = await Promise.all([
          http.get(endpoints.myProgress),
          http.get(endpoints.lessons),
        ]);
        if (!mounted) return;
        setItems(Array.isArray(progressRes) ? progressRes : []);
        setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
      } catch (err) {
        setError(err.message || "Failed to load progress");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  if (loading) return <div className="page container">Loading…</div>;
  if (error) return <div className="page container" style={{ color: "red" }}>{error}</div>;

  const quizzesTotal = items.length;
  const quizzesPassed = items.filter((i) => i.latestAttempt && (i.latestAttempt.enemyHp ?? i.latestAttempt.EnemyHp) <= 0).length;
  const overallPct = (() => {
    const withAttempts = items.filter((i) => i.latestAttempt && (i.latestAttempt.totalQuestions ?? i.latestAttempt.TotalQuestions) > 0);
    if (withAttempts.length === 0) return 0;
    const sum = withAttempts.reduce((acc, i) => {
      const latest = i.latestAttempt;
      const score = latest.score ?? latest.Score ?? 0;
      const total = latest.totalQuestions ?? latest.TotalQuestions ?? 0;
      return acc + (total > 0 ? (score / total) * 100 : 0);
    }, 0);
    return Math.round(sum / withAttempts.length);
  })();
  const lessonIds = lessons.map((l) => l.id);
  const completedLessonIds = new Set(
    items
      .filter((i) => i.latestAttempt && (i.latestAttempt.enemyHp ?? i.latestAttempt.EnemyHp) <= 0)
      .map((i) => i.lessonId)
      .filter((lid) => lessonIds.includes(lid))
  );
  const lessonsCompleted = completedLessonIds.size;
  const lessonsTotal = lessons.length || 1;

  return (
    <div className="page container">
      <h1>Your Progress</h1>
      <div className={`card ${styles.wrap}`}>
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span>Lessons completed</span>
            <span className="muted">{lessonsCompleted} / {lessonsTotal}</span>
          </div>
          <ProgressBar value={Math.round((lessonsCompleted / lessonsTotal) * 100)} max={100} color="#10b981" />
        </div>
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span>Quizzes passed</span>
            <span className="muted">{quizzesPassed} / {quizzesTotal || 1}</span>
          </div>
          <ProgressBar value={Math.round((quizzesPassed / (quizzesTotal || 1)) * 100)} max={100} color="#3b82f6" />
        </div>
        <div className={styles.metric}>
          <div className={styles.metricHeader}>
            <span>Overall percentage</span>
            <span className="muted">{overallPct}%</span>
          </div>
          <ProgressBar value={overallPct} max={100} color="#f59e0b" />
        </div>
      </div>
    </div>
  );
}
