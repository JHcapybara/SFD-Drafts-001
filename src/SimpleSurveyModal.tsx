import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ChevronDown, X } from 'lucide-react';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

const DRAG_THRESHOLD_PX = 8;
const FAB_WIDTH = 132;
const FAB_HEIGHT = 42;

type Theme = 'light' | 'dark';

function useModalTokens(isDark: boolean) {
  return useMemo(() => {
    if (isDark) {
      return {
        scrim: 'rgba(0,0,0,0.62)',
        scrimBlur: 'blur(6px)',
        bg: 'rgba(18,20,26,0.98)',
        border: 'rgba(255,255,255,0.14)',
        shadow: '0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
        text: '#f4f4f5',
        muted: 'rgba(228,228,231,0.72)',
        hairline: 'rgba(255,255,255,0.1)',
        card: 'rgba(255,255,255,0.04)',
        cardNested: 'rgba(255,255,255,0.06)',
        input: 'rgba(255,255,255,0.08)',
      };
    }
    return {
      scrim: 'rgba(0,0,0,0.5)',
      scrimBlur: 'blur(2px)',
      bg: '#ffffff',
      border: 'rgba(15,23,42,0.12)',
      shadow: '0 24px 48px rgba(15,23,42,0.18)',
      text: '#0f172a',
      muted: '#52525b',
      hairline: 'rgba(15,23,42,0.1)',
      card: '#fafafa',
      cardNested: '#ffffff',
      input: 'rgba(15,23,42,0.06)',
    };
  }, [isDark]);
}

function copy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      modalTitle: 'Quick survey',
      fabLabel: 'Quick survey',
      colItem: 'Item',
      colContent: 'Details',
      colYes: 'Yes',
      colNo: 'No',
      category: 'E-stop',
      question: 'Are a sufficient number of emergency stop devices installed?',
      fenceTag: 'Fence',
      residualNote: '(Residual risk)',
      subWorkerEntry: 'Worker entry possibility',
      fenceBody:
        'Fence height 1,800 mm prevents normal reach, but reaching the upper part remains possible using aids (ladder, boxes, etc.).',
      recoTitle: 'Recommended actions',
      reco1: '· Establish rules prohibiting bringing aids into the work zone',
      reco2: '· Attach warning labels on the top of the fence',
      reco3: '· Keep records of completed worker safety training',
      confirmBlock: 'Done',
      report: 'Apply to risk assessment report',
      confirmFooter: 'Confirm',
      close: 'Close',
      sectionResidual: 'Residual risk — fence',
      sectionSurveyList: 'Survey',
      expandItem: 'Expand details for this item',
      collapseItem: 'Collapse details for this item',
      detailTitle: 'Details',
      detailBody:
        'Check criteria, evidence (photos, drawings), prior assessment notes, and linked standards for this item would appear here. (Mockup)',
    };
  }
  return {
    modalTitle: '간이 설문',
    fabLabel: '간이 설문',
    colItem: '설문 항목',
    colContent: '내용',
    colYes: '예',
    colNo: '아니오',
    category: '비상정지',
    question: '비상정지 장치는 충분한 수량이 설치되어 있는가?',
    fenceTag: '펜스',
    residualNote: '(잔존 위험)',
    subWorkerEntry: '작업자 진입 가능성',
    fenceBody:
      '펜스 높이 1,800mm로 일반 도달은 불가하나, 보조 수단(사다리, 박스 등) 사용 시 상단부 도달 가능성이 잔존합니다.',
    recoTitle: '권고 조치',
    reco1: '· 작업구역 내 보조 수단 반입 금지 규정 수립',
    reco2: '· 펜스 상단부 경고 표지 부착',
    reco3: '· 작업자 안전교육 이수 기록 관리',
    confirmBlock: '확인완료',
    report: '위험성 평가 보고서에 반영',
    confirmFooter: '확인완료',
    close: '닫기',
    sectionResidual: '잔존 위험 — 펜스',
    sectionSurveyList: '설문',
    expandItem: '이 항목 상세 펼치기',
    collapseItem: '이 항목 상세 접기',
    detailTitle: '상세 안내',
    detailBody:
      '이 항목의 점검 기준, 증빙(사진·도면), 이전 평가 이력, 연결된 기준 조항 등이 이 영역에 표시됩니다. (목업)',
  };
}

