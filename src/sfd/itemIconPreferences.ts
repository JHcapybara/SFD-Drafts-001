/**
 * 항목별 아이콘 인덱스·방향(화살표 등) — 사용자가 한 번 알려주면 여기 반영해 두고,
 * 이후에는 이 파일만 보면 됩니다. (에이전트/사람 공용 소스 오브 트루스)
 *
 * 실제 매핑은 코드에도 반영됨: `CategoryMenu` OBJECT_ROW_ICON_INDEX, `panelData` COLLAB_BODY_PART_ICON_INDEX,
 * `SfdChevronIcons`(055 기본 위), `CollisionSubmodalContent` PRIMITIVE_ICONS 등.
 */

export type IconScreenDirection = 'right' | 'down' | 'left' | 'up';

/** 에셋 기본이 오른쪽(→)일 때 화면 방향으로 맞추는 회전각(deg) */
export const ICON_DIRECTION_TO_ROTATION_DEG: Record<IconScreenDirection, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

export type ItemIconPreference = {
  iconIndex: number;
  /** 화살표·방향성 아이콘만. 한 번 정하면 같은 항목에 다시 묻지 않도록 여기 유지 */
  direction?: IconScreenDirection;
};

/**
 * 항목 키 → 설정. 새 항목은 사용자가 인덱스(·필요 시 방향)를 알려주면 여기 추가합니다.
 */
export const ITEM_ICON_PREFERENCES: Record<string, ItemIconPreference> = {
  'chevron:accordion-dropdown': { iconIndex: 55, direction: 'up' },
  'workspace-header:logo': { iconIndex: 111 },
  'workspace-header:menu': { iconIndex: 58 },
  'workspace-header:undo': { iconIndex: 157 },
  'workspace-header:redo': { iconIndex: 157, direction: 'left' },
  'category-menu:manipulator': { iconIndex: 33 },
  'category-menu:endeffector': { iconIndex: 36 },
  'category-menu:motion': { iconIndex: 34 },
  'category-menu:collision': { iconIndex: 66 },
  'category-menu:collab': { iconIndex: 88 },
  'collision:primitive-cube': { iconIndex: 95 },
  'collision:primitive-cylinder': { iconIndex: 96 },
  'collision:primitive-halfSphere': { iconIndex: 94 },
  'collision:primitive-corner': { iconIndex: 158 },
  'collision:expected-area-box': { iconIndex: 95 },
  'collision:expected-area-cylinder': { iconIndex: 96 },
};

export function getItemIconPreference(itemKey: string): ItemIconPreference | undefined {
  return ITEM_ICON_PREFERENCES[itemKey];
}

/** preference + 기본 회전 없음 → `SfdIconByIndex`용 rotationDeg */
export function rotationDegForPreference(pref: ItemIconPreference): number {
  if (!pref.direction) return 0;
  return ICON_DIRECTION_TO_ROTATION_DEG[pref.direction];
}
