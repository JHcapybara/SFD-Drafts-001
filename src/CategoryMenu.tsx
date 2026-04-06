import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Eye, FileText, SlidersHorizontal } from 'lucide-react';
import { OBJECTS_MODAL_CONTEXT } from './menuData';
import { useLocale } from './localeContext';
import type { ObjectHeaderMeta } from './types';
import type { CollisionCategoryId, PanelData } from './panelData';
import { MotionSubmodalContent } from './MotionSubmodalContent';
import { MotionUploadSubmodalContent } from './MotionUploadSubmodalContent';
import { CollisionSubmodalContent } from './CollisionSubmodalContent';
import { CollabSubmodalContent } from './CollabSubmodalContent';
import { EndEffectorSubmodalContent } from './EndEffectorSubmodalContent';
import { ManipulatorSubmodalContent } from './ManipulatorSubmodalContent';
import { accentRgba, getObjectAccent, POINT_ORANGE } from './pointColorSchemes';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import { workspaceHeaderIconIndex } from './sfd/objectGroupHeaderIcon';

/** Objects 1뎁스 — `sfd-icon-2026` 파일 인덱스 */
const OBJECT_ROW_ICON_INDEX: Record<string, number> = {
  manipulator: 33,
  endeffector: 36,
  motion: 34,
  collision: 66,
  collab: 88,
};
import type { CollabSubModalAnchorRect } from './collabSubModalAnchorContext';

function rectsCloseEnough(
  a: CollabSubModalAnchorRect,
  b: CollabSubModalAnchorRect,
  eps = 0.5,
) {
  return (
    Math.abs(a.left - b.left) < eps &&
    Math.abs(a.bottom - b.bottom) < eps &&
    Math.abs(a.width - b.width) < eps
  );
}
import { CATEGORY_MENU_HEADER_RESERVE_PX } from './panelChromeHeights';

/** false로 바꾸면 이전처럼 항상 200px·라벨 항상 표시 */
export const CATEGORY_MENU_EXPAND_ON_HOVER_DEFAULT = true;

const EXPANDED_WIDTH = 200;
const COLLAPSED_WIDTH = 56;

/** 모션·충돌·협동 선택 시 서브 모달 (`fixed`, 프로퍼티 패널과 별도 이동 · 여백 부족 시 뷰포트 내 자동 보정) */
const SUB_MODAL_OBJECT_IDS = new Set(['motion', 'collision', 'collab']);
export const SUB_MODAL_WIDTH = 320;
export const SUB_MODAL_GAP = 8;
export const VIEWPORT_MARGIN = 8;
const SUB_MODAL_MIN_HEIGHT = 280;
const SUB_MODAL_MAX_HEIGHT = 900;

function computeSubModalPosition(menuRect: DOMRect, subWidth: number, subHeight: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = VIEWPORT_MARGIN;
  const gap = SUB_MODAL_GAP;
  const maxSubH = Math.min(subHeight, vh - 2 * margin);

  let left = menuRect.right + gap;
  if (left + subWidth > vw - margin) {
    const leftOfMenu = menuRect.left - gap - subWidth;
    if (leftOfMenu >= margin) {
      left = leftOfMenu;
    } else {
      left = Math.max(margin, Math.min(left, vw - subWidth - margin));
    }
  }

  let top = menuRect.top;
  if (top + maxSubH > vh - margin) {
    top = vh - margin - maxSubH;
  }
  top = Math.max(margin, top);

  return { left, top };
}

/** 프로퍼티 패널 기준 선호 위치는 우측. 오른쪽이 넘치면 패널 왼쪽으로 옮기지 않고 뷰포트 안으로만 클램프 */
function computeSubModalPositionDockedToPropertyPanel(
  panel: { left: number; top: number; width: number },
  subWidth: number,
  subHeight: number,
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = VIEWPORT_MARGIN;
  const gap = SUB_MODAL_GAP;
  const maxSubH = Math.min(subHeight, vh - 2 * margin);
  const panelRight = panel.left + panel.width;

  let left = panelRight + gap;
  if (left + subWidth > vw - margin) {
    left = Math.max(margin, Math.min(left, vw - subWidth - margin));
  }

  let top = panel.top;
  if (top + maxSubH > vh - margin) {
    top = vh - margin - maxSubH;
  }
  top = Math.max(margin, top);

  return { left, top };
}

interface CategoryMenuProps {
  theme?: 'dark' | 'light';
  initialX?: number;
  initialY?: number;
  selectedObjectId: string;
  onObjectChange: (objectId: string) => void;
  /** 프로퍼티 패널 열림/최소화 상태 */
  isPropertyPanelOpen?: boolean;
  /** 외부에서 위치를 제어할 때 사용. 제공되면 드래그가 비활성화되고 이 위치를 따름. */
  controlledPos?: { x: number; y: number };
  /**
   * true(기본): 접힘 상태는 아이콘만, 호버 시 펼쳐서 항목명 표시.
   * false: CATEGORY_MENU_EXPAND_ON_HOVER_DEFAULT 또는 이전 UX로 복귀.
   */
  expandOnHover?: boolean;
  /** 헤더 = 상위 로봇/셀 한 대 (목록 선택과 무관). 미전달 시 OBJECTS_MODAL_CONTEXT */
  workspaceContext?: ObjectHeaderMeta;
  /**
   * 전달 시 모션/충돌 서브 모달을 카테고리 메뉴가 아니라 프로퍼티 패널 우측에 붙임 (패널 드래그와 동기).
   * left/top = 패널 좌상단, width = 패널 너비(px).
   */
  subModalDockToPropertyPanel?: { left: number; top: number; width: number } | null;
  /** 모션 서브 모달에서 경로/속도 편집 (라이트 패널과 동기) */
  panelData?: PanelData;
  setPanelData?: Dispatch<SetStateAction<PanelData>>;
  /** 모션 리스트 선택 여부 → 서브모달 헤더(기본값 / 수정) — 생성 모션 탭 */
  motionSequenceSelectedId?: string | null;
  /** 프로퍼티 패널 모션 카테고리 탭: motion-generate | motion-upload */
  motionActiveCategoryId?: string | null;
  /** 업로드 모션 리스트 선택 키 — 업로드 탭 서브레이어 */
  selectedMotionUploadKey?: string | null;
  /** 충돌 객체: 활성 카테고리(로봇 등) — 서브모달 기본값/편집 모드 */
  collisionActiveCategoryId?: string | null;
  /** 엔드이펙터 객체: 활성 카테고리(기본/연결) */
  endeffectorActiveCategoryId?: string | null;
  /** 엔드이펙터 리스트 선택 인덱스 */
  eeSelectedIdx?: number | null;
  /** 협동 서브모달 DOM 위치 — CollabWorkspacePanel 편집 블록을 그 아래에 고정 배치할 때 사용 */
  onCollabSubModalLayoutChange?: (rect: CollabSubModalAnchorRect | null) => void;
}

