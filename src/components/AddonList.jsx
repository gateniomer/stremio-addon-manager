import { useMemo, useCallback } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableAddonCard from "./SortableAddonCard";
import { addonKey } from "../utils/addon";
import { IconPlus } from "./Icons";

/**
 * Addon list with dnd-kit drag-reorder, search filtering, and empty state.
 */
export default function AddonList({
  addons,
  selected,
  favorites,
  installedKeys,
  searchQuery,
  onToggleSelect,
  onToggleFav,
  onReorder,
  onOpenAddModal,
}) {
  /* dnd-kit sensors — MouseSensor for desktop, TouchSensor with long delay for mobile */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  /* Filter by search query */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return addons;
    const q = searchQuery.toLowerCase();
    return addons.filter((a) => {
      const m = a.manifest || {};
      return (
        (m.name || "").toLowerCase().includes(q) ||
        (m.description || "").toLowerCase().includes(q) ||
        (a.transportUrl || "").toLowerCase().includes(q)
      );
    });
  }, [addons, searchQuery]);

  /* Stable IDs for sortable context */
  const itemIds = useMemo(() => filtered.map((a) => addonKey(a) || String(a)), [filtered]);

  /* Disable scroll-behavior: smooth during drag so dnd-kit autoscroll works instantly */
  const handleDragStart = useCallback(() => {
    document.documentElement.style.scrollBehavior = "auto";
  }, []);

  /* Handle drag end — compute new order and restore smooth scroll */
  const handleDragEnd = useCallback((event) => {
    document.documentElement.style.scrollBehavior = "";
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = addons.findIndex((a) => addonKey(a) === active.id);
    const newIndex = addons.findIndex((a) => addonKey(a) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(oldIndex, newIndex);
  }, [addons, onReorder]);

  /* Empty state */
  if (addons.length === 0) {
    return (
      <div className="empty-state">
        <img className="empty-logo" src="pwa-192x192.png" alt="" />
        <h3>No addons yet</h3>
        <p>Add your first addon to get started.</p>
        <button className="btn-primary" onClick={onOpenAddModal}>
          <IconPlus /> Add Addon
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="empty-state empty-subtle">
        <p>No addons match &quot;{searchQuery}&quot;</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={{
        acceleration: 30,
        thresholds: { x: 0, y: 0.15 },
        interval: 10,
      }}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="addon-list">
          {filtered.map((addon) => {
            const key = addonKey(addon);
            return (
              <SortableAddonCard
                key={key}
                id={key}
                addon={addon}
                isSelected={selected.has(key)}
                isFav={favorites.some((f) => addonKey(f) === key)}
                isInstalled={installedKeys.has(key)}
                onToggleSelect={() => onToggleSelect(key)}
                onToggleFav={() => onToggleFav(addon)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
