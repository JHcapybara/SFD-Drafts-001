/**
 * 항목별 아이콘 인덱스·방향(화살표 등) — 사용자가 한 번 알려주면 여기 반영해 두고,
 * 이후에는 이 파일만 보면 됩니다. (에이전트/사람 공용 소스 오브 트루스)
 *
 * 실제 매핑은 코드에도 반영됨: `CategoryMenu` OBJECT_ROW_ICON_INDEX, `panelData` COLLAB_BODY_PART_ICON_INDEX,
 * `WorkspaceChrome` 좌측 GNB(`workspace-gnb:*`), 헤더 플랜(`workspace-header:plan`), `SfdChevronIcons`(055 기본 위), `CollisionSubmodalContent` PRIMITIVE_ICONS 등.
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
  'workspace-header:scene-info': { iconIndex: 80 },
  /** 상단 헤더 플랜(프리미엄) 버튼 */
  'workspace-header:plan': { iconIndex: 186 },
  'workspace-header:comment': { iconIndex: 59 },
  'workspace-header:share': { iconIndex: 43 },
  'workspace-header:mypage': { iconIndex: 61 },
  'workspace-header:lang': { iconIndex: 62 },
  /** 좌측 GNB 모드 버튼 (`WorkspaceChrome`) */
  'workspace-gnb:library': { iconIndex: 45 },
  'workspace-gnb:tree': { iconIndex: 70 },
  'workspace-gnb:analysis': { iconIndex: 164 },
  'workspace-gnb:riskassessment': { iconIndex: 47 },
  'workspace-gnb:safetyai': { iconIndex: 197 },
  /** Safety AI 패널 사이드바 펼침/접힘 토글 */
  'safetyai:sidebar-toggle': { iconIndex: 198 },
  'library-section:robot': { iconIndex: 33 },
  'library-section:layout': { iconIndex: 83 },
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
