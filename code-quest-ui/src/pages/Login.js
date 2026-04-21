import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { tokenStorage } from "../auth/tokenStorage";
import PasswordInput from "../components/PasswordInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/auth.css";
import Toast from "../components/Toast";

function base64UrlDecode(str) {
  try {
    const pad = (s) => s + "=".repeat((4 - (s.length % 4)) % 4);
    const s = pad(str.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = atob(s);
    try {
      return decodeURIComponent(
        decoded.split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      );
    } catch {
      return decoded;
    }
  } catch {
    return "";
  }
}

function parseJwt(token) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = base64UrlDecode(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getRoleFromClaims(claims) {
  const c = claims || {};
  return c.role || c["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
}

function isAdminFromStoredToken() {
  const token = tokenStorage.get();
  if (!token) return false;
  const claims = parseJwt(token);
  const role = getRoleFromClaims(claims);
  return (role || "").toLowerCase() === "admin";
}

export default function Login() {
  const { login } = useAuth();
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

      const loggedInAsAdmin = isAdminFromStoredToken();

      setToastMsg(loggedInAsAdmin ? "You have logged in as Admin" : "You have logged in");
      setTimeout(() => {
        setToastMsg("");
        nav(loggedInAsAdmin ? "/admin" : "/lessons");
      }, 1200);
    } catch (ex) {
      setErr(ex.message);
    }
  }

  function handleGoogleSuccess() {
    const loggedInAsAdmin = isAdminFromStoredToken();
    setToastMsg(loggedInAsAdmin ? "You have logged in as Admin" : "Logged in with Google");
    setTimeout(() => {
      setToastMsg("");
      nav(loggedInAsAdmin ? "/admin" : "/lessons");
    }, 1200);
  }

  function handleGoogleError(msg) {
    setErr(msg);
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-header">
          <h1>Login</h1>
          <p>Continue your learning journey in CodeQuest.</p>
        </div>

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
    </div>
  );
}
