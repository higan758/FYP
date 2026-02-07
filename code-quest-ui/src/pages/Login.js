import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      // If your backend expects { email, password } OR { userName, password },
      // send both safely (backend will ignore unknown field).
      await login({
        email: emailOrUsername,
        userName: emailOrUsername,
        password,
      });

      nav("/lessons");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Login</h1>

      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <label>Email or Username</label>
          <input
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <div className="auth-actions">
          <button type="submit">Login</button>
          <span>
            No account? <Link to="/register">Register</Link>
          </span>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}
      </form>
    </div>
  );
}
