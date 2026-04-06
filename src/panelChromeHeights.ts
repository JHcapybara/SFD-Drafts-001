/**
 * PropertyPanel 상단 크롬과 CategoryMenu 헤더 높이를 맞추기 위한 값.
 * PropertyPanel: `pt-4 pb-3` 드래그 타이틀 행 + 1px 구분선 + `pt-2`·탭 `py-2` 카테고리 탭 행
 */
export const PROPERTY_PANEL_DRAG_HEADER_HEIGHT_PX = 58;
export const PROPERTY_PANEL_HEADER_TAB_DIVIDER_PX = 1;
export const PROPERTY_PANEL_CATEGORY_TAB_ROW_HEIGHT_PX = 41;

/** CategoryMenu 헤더(Objects 메타) 고정 높이 = 패널 상단 두 영역 + 구분선 */
export const CATEGORY_MENU_HEADER_RESERVE_PX =
  PROPERTY_PANEL_DRAG_HEADER_HEIGHT_PX +
  PROPERTY_PANEL_HEADER_TAB_DIVIDER_PX +
  PROPERTY_PANEL_CATEGORY_TAB_ROW_HEIGHT_PX;
