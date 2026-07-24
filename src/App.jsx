import { useState, useRef, useCallback, useEffect } from "react";
import { login, register, getAddons, setAddons } from "./stremioApi";
import "./App.css";

const STORAGE_KEY = "stremio_accounts";
const FAVORITES_KEY = "stremio_favorites";
const AUTH_KEY = "stremio_auth_key";

function loadAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function addonKey(addon) {
  return addon.transportUrl || addon.manifest?.id || "";
}

function loadAuthKey() {
  try {
    return localStorage.getItem(AUTH_KEY) || null;
  } catch {
    return null;
  }
}

function saveAuthKey(key) {
  if (key) localStorage.setItem(AUTH_KEY, key);
  else localStorage.removeItem(AUTH_KEY);
}

let toastId = 0;

function App() {
  const [accounts, setAccounts] = useState(loadAccounts);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authKey, setAuthKey] = useState(loadAuthKey);
  const [addons, setAddonsState] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [mode, setMode] = useState("login");
  const [gdprConsent, setGdprConsent] = useState({ tos: false, privacy: false });
  const [installedKeys, setInstalledKeys] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [favorites, setFavorites] = useState(loadFavorites);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addUrl, setAddUrl] = useState("");
  const [addTab, setAddTab] = useState("url");
  const [addLoading, setAddLoading] = useState(false);
  const [selectedFavs, setSelectedFavs] = useState(new Set());
  const [showFavModal, setShowFavModal] = useState(false);
  const [favAddUrl, setFavAddUrl] = useState("");
  const [favAddLoading, setFavAddLoading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);
  const favFileInputRef = useRef(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && authKey) {
      initRef.current = true;
      loginWithKey(authKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  function toggleFavorite(addon) {
    const key = addonKey(addon);
    setFavorites((prev) => {
      const exists = prev.some((a) => addonKey(a) === key);
      const next = exists ? prev.filter((a) => addonKey(a) !== key) : [...prev, addon];
      saveFavorites(next);
      return next;
    });
  }

  function isFavorite(key) {
    return favorites.some((a) => addonKey(a) === key);
  }

  function removeFavorite(key) {
    setFavorites((prev) => {
      const next = prev.filter((a) => addonKey(a) !== key);
      saveFavorites(next);
      return next;
    });
  }

  function exportFavorites() {
    if (favorites.length === 0) {
      addToast("No favorites to export", "error");
      return;
    }
    const json = JSON.stringify({ favorites }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stremio-favorites.json";
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${favorites.length} favorites`, "success");
  }

  function importFavoritesFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const imported = data.favorites || data;
        if (!Array.isArray(imported)) throw new Error("Invalid format");
        let added = 0;
        let skipped = 0;
        setFavorites((prev) => {
          const existingKeys = new Set(prev.map(addonKey));
          const next = [...prev];
          for (const fav of imported) {
            const key = addonKey(fav);
            if (key && !existingKeys.has(key)) {
              next.push(fav);
              added++;
            } else {
              skipped++;
            }
          }
          saveFavorites(next);
          return next;
        });
        const msgs = [];
        if (added) msgs.push(`Imported ${added} favorite(s)`);
        if (skipped) msgs.push(`${skipped} already exist`);
        addToast(msgs.join(", ") || "No new favorites", added ? "success" : "info");
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Import failed", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function addFavoriteByUrl() {
    const url = favAddUrl.trim();
    if (!url) return;
    setFavAddLoading(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
      const manifest = await resp.json();
      if (!manifest.id) throw new Error("Invalid manifest: missing id");
      const newFav = { transportUrl: url, manifest };
      const key = addonKey(newFav);
      if (favorites.some((a) => addonKey(a) === key)) {
        addToast("Already in favorites", "info");
      } else {
        setFavorites((prev) => {
          const next = [...prev, newFav];
          saveFavorites(next);
          return next;
        });
        addToast(`Added ${manifest.name || url} to favorites`, "success");
      }
      setFavAddUrl("");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to add favorite", "error");
    } finally {
      setFavAddLoading(false);
    }
  }

  function addFavoritesToSelection() {
    let added = 0;
    let skipped = 0;
    for (const fav of favorites) {
      const key = addonKey(fav);
      if (selectedFavs.has(key)) {
        if (!addons.some((a) => addonKey(a) === key)) {
          setAddonsState((prev) => [...prev, fav]);
          added++;
        } else {
          skipped++;
        }
        setSelected((prev) => new Set([...prev, key]));
      }
    }
    const msgs = [];
    if (added) msgs.push(`Added ${added} addon(s)`);
    if (skipped) msgs.push(`${skipped} already in list`);
    addToast(msgs.join(", ") || "No addons selected", added ? "success" : "info");
    setSelectedFavs(new Set());
    setShowAddModal(false);
  }

  async function addAddonByUrl() {
    const url = addUrl.trim();
    if (!url) return;
    setAddLoading(true);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
      const manifest = await resp.json();
      if (!manifest.id) throw new Error("Invalid manifest: missing id");
      const newAddon = { transportUrl: url, manifest };
      const key = addonKey(newAddon);
      if (addons.some((a) => addonKey(a) === key)) {
        setSelected((prev) => new Set([...prev, key]));
        addToast("Addon already in list, selected", "info");
      } else {
        setAddonsState((prev) => [...prev, newAddon]);
        setSelected((prev) => new Set([...prev, key]));
        addToast(`Added ${manifest.name || url}`, "success");
      }
      setAddUrl("");
      setShowAddModal(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to add addon", "error");
    } finally {
      setAddLoading(false);
    }
  }

  function selectAll() {
    setSelected(new Set(addons.map(addonKey)));
  }

  function deselectAll() {
    setSelected(new Set());
  }

  function toggleAddon(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleDragStart(e, index) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (index !== dragOverIndex) setDragOverIndex(index);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    const fromIndex = dragIndex;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setAddonsState((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function loadAddons(list) {
    setAddonsState(list);
    setSelected(new Set(list.map(addonKey)));
  }

  async function loginWithKey(key) {
    setLoading(true);
    try {
      const addonList = await getAddons(key);
      setAuthKey(key);
      saveAuthKey(key);
      setInstalledKeys(new Set(addonList.map(addonKey)));
      loadAddons(addonList);
      const email = accounts.find((a) => a.authKey === key)?.email || "";
      addToast(`Logged in as ${email}`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : String(err) || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let key;
      if (mode === "register") {
        if (!gdprConsent.tos || !gdprConsent.privacy) {
          addToast("You must accept the Terms and Privacy Policy", "error");
          setLoading(false);
          return;
        }
        key = await register(email, password, { ...gdprConsent, marketing: false, from: "stremio-addon-manager" });
        addToast("Account created", "success");
      } else {
        key = await login(email, password);
      }
      if (!accounts.some((a) => a.email === email)) {
        const updated = [...accounts, { email, authKey: key }];
        setAccounts(updated);
        saveAccounts(updated);
      }
      const addonList = await getAddons(key);
      setAuthKey(key);
      saveAuthKey(key);
      setInstalledKeys(new Set(addonList.map(addonKey)));
      loadAddons(addonList);
      if (mode === "login") {
        addToast(`Logged in as ${email}`, "success");
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : String(err) || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveAccount(targetEmail) {
    const updated = accounts.filter((a) => a.email !== targetEmail);
    setAccounts(updated);
    saveAccounts(updated);
    addToast(`Removed ${targetEmail}`, "info");
  }

  function handleExport() {
    try {
      const selectedAddons = addons.filter((a) => selected.has(addonKey(a)));
      if (selectedAddons.length === 0) {
        addToast("No addons selected", "error");
        return;
      }
      const json = JSON.stringify({ addons: selectedAddons }, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stremio-addons.json";
      a.click();
      URL.revokeObjectURL(url);
      addToast(`Exported ${selectedAddons.length} addons`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : String(err) || "Export failed", "error");
    }
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        const importedAddons = data.addons || data;
        if (authKey) {
          const serverAddons = await getAddons(authKey);
          setInstalledKeys(new Set(serverAddons.map(addonKey)));
          const serverKeys = new Set(serverAddons.map(addonKey));
          const newFromImport = importedAddons.filter((a) => !serverKeys.has(addonKey(a)));
          loadAddons([...serverAddons, ...newFromImport]);
          addToast(`Imported ${newFromImport.length} new addon(s), ${serverAddons.length} from server`, "success");
        } else {
          setInstalledKeys(new Set());
          loadAddons(importedAddons);
          addToast(`Imported ${importedAddons.length} addons`, "success");
        }
      } catch (err) {
        addToast(err instanceof Error ? err.message : String(err) || "Import failed", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  async function handleSync() {
    if (!authKey) {
      addToast("You must be logged in to sync", "error");
      return;
    }
    const selectedAddons = addons.filter((a) => selected.has(addonKey(a)));
    if (selectedAddons.length === 0) {
      addToast("No addons selected", "error");
      return;
    }
    const confirmed = window.confirm(
      `This will replace your Stremio addon collection with ${selectedAddons.length} addon(s). Continue?`
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await setAddons(authKey, selectedAddons);
      setInstalledKeys(new Set(selectedAddons.map(addonKey)));
      addToast(`Synced ${selectedAddons.length} addons to Stremio`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : String(err) || "Sync failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAuthKey(null);
    saveAuthKey(null);
    setAddonsState([]);
    setSelected(new Set());
    setEmail("");
    setPassword("");
    addToast("Logged out", "info");
  }

  async function handleReload() {
    if (!authKey) return;
    setLoading(true);
    try {
      const addonList = await getAddons(authKey);
      setInstalledKeys(new Set(addonList.map(addonKey)));
      loadAddons(addonList);
      addToast("Addons reloaded", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : String(err) || "Reload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  if (!authKey) {
    return (
      <main className="container">
        <h1>Stremio Addon Manager</h1>

        {accounts.length > 0 && (
          <div className="account-section">
            <h2>Saved Accounts</h2>
            <div className="account-select-row">
              <select
                className="account-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                disabled={loading}
              >
                <option value="" disabled>Select account...</option>
                {accounts.map((account) => (
                  <option key={account.email} value={account.email}>
                    {account.email}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const account = accounts.find((a) => a.email === selectedAccount);
                  if (account) loginWithKey(account.authKey);
                }}
                disabled={loading || !selectedAccount}
              >
                Login
              </button>
              <button
                className="account-remove-btn"
                onClick={() => {
                  if (selectedAccount) {
                    handleRemoveAccount(selectedAccount);
                    setSelectedAccount("");
                  }
                }}
                disabled={loading || !selectedAccount}
              >
                Remove
              </button>
            </div>
            <div className="divider">or login with email</div>
          </div>
        )}

        <div className="login-card">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="mode-toggle">
              <button
                type="button"
                className={`mode-btn ${mode === "login" ? "active" : ""}`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`mode-btn ${mode === "register" ? "active" : ""}`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === "register" && (
              <div className="gdpr-consent">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={gdprConsent.tos}
                    onChange={(e) => setGdprConsent({ ...gdprConsent, tos: e.target.checked })}
                  />
                  I accept the <a href="https://www.stremio.com/tos" target="_blank" rel="noopener noreferrer">Terms of Service</a>
                </label>
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={gdprConsent.privacy}
                    onChange={(e) => setGdprConsent({ ...gdprConsent, privacy: e.target.checked })}
                  />
                  I accept the <a href="https://www.stremio.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                </label>
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Working..." : mode === "login" ? "Login" : "Register"}
            </button>
          </form>
      </div>

      <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
          ))}
        </div>
      </main>
    );
  }

  const visibleAddons = addons;
  const selectedCount = visibleAddons.filter((a) => selected.has(addonKey(a))).length;
  const loggedInEmail = accounts.find((a) => a.authKey === authKey)?.email || "";

  return (
    <main className="container">
      <h1>Stremio Addon Manager</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportFile}
        style={{ display: "none" }}
      />

      <div className="toolbar">
        <span className="logged-in-user">{loggedInEmail}</span>
        <div className="toolbar-actions">
          <button onClick={() => setShowFavModal(true)}>
            Favorites ({favorites.length})
          </button>
          <button onClick={handleReload} disabled={loading}>
            {loading ? "Reloading..." : "Reload"}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
          <button onClick={() => fileInputRef.current?.click()}>Import</button>
          <button onClick={handleExport} disabled={addons.length === 0}>
            Export
          </button>
          <button onClick={handleSync} disabled={loading || addons.length === 0}>
            {loading ? "Syncing..." : "Sync"}
          </button>
        </div>
      </div>

      <div className="addon-header">
        <p className="addon-count">
          {selectedCount} of {visibleAddons.length} addons selected
        </p>
        <div className="select-actions">
          <button className="select-btn" onClick={() => setShowAddModal(true)}>+ Add</button>
          <button className="select-btn" onClick={selectAll}>Select All</button>
          <button className="select-btn" onClick={deselectAll}>Deselect All</button>
        </div>
      </div>

      <div className="addon-list">
        {visibleAddons.map((addon, i) => {
          const key = addonKey(addon);
          const manifest = addon.manifest || {};
          const isOfficial = addon.flags?.official;
          const isDragging = dragIndex === i;
          const isDragOver = dragOverIndex === i;
          return (
            <div
              key={key || i}
              className={`addon-card ${isDragging ? "dragging" : ""} ${isDragOver ? "drag-over" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
            >
              <span className="addon-drag-handle" title="Drag to reorder">⠿</span>
              <img
                className="addon-thumb"
                src={manifest.logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"}
                alt=""
                onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"; }}
              />
              <label className="addon-checkbox-label">
                <input
                  type="checkbox"
                  className="addon-checkbox"
                  checked={selected.has(key)}
                  onChange={() => toggleAddon(key)}
                />
              </label>
              <div className="addon-info">
                <div className="addon-name">
                  {manifest.name || "Unknown Addon"}
                  <span className={`addon-badge ${isOfficial ? "badge-official" : "badge-user"}`}>
                    {isOfficial ? "Official" : "User"}
                  </span>
                  {installedKeys.has(key) && (
                    <span className="addon-badge badge-installed">Installed</span>
                  )}
                  <span className="addon-version">v{manifest.version || "?"}</span>
                </div>
                {manifest.description && (
                  <p className="addon-desc">{manifest.description}</p>
                )}
              </div>
              <button
                className={`addon-fav-btn ${isFavorite(key) ? "fav-active" : ""}`}
                onClick={() => toggleFavorite(addon)}
                title={isFavorite(key) ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite(key) ? "\u2605" : "\u2606"}
              </button>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Addon</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-tabs">
              <button
                className={`modal-tab ${addTab === "url" ? "active" : ""}`}
                onClick={() => setAddTab("url")}
              >
                By URL
              </button>
              <button
                className={`modal-tab ${addTab === "favorites" ? "active" : ""}`}
                onClick={() => setAddTab("favorites")}
              >
                From Favorites ({favorites.length})
              </button>
            </div>
            {addTab === "url" ? (
              <div className="modal-body">
                <input
                  type="url"
                  className="modal-input"
                  placeholder="Paste addon manifest URL..."
                  value={addUrl}
                  onChange={(e) => setAddUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addAddonByUrl(); }}
                  autoFocus
                />
                <button
                  className="modal-submit"
                  onClick={addAddonByUrl}
                  disabled={addLoading || !addUrl.trim()}
                >
                  {addLoading ? "Adding..." : "Add"}
                </button>
              </div>
            ) : (
              <div className="modal-body modal-fav-list">
                {favorites.length === 0 ? (
                  <p className="modal-empty">No favorites yet. Star addons to add them here.</p>
                ) : (
                  <>
                    {favorites.map((fav, i) => {
                      const favKey = addonKey(fav);
                      const favManifest = fav.manifest || {};
                      return (
                        <label key={favKey || i} className="modal-fav-item">
                          <input
                            type="checkbox"
                            className="addon-checkbox"
                            checked={selectedFavs.has(favKey)}
                            onChange={() => {
                              setSelectedFavs((prev) => {
                                const next = new Set(prev);
                                if (next.has(favKey)) next.delete(favKey);
                                else next.add(favKey);
                                return next;
                              });
                            }}
                          />
                          <img
                            className="modal-fav-thumb"
                            src={favManifest.logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"}
                            alt=""
                            onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"; }}
                          />
                          <span className="modal-fav-name">{favManifest.name || "Unknown"}</span>
                        </label>
                      );
                    })}
                    <div className="modal-fav-footer">
                      <button
                        className="modal-submit"
                        onClick={addFavoritesToSelection}
                        disabled={selectedFavs.size === 0}
                      >
                        Add {selectedFavs.size > 0 ? `(${selectedFavs.size})` : ""} Selected
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showFavModal && (
        <div className="modal-overlay" onClick={() => setShowFavModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Favorites</h2>
              <button className="modal-close" onClick={() => setShowFavModal(false)}>&times;</button>
            </div>

            <div className="fav-add-row">
              <input
                type="url"
                className="modal-input"
                placeholder="Add by manifest URL..."
                value={favAddUrl}
                onChange={(e) => setFavAddUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addFavoriteByUrl(); }}
              />
              <button
                className="modal-submit"
                onClick={addFavoriteByUrl}
                disabled={favAddLoading || !favAddUrl.trim()}
              >
                {favAddLoading ? "..." : "Add"}
              </button>
            </div>

            <div className="fav-action-bar">
              <button className="fav-action-btn" onClick={() => favFileInputRef.current?.click()}>
                Import
              </button>
              <button className="fav-action-btn" onClick={exportFavorites} disabled={favorites.length === 0}>
                Export
              </button>
            </div>

            <div className="modal-body modal-fav-list">
              {favorites.length === 0 ? (
                <p className="modal-empty">No favorites yet.</p>
              ) : (
                favorites.map((fav, i) => {
                  const favKey = addonKey(fav);
                  const favManifest = fav.manifest || {};
                  return (
                    <div key={favKey || i} className="fav-manage-item">
                      <img
                        className="modal-fav-thumb"
                        src={favManifest.logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"}
                        alt=""
                        onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='6' fill='%230f3460'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='20' fill='%23555'%3E%3F%3C/text%3E%3C/svg%3E"; }}
                      />
                      <div className="fav-manage-info">
                        <span className="modal-fav-name">{favManifest.name || "Unknown"}</span>
                        {favManifest.version && (
                          <span className="fav-manage-version">v{favManifest.version}</span>
                        )}
                      </div>
                      <button
                        className="fav-remove-btn"
                        onClick={() => removeFavorite(favKey)}
                        title="Remove from favorites"
                      >
                        &times;
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <input
        ref={favFileInputRef}
        type="file"
        accept=".json"
        onChange={importFavoritesFile}
        style={{ display: "none" }}
      />

      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
    </main>
  );
}

export default App;
