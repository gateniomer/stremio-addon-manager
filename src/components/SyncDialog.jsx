import { IconX, IconPlus, IconTrash } from "./Icons";

/**
 * Custom sync confirmation dialog (replaces window.confirm).
 */
export default function SyncDialog({ count, added, removed, loading, onConfirm, onCancel }) {
  const hasChanges = (added && added.length > 0) || (removed && removed.length > 0);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Sync to Stremio</h2>
          <button className="modal-close" onClick={onCancel}><IconX /></button>
        </div>
        <div className="modal-body modal-confirm">
          <p>You are about to sync <strong>{count} addon(s)</strong> to your Stremio account.</p>
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
          <p className="text-muted">Your Stremio catalog will be updated to match.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm} disabled={loading}>
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
