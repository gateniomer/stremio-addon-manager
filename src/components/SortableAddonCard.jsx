import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddonCard from "./AddonCard";

/**
 * Wraps AddonCard with dnd-kit sortable behavior.
 * The grip handle becomes the drag activator.
 */
export default function SortableAddonCard({ id, addon, isSelected, isFav, isInstalled, onToggleSelect, onToggleFav }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <AddonCard
        addon={addon}
        isSelected={isSelected}
        isFav={isFav}
        isInstalled={isInstalled}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onToggleSelect={onToggleSelect}
        onToggleFav={onToggleFav}
      />
    </div>
  );
}
