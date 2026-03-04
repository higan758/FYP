import React, { useCallback, useEffect, useState } from "react";
import { http } from "../../../api/http";
import { endpoints } from "../../../api/endpoints";
import QuestionList from "./QuestionList";
import styles from "./questionTable.module.css";

export default function AdminQuestionsPage() {
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

  useEffect(() => { 
    load(); 
  }, [load]);

  const totalQuestions = (lessons || []).reduce((sum, l) => {
    return sum + (l.quizzes || []).reduce((qs, q) => qs + (q.questions?.length || 0), 0);
  }, 0);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>❓ Manage Questions</h1>
        <span className={styles.countBadge}>{totalQuestions} question{totalQuestions !== 1 ? "s" : ""}</span>
      </div>

      <p className={styles.pageSubtext}>
        Select a quiz to view, create, edit, or delete its questions.
      </p>

      {error && <div className={styles.errorBanner}>⚠️ {error}</div>}

      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <span>Loading lessons and quizzes...</span>
        </div>
      ) : (
        <QuestionList lessons={lessons} />
      )}
    </div>
  );
}

