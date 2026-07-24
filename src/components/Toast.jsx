import { IconX } from "./Icons";

/**
 * Toast notification — slides in from bottom, auto-dismisses.
 */
export default function Toast({ toast, onDismiss }) {
  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onDismiss(toast.id)}>
      <span className="toast-msg">{toast.message}</span>
      <button className="toast-close" onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}>
        <IconX size={14} />
      </button>
    </div>
  );
}
