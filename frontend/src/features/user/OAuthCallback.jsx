import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";

export default function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const [error, setError] = useState("");
  const ranRef = useRef(false);

  useEffect(() => {
    // Guard against React 18 StrictMode double-invoking effects in dev
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError("Token not found in callback URL.");
      return;
    }

    (async () => {
      try {
        await loginWithToken(token);
        navigate("/dashboard", { replace: true });
      } catch (e) {
        setError(e?.message || "Login failed.");
      }
    })();
  }, [location.search, loginWithToken, navigate]);

  if (error) {
    return (
      <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
        <h2>OAuth Callback Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/login", { replace: true })}>Back to Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>Signing you in...</h2>
      <p>Please wait.</p>
    </div>
  );
}