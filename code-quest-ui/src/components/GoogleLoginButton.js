import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";

export default function GoogleLoginButton({ onSuccess, onError }) {
  const { googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleCredentialResponse(credentialResponse) {
    setLoading(true);
    try {
      const result = await googleLogin(credentialResponse.credential);
      onSuccess?.(result);
    } catch (ex) {
      onError?.(ex.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? "none" : "auto" }}>
      <GoogleLogin
        onSuccess={handleCredentialResponse}
        onError={() => onError?.("Google login was cancelled")}
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}
