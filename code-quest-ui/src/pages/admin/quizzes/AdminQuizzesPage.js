import React, { useCallback, useEffect, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import QuizForm from "./QuizForm";
import QuizList from "./QuizList";
import styles from "../../../styles/adminQuizzes.module.css";

export default function AdminQuizzesPage() {
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { load(); }, [load]);

  const quizCount = (lessons || []).reduce((sum, l) => sum + (l.quizzes?.length || 0), 0);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📝 Manage Quizzes</h1>
        <span className={styles.countBadge}>{quizCount} quiz{quizCount !== 1 ? "zes" : ""}</span>
      </div>

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      <div className={styles.formCard}>
        <h2 className={styles.formCardTitle}>➕ Create New Quiz</h2>
        <QuizForm lessons={lessons} onCreated={load} />
      </div>

      <section>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Loading quizzes...</span>
          </div>
        ) : (
          <QuizList lessons={lessons} onRefresh={load} />
        )}
      </section>
    </div>
  );
}
