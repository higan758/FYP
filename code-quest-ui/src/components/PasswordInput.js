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
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
    </div>
  );
}
