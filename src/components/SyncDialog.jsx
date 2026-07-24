import { IconX, IconAlertTriangle } from "./Icons";

/**
 * Custom sync confirmation dialog (replaces window.confirm).
 */
export default function SyncDialog({ count, loading, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><IconAlertTriangle className="header-icon" /> Sync to Stremio</h2>
          <button className="modal-close" onClick={onCancel}><IconX /></button>
        </div>
        <div className="modal-body modal-confirm">
          <p>This will <strong>replace</strong> your Stremio addon collection with <strong>{count} addon(s)</strong>.</p>
          <p className="text-muted">This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
