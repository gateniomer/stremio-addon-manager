import { useState } from "react";
import { IconX, IconStar, IconDownload, IconUpload } from "./Icons";
import { addonKey } from "../utils/addon";
import AddonCard from "./AddonCard";

/**
 * Favorites management modal — list, add by URL, import, export, remove.
 */
export default function FavManagerModal({ favorites, onRemove, onAddByUrl, onImport, onExport, onClose }) {
  const [url, setUrl] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  async   function handleRemove(key) {
    const fav = favorites.find((f) => addonKey(f) === key);
    const name = fav?.manifest?.name || "this addon";
    if (window.confirm(`Remove "${name}" from favorites?`)) {
      onRemove(key);
    }
  }

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
        <div className="fav-manage-actions">
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
              return (
                <AddonCard
                  key={key || i}
                  addon={fav}
                  onRemove={() => handleRemove(key)}
                  compact
                  hideCheckbox
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
