import React, { useEffect, useState, useCallback } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import styles from "../../styles/adminDashboard.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    lessonsCount: 0,
    quizzesCount: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setError("");
      setLoading(true);
      const [usersRes, lessonsRes, quizzesRes] = await Promise.all([
        http.get(endpoints.adminUsers).catch(() => []),
        http.get(endpoints.adminLessons).catch(() => []),
        http.get(endpoints.quizzes).catch(() => []),
      ]);
      
      setStats({
        usersCount: Array.isArray(usersRes) ? usersRes.length : 0,
        lessonsCount: Array.isArray(lessonsRes) ? lessonsRes.length : 0,
        quizzesCount: Array.isArray(quizzesRes) ? quizzesRes.length : 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", fontSize: "1.1rem", color: "#666" }}>
          Loading dashboard...
        </div>
      ) : (
        <>
          <section className={styles.cards}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>👥 Total Users</div>
              <div className={styles.cardValue}>{stats.usersCount}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>📚 Total Lessons</div>
              <div className={styles.cardValue}>{stats.lessonsCount}</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>✅ Total Quizzes</div>
              <div className={styles.cardValue}>{stats.quizzesCount}</div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Welcome to Admin Panel</h2>
            <p>
              Use the navigation bar above to manage users, lessons, quizzes, and questions. 
              You have full control over the CodeQuest platform content and user management.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
