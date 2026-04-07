import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AppLocale } from './types';
import { COLLAB_BODY_PART_ICON_INDEX, COLLAB_BODY_PART_OPTIONS } from './panelData';
import type { Tokens } from './PropertyPanel';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import { SfdChevronDropdown } from './sfd/SfdChevronIcons';

/** 패널 전반과 동일한 포인트(브랜드 오렌지) */
const BODY_PART_ACCENT = '#ff8e2b';

function bodyPartIconIndex(id: string): number {
  const k = id as keyof typeof COLLAB_BODY_PART_ICON_INDEX;
  return COLLAB_BODY_PART_ICON_INDEX[k] ?? COLLAB_BODY_PART_ICON_INDEX['hand-palm-d'];
}

export function SubHeading({ text, t }: { text: string; t: Tokens }) {
  return (
    <p className="text-[12px] px-0.5 pt-0.5 pb-1" style={{ color: t.textSecondary, fontWeight: 600, letterSpacing: '0.02em' }}>
      {text}
    </p>
  );
}

export function DoubleMmRow({
  labels,
  values,
  onChange,
  t,
  unitLabel,
}: {
  labels: [string, string];
  values: [string, string];
  onChange: (i: 0 | 1, v: string) => void;
  t: Tokens;
  unitLabel: string;
}) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5 w-full items-center">
      {([0, 1] as const).map((i) => (
        <div
          key={labels[i]}
          className="relative flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px] transition-all duration-150"
          style={{
            background: t.inputBg,
            border: `1px solid ${fi === i ? t.inputFocusBorder : t.inputBorder}`,
            boxShadow: fi === i ? t.inputFocusShadow : 'none',
          }}
        >
          <span className="text-[12px] shrink-0 leading-none" style={{ color: '#ff8e2b', fontWeight: 700 }}>
            {labels[i]}
          </span>
          <input
            className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
            style={{ color: t.textValue, fontWeight: 500 }}
            value={values[i]}
            onChange={(e) => onChange(i, e.target.value)}
            onFocus={() => setFi(i)}
            onBlur={() => setFi(null)}
          />
        </div>
      ))}
      <span className="text-[11px] shrink-0 px-0.5" style={{ color: t.textSecondary, fontWeight: 500 }}>
        {unitLabel}
      </span>
    </div>
  );
}

/** 충돌 예상 신체 부위 — 아이콘 + 라벨 커스텀 드롭다운 (서브레이어·편집 모달 공통) */
export function CollabBodyPartPicker({
  value,
  onChange,
  t,
  theme,
  locale,
  bodyPartTitle,
}: {
  value: string;
  onChange: (id: string) => void;
  t: Tokens;
  theme: 'light' | 'dark';
  locale: AppLocale;
  bodyPartTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 4;
    setMenuRect({ top: r.bottom + gap, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuRect(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const n = e.target as Node;
      if (triggerRef.current?.contains(n)) return;
      if (listRef.current?.contains(n)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const selectedOpt = COLLAB_BODY_PART_OPTIONS.find((o) => o.id === value) ?? COLLAB_BODY_PART_OPTIONS[0];
  const borderColor = open ? BODY_PART_ACCENT : t.inputBorder;
  const focusRing = open ? `0 0 0 2px ${theme === 'light' ? 'rgba(255,142,43,0.22)' : 'rgba(255,142,43,0.28)'}` : 'none';
  const listBg = t.panelBg;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12px] px-0.5 pt-0.5" style={{ color: t.textSecondary, fontWeight: 600 }}>
        {bodyPartTitle}
      </p>
      <div className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={bodyPartTitle}
          onClick={() => setOpen((o) => !o)}
          className="w-full rounded-[8px] px-2.5 py-2 text-left min-h-[38px] flex items-center gap-2 border outline-none transition-[border-color,box-shadow] duration-150"
          style={{
            background: t.inputBg,
            borderColor,
            color: t.textValue,
            boxShadow: focusRing,
          }}
        >
          <SfdIconByIndex index={bodyPartIconIndex(value)} color={BODY_PART_ACCENT} size={18} />
          <span className="flex-1 min-w-0 text-[12px] font-medium truncate">
            {locale === 'en' ? selectedOpt.labelEn : selectedOpt.labelKo}
          </span>
          <SfdChevronDropdown open={open} color={t.textSecondary} size={16} />
        </button>

        {open && menuRect
          ? createPortal(
              <ul
                ref={listRef}
                role="listbox"
                className="max-h-56 overflow-y-auto sfd-scroll rounded-[10px] border py-1 shadow-xl"
                style={{
                  position: 'fixed',
                  top: menuRect.top,
                  left: menuRect.left,
                  width: menuRect.width,
                  zIndex: 10050,
                  background: listBg,
                  borderColor: t.inputBorder,
                  boxShadow:
                    theme === 'light'
                      ? '0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)'
                      : '0 16px 48px rgba(0,0,0,0.45)',
                  backdropFilter: theme === 'dark' ? 'blur(22px) saturate(160%)' : 'blur(12px) saturate(145%)',
                  WebkitBackdropFilter: theme === 'dark' ? 'blur(22px) saturate(160%)' : 'blur(12px) saturate(145%)',
                }}
              >
                {COLLAB_BODY_PART_OPTIONS.map((opt) => {
                  const sel = opt.id === value;
                  return (
                    <li key={opt.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={sel}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2.5 text-left text-[12px] transition-colors rounded-[6px] mx-0.5"
                        style={{
                          background: sel ? 'rgba(255,142,43,0.14)' : 'transparent',
                          color: t.textPrimary,
                          fontWeight: sel ? 600 : 500,
                        }}
                        onMouseEnter={(e) => {
                          if (!sel) (e.currentTarget as HTMLButtonElement).style.background = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.07)';
                        }}
                        onMouseLeave={(e) => {
                          if (!sel) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }}
                        onClick={() => {
                          onChange(opt.id);
                          setOpen(false);
                        }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]"
                          style={{
                            background: sel ? 'rgba(255,142,43,0.2)' : theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
                          }}
                        >
                          <SfdIconByIndex
                            index={bodyPartIconIndex(opt.id)}
                            color={sel ? BODY_PART_ACCENT : t.textSecondary}
                            size={18}
                          />
                        </span>
                        <span className="flex-1 min-w-0 leading-snug">{locale === 'en' ? opt.labelEn : opt.labelKo}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>,
              document.body,
            )
          : null}
      </div>
    </div>
  );
}
