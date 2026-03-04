import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../components/PasswordInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/auth.css";
import Toast from "../components/Toast";

export default function Login() {
  const { login, isAdmin } = useAuth();
  const nav = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      await login({
        email: emailOrUsername,
        userName: emailOrUsername,
        password,
      });

      setToastMsg(isAdmin ? "You have logged in as Admin" : "You have logged in");
      setTimeout(() => {
        setToastMsg("");
        nav(isAdmin ? "/admin" : "/lessons");
      }, 1200);
    } catch (ex) {
      setErr(ex.message);
    }
  }

  function handleGoogleSuccess() {
    setToastMsg("Logged in with Google");
    setTimeout(() => {
      setToastMsg("");
      nav("/lessons");
    }, 1200);
  }

  function handleGoogleError(msg) {
    setErr(msg);
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

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="auth-actions">
          <button type="submit" className="btn btn-primary">Login</button>
          <span>
            No account? <Link to="/register">Register</Link>
          </span>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}
      </form>

      <div className="auth-divider"><span>or</span></div>

      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

      {toastMsg ? <Toast message={toastMsg} onClose={() => setToastMsg("")} /> : null}
    </div>
  );
}
