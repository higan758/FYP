import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import PasswordInput from "../components/PasswordInput";
import GoogleLoginButton from "../components/GoogleLoginButton";
import "../styles/auth.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [err, setErr] = useState("");

  function validateForm(nextFormData) {
    const validationErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nextFormData.userName) {
      validationErrors.userName = "Username is required.";
    }

    if (!nextFormData.email) {
      validationErrors.email = "Email is required.";
    } else if (!emailRegex.test(nextFormData.email)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!nextFormData.password) {
      validationErrors.password = "Password is required.";
    } else if (nextFormData.password.length < 6) {
      validationErrors.password = "Password must be at least 6 characters.";
    }

    if (!nextFormData.confirmPassword) {
      validationErrors.confirmPassword = "Confirm password is required.";
    } else if (nextFormData.password !== nextFormData.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const trimmedFormData = {
      fullName: formData.fullName.trim(),
      userName: formData.userName.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    setFormData(trimmedFormData);

    if (!validateForm(trimmedFormData)) {
      return;
    }

    try {
      await register({
        fullName: trimmedFormData.fullName,
        userName: trimmedFormData.userName,
        email: trimmedFormData.email,
        password: trimmedFormData.password,
        confirmPassword: trimmedFormData.confirmPassword,
      });

      nav("/login");
    } catch (ex) {
      const backendErrors = ex?.data?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        const nextErrors = {};
        Object.entries(backendErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            const key = field.charAt(0).toLowerCase() + field.slice(1);
            nextErrors[key] = messages[0];
          }
        });
        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors);
        }
      }
      setErr(ex.message || "Registration failed. Please fix the errors and try again.");
    }
  }

  function handleGoogleSuccess() {
    nav("/lessons");
  }

  function handleGoogleError(msg) {
    setErr(msg);
  }

  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join CodeQuest and start leveling up your C# skills.</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="auth-field">
            <label>Full Name</label>
            <input
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label>Username</label>
            <input
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className={errors.userName ? "auth-input-error" : ""}
              aria-invalid={!!errors.userName}
            />
            {errors.userName ? <div className="auth-field-error">{errors.userName}</div> : null}
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              className={errors.email ? "auth-input-error" : ""}
              aria-invalid={!!errors.email}
            />
            {errors.email ? <div className="auth-field-error">{errors.email}</div> : null}
          </div>

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.confirmPassword}
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
    </div>
  );
}
