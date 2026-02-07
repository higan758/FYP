import React from "react";
import "../styles/lessons.css";

export default function LessonCard({ lesson, locked }) {
  return (
    <div className={`lesson-card ${locked ? "locked" : ""}`}>
      <div className="lesson-title">{lesson.title ?? "Untitled lesson"}</div>
      <div className="lesson-meta">
        {lesson.description ?? ""}
        <br />
        <small>
          Level: {lesson.levelNumber ?? lesson.level ?? "—"}
        </small>
      </div>

      {locked ? <div className="badge">Locked</div> : <div className="badge">Unlocked</div>}
    </div>
  );
}
