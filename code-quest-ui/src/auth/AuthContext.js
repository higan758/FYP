import React, { createContext, useContext, useMemo, useState } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "./tokenStorage";

const AuthContext = createContext(null);

function extractToken(responseJson) {
  // Defensive: supports common token keys without breaking your backend.
  // If your backend uses a different key, add it here (frontend-only change).
  return (
    responseJson?.token ||
    responseJson?.accessToken ||
    responseJson?.jwt ||
    responseJson?.data?.token ||
    responseJson?.data?.accessToken ||
    null
  );
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get());
  const isAuthenticated = !!token;

  async function login(payload) {
    const res = await http.post(endpoints.login, payload);
    const t = extractToken(res);
    if (!t) {
      throw new Error(
        "Login succeeded but no token was found in response. Add the correct token key in extractToken()."
      );
    }
    tokenStorage.set(t);
    setToken(t);
    return res;
  }

  async function register(payload) {
    const res = await http.post(endpoints.register, payload);
    // Some backends return token on register, some don’t. If token exists, store it.
    const t = extractToken(res);
    if (t) {
      tokenStorage.set(t);
      setToken(t);
    }
    return res;
  }

  function logout() {
    tokenStorage.clear();
    setToken(null);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
