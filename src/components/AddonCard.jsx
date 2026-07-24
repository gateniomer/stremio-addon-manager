import { PLACEHOLDER_IMG } from "../utils/addon";
import { IconGrip, IconStar, IconCheck, IconInfo, IconTrash } from "./Icons";

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
  onOpenDetail,
  compact,
  onRemove,
  hideCheckbox,
}) {
  const manifest = addon.manifest || {};
  const name = manifest.name || "Unknown";
  const version = manifest.version;
  const official = addon.flags?.official;

  return (
    <div className="addon-card">
      {/* Drag handle */}
      {!compact && (
        <span className="addon-grip" title="Drag to reorder" {...dragHandleProps}>
          <IconGrip />
        </span>
      )}

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
          {version && <span className="addon-version">v{version}</span>}
        </div>
        <div className="addon-badges">
          {official && <span className="badge badge-official">Official</span>}
          {!official && <span className="badge badge-user">User</span>}
          {isInstalled && isSelected && <span className="badge badge-installed">Installed</span>}
          {isInstalled && !isSelected && <span className="badge badge-deleting">Deleting</span>}
          {!isInstalled && isSelected && <span className="badge badge-installing">Installing</span>}
        </div>
        {manifest.description && (
          <p className="addon-desc">{manifest.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="addon-actions">
        {!compact && (
          <button
            className={`addon-star ${isFav ? "active" : ""}`}
            onClick={onToggleFav}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <IconStar filled={isFav} />
          </button>
        )}

        {!compact && (
          <button
            className="addon-info-btn"
            onClick={(e) => { e.stopPropagation(); onOpenDetail?.(); }}
            title="View details"
          >
            <IconInfo />
          </button>
        )}

        {onRemove && (
          <button
            className="addon-remove-btn"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Remove"
          >
            <IconTrash />
          </button>
        )}

        {!hideCheckbox && (
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
        )}
      </div>
    </div>
  );
}
