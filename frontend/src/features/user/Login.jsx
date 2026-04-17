import React from "react";

const BACKEND_BASE_URL = "http://localhost:8081";

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial, sans-serif" }}>
      <h2>Login</h2>
      <p>Sign in using Google to access the Smart Campus system.</p>

      <button onClick={handleGoogleLogin} style={{ marginTop: 12 }}>
        Continue with Google
      </button>
    </div>
  );
}