import type { Dispatch, SetStateAction } from 'react';
import { patchCollisionAreaShapeDetail } from './collisionCategory';
import type { CollisionShapeSettings, CollisionCategoryId, PanelData } from './panelData';

export function patchCollisionShape(
  setData: Dispatch<SetStateAction<PanelData>>,
  selectedAreaId: string | null,
  patch: Partial<CollisionShapeSettings>,
  categoryId: CollisionCategoryId,
) {
  if (!selectedAreaId) {
    setData((p) => ({
      ...p,
      collisionShapeDefaults: { ...p.collisionShapeDefaults, ...patch },
    }));
  } else {
    setData((p) => patchCollisionAreaShapeDetail(p, categoryId, selectedAreaId, patch));
  }
}
