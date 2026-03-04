import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../styles/navbar.module.css";

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>⚔️</span>
          <span className={styles.logoText}>CodeQuest</span>
        </Link>

        <div className={styles.spacer} />

        <div className={styles.links}>
          {isAuthenticated ? (
            isAdmin ? (
              <>
                <Link 
                  to="/admin" 
                  className={`${styles.link} ${location.pathname === "/admin" ? styles.active : ""}`}
                >
                  📊 Dashboard
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`${styles.link} ${location.pathname === "/admin/users" ? styles.active : ""}`}
                >
                  👥 Users
                </Link>
                <Link 
                  to="/admin/lessons" 
                  className={`${styles.link} ${location.pathname === "/admin/lessons" ? styles.active : ""}`}
                >
                  📚 Lessons
                </Link>
                <Link 
                  to="/admin/quizzes" 
                  className={`${styles.link} ${location.pathname === "/admin/quizzes" ? styles.active : ""}`}
                >
                  ✅ Quizzes
                </Link>
                <Link 
                  to="/admin/questions" 
                  className={`${styles.link} ${location.pathname === "/admin/questions" ? styles.active : ""}`}
                >
                  ❓ Questions
                </Link>
              </>
            ) : (
              <>
                <Link to="/lessons" className={styles.link}>📚 Lessons</Link>
                <Link to="/leaderboard" className={styles.link}>🏆 Leaderboard</Link>
                <Link to="/profile" className={styles.link}>👤 Profile</Link>
              </>
            )
          ) : (
            <>
              <Link to="/login" className={styles.link}>Login</Link>
              <Link to="/register" className={styles.link}>Register</Link>
            </>
          )}
        </div>

        {isAuthenticated && (
          <button className={styles.logoutBtn} onClick={logout}>
            🚪 Logout
          </button>
        )}
      </div>
    </nav>
  );
}
