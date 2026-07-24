import { useState, useRef, useEffect, useMemo } from "react";
import { IconSearch, IconPlus, IconRefresh, IconCloudUpload, IconDownload, IconUpload, IconMore, IconCheckSquare, IconStar, IconPackage } from "./Icons";
import { addonKey } from "../utils/addon";

/**
 * Toolbar with search, bulk actions, and sync.
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
  onRestoreOfficial,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const allSelected = useMemo(() => addons.length > 0 && addons.every((a) => selected.has(addonKey(a))), [addons, selected]);
  const selectedCount = addons.filter((a) => selected.has(addonKey(a))).length;

  /* Close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <div className="toolbar">
      {/* Row 1: Search */}
      <div className="toolbar-search">
        <IconSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search addons..."
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Row 2: Selection info + actions */}
      <div className="toolbar-row">
        <div className="toolbar-actions">
          <button className="toolbar-btn primary" onClick={onOpenAddModal} title="Add addon">
            <IconPlus />
          </button>

          <button className="toolbar-btn" onClick={onOpenFavManager} title={`Favorites (${favCount})`}>
            <IconStar />
          </button>

          <button className="toolbar-btn" onClick={onReload} disabled={loading} title="Reload from server">
            <IconRefresh className={loading ? "spin" : ""} />
          </button>

          <button className="toolbar-btn accent" onClick={onSync} disabled={loading || selectedCount === 0} title="Sync to Stremio">
            <IconCloudUpload />
          </button>

          {/* Overflow menu */}
          <div className="toolbar-menu" ref={menuRef}>
            <button className="toolbar-btn" onClick={() => setMenuOpen(!menuOpen)} title="More actions">
              <IconMore />
            </button>
            {menuOpen && (
              <div className="dropdown">
                <button onClick={() => { onImport(); setMenuOpen(false); }}><IconDownload /> Import</button>
                <button onClick={() => { onExport(); setMenuOpen(false); }}><IconUpload /> Export</button>
                <button onClick={() => { onRestoreOfficial(); setMenuOpen(false); }}><IconPackage /> Restore Official</button>
              </div>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <span className="toolbar-info">
            {selectedCount} of {addons.length} selected
          </span>
          <button className={`toolbar-btn ${allSelected && addons.length > 0 ? "active" : ""}`} onClick={allSelected ? onDeselectAll : onSelectAll} title={allSelected ? "Deselect all" : "Select all"}>
            <IconCheckSquare />
          </button>
        </div>
      </div>
    </div>
  );
}
