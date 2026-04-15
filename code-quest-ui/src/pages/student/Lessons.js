import React, { useEffect, useMemo, useState } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import LessonCard from "../../components/LessonCard";
import { computeStreakData } from "../../utils/streak";
import styles from "../../styles/lessons.module.css";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [lessonsRes, unlockedRes, progressRes, attemptsRes] = await Promise.all([
          http.get(endpoints.lessons),
          http.get(endpoints.unlockedLessons),
          http.get(endpoints.myProgress),
          http.get(endpoints.myAttempts),
        ]);

        if (!mounted) return;

        setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
        setUnlocked(Array.isArray(unlockedRes) ? unlockedRes : []);
        setProgressItems(Array.isArray(progressRes) ? progressRes : []);
        setAttempts(Array.isArray(attemptsRes) ? attemptsRes : []);
      } catch (err) {
        setError(err.message || "Failed to load lessons");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  const lockMap = useMemo(() => {
    const map = new Map();
    unlocked.forEach((u) => {
      const lessonId = u.lessonId ?? u.LessonId;
      const isUnlocked = typeof u.Unlocked !== "undefined" ? u.Unlocked : u.unlocked;
      map.set(lessonId, !(!!isUnlocked));
    });
    return map;
  }, [unlocked]);

  const sortedLessons = useMemo(() => {
    const list = Array.isArray(lessons) ? [...lessons] : [];
    return list.sort((a, b) => {
      const aLevel = a.level ?? a.levelNumber ?? a.Level ?? a.LevelNumber ?? 0;
      const bLevel = b.level ?? b.levelNumber ?? b.Level ?? b.LevelNumber ?? 0;
      return aLevel - bLevel;
    });
  }, [lessons]);

  const completedLessonIds = useMemo(() => {
    const set = new Set();

    unlocked.forEach((u) => {
      const lessonId = u.lessonId ?? u.LessonId;
      const completed = typeof u.Completed !== "undefined" ? u.Completed : u.completed;
      if (lessonId && completed) set.add(lessonId);
    });

    progressItems.forEach((item) => {
      const lessonId = item.lessonId ?? item.LessonId;
      const completed = typeof item.Completed !== "undefined" ? item.Completed : item.completed;
      if (lessonId && completed) set.add(lessonId);
    });

    return set;
  }, [progressItems, unlocked]);

  const progressMap = useMemo(() => {
    const map = new Map();
    progressItems.forEach((item) => {
      const latest = item.latestAttempt;
      const lid = item.lessonId ?? item.LessonId;
      const completed = typeof item.Completed !== "undefined" ? item.Completed : item.completed;
      const total = latest?.totalQuestions ?? latest?.TotalQuestions ?? 0;
      const score = latest?.score ?? latest?.Score ?? 0;
      const pct = completed
        ? 100
        : total > 0
          ? Math.round((score / total) * 100)
          : 0;

      const prev = map.get(lid) ?? 0;
      if (pct > prev) map.set(lid, pct);
    });
    return map;
  }, [progressItems]);

  const lessonStats = useMemo(() => {
    let completed = 0;
    let locked = 0;
    let unlockedOnly = 0;

    lessons.forEach((lesson) => {
      const isCompleted = completedLessonIds.has(lesson.id);
      const isLocked = !isCompleted && (lockMap.get(lesson.id) ?? true);

      if (isCompleted) completed += 1;
      else if (isLocked) locked += 1;
      else unlockedOnly += 1;
    });

    return {
      total: lessons.length,
      completed,
      unlockedOnly,
      locked,
    };
  }, [completedLessonIds, lessons, lockMap]);

  const completionPct = useMemo(() => {
    if (!lessonStats.total) return 0;
    return Math.round((lessonStats.completed / lessonStats.total) * 100);
  }, [lessonStats]);

  const streak = useMemo(() => computeStreakData(attempts), [attempts]);

  if (loading) return <div className={styles.loadingContainer}>Loading lessons…</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.overlay} />

      <div className={styles.header}>
        <div className={styles.headerSplit}>
          <div className={styles.headerMain}>
            <h1>C# Learning Path</h1>
            <p>Master C# through interactive lessons and quizzes</p>
            <div className={styles.progressOverview}>
              <div className={styles.progressOverviewHead}>
                <span>Your journey progress</span>
                <strong>{completionPct}%</strong>
              </div>
              <div className={styles.progressOverviewTrack}>
                <div className={styles.progressOverviewFill} style={{ width: `${completionPct}%` }} />
              </div>
            </div>
            <div className={styles.summaryRow}>
              <div className={styles.summaryChip}>
                <span className={styles.summaryValue}>{lessonStats.completed}</span>
                <span className={styles.summaryLabel}>Completed</span>
              </div>
              <div className={styles.summaryChip}>
                <span className={styles.summaryValue}>{lessonStats.unlockedOnly}</span>
                <span className={styles.summaryLabel}>Unlocked</span>
              </div>
              <div className={styles.summaryChip}>
                <span className={styles.summaryValue}>{lessonStats.locked}</span>
                <span className={styles.summaryLabel}>Locked</span>
              </div>
              <div className={styles.summaryChip}>
                <span className={styles.summaryValue}>{lessonStats.total}</span>
                <span className={styles.summaryLabel}>Total Lessons</span>
              </div>
            </div>
          </div>

          <aside className={styles.streakPanel}>
            <div className={styles.streakPanelHeader}>
              <h3>Streak Counter</h3>
            </div>

            <div className={styles.streakStatsRow}>
              <div className={styles.streakStatCard}>
                <div className={styles.streakStatValue}>{streak.currentStreak}</div>
                <div className={styles.streakStatLabel}>Current</div>
              </div>
              <div className={styles.streakStatCard}>
                <div className={styles.streakStatValue}>{streak.bestStreak}</div>
                <div className={styles.streakStatLabel}>Best</div>
              </div>
              <div className={styles.streakStatCard}>
                <div className={styles.streakStatValue}>{streak.monthActiveDateKeys.size}</div>
                <div className={styles.streakStatLabel}>This Month</div>
              </div>
            </div>

            <p className={styles.streakHint}>
              {streak.activeToday ? "You are on track today." : "Finish a quiz today to keep your streak alive."}
            </p>
          </aside>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionHead}>
          <h2>Lessons</h2>
          <span>{lessonStats.total} total</span>
        </div>
        <div className={styles.grid}>
          {sortedLessons.map((lesson) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            const isLocked = !isCompleted && (lockMap.get(lesson.id) ?? true);
            const status = isCompleted ? "completed" : isLocked ? "locked" : "unlocked";

            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                locked={isLocked}
                status={status}
                progressPct={progressMap.get(lesson.id) ?? 0}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
