import { useState } from "react";
import { IconX, IconPlus, IconStar, IconCheckSquare } from "./Icons";
import { addonKey } from "../utils/addon";
import AddonCard from "./AddonCard";

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

  const allSelected = favorites.length > 0 && favorites.every((f) => selected.has(addonKey(f)));

  function toggleFav(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(favorites.map(addonKey)));
  }

  function deselectAll() {
    setSelected(new Set());
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
            <IconStar /> Favorites
          </button>
        </div>

        {tab === "url" ? (
          <div className="modal-body modal-url">
            <p className="modal-hint">Search online for Stremio addons and paste the manifest URL below.</p>
            <div className="modal-url-row">
              <input
                type="url"
                className="modal-input"
                placeholder="https://example.com/manifest.json"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddUrl(); }}
                autoFocus
              />
              <button className="btn-primary" onClick={handleAddUrl} disabled={loading || !url.trim()}>
                {loading ? "..." : "Add"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="fav-actions">
              <button className="btn-primary" onClick={handleAddFavs} disabled={selected.size === 0}>
                <IconPlus /> Add {selected.size > 0 ? `(${selected.size})` : ""} Selected
              </button>
              <div className="toolbar-right">
                <span className="toolbar-info">{selected.size} of {favorites.length} selected</span>
                <button
                  className={`toolbar-btn ${allSelected ? "active" : ""}`}
                  onClick={allSelected ? deselectAll : selectAll}
                  title={allSelected ? "Deselect all" : "Select all"}
                >
                  <IconCheckSquare />
                </button>
              </div>
            </div>
            <div className="modal-body modal-fav-list">
            {favorites.length === 0 ? (
              <p className="modal-empty">No favorites yet. Star addons to add them here.</p>
            ) : (
              favorites.map((fav, i) => {
                const key = addonKey(fav);
                return (
                  <AddonCard
                    key={key || i}
                    addon={fav}
                    isSelected={selected.has(key)}
                    onToggleSelect={() => toggleFav(key)}
                    compact
                  />
                );
              })
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
