import { useState, useRef, useEffect } from "react";
import { IconMore, IconPower, IconGitHub, IconDownload, IconUpload, IconPackage, IconStar } from "./Icons";

/**
 * App header — logo, title, user email, and overflow menu (with logout as last option).
 */
export default function Header({ email, onLogout, onImport, onExport, onRestoreOfficial, onOpenFavManager, favCount }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  /* Close menu on click outside */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <header className="header">
      <div className="header-brand">
        <img className="header-logo" src="pwa-64x64.png" alt="" />
        <h1 className="header-title">Stremio Addon Manager</h1>
      </div>
      <div className="header-user">
        <a
          className="header-github"
          href="https://github.com/gateniomer/stremio-addon-manager"
          target="_blank"
          rel="noopener noreferrer"
          title="Star on GitHub"
        >
          <IconGitHub />
        </a>
        <div className="header-avatar">{initial}</div>
        <span className="header-email">{email}</span>

        <div className="header-menu-container" ref={menuRef}>
          <button
            className={`header-menu-btn ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Menu"
          >
            <IconMore />
          </button>
          {menuOpen && (
            <div className="dropdown header-dropdown">
              {onImport && (
                <button onClick={() => { onImport(); setMenuOpen(false); }}>
                  <IconDownload /> Import
                </button>
              )}
              {onExport && (
                <button onClick={() => { onExport(); setMenuOpen(false); }}>
                  <IconUpload /> Export
                </button>
              )}
              {onRestoreOfficial && (
                <button onClick={() => { onRestoreOfficial(); setMenuOpen(false); }}>
                  <IconPackage /> Restore Official
                </button>
              )}
              {onOpenFavManager && (
                <button onClick={() => { onOpenFavManager(); setMenuOpen(false); }}>
                  <IconStar /> Favorites{favCount != null ? ` (${favCount})` : ""}
                </button>
              )}
              {(onImport || onExport || onRestoreOfficial || onOpenFavManager) && <hr />}
              <button
                className="dropdown-danger"
                onClick={() => { onLogout(); setMenuOpen(false); }}
              >
                <IconPower /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
