import { useState } from "react";
import { IconX, IconCopy, IconCheck } from "./Icons";
import { PLACEHOLDER_IMG } from "../utils/addon";

/**
 * Modal showing addon details: description, ID, URL, types.
 */
export default function AddonDetailModal({ addon, onClose }) {
  const m = addon.manifest || {};
  const name = m.name || "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{name}</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <div className="modal-body detail-body">
          <div className="detail-hero">
            <img
              className="detail-logo"
              src={m.logo || PLACEHOLDER_IMG}
              alt=""
              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
            />
          </div>

          {m.description && (
            <p className="detail-desc">{m.description}</p>
          )}

          <div className="detail-fields">
            <DetailField label="ID" value={m.id} />
            <DetailCopyField label="URL" value={addon.transportUrl} />
            {m.types?.length > 0 && (
              <DetailField label="Types" value={m.types.join(", ")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <span className="detail-field-value">{value}</span>
    </div>
  );
}

function DetailCopyField({ label, value }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  if (!value) return null;
  return (
    <div className="detail-field">
      <span className="detail-field-label">{label}</span>
      <div className="detail-copy-row">
        <span className="detail-field-value">{value}</span>
        <button className="detail-copy-btn" onClick={handleCopy} title="Copy to clipboard">
          {copied ? <IconCheck /> : <IconCopy />}
        </button>
      </div>
    </div>
  );
}
