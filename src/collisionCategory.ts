import type { PanelData, CollisionEntityListItem, CollisionExpectedAreaItem, CollisionShapeSettings } from './panelData';
import { COLLISION_CATEGORY_KEYS, type CollisionCategoryId } from './panelData';

export type { CollisionCategoryId };

export function getCollisionEntityList(p: PanelData, cat: CollisionCategoryId): CollisionEntityListItem[] {
  return p[COLLISION_CATEGORY_KEYS[cat].listKey];
}

export function getCollisionSelectedIdx(p: PanelData, cat: CollisionCategoryId): number | null {
  return p[COLLISION_CATEGORY_KEYS[cat].idxKey] as number | null;
}

export function getExpectedAreasForSelectedEntity(p: PanelData, cat: CollisionCategoryId): CollisionExpectedAreaItem[] {
  const { listKey, idxKey } = COLLISION_CATEGORY_KEYS[cat];
  const idx = p[idxKey] as number | null;
  const list = p[listKey] as CollisionEntityListItem[];
  if (idx === null || idx < 0 || idx >= list.length) return [];
  return list[idx].expectedAreas;
}

export function findCollisionAreaInCategory(
  p: PanelData,
  cat: CollisionCategoryId,
  areaId: string | null,
): CollisionExpectedAreaItem | null {
  if (!areaId) return null;
  for (const ent of getCollisionEntityList(p, cat)) {
    const a = ent.expectedAreas.find((x) => x.id === areaId);
    if (a) return a;
  }
  return null;
}

export function patchCollisionAreaShapeDetail(
  p: PanelData,
  cat: CollisionCategoryId,
  areaId: string,
  patch: Partial<CollisionShapeSettings>,
): PanelData {
  const { listKey, idxKey } = COLLISION_CATEGORY_KEYS[cat];
  const idx = p[idxKey] as number | null;
  if (idx === null) return p;
  const list = [...(p[listKey] as CollisionEntityListItem[])];
  const ent = list[idx];
  if (!ent) return p;
  const nextAreas = ent.expectedAreas.map((a) =>
    a.id === areaId ? { ...a, shapeDetail: { ...a.shapeDetail, ...patch } } : a,
  );
  list[idx] = { ...ent, expectedAreas: nextAreas };
  return { ...p, [listKey]: list };
}

export function mapSelectedEntityExpectedAreas(
  p: PanelData,
  cat: CollisionCategoryId,
  mapFn: (a: CollisionExpectedAreaItem) => CollisionExpectedAreaItem,
): PanelData {
  const { listKey, idxKey } = COLLISION_CATEGORY_KEYS[cat];
  const idx = p[idxKey] as number | null;
  if (idx === null || idx < 0) return p;
  const list = [...(p[listKey] as CollisionEntityListItem[])];
  const ent = list[idx];
  if (!ent) return p;
  list[idx] = { ...ent, expectedAreas: ent.expectedAreas.map(mapFn) };
  return { ...p, [listKey]: list };
}

/** 엔티티 선택 변경 시, 선택 충돌 부위가 새 엔티티에 없으면 해제 */
export function setSelectedEntityIndex(
  p: PanelData,
  cat: CollisionCategoryId,
  nextIdx: number,
): PanelData {
  const { listKey, idxKey } = COLLISION_CATEGORY_KEYS[cat];
  const list = p[listKey] as CollisionEntityListItem[];
  const ent = list[nextIdx];
  const areas = ent?.expectedAreas ?? [];
  const sel = p.selectedCollisionAreaId;
  const keep = sel != null && areas.some((a) => a.id === sel);
  return { ...p, [idxKey]: nextIdx, selectedCollisionAreaId: keep ? sel : null };
}
