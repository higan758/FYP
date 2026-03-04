// import React, { useEffect, useState } from "react";
// import { http } from "../api/http";
// import { endpoints } from "../api/endpoints";
// import styles from "../styles/progress.module.css";
// import ProgressBar from "../components/ProgressBar";

// export default function Progress() {
//   const [progressItems, setProgressItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [stats, setStats] = useState({
//     totalLessons: 0,
//     completedLessons: 0,
//     totalQuizzes: 0,
//     completedQuizzes: 0,
//     averageScore: 0,
//     totalTimeSpent: 0,
//   });

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         const res = await http.get(endpoints.myProgress);
//         if (!mounted) return;

//         const items = Array.isArray(res) ? res : [];
//         setProgressItems(items);

//         // Calculate stats
//         const uniqueLessons = new Set(items.map(i => i.lessonId)).size;
//         const completedLessons = items.filter(i => i.completionPercentage === 100).length;
//         const allAttempts = items.flatMap(i => [i.latestAttempt].filter(Boolean));
//         const avgScore = allAttempts.length > 0
//           ? Math.round(
//               allAttempts.reduce((sum, a) => sum + ((a.score ?? 0) / (a.totalQuestions ?? 1)), 0) / allAttempts.length * 100
//             )
//           : 0;

//         setStats({
//           totalLessons: uniqueLessons,
//           completedLessons,
//           totalQuizzes: allAttempts.length,
//           completedQuizzes: items.filter(i => i.latestAttempt?.passed).length,
//           averageScore: avgScore,
//           totalTimeSpent: items.reduce((sum, i) => sum + (i.minutesSpent ?? 0), 0),
//         });
//       } catch (err) {
//         setError(err.message || "Failed to load progress");
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     }

//     load();
//     return () => (mounted = false);
//   }, []);

//   const getAchievementBadges = () => {
//     const badges = [];
//     if (stats.completedLessons >= 1) badges.push({ icon: "🎓", label: "First Lesson", color: "#4CAF50" });
//     if (stats.completedLessons >= 3) badges.push({ icon: "⭐", label: "Lesson Master", color: "#FFC107" });
//     if (stats.averageScore >= 90) badges.push({ icon: "🔥", label: "Perfect Score", color: "#FF6B6B" });
//     if (stats.totalQuizzes >= 10) badges.push({ icon: "💪", label: "Quiz Champion", color: "#667eea" });
//     if (stats.totalTimeSpent >= 300) badges.push({ icon: "⏰", label: "Dedicated Learner", color: "#00BCD4" });
//     return badges;
//   };

//   if (loading) return <div className={styles.loading}>Loading your progress…</div>;
//   if (error) return <div className={styles.error}>{error}</div>;

//   const achievements = getAchievementBadges();

//   return (
//     <div 
//       className={styles.pageContainer}
//       style={{
//         backgroundImage: `url(/mountain-bg.png)`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundAttachment: 'fixed'
//       }}
//     >
//       <div className={styles.overlay} />

//       <div className={styles.header}>
//         <h1>📊 Your Learning Journey</h1>
//         <p>Track your progress and master C# step by step</p>
//       </div>

//       <div className={styles.mainContent}>
//         {/* Stats Overview */}
//         <div className={styles.statsOverview}>
//           <div className={styles.statItem}>
//             <div className={styles.statIcon}>📚</div>
//             <div className={styles.statInfo}>
//               <div className={styles.statValue}>{stats.completedLessons}/{stats.totalLessons}</div>
//               <div className={styles.statLabel}>Lessons Completed</div>
//             </div>
//           </div>
//           <div className={styles.statItem}>
//             <div className={styles.statIcon}>✅</div>
//             <div className={styles.statInfo}>
//               <div className={styles.statValue}>{stats.completedQuizzes}/{stats.totalQuizzes}</div>
//               <div className={styles.statLabel}>Quizzes Passed</div>
//             </div>
//           </div>
//           <div className={styles.statItem}>
//             <div className={styles.statIcon}>📈</div>
//             <div className={styles.statInfo}>
//               <div className={styles.statValue}>{stats.averageScore}%</div>
//               <div className={styles.statLabel}>Average Score</div>
//             </div>
//           </div>
//           <div className={styles.statItem}>
//             <div className={styles.statIcon}>⏱️</div>
//             <div className={styles.statInfo}>
//               <div className={styles.statValue}>{Math.round(stats.totalTimeSpent / 60)}h</div>
//               <div className={styles.statLabel}>Time Invested</div>
//             </div>
//           </div>
//         </div>

