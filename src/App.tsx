import { useState, useCallback, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import CategoryMenu, { SUB_MODAL_GAP, SUB_MODAL_WIDTH, VIEWPORT_MARGIN } from './CategoryMenu';
import PropertyPanel from './PropertyPanel';
import { useLocale } from './localeContext';
import type { PanelData } from './panelData';
import { DEFAULT_DATA } from './panelData';
import { CollabSubModalAnchorContext } from './collabSubModalAnchorContext';
import type { CollabSubModalAnchorRect } from './collabSubModalAnchorContext';
// 헤더 메타는 menuData의 OBJECTS_MODAL_CONTEXT (상위 로봇 1대). 씬별로 바꾸려면 CategoryMenu에 workspaceContext={...} 전달

// Objects 모달 너비 + 간격
const CATEGORY_MENU_WIDTH = 200;
const CATEGORY_MENU_GAP = 8;
/** PropertyPanel `w-[320px]` 과 동일 (서브모달 도킹용) */
const PROPERTY_PANEL_WIDTH = 320;
/** false → 항상 펼침(라벨 항상 표시, 이전 UX). true → 기본은 아이콘만, 호버 시 펼침. */
const CATEGORY_MENU_EXPAND_ON_HOVER = true;

export default function App() {
  const { locale, toggleLocale, L } = useLocale();
  const [showLight, setShowLight] = useState(true);

  // 선택된 오브젝트 상태 (PropertyPanel 탭 구성에 사용)
  const [selectedObjectId, setSelectedObjectId] = useState('manipulator');

  const lightInitialX = Math.max(0, window.innerWidth - 348);

  // 라이트 패널 위치 상태 — Objects 모달이 항상 이 위치 기준으로 좌측에 붙어 이동
  const [lightPos, setLightPos] = useState({ x: lightInitialX, y: 24 });
  const lightPosRef = useRef(lightPos);
  lightPosRef.current = lightPos;

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
  const [eeSelectedIdx, setEeSelectedIdx] = useState<number | null>(0);
  /** 업로드 모션 리스트 선택(파일·웨이포인트) */
  const [selectedMotionUploadKey, setSelectedMotionUploadKey] = useState<string | null>(null);

  const handleMotionCategoryChange = useCallback((categoryId: string) => {
    setMotionActiveCategoryId(categoryId);
  }, []);

  const handleObjectChange = useCallback((objectId: string) => {
    setSelectedObjectId(objectId);
    setShowLight(true);
  }, []);

  const [collisionActiveCategoryId, setCollisionActiveCategoryId] = useState('collision-robot');
  const handleCollisionCategoryChange = useCallback((categoryId: string) => {
    setCollisionActiveCategoryId(categoryId);
  }, []);
  const handleEndEffectorCategoryChange = useCallback((categoryId: string) => {
    setEndeffectorActiveCategoryId(categoryId);
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

  const handleLightPosChange = useCallback((x: number, y: number) => {
    setLightPos({ x, y });
  }, []);

  /** 협동 CategoryMenu 서브모달 아래에 워크스페이스 편집 패널을 붙일 때 사용 */
  const [collabSubModalAnchorRect, setCollabSubModalAnchorRect] = useState<CollabSubModalAnchorRect | null>(null);

  /** 서브레이어(모션/충돌/협동)가 열린 상태에서 뷰포트 오른쪽으로 넘치면 Objects + 프로퍼티 패널 + 서브가 함께 보이도록 lightPos.x 클램프 */
  const subLayerOpen =
    selectedObjectId === 'motion' ||
    selectedObjectId === 'collision' ||
    selectedObjectId === 'collab' ||
    selectedObjectId === 'manipulator' ||
    (selectedObjectId === 'endeffector'
      && (endeffectorActiveCategoryId === 'ee-basic' || endeffectorActiveCategoryId === 'ee-connect'));
  useLayoutEffect(() => {
    if (!showLight || !subLayerOpen) return;

    function clampGroupForSubLayer() {
      setLightPos((prev) => {
        const vw = window.innerWidth;
        const rawMax =
          vw - VIEWPORT_MARGIN - PROPERTY_PANEL_WIDTH - SUB_MODAL_GAP - SUB_MODAL_WIDTH;
        const maxLightX = Math.max(0, rawMax);
        const minLightX = VIEWPORT_MARGIN + CATEGORY_MENU_WIDTH + CATEGORY_MENU_GAP;

        let nextX = Math.min(prev.x, maxLightX);
        if (maxLightX >= minLightX) {
          nextX = Math.max(nextX, minLightX);
        } else {
          nextX = Math.max(0, nextX);
        }

        if (Math.abs(nextX - prev.x) < 0.5) return prev;
        return { ...prev, x: nextX };
      });
    }

    clampGroupForSubLayer();
    window.addEventListener('resize', clampGroupForSubLayer);
    return () => window.removeEventListener('resize', clampGroupForSubLayer);
  }, [showLight, subLayerOpen, lightPos.x, lightPos.y]);

  // Objects 모달은 라이트 패널 왼쪽에 붙어있음
  const categoryControlledPos = {
    x: Math.max(0, lightPos.x - CATEGORY_MENU_WIDTH - CATEGORY_MENU_GAP),
    y: lightPos.y,
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

      <button
        type="button"
        onClick={toggleLocale}
        className="absolute top-4 right-4 z-40 px-3 py-2 rounded-[10px] text-[12px] font-semibold shadow-md transition-colors duration-150"
        style={{
          background: 'rgba(252,252,253,0.92)',
          color: '#111',
          border: '1px solid rgba(0,0,0,0.10)',
          backdropFilter: 'blur(12px)',
        }}
        aria-label={L.langSwitchAria}
        title={L.langSwitchAria}
      >
        {locale === 'ko' ? L.langCurrentEn : L.langCurrentKo}
      </button>

      {/* ── 카테고리 메뉴 (Objects 모달) — 라이트 패널 좌측에 붙어 이동 ── */}
      <CategoryMenu
        theme="light"
        selectedObjectId={selectedObjectId}
        onObjectChange={handleObjectChange}
        controlledPos={showLight ? categoryControlledPos : undefined}
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
      />

      {/* ── 라이트 프로퍼티 패널 ── */}
      {showLight ? (
        <PropertyPanel
          theme="light"
          initialX={lightInitialX}
          initialY={24}
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
          selectedEeIdx={eeSelectedIdx}
          setSelectedEeIdx={setEeSelectedIdx}
        />
      ) : (
        <button onClick={() => setShowLight(true)}
          className="absolute bottom-6 right-6 text-[12px] font-semibold px-3 py-1.5 rounded-[8px]"
          style={{ background: 'rgba(252,252,253,0.92)', color: '#111', border: '1px solid rgba(0,0,0,0.10)' }}>
          Light 패널 열기
        </button>
      )}

    </div>
    </CollabSubModalAnchorContext.Provider>
  );
}
