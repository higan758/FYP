import React, { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import LessonCard from "../components/LessonCard";
import "../styles/lessons.css";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [unlocked, setUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // fetch lessons + unlock info
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [lessonsRes, unlockedRes] = await Promise.all([
          http.get(endpoints.lessons),
          http.get(endpoints.unlockedLessons),
        ]);

        if (!mounted) return;

        setLessons(Array.isArray(lessonsRes) ? lessonsRes : []);
        setUnlocked(Array.isArray(unlockedRes) ? unlockedRes : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load lessons");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // build lock map (HOOK AT TOP LEVEL ✅)
  const lockMap = useMemo(() => {
    const map = new Map();

    for (const u of unlocked) {
      map.set(u.lessonId, !u.unlocked);
    }

    return map;
  }, [unlocked]);

  if (loading) {
    return (
      <div className="lessons-wrap">
        <h1>Lessons</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lessons-wrap">
        <h1>Lessons</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="lessons-wrap">
      <h1>Lessons</h1>

      <div className="lesson-grid">
        {lessons.map((lesson) => {
          const locked = lockMap.get(lesson.id) ?? true;

          return (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              locked={locked}
            />
          );
        })}
      </div>
    </div>
  );
}
