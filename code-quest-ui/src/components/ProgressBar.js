import React from "react";
import "./ProgressBar.css";

export default function ProgressBar({ value, max, color }) {
  const percent =
    max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="progress-bar">
      <div
        className="progress-bar__fill"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
