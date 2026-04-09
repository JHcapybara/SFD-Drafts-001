import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { X } from 'lucide-react';
import CategoryMenu, {
  SUB_MODAL_FLOOR_HEIGHT,
  SUB_MODAL_GAP,
  SUB_MODAL_MAX_HEIGHT,
  SUB_MODAL_MIN_HEIGHT,
  SUB_MODAL_WIDTH,
  VIEWPORT_MARGIN,
} from './CategoryMenu';
import PropertyPanel, { DARK as PP_DARK, LIGHT as PP_LIGHT } from './PropertyPanel';
import { EndEffectorSubmodalContent } from './EndEffectorSubmodalContent';
import { useLocale } from './localeContext';
import { WorkspaceChrome } from './WorkspaceChrome';
import { treeNodeToPropertyBridge, type CellTreeNodeType } from './treePropertyBridge';
import type { PanelData } from './panelData';
import { DEFAULT_DATA } from './panelData';
import { OBJECTS_MODAL_CONTEXT } from './menuData';
import { CollabSubModalAnchorContext } from './collabSubModalAnchorContext';
import type { CollabSubModalAnchorRect } from './collabSubModalAnchorContext';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import { SceneInfoPanel } from './SceneInfoPanel';
import { POINT_ORANGE } from './pointColorSchemes';
import type { OnboardingOpenAppAction } from './onboardingAppActions';
// 헤더 메타는 menuData의 OBJECTS_MODAL_CONTEXT (상위 로봇 1대). 씬별로 바꾸려면 CategoryMenu에 workspaceContext={...} 전달

// Objects 모달 너비 + 간격
const CATEGORY_MENU_WIDTH = 200;
const CATEGORY_MENU_GAP = 8;
const FULL_MINIMIZED_RIGHT_MARGIN = 12;
const FULL_MINIMIZED_TOP_GAP = 12;
/** PropertyPanel `w-[320px]` 과 동일 (서브모달 도킹용) */
const PROPERTY_PANEL_WIDTH = 320;
/** CategoryMenu 서브레이어 기본 폭/간격 (자동 회피 클램프 기준) */
const SUB_LAYER_WIDTH = SUB_MODAL_WIDTH;
const SUB_LAYER_GAP = SUB_MODAL_GAP;
const END_EFFECTOR_SUBLAYER_WIDTH = 320;
/** false → 항상 펼침(라벨 항상 표시, 이전 UX). true → 기본은 아이콘만, 호버 시 펼침. */
const CATEGORY_MENU_EXPAND_ON_HOVER = true;

