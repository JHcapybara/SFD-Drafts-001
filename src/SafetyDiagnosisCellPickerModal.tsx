import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

export type SafetyDiagnosisCellItem = {
  id: string;
  labelKo: string;
  labelEn: string;
};

const DEFAULT_CELLS: SafetyDiagnosisCellItem[] = [
  { id: 'cell-1', labelKo: '셀 이름', labelEn: 'Cell name' },
  { id: 'cell-2', labelKo: '셀 이름', labelEn: 'Cell name' },
  { id: 'cell-3', labelKo: '셀 이름', labelEn: 'Cell name' },
  { id: 'cell-4', labelKo: '셀 이름', labelEn: 'Cell name' },
];

type Props = {
  open: boolean;
  locale: 'ko' | 'en';
  isDark: boolean;
  /** Analysis 헤더 버튼 — 드롭다운처럼 버튼 아래에 맞춤 */
  anchorRef: React.RefObject<HTMLElement | null>;
  cells?: SafetyDiagnosisCellItem[];
  onClose: () => void;
  /** 확인 시 선택된 셀(이름 표시용) */
  onConfirm?: (cell: SafetyDiagnosisCellItem) => void;
};

/**
 * 안전진단 셀 선택 모달 — 헤더 Analysis 버튼 기준 드롭다운형 패널
 */
export function SafetyDiagnosisCellPickerModal({
  open,
  locale,
  isDark,
  anchorRef,
  cells = DEFAULT_CELLS,
  onClose,
  onConfirm,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [selectedId, setSelectedId] = useState(cells[0]?.id ?? '');

  useEffect(() => {
    if (open && cells.length) setSelectedId(cells[0].id);
  }, [open, cells]);

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: r.bottom + 8,
      right: Math.max(8, window.innerWidth - r.right),
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  const handleConfirm = () => {
    const cell = cells.find((c) => c.id === selectedId);
    if (cell) onConfirm?.(cell);
    onClose();
  };

  if (!open) return null;

  const bg = isDark ? 'rgba(18,20,26,0.98)' : '#ffffff';
  const border = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.12)';
  const shadow = isDark
    ? '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset'
    : '0 20px 40px rgba(15,23,42,0.14), 0 0 0 1px rgba(15,23,42,0.06)';
  const textPrimary = isDark ? '#f4f4f5' : '#18181b';
  const rowBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)';
  const placeholderBg = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)';

  const title =
    locale === 'en'
      ? 'Please select the cell to run safety diagnosis.'
      : '안전진단을 진행할 셀을 선택해주세요.';
  const confirmLabel = locale === 'en' ? 'Confirm' : '확인';
  const modalName = locale === 'en' ? 'Safety diagnosis cell selection' : '안전진단 셀 선택 모달';

  return createPortal(
    <>
      {/* 얇은 스크림 — 드롭다운 느낌 유지하면서 바깥 클릭 처리는 mousedown으로 별도 처리 */}
      <div className="fixed inset-0 z-[95] pointer-events-none" aria-hidden />
      <div
        ref={panelRef}
        id="safety-cell-picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-cell-picker-title"
        className="fixed z-[100] w-[min(360px,calc(100vw-24px))] rounded-xl border overflow-hidden pointer-events-auto flex flex-col"
        style={{
          top: pos.top,
          right: pos.right,
          background: bg,
          borderColor: border,
          boxShadow: shadow,
          backdropFilter: isDark ? 'blur(16px) saturate(165%)' : 'blur(12px)',
          WebkitBackdropFilter: isDark ? 'blur(16px) saturate(165%)' : 'blur(12px)',
        }}
      >
        <div className="sr-only">{modalName}</div>
        <div className="px-4 pt-4 pb-3">
          <p
            id="safety-cell-picker-title"
            className="text-[13px] font-semibold leading-snug"
            style={{ color: textPrimary }}
          >
            {title}
          </p>
        </div>
        <div className="px-3 pb-2 flex flex-col gap-1.5 max-h-[min(52vh,360px)] overflow-y-auto sfd-scroll">
          {cells.map((cell) => {
            const selected = cell.id === selectedId;
            const label = locale === 'en' ? cell.labelEn : cell.labelKo;
            return (
              <button
                key={cell.id}
                type="button"
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors"
                style={{
                  border: selected ? `2px solid ${isDark ? '#e5e7eb' : '#18181b'}` : `1px solid ${rowBorder}`,
                  background: selected
                    ? isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(15,23,42,0.03)'
                    : 'transparent',
                }}
                onClick={() => setSelectedId(cell.id)}
              >
                <div
                  className="shrink-0 rounded-[4px] w-9 h-9"
                  style={{ background: placeholderBg }}
                  aria-hidden
                />
                <span className="text-[12px] font-medium min-w-0 truncate" style={{ color: textPrimary }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <div
          className="px-3 py-3 border-t"
          style={{
            borderColor: rowBorder,
            background: isDark ? 'rgba(12,14,18,0.85)' : 'rgba(250,250,250,0.96)',
          }}
        >
          <button
            type="button"
            className="w-full min-h-11 rounded-[10px] text-[13px] font-bold border-2 transition-opacity hover:opacity-95"
            style={{
              borderColor: 'rgba(255,220,140,0.95)',
              color: '#1a0a00',
              background: 'linear-gradient(180deg, #fff4e0 0%, #ffcc66 22%, #ff8e2b 52%, #ea6c12 100%)',
              boxShadow: `0 6px 18px ${accentRgba(POINT_ORANGE, 0.35)}`,
            }}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
