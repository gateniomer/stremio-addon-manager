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
export const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' rx='8' fill='%23343252'/%3E%3Ctext x='24' y='30' text-anchor='middle' font-size='18' fill='%23808080'%3E%3F%3C/text%3E%3C/svg%3E";
