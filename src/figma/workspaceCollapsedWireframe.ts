/**
 * 워크스페이스 “기본 접힘” 와이어프레임 — 피그마 수동 배치 또는 TalkToFigma 등에 사용.
 * 코드 기준: WorkspaceChrome (LEFT_GNB, 하단 타임라인), chromeLayout (헤더 높이).
 *
 * 상태 가정:
 * - 헤더만 전체 폭 (상단 바)
 * - 좌측: flyout 없음 → GNB(56px)만
 * - 우측: 프로퍼티 패널 숨김 → 여백 12px
 * - 하단: 타임라인 패널 닫힘 → 재생 바만 (높이 74, 하단에서 8px)
 */
import { WORKSPACE_CONTENT_TOP_PX, WORKSPACE_HEADER_TOP_PX } from '../chromeLayout';

/** WorkspaceChrome과 동기화 */
export const LEFT_GNB_WIDTH_PX = 56;
export const BOTTOM_GAP_PX = 8;
export const BOTTOM_PLAYBAR_HEIGHT_PX = 74;
export const BOTTOM_PLAYBAR_MAX_WIDTH_PX = 460;
export const BOTTOM_PLAYBAR_MIN_WIDTH_PX = 300;
/** 우측 패널 없을 때 WorkspaceChrome `rightReserve` */
export const WORKSPACE_RIGHT_MARGIN_PX = 12;

export type WireRect = {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** 피그마 채우기 RGBA 0~1 */
  fill: { r: number; g: number; b: number; a: number };
  notes?: string;
};

function headerHeightPx(): number {
  return WORKSPACE_CONTENT_TOP_PX - WORKSPACE_HEADER_TOP_PX;
}

/** 접힌 상태 재생 바 가로 (앱과 동일 clamp) */
export function collapsedPlaybackBarWidthPx(viewportW: number): number {
  return Math.min(BOTTOM_PLAYBAR_MAX_WIDTH_PX, Math.max(BOTTOM_PLAYBAR_MIN_WIDTH_PX, viewportW - 24));
}

export function getWorkspaceCollapsedWireframeRects(viewportW: number, viewportH: number): {
  header: WireRect;
  leftGnb: WireRect;
  mainCanvas: WireRect;
  playbackBar: WireRect;
} {
  const hh = headerHeightPx();
  const playW = collapsedPlaybackBarWidthPx(viewportW);
  const playX = (viewportW - playW) / 2;
  const playY = viewportH - BOTTOM_GAP_PX - BOTTOM_PLAYBAR_HEIGHT_PX;
  const mainH = playY - hh;

  return {
    header: {
      name: 'Header',
      x: 0,
      y: 0,
      width: viewportW,
      height: hh,
      fill: { r: 8 / 255, g: 10 / 255, b: 14 / 255, a: 0.96 },
      notes: '고정 헤더 (브랜드·공정명·UI 모드 등)',
    },
    leftGnb: {
      name: 'Left · GNB only',
      x: 0,
      y: hh,
      width: LEFT_GNB_WIDTH_PX,
      height: viewportH - hh,
      fill: { r: 16 / 255, g: 17 / 255, b: 20 / 255, a: 0.8 },
      notes: '라이브러리/트리 flyout 닫힘',
    },
    mainCanvas: {
      name: 'Main · viewport',
      x: LEFT_GNB_WIDTH_PX,
      y: hh,
      width: viewportW - LEFT_GNB_WIDTH_PX - WORKSPACE_RIGHT_MARGIN_PX,
      height: mainH,
      fill: { r: 0.92, g: 0.93, b: 0.95, a: 1 },
      notes: '3D/캔버스 영역 (라이트 테마 기준 배경 예시)',
    },
    playbackBar: {
      name: 'Bottom · playback only',
      x: playX,
      y: playY,
      width: playW,
      height: BOTTOM_PLAYBAR_HEIGHT_PX,
      fill: { r: 10 / 255, g: 12 / 255, b: 16 / 255, a: 0.8 },
      notes: '타임라인 패널 접힘 — 중앙 플로팅 바',
    },
  };
}

/** 피그마에 붙여 넣기 좋은 JSON (개발자 도구에서 복사 등) */
export function workspaceCollapsedWireframeToJson(viewportW: number, viewportH: number): string {
  const r = getWorkspaceCollapsedWireframeRects(viewportW, viewportH);
  return JSON.stringify(
    { viewport: { width: viewportW, height: viewportH }, layers: Object.values(r) },
    null,
    2,
  );
}