const ROW_IDS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const;
/** 첫 카드 2번째 행을 펼치면 펜스 잔존 위험 상세가 표시됩니다. */
const ROW_ID_FENCE_DETAIL = 'r2';

export type SimpleSurveyModalProps = {
  open: boolean;
  locale: 'ko' | 'en';
  theme: Theme;
  onClose: () => void;
};

export function SimpleSurveyModal({ open, locale, theme, onClose }: SimpleSurveyModalProps) {
  const isDark = theme === 'dark';
  const t = useModalTokens(isDark);
  const L = copy(locale);
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no' | null>>(() =>
    Object.fromEntries(ROW_IDS.map((id) => [id, null])) as Record<string, 'yes' | 'no' | null>,
  );
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  useEffect(() => {
    if (open) setExpandedRowId(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const setAnswer = useCallback((id: string, v: 'yes' | 'no') => {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }, []);

  if (!open || typeof document === 'undefined') return null;

  const fenceDetail = (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        borderColor: t.hairline,
        background: t.card,
        boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,0.04)' : '0 1px 0 rgba(15,23,42,0.04) inset',
      }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: t.hairline, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,142,43,0.04)' }}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{
              color: POINT_ORANGE,
              background: accentRgba(POINT_ORANGE, isDark ? 0.18 : 0.12),
              border: `1px solid ${accentRgba(POINT_ORANGE, isDark ? 0.35 : 0.25)}`,
            }}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
            {L.residualNote}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: t.text }}>
            {L.fenceTag}
          </span>
        </div>
        <p className="mt-2.5 text-[13px] font-semibold leading-snug" style={{ color: t.text }}>
          {L.subWorkerEntry}
        </p>
      </div>
      <div className="p-4 space-y-3">
        <div
          className="rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed"
          style={{ borderColor: t.hairline, background: t.cardNested, color: t.muted }}
        >
          {L.fenceBody}
        </div>
        <div
          className="rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed"
          style={{
            borderLeftWidth: 3,
            borderLeftColor: POINT_ORANGE,
            borderTopColor: t.hairline,
            borderRightColor: t.hairline,
            borderBottomColor: t.hairline,
            background: accentRgba(POINT_ORANGE, isDark ? 0.08 : 0.07),
            color: t.muted,
          }}
        >
          <p className="text-[12px] font-bold mb-2 tracking-tight" style={{ color: t.text }}>
            {L.recoTitle}
          </p>
          <ul className="space-y-1.5 list-none pl-0">
            <li className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-current before:opacity-60">
              {L.reco1.replace(/^·\s*/, '')}
            </li>
            <li className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-current before:opacity-60">
              {L.reco2.replace(/^·\s*/, '')}
            </li>
            <li className="pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-current before:opacity-60">
              {L.reco3.replace(/^·\s*/, '')}
            </li>
          </ul>
        </div>
        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            className="rounded-lg px-4 py-2 text-[12px] font-semibold border transition-opacity hover:opacity-90"
            style={{
              borderColor: t.hairline,
              background: t.cardNested,
              color: t.text,
            }}
          >
            {L.confirmBlock}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccordionDetail = (id: string) => {
    if (id === ROW_ID_FENCE_DETAIL) return fenceDetail;
    return (
      <div
        className="rounded-xl border px-3.5 py-3 text-[12px] leading-relaxed"
        style={{ borderColor: t.hairline, background: t.cardNested, color: t.muted }}
      >
        <p className="mb-1.5 font-semibold" style={{ color: t.text }}>
          {L.detailTitle}
        </p>
        <p>{L.detailBody}</p>
      </div>
    );
  };

  const surveyRow = (id: string) => {
    const expanded = expandedRowId === id;
    const panelId = `survey-row-panel-${id}`;
    return (
      <div key={id} className="border-b last:border-b-0" style={{ borderColor: t.hairline }}>
        <div className="flex items-start gap-1.5 px-1.5 py-3 sm:gap-2 sm:px-2">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-start gap-2 rounded-lg px-1 py-0.5 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/55"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={expanded ? L.collapseItem : L.expandItem}
            onClick={() => setExpandedRowId((cur) => (cur === id ? null : id))}
          >
            <span className="flex h-8 w-7 shrink-0 items-center justify-center pt-0.5" style={{ color: POINT_ORANGE }} aria-hidden>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                strokeWidth={2.4}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-semibold leading-snug" style={{ color: t.text }}>
                {L.category}
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed" style={{ color: t.muted }}>
                {L.question}
              </span>
            </span>
          </button>
          <div className="flex shrink-0 flex-col items-stretch gap-1.5 self-center sm:flex-row sm:items-center sm:gap-2">
            <label className="flex cursor-pointer items-center justify-center">
              <input
                type="radio"
                className="sr-only peer"
                name={`survey-${id}`}
                checked={answers[id] === 'yes'}
                onChange={() => setAnswer(id, 'yes')}
              />
              <span
                className="flex h-7 min-w-[2.25rem] items-center justify-center rounded-lg border px-1 text-[11px] font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400/60"
                style={{
                  borderColor: answers[id] === 'yes' ? POINT_ORANGE : t.hairline,
                  background: answers[id] === 'yes' ? accentRgba(POINT_ORANGE, isDark ? 0.2 : 0.12) : t.input,
                  color: answers[id] === 'yes' ? POINT_ORANGE : t.muted,
                }}
              >
                {L.colYes}
              </span>
            </label>
            <label className="flex cursor-pointer items-center justify-center">
              <input
                type="radio"
                className="sr-only peer"
                name={`survey-${id}`}
                checked={answers[id] === 'no'}
                onChange={() => setAnswer(id, 'no')}
              />
              <span
                className="flex h-7 min-w-[2.25rem] items-center justify-center rounded-lg border px-1 text-[11px] font-bold transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-orange-400/60"
                style={{
                  borderColor: answers[id] === 'no' ? POINT_ORANGE : t.hairline,
                  background: answers[id] === 'no' ? accentRgba(POINT_ORANGE, isDark ? 0.2 : 0.12) : t.input,
                  color: answers[id] === 'no' ? POINT_ORANGE : t.muted,
                }}
              >
                {L.colNo}
              </span>
            </label>
          </div>
        </div>
        {expanded ? (
          <div
            id={panelId}
            className="border-t px-2.5 pb-4 pt-3 sm:px-3"
            style={{ borderColor: t.hairline }}
            role="region"
            aria-label={id === ROW_ID_FENCE_DETAIL ? L.sectionResidual : L.detailTitle}
          >
            {renderAccordionDetail(id)}
          </div>
        ) : null}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[104] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        style={{
          background: t.scrim,
          backdropFilter: t.scrimBlur,
          WebkitBackdropFilter: t.scrimBlur,
        }}
        aria-label={L.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="simple-survey-title"
        className="relative w-full max-w-[640px] max-h-[min(90vh,820px)] rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
        style={{
          borderColor: t.border,
          background: t.bg,
          boxShadow: t.shadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="shrink-0 flex items-center gap-3 px-4 py-3.5 border-b"
          style={{
            borderColor: t.hairline,
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,250,252,0.95)',
          }}
        >
          <span
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              borderColor: accentRgba(POINT_ORANGE, isDark ? 0.35 : 0.22),
              background: accentRgba(POINT_ORANGE, isDark ? 0.14 : 0.1),
            }}
            aria-hidden
          >
            <AlertTriangle className="h-4 w-4" strokeWidth={2.2} style={{ color: POINT_ORANGE }} />
          </span>
          <h2 id="simple-survey-title" className="flex-1 min-w-0 text-[15px] font-semibold tracking-tight truncate" style={{ color: t.text }}>
            {L.modalTitle}
          </h2>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              color: t.muted,
            }}
            aria-label={L.close}
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-4 py-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-wide" style={{ color: t.muted }}>
                {L.sectionSurveyList}
              </p>
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ borderColor: t.hairline, background: t.card }}
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5"
                  style={{ borderColor: t.hairline }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: t.text }}>
                    {L.colItem}
                    <span style={{ color: t.muted }}> · {L.colContent}</span>
                  </span>
                  <span className="flex items-center gap-4 text-[11px] font-bold" style={{ color: t.muted }}>
                    <span className="min-w-[2.5rem] text-center">{L.colYes}</span>
                    <span className="min-w-[2.5rem] text-center">{L.colNo}</span>
                  </span>
                </div>
                <div className="px-0.5">{ROW_IDS.map((rid) => surveyRow(rid))}</div>
              </div>
            </div>
          </div>

          <div
            className="shrink-0 flex flex-wrap items-center justify-end gap-2 border-t px-4 py-3"
            style={{
              borderColor: t.hairline,
              background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(248,250,252,0.98)',
            }}
          >
            <button
              type="button"
              className="rounded-lg px-4 py-2.5 text-[12px] font-semibold border transition-opacity hover:opacity-90"
              style={{
                borderColor: t.hairline,
                background: t.cardNested,
                color: t.text,
              }}
            >
              {L.report}
            </button>
            <button
              type="button"
              className="rounded-lg px-4 py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 1)} 0%, #ff6b00 100%)`,
                boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.35)' : '0 4px 14px rgba(255,142,43,0.35)',
              }}
              onClick={onClose}
            >
              {L.confirmFooter}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export type SimpleSurveyFabProps = {
  locale: 'ko' | 'en';
  theme: Theme;
  onOpen: () => void;
};

