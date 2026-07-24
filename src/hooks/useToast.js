import { useState, useCallback, useRef } from "react";

let _id = 0;

/**
 * Toast notification hook.
 * Returns [toasts, addToast, removeToast].
 */
export function useToast(durationMs = 3000) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current[id] = setTimeout(() => removeToast(id), durationMs);
    return id;
  }, [durationMs, removeToast]);

  return [toasts, addToast, removeToast];
}
