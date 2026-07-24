import { useState } from "react";
import { IconX, IconPlus, IconStar } from "./Icons";
import { addonKey, PLACEHOLDER_IMG } from "../utils/addon";

/**
 * Modal to add addons: by URL or from favorites.
 */
export default function AddAddonModal({ favorites, onAddByUrl, onAddFromFavs, onClose }) {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());

  async function handleAddUrl() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      await onAddByUrl(url.trim());
      setUrl("");
    } finally {
      setLoading(false);
    }
  }

  function handleAddFavs() {
    onAddFromFavs(selected);
    setSelected(new Set());
  }

  function toggleFav(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Addon</h2>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>

        <div className="modal-tabs">
          <button className={`modal-tab ${tab === "url" ? "active" : ""}`} onClick={() => setTab("url")}>
            <IconPlus /> By URL
          </button>
          <button className={`modal-tab ${tab === "favs" ? "active" : ""}`} onClick={() => setTab("favs")}>
            <IconStar /> From Favorites ({favorites.length})
          </button>
        </div>

        {tab === "url" ? (
          <div className="modal-body modal-url">
            <input
              type="url"
              className="modal-input"
              placeholder="Paste addon manifest URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddUrl(); }}
              autoFocus
            />
            <button className="btn-primary" onClick={handleAddUrl} disabled={loading || !url.trim()}>
              {loading ? "..." : "Add"}
            </button>
          </div>
        ) : (
          <div className="modal-body modal-fav-list">
            {favorites.length === 0 ? (
              <p className="modal-empty">No favorites yet. Star addons to add them here.</p>
            ) : (
              <>
                {favorites.map((fav, i) => {
                  const key = addonKey(fav);
                  const m = fav.manifest || {};
                  return (
                    <label key={key || i} className="fav-row">
                      <input
                        type="checkbox"
                        className="fav-check"
                        checked={selected.has(key)}
                        onChange={() => toggleFav(key)}
                      />
                      <img className="fav-thumb" src={m.logo || PLACEHOLDER_IMG} alt="" onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                      <span className="fav-name">{m.name || "Unknown"}</span>
                    </label>
                  );
                })}
                <div className="modal-footer">
                  <button className="btn-primary" onClick={handleAddFavs} disabled={selected.size === 0}>
                    Add {selected.size > 0 ? `(${selected.size})` : ""} Selected
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
