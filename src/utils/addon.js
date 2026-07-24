/**
 * Returns a stable unique key for an addon.
 * Prefers transportUrl, falls back to manifest.id.
 */
export function addonKey(addon) {
  return addon?.transportUrl || addon?.manifest?.id || "";
}

/**
 * Default placeholder SVG for missing addon logos.
 */
export const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='10' fill='%232a2a3e'/%3E%3Crect x='14' y='14' width='20' height='20' rx='4' fill='none' stroke='%23555577' stroke-width='1.5'/%3E%3Ccircle cx='22' cy='22' r='3' fill='%23555577'/%3E%3Cpath d='M14 30l6-6 4 4 4-4 6 6' fill='none' stroke='%23555577' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";
