import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddonCard from "./AddonCard";

export default function SortableAddonCard({ id, addon, isSelected, isFav, isInstalled, onToggleSelect, onToggleFav, onOpenDetail, cardIndex, showDropTop, showDropBottom }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.3 : undefined,
    animationDelay: `${(cardIndex || 0) * 30}ms`,
  };

  const skeleton = (
    <div className="addon-card skeleton-card drop-skeleton">
      <span className="skeleton skeleton-grip" />
      <span className="skeleton skeleton-thumb" />
      <div className="addon-info">
        <div className="addon-name-row">
          <span className="skeleton skeleton-name" />
          <span className="skeleton skeleton-version" />
        </div>
        <div className="addon-badges">
          <span className="skeleton skeleton-badge" />
        </div>
        <p className="skeleton skeleton-desc" />
      </div>
      <div className="addon-actions">
        <span className="skeleton skeleton-action-btn" />
        <span className="skeleton skeleton-action-btn" />
        <span className="skeleton skeleton-action-btn" />
      </div>
    </div>
  );

  return (
    <>
      {showDropTop && skeleton}
      <div ref={setNodeRef} style={style} className="sortable-card">
        <AddonCard
          addon={addon}
          isSelected={isSelected}
          isFav={isFav}
          isInstalled={isInstalled}
          dragHandleProps={{ ...attributes, ...listeners }}
          onToggleSelect={onToggleSelect}
          onToggleFav={onToggleFav}
          onOpenDetail={onOpenDetail}
        />
      </div>
      {showDropBottom && skeleton}
    </>
  );
}
