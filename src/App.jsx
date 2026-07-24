import { useState, useRef, useEffect } from "react";
import { login, register, getAddons, syncAddons } from "./stremioApi";
import { addonKey } from "./utils/addon";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useToast } from "./hooks/useToast";

/* Components */
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import SavedAccounts from "./components/SavedAccounts";
import AddonToolbar from "./components/AddonToolbar";
import AddonList from "./components/AddonList";
import AddAddonModal from "./components/AddAddonModal";
import FavManagerModal from "./components/FavManagerModal";
import SyncDialog from "./components/SyncDialog";
import AddonDetailModal from "./components/AddonDetailModal";
import ToastContainer from "./components/ToastContainer";
import OnboardingModal from "./components/OnboardingModal";

import "./App.css";

/* ─────────────────────────────────────────────────
 * App root — manages auth, addons, favorites.
 * ───────────────────────────────────────────────── */

/* Official Stremio addons list */
const OFFICIAL_ADDONS = [
  { id: "com.linvo.cinemeta", name: "Cinemeta", version: "4.2.3", description: "Cinemeta - The official Stremio addon for movies, series and anime catalogs", types: ["movie", "series", "anime"], catalogs: [{ type: "movie", id: "top", name: "Top" }, { type: "movie", id: "trending", name: "Trending" }, { type: "movie", id: "top_rated", name: "Top Rated" }, { type: "movie", id: "popular", name: "Popular" }, { type: "series", id: "top", name: "Top" }, { type: "series", id: "trending", name: "Trending" }, { type: "series", id: "top_rated", name: "Top Rated" }, { type: "series", id: "popular", name: "Popular" }], resources: ["catalog"], idPrefixes: ["tt"], logo: "https://images.cinemeta.strem.io/cinemeta.png", background: "https://stremio-images.s3.us-east-1.amazonaws.com/cinemeta.jpg", behaviorHints: { configurable: true, configurationRequired: false }, transportUrl: "https://v3-cinemeta.strem.io/manifest.json" },
  { id: "com.linvo.stremiochannels", name: "YouTube", version: "1.3.0", description: "YouTube Channels addon for Stremio", types: ["channel"], catalogs: [{ type: "channel", id: "trending", name: "Trending" }], resources: ["catalog"], logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg", background: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7", transportUrl: "https://v3-channels.strem.io/manifest.json" },
  { id: "org.stremio.watchhub", name: "WatchHub", version: "2.0.0", description: "WatchHub - Add links to popular streaming services", types: ["movie", "series"], resources: ["stream"], idPrefixes: ["tt"], logo: "https://watchhub.com/images/watchhub-logo.png", background: "https://images.unsplash.com/photo-1574375927938-d5a98e8d7e28", transportUrl: "https://watchhub.strem.io/manifest.json" },
  { id: "org.stremio.pubdomainmovies", name: "Public Domain Movies", version: "1.0.0", description: "A collection of public domain movies", types: ["movie"], resources: ["catalog", "stream"], catalogs: [{ type: "movie", id: "most-popular", name: "Most Popular" }], idPrefixes: ["tt"], logo: "https://images.stremio.com/publicdomainmovies.png", transportUrl: "https://caching.stremio.net/publicdomainmovies.now.sh/manifest.json" },
  { id: "org.stremio.opensubtitlesv3", name: "OpenSubtitles v3", version: "1.0.4", description: "OpenSubtitles v3 — the largest OpenSubtitles community", types: ["movie", "series"], resources: ["subtitles"], idPrefixes: ["tt"], logo: "https://images.stremio.com/opensubtitles.jpg", transportUrl: "https://opensubtitles-v3.strem.io/manifest.json" },
  { id: "org.stremio.opensubtitles", name: "OpenSubtitles", version: "1.0.0", description: "OpenSubtitles", types: ["movie", "series"], resources: ["subtitles"], idPrefixes: ["tt"], logo: "https://images.stremio.com/opensubtitles.jpg", transportUrl: "https://opensubtitles.strem.io/stremio/v1" },
];