// ── 디자인 토큰 ──────────────────────────────────
const DARK = {
  bg: 'rgba(16,17,20,0.85)',
  border: 'rgba(255,255,255,0.09)',
  shadow: '0 16px 40px rgba(0,0,0,0.5)',
  textPrimary: '#f0f0f0',
  textSecondary: '#777',
  itemHover: 'rgba(255,255,255,0.06)',
  activeItem: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
  objectTabBg: 'rgba(255,255,255,0.04)',
  objectTabActive: 'rgba(255,255,255,0.10)',
  grip: 'rgba(255,255,255,0.18)',
};

const LIGHT = {
  bg: 'rgba(252,252,253,0.94)',
  border: 'rgba(0,0,0,0.08)',
  shadow: '0 16px 40px rgba(0,0,0,0.12)',
  textPrimary: '#111',
  textSecondary: '#999',
  itemHover: 'rgba(0,0,0,0.04)',
  activeItem: 'rgba(0,0,0,0.06)',
  divider: 'rgba(0,0,0,0.06)',
  objectTabBg: 'rgba(0,0,0,0.03)',
  objectTabActive: 'rgba(0,0,0,0.07)',
  grip: 'rgba(0,0,0,0.16)',
};

export default function CategoryMenu({
  theme = 'dark',
  initialX = 24,
  initialY = 24,
  selectedObjectId,
  onObjectChange,
  isPropertyPanelOpen = true,
  controlledPos,
  expandOnHover = CATEGORY_MENU_EXPAND_ON_HOVER_DEFAULT,
  workspaceContext = OBJECTS_MODAL_CONTEXT,
  subModalDockToPropertyPanel = null,
  panelData,
  setPanelData,
  motionSequenceSelectedId = null,
  motionActiveCategoryId = null,
  selectedMotionUploadKey = null,
  collisionActiveCategoryId = null,
  endeffectorActiveCategoryId = null,
  eeSelectedIdx = null,
  onCollabSubModalLayoutChange,
}: CategoryMenuProps) {
  const { L, objects, pointScheme } = useLocale();
  const motionAccent = getObjectAccent('motion', pointScheme);
  const collisionAccent = getObjectAccent('collision', pointScheme);
  const collabAccent = getObjectAccent('collab', pointScheme);
  /** 업로드 조회 헤더 포인트 */
  const viewAccent = POINT_ORANGE;
  const tk = theme === 'light' ? LIGHT : DARK;
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  /** 비제어 모드: 펼쳤을 때의 좌상단 x (부모·도킹과 동일 기준) */
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragShiftXRef = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const headerMeta = workspaceContext;
  const headerTitle = headerMeta.objectName;

  const isCollapsed = expandOnHover && !hovered;
  const panelWidth = isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const collapseShiftX = isCollapsed ? EXPANDED_WIDTH - COLLAPSED_WIDTH : 0;

  const expandedAnchorX = controlledPos ? controlledPos.x : pos.x;
  const expandedAnchorY = controlledPos ? controlledPos.y : pos.y;
  const renderedLeft = expandedAnchorX + collapseShiftX;
  const renderedTop = expandedAnchorY;

  // controlledPos가 변경될 때 내부 위치를 동기화 (비제어와 혼용 시 y 등)
  useEffect(() => {
    if (controlledPos) {
      setPos({ x: controlledPos.x, y: controlledPos.y });
    }
  }, [controlledPos?.x, controlledPos?.y]);

  // 드래그 (controlledPos가 없을 때만 활성화)
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (controlledPos) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    setIsDragging(true);
    dragShiftXRef.current = expandOnHover && !hovered ? EXPANDED_WIDTH - COLLAPSED_WIDTH : 0;
    const displayLeft = pos.x + dragShiftXRef.current;
    dragOffset.current = { x: e.clientX - displayLeft, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos, controlledPos, expandOnHover, hovered]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const shift = dragShiftXRef.current;
    const w = shift > 0 ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
    const newDisplayLeft = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    const maxX = window.innerWidth - w;
    const maxY = window.innerHeight - (menuRef.current?.offsetHeight ?? 200);
    const clampedDL = Math.min(Math.max(0, newDisplayLeft), maxX);
    const clampedY = Math.min(Math.max(0, newY), maxY);
    setPos({
      x: clampedDL - shift,
      y: clampedY,
    });
  }, []);

  const onPointerUp = useCallback(() => { dragging.current = false; setIsDragging(false); }, []);

  useEffect(() => {
    if (controlledPos) return;
    function onResize() {
      const el = menuRef.current;
      const shift = expandOnHover && !hovered ? EXPANDED_WIDTH - COLLAPSED_WIDTH : 0;
      const w = shift > 0 ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
      const maxX = window.innerWidth - w;
      const maxY = window.innerHeight - (el?.offsetHeight ?? 200);
      setPos((p) => {
        const dl = p.x + shift;
        return {
          x: Math.min(Math.max(0, dl), maxX) - shift,
          y: Math.min(Math.max(0, p.y), maxY),
        };
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [controlledPos, expandOnHover, hovered]);

  const subModalRef = useRef<HTMLDivElement>(null);
  const lastCollabAnchorRef = useRef<CollabSubModalAnchorRect | null>(null);
  const [subModalPos, setSubModalPos] = useState({ left: 0, top: 0 });
  const [subModalHeightPx, setSubModalHeightPx] = useState<number | null>(null);
  const [subResizeEdge, setSubResizeEdge] = useState<'top' | 'bottom' | null>(null);
  const subResizeRef = useRef({ clientY: 0, top: 0, height: 0 });
  const subDraggingRef = useRef(false);
  const subDragOffsetRef = useRef({ x: 0, y: 0 });
  const [isSubDragging, setIsSubDragging] = useState(false);
  const [subModalMinimized, setSubModalMinimized] = useState(false);
  const isEndEffectorSettingsTab =
    selectedObjectId === 'endeffector' && (endeffectorActiveCategoryId ?? 'ee-basic') === 'ee-basic';
  const isEndEffectorConnectionTab =
    selectedObjectId === 'endeffector' && endeffectorActiveCategoryId === 'ee-connect';
  const isManipulatorRobotDetail = selectedObjectId === 'manipulator';
  const showSubModal =
    SUB_MODAL_OBJECT_IDS.has(selectedObjectId) ||
    isEndEffectorSettingsTab ||
    isEndEffectorConnectionTab ||
    isManipulatorRobotDetail;
  const showSubModalEffective = showSubModal;
  const selectedObjectDef = objects.find((o) => o.id === selectedObjectId);
  const motionCat = motionActiveCategoryId ?? 'motion-generate';
  const isUploadTab = selectedObjectId === 'motion' && motionCat === 'motion-upload';
  const isGenerateTab = selectedObjectId === 'motion' && motionCat === 'motion-generate';
  const motionUploadReadonly = isUploadTab && selectedMotionUploadKey != null && selectedMotionUploadKey !== '';
  const motionUploadDefault = isUploadTab && !motionUploadReadonly;
  const motionGenerateDefaults = isGenerateTab && motionSequenceSelectedId == null;
  const motionGenerateEdit = isGenerateTab && motionSequenceSelectedId != null;

  const COLLISION_ZONE_TAB_IDS = new Set<string>([
    'collision-robot',
    'collision-endeffector',
    'collision-additional-axis',
    'collision-workpiece',
  ]);
  const isCollisionZoneCategoryTab =
    selectedObjectId === 'collision' &&
    collisionActiveCategoryId != null &&
    COLLISION_ZONE_TAB_IDS.has(collisionActiveCategoryId);
  const collisionDefaultsMode =
    isCollisionZoneCategoryTab && panelData != null && panelData.selectedCollisionAreaId == null;
  const collisionEditMode =
    isCollisionZoneCategoryTab && panelData != null && panelData.selectedCollisionAreaId != null;

  const dockSubToPanel = subModalDockToPropertyPanel != null;
  const subModalRefreshKey = `${selectedObjectId}|${motionCat}|${motionSequenceSelectedId ?? ''}|${selectedMotionUploadKey ?? ''}|${collisionActiveCategoryId ?? ''}|${panelData?.selectedCollisionAreaId ?? ''}|${endeffectorActiveCategoryId ?? ''}|${eeSelectedIdx ?? ''}|${panelData?.manipSelectedRobotIdx ?? ''}`;
  const anyEditMode = motionUploadReadonly || motionGenerateEdit || collisionEditMode;
  const subModalMaxHeightPx = SUB_MODAL_MAX_HEIGHT;

  /**
   * 기본값 모드가 켜져 있어도 편집 모드가 활성화되면 편집 모드를 우선 표시.
   * (동시에 두 목적의 서브레이어가 겹치지 않도록 보장)
   */
  const effectiveMotionUploadDefault = motionUploadDefault && !anyEditMode;
  const effectiveMotionGenerateDefaults = motionGenerateDefaults && !anyEditMode;
  const effectiveCollisionDefaultsMode = collisionDefaultsMode && !anyEditMode;
  const selectedEeObjectName =
    eeSelectedIdx != null && panelData?.eeSlots?.[eeSelectedIdx]
      ? panelData.eeSlots[eeSelectedIdx]?.objectName ?? null
      : null;
  const isEndEffectorSubmodal = isEndEffectorSettingsTab || isEndEffectorConnectionTab;
  const selectedManipRobotName =
    panelData?.manipRobots?.length && panelData.manipSelectedRobotIdx != null
      ? panelData.manipRobots[
          Math.min(
            Math.max(0, panelData.manipSelectedRobotIdx),
            Math.max(0, panelData.manipRobots.length - 1),
          )
        ]?.manipObjectName ?? null
      : null;

  const subModalMinimizedPos = useMemo(() => {
    const margin = VIEWPORT_MARGIN;
    const boxW = 164;
    const boxH = 34;
    let left = margin;
    let top = margin;
    if (isPropertyPanelOpen && subModalDockToPropertyPanel) {
      left = subModalDockToPropertyPanel.left + subModalDockToPropertyPanel.width + SUB_MODAL_GAP;
      top = subModalDockToPropertyPanel.top + 8;
    } else {
      const menuRect = menuRef.current?.getBoundingClientRect();
      if (menuRect) {
        left = menuRect.right + SUB_MODAL_GAP;
        top = menuRect.top + 8;
      }
    }
    const maxLeft = Math.max(margin, window.innerWidth - margin - boxW);
    const maxTop = Math.max(margin, window.innerHeight - margin - boxH);
    return {
      left: Math.min(Math.max(left, margin), maxLeft),
      top: Math.min(Math.max(top, margin), maxTop),
    };
  }, [isPropertyPanelOpen, subModalDockToPropertyPanel, showSubModalEffective, selectedObjectId, subModalRefreshKey]);

  const clampSubModalPos = useCallback(() => {
    const subW = subModalRef.current?.offsetWidth ?? SUB_MODAL_WIDTH;
    const subH = subModalRef.current?.offsetHeight ?? subModalHeightPx ?? SUB_MODAL_MIN_HEIGHT;
    const margin = VIEWPORT_MARGIN;
    const maxLeft = Math.max(margin, window.innerWidth - margin - subW);
    const maxTop = Math.max(margin, window.innerHeight - margin - subH);
    setSubModalPos((p) => {
      const left = Math.min(Math.max(p.left, margin), maxLeft);
      const top = Math.min(Math.max(p.top, margin), maxTop);
      return p.left === left && p.top === top ? p : { left, top };
    });
  }, [subModalHeightPx]);

  useEffect(() => {
    if (!subResizeEdge) return;
    function onMove(e: PointerEvent) {
      const margin = VIEWPORT_MARGIN;
      const minH = SUB_MODAL_MIN_HEIGHT;
      const start = subResizeRef.current;
      if (subResizeEdge === 'bottom') {
        const dy = e.clientY - start.clientY;
        const maxH = Math.min(
          SUB_MODAL_MAX_HEIGHT,
          Math.max(minH, window.innerHeight - margin - start.top),
        );
        const nextH = Math.min(Math.max(start.height + dy, minH), maxH);
        setSubModalHeightPx(nextH);
      } else {
        const dy = e.clientY - start.clientY;
        const maxH = Math.min(
          SUB_MODAL_MAX_HEIGHT,
          Math.max(minH, window.innerHeight - 2 * margin),
        );
        let nextTop = start.top + dy;
        let nextH = start.height - dy;
        if (nextH < minH) {
          nextTop = start.top + start.height - minH;
          nextH = minH;
        } else if (nextH > maxH) {
          nextTop = start.top + start.height - maxH;
          nextH = maxH;
        }
        nextTop = Math.max(margin, nextTop);
        const maxTopByBottom = Math.max(
          margin,
          window.innerHeight - margin - nextH,
        );
        nextTop = Math.min(nextTop, maxTopByBottom);
        setSubModalPos((p) => (p.top === nextTop ? p : { ...p, top: nextTop }));
        setSubModalHeightPx(nextH);
      }
    }
    function onUp() {
      setSubResizeEdge(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [subResizeEdge]);

  const startSubTopResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!subModalRef.current) return;
    const h = subModalHeightPx ?? subModalRef.current.offsetHeight;
    subResizeRef.current = { clientY: e.clientY, top: subModalPos.top, height: h };
    if (subModalHeightPx == null) setSubModalHeightPx(h);
    setSubResizeEdge('top');
  }, [subModalHeightPx, subModalPos.top]);

  const startSubBottomResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!subModalRef.current) return;
    const h = subModalHeightPx ?? subModalRef.current.offsetHeight;
    subResizeRef.current = { clientY: e.clientY, top: subModalPos.top, height: h };
    if (subModalHeightPx == null) setSubModalHeightPx(h);
    setSubResizeEdge('bottom');
  }, [subModalHeightPx, subModalPos.top]);

  useLayoutEffect(() => {
    if (!showSubModalEffective) return;
    function placeSubModalAtDefault() {
      const subH = subModalRef.current?.offsetHeight ?? subModalHeightPx ?? SUB_MODAL_MIN_HEIGHT;
      let left: number;
      let top: number;
      if (dockSubToPanel && subModalDockToPropertyPanel) {
        ({ left, top } = computeSubModalPositionDockedToPropertyPanel(
          subModalDockToPropertyPanel,
          SUB_MODAL_WIDTH,
          subH,
        ));
      } else {
        if (!menuRef.current) return;
        ({ left, top } = computeSubModalPosition(menuRef.current.getBoundingClientRect(), SUB_MODAL_WIDTH, subH));
      }
      setSubModalPos({ left, top });
    }
    placeSubModalAtDefault();
    const id = requestAnimationFrame(() => placeSubModalAtDefault());
    return () => cancelAnimationFrame(id);
  }, [showSubModalEffective, subModalRefreshKey]);

  useEffect(() => {
    if (!showSubModalEffective) return;
    clampSubModalPos();
    window.addEventListener('resize', clampSubModalPos);
    const ro = new ResizeObserver(() => clampSubModalPos());
    const subEl = subModalRef.current;
    if (subEl) ro.observe(subEl);
    return () => {
      window.removeEventListener('resize', clampSubModalPos);
      ro.disconnect();
    };
  }, [showSubModalEffective, clampSubModalPos]);

  const onSubHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, textarea, a, label')) return;
    subDraggingRef.current = true;
    setIsSubDragging(true);
    subDragOffsetRef.current = {
      x: e.clientX - subModalPos.left,
      y: e.clientY - subModalPos.top,
    };
  }, [subModalPos.left, subModalPos.top]);

  useEffect(() => {
    if (!isSubDragging) return;
    function onMove(e: PointerEvent) {
      const subW = subModalRef.current?.offsetWidth ?? SUB_MODAL_WIDTH;
      const subH = subModalRef.current?.offsetHeight ?? subModalHeightPx ?? SUB_MODAL_MIN_HEIGHT;
      const margin = VIEWPORT_MARGIN;
      const nextLeftRaw = e.clientX - subDragOffsetRef.current.x;
      const nextTopRaw = e.clientY - subDragOffsetRef.current.y;
      const maxLeft = Math.max(margin, window.innerWidth - margin - subW);
      const maxTop = Math.max(margin, window.innerHeight - margin - subH);
      const left = Math.min(Math.max(nextLeftRaw, margin), maxLeft);
      const top = Math.min(Math.max(nextTopRaw, margin), maxTop);
      setSubModalPos((p) => (p.left === left && p.top === top ? p : { left, top }));
    }
    function onUp() {
      subDraggingRef.current = false;
      setIsSubDragging(false);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isSubDragging, subModalHeightPx]);

  useEffect(() => {
    if (!showSubModalEffective) {
      setSubModalHeightPx(null);
      setSubResizeEdge(null);
      setIsSubDragging(false);
      subDraggingRef.current = false;
      setSubModalMinimized(false);
    }
  }, [showSubModalEffective]);

  useEffect(() => {
    if (!showSubModalEffective) return;
    setSubModalMinimized(false);
  }, [subModalRefreshKey, showSubModalEffective]);

  /** 협동 서브모달 앵커: 크기 변화만 구독. `subModalPos`에 넣지 않음 — 이동 시 cleanup에서 null을 보내 포털↔인라인 전환이 반복되어 루프/크래시가 났음 */
  useLayoutEffect(() => {
    if (!onCollabSubModalLayoutChange) return;
    const report = onCollabSubModalLayoutChange;
    if (selectedObjectId !== 'collab') {
      lastCollabAnchorRef.current = null;
      report(null);
      return;
    }
    if (!showSubModalEffective) return;
    const el = subModalRef.current;
    if (!el) return;
    function pushRect() {
      const r = subModalRef.current?.getBoundingClientRect();
      if (!r) return;
      const next: CollabSubModalAnchorRect = { left: r.left, bottom: r.bottom, width: r.width };
      const prev = lastCollabAnchorRef.current;
      if (prev && rectsCloseEnough(prev, next)) return;
      lastCollabAnchorRef.current = next;
      report(next);
    }
    pushRect();
    const ro = new ResizeObserver(() => pushRect());
    ro.observe(el);
    window.addEventListener('resize', pushRect);
    window.addEventListener('scroll', pushRect, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', pushRect);
      window.removeEventListener('scroll', pushRect, true);
    };
  }, [selectedObjectId, showSubModalEffective, onCollabSubModalLayoutChange]);

  /** 패널 드래그 등으로 서브모달 위치만 바뀔 때 앵커 동기화 (ResizeObserver는 크기 변화 위주) */
  useLayoutEffect(() => {
    if (!onCollabSubModalLayoutChange || selectedObjectId !== 'collab' || !showSubModalEffective) return;
    const el = subModalRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const next: CollabSubModalAnchorRect = { left: r.left, bottom: r.bottom, width: r.width };
    const prev = lastCollabAnchorRef.current;
    if (prev && rectsCloseEnough(prev, next)) return;
    lastCollabAnchorRef.current = next;
    onCollabSubModalLayoutChange(next);
  }, [
    selectedObjectId,
    showSubModalEffective,
    subModalPos,
    subModalDockToPropertyPanel?.left,
    subModalDockToPropertyPanel?.top,
    subModalDockToPropertyPanel?.width,
    onCollabSubModalLayoutChange,
  ]);

  return (
    <>
    <div
      ref={menuRef}
      className="absolute flex flex-col rounded-[14px] overflow-hidden"
      style={{
        left: renderedLeft,
        top: renderedTop,
        zIndex: 49,
        width: panelWidth,
        background: tk.bg,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid ${tk.border}`,
        boxShadow: tk.shadow,
        transition: 'left 0.2s ease, width 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── 드래그 핸들 + 객체 메타: expandOnHover 시 높이 고정(접힘·펼침 동일) ── */}
      <div
        className={`flex shrink-0 select-none relative ${expandOnHover ? 'py-2' : 'gap-2.5 px-3 py-3 items-center'}`}
        style={{
          cursor: controlledPos ? 'default' : (isDragging ? 'grabbing' : 'grab'),
          ...(expandOnHover ? { height: CATEGORY_MENU_HEADER_RESERVE_PX, boxSizing: 'border-box' } : {}),
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {expandOnHover ? (
          <>
            {/* 접힘/펼침: 레이아웃 스왑 대신 opacity 크로스페이드 — width 애니메이션과 겹치지 않음 */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1 px-2 transition-opacity duration-150 ease-out ${
                isCollapsed ? 'z-[1] opacity-100' : 'pointer-events-none z-0 opacity-0'
              }`}
              aria-hidden={!isCollapsed}
            >
              <SfdIconByIndex
                index={workspaceHeaderIconIndex(headerMeta.objectGroupKind)}
                color={tk.grip}
                size={16}
              />
              <div className="flex flex-col items-center gap-1" aria-hidden>
                <div
                  className="w-px h-3 rounded-full opacity-35"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.35)'}, transparent)`,
                  }}
                />
                <div className="flex flex-col items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="rounded-full"
                      style={{
                        width: 3,
                        height: 3,
                        background: tk.textSecondary,
                        opacity: 0.22 + i * 0.08,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span
                className="text-[8px] font-bold leading-none tracking-tight"
                style={{ color: tk.textSecondary }}
              >
                {L.categoryMenuCollapsedEdit}
              </span>
            </div>
            <div
              className={`absolute inset-0 flex items-center gap-2.5 px-3 transition-opacity duration-150 ease-out ${
                !isCollapsed ? 'z-[1] opacity-100' : 'pointer-events-none z-0 opacity-0'
              }`}
              aria-hidden={isCollapsed}
            >
              <SfdIconByIndex
                index={workspaceHeaderIconIndex(headerMeta.objectGroupKind)}
                color={tk.grip}
                size={16}
                className="shrink-0"
              />
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden justify-center gap-0.5">
                <span className="text-[9px] font-semibold tracking-[0.18em] block shrink-0 leading-none" style={{ color: tk.textSecondary }}>
                  OBJECTS
                </span>
                <p
                  className="text-[12px] font-bold leading-tight truncate shrink-0"
                  style={{ color: tk.textPrimary }}
                  title={headerTitle}
                >
                  {headerTitle}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5 shrink-0">
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                    style={{
                      background: headerMeta.analysis === 'done'
                        ? (theme === 'light' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.22)')
                        : (theme === 'light' ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.22)'),
                      color: headerMeta.analysis === 'done' ? '#16a34a' : '#d97706',
                    }}
                  >
                    {headerMeta.analysis === 'done' ? L.badgeAnalyzed : L.badgePending}
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                    style={{
                      background: headerMeta.collaboration === 'on'
                        ? (theme === 'light' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.22)')
                        : (theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                      color: headerMeta.collaboration === 'on' ? '#2563eb' : tk.textSecondary,
                    }}
                  >
                    {headerMeta.collaboration === 'on' ? L.badgeCollab : L.badgeNoCollab}
                  </span>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                    style={{
                      background: headerMeta.tier === 'paid'
                        ? (theme === 'light' ? 'rgba(139,92,246,0.14)' : 'rgba(139,92,246,0.22)')
                        : (theme === 'light' ? 'rgba(20,184,166,0.14)' : 'rgba(20,184,166,0.2)'),
                      color: headerMeta.tier === 'paid' ? '#7c3aed' : '#0d9488',
                    }}
                  >
                    {headerMeta.tier === 'paid' ? L.badgePaid : L.badgeFree}
                  </span>
                </div>
                <div className="mt-0.5 flex items-baseline flex-wrap gap-x-1 gap-y-0 shrink-0 leading-none">
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: tk.textSecondary }}>
                    {L.criPrefix} : {headerMeta.cri.toFixed(2)}
                  </span>
                  <span
                    className="text-[9px] font-medium"
                    style={{ color: headerMeta.cri >= 1 ? '#ef4444' : '#22c55e' }}
                  >
                    ({headerMeta.cri >= 1 ? L.criRisk : L.criSafe})
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <SfdIconByIndex
              index={workspaceHeaderIconIndex(headerMeta.objectGroupKind)}
              color={tk.grip}
              size={16}
              className="shrink-0"
            />
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden justify-center gap-0.5">
              <span className="text-[9px] font-semibold tracking-[0.18em] block shrink-0 leading-none" style={{ color: tk.textSecondary }}>
                OBJECTS
              </span>
              <p
                className="text-[12px] font-bold leading-tight truncate shrink-0"
                style={{ color: tk.textPrimary }}
                title={headerTitle}
              >
                {headerTitle}
              </p>
              <div className="flex flex-wrap gap-1 mt-0.5 shrink-0">
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                  style={{
                    background: headerMeta.analysis === 'done'
                      ? (theme === 'light' ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.22)')
                      : (theme === 'light' ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.22)'),
                    color: headerMeta.analysis === 'done' ? '#16a34a' : '#d97706',
                  }}
                >
                  {headerMeta.analysis === 'done' ? L.badgeAnalyzed : L.badgePending}
                </span>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                  style={{
                    background: headerMeta.collaboration === 'on'
                      ? (theme === 'light' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.22)')
                      : (theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'),
                    color: headerMeta.collaboration === 'on' ? '#2563eb' : tk.textSecondary,
                  }}
                >
                  {headerMeta.collaboration === 'on' ? L.badgeCollab : L.badgeNoCollab}
                </span>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px] leading-tight"
                  style={{
                    background: headerMeta.tier === 'paid'
                      ? (theme === 'light' ? 'rgba(139,92,246,0.14)' : 'rgba(139,92,246,0.22)')
                      : (theme === 'light' ? 'rgba(20,184,166,0.14)' : 'rgba(20,184,166,0.2)'),
                    color: headerMeta.tier === 'paid' ? '#7c3aed' : '#0d9488',
                  }}
                >
                  {headerMeta.tier === 'paid' ? L.badgePaid : L.badgeFree}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline flex-wrap gap-x-1 gap-y-0 shrink-0 leading-none">
                <span className="text-[10px] font-semibold tabular-nums" style={{ color: tk.textSecondary }}>
                  {L.criPrefix} : {headerMeta.cri.toFixed(2)}
                </span>
                <span
                  className="text-[9px] font-medium"
                  style={{ color: headerMeta.cri >= 1 ? '#ef4444' : '#22c55e' }}
                >
                  ({headerMeta.cri >= 1 ? L.criRisk : L.criSafe})
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ height: 1, background: tk.divider }} />

      {/* ── 1뎁스: 객체 목록 ── */}
      <div className="flex flex-col py-1">
        {objects.map((obj) => {
          const Icon = obj.icon;
          const rowIconIndex = OBJECT_ROW_ICON_INDEX[obj.id];
          const isActive = obj.id === selectedObjectId;
          const inactiveIcon = theme === 'light' ? '#a3a3a3' : '#737373';
          const inactiveIconBg = theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
          return (
            <button
              key={obj.id}
              className={`flex items-center w-full text-left transition-colors duration-100 ${isCollapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-3 py-2'}`}
              style={{
                background: isActive ? tk.activeItem : 'transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = tk.itemHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = isActive ? tk.activeItem : 'transparent'; }}
              onClick={() => {
                onObjectChange(obj.id);
              }}
              title={isCollapsed ? obj.label : undefined}
            >
              <div
                className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
                style={{
                  background: isActive ? `${obj.color}20` : inactiveIconBg,
                  boxShadow: isActive && isCollapsed ? `0 0 0 2px ${obj.color}` : undefined,
                }}
              >
                {rowIconIndex != null ? (
                  <SfdIconByIndex index={rowIconIndex} color={isActive ? obj.color : inactiveIcon} size={14} />
                ) : (
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? obj.color : inactiveIcon }} />
                )}
              </div>
              <div className={`min-w-0 overflow-hidden ${isCollapsed ? 'hidden' : 'flex-1'}`}>
                <p
                  className={`text-[11px] leading-tight truncate ${isActive ? 'font-semibold' : 'font-medium'}`}
                  style={{ color: isActive ? tk.textPrimary : tk.textSecondary }}
                >
                  {obj.label}
                </p>
              </div>
              {!isCollapsed && isActive && (
                <div className="w-1 h-1 rounded-full shrink-0" style={{ background: obj.color }} />
              )}
            </button>
          );
        })}
      </div>

    </div>

    {showSubModalEffective && selectedObjectDef && subModalMinimized && (
      <button
        type="button"
        className="fixed z-[52] inline-flex items-center gap-2 rounded-[10px] px-3 py-2 text-[11px] font-semibold"
        style={{
          left: subModalMinimizedPos.left,
          top: subModalMinimizedPos.top,
          background: tk.bg,
          color: tk.textPrimary,
          border: `1px solid ${tk.border}`,
          boxShadow: tk.shadow,
        }}
        onClick={() => setSubModalMinimized(false)}
        title="최소화된 상세 설정 열기"
        aria-label="최소화된 상세 설정 열기"
      >
        <SfdIconByIndex index={2} color={tk.textSecondary} size={12} />
        <span className="truncate max-w-[90px]">
          {selectedObjectId === 'endeffector' && isEndEffectorSubmodal
            ? `${selectedEeObjectName ?? selectedObjectDef.label} 상세 설정`
            : isManipulatorRobotDetail
              ? `${selectedManipRobotName ?? selectedObjectDef.label} 상세 설정`
              : L.subModalSectionTitle}
        </span>
      </button>
    )}

    {showSubModalEffective && selectedObjectDef && !subModalMinimized && (
      <div
        ref={subModalRef}
        role="complementary"
        aria-label={L.subModalSectionTitle}
        className="fixed flex flex-col rounded-[14px] overflow-hidden"
        style={{
          left: subModalPos.left,
          top: subModalPos.top,
          width: SUB_MODAL_WIDTH,
          zIndex: 51,
          height: subModalHeightPx ?? undefined,
          minHeight: `${SUB_MODAL_MIN_HEIGHT}px`,
          maxHeight: `${Math.floor(subModalMaxHeightPx)}px`,
          background: tk.bg,
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: `1px solid ${tk.border}`,
          boxShadow: tk.shadow,
        }}
      >
        <div
          className="h-2 shrink-0 cursor-ns-resize"
          aria-label="서브레이어 상단 높이 조절"
          onPointerDown={startSubTopResize}
          style={{ background: 'transparent' }}
        />
        <div
          className="shrink-0 relative"
          onPointerDown={onSubHeaderPointerDown}
          style={{ cursor: isSubDragging ? 'grabbing' : 'grab' }}
        >
        <button
          type="button"
          className="absolute right-2 top-2 z-[3] w-6 h-6 rounded-[6px] flex items-center justify-center transition-colors duration-150"
          style={{ background: tk.objectTabBg, color: tk.textSecondary }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = tk.itemHover;
            el.style.color = tk.textPrimary;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = tk.objectTabBg;
            el.style.color = tk.textSecondary;
          }}
          onClick={() => setSubModalMinimized(true)}
          title="최소화"
          aria-label="최소화"
        >
          <SfdIconByIndex index={2} color="currentColor" size={12} />
        </button>
        {selectedObjectId === 'endeffector' && isEndEffectorSubmodal ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: selectedObjectDef.color }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {(selectedEeObjectName ?? selectedObjectDef.label)} 상세 설정
            </span>
          </div>
        ) : isManipulatorRobotDetail ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: selectedObjectDef.color }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {(selectedManipRobotName ?? selectedObjectDef.label)} 상세 설정
            </span>
          </div>
        ) : selectedObjectId === 'motion' && effectiveMotionUploadDefault ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: motionAccent }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.motionUploadSubmodalTitleDefault}
            </span>
          </div>
        ) : selectedObjectId === 'motion' && motionUploadReadonly ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background:
                theme === 'light'
                  ? `linear-gradient(90deg, ${accentRgba(viewAccent, 0.12)} 0%, rgba(252,252,253,0.55) 52%)`
                  : `linear-gradient(90deg, ${accentRgba(viewAccent, 0.14)} 0%, rgba(255,255,255,0.04) 52%)`,
              borderBottom: `1px solid ${tk.divider}`,
              boxShadow: `inset 3px 0 0 ${viewAccent}`,
            }}
          >
            <Eye className="w-3.5 h-3.5 shrink-0" style={{ color: viewAccent }} strokeWidth={2.5} />
            <span className="flex-1 min-w-0 text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.motionUploadSubmodalTitleReadonly}
            </span>
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[5px] leading-none"
              style={{
                background: theme === 'light' ? accentRgba(viewAccent, 0.2) : accentRgba(viewAccent, 0.22),
                color: theme === 'light' ? '#7c2d12' : '#fdba74',
                border: theme === 'light' ? `1px solid ${accentRgba(viewAccent, 0.35)}` : `1px solid ${accentRgba(viewAccent, 0.3)}`,
              }}
            >
              {L.motionUploadSubmodalBadgeReadonly}
            </span>
          </div>
        ) : selectedObjectId === 'motion' && effectiveMotionGenerateDefaults ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: tk.textSecondary }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.motionSubmodalTitleDefaults}
            </span>
          </div>
        ) : selectedObjectId === 'motion' && motionGenerateEdit ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background:
                theme === 'light'
                  ? 'linear-gradient(90deg, rgba(255,142,43,0.16) 0%, rgba(252,252,253,0.55) 52%)'
                  : 'linear-gradient(90deg, rgba(255,142,43,0.14) 0%, rgba(255,255,255,0.04) 52%)',
              borderBottom: `1px solid ${tk.divider}`,
              boxShadow: 'inset 3px 0 0 #ff8e2b',
            }}
          >
            <SfdIconByIndex index={134} color="#ff8e2b" size={14} className="shrink-0" />
            <span className="flex-1 min-w-0 text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.motionSubmodalTitleEdit}
            </span>
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[5px] leading-none"
              style={{
                background: theme === 'light' ? 'rgba(255,142,43,0.28)' : 'rgba(255,142,43,0.22)',
                color: theme === 'light' ? '#9a3412' : '#fdba74',
                border: theme === 'light' ? '1px solid rgba(255,142,43,0.35)' : '1px solid rgba(255,142,43,0.25)',
              }}
            >
              {L.motionSubmodalBadgeEdit}
            </span>
          </div>
        ) : selectedObjectId === 'collision' && effectiveCollisionDefaultsMode ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: collisionAccent }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.collisionSubmodalTitleDefaults}
            </span>
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[5px] leading-none"
              style={{
                background: theme === 'light' ? accentRgba(collisionAccent, 0.18) : accentRgba(collisionAccent, 0.2),
                color: theme === 'light' ? '#7c2d12' : '#fdba74',
                border: theme === 'light' ? `1px solid ${accentRgba(collisionAccent, 0.35)}` : `1px solid ${accentRgba(collisionAccent, 0.28)}`,
              }}
            >
              {L.collisionSubmodalBadgeDefaults}
            </span>
          </div>
        ) : selectedObjectId === 'collision' && collisionEditMode ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background:
                theme === 'light'
                  ? `linear-gradient(90deg, ${accentRgba(collisionAccent, 0.14)} 0%, rgba(252,252,253,0.55) 52%)`
                  : `linear-gradient(90deg, ${accentRgba(collisionAccent, 0.12)} 0%, rgba(255,255,255,0.04) 52%)`,
              borderBottom: `1px solid ${tk.divider}`,
              boxShadow: `inset 3px 0 0 ${collisionAccent}`,
            }}
          >
            <SfdIconByIndex index={134} color={collisionAccent} size={14} className="shrink-0" />
            <span className="flex-1 min-w-0 text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.collisionSubmodalTitleEdit}
            </span>
            <span
              className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-[5px] leading-none"
              style={{
                background: theme === 'light' ? accentRgba(collisionAccent, 0.22) : accentRgba(collisionAccent, 0.2),
                color: theme === 'light' ? '#7c2d12' : '#fdba74',
                border: theme === 'light' ? `1px solid ${accentRgba(collisionAccent, 0.35)}` : `1px solid ${accentRgba(collisionAccent, 0.25)}`,
              }}
            >
              {L.collisionSubmodalBadgeEdit}
            </span>
          </div>
        ) : selectedObjectId === 'collision' ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{ background: tk.objectTabBg, borderBottom: `1px solid ${tk.divider}` }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: selectedObjectDef.color }} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {selectedObjectDef.label}
            </span>
          </div>
        ) : selectedObjectId === 'collab' ? (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)',
              borderBottom: `1px solid ${tk.divider}`,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" style={{ color: collabAccent }} strokeWidth={2} />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {L.collabSubmodalTitle}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{ background: tk.objectTabBg, borderBottom: `1px solid ${tk.divider}` }}
          >
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: selectedObjectDef.color }}
            />
            <span className="text-[12px] font-semibold leading-tight truncate" style={{ color: tk.textPrimary }}>
              {selectedObjectDef.label}
            </span>
          </div>
        )}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-4 py-4 flex flex-col gap-2">
          {selectedObjectId === 'motion' && panelData && setPanelData ? (
            isUploadTab ? (
              <MotionUploadSubmodalContent
                data={panelData}
                setData={setPanelData}
                selectedUploadKey={selectedMotionUploadKey}
              />
            ) : (
              <MotionSubmodalContent
                data={panelData}
                setData={setPanelData}
                selectedMotionSeqId={motionSequenceSelectedId}
              />
            )
          ) : selectedObjectId === 'endeffector' && isEndEffectorSubmodal && panelData && setPanelData ? (
            <EndEffectorSubmodalContent
              data={panelData}
              setData={setPanelData}
              selectedIdx={eeSelectedIdx}
              theme={theme}
              accentColor={selectedObjectDef.color}
              mode={isEndEffectorConnectionTab ? 'connection' : 'settings'}
            />
          ) : isManipulatorRobotDetail && panelData && setPanelData ? (
            <ManipulatorSubmodalContent
              data={panelData}
              setData={setPanelData}
              theme={theme}
              accentColor={selectedObjectDef.color}
            />
          ) : selectedObjectId === 'collab' && panelData && setPanelData ? (
            <CollabSubmodalContent
              data={panelData}
              setData={setPanelData}
              theme={theme}
              pointScheme={pointScheme}
            />
          ) : isCollisionZoneCategoryTab && panelData && setPanelData && collisionActiveCategoryId ? (
            <CollisionSubmodalContent
              data={panelData}
              setData={setPanelData}
              selectedAreaId={panelData.selectedCollisionAreaId}
              collisionCategoryId={collisionActiveCategoryId as CollisionCategoryId}
              theme={theme}
            />
          ) : selectedObjectId === 'collision' ? (
            <p className="text-[11px] leading-relaxed" style={{ color: tk.textSecondary }}>
              {L.collisionSubmodalPlaceholderOther}
            </p>
          ) : (
            <>
              <p className="text-[11px] leading-relaxed" style={{ color: tk.textSecondary }}>
                {L.subModalPlaceholder}
              </p>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: tk.textSecondary }}>
                  {L.subModalRelatedTabs}
                </p>
                <ul className="flex flex-col gap-1">
                  {selectedObjectDef.categories.flatMap((c) => c.tabs).map((tab) => (
                    <li
                      key={tab.id}
                      className="text-[11px] px-2 py-1.5 rounded-[8px]"
                      style={{ background: tk.objectTabBg, color: tk.textPrimary }}
                    >
                      {tab.label}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
        <div
          className="h-2 shrink-0 cursor-ns-resize"
          aria-label="서브레이어 하단 높이 조절"
          onPointerDown={startSubBottomResize}
          style={{ background: 'transparent' }}
        />
      </div>
    )}
    </>
  );
}
