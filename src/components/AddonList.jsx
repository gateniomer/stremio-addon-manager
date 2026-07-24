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
  loading,
  onToggleSelect,
  onToggleFav,
  onReorder,
  onOpenAddModal,
  onOpenDetail,
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

  /* Handle drag end — compute new order */
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = addons.findIndex((a) => addonKey(a) === active.id);
    const newIndex = addons.findIndex((a) => addonKey(a) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(oldIndex, newIndex);
  }, [addons, onReorder]);

  /* Loading */
  if (loading) {
    return (
      <div className="addon-list">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="addon-card skeleton-card">
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
        ))}
      </div>
    );
  }

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
                onOpenDetail={() => onOpenDetail(addon)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
