/**
 * 포인트 컬러 스킴: 통일(#FF8E2B)
 */

export const POINT_ORANGE = '#FF8E2B';

export type PointSchemeId = 'unified';

/** Objects 트리 / 패널 섹션용: 선택 오브젝트 기준 포인트 색 */
export function getObjectAccent(_objectId: string, _scheme: PointSchemeId): string {
  return POINT_ORANGE;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function accentRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 슬롯 선택 배경·테두리 (EE·충돌 리스트 등) */
export function accentSlotStyles(accentHex: string, isDark: boolean) {
  const a = accentHex;
  return {
    slotActiveBg: isDark ? accentRgba(a, 0.12) : accentRgba(a, 0.1),
    slotActiveBorder: accentRgba(a, 0.45),
  };
}

/** 통일 스킴에서 보조 강조(검정 계열) */
export const UNIFIED_MUTED = '#262626';
export const UNIFIED_MUTED_LIGHT = '#525252';
