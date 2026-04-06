/**
 * 프로퍼티 패널 전용 스케일 — 추후 공유 예정 **디자인 시스템 MD**와 맞출 것.
 *
 * 타이포 티어 (임시 기준):
 * - caption: 10px
 * - secondary: 11px
 * - body: 12px
 * - emphasis: 13–14px
 * - display (큰 수치): 18px
 *
 * 아이콘 픽셀 티어 (SfdIconByIndex·Lucide 정렬):
 * - sm 14 / md 16 / lg 20 — Lucide는 `w-3.5`·`w-4`·`w-5`에 대응
 * - Lucide `strokeWidth`: 2 고정
 */
export const PP_ICON_PX = {
  sm: 14,
  md: 16,
  lg: 20,
} as const;
