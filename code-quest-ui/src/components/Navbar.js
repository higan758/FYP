import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #222" }}>
      <Link to="/">CodeQuest</Link>

      <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
        {isAuthenticated ? (
          <>
            <Link to="/lessons">Lessons</Link>
            <Link to="/dashboard">Dashboard</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
