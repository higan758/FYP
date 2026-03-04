import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../components/PasswordInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [fullName, setFullName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      await register({
        fullName,
        userName,
        email,
        password,
      });

      nav("/login");
    } catch (ex) {
      setErr(ex.message);
    }
  }

  function handleGoogleSuccess() {
    nav("/lessons");
  }

  function handleGoogleError(msg) {
    setErr(msg);
  }

  return (
    <div className="auth-wrap">
      <h1>Register</h1>

      <form onSubmit={onSubmit}>
        <div className="auth-field">
          <label>Full Name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="auth-field">
          <label>Username</label>
          <input value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div className="auth-actions">
          <button type="submit" className="btn btn-primary">Create Account</button>
          <span>
            Have an account? <Link to="/login">Login</Link>
          </span>
        </div>

        {err ? <div className="auth-error">{err}</div> : null}
      </form>

      <div className="auth-divider"><span>or</span></div>

      <GoogleLoginButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
    </div>
  );
}
