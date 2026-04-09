import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import styles from "../styles/profile.module.css";

export default function Profile() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [userNameDraft, setUserNameDraft] = useState("");
  const [progressItems, setProgressItems] = useState([]);
  const [rank, setRank] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await http.get(endpoints.me);
        if (!mounted) return;
        setMe(res);
        setUserNameDraft(res?.userName || user?.userName || "");
        try {
          const [progressRes, lbRes] = await Promise.all([
            http.get(endpoints.myProgress),
            http.get(`${endpoints.leaderboardTop}?limit=100`),
          ]);
          if (!mounted) return;
          setProgressItems(Array.isArray(progressRes) ? progressRes : []);
          // leaderboard returns { top: [...], me: { Rank, TotalScore } }
          const myRank = lbRes?.me?.rank ?? lbRes?.me?.Rank ?? null;
          const myScore = lbRes?.me?.totalScore ?? lbRes?.me?.TotalScore ?? 0;
          setRank(myRank);
          setTotalScore(myScore);
        } catch {}
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [user]);

  const avatarData = useMemo(() => {
    const local = typeof window !== "undefined" ? localStorage.getItem("codequest_avatar_data") : null;
    const src = local || me?.avatarUrl || "";
    const name = me?.userName || user?.userName || "";
    const initials = name ? name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase() : "U";
    return { src, initials };
  }, [me, user]);

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const payload = { userName: userNameDraft };
      await http.put(endpoints.updateMe, payload);
      setMe((prev) => prev ? { ...prev, userName: userNameDraft } : prev);
      setEditing(false);
      showNotification("Username updated!");
    } catch (err) {
      alert(err.message || "Failed to update profile");
    }
  }

  function onAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem("codequest_avatar_data", reader.result.toString());
      setMe((prev) => ({ ...prev }));
      showNotification("Profile picture changed!");
    };
    reader.readAsDataURL(file);
  }

  function resetAvatar() {
    localStorage.removeItem("codequest_avatar_data");
    setMe((prev) => ({ ...prev }));
    showNotification("Profile picture reset!");
  }

  function showNotification(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  }

  const quizzesTotal = me?.totalQuizzes ?? 0;
  const quizzesCompleted = me?.completedQuizzes ?? 0;
  const lessonsCompleted = me?.highestLevel ?? 0;

  const nextAllowedDate = useMemo(() => {
    const dt = me?.LastUsernameChangeUtc ?? me?.lastUsernameChangeUtc ?? me?.LastUsernameChange ?? me?.lastUsernameChange;
    if (!dt) return null;
    const d = new Date(dt);
    d.setDate(d.getDate() + 7);
    return d;
  }, [me]);

  const usernameLockMsg = useMemo(() => {
    if (!nextAllowedDate) return "";
    const now = new Date();
    const ms = nextAllowedDate.getTime() - now.getTime();
    if (ms <= 0) return "";
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return `You can change your username again in ${days} day${days > 1 ? "s" : ""}.`;
  }, [nextAllowedDate]);

  const overallPct = useMemo(() => {
    const withAttempts = progressItems.filter((i) => i.latestAttempt && (i.latestAttempt.totalQuestions ?? i.latestAttempt.TotalQuestions) > 0);
    if (withAttempts.length === 0) return Math.round((quizzesCompleted / Math.max(1, quizzesTotal)) * 100);
    const sum = withAttempts.reduce((acc, i) => {
      const latest = i.latestAttempt;
      const score = latest.score ?? latest.Score ?? 0;
      const total = latest.totalQuestions ?? latest.TotalQuestions ?? 0;
      return acc + (total > 0 ? (score / total) : 0);
    }, 0);
    return Math.round((sum / withAttempts.length) * 100);
  }, [progressItems, quizzesCompleted, quizzesTotal]);

  const rankLabel = rank === 1 ? "🥇 Champion" : rank === 2 ? "🥈 Silver" : rank === 3 ? "🥉 Bronze" : rank ? `#${rank}` : "—";

  if (loading) return <div className={styles.pageContainer}><div className={styles.loading}>Loading profile…</div></div>;
  if (error) return <div className={styles.pageContainer}><div className={styles.error}>{error}</div></div>;

  return (
    <div className={styles.pageContainer}>
      {notification && <div className={styles.notification}>{notification}</div>}
      <section className={styles.pageIntro}>
        <h1>My Profile</h1>
        <p>Track your progress, rank, and learning stats in one place.</p>
      </section>

      <div className={styles.profileHeader}>
        {/* Avatar */}
        <div className={styles.avatarCol}>
          <div className={styles.avatarWrap}>
            {avatarData.src ? (
              <img src={avatarData.src} alt="avatar" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarInitials}>{avatarData.initials}</div>
            )}
            <label className={styles.avatarUpload}>
              📷
              <input type="file" accept="image/*" onChange={onAvatarFile} />
            </label>
            {avatarData.src && (
              <button className={styles.resetAvatarBtn} onClick={resetAvatar} title="Reset avatar">✕</button>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className={styles.infoCol}>
          <div className={styles.nameRow}>
            {editing ? (
              <form onSubmit={saveProfile} className={styles.editForm}>
                <input
                  value={userNameDraft}
                  onChange={(e) => setUserNameDraft(e.target.value)}
                  placeholder="Enter username"
                  disabled={!!usernameLockMsg}
                />
                <button className="btn btn-primary btn-small" type="submit" disabled={!!usernameLockMsg}>Save</button>
                <button className="btn btn-secondary btn-small" type="button" onClick={() => { setEditing(false); setUserNameDraft(me?.userName || ""); }}>Cancel</button>
              </form>
            ) : (
              <>
                <h2 className={styles.userName}>{me?.userName || user?.userName || "—"}</h2>
                <button className="btn btn-secondary btn-small" onClick={() => setEditing(true)}>Edit Profile</button>
              </>
            )}
          </div>
          {editing && usernameLockMsg ? <div className={styles.lockMsg}>{usernameLockMsg}</div> : null}

          {/* Stats row (Instagram style) */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{quizzesCompleted}</span>
              <span className={styles.statText}>Battles Won</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{lessonsCompleted}</span>
              <span className={styles.statText}>Levels</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{overallPct}%</span>
              <span className={styles.statText}>Accuracy</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalScore}</span>
              <span className={styles.statText}>Total XP</span>
            </div>
          </div>

          {/* Bio line */}
          <div className={styles.bioLine}>
            <span className={styles.emailBadge}>{me?.email || user?.email || "—"}</span>
            <span className={`${styles.roleBadge} ${user?.role === "Admin" ? styles.admin : styles.student}`}>
              {user?.role === "Admin" ? "👑 Admin" : "🎓 Student"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.rankBanner}>
        <div className={`${styles.rankBadgeCard} ${rank && rank <= 3 ? styles[`rank${rank}`] : ""}`}>
          <div className={styles.rankIcon}>{rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏆"}</div>
          <div className={styles.rankInfo}>
            <div className={styles.rankValue}>{rankLabel}</div>
            <div className={styles.rankDesc}>Leaderboard Rank</div>
          </div>
          <div className={styles.rankScore}>{totalScore} XP</div>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailCard}>
          <h3>Battle Progress</h3>
          <div className={styles.progressItem}>
            <div className={styles.progressLabel}>Battles Completed</div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${Math.min(100, Math.round((quizzesCompleted / Math.max(1, quizzesTotal)) * 100))}%` }} />
              </div>
              <span className={styles.progressCount}>{quizzesCompleted} / {quizzesTotal}</span>
            </div>
          </div>
          <div className={styles.progressItem}>
            <div className={styles.progressLabel}>Overall Accuracy</div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBarTrack}>
                <div className={styles.progressBarFill} style={{ width: `${overallPct}%` }} />
              </div>
              <span className={styles.progressCount}>{overallPct}%</span>
            </div>
          </div>
        </div>

        <div className={styles.detailCard}>
          <h3>Stats Overview</h3>
          <div className={styles.miniStats}>
            <div className={styles.miniStat}>
              <div className={styles.miniStatVal}>{quizzesTotal}</div>
              <div className={styles.miniStatLbl}>Total Quizzes</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatVal}>{quizzesCompleted}</div>
              <div className={styles.miniStatLbl}>Victories</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatVal}>Lv.{lessonsCompleted}</div>
              <div className={styles.miniStatLbl}>Highest Level</div>
            </div>
            <div className={styles.miniStat}>
              <div className={styles.miniStatVal}>{rankLabel}</div>
              <div className={styles.miniStatLbl}>Rank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
