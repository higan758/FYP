import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { computeStreakData, getMonthCalendar } from "../utils/streak";
import styles from "../styles/home.module.css";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [streakLoading, setStreakLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadStreak() {
      if (!isAuthenticated) {
        setAttempts([]);
        return;
      }

      setStreakLoading(true);
      try {
        const res = await http.get(endpoints.myAttempts);
        if (!mounted) return;
        setAttempts(Array.isArray(res) ? res : []);
      } catch {
        if (!mounted) return;
        setAttempts([]);
      } finally {
        if (mounted) setStreakLoading(false);
      }
    }

    loadStreak();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const streak = useMemo(() => computeStreakData(attempts), [attempts]);
  const calendar = useMemo(() => getMonthCalendar(new Date()), []);
  const weekdayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className={styles.pageContainer}>
      {/* ── Hero ─────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroSplit}>
            <div className={styles.heroMain}>
              <span className={styles.heroEyebrow}>Interactive C# Learning Platform</span>
              <h1 className={styles.heroTitle}>
                Level Up Your C# Skills with{" "}
                <span className={styles.heroTitleAccent}>CodeQuest</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Learn C# through interactive quests, battle-style quizzes, and a
                global leaderboard - a playful, gamified way to master programming.
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
              <div className={styles.heroMeta}>
                <span>Hands-on lessons</span>
                <span>Battle quizzes</span>
                <span>Live leaderboard</span>
              </div>
            </div>

            <aside className={styles.streakPanel}>
              <div className={styles.streakPanelHeader}>
                <h3>Learning Streak</h3>
                {isAuthenticated && <span>{calendar.monthLabel}</span>}
              </div>

              {!isAuthenticated && (
                <div className={styles.streakGuestState}>
                  <p>Sign in to track your daily streak and fill your activity calendar.</p>
                  <Link to="/login" className="btn btn-primary btn-small">Log In</Link>
                </div>
              )}

              {isAuthenticated && streakLoading && (
                <div className={styles.streakLoading}>Loading streak data...</div>
              )}

              {isAuthenticated && !streakLoading && (
                <>
                  <div className={styles.streakStatsRow}>
                    <div className={styles.streakStatCard}>
                      <div className={styles.streakStatValue}>{streak.currentStreak}</div>
                      <div className={styles.streakStatLabel}>Current</div>
                    </div>
                    <div className={styles.streakStatCard}>
                      <div className={styles.streakStatValue}>{streak.bestStreak}</div>
                      <div className={styles.streakStatLabel}>Best</div>
                    </div>
                    <div className={styles.streakStatCard}>
                      <div className={styles.streakStatValue}>{streak.monthActiveDateKeys.size}</div>
                      <div className={styles.streakStatLabel}>This Month</div>
                    </div>
                  </div>

                  <p className={styles.streakHint}>
                    {streak.activeToday ? "Great work - today is marked complete." : "Complete a quiz today to keep your streak alive."}
                  </p>

                  <div className={styles.calendarWrap}>
                    <div className={styles.calendarWeekRow}>
                      {weekdayLabels.map((label, idx) => (
                        <div key={`${label}-${idx}`} className={styles.calendarWeekCell}>{label}</div>
                      ))}
                    </div>
                    <div className={styles.calendarGrid}>
                      {calendar.cells.map((cell, idx) => {
                        if (!cell) {
                          return <div key={`empty-${idx}`} className={styles.calendarEmptyCell} />;
                        }
                        const isActive = streak.monthActiveDateKeys.has(cell.key);
                        const className = [
                          styles.calendarDayCell,
                          isActive ? styles.calendarDayActive : "",
                          cell.isToday ? styles.calendarDayToday : "",
                        ].join(" ").trim();

                        return (
                          <div key={cell.key} className={className} title={isActive ? "Active day" : "No activity"}>
                            {cell.day}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Link to="/profile" className={styles.streakProfileLink}>View streak in profile</Link>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.statsSection}>
        <div className={styles.sectionHeader}>
          <h2>Quick Snapshot</h2>
          <p>Everything you need to stay motivated while learning C#.</p>
        </div>
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
      </section>

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
          <h3>Leaderboard</h3>
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
