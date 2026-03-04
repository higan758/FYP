import React from "react";

const icons = {
  book: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 5a3 3 0 0 1 3-3h11v17H7a3 3 0 0 0-3 3V5z" stroke="currentColor" strokeWidth="2" />
      <path d="M7 2v17" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  trophy: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M8 21h8M12 17a5 5 0 0 0 5-5V4H7v8a5 5 0 0 0 5 5z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 6a3 3 0 0 0 3 3h0M20 6a3 3 0 0 1-3 3h0" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  sword: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 21l5-5m3-3 10-10-5 5-5 5-3 3" stroke="currentColor" strokeWidth="2" />
      <path d="M7 16l3 3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  chart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 20V4M8 20v-8M12 20v-4M16 20v-12M20 20v-6" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

export default function Icon({ name, color = "currentColor", style }) {
  const el = icons[name] || null;
  if (!el) return null;
  return React.cloneElement(el, { style: { color, ...style } });
}
