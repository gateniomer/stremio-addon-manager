import { IconPower } from "./Icons";

/**
 * App header — logo, title, user email, logout.
 */
export default function Header({ email, onLogout }) {
  const initial = email ? email.charAt(0).toUpperCase() : "?";
  return (
    <header className="header">
      <div className="header-brand">
        <img className="header-logo" src="pwa-64x64.png" alt="" />
        <h1 className="header-title">Addon Manager</h1>
      </div>
      <div className="header-user">
        <div className="header-avatar">{initial}</div>
        <span className="header-email">{email}</span>
        <button className="header-logout" onClick={onLogout} title="Logout">
          <IconPower />
        </button>
      </div>
    </header>
  );
}
