import React, { useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import styles from "../../../styles/adminLessons.module.css";

export default function LessonForm({ onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelNumber, setLevelNumber] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);
      await http.post(endpoints.adminLessons, {
        title,
        description,
        levelNumber: Number(levelNumber),
      });
      setTitle("");
      setDescription("");
      setLevelNumber(1);
      onCreated?.();
    } catch (err) {
      setError(err.message || "Failed to create lesson");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className={styles.createForm}>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to C#"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Level Number</label>
          <input
            className={styles.input}
            type="number"
            value={levelNumber}
            onChange={(e) => setLevelNumber(e.target.value)}
            min={1}
            required
          />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textareaField}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what students will learn..."
          rows={3}
          required
        />
      </div>
      {error && <div className={styles.error}>⚠️ {error}</div>}
      <div>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Creating..." : "✨ Create Lesson"}
        </button>
      </div>
    </form>
  );
}
