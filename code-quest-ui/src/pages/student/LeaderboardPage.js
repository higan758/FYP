import React, { useEffect, useState } from "react";
import { http } from "../../api/http";
import { endpoints } from "../../api/endpoints";
import styles from "../../styles/leaderboard.module.css";
import { useAuth } from "../../auth/AuthContext";

export default function LeaderboardPage() {
  const [top, setTop] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await http.get(endpoints.leaderboardTop);
        if (!mounted) return;
        setTop(Array.isArray(res.top) ? res.top : []);
        setMe(res.me || null);
      } catch (err) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const podium = top.slice(0, 3);
  const others = top.slice(3);
  function nameOf(row) { return row.userName || row.UserName; }
  function rankOf(row) { return row.rank ?? row.Rank; }
  function scoreOf(row) { return row.totalScore ?? row.TotalScore; }
  function initialsOf(name) {
    const txt = (name || "").trim();
    if (!txt) return "?";
    const parts = txt.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() || "").join("") || txt[0].toUpperCase();
  }
  const myName = user?.userName || user?.email || "";

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h1>Grand Leaderboard</h1>
        <p>Challenge your skills and climb the ranks.</p>
      </div>

      {loading ? (
        <p className={styles.loading}>Loading leaderboard…</p>
      ) : error ? (
        <p className={styles.errorMsg}>{error}</p>
      ) : (
        <>
          <div className={styles.podiumContainer}>
            <div className={`${styles.podiumItem} ${styles.silver}`}>
              {podium[1] ? (
                <div className={styles.podiumContent}>
                  <div className={styles.avatar}>{initialsOf(nameOf(podium[1]))}</div>
                  <div className={styles.place}>#2</div>
                  <div className={styles.name}>{nameOf(podium[1])}</div>
                  <div className={styles.score}>{scoreOf(podium[1])} pts</div>
                </div>
              ) : <div className={styles.empty}>No Challenger</div>}
            </div>

            <div className={`${styles.podiumItem} ${styles.gold}`}>
              {podium[0] ? (
                <div className={styles.podiumContent}>
                  <div className={styles.crown}>Champion</div>
                  <div className={styles.avatar}>{initialsOf(nameOf(podium[0]))}</div>
                  <div className={styles.place}>#1</div>
                  <div className={styles.name}>{nameOf(podium[0])}</div>
                  <div className={styles.score}>{scoreOf(podium[0])} pts</div>
                </div>
              ) : <div className={styles.empty}>No Champion</div>}
            </div>

            <div className={`${styles.podiumItem} ${styles.bronze}`}>
              {podium[2] ? (
                <div className={styles.podiumContent}>
                  <div className={styles.avatar}>{initialsOf(nameOf(podium[2]))}</div>
                  <div className={styles.place}>#3</div>
                  <div className={styles.name}>{nameOf(podium[2])}</div>
                  <div className={styles.score}>{scoreOf(podium[2])} pts</div>
                </div>
              ) : <div className={styles.empty}>No Contender</div>}
            </div>
          </div>

          <div className={styles.listContainer}>
            <h2>All Rankings</h2>
            <div className={styles.listHeader}>
              <div className={styles.colRank}>Rank</div>
              <div className={styles.colName}>Player</div>
              <div className={styles.colScore}>Score</div>
            </div>
            {others.map((row) => {
              const isMe = nameOf(row) === myName;
              return (
                <div key={`${nameOf(row)}-${rankOf(row)}`} className={`${styles.listRow} ${isMe ? styles.meRow : ""}`}>
                  <div className={styles.colRank}>#{rankOf(row)}</div>
                  <div className={styles.playerCol}>
                    <div className={styles.listAvatar}>{initialsOf(nameOf(row))}</div>
                    <div className={styles.colName}>{nameOf(row)}</div>
                  </div>
                  <div className={styles.colScore}>{scoreOf(row)} pts</div>
                </div>
              );
            })}
            {me ? (
              <div className={styles.meSummary}>
                <span className={styles.meIcon}>🏅</span>
                <span>
                  You are ranked <strong>#{me.rank ?? me.Rank}</strong> with <strong>{me.totalScore ?? me.TotalScore}</strong> points.
                </span>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
