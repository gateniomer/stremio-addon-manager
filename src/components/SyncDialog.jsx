import { IconX, IconAlertTriangle, IconPlus, IconTrash } from "./Icons";

/**
 * Custom sync confirmation dialog (replaces window.confirm).
 */
export default function SyncDialog({ count, added, removed, loading, onConfirm, onCancel }) {
  const hasChanges = (added && added.length > 0) || (removed && removed.length > 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><IconAlertTriangle className="header-icon" /> Sync to Stremio</h2>
          <button className="modal-close" onClick={onCancel}><IconX /></button>
        </div>
        <div className="modal-body modal-confirm">
          <p>This will <strong>replace</strong> your Stremio addon collection with <strong>{count} addon(s)</strong>.</p>
          {hasChanges && (
            <div className="sync-changes">
              {added?.length > 0 && (
                <div className="sync-group">
                  <span className="sync-label add"><IconPlus /> Add ({added.length})</span>
                  <div className="sync-items">
                    {added.map((name, i) => <span key={i} className="sync-item">{name}</span>)}
                  </div>
                </div>
              )}
              {removed?.length > 0 && (
                <div className="sync-group">
                  <span className="sync-label remove"><IconTrash /> Remove ({removed.length})</span>
                  <div className="sync-items">
                    {removed.map((name, i) => <span key={i} className="sync-item">{name}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}
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
