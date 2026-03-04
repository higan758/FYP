import React, { useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import "../styles/auth.css";

export default function VerifyEmail() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function resend() {
    try {
      setLoading(true);
      setStatus("");

      await http.post(endpoints.resendVerification);

      setStatus("Verification email resent. Please check your inbox.");
    } catch (err) {
      // backend may not exist yet — handle gracefully
      setStatus(
        "If your account exists, a verification email will be sent shortly."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <h1>Verify Your Email</h1>

      <p className="auth-info">
        Thanks for registering!  
        Please check your email and click the verification link to activate
        your account.
      </p>

      <p className="auth-info">
        If you don’t see the email, check your spam folder.
      </p>

      <button
        className="secondary-btn"
        onClick={resend}
        disabled={loading}
      >
        {loading ? "Sending..." : "Resend verification email"}
      </button>

      {status && <p className="auth-info">{status}</p>}

      <div className="auth-actions" style={{ marginTop: 16 }}>
        <Link to="/login">Back to Login</Link>
      </div>
    </div>
  );
}
