import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Info, X } from 'lucide-react';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

const DRAG_THRESHOLD_PX = 8;
const TOAST_FAB_MIN_W = 140;
const TOAST_FAB_H = 42;
/** 간이 설문 FAB와 겹치지 않게 우측으로 초기 배치 */
const TOAST_FAB_OFFSET_X = 168;

type Theme = 'light' | 'dark';

function toastCopy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      fabLabel: 'Toast message',
      message:
        'The manipulator drive type is undetermined; for manipulators, only limited analysis is performed.',
      close: 'Dismiss',
    };
  }
  return {
    fabLabel: '토스트 메시지',
    message:
      '머니퓰레이터의 운전유형이 결정되지않아 머니퓰레이터의 경우 제한적인 분석을 시행합니다.',
    close: '닫기',
  };
}

export type TopToastBarProps = {
  open: boolean;
  locale: 'ko' | 'en';
  theme: Theme;
  onClose: () => void;
};

/** 상단 헤더 바로 아래 고정 토스트 */
export function TopToastBar({ open, locale, theme, onClose }: TopToastBarProps) {
  const isDark = theme === 'dark';
  const L = toastCopy(locale);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[80] flex justify-center px-3 pointer-events-none"
      style={{ top: WORKSPACE_CONTENT_TOP_PX }}
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto flex w-full max-w-[min(56rem,calc(100vw-1.5rem))] items-center gap-3.5 rounded-2xl border px-4 py-3 shadow-lg"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
          background: isDark
            ? 'linear-gradient(165deg, rgba(32,33,40,0.98) 0%, rgba(22,23,28,0.96) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(248,250,252,0.98) 100%)',
          color: isDark ? '#f4f4f5' : '#0f172a',
          boxShadow: isDark
            ? `0 14px 36px rgba(0,0,0,0.42), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.2)} inset, 0 1px 0 rgba(255,255,255,0.06) inset`
            : `0 12px 32px rgba(15,23,42,0.1), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.14)} inset, 0 1px 0 rgba(255,255,255,0.9) inset`,
          backdropFilter: 'blur(16px) saturate(170%)',
          WebkitBackdropFilter: 'blur(16px) saturate(170%)',
        }}
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{
            borderColor: accentRgba(POINT_ORANGE, isDark ? 0.35 : 0.25),
            background: accentRgba(POINT_ORANGE, isDark ? 0.14 : 0.1),
            boxShadow: `0 0 0 1px ${accentRgba(POINT_ORANGE, 0.06)} inset`,
          }}
          aria-hidden
        >
          <Info className="h-5 w-5" strokeWidth={2.2} style={{ color: POINT_ORANGE }} />
        </div>
        <p
          className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed tracking-tight"
          style={{ color: isDark ? '#e4e4e7' : '#334155' }}
        >
          {L.message}
        </p>
        <button
          type="button"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-slate-900/10'
          }`}
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
            color: isDark ? '#a1a1aa' : '#64748b',
          }}
          aria-label={L.close}
          onClick={onClose}
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}

export type ToastMessageFabProps = {
  locale: 'ko' | 'en';
  theme: Theme;
  onOpen: () => void;
};

/** 간이 설문 FAB와 동일: 드래그 이동, 클릭 시 토스트 표시 */
export function ToastMessageFab({ locale, theme, onOpen }: ToastMessageFabProps) {
  const isDark = theme === 'dark';
  const L = toastCopy(locale);
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
    const maxX = window.innerWidth - TOAST_FAB_MIN_W - margin;
    const maxY = window.innerHeight - TOAST_FAB_H - margin;
    const minY = WORKSPACE_CONTENT_TOP_PX + margin;
    return {
      x: Math.min(maxX, Math.max(margin, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }, []);

  useLayoutEffect(() => {
    const cx = window.innerWidth / 2 - TOAST_FAB_MIN_W / 2 + TOAST_FAB_OFFSET_X;
    const cy =
      WORKSPACE_CONTENT_TOP_PX +
      (window.innerHeight - WORKSPACE_CONTENT_TOP_PX - 8) / 2 -
      TOAST_FAB_H / 2;
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

  if (!placed) return null;

  return (
    <button
      type="button"
      className="fixed z-[24] flex items-center justify-center gap-2 rounded-xl border px-3 py-2 shadow-lg select-none touch-none"
      style={{
        left: pos.x,
        top: pos.y,
        minWidth: TOAST_FAB_MIN_W,
        minHeight: TOAST_FAB_H,
        borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.12)',
        background: isDark ? 'rgba(24,25,30,0.92)' : 'rgba(255,255,255,0.96)',
        color: isDark ? '#f8fafc' : '#0f172a',
        boxShadow: isDark
          ? `0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.25)} inset`
          : `0 8px 24px rgba(15,23,42,0.12), 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.2)} inset`,
        backdropFilter: 'blur(12px) saturate(160%)',
        WebkitBackdropFilter: 'blur(12px) saturate(160%)',
      }}
      aria-label={L.fabLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPointer(e, true)}
      onPointerCancel={(e) => endPointer(e, false)}
    >
      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: POINT_ORANGE }} aria-hidden />
      <span className="text-[12px] font-semibold whitespace-nowrap">{L.fabLabel}</span>
    </button>
  );
}
