import React, { useEffect, useMemo, useState } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import LessonCard from "../../components/LessonCard";
import styles from "../../styles/lessons.module.css";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [lessonsRes, unlockedRes, progressRes] = await Promise.all([
          http.get(endpoints.lessons),
          http.get(endpoints.unlockedLessons),
          http.get(endpoints.myProgress),
        ]);

        if (!mounted) return;

        setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
        setUnlocked(Array.isArray(unlockedRes) ? unlockedRes : []);
        setProgressItems(Array.isArray(progressRes) ? progressRes : []);
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

  if (loading) return <div className={styles.loadingContainer}>Loading lessons…</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.overlay} />
      
      <div className={styles.header}>
        <h1>📚 C# Learning Path</h1>
        <p>Master C# through interactive lessons and quizzes</p>
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

      <div className={styles.content}>
        <div className={styles.grid}>
          {lessons.map((lesson) => {
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
