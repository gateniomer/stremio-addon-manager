import { useState } from "react";
import { IconMail, IconLock, IconGitHub } from "./Icons";

/**
 * Login / Register form with mode toggle.
 */
export default function LoginForm({ loading, onSubmit }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gdpr, setGdpr] = useState({ tos: false, privacy: false });

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ mode, email, password, gdpr });
  }

  return (
    <div className="login-card">
      <div className="login-brand">
        <img className="login-logo" src="pwa-192x192.png" alt="" />
        <h2>Stremio Addon Manager</h2>
        <p className="login-subtitle">Sync and manage your Stremio addons</p>
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === "login" ? "active" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`mode-btn ${mode === "register" ? "active" : ""}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <IconMail className="input-icon" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <IconLock className="input-icon" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {mode === "register" && (
          <div className="gdpr">
            <label className="consent-label">
              <input
                type="checkbox"
                checked={gdpr.tos}
                onChange={(e) => setGdpr({ ...gdpr, tos: e.target.checked })}
              />
              I accept the <a href="https://www.stremio.com/tos" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            </label>
            <label className="consent-label">
              <input
                type="checkbox"
                checked={gdpr.privacy}
                onChange={(e) => setGdpr({ ...gdpr, privacy: e.target.checked })}
              />
              I accept the <a href="https://www.stremio.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
            </label>
          </div>
        )}

        <button type="submit" className="btn-primary btn-full" disabled={loading}>
          {loading ? "Working..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <a className="login-github" href="https://github.com/gateniomer/stremio-addon-manager" target="_blank" rel="noopener noreferrer">
        <IconGitHub /> View on GitHub
      </a>
    </div>
  );
}
