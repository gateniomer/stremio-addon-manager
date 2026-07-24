import { useState } from "react";
import { IconX, IconStar, IconPlus, IconRefresh } from "./Icons";

let sessionDismissed = false;

export default function OnboardingModal({ onDontShowAgain }) {
  const [dismissed, setDismissed] = useState(sessionDismissed);

  if (dismissed) return null;

  function dismiss() {
    sessionDismissed = true;
    setDismissed(true);
  }

  return (
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Welcome, Stremio User!</h2>
          <button className="modal-close" onClick={dismiss}><IconX /></button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Manage your Stremio addons right from the browser.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-3)" }}>
            <Step icon={<IconRefresh />} title="Manage your collection" desc="Log in to load your Stremio addons. Reload anytime to fetch the latest list from your account." />
            <Step icon={<IconPlus />} title="Add, remove & reorder" desc="Paste a manifest URL to add addons, drag to reorder, or remove unwanted ones. Select addons and sync to push changes to Stremio." />
            <Step icon={<IconStar />} title="Favorites, import & export" desc="Star addons to bookmark them. Import/export your addon list as a JSON file for backup or sharing." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => { onDontShowAgain(); setDismissed(true); }}>Don't show again</button>
          <button className="btn-primary" onClick={() => setDismissed(true)}>Got it</button>
        </div>
      </div>
    </div>
  );
}

function Step({ icon, title, desc }) {
  return (
    <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "flex-start" }}>
      <span style={{ flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)" }}>{icon}</span>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
      </div>
    </div>
  );
}
