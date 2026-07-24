import { useState } from "react";
import { IconX, IconStar, IconDownload, IconUpload, IconTrash } from "./Icons";
import { addonKey, PLACEHOLDER_IMG } from "../utils/addon";

/**
 * Favorites management modal — list, add by URL, import, export, remove.
 */
export default function FavManagerModal({ favorites, onRemove, onAddByUrl, onImport, onExport, onClose }) {
  const [url, setUrl] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  async function handleAdd() {
    if (!url.trim()) return;
    setAddLoading(true);
    try {
      await onAddByUrl(url.trim());
      setUrl("");
    } finally {
      setAddLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><IconStar className="header-icon" /> Favorites</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        {/* Add by URL */}
        <div className="fav-add-row">
          <input
            type="url"
            className="modal-input"
            placeholder="Add by manifest URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <button className="btn-primary" onClick={handleAdd} disabled={addLoading || !url.trim()}>
            {addLoading ? "..." : "Add"}
          </button>
        </div>

        {/* Action bar */}
        <div className="fav-actions">
          <button className="btn-sm" onClick={onImport}><IconDownload /> Import</button>
          <button className="btn-sm" onClick={onExport} disabled={favorites.length === 0}><IconUpload /> Export</button>
        </div>

        {/* Favorites list */}
        <div className="modal-body modal-fav-list">
          {favorites.length === 0 ? (
            <p className="modal-empty">No favorites yet.</p>
          ) : (
            favorites.map((fav, i) => {
              const key = addonKey(fav);
              const m = fav.manifest || {};
              return (
                <div key={key || i} className="fav-manage-row">
                  <img className="fav-thumb" src={m.logo || PLACEHOLDER_IMG} alt="" onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                  <div className="fav-manage-info">
                    <span className="fav-name">{m.name || "Unknown"}</span>
                    {m.version && <span className="fav-version">v{m.version}</span>}
                  </div>
                  <button className="fav-remove" onClick={() => onRemove(key)} title="Remove">
                    <IconTrash />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
