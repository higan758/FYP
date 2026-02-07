import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ padding: 16 }}>
      <h1>CodeQuest</h1>
      <p>Gamified learning platform.</p>

      {isAuthenticated ? (
        <Link to="/lessons">Go to Lessons</Link>
      ) : (
        <Link to="/login">Login to start</Link>
      )}
    </div>
  );
}
