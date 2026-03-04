import React, { createContext, useContext, useMemo, useState } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { tokenStorage } from "./tokenStorage";

const AuthContext = createContext(null);

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
  const roleKeys = [
    "role",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
  ];
  for (const k of roleKeys) {
    if (c[k]) return c[k];
  }
  return null;
}

function extractToken(responseJson) {
  return (
    responseJson?.Token ||
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
  const [user, setUser] = useState(() => {
    const t = tokenStorage.get();
    if (!t) return null;
    const claims = parseJwt(t);
    if (!claims) return null;
    return {
      userId: claims.sub || claims.nameid || null,
      userName: claims.username || claims.unique_name || null,
      email: claims.email || null,
      role: getRoleFromClaims(claims),
    };
  });
  const isAuthenticated = !!token;
  const isAdmin = !!(user?.role === "Admin");

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
    const claims = parseJwt(t);
    setUser({
      userId: claims?.sub || claims?.nameid || null,
      userName: claims?.username || claims?.unique_name || null,
      email: claims?.email || payload?.email || null,
      role: getRoleFromClaims(claims),
    });
    return res;
  }

  async function register(payload) {
    const res = await http.post(endpoints.register, payload);

    const t = extractToken(res);
    if (t) {
      tokenStorage.set(t);
      setToken(t);
      const claims = parseJwt(t);
      setUser({
        userId: claims?.sub || claims?.nameid || null,
        userName: claims?.username || claims?.unique_name || payload?.userName || null,
        email: claims?.email || payload?.email || null,
        role: getRoleFromClaims(claims),
      });
    }
    return res;
  }
  async function googleLogin(idToken) {
    const res = await http.post(endpoints.googleLogin, { idToken });
    const t = extractToken(res);
    if (!t) {
      throw new Error("Google login succeeded but no token was found in response.");
    }
    tokenStorage.set(t);
    setToken(t);
    const claims = parseJwt(t);
    setUser({
      userId: claims?.sub || claims?.nameid || null,
      userName: claims?.username || claims?.unique_name || null,
      email: claims?.email || null,
      role: getRoleFromClaims(claims),
    });
    return res;
  }
  function logout() {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isAdmin,
      login,
      register,
      googleLogin,
      logout,
    }),
    [token, user, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
