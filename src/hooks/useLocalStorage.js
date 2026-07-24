import { useState, useCallback } from "react";

/**
 * Generic localStorage-backed state hook.
 * @param {string} key - localStorage key
 * @param {Function} init - lazy initializer (called once)
 */
export function useLocalStorage(key, init) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : (typeof init === "function" ? init() : init);
    } catch {
      return typeof init === "function" ? init() : init;
    }
  });

  const set = useCallback((next) => {
    setValue((prev) => {
      const val = typeof next === "function" ? next(prev) : next;
      try {
        if (val === null || val === undefined) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(val));
      } catch { /* quota exceeded — silently ignore */ }
      return val;
    });
  }, [key]);

  return [value, set];
}
