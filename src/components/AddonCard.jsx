import { PLACEHOLDER_IMG } from "../utils/addon";
import { IconGrip, IconStar, IconCheck } from "./Icons";

/**
 * Single addon card — displays logo, name, version, badges, star, checkbox.
 * Receives dragHandleProps from the parent sortable wrapper.
 */
export default function AddonCard({
  addon,
  isSelected,
  isFav,
  isInstalled,
  dragHandleProps,
  onToggleSelect,
  onToggleFav,
}) {
  const manifest = addon.manifest || {};
  const name = manifest.name || "Unknown";
  const version = manifest.version;
  const official = addon.flags?.official;

  return (
    <div className="addon-card">
      {/* Drag handle */}
      <span className="addon-grip" title="Drag to reorder" {...dragHandleProps}>
        <IconGrip />
      </span>

      {/* Thumbnail */}
      <img
        className="addon-thumb"
        src={manifest.logo || PLACEHOLDER_IMG}
        alt=""
        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
      />

      {/* Info */}
      <div className="addon-info">
        <div className="addon-name-row">
          <span className="addon-name">{name}</span>
          {official && <span className="badge badge-official">Official</span>}
          {!official && <span className="badge badge-user">User</span>}
          {isInstalled && <span className="badge badge-installed">Installed</span>}
          {version && <span className="addon-version">v{version}</span>}
        </div>
        {manifest.description && (
          <p className="addon-desc">{manifest.description}</p>
        )}
      </div>

      {/* Star toggle */}
      <button
        className={`addon-star ${isFav ? "active" : ""}`}
        onClick={onToggleFav}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <IconStar filled={isFav} />
      </button>

      {/* Selection checkbox */}
      <label className="addon-check" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
        />
        <span className="checkmark">
          <IconCheck />
        </span>
      </label>
    </div>
  );
}
