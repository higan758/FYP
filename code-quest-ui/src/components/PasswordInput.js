import React, { useState } from "react";

export default function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="auth-field">
      <label>{label}</label>

      <div className="password-wrap">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 3l18 18" />
              <path d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58" />
              <path d="M9.88 5.09A9.77 9.77 0 0112 4c5.5 0 9.5 5.5 9.5 8 0 1.14-.83 2.83-2.3 4.4" />
              <path d="M6.62 6.62C4.41 8.07 2.5 10.58 2.5 12c0 2.5 4 8 9.5 8 1.44 0 2.78-.38 3.97-1.01" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M2.5 12S6.5 4 12 4s9.5 8 9.5 8-4 8-9.5 8S2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
