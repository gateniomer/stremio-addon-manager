import { useState } from "react";
import { IconTrash } from "./Icons";

/**
 * Saved accounts section — dropdown with login/remove.
 */
export default function SavedAccounts({ accounts, loading, onLogin, onRemove }) {
  const [selected, setSelected] = useState("");

  if (accounts.length === 0) return null;

  return (
    <div className="saved-accounts">
      <p className="section-label">Saved Accounts</p>
      <div className="account-row">
        <select
          className="account-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loading}
        >
          <option value="">Select account...</option>
          {accounts.map((a) => (
            <option key={a.email} value={a.email}>{a.email}</option>
          ))}
        </select>
        <div className="btn-row">
          <button
            className="btn-sm"
            disabled={loading || !selected}
            onClick={() => {
              const a = accounts.find((acc) => acc.email === selected);
              if (a) onLogin(a.authKey);
            }}
          >
            Go
          </button>
          <button
            className="btn-sm btn-ghost"
            disabled={loading || !selected}
            onClick={() => { onRemove(selected); setSelected(""); }}
            title="Remove account"
          >
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}
