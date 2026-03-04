import React, { useCallback, useEffect, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import LessonForm from "./LessonForm";
import LessonList from "./LessonList";
import styles from "../../../styles/adminLessons.module.css";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const res = await http.get(endpoints.adminLessons);
      setLessons(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Failed to load lessons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    function onUpdated() { load(); }
    window.addEventListener("admin-lessons-updated", onUpdated);
    return () => window.removeEventListener("admin-lessons-updated", onUpdated);
  }, [load]);

  return (
    <div className={styles.pageWrap}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📚 Lesson Management</h1>
          <p className={styles.pageSubtitle}>
            {lessons.length} lesson{lessons.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          className={`btn ${showForm ? "btn-secondary" : "btn-primary"}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close" : "+ New Lesson"}
        </button>
      </div>

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      {/* Create form (collapsible) */}
      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formCardTitle}>Create New Lesson</h3>
          <LessonForm onCreated={() => { load(); setShowForm(false); }} />
        </div>
      )}

      {/* Lesson list */}
      <section>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading lessons...</span>
          </div>
        ) : (
          <LessonList lessons={lessons} onDelete={async (id) => {
            if (!window.confirm("Are you sure you want to delete this lesson?")) return;
            try {
              await http.delete(endpoints.adminLessonById(id));
              await load();
            } catch (err) {
              alert(err.message || "Failed to delete lesson");
            }
          }} />
        )}
      </section>
    </div>
  );
}