/** 뷰포트(배경 캔버스) 위 드래그 가능 트리거 — 클릭 시 모달, 짧은 이동은 드래그로 처리 */
export function SimpleSurveyFab({ locale, theme, onOpen }: SimpleSurveyFabProps) {
  const isDark = theme === 'dark';
  const L = copy(locale);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [placed, setPlaced] = useState(false);

  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    startClientX: 0,
    startClientY: 0,
    moved: false,
  });

  const clampPos = useCallback((x: number, y: number) => {
    const margin = 8;
    const fabW = FAB_WIDTH;
    const maxX = window.innerWidth - fabW - margin;
    const maxY = window.innerHeight - FAB_HEIGHT - margin;
    const minY = WORKSPACE_CONTENT_TOP_PX + margin;
    return {
      x: Math.min(maxX, Math.max(margin, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }, []);

  useLayoutEffect(() => {
    const cx = window.innerWidth / 2 - FAB_WIDTH / 2;
    const cy =
      WORKSPACE_CONTENT_TOP_PX +
      (window.innerHeight - WORKSPACE_CONTENT_TOP_PX - 8) / 2 -
      FAB_HEIGHT / 2;
    setPos(clampPos(cx, cy));
    setPlaced(true);
  }, [clampPos]);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPos(p.x, p.y));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [clampPos]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
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

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragRef.current.active) return;
    const dx = Math.abs(e.clientX - dragRef.current.startClientX);
    const dy = Math.abs(e.clientY - dragRef.current.startClientY);
    if (dx > DRAG_THRESHOLD_PX || dy > DRAG_THRESHOLD_PX) dragRef.current.moved = true;
    setPos(clampPos(e.clientX + dragRef.current.offsetX, e.clientY + dragRef.current.offsetY));
  };

  const endPointer = (e: React.PointerEvent<HTMLButtonElement>, openIfClick: boolean) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (openIfClick && !dragRef.current.moved) onOpen();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => endPointer(e, true);

  const onPointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => endPointer(e, false);

  if (!placed) return null;

  return (
    <button
      type="button"
      className="fixed z-[24] flex items-center justify-center gap-2 rounded-xl border px-3 py-2 shadow-lg select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        minWidth: FAB_WIDTH,
        minHeight: FAB_HEIGHT,
        borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.12)',
        background: isDark ? 'rgba(24,25,30,0.92)' : 'rgba(255,255,255,0.96)',
        color: isDark ? '#f8fafc' : '#0f172a',
        boxShadow: isDark
          ? '0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,142,43,0.25) inset'
          : '0 8px 24px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,142,43,0.2) inset',
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
      }}
      aria-label={L.fabLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: POINT_ORANGE }} aria-hidden />
      <span className="text-[12px] font-semibold whitespace-nowrap">{L.fabLabel}</span>
    </button>
  );
}
