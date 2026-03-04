import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import styles from "../styles/home.module.css";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.pageContainer}>
      {/* ── Hero ─────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Level Up Your C# Skills with{" "}
            <span className={styles.heroTitleAccent}>CodeQuest</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Learn C# through interactive quests, battle-style quizzes, and a
            global leaderboard — a playful, gamified way to master programming.
          </p>
          <div className={styles.heroCta}>
            <Link to="/lessons" className="btn btn-primary btn-large">
              Start Learning
            </Link>
            <Link to="/leaderboard" className="btn btn-secondary btn-large">
              Leaderboard
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="btn btn-outline btn-large">
                Profile
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>4+</div>
          <div className={styles.statLabel}>Lesson Levels</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>⚔️</div>
          <div className={styles.statLabel}>Battle Quizzes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>🏆</div>
          <div className={styles.statLabel}>Global Leaderboard</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>🤖</div>
          <div className={styles.statLabel}>AI Tutor</div>
        </div>
      </div>

      {/* ── Features ─────────────────────────── */}
      <div className={styles.sectionHeader}>
        <h2>Why CodeQuest?</h2>
        <p>Everything you need to go from beginner to confident C# developer</p>
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>📚</div>
          <h3>Structured Lessons</h3>
          <p>
            Progressive C# lessons with level-based unlocks. Learn at your own
            pace with clear milestones.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>⚔️</div>
          <h3>Battle Quizzes</h3>
          <p>
            Every correct answer deals damage to the enemy. Defeat monsters by
            mastering C# concepts.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.featureIconGreen}`}>🏆</div>
          <h3>Global Leaderboard</h3>
          <p>
            Compete with learners worldwide. Climb the ranks and prove your
            C# skills.
          </p>
        </div>
      </div>

      {/* ── Course Roadmap ───────────────────── */}
      <div className={styles.roadmapSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Learning Path</h2>
          <p>Pick a lesson and begin your quest. More worlds coming soon.</p>
        </div>

        <div className={styles.roadmapGrid}>
          {[
            { title: "C# Basics", level: 1, desc: "Variables, types, and control flow" },
            { title: "OOP Essentials", level: 2, desc: "Classes, interfaces, inheritance" },
            { title: "Data Structures", level: 3, desc: "Lists, dictionaries, and algorithms" },
            { title: "LINQ & Async", level: 4, desc: "Query data and async programming" },
          ].map((c) => (
            <div key={c.level} className={styles.courseCard}>
              <div className={styles.courseCardHeader}>
                <h3>{c.title}</h3>
                <span className={styles.levelBadge}>Level {c.level}</span>
              </div>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
