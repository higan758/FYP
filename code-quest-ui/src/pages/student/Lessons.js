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
      const isUnlocked = typeof u.Unlocked !== "undefined" ? u.Unlocked : u.unlocked;
      map.set(u.lessonId, !(!!isUnlocked));
    });
    return map;
  }, [unlocked]);

  const progressMap = useMemo(() => {
    const map = new Map();
    progressItems.forEach((item) => {
      const latest = item.latestAttempt;
      const pct = latest && latest.totalQuestions > 0
        ? Math.round((latest.score / latest.totalQuestions) * 100)
        : 0;
      const lid = item.lessonId;
      const prev = map.get(lid) ?? 0;
      if (pct > prev) map.set(lid, pct);
    });
    return map;
  }, [progressItems]);

  if (loading) return <div className={styles.loadingContainer}>Loading lessons…</div>;
  if (error) return <div className={styles.errorContainer}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.overlay} />
      
      <div className={styles.header}>
        <h1>📚 C# Learning Path</h1>
        <p>Master C# through interactive lessons and quizzes</p>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              locked={lockMap.get(lesson.id) ?? true}
              progressPct={progressMap.get(lesson.id) ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