export default function App() {
  const { locale, toggleLocale } = useLocale();
  const [showLight, setShowLight] = useState(false);
  const [uiThemeMode, setUiThemeMode] = useState<'light' | 'dark'>('light');
  const [sceneInfoOpen, setSceneInfoOpen] = useState(false);

  // 선택된 오브젝트 상태 (PropertyPanel 탭 구성에 사용)
  const [selectedObjectId, setSelectedObjectId] = useState('manipulator');
  /** 셀 트리 포커스(프로퍼티 패널과 동기화) */
  const [selectedTreeNodeId, setSelectedTreeNodeId] = useState<string | null>('manip-main');
  const [treeLinkedDescription, setTreeLinkedDescription] = useState<string | null>(null);

  const lightInitialX = Math.max(0, window.innerWidth - 348);
  const lightInitialY = WORKSPACE_CONTENT_TOP_PX;
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // 라이트 패널 위치 상태 — Objects 모달이 항상 이 위치 기준으로 좌측에 붙어 이동
  const [lightPos, setLightPos] = useState({ x: lightInitialX, y: lightInitialY });
  const lightPosRef = useRef(lightPos);
  lightPosRef.current = lightPos;
  /** 서브레이어 열림 사이클에서 자동 회피 1회 적용 여부 */
  const subLayerAutoEvadedRef = useRef(false);
  /** 사용자가 수동 이동했는지(수동 우선권) */
  const subLayerUserOverrideRef = useRef(false);
  const prevSubLayerOpenRef = useRef(false);

  /** 프로퍼티 헤더 드래그 중에는 서브레이어 도킹 기준을 드래그 시작 시점에 고정(패널만 움직이고 서브는 화면에 고정) */
  const [propertyHeaderDragging, setPropertyHeaderDragging] = useState(false);
  const subDockAtDragStartRef = useRef<{ left: number; top: number; width: number } | null>(null);

  const onPropertyHeaderDragChange = useCallback((dragging: boolean) => {
    if (dragging) {
      const p = lightPosRef.current;
      subDockAtDragStartRef.current = { left: p.x, top: p.y, width: PROPERTY_PANEL_WIDTH };
    } else {
      subDockAtDragStartRef.current = null;
    }
    setPropertyHeaderDragging(dragging);
  }, []);

  /** 라이트 패널 ↔ 카테고리 서브모달(모션 고급 설정) 공유 */
  const [panelData, setPanelData] = useState<PanelData>(DEFAULT_DATA);
  /** 모션 리스트 선택 ↔ 카테고리 서브모달 헤더(기본값 설정 / 수정) 동기화 */
  const [selectedMotionSeqId, setSelectedMotionSeqId] = useState<string | null>(null);
  /** 프로퍼티 패널: 생성 모션 / 업로드 모션 탭 */
  const [motionActiveCategoryId, setMotionActiveCategoryId] = useState('motion-generate');
  const [endeffectorActiveCategoryId, setEndeffectorActiveCategoryId] = useState('ee-basic');
  const [eeSelectedIdx, setEeSelectedIdx] = useState<number | null>(null);
  /** 업로드 모션 리스트 선택(파일·웨이포인트) */
  const [selectedMotionUploadKey, setSelectedMotionUploadKey] = useState<string | null>(null);
  const [eeSubLayerClosed, setEeSubLayerClosed] = useState(false);
  const [eeSubLayerHeightPx, setEeSubLayerHeightPx] = useState<number | null>(null);
  const [eeSubLayerTopOffsetPx, setEeSubLayerTopOffsetPx] = useState(0);
  const [eeSubResizeEdge, setEeSubResizeEdge] = useState<'top' | 'bottom' | null>(null);
  const eeSubResizeRef = useRef({ clientY: 0, top: 0, height: 0 });
  const eeSubLayerShellRef = useRef<HTMLDivElement>(null);
  const prevEeSubLayerKeyRef = useRef<string | null>(null);

  const handleMotionCategoryChange = useCallback((categoryId: string) => {
    setMotionActiveCategoryId(categoryId);
  }, []);

  const placePanelTopRight = useCallback(() => {
    const rightTopX = Math.max(0, window.innerWidth - VIEWPORT_MARGIN - PROPERTY_PANEL_WIDTH);
    setLightPos({ x: rightTopX, y: WORKSPACE_CONTENT_TOP_PX });
    subLayerAutoEvadedRef.current = false;
    subLayerUserOverrideRef.current = false;
  }, []);

  const handleObjectChange = useCallback((objectId: string) => {
    setTreeLinkedDescription(null);
    const isObjectChanged = selectedObjectId !== objectId;
    if (isObjectChanged) {
      setSelectedObjectId(objectId);
    }
    if (isObjectChanged && objectId === 'endeffector') {
      setEeSelectedIdx(null);
    }
    if (!showLight) {
      placePanelTopRight();
    }
    setShowLight(true);
  }, [placePanelTopRight, selectedObjectId, showLight]);

  const handleTreeNodeSelect = useCallback(
    (node: { id: string; type: string; label: string }) => {
      const bridge = treeNodeToPropertyBridge({
        id: node.id,
        type: node.type as CellTreeNodeType,
        label: node.label,
      });
      setSelectedTreeNodeId(node.id);
      setSelectedObjectId(bridge.objectId);
      setTreeLinkedDescription(bridge.contextLabel ?? null);
      if (bridge.collisionCategoryId) {
        setCollisionActiveCategoryId(bridge.collisionCategoryId);
      }
      if (bridge.motionActiveCategoryId) {
        setMotionActiveCategoryId(bridge.motionActiveCategoryId);
      }
      if (bridge.endeffectorActiveCategoryId) {
        setEndeffectorActiveCategoryId(bridge.endeffectorActiveCategoryId);
      }
      if (!showLight) {
        placePanelTopRight();
      }
      setShowLight(true);
    },
    [placePanelTopRight, showLight],
  );

  const [collisionActiveCategoryId, setCollisionActiveCategoryId] = useState('collision-robot');
  const handleCollisionCategoryChange = useCallback((categoryId: string) => {
    setCollisionActiveCategoryId(categoryId);
  }, []);
  const handleEndEffectorCategoryChange = useCallback((categoryId: string) => {
    setEndeffectorActiveCategoryId(categoryId);
  }, []);
  const handleEeFilledSlotClick = useCallback(() => {
    setEeSubLayerClosed(false);
  }, []);

  useEffect(() => {
    if (selectedObjectId !== 'collision') {
      setCollisionActiveCategoryId('collision-robot');
    }
  }, [selectedObjectId]);

  useEffect(() => {
    if (selectedObjectId !== 'endeffector') {
      setEndeffectorActiveCategoryId('ee-basic');
    }
  }, [selectedObjectId]);

  useEffect(() => {
    if (motionActiveCategoryId === 'motion-upload') setSelectedMotionSeqId(null);
  }, [motionActiveCategoryId]);

  useEffect(() => {
    if (motionActiveCategoryId === 'motion-generate') setSelectedMotionUploadKey(null);
  }, [motionActiveCategoryId]);

  useEffect(() => {
    if (selectedObjectId !== 'motion') {
      setSelectedMotionUploadKey(null);
      setMotionActiveCategoryId('motion-generate');
    }
  }, [selectedObjectId]);

  useEffect(() => {
    if (selectedObjectId !== 'collab') {
      setPanelData((p) => (p.collabEditingWorkspaceId ? { ...p, collabEditingWorkspaceId: null } : p));
    }
  }, [selectedObjectId]);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const hasManipulatorSelection =
    panelData.manipRobots.length > 0 &&
    panelData.manipSelectedRobotIdx != null;
  const hasSelectedEeSlot =
    eeSelectedIdx != null &&
    panelData.eeSlots[eeSelectedIdx] != null;
  const canShowEeSubLayerByCategory =
    endeffectorActiveCategoryId === 'ee-basic' || endeffectorActiveCategoryId === 'ee-connect';
  const showEndEffectorSubLayer =
    showLight &&
    selectedObjectId === 'endeffector' &&
    hasSelectedEeSlot &&
    canShowEeSubLayerByCategory &&
    !eeSubLayerClosed;
  const subLayerOpen =
    selectedObjectId === 'motion' ||
    selectedObjectId === 'collision' ||
    selectedObjectId === 'collab' ||
    (selectedObjectId === 'manipulator' && hasManipulatorSelection) ||
    showEndEffectorSubLayer;
  const appRenderCountRef = useRef(0);
  appRenderCountRef.current += 1;
  console.log('[Render][App]', {
    count: appRenderCountRef.current,
    selectedObjectId,
    endeffectorActiveCategoryId,
    eeSelectedIdx,
    hasSelectedEeSlot,
    showEndEffectorSubLayer,
    eeSubLayerClosed,
    eeFilledCount: panelData.eeSlots.filter(Boolean).length,
    subLayerOpen,
  });

  /** CategoryMenu `getSubModalHeightBounds` 와 동일 공식 */
  const getEeSubLayerHeightBounds = useCallback((top: number) => {
    const margin = VIEWPORT_MARGIN;
    const minTop = WORKSPACE_CONTENT_TOP_PX;
    const safeTop = Math.max(minTop, top);
    const viewportMax = Math.max(SUB_MODAL_FLOOR_HEIGHT, window.innerHeight - margin - safeTop);
    const maxH = Math.min(SUB_MODAL_MAX_HEIGHT, viewportMax);
    const minH = Math.min(SUB_MODAL_MIN_HEIGHT, maxH);
    return { minH, maxH };
  }, []);

  const endEffectorSubLayerLayout = useMemo(() => {
    const margin = VIEWPORT_MARGIN;
    const minTop = WORKSPACE_CONTENT_TOP_PX;
    const desiredLeft = lightPos.x + PROPERTY_PANEL_WIDTH + SUB_LAYER_GAP;
    const maxLeft = Math.max(margin, viewportWidth - margin - END_EFFECTOR_SUBLAYER_WIDTH);
    const left = Math.min(Math.max(desiredLeft, margin), maxLeft);

    const topBase = lightPos.y + eeSubLayerTopOffsetPx;
    const { minH, maxH } = getEeSubLayerHeightBounds(topBase);
    /** 사용자가 리사이즈한 값만 고정 높이; 그 외는 콘텐츠 높이에 맞춤(min~max) */
    const fixedHeight =
      eeSubLayerHeightPx != null
        ? Math.min(Math.max(eeSubLayerHeightPx, minH), maxH)
        : null;
    const heightForTopClamp = fixedHeight ?? maxH;
    const maxTop = Math.max(minTop, viewportHeight - margin - heightForTopClamp);
    const top = Math.min(Math.max(topBase, minTop), maxTop);

    return { left, top, minH, maxH, fixedHeight };
  }, [
    lightPos.x,
    lightPos.y,
    eeSubLayerTopOffsetPx,
    eeSubLayerHeightPx,
    getEeSubLayerHeightBounds,
    viewportHeight,
    viewportWidth,
  ]);

  useEffect(() => {
    console.log('[Effect][App][eeSubLayerResetBySelection]', {
      selectedObjectId,
      hasSelectedEeSlot,
      canShowEeSubLayerByCategory,
      eeSelectedIdx,
      endeffectorActiveCategoryId,
      prevKey: prevEeSubLayerKeyRef.current,
    });
    if (selectedObjectId !== 'endeffector') {
      setEeSubLayerClosed(false);
      setEeSubLayerHeightPx(null);
      setEeSubLayerTopOffsetPx(0);
      prevEeSubLayerKeyRef.current = null;
      return;
    }
    if (!hasSelectedEeSlot || !canShowEeSubLayerByCategory || eeSelectedIdx == null) return;
    const key = `${endeffectorActiveCategoryId}|${eeSelectedIdx}`;
    if (prevEeSubLayerKeyRef.current !== key) {
      setEeSubLayerClosed(false);
      setEeSubLayerHeightPx(null);
      setEeSubLayerTopOffsetPx(0);
      prevEeSubLayerKeyRef.current = key;
    }
  }, [selectedObjectId, hasSelectedEeSlot, canShowEeSubLayerByCategory, endeffectorActiveCategoryId, eeSelectedIdx]);

  useEffect(() => {
    if (!eeSubResizeEdge) return;
    function onMove(e: PointerEvent) {
      const start = eeSubResizeRef.current;
      if (eeSubResizeEdge === 'bottom') {
        const dy = e.clientY - start.clientY;
        const { minH, maxH } = getEeSubLayerHeightBounds(start.top);
        const nextH = Math.min(Math.max(start.height + dy, minH), maxH);
        setEeSubLayerHeightPx(nextH);
      } else {
        const dy = e.clientY - start.clientY;
        const { minH, maxH } = getEeSubLayerHeightBounds(start.top);
        let nextTop = start.top + dy;
        let nextH = start.height - dy;
        if (nextH < minH) {
          nextTop = start.top + start.height - minH;
          nextH = minH;
        } else if (nextH > maxH) {
          nextTop = start.top + start.height - maxH;
          nextH = maxH;
        }
        const minTop = WORKSPACE_CONTENT_TOP_PX;
        const maxTopByBottom = Math.max(minTop, window.innerHeight - VIEWPORT_MARGIN - nextH);
        nextTop = Math.min(Math.max(nextTop, minTop), maxTopByBottom);
        setEeSubLayerTopOffsetPx(nextTop - lightPosRef.current.y);
        setEeSubLayerHeightPx(nextH);
      }
    }
    function onUp() {
      setEeSubResizeEdge(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [eeSubResizeEdge, getEeSubLayerHeightBounds]);

  const startEeTopResize = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { minH, maxH } = getEeSubLayerHeightBounds(endEffectorSubLayerLayout.top);
    const shellH = eeSubLayerShellRef.current?.offsetHeight;
    const h = Math.min(Math.max(eeSubLayerHeightPx ?? shellH ?? maxH, minH), maxH);
    eeSubResizeRef.current = {
      clientY: e.clientY,
      top: endEffectorSubLayerLayout.top,
      height: h,
    };
    if (eeSubLayerHeightPx == null) setEeSubLayerHeightPx(h);
    setEeSubResizeEdge('top');
  }, [eeSubLayerHeightPx, endEffectorSubLayerLayout.top, getEeSubLayerHeightBounds]);

  const startEeBottomResize = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const { minH, maxH } = getEeSubLayerHeightBounds(endEffectorSubLayerLayout.top);
    const shellH = eeSubLayerShellRef.current?.offsetHeight;
    const h = Math.min(Math.max(eeSubLayerHeightPx ?? shellH ?? maxH, minH), maxH);
    eeSubResizeRef.current = {
      clientY: e.clientY,
      top: endEffectorSubLayerLayout.top,
      height: h,
    };
    if (eeSubLayerHeightPx == null) setEeSubLayerHeightPx(h);
    setEeSubResizeEdge('bottom');
  }, [eeSubLayerHeightPx, endEffectorSubLayerLayout.top, getEeSubLayerHeightBounds]);

  const handleLightPosChange = useCallback((x: number, y: number) => {
    if (subLayerOpen) {
      subLayerUserOverrideRef.current = true;
    }
    setLightPos({ x, y: Math.max(WORKSPACE_CONTENT_TOP_PX, y) });
  }, [subLayerOpen]);

  /** 협동 CategoryMenu 서브모달 아래에 워크스페이스 편집 패널을 붙일 때 사용 */
  const [collabSubModalAnchorRect, setCollabSubModalAnchorRect] = useState<CollabSubModalAnchorRect | null>(null);
  /** 프로퍼티 패널 리스트 클릭 시 CategoryMenu 서브모달 재표시 */
  const [subModalReopenSignal, setSubModalReopenSignal] = useState(0);
  const bumpSubModalFromPropertyList = useCallback(() => {
    setSubModalReopenSignal((n) => n + 1);
  }, []);

  /** 온보딩 Play → 프로퍼티 패널·충돌·모션 등 App 상태 동기화 (라이브러리/GNB/타임라인은 WorkspaceChrome) */
  const applyOnboardingAppAction = useCallback((action: OnboardingOpenAppAction) => {
    setShowLight(true);
    if (
      action.kind === 'library' ||
      action.kind === 'left-gnb-mode' ||
      action.kind === 'timeline-dock' ||
      action.kind === 'bottom-dock-open'
    ) {
      return;
    }
    switch (action.kind) {
      case 'select-object':
        setSelectedObjectId(action.objectId);
        setTreeLinkedDescription(null);
        setSelectedTreeNodeId(null);
        break;
      case 'collision-category':
        setSelectedObjectId('collision');
        setCollisionActiveCategoryId(action.categoryId);
        setTreeLinkedDescription(null);
        setSelectedTreeNodeId(null);
        break;
      case 'collision-eef-first-area': {
        setSelectedObjectId('collision');
        setCollisionActiveCategoryId('collision-endeffector');
        setTreeLinkedDescription(null);
        setSelectedTreeNodeId(null);
        setPanelData((p) => {
          const id = action.areaId ?? p.collisionEndEffectorList[0]?.expectedAreas[0]?.id ?? null;
          return { ...p, collisionEndEffectorSelectedIdx: 0, selectedCollisionAreaId: id };
        });
        setSubModalReopenSignal((n) => n + 1);
        break;
      }
      case 'motion-category':
        setSelectedObjectId('motion');
        setMotionActiveCategoryId(action.categoryId);
        setTreeLinkedDescription(null);
        setSelectedTreeNodeId(null);
        break;
      case 'bump-submodal':
        setSubModalReopenSignal((n) => n + 1);
        break;
      default: {
        const _exhaustive: never = action;
        void _exhaustive;
      }
    }
  }, []);

  /** 서브레이어(모션/충돌/협동)가 열린 상태에서 자동 회피/수동 우선 공존 클램프 */
  useEffect(() => {
    const wasOpen = prevSubLayerOpenRef.current;
    if (subLayerOpen && !wasOpen) {
      // 새 열림 사이클 시작: 자동 회피 1회 허용 + 수동 오버라이드 초기화
      subLayerAutoEvadedRef.current = false;
      subLayerUserOverrideRef.current = false;
    }
    if (!subLayerOpen && wasOpen) {
      // 닫힘 사이클 종료: 다음 열림을 위해 상태 초기화
      subLayerAutoEvadedRef.current = false;
      subLayerUserOverrideRef.current = false;
    }
    prevSubLayerOpenRef.current = subLayerOpen;
  }, [subLayerOpen]);

  useLayoutEffect(() => {
    if (!showLight || !subLayerOpen) return;

    const clampX = (x: number, maxX: number) => {
      const minX = VIEWPORT_MARGIN + CATEGORY_MENU_WIDTH + CATEGORY_MENU_GAP;
      const safeMaxX = Math.max(0, maxX);
      if (safeMaxX >= minX) return Math.max(minX, Math.min(x, safeMaxX));
      return Math.max(0, Math.min(x, safeMaxX));
    };

    function clampGroupForSubLayer() {
      setLightPos((prev) => {
        const vw = window.innerWidth;
        const panelOnlyMax = vw - VIEWPORT_MARGIN - PROPERTY_PANEL_WIDTH;
        let nextX = clampX(prev.x, panelOnlyMax);

        const shouldAutoEvade =
          !subLayerAutoEvadedRef.current &&
          !subLayerUserOverrideRef.current;
        const avoidOverlapMax = vw - VIEWPORT_MARGIN - PROPERTY_PANEL_WIDTH - SUB_LAYER_WIDTH - SUB_LAYER_GAP;
        const forcedAvoidX = clampX(nextX, avoidOverlapMax);
        const mustAvoidByViewport = nextX > forcedAvoidX + 0.5;

        if (mustAvoidByViewport) {
          nextX = forcedAvoidX;
          subLayerAutoEvadedRef.current = true;
        } else if (shouldAutoEvade) {
          nextX = forcedAvoidX;
          subLayerAutoEvadedRef.current = true;
        }

        if (Math.abs(nextX - prev.x) < 0.5) return prev;
        return { ...prev, x: nextX };
      });
    }

    clampGroupForSubLayer();
    window.addEventListener('resize', clampGroupForSubLayer);
    return () => window.removeEventListener('resize', clampGroupForSubLayer);
  }, [showLight, subLayerOpen]);

  // Objects 모달은 라이트 패널 왼쪽에 붙어있음
  const categoryControlledPos = showLight
    ? {
        x: Math.max(0, lightPos.x - CATEGORY_MENU_WIDTH - CATEGORY_MENU_GAP),
        y: lightPos.y,
      }
    : {
        x: Math.max(0, viewportWidth - CATEGORY_MENU_WIDTH - FULL_MINIMIZED_RIGHT_MARGIN),
        y: WORKSPACE_CONTENT_TOP_PX + FULL_MINIMIZED_TOP_GAP,
      };

  /** 모션/충돌/협동 서브 모달 도킹: 헤더 드래그 중에는 드래그 시작 시 패널 위치 기준(서브가 패널을 따라가지 않음) */
  const subModalDockToPropertyPanel = useMemo(() => {
    if (!showLight) return null;
    if (propertyHeaderDragging && subDockAtDragStartRef.current) {
      return subDockAtDragStartRef.current;
    }
    return { left: lightPos.x, top: lightPos.y, width: PROPERTY_PANEL_WIDTH };
  }, [showLight, lightPos.x, lightPos.y, propertyHeaderDragging]);

  return (
    <CollabSubModalAnchorContext.Provider value={collabSubModalAnchorRect}>
    <div className="w-full h-screen overflow-hidden relative">
      {/* 배경 이미지 */}
      <img src="/bg-viewport.png" alt="viewport background"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" />

      <WorkspaceChrome
        locale={locale}
        rightPanelVisible={showLight}
        onToggleLocale={toggleLocale}
        uiPreviewMode={uiThemeMode}
        onUiPreviewModeChange={setUiThemeMode}
        sceneInfoPanelHidden={!sceneInfoOpen}
        onShowSceneInfoPanel={() => setSceneInfoOpen(true)}
        onOnboardingAppAction={applyOnboardingAppAction}
        selectedTreeNodeId={selectedTreeNodeId}
        onTreeNodeSelect={handleTreeNodeSelect}
      />

      {sceneInfoOpen ? (
        <SceneInfoPanel theme={uiThemeMode} locale={locale} onClose={() => setSceneInfoOpen(false)} />
      ) : null}

      {/* ── 카테고리 메뉴 (Objects 모달) — 라이트 패널 좌측에 붙어 이동 ── */}
      <CategoryMenu
        theme={uiThemeMode}
        selectedObjectId={selectedObjectId}
        onObjectChange={handleObjectChange}
        controlledPos={categoryControlledPos}
        isPropertyPanelOpen={showLight}
        expandOnHover={CATEGORY_MENU_EXPAND_ON_HOVER}
        subModalDockToPropertyPanel={subModalDockToPropertyPanel}
        panelData={panelData}
        setPanelData={setPanelData}
        motionSequenceSelectedId={selectedMotionSeqId}
        motionActiveCategoryId={motionActiveCategoryId}
        endeffectorActiveCategoryId={endeffectorActiveCategoryId}
        selectedMotionUploadKey={selectedMotionUploadKey}
        collisionActiveCategoryId={collisionActiveCategoryId}
        eeSelectedIdx={eeSelectedIdx}
        onCollabSubModalLayoutChange={setCollabSubModalAnchorRect}
        subModalReopenSignal={subModalReopenSignal}
      />

      {showEndEffectorSubLayer && (
        <div
          ref={eeSubLayerShellRef}
          role="complementary"
          aria-label={locale === 'en' ? 'End effector detail settings' : '엔드 이펙터 상세 설정'}
          className="fixed flex flex-col rounded-[14px] overflow-hidden"
          style={{
            left: endEffectorSubLayerLayout.left,
            top: endEffectorSubLayerLayout.top,
            width: END_EFFECTOR_SUBLAYER_WIDTH,
            height: endEffectorSubLayerLayout.fixedHeight ?? undefined,
            minHeight: endEffectorSubLayerLayout.minH,
            maxHeight: endEffectorSubLayerLayout.maxH,
            zIndex: 51,
            background: uiThemeMode === 'dark' ? PP_DARK.panelBg : PP_LIGHT.panelBg,
            backdropFilter: uiThemeMode === 'dark' ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: uiThemeMode === 'dark' ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            border: uiThemeMode === 'dark' ? `1px solid ${PP_DARK.panelBorder}` : `1px solid ${PP_LIGHT.panelBorder}`,
            boxShadow: uiThemeMode === 'dark' ? PP_DARK.panelShadow : PP_LIGHT.panelShadow,
          }}
        >
          <div
            className="absolute left-0 right-0 top-0 z-[60] h-1.5 cursor-ns-resize hover:bg-[rgba(59,130,246,0.12)]"
            style={{ touchAction: 'none' }}
            onPointerDown={startEeTopResize}
            role="separator"
            aria-label={locale === 'en' ? 'Resize top edge' : '상단 크기 조절'}
          />
          <div
            className="flex items-center gap-2 px-4 py-4 shrink-0"
            style={{
              background: uiThemeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderBottom: uiThemeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: POINT_ORANGE }} />
            <span
              className="flex-1 min-w-0 text-[12px] font-semibold leading-[15px] truncate"
              style={{ color: uiThemeMode === 'dark' ? '#f0f0f0' : '#111111' }}
            >
              {locale === 'en' ? 'End effector detail settings' : '엔드 이펙터 상세 설정'}
            </span>
            <button
              type="button"
              className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0 transition-colors duration-150"
              style={{
                background: uiThemeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: uiThemeMode === 'dark' ? '#e5e7eb' : '#374151',
              }}
              aria-label={locale === 'en' ? 'Close end-effector sublayer' : '엔드 이펙터 서브레이어 닫기'}
              onClick={() => setEeSubLayerClosed(true)}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-4 py-4 flex flex-col gap-2">
            <EndEffectorSubmodalContent
              data={panelData}
              setData={setPanelData}
              selectedIdx={eeSelectedIdx}
              setSelectedEeIdx={setEeSelectedIdx}
              theme={uiThemeMode}
              accentColor={POINT_ORANGE}
              mode={endeffectorActiveCategoryId === 'ee-connect' ? 'connection' : 'settings'}
            />
          </div>
          <div
            className="absolute left-0 right-0 bottom-0 z-[60] h-1.5 cursor-ns-resize hover:bg-[rgba(59,130,246,0.12)]"
            style={{ touchAction: 'none' }}
            onPointerDown={startEeBottomResize}
            role="separator"
            aria-label={locale === 'en' ? 'Resize bottom edge' : '하단 크기 조절'}
          />
        </div>
      )}

      {/* ── 라이트 프로퍼티 패널 ── */}
      {showLight && (
        <PropertyPanel
          theme={uiThemeMode}
          initialX={lightInitialX}
          initialY={lightInitialY}
          syncedPosition={lightPos}
          onHeaderDragChange={onPropertyHeaderDragChange}
          selectedObjectId={selectedObjectId}
          onClose={() => setShowLight(false)}
          onPosChange={handleLightPosChange}
          data={panelData}
          setData={setPanelData}
          selectedMotionSeqId={selectedMotionSeqId}
          setSelectedMotionSeqId={setSelectedMotionSeqId}
          selectedMotionUploadKey={selectedMotionUploadKey}
          setSelectedMotionUploadKey={setSelectedMotionUploadKey}
          onMotionCategoryChange={handleMotionCategoryChange}
          onCollisionCategoryChange={handleCollisionCategoryChange}
          onEndEffectorCategoryChange={handleEndEffectorCategoryChange}
          endeffectorActiveCategoryId={endeffectorActiveCategoryId}
          onEeFilledSlotClick={handleEeFilledSlotClick}
          selectedEeIdx={eeSelectedIdx}
          setSelectedEeIdx={setEeSelectedIdx}
          onSubModalListInteract={bumpSubModalFromPropertyList}
          treeLinkedDescription={treeLinkedDescription}
        />
      )}

    </div>
    </CollabSubModalAnchorContext.Provider>
  );
}