export default function App() {
  /* ── Persisted state ─────────────────────────── */
  const [accounts, setAccounts] = useLocalStorage("stremio_accounts", []);
  const [favorites, setFavorites] = useLocalStorage("stremio_favorites", []);
  const [authKey, setAuthKey] = useLocalStorage("stremio_auth_key", null);
  const [onboardingDone, setOnboardingDone] = useLocalStorage("stremio_onboarding_done", false);

  /* ── Ephemeral state ─────────────────────────── */
  const [addons, setAddonsState] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [installedKeys, setInstalledKeys] = useState(new Set());
  const [loading, setLoading] = useState(!!authKey);
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Modal state ─────────────────────────────── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFavModal, setShowFavModal] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [syncChanges, setSyncChanges] = useState({ added: [], removed: [] });
  const [detailAddon, setDetailAddon] = useState(null);

  /* ── Toasts ──────────────────────────────────── */
  const [toasts, addToast, removeToast] = useToast();

  /* ── Refs ────────────────────────────────────── */
  const initRef = useRef(false);
  const favFileRef = useRef(null);
  const addonFileRef = useRef(null);

  /* ── Helpers ─────────────────────────────────── */
  function loadAddons(list) {
    setAddonsState(list);
    setSelected(new Set(list.map(addonKey)));
  }

  /* ── Auto-login on mount ─────────────────────── */
  useEffect(() => {
    if (!initRef.current && authKey) {
      initRef.current = true;
      loginWithKey(authKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auth ────────────────────────────────────── */
  async function loginWithKey(key) {
    setLoading(true);
    try {
      const list = await getAddons(key);
      setAuthKey(key);
      setInstalledKeys(new Set(list.map(addonKey)));
      loadAddons(list);
      const email = accounts.find((a) => a.authKey === key)?.email || "";
      addToast(`Logged in as ${email}`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Login failed", "error");
      setAuthKey(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginSubmit({ mode, email, password, gdpr }) {
    setLoading(true);
    try {
      let key;
      if (mode === "register") {
        if (!gdpr.tos || !gdpr.privacy) {
          addToast("You must accept Terms and Privacy Policy", "error");
          setLoading(false);
          return;
        }
        key = await register(email, password, { ...gdpr, marketing: false, from: "stremio-addon-manager" });
        addToast("Account created", "success");
      } else {
        key = await login(email, password);
      }
      setAuthKey(key);
      if (!accounts.some((a) => a.email === email)) {
        setAccounts((prev) => [...prev, { email, authKey: key }]);
      }
      const list = await getAddons(key);
      setInstalledKeys(new Set(list.map(addonKey)));
      loadAddons(list);
      if (mode === "login") addToast(`Logged in as ${email}`, "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setAuthKey(null);
    setAddonsState([]);
    setSelected(new Set());
    addToast("Logged out", "info");
  }

  function handleRemoveAccount(email) {
    setAccounts((prev) => prev.filter((a) => a.email !== email));
    addToast(`Removed ${email}`, "info");
  }

  /* ── Addons ──────────────────────────────────── */
  async function handleReload() {
    if (!authKey) return;
    setLoading(true);
    try {
      const list = await getAddons(authKey);
      setInstalledKeys(new Set(list.map(addonKey)));
      loadAddons(list);
      addToast("Addons reloaded", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Reload failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReorder(from, to) {
    setAddonsState((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  function toggleSelect(key) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  function selectAll() { setSelected(new Set(addons.map(addonKey))); }
  function deselectAll() { setSelected(new Set()); }

  /* ── Add addon by URL ────────────────────────── */
  async function handleAddAddonUrl(url) {
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
    setShowAddModal(false);
  }

  /* ── Add from favorites ──────────────────────── */
  function handleAddFromFavs(favKeys) {
    let added = 0, skipped = 0;
    for (const fav of favorites) {
      const key = addonKey(fav);
      if (favKeys.has(key)) {
        if (!addons.some((a) => addonKey(a) === key)) {
          setAddonsState((prev) => [...prev, fav]);
          added++;
        } else { skipped++; }
        setSelected((prev) => new Set([...prev, key]));
      }
    }
    const msgs = [];
    if (added) msgs.push(`Added ${added} addon(s)`);
    if (skipped) msgs.push(`${skipped} already in list`);
    addToast(msgs.join(", ") || "No addons selected", added ? "success" : "info");
    setShowAddModal(false);
  }

  /* ── Favorites ───────────────────────────────── */
  function toggleFav(addon) {
    const key = addonKey(addon);
    setFavorites((prev) => {
      const exists = prev.some((a) => addonKey(a) === key);
      return exists ? prev.filter((a) => addonKey(a) !== key) : [...prev, addon];
    });
  }

  function removeFav(key) {
    setFavorites((prev) => prev.filter((a) => addonKey(a) !== key));
  }

  async function addFavByUrl(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);
    const manifest = await resp.json();
    if (!manifest.id) throw new Error("Invalid manifest: missing id");
    const newFav = { transportUrl: url, manifest };
    const key = addonKey(newFav);
    if (favorites.some((a) => addonKey(a) === key)) {
      addToast("Already in favorites", "info");
    } else {
      setFavorites((prev) => [...prev, newFav]);
      addToast(`Added ${manifest.name || url} to favorites`, "success");
    }
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
        setFavorites((prev) => {
          const keys = new Set(prev.map(addonKey));
          const next = [...prev];
          for (const f of imported) {
            const k = addonKey(f);
            if (k && !keys.has(k)) { next.push(f); added++; }
          }
          return next;
        });
        addToast(`Imported ${added} favorite(s)`, added ? "success" : "info");
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Import failed", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function exportFavorites() {
    if (favorites.length === 0) { addToast("No favorites to export", "error"); return; }
    const blob = new Blob([JSON.stringify({ favorites }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stremio-favorites.json";
    a.click();
    URL.revokeObjectURL(a.href);
    addToast(`Exported ${favorites.length} favorites`, "success");
  }

  /* ── Import / Export addons ──────────────────── */
  function importAddonsFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        const imported = data.addons || data;
        if (authKey) {
          const server = await getAddons(authKey);
          setInstalledKeys(new Set(server.map(addonKey)));
          const serverKeys = new Set(server.map(addonKey));
          const fresh = imported.filter((a) => !serverKeys.has(addonKey(a)));
          loadAddons([...server, ...fresh]);
          addToast(`Imported ${fresh.length} new, ${server.length} from server`, "success");
        } else {
          loadAddons(imported);
          addToast(`Imported ${imported.length} addons`, "success");
        }
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Import failed", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function exportAddons() {
    const sel = addons.filter((a) => selected.has(addonKey(a)));
    if (sel.length === 0) { addToast("No addons selected", "error"); return; }
    const blob = new Blob([JSON.stringify({ addons: sel }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stremio-addons.json";
    a.click();
    URL.revokeObjectURL(a.href);
    addToast(`Exported ${sel.length} addons`, "success");
  }

  /* ── Restore official addons ─────────────────── */
  function handleRestoreOfficial() {
    const currentKeys = new Set(addons.map(addonKey));
    const toAdd = OFFICIAL_ADDONS
      .filter((oa) => !currentKeys.has(addonKey(oa)))
      .map((oa) => ({ transportUrl: oa.transportUrl, manifest: oa }));
    if (toAdd.length === 0) {
      addToast("All official addons already in list", "info");
      return;
    }
    setAddonsState((prev) => [...prev, ...toAdd]);
    setSelected((prev) => new Set([...prev, ...toAdd.map(addonKey)]));
    addToast(`Added ${toAdd.length} official addon(s)`, "success");
  }

  /* ── Sync ────────────────────────────────────── */
  function handleSyncConfirm() {
    const sel = addons.filter((a) => selected.has(addonKey(a)));
    setLoading(true);
    syncAddons(authKey, sel)
      .then(() => getAddons(authKey))
      .then((list) => {
        setInstalledKeys(new Set(list.map(addonKey)));
        loadAddons(list);
        addToast(`Synced ${sel.length} addons`, "success");
        setShowSyncDialog(false);
      })
      .catch((err) => {
        addToast(err instanceof Error ? err.message : "Sync failed", "error");
      })
      .finally(() => setLoading(false));
  }

  /* ── Render ──────────────────────────────────── */
  const loggedInEmail = accounts.find((a) => a.authKey === authKey)?.email || "";
  const selCount = addons.filter((a) => selected.has(addonKey(a))).length;

  /* ── Logged-out view ─────────────────────────── */
  if (!authKey) {
    return (
      <main className="container">
        <LoginForm loading={loading} onSubmit={handleLoginSubmit} />
        <SavedAccounts accounts={accounts} loading={loading} onLogin={loginWithKey} onRemove={handleRemoveAccount} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />

        {!onboardingDone && (
          <OnboardingModal
            onDontShowAgain={() => setOnboardingDone(true)}
          />
        )}
      </main>
    );
  }

  /* ── Logged-in view ──────────────────────────── */
  return (
    <main className="container">
      <Header
        email={loggedInEmail}
        onLogout={handleLogout}
        onImport={() => addonFileRef.current?.click()}
        onExport={exportAddons}
        onRestoreOfficial={handleRestoreOfficial}
        onOpenFavManager={() => setShowFavModal(true)}
        favCount={favorites.length}
      />

      <AddonToolbar
        addons={addons}
        selected={selected}
        loading={loading}
        onSearch={setSearchQuery}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onOpenAddModal={() => setShowAddModal(true)}
        onSync={() => {
          if (selCount > 0) {
            const added = addons
              .filter((a) => selected.has(addonKey(a)) && !installedKeys.has(addonKey(a)))
              .map((a) => a.manifest?.name || "Unknown");
            const removedKeys = [...installedKeys].filter((k) => !selected.has(k));
            const removed = removedKeys.map((k) => {
              const a = addons.find((x) => addonKey(x) === k);
              return a?.manifest?.name || k;
            });
            setSyncChanges({ added, removed });
            setShowSyncDialog(true);
          }
        }}
        onReload={handleReload}
      />

      <AddonList
        addons={addons}
        selected={selected}
        favorites={favorites}
        installedKeys={installedKeys}
        searchQuery={searchQuery}
        loading={loading}
        onToggleSelect={toggleSelect}
        onToggleFav={toggleFav}
        onReorder={handleReorder}
        onOpenAddModal={() => setShowAddModal(true)}
        onOpenDetail={(addon) => setDetailAddon(addon)}
      />

      {/* Hidden file inputs */}
      <input ref={addonFileRef} type="file" accept=".json" onChange={importAddonsFile} style={{ display: "none" }} />
      <input ref={favFileRef} type="file" accept=".json" onChange={importFavoritesFile} style={{ display: "none" }} />

      {/* Modals */}
      {showAddModal && (
        <AddAddonModal
          favorites={favorites}
          onAddByUrl={handleAddAddonUrl}
          onAddFromFavs={handleAddFromFavs}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showFavModal && (
        <FavManagerModal
          favorites={favorites}
          onRemove={removeFav}
          onAddByUrl={addFavByUrl}
          onImport={() => { favFileRef.current?.click(); }}
          onExport={exportFavorites}
          onClose={() => setShowFavModal(false)}
        />
      )}

      {showSyncDialog && (
        <SyncDialog
          count={selCount}
          added={syncChanges.added}
          removed={syncChanges.removed}
          loading={loading}
          onConfirm={handleSyncConfirm}
          onCancel={() => { setShowSyncDialog(false); setSyncChanges({ added: [], removed: [] }); }}
        />
      )}

      {detailAddon && (
        <AddonDetailModal
          addon={detailAddon}
          onClose={() => setDetailAddon(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {!onboardingDone && (
        <OnboardingModal
          onDontShowAgain={() => setOnboardingDone(true)}
        />
      )}
    </main>
  );
}
