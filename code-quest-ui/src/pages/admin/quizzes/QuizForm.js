import React, { useMemo, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import styles from "../../../styles/adminQuizzes.module.css";

export default function QuizForm({ lessons, onCreated }) {
  const lessonOptions = useMemo(
    () => (Array.isArray(lessons) ? lessons : []),
    [lessons]
  );

  const [lessonId, setLessonId] = useState(lessonOptions[0]?.id || "");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      await http.post(endpoints.quizzes, { lessonId, title });
      setTitle("");
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.createForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Lesson</label>
          <select
            className={styles.select}
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            required
          >
            <option value="" disabled>Select a lesson</option>
            {lessonOptions.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} (Level {l.levelNumber})
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Quiz Title</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            required
          />
        </div>
      </div>
      <div>
        <button type="submit" className="btn btn-primary btn-small" disabled={saving || !lessonId}>
          {saving ? "Creating..." : "✨ Create Quiz"}
        </button>
      </div>
      {error && <div className={styles.error}>⚠️ {error}</div>}
    </form>
  );
}
