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

  return (
    <>
      {showDropTop && <div className="drop-line" />}
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
      {showDropBottom && <div className="drop-line" />}
    </>
  );
}
