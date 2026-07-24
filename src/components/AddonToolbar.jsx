import { useState, useRef, useEffect } from "react";
import { IconSearch, IconPlus, IconRefresh, IconSync, IconDownload, IconUpload, IconMore, IconCheck, IconX, IconStar } from "./Icons";

/**
 * Toolbar with search, bulk actions, and sync.
 * Collapses overflow actions into a menu on mobile.
 */
export default function AddonToolbar({
  addons,
  selected,
  loading,
  favCount,
  onSearch,
  onSelectAll,
  onDeselectAll,
  onOpenAddModal,
  onSync,
  onReload,
  onImport,
  onExport,
  onOpenFavManager,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const selectedCount = addons.filter((a) => selected.has(a.transportUrl || a.manifest?.id || "")).length;

  /* Close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="toolbar">
      {/* Search */}
      <div className="toolbar-search">
        <IconSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search addons..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="toolbar-info">
        {selectedCount} of {addons.length} selected
      </div>

      <div className="toolbar-actions">
        <button className="toolbar-btn primary" onClick={onOpenAddModal} title="Add addon">
          <IconPlus /> <span className="btn-label">Add</span>
        </button>

        <button className="toolbar-btn accent" onClick={onSync} disabled={loading || selectedCount === 0} title="Sync to Stremio">
          <IconSync className={loading ? "spin" : ""} /> <span className="btn-label">Sync</span>
        </button>

        {/* Overflow menu (desktop: always visible, mobile: hamburger) */}
        <div className="toolbar-menu" ref={menuRef}>
          <button className="toolbar-btn" onClick={() => setMenuOpen(!menuOpen)} title="More actions">
            <IconMore />
          </button>
          {menuOpen && (
            <div className="dropdown">
              <button onClick={() => { onSelectAll(); setMenuOpen(false); }}><IconCheck /> Select All</button>
              <button onClick={() => { onDeselectAll(); setMenuOpen(false); }}><IconX /> Deselect All</button>
              <hr />
              <button onClick={() => { onOpenFavManager(); setMenuOpen(false); }}><IconStar /> Favorites ({favCount})</button>
              <button onClick={() => { onReload(); setMenuOpen(false); }}><IconRefresh /> Reload</button>
              <hr />
              <button onClick={() => { onImport(); setMenuOpen(false); }}><IconDownload /> Import</button>
              <button onClick={() => { onExport(); setMenuOpen(false); }}><IconUpload /> Export</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