//         {/* Overall Progress */}
//         <div className={styles.progressCard}>
//           <h2>⭐ Overall Progress</h2>
//           <div className={styles.progressContent}>
//             <div className={styles.progressItem}>
//               <span className={styles.progressTitle}>Lesson Completion</span>
//               <ProgressBar 
//                 value={stats.completedLessons} 
//                 max={Math.max(stats.totalLessons, 1)} 
//                 color="#667eea"
//               />
//               <span className={styles.progressPercent}>
//                 {Math.round((stats.completedLessons / Math.max(stats.totalLessons, 1)) * 100)}%
//               </span>
//             </div>
//             <div className={styles.progressItem}>
//               <span className={styles.progressTitle}>Quiz Pass Rate</span>
//               <ProgressBar 
//                 value={stats.completedQuizzes} 
//                 max={Math.max(stats.totalQuizzes, 1)} 
//                 color="#764ba2"
//               />
//               <span className={styles.progressPercent}>
//                 {Math.round((stats.completedQuizzes / Math.max(stats.totalQuizzes, 1)) * 100)}%
//               </span>
//             </div>
//             <div className={styles.progressItem}>
//               <span className={styles.progressTitle}>Average Accuracy</span>
//               <ProgressBar 
//                 value={stats.averageScore} 
//                 max={100} 
//                 color="#FFC107"
//               />
//               <span className={styles.progressPercent}>{stats.averageScore}%</span>
//             </div>
//           </div>
//         </div>

//         {/* Achievements */}
//         {achievements.length > 0 && (
//           <div className={styles.achievementsCard}>
//             <h2>🏆 Achievements Unlocked</h2>
//             <div className={styles.achievementsList}>
//               {achievements.map((badge, idx) => (
//                 <div key={idx} className={styles.achievementBadge} style={{ borderColor: badge.color }}>
//                   <div className={styles.badgeIcon}>{badge.icon}</div>
//                   <div className={styles.badgeLabel}>{badge.label}</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Detailed Lesson Progress */}
//         <div className={styles.lessonsCard}>
//           <h2>📖 Lesson Details</h2>
//           {progressItems.length > 0 ? (
//             <div className={styles.lessonsList}>
//               {progressItems.map((item, idx) => {
//                 const latest = item.latestAttempt;
//                 const score = latest ? Math.round((latest.score ?? 0) / (latest.totalQuestions ?? 1) * 100) : 0;
//                 const completion = item.completionPercentage ?? 0;

//                 return (
//                   <div key={idx} className={styles.lessonItem}>
//                     <div className={styles.lessonHeader}>
//                       <h3 className={styles.lessonName}>{item.lessonName || "Lesson"}</h3>
//                       <span className={`${styles.lessonStatus} ${completion === 100 ? styles.completed : ''}`}>
//                         {completion === 100 ? "✅ Completed" : `${completion}% Progress`}
//                       </span>
//                     </div>
//                     <div className={styles.lessonProgress}>
//                       <ProgressBar value={completion} max={100} color="#667eea" />
//                     </div>
//                     {latest && (
//                       <div className={styles.lessonStats}>
//                         <span className={styles.stat}>
//                           <strong>Best Score:</strong> {score}%
//                         </span>
//                         <span className={styles.stat}>
//                           <strong>Attempts:</strong> {item.attemptCount ?? 1}
//                         </span>
//                         <span className={styles.stat}>
//                           <strong>Time Spent:</strong> {item.minutesSpent ?? 0} min
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className={styles.emptyState}>
//               <p>📚 No lessons started yet. Begin your learning journey!</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }