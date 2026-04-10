import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles, X } from 'lucide-react';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

const DRAG_THRESHOLD_PX = 8;
/** 원형 FAB 지름 */
const FAB_SIZE = 56;
const SHEET_W = 360;
const DOCK_MARGIN = 8;

type Theme = 'light' | 'dark';

function strings(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      fabLabel: 'Need a hand?',
      fabCollapse: 'Collapse help',
      panelTitle: 'Heads up',
      close: 'Close',
      lead: 'Something looks off here — please take a quick look.',
      hint: 'Use the buttons below for more. Drag the round button to move this widget.',
      btnDetails: 'Show me more',
      btnRecheck: 'Let me recheck',
      btnDismiss: 'OK, close',
      expandedTitle: 'A little more detail',
      expandedBody:
        'This is a sample follow-up area: checklists, links, or next steps could live here. In the real product, this would open after you tap the button above.',
    };
  }
  return {
    fabLabel: '도움이 필요해요',
    fabCollapse: '도움말 접기',
    panelTitle: '잠깐만요',
    close: '닫기',
    lead: '여기 뭔가 잘못되었어요. 한번 확인해 보세요!',
    hint: '아래 버튼으로 더 보기. 둥근 버튼을 드래그하면 위젯을 옮길 수 있어요.',
    btnDetails: '자세히 볼게요',
    btnRecheck: '다시 확인할게요',
    btnDismiss: '알겠어요, 닫기',
    expandedTitle: '조금 더 자세히',
    expandedBody:
      '여기는 버튼을 눌렀을 때 펼쳐지는 안내 영역 예시입니다. 실제 서비스에서는 점검 항목, 바로가기, 다음 할 일 등을 넣을 수 있어요.',
  };
}

export type FloatingUiFabProps = {
  locale: 'ko' | 'en';
  theme: Theme;
};

/**
 * 원형 플로팅 버튼 + 클릭 시 아래로 펼쳐지는 도움말 시트 (한 컴포넌트)
 */
export function FloatingUiFab({ locale, theme }: FloatingUiFabProps) {
  const isDark = theme === 'dark';
  const L = strings(locale);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    startClientX: 0,
    startClientY: 0,
    moved: false,
  });

  const effSheetW = Math.min(SHEET_W, typeof window !== 'undefined' ? window.innerWidth - 2 * DOCK_MARGIN : SHEET_W);

  const clampDock = useCallback(
    (x: number, y: number) => {
      const w = Math.max(FAB_SIZE, effSheetW);
      const maxX = window.innerWidth - w - DOCK_MARGIN;
      const maxY = window.innerHeight - FAB_SIZE - DOCK_MARGIN;
      const minY = WORKSPACE_CONTENT_TOP_PX + DOCK_MARGIN;
      return {
        x: Math.min(maxX, Math.max(DOCK_MARGIN, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      };
    },
    [effSheetW],
  );

  useLayoutEffect(() => {
    const cx = window.innerWidth / 2 - FAB_SIZE / 2 - 200;
    const cy =
      WORKSPACE_CONTENT_TOP_PX +
      (window.innerHeight - WORKSPACE_CONTENT_TOP_PX - 8) / 2 -
      FAB_SIZE / 2;
    setPos(clampDock(cx, cy));
    setPlaced(true);
  }, [clampDock]);

  useEffect(() => {
    const onResize = () => setPos((p) => clampDock(p.x, p.y));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampDock]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false);
        setDetailsOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  useEffect(() => {
    if (!sheetOpen) return;
    const onDoc = (e: MouseEvent | PointerEvent) => {
      const el = dockRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setSheetOpen(false);
      setDetailsOpen(false);
    };
    document.addEventListener('pointerdown', onDoc, true);
    return () => document.removeEventListener('pointerdown', onDoc, true);
  }, [sheetOpen]);

  const onFabPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      active: true,
      offsetX: pos.x - e.clientX,
      offsetY: pos.y - e.clientY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      moved: false,
    };
  };

  const onFabPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;
    const dx = Math.abs(e.clientX - dragRef.current.startClientX);
    const dy = Math.abs(e.clientY - dragRef.current.startClientY);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) dragRef.current.moved = true;
    setPos(clampDock(e.clientX + dragRef.current.offsetX, e.clientY + dragRef.current.offsetY));
  };

  const endFabPointer = (e: React.PointerEvent<HTMLButtonElement>, allowToggle: boolean) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (allowToggle && !dragRef.current.moved) {
      setSheetOpen((o) => {
        const next = !o;
        if (!next) setDetailsOpen(false);
        return next;
      });
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setDetailsOpen(false);
  };

  if (!placed) return null;

  const shellBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)';
  const shellBg = isDark ? 'rgba(22,23,28,0.96)' : 'rgba(255,255,255,0.98)';
  const muted = isDark ? '#a1a1aa' : '#64748b';
  const text = isDark ? '#f4f4f5' : '#0f172a';

  /** 기본(접힘) 상태: 중심(0,0) 주황 펼침 블러 80px */
  const fabIdleOrangeGlow = `0 0 80px ${accentRgba(POINT_ORANGE, isDark ? 0.48 : 0.4)}`;
  const fabBaseShadow = isDark
    ? `0 14px 36px rgba(0,0,0,0.5), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.35)} inset, 0 0 28px ${accentRgba(POINT_ORANGE, 0.2)}`
    : `0 12px 32px rgba(15,23,42,0.18), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.22)} inset, 0 4px 20px ${accentRgba(POINT_ORANGE, 0.15)}`;

  return (
    <div
      ref={dockRef}
      className="fixed z-[24] flex flex-col items-start gap-2.5"
      style={{ left: pos.x, top: pos.y, width: effSheetW }}
    >
      <button
        type="button"
        className="group relative flex shrink-0 select-none touch-none items-center justify-center rounded-full border-2 outline-none transition-[transform,box-shadow] duration-200 hover:scale-[1.06] active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-400/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          borderColor: accentRgba(POINT_ORANGE, isDark ? 0.55 : 0.45),
          background: isDark
            ? `linear-gradient(155deg, rgba(40,42,52,0.98) 0%, rgba(22,23,30,0.98) 100%)`
            : `linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)`,
          color: POINT_ORANGE,
          boxShadow: sheetOpen ? fabBaseShadow : `${fabIdleOrangeGlow}, ${fabBaseShadow}`,
          backdropFilter: 'blur(14px) saturate(170%)',
          WebkitBackdropFilter: 'blur(14px) saturate(170%)',
        }}
        aria-label={sheetOpen ? L.fabCollapse : L.fabLabel}
        aria-expanded={sheetOpen}
        aria-controls="floating-ui-sheet"
        onPointerDown={onFabPointerDown}
        onPointerMove={onFabPointerMove}
        onPointerUp={(e) => endFabPointer(e, true)}
        onPointerCancel={(e) => endFabPointer(e, false)}
      >
        <span
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 30% 25%, ${accentRgba(POINT_ORANGE, 0.35)} 0%, transparent 55%)`,
          }}
          aria-hidden
        />
        <Sparkles className="relative z-[1] h-7 w-7" strokeWidth={2.2} aria-hidden />
        <ChevronDown
          className={`pointer-events-none absolute bottom-1.5 left-1/2 z-[1] h-3 w-3 -translate-x-1/2 opacity-[0.65] transition-transform duration-200 ${
            sheetOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={2.8}
          aria-hidden
        />
      </button>

      <div
        id="floating-ui-sheet"
        className={`w-full overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          sheetOpen ? 'max-h-[min(72vh,560px)] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        role="region"
        aria-labelledby="floating-ui-sheet-title"
        hidden={!sheetOpen}
      >
        <div
          className="flex max-h-[min(72vh,560px)] flex-col gap-3 overflow-y-auto rounded-2xl border p-3 shadow-2xl sfd-scroll"
          style={{
            borderColor: shellBorder,
            background: shellBg,
            boxShadow: isDark
              ? `0 18px 40px rgba(0,0,0,0.45), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.18)} inset`
              : `0 16px 36px rgba(15,23,42,0.12), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.14)} inset`,
            backdropFilter: 'blur(16px) saturate(170%)',
            WebkitBackdropFilter: 'blur(16px) saturate(170%)',
          }}
        >
          <div className="flex items-center gap-2 border-b pb-2.5" style={{ borderColor: shellBorder }}>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
              style={{
                borderColor: accentRgba(POINT_ORANGE, isDark ? 0.4 : 0.28),
                background: accentRgba(POINT_ORANGE, isDark ? 0.16 : 0.1),
              }}
              aria-hidden
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.2} style={{ color: POINT_ORANGE }} />
            </span>
            <h2 id="floating-ui-sheet-title" className="min-w-0 flex-1 text-[13px] font-bold tracking-tight" style={{ color: text }}>
              {L.panelTitle}
            </h2>
            <button
              type="button"
              className="shrink-0 rounded-full p-2 transition-opacity hover:opacity-90"
              style={{
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.06)',
                color: muted,
              }}
              aria-label={L.close}
              onClick={closeSheet}
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5 px-0.5 text-center">
            <p className="text-[14px] font-bold leading-snug sm:text-[15px]" style={{ color: text }}>
              {L.lead}
            </p>
            <p className="text-[12px] leading-relaxed sm:text-[13px]" style={{ color: muted }}>
              {L.hint}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold text-white transition-opacity hover:opacity-92"
              style={{
                background: `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 1)} 0%, #ea580c 100%)`,
                boxShadow: `0 6px 18px ${accentRgba(POINT_ORANGE, 0.38)}`,
              }}
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((v) => !v)}
            >
              {L.btnDetails}
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`}
                strokeWidth={2.4}
                aria-hidden
              />
            </button>
            <button
              type="button"
              className="w-full rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-opacity hover:opacity-90"
              style={{
                borderColor: shellBorder,
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
                color: text,
              }}
              onClick={closeSheet}
            >
              {L.btnRecheck}
            </button>
            <button
              type="button"
              className="w-full rounded-xl px-4 py-2 text-[12px] font-medium transition-opacity hover:opacity-85"
              style={{ color: muted }}
              onClick={closeSheet}
            >
              {L.btnDismiss}
            </button>
          </div>

          <div
            className={`grid transition-[grid-template-rows] duration-200 ease-out ${detailsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className="rounded-xl border px-3.5 py-3 text-left text-[12px] leading-relaxed"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.04)' : accentRgba(POINT_ORANGE, 0.05),
                  color: muted,
                }}
              >
                <p className="mb-1.5 font-semibold" style={{ color: text }}>
                  {L.expandedTitle}
                </p>
                <p>{L.expandedBody}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
