import { createContext, useContext } from 'react';

/** CategoryMenu 협동 서브모달(`fixed`)의 `getBoundingClientRect()` — 편집 패널을 그 아래에 붙일 때 사용 */
export type CollabSubModalAnchorRect = { left: number; bottom: number; width: number };

export const CollabSubModalAnchorContext = createContext<CollabSubModalAnchorRect | null>(null);

export function useCollabSubModalAnchor() {
  return useContext(CollabSubModalAnchorContext);
}
