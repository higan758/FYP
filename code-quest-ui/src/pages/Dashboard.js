import React, { useEffect, useState } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import ProgressBar from "../components/ProgressBar";
import Modal from "../components/Modal";
import "./Dashboard.css";

export default function Dashboard() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await http.get(endpoints.myProgress);

        if (!mounted) return;
        setProgress(Array.isArray(res) ? res : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load progress");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p>Loading progress…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>Dashboard</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Progress Dashboard</h1>

      {progress.length === 0 && <p>No attempts yet.</p>}

      {progress.map((quiz) => (
        <div
          key={quiz.id}
          className="quiz-card"
          onClick={() => setSelectedQuiz(quiz)}
        >
          <h3>{quiz.title}</h3>
          <p className="quiz-meta">Lesson ID: {quiz.lessonId}</p>

          {quiz.latestAttempt ? (
            <>
              <p>
                Score: {quiz.latestAttempt.score} /{" "}
                {quiz.latestAttempt.totalQuestions}
              </p>

              <ProgressBar
                value={quiz.latestAttempt.score}
                max={quiz.latestAttempt.totalQuestions}
                color="#4caf50"
              />

              <p>Player HP</p>
              <ProgressBar
                value={quiz.latestAttempt.playerHp}
                max={100}
                color="#2196f3"
              />

              <p>Enemy HP</p>
              <ProgressBar
                value={quiz.latestAttempt.enemyHp}
                max={100}
                color="#f44336"
              />

              <p>
                Result:{" "}
                <strong>{quiz.latestAttempt.result}</strong>
              </p>

              <p className="quiz-meta">
                {new Date(
                  quiz.latestAttempt.attemptedAt
                ).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="muted">No attempts yet</p>
          )}
        </div>
      ))}

      <Modal
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        title={`Attempt History — ${selectedQuiz?.title}`}
      >
        {selectedQuiz?.latestAttempt ? (
          <>
            <p>
              Score: {selectedQuiz.latestAttempt.score} /{" "}
              {selectedQuiz.latestAttempt.totalQuestions}
            </p>
            <p>Player HP: {selectedQuiz.latestAttempt.playerHp}</p>
            <p>Enemy HP: {selectedQuiz.latestAttempt.enemyHp}</p>
            <p>
              Result: <strong>{selectedQuiz.latestAttempt.result}</strong>
            </p>
          </>
        ) : (
          <p>No attempts yet.</p>
        )}
      </Modal>
    </div>
  );
}
