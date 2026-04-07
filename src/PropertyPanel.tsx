import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import {
  Info, GripHorizontal, Plus, Lock, Eye, FileText,
  Bot, Minus,
} from 'lucide-react';
import type { TabContentId } from './types';
import type { AppLabels } from './labels';
import { useLocale } from './localeContext';
import type {
  CollisionCategoryId,
  EeSlot,
  ManipConnectionLinks,
  ManipLinkedRow,
  MotionSeqItem,
  MotionUploadFileGroup,
  MotionUploadWaypoint,
  PanelData,
} from './panelData';
import {
  COLLISION_EXPECTED_AREA_SHAPE_ICON_INDEX,
  createMotionSeqItemMove,
  createMotionSeqItemStop,
  DEFAULT_DATA,
  formatUploadDurationSecDisplay,
  sumAllUploadGroupsDurationSec,
} from './panelData';
import {
  getCollisionEntityList,
  getCollisionSelectedIdx,
  getExpectedAreasForSelectedEntity,
  mapSelectedEntityExpectedAreas,
  setSelectedEntityIndex,
} from './collisionCategory';
import { accentRgba, accentSlotStyles, getObjectAccent } from './pointColorSchemes';
import EeModelPickerModal, { type PickedEeModel } from './EeModelPickerModal';
import { EeModelSummaryCard } from './EeModelSummaryCard';
import { CollisionGripperSection } from './CollisionGripperSection';
import { CollabWorkspacePanel } from './CollabWorkspacePanel';
import {
  PROPERTY_PANEL_CATEGORY_TAB_ROW_HEIGHT_PX,
  PROPERTY_PANEL_DRAG_HEADER_HEIGHT_PX,
} from './panelChromeHeights';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import {
  SFD_ICON_HAND_GUIDING_ADD_MOVE,
  SFD_ICON_HAND_GUIDING_ADD_STOP,
} from './sfd/motionHandGuidingIcons';
import { PP_ICON_PX } from './propertyPanelDesignTokens';
import { SfdChevronAccordion, SfdChevronDropdown, SfdChevronTree } from './sfd/SfdChevronIcons';

function formatMotionTotalSec(total: number): string {
  if (Number.isInteger(total)) return String(total);
  return total.toFixed(1);
}

/** 생성 모션 리스트 — MoveL 102, MoveJ 103, 대기 104 */
function motionSeqRowIconIndex(it: MotionSeqItem): number {
  if (it.kind !== 'move') return 104;
  return it.moveVariant === 'MoveJ' ? 103 : 102;
}

/** 업로드 웨이포인트 — MoveL 102, MoveJ 103 */
function motionUploadWaypointIconIndex(w: MotionUploadWaypoint): number {
  return w.moveVariant === 'MoveJ' ? 103 : 102;
}

function sumMotionDurationSec(items: MotionSeqItem[]): number {
  return items.reduce((acc, it) => {
    const v = parseFloat(String(it.durationSec ?? '0').replace(/,/g, ''));
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
}

const PANEL_WIDTH = 320;
/** ???? ?? ? ?? ?? ?? ?? */
const PANEL_MIN_HEIGHT = 640;

// ?? ??? ?? ?????????????????????????????????????????????????????????????
export interface Tokens {
  panelBg: string; panelBorder: string; panelShadow: string;
  sectionHeaderBg: string; sectionHeaderHover: string;
  inputBg: string; inputBorder: string; inputFocusBorder: string; inputFocusShadow: string;
  /** 읽기 전용 인풋 배경·테두리·값 색 (편집 가능 필드와 구분) */
  inputReadonlyBg: string;
  inputReadonlyBorder: string;
  inputReadonlyValue: string;
  textPrimary: string; textSecondary: string; textValue: string;
  divider: string; closeButtonBg: string; closeButtonHoverBg: string; closeButtonHoverColor: string;
  dragHandleColor: string; footerBorder: string; tabBarBg: string; tabActiveBg: string;
  /** 카드·아코디언 섹션 플레이트 (추후 design-system.md와 정합) */
  elevationSection: string;
  /** 주요 CTA 버튼 */
  elevationCta: string;
  /** 탭·칩 등 얕은 떠 있는 요소 */
  elevationRaised: string;
}

export const DARK: Tokens = {
  panelBg: 'rgba(16, 17, 20, 0.74)', panelBorder: 'rgba(255,255,255,0.09)',
  panelShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
  sectionHeaderBg: 'rgba(255,255,255,0.06)', sectionHeaderHover: 'rgba(255,255,255,0.10)',
  inputBg: 'rgba(255,255,255,0.08)', inputBorder: 'rgba(255,255,255,0.18)',
  inputFocusBorder: '#ff8e2b', inputFocusShadow: '0 0 0 2px rgba(255,142,43,0.15)',
  inputReadonlyBg: 'rgba(148,163,184,0.14)',
  inputReadonlyBorder: 'rgba(148,163,184,0.5)',
  inputReadonlyValue: '#cbd5e1',
  textPrimary: '#f8fafc', textSecondary: '#aeb6c2', textValue: '#e7edf5',
  divider: 'rgba(255,255,255,0.12)', closeButtonBg: 'rgba(255,255,255,0.08)',
  closeButtonHoverBg: 'rgba(255,255,255,0.18)', closeButtonHoverColor: '#f8fafc',
  dragHandleColor: 'rgba(255,255,255,0.3)', footerBorder: 'rgba(255,255,255,0.12)',
  tabBarBg: 'rgba(255,255,255,0.05)', tabActiveBg: 'rgba(255,255,255,0.12)',
  elevationSection: '0 2px 14px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
  elevationCta: '0 4px 18px rgba(255,107,0,0.42)',
  elevationRaised: '0 2px 10px rgba(0,0,0,0.35)',
};

export const LIGHT: Tokens = {
  panelBg: 'rgba(252, 252, 253, 0.92)', panelBorder: 'rgba(0,0,0,0.08)',
  panelShadow: '0 24px 48px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06) inset',
  sectionHeaderBg: 'rgba(0,0,0,0.025)', sectionHeaderHover: 'rgba(0,0,0,0.05)',
  inputBg: 'rgba(0,0,0,0.035)', inputBorder: 'rgba(0,0,0,0.10)',
  inputFocusBorder: '#ff8e2b', inputFocusShadow: '0 0 0 2px rgba(255,142,43,0.18)',
  inputReadonlyBg: 'rgba(100,116,139,0.11)',
  inputReadonlyBorder: 'rgba(71,85,105,0.32)',
  inputReadonlyValue: '#475569',
  textPrimary: '#111111', textSecondary: '#999', textValue: '#333',
  divider: 'rgba(0,0,0,0.07)', closeButtonBg: 'rgba(0,0,0,0.05)',
  closeButtonHoverBg: 'rgba(0,0,0,0.10)', closeButtonHoverColor: '#111',
  dragHandleColor: 'rgba(0,0,0,0.18)', footerBorder: 'rgba(0,0,0,0.07)',
  tabBarBg: 'rgba(0,0,0,0.02)', tabActiveBg: 'rgba(0,0,0,0.06)',
  elevationSection: '0 2px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
  elevationCta: '0 4px 16px rgba(255,107,0,0.35)',
  elevationRaised: '0 1px 4px rgba(0,0,0,0.08)',
};

/** ?? ?? ??????? ??? ??? ????? CTA */
export function PrimaryCtaButton({
  children,
  onClick,
  t,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  /** 있으면 테마별 CTA 그림자 (디자인 시스템 `elevationCta`) */
  t?: Tokens;
}) {
  const baseShadow = t?.elevationCta ?? '0 4px 16px rgba(255,107,0,0.35)';
  const hoverShadow = '0 6px 20px rgba(255,107,0,0.50)';
  return (
    <button type="button"
      className="w-full flex items-center justify-center text-[13px] font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.98]"
      style={{ height: 38, color: 'white', background: 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)', boxShadow: baseShadow, letterSpacing: '-0.01em' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = hoverShadow; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = baseShadow; }}
      onClick={onClick}>
      {children}
    </button>
  );
}

// ?? ?? ???? ???????????????????????????????????????????????????????????
export function InputField({
  label,
  value,
  onChange,
  t,
  readOnly,
  suffix,
  labelInfo,
  infoAriaLabel,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  t: Tokens;
  readOnly?: boolean;
  suffix?: string;
  labelInfo?: boolean;
  infoAriaLabel?: string;
}) {
  const [focused, setFocused] = useState(false);
  const ro = Boolean(readOnly);
  return (
    <div
      className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] transition-all duration-150"
      style={{
        background: ro ? t.inputReadonlyBg : t.inputBg,
        border: ro
          ? `1px dashed ${t.inputReadonlyBorder}`
          : `1px solid ${focused ? t.inputFocusBorder : t.inputBorder}`,
        boxShadow: !ro && focused ? t.inputFocusShadow : 'none',
      }}
    >
      <div className="flex items-center gap-1 shrink-0 min-w-0">
        <span className="text-[13px] leading-none" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        {labelInfo && (
          <button
            type="button"
            className="p-0.5 rounded-full shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
            style={{ color: t.textSecondary }}
            aria-label={infoAriaLabel ?? ''}
            title={infoAriaLabel}
          >
            <Info className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
      <input
        className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
        style={{ color: ro ? t.inputReadonlyValue : t.textValue, fontWeight: 500, cursor: ro ? 'default' : undefined }}
        readOnly={ro}
        value={value}
        onChange={ro ? undefined : (e) => onChange?.(e.target.value)}
        onFocus={() => !ro && setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {suffix != null && suffix !== '' && (
        <span className="text-[12px] shrink-0 leading-none" style={{ color: t.textSecondary, fontWeight: 500 }}>{suffix}</span>
      )}
      {ro && (
        <Lock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} style={{ color: t.textSecondary, opacity: 0.65 }} aria-hidden />
      )}
    </div>
  );
}

const DROPDOWN_MENU_Z = 80;

export function DropdownField({ label, value, options, onChange, t }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; t: Tokens }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const desiredMax = 220;
    const belowSpace = window.innerHeight - rect.bottom - margin;
    const aboveSpace = rect.top - margin;
    const estRow = 40;
    const estH = Math.min(desiredMax, options.length * estRow + 8);
    let top: number;
    let maxHeight: number;
    if (belowSpace >= estH || belowSpace >= aboveSpace) {
      top = rect.bottom + 4;
      maxHeight = Math.min(desiredMax, Math.max(64, belowSpace - 4));
    } else {
      maxHeight = Math.min(desiredMax, Math.max(64, aboveSpace - 4));
      top = rect.top - 4 - maxHeight;
    }
    setMenuBox({
      left: rect.left,
      width: rect.width,
      top,
      maxHeight,
    });
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
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
    function h(e: MouseEvent) {
      const node = e.target as Node;
      if (rootRef.current?.contains(node)) return;
      if (menuRef.current?.contains(node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const display = options.find((o) => o.value === value)?.label ?? value;

  const menuContent = open && menuBox && (
    <div
      ref={menuRef}
      className="fixed overflow-y-auto rounded-[10px] py-1 sfd-scroll"
      style={{
        zIndex: DROPDOWN_MENU_Z,
        top: menuBox.top,
        left: menuBox.left,
        width: menuBox.width,
        maxHeight: menuBox.maxHeight,
        background: t === DARK ? 'rgba(22,23,28,0.78)' : 'rgba(252,252,253,0.98)',
        border: `1px solid ${t.inputBorder}`,
        boxShadow: t === DARK ? '0 12px 40px rgba(0,0,0,0.55)' : '0 12px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {options.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className="w-full text-left px-3 py-2.5 text-[12px] font-medium transition-colors duration-100"
          style={{ color: t.textPrimary, background: opt.value === value ? t.tabActiveBg : 'transparent' }}
          onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = t.sectionHeaderHover; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = opt.value === value ? t.tabActiveBg : 'transparent'; }}
          onClick={() => { onChange(opt.value); setOpen(false); }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="relative w-full shrink-0" ref={rootRef}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] cursor-pointer transition-all duration-150"
        style={{ background: t.inputBg, border: `1px solid ${open ? t.inputFocusBorder : t.inputBorder}`, boxShadow: open ? t.inputFocusShadow : 'none' }}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        {!label ? null : (
          <span className="text-[13px] shrink-0 leading-none truncate max-w-[48%]" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        )}
        <span className="flex-1 min-w-0 text-right text-[12px] font-medium truncate" style={{ color: t.textValue }}>{display}</span>
        <SfdChevronDropdown open={open} color={t.textSecondary} size={14} />
      </div>
      {typeof document !== 'undefined' && menuContent ? createPortal(menuContent, document.body) : null}
    </div>
  );
}

export function CertStatusDropdown({ label, value, onChange, t }: { label: string; value: string; onChange: (v: string) => void; t: Tokens }) {
  const { L } = useLocale();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const presets = [
    { value: 'KCs', label: 'KCs' },
    { value: 'ISO_10218_1', label: 'ISO_10218_1' },
    { value: 'CE', label: 'CE' },
    { value: 'UL', label: 'UL' },
  ];

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const desiredMax = 280;
    const belowSpace = window.innerHeight - rect.bottom - margin;
    const aboveSpace = rect.top - margin;
    const estRow = 40;
    const estH = Math.min(desiredMax, presets.length * estRow + 8 + 56);
    let top: number;
    let maxHeight: number;
    if (belowSpace >= estH || belowSpace >= aboveSpace) {
      top = rect.bottom + 4;
      maxHeight = Math.min(desiredMax, Math.max(120, belowSpace - 4));
    } else {
      maxHeight = Math.min(desiredMax, Math.max(120, aboveSpace - 4));
      top = rect.top - 4 - maxHeight;
    }
    setMenuBox({
      left: rect.left,
      width: rect.width,
      top,
      maxHeight,
    });
  }, [presets.length]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuBox(null);
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
    function h(e: MouseEvent) {
      const node = e.target as Node;
      if (rootRef.current?.contains(node)) return;
      if (menuRef.current?.contains(node)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const presetHit = presets.find((p) => p.value === value);
  const display = presetHit?.label ?? value;
  function applyCustom() {
    const v = draft.trim();
    if (v) { onChange(v); setDraft(''); setOpen(false); }
  }

  const menuContent = open && menuBox && (
    <div
      ref={menuRef}
      className="fixed overflow-y-auto rounded-[10px] py-1 sfd-scroll"
      style={{
        zIndex: DROPDOWN_MENU_Z,
        top: menuBox.top,
        left: menuBox.left,
        width: menuBox.width,
        maxHeight: menuBox.maxHeight,
        background: t === DARK ? 'rgba(22,23,28,0.78)' : 'rgba(252,252,253,0.98)',
        border: `1px solid ${t.inputBorder}`,
        boxShadow: t === DARK ? '0 12px 40px rgba(0,0,0,0.55)' : '0 12px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {presets.map((opt) => (
        <button
          type="button"
          key={opt.value}
          className="w-full text-left px-3 py-2.5 text-[12px] font-medium transition-colors duration-100"
          style={{ color: t.textPrimary, background: opt.value === value ? t.tabActiveBg : 'transparent' }}
          onMouseEnter={(e) => { if (opt.value !== value) (e.currentTarget as HTMLButtonElement).style.background = t.sectionHeaderHover; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = opt.value === value ? t.tabActiveBg : 'transparent'; }}
          onClick={() => { onChange(opt.value); setOpen(false); }}
        >
          {opt.label}
        </button>
      ))}
      <div style={{ height: 1, background: t.divider, margin: '4px 0' }} />
      <div className="flex gap-2 items-stretch px-2 pb-2 pt-1">
        <input
          className="flex-1 min-w-0 rounded-[8px] px-2.5 py-1.5 text-[12px] outline-none"
          style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
          placeholder={L.certCustomPh}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') applyCustom(); }}
        />
        <button
          type="button"
          className="shrink-0 px-3 rounded-[8px] text-[12px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#ff9a3c,#ff6b00)' }}
          onClick={applyCustom}
        >
          {L.certApplyBtn}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative w-full shrink-0" ref={rootRef}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] cursor-pointer transition-all duration-150"
        style={{ background: t.inputBg, border: `1px solid ${open ? t.inputFocusBorder : t.inputBorder}`, boxShadow: open ? t.inputFocusShadow : 'none' }}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        <span className="text-[13px] shrink-0 leading-none truncate max-w-[48%]" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        <span className="flex-1 min-w-0 text-right text-[12px] font-medium truncate" style={{ color: t.textValue }}>{display || '?'}</span>
        <SfdChevronDropdown open={open} color={t.textSecondary} size={14} />
      </div>
      {typeof document !== 'undefined' && menuContent ? createPortal(menuContent, document.body) : null}
    </div>
  );
}

export function TripleInput({ labels, values, onChange, t }: { labels: [string, string, string]; values: [string, string, string]; onChange?: (i: number, v: string) => void; t: Tokens }) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5 w-full overflow-hidden">
      {labels.map((label, i) => (
        <div key={label} className="relative flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px] transition-all duration-150"
          style={{ background: t.inputBg, border: `1px solid ${fi === i ? t.inputFocusBorder : t.inputBorder}`, boxShadow: fi === i ? t.inputFocusShadow : 'none' }}>
          <span className="text-[12px] shrink-0 leading-none" style={{ color: '#ff8e2b', fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
          <input className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
            style={{ color: t.textValue, fontWeight: 500 }}
            value={values[i]} onChange={(e) => onChange?.(i, e.target.value)}
            onFocus={() => setFi(i)} onBlur={() => setFi(null)} />
        </div>
      ))}
    </div>
  );
}

export function SubLabel({ text, t, uppercase = true }: { text: string; t: Tokens; uppercase?: boolean }) {
  const display = uppercase ? text.toUpperCase() : text;
  return <p className="text-[12px] px-1 pt-1" style={{ color: t.textSecondary, fontWeight: 500, letterSpacing: '0.04em' }}>{display}</p>;
}

export function Toggle({ label, tooltip, value, onChange, t }: { label: string; tooltip?: string; value: boolean; onChange: (v: boolean) => void; t: Tokens }) {
  return (
    <div className="flex items-center gap-2 px-1 min-h-[34px] min-w-0">
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-[14px] leading-snug min-w-0" style={{ color: t.textSecondary, fontWeight: 500 }}>
          {label}
        </span>
        {tooltip && <div title={tooltip}><Info className="w-3.5 h-3.5" strokeWidth={2} style={{ color: t.textSecondary }} /></div>}
      </div>
      <button onClick={() => onChange(!value)} className="relative shrink-0 transition-all duration-200"
        style={{ width: 36, height: 20, borderRadius: 999, background: value ? 'linear-gradient(135deg,#ff8e2b,#ff6b00)' : (t === LIGHT ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'), boxShadow: value ? '0 0 8px rgba(255,142,43,0.4)' : 'none', border: `1px solid ${value ? 'transparent' : t.inputBorder}` }}>
        <div className="absolute top-[2px] transition-all duration-200" style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', left: value ? 'calc(100% - 16px)' : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

export function Section({
  title,
  description,
  accentColor = '#ff8e2b',
  defaultOpen = true,
  children,
  t,
  shellStyle,
}: {
  title: string;
  description?: string;
  accentColor?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  t: Tokens;
  /** ?? ?? ???�??(???/?? ?? ?? ?) */
  shellStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="rounded-[12px] overflow-hidden shrink-0 transition-[box-shadow,background,border-color] duration-200"
      style={{ border: `1px solid ${t.panelBorder}`, boxShadow: t.elevationSection, ...shellStyle }}
    >
      <button type="button" className="w-full flex items-start gap-2 px-3 py-2.5 transition-colors duration-150 text-left"
        style={{ background: hovered ? t.sectionHeaderHover : (open ? t.sectionHeaderBg : 'transparent') }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpen(!open)}>
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0 mt-0.5" style={{ background: accentColor }} />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[13px] leading-tight" style={{ color: t.textPrimary, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
          {description ? (
            <span className="text-[10px] leading-snug font-normal" style={{ color: t.textSecondary }}>{description}</span>
          ) : null}
        </div>
        <SfdChevronAccordion open={open} color={t.textSecondary} size={14} className="mt-0.5" />
      </button>
      {open && <div style={{ height: 1, background: t.divider }} />}
      {open && <div className="flex flex-col gap-2 p-4">{children}</div>}
    </div>
  );
}

/** ?? ?? ?? ?? ??? ??? ?? ??? (??? + ??) */
function MotionUploadFileListDock({
  data,
  setData,
  t,
  theme,
  selectedUploadKey,
  setSelectedUploadKey,
  accentColor,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  theme: 'light' | 'dark';
  selectedUploadKey: string | null;
  setSelectedUploadKey: React.Dispatch<React.SetStateAction<string | null>>;
  accentColor: string;
}) {
  const { L } = useLocale();
  const selAccent = accentColor;
  const selShadow = accentRgba(accentColor, 0.2);
  const groups = data.motionUploadFileGroups;

  function toggleFile(id: string) {
    setData((p) => ({
      ...p,
      motionUploadFileGroups: p.motionUploadFileGroups.map((g) =>
        g.id === id ? { ...g, expanded: !g.expanded } : g,
      ),
    }));
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 min-h-[120px] flex items-start">
        <p className="text-[11px] py-1 px-0.5" style={{ color: t.textSecondary }}>{L.motionFileListEmpty}</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-[10px] overflow-hidden flex flex-col flex-1 min-h-0"
      style={{
        minHeight: 120,
        background: theme === 'light' ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${t.inputBorder}`,
        boxShadow: t.elevationSection,
      }}
    >
      <div className="flex items-center gap-2 px-2.5 py-1.5 shrink-0" style={{ background: t.sectionHeaderBg }}>
        <span className="text-[10px] font-semibold uppercase tracking-wide truncate flex-1" style={{ color: t.textSecondary }}>
          {L.motionSequenceListTitle}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-1 py-1 flex flex-col gap-0.5">
        {groups.map((g) => {
          const fileKey = `${g.id}:file`;
          const fileSelected = selectedUploadKey === fileKey;
          return (
          <div key={g.id}>
            <div className="flex items-center gap-0.5 w-full min-h-[24px]">
              <button
                type="button"
                className="shrink-0 p-0.5 rounded-[4px] flex items-center justify-center"
                style={{ color: t.textSecondary }}
                aria-label="expand"
                onClick={() => toggleFile(g.id)}
              >
                <SfdChevronTree expanded={g.expanded} color={t.textSecondary} size={PP_ICON_PX.sm} />
              </button>
              <button
                type="button"
                className="flex-1 min-w-0 flex items-center gap-1 px-0.5 py-0.5 rounded-[6px] text-left min-h-[24px] transition-colors duration-150"
                style={{
                  color: t.textPrimary,
                  border: fileSelected ? `2px solid ${selAccent}` : '1px solid transparent',
                  boxShadow: fileSelected ? `0 0 0 1px ${selShadow}` : undefined,
                  background: fileSelected
                    ? (theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.85)')
                    : 'transparent',
                }}
                onClick={() => setSelectedUploadKey((k) => (k === fileKey ? null : fileKey))}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" strokeWidth={2} style={{ color: accentColor }} />
                <span className="flex-1 min-w-0 text-[12px] font-medium truncate">{g.fileName}</span>
              </button>
            </div>
            {g.expanded && g.waypoints.length > 0 && (
              <ul className="list-none pl-4 pr-0.5 pb-0.5 flex flex-col gap-0.5">
                {g.waypoints.map((w) => {
                  const wpKey = `${g.id}:${w.id}`;
                  const selected = selectedUploadKey === wpKey;
                  return (
                    <li key={w.id} className="list-none">
                      <button
                        type="button"
                        className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-[6px] text-left transition-colors duration-150 min-h-0"
                        style={{
                          background: theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.85)',
                          border: selected ? `2px solid ${selAccent}` : `1px solid ${t.inputBorder}`,
                          boxShadow: selected ? `0 0 0 1px ${selShadow}` : undefined,
                        }}
                        onClick={() => setSelectedUploadKey((k) => (k === wpKey ? null : wpKey))}
                      >
                        <div
                          className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0"
                          style={{ background: '#2a2a2f' }}
                        >
                          <SfdIconByIndex
                            index={motionUploadWaypointIconIndex(w)}
                            color="#f5f5f5"
                            size={PP_ICON_PX.sm}
                          />
                        </div>
                        <span className="flex-1 min-w-0 text-[10px] font-medium truncate leading-tight" style={{ color: t.textPrimary }}>
                          {L.motionListWaypointPrefix} {w.waypointIndex}
                        </span>
                        <span className="text-[10px] font-medium tabular-nums shrink-0" style={{ color: t.textSecondary }}>
                          {w.timecode}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
        })}
      </div>
      <div
        className="shrink-0 flex justify-end px-2 py-1 border-t"
        style={{ borderColor: t.divider, background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.15)' }}
      >
        <span className="text-[10px] font-medium tabular-nums" style={{ color: t.textSecondary }}>
          {L.motionListTotalLabel} : {formatUploadDurationSecDisplay(sumAllUploadGroupsDurationSec(groups))}s
        </span>
      </div>
    </div>
  );
}

/** ???? ??????? ?? ? ?? ?? ??? ?? */
export function MotionUploadSection({
  data,
  setData,
  t,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
}) {
  const { L, pointScheme } = useLocale();
  const motionAccent = getObjectAccent('motion', pointScheme);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <Section title={L.motionUploadSectionTitle} accentColor={motionAccent} t={t}>
        <p className="text-[11px] leading-relaxed px-0.5" style={{ color: t.textSecondary }}>
          {L.motionUploadHint}
        </p>
        <button
          type="button"
          className="w-full mt-1 py-2 rounded-[8px] text-[12px] font-semibold transition-colors duration-150"
          style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textPrimary }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.inputFocusBorder; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.inputBorder; }}
          onClick={() => fileRef.current?.click()}
        >
          {L.motionFileUploadBtn}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".csv,.json,.txt,.xml"
          multiple
          onChange={(e) => {
            const { files } = e.target;
            if (!files?.length) return;
            const added: MotionUploadFileGroup[] = Array.from(files).map((f) => ({
              id: `uf-${Date.now()}-${f.name}`,
              fileName: f.name,
              expanded: true,
              waypoints: [],
            }));
            setData((p) => ({
              ...p,
              motionUploadFileGroups: [...p.motionUploadFileGroups, ...added],
            }));
            e.target.value = '';
          }}
        />
      </Section>
    </div>
  );
}

// ?? ????? ?? + ?? ???? ?????????????????????????????????????????
function EeListSection({ data, setData, t, selectedIdx, setSelectedIdx, variant, accentColor }: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  selectedIdx: number | null;
  setSelectedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  variant: 'settings' | 'settings-list-only' | 'connection';
  accentColor: string;
}) {
  const { L } = useLocale();
  const MAX_SLOTS = 5;
  const selectedEe = selectedIdx !== null ? data.eeSlots[selectedIdx] : null;
  const [eePickerOpen, setEePickerOpen] = useState(false);

  function assignSlotFromPicker(slot: number, m: PickedEeModel) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      slots[slot] = {
        objectName: 'object_name',
        name: m.name,
        modelFileName: m.fileName,
        type: m.type,
        mass: m.mass,
        makerLabel: m.makerLabel,
        source: m.source,
        tcpPos: { x: '0', y: '0', z: '200' },
        tcpRot: { rx: '0', ry: '0', rz: '0' },
        eeSize: { w: '0', d: '0', h: '0' },
        eeOuterDiam: '0',
        eeCom: { cx: '0', cy: '0', cz: '0' },
        eeAutoCom: true,
        linkedItems: [],
      };
      return { ...p, eeSlots: slots };
    });
  }

  function clearEeSlot(idx: number) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      slots[idx] = null;
      return { ...p, eeSlots: slots };
    });
    setSelectedIdx(null);
  }

  function updateEeField(idx: number, field: keyof EeSlot, value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, [field]: value };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeTcp(idx: number, group: 'tcpPos' | 'tcpRot', field: string, value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, [group]: { ...ee[group], [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeSize(idx: number, field: 'w' | 'd' | 'h', value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, eeSize: { ...ee.eeSize, [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  function updateEeCom(idx: number, field: 'cx' | 'cy' | 'cz', value: string) {
    setData((p) => {
      const slots = [...p.eeSlots] as (EeSlot | null)[];
      const ee = slots[idx];
      if (ee) slots[idx] = { ...ee, eeCom: { ...ee.eeCom, [field]: value } };
      return { ...p, eeSlots: slots };
    });
  }

  const isDark = t === DARK;
  const { slotActiveBg, slotActiveBorder } = accentSlotStyles(accentColor, isDark);
  const slotEmptyBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const slotEmptyBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  return (
    <>
      <EeModelPickerModal
        open={eePickerOpen}
        slotIndex={selectedIdx}
        onClose={() => setEePickerOpen(false)}
        onPick={(slot, model) => assignSlotFromPicker(slot, model)}
        t={t}
        isDark={isDark}
      />
      {/* ?? ?? */}
      <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: `1px solid ${t.panelBorder}` }}>
        {/* ?? */}
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: t.sectionHeaderBg }}>
          <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
          <span className="flex-1 text-[12px]" style={{ color: t.textPrimary, fontWeight: 600 }}>{L.eeListTitle}</span>
          <span className="text-[10px]" style={{ color: t.textSecondary }}>
            {data.eeSlots.filter(Boolean).length} / {MAX_SLOTS}
          </span>
        </div>
        <div style={{ height: 1, background: t.divider }} />

        {/* ?? ??? */}
        <div className="flex flex-col">
          {Array.from({ length: MAX_SLOTS }, (_, i) => {
            const ee = data.eeSlots[i];
            const isSelected = selectedIdx === i;

            return (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, background: t.divider }} />}
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 transition-all duration-150 text-left"
                  style={{ background: isSelected ? slotActiveBg : 'transparent' }}
                  onClick={() => {
                    if (!ee && variant !== 'connection') {
                      setSelectedIdx(i);
                      setEePickerOpen(true);
                      return;
                    }
                    setSelectedIdx(isSelected ? null : i);
                  }}
                >
                  {/* ?? ?? ?? */}
                  <div className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{
                      background: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                      color: isSelected ? 'white' : t.textSecondary,
                    }}>
                    {i + 1}
                  </div>

                  {ee ? (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: isSelected ? accentColor : t.textPrimary }}>
                          {ee.objectName}
                        </p>
                        <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: t.textSecondary }}>
                          {ee.name}{' \u00B7 '}{ee.type}{' \u00B7 '}{ee.mass} kg
                        </p>
                      </div>
                      <SfdChevronTree
                        expanded={isSelected}
                        color={isSelected ? accentColor : t.textSecondary}
                        size={14}
                      />
                    </>
                  ) : (
                    <>
                      <p className="flex-1 text-[11px]" style={{ color: t.textSecondary, fontStyle: 'italic' }}>{L.eeSlotEmpty}</p>
                      <Plus className="w-3.5 h-3.5 shrink-0" strokeWidth={2} style={{ color: t.textSecondary, opacity: 0.4 }} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ?? ?? - ??? ??? ?? ???? ?? ?? ?? */}
      {selectedIdx !== null && selectedEe && variant === 'settings' && (
        <div className="flex flex-col gap-2">
          {/* ?? ?? ??? */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
            <span className="text-[14px] font-semibold px-1" style={{ color: accentColor }}>
              EE {selectedIdx + 1}{' \u00B7 '}{selectedEe.objectName}
            </span>
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
          </div>

          {/* ?? ?? */}
          <Section title={L.eeDetail} accentColor={accentColor} t={t}>
            <EeModelSummaryCard
              modelFileName={selectedEe.modelFileName}
              type={selectedEe.type}
              modelDisplayName={selectedEe.source === 'custom' ? selectedEe.modelFileName : selectedEe.name}
              makerLabel={selectedEe.makerLabel}
              source={selectedEe.source}
              t={t}
              isDark={isDark}
            />
            <InputField label={L.eeObjectName} value={selectedEe.objectName}
              onChange={(v) => updateEeField(selectedIdx, 'objectName', v)} t={t} />
            <InputField label={L.eeMass} value={selectedEe.mass}
              onChange={(v) => updateEeField(selectedIdx, 'mass', v)} t={t} />
            <div style={{ height: 1, background: t.divider }} />
            <Toggle label={L.autoCoM} tooltip={L.autoCoMTooltip} value={selectedEe.eeAutoCom}
              onChange={(v) => setData((p) => {
                const slots = [...p.eeSlots] as (EeSlot | null)[];
                const ee = slots[selectedIdx];
                if (ee) slots[selectedIdx] = { ...ee, eeAutoCom: v };
                return { ...p, eeSlots: slots };
              })} t={t} />
            <SubLabel text={L.weightCoMMm} t={t} />
            <TripleInput labels={['Cx', 'Cy', 'Cz']}
              values={[selectedEe.eeCom.cx, selectedEe.eeCom.cy, selectedEe.eeCom.cz]}
              onChange={(i, v) => {
                const k = ['cx', 'cy', 'cz'] as const;
                updateEeCom(selectedIdx, k[i], v);
              }} t={t} />
            <button
              type="button"
              className="w-full py-2.5 rounded-[10px] text-[12px] font-semibold transition-all duration-150 active:scale-[0.99]"
              style={{
                color: accentColor,
                background: isDark ? accentRgba(accentColor, 0.1) : accentRgba(accentColor, 0.07),
                border: `1px solid ${isDark ? accentRgba(accentColor, 0.4) : accentRgba(accentColor, 0.3)}`,
              }}
              onClick={() => clearEeSlot(selectedIdx)}
            >
              {L.eeRemoveFromList}
            </button>
          </Section>

          {/* TCP ?? */}
          <Section title={L.eeTcpSectionTitle} accentColor={accentColor} t={t}>
            <SubLabel text={L.tcpPosition} t={t} />
            <TripleInput
              labels={['X', 'Y', 'Z']}
              values={[selectedEe.tcpPos.x, selectedEe.tcpPos.y, selectedEe.tcpPos.z]}
              onChange={(i, v) => {
                const k = ['x', 'y', 'z'] as const;
                updateEeTcp(selectedIdx, 'tcpPos', k[i], v);
              }} t={t} />
            <SubLabel text={L.tcpDirection} t={t} uppercase={false} />
            <TripleInput
              labels={['Rx', 'Ry', 'Rz']}
              values={[selectedEe.tcpRot.rx, selectedEe.tcpRot.ry, selectedEe.tcpRot.rz]}
              onChange={(i, v) => {
                const k = ['rx', 'ry', 'rz'] as const;
                updateEeTcp(selectedIdx, 'tcpRot', k[i], v);
              }} t={t} />
            <SubLabel text={L.eeObjectSize} t={t} />
            <TripleInput
              labels={['W', 'D', 'H']}
              values={[selectedEe.eeSize.w, selectedEe.eeSize.d, selectedEe.eeSize.h]}
              onChange={(i, v) => {
                const k = ['w', 'd', 'h'] as const;
                updateEeSize(selectedIdx, k[i], v);
              }} t={t} />
            <InputField label={L.eeOuterDiam} value={selectedEe.eeOuterDiam}
              onChange={(v) => updateEeField(selectedIdx, 'eeOuterDiam', v)} t={t} />
          </Section>
        </div>
      )}

      {selectedIdx !== null && selectedEe && variant === 'connection' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
            <span className="text-[14px] font-semibold px-1" style={{ color: accentColor }}>
              EE {selectedIdx + 1}{' \u00B7 '}{selectedEe.objectName}
            </span>
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
          </div>
          <Section title={L.connLinkedList} accentColor={accentColor} t={t}>
            {selectedEe.linkedItems.length === 0 ? (
              <p className="text-[12px] px-1 py-2 leading-relaxed" style={{ color: t.textSecondary }}>{L.connListEmpty}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedEe.linkedItems.map((row, i) => (
                  <div key={i} className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
                    <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: t.textPrimary }} title={row.name}>
                      <span style={{ color: t.textSecondary, fontWeight: 500 }}>{L.connColName}</span>{' '}
                      <span style={{ color: t.textPrimary }}>{row.name}</span>
                    </p>
                    <p className="text-[11px] mt-1.5 leading-snug truncate" style={{ color: t.textSecondary }}>
                      <span style={{ fontWeight: 600 }}>{L.connColModel}</span> {row.model}
                    </p>
                    <p className="text-[11px] mt-0.5 leading-snug truncate" style={{ color: t.textSecondary }}>
                      <span style={{ fontWeight: 600 }}>{L.connColKind}</span> {row.kind}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {selectedIdx !== null && selectedEe === null && variant !== 'settings-list-only' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
            <span className="text-[14px] font-semibold px-1" style={{ color: accentColor }}>
              EE {selectedIdx + 1}{' \u00B7 '}{L.eeSlotEmpty}
            </span>
            <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
          </div>
          {variant === 'connection' ? (
            <p className="text-[12px] px-1 py-2 leading-relaxed text-center" style={{ color: t.textSecondary }}>
              {L.eeConnEmptySlotHint}
            </p>
          ) : (
            <PrimaryCtaButton
              t={t}
              onClick={() => {
                if (selectedIdx === null) return;
                setEePickerOpen(true);
              }}
            >
              {L.eeSelectModel}
            </PrimaryCtaButton>
          )}
        </div>
      )}
    </>
  );
}

/** ?? > ?: ??? ??? + ?? ??? ?? ?? ?? ?? (???EE???????? ??) */
function CollisionEntityZoneContent({
  data,
  setData,
  t,
  theme,
  categoryId,
  listTitle,
  areasTitle,
  entitySelectedPrefix,
  accentColor,
}: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  theme: 'light' | 'dark';
  categoryId: CollisionCategoryId;
  listTitle: string;
  areasTitle: string;
  entitySelectedPrefix: string;
  accentColor: string;
}) {
  const { L } = useLocale();
  const isDark = t === DARK;
  const [hoverAreaId, setHoverAreaId] = useState<string | null>(null);
  const [areasScrollCollapsed, setAreasScrollCollapsed] = useState(false);
  const [expectedAreasHidden, setExpectedAreasHidden] = useState(false);

  const entities = getCollisionEntityList(data, categoryId);
  const selIdx = getCollisionSelectedIdx(data, categoryId);
  const selectedEntity =
    selIdx !== null && selIdx >= 0 && selIdx < entities.length ? entities[selIdx] : null;
  const expectedAreas = getExpectedAreasForSelectedEntity(data, categoryId);

  const { slotActiveBg, slotActiveBorder } = accentSlotStyles(accentColor, isDark);

  return (
    <>
      <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: `1px solid ${t.panelBorder}` }}>
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: t.sectionHeaderBg }}>
          <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
          <span className="flex-1 text-[12px]" style={{ color: t.textPrimary, fontWeight: 600 }}>{listTitle}</span>
          <span className="text-[10px]" style={{ color: t.textSecondary }}>{entities.length}</span>
        </div>
        <div style={{ height: 1, background: t.divider }} />
        <div className="flex flex-col">
          {entities.map((ent, i) => {
            const isSelected = selIdx === i;
            return (
              <div key={ent.id}>
                {i > 0 && <div style={{ height: 1, background: t.divider }} />}
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 transition-all duration-150 text-left"
                  style={{
                    background: isSelected ? slotActiveBg : 'transparent',
                    borderLeft: isSelected ? `3px solid ${accentColor}` : '3px solid transparent',
                  }}
                  onClick={() => setData((p) => setSelectedEntityIndex(p, categoryId, i))}
                >
                  <div
                    className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 text-[10px] font-bold"
                    style={{
                      background: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                      color: isSelected ? 'white' : t.textSecondary,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: isSelected ? accentColor : t.textPrimary }}>
                      {ent.objectName}
                    </p>
                    <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: t.textSecondary }}>{ent.subtitle}</p>
                  </div>
                  <SfdChevronTree expanded={isSelected} color={isSelected ? accentColor : t.textSecondary} size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEntity && (
        <div className="flex items-center gap-2 px-1">
          <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
          <span className="text-[14px] font-semibold px-1 truncate max-w-[220px]" style={{ color: accentColor }} title={selectedEntity.objectName}>
            {entitySelectedPrefix} {selIdx !== null ? selIdx + 1 : ''}
            {' \u00B7 '}
            {selectedEntity.objectName}
          </span>
          <div className="flex-1 h-px" style={{ background: `${accentColor}40` }} />
        </div>
      )}

      {expectedAreasHidden ? (
        <button
          type="button"
          className="w-full py-2 rounded-[10px] text-[11px] font-semibold transition-colors"
          style={{ background: t.sectionHeaderBg, color: t.textSecondary, border: `1px dashed ${t.inputBorder}` }}
          onClick={() => setExpectedAreasHidden(false)}
        >
          {L.collisionExpectedAreasShowAgain}
        </button>
      ) : (
        <div
          className={`rounded-[10px] overflow-hidden flex flex-col min-h-0 shrink-0 ${!areasScrollCollapsed ? 'h-[280px]' : ''}`}
          style={{
            border: `1px solid ${t.inputBorder}`,
            background: theme === 'light' ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.06)',
            boxShadow: t.elevationSection,
          }}
        >
          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 shrink-0" style={{ background: t.sectionHeaderBg }}>
            <span className="text-[10px] font-semibold uppercase tracking-wide truncate flex-1" style={{ color: t.textSecondary }}>
              {areasTitle}
            </span>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                className="p-1 rounded-md transition-colors hover:opacity-90"
                style={{ color: t.textSecondary }}
                aria-label={L.collisionAreasCollapseAria}
                onClick={() => setAreasScrollCollapsed((c) => !c)}
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
          {!areasScrollCollapsed && (
            <div
              className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-1 py-0.5 flex flex-col gap-0.5"
            >
              {expectedAreas.map((area) => {
                const selected = data.selectedCollisionAreaId === area.id;
                const showActions = hoverAreaId === area.id || selected;
                const vis = area.visible !== false;
                return (
                  <div
                    key={area.id}
                    role="button"
                    tabIndex={0}
                    className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-[6px] text-left transition-colors min-h-[30px] cursor-pointer box-border"
                    style={{
                      background: theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.85)',
                      border: `2px solid ${selected ? slotActiveBorder : t.inputBorder}`,
                      boxShadow: selected ? '0 0 0 1px rgba(248,113,113,0.12)' : 'none',
                    }}
                    onMouseEnter={() => setHoverAreaId(area.id)}
                    onMouseLeave={() => setHoverAreaId(null)}
                    onClick={() =>
                      setData((p) => ({
                        ...p,
                        selectedCollisionAreaId: area.id === p.selectedCollisionAreaId ? null : area.id,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setData((p) => ({
                          ...p,
                          selectedCollisionAreaId: area.id === p.selectedCollisionAreaId ? null : area.id,
                        }));
                      }
                    }}
                  >
                    <SfdIconByIndex
                      index={COLLISION_EXPECTED_AREA_SHAPE_ICON_INDEX[area.shape]}
                      color={t.textPrimary}
                      size={14}
                      aria-hidden
                    />
                    <span className="flex-1 min-w-0 text-[10px] font-medium truncate leading-tight" style={{ color: t.textPrimary }}>
                      {area.label}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 shrink-0 min-w-[52px] justify-end transition-opacity duration-150 ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                      <button
                        type="button"
                        className="p-0.5 rounded-[4px] transition-opacity hover:opacity-100"
                        style={{ color: t.textSecondary, opacity: 0.85 }}
                        aria-label={L.collisionAreaFocusRobotAria}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Bot className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        className="p-0.5 rounded-[4px] transition-opacity hover:opacity-100"
                        style={{ color: t.textSecondary, opacity: vis ? 0.9 : 0.35 }}
                        aria-label={L.collisionAreaVisibilityAria}
                        onClick={(e) => {
                          e.stopPropagation();
                          setData((p) =>
                            mapSelectedEntityExpectedAreas(p, categoryId, (a) =>
                              a.id === area.id ? { ...a, visible: !(a.visible !== false) } : a,
                            ),
                          );
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {data.collisionContinuousGenerationMode ? (
        <div
          className="rounded-[12px] shrink-0 flex flex-col gap-2 p-2.5"
          style={{
            border: `1px solid ${t.panelBorder}`,
            background: t.sectionHeaderBg,
            boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center gap-2 px-0.5 pb-0.5 border-b" style={{ borderColor: t.divider }}>
            <span className="text-[12px] font-bold leading-tight" style={{ color: accentColor }}>
              {L.collisionContinuousGenerationModeBtn}
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-[4px] leading-none"
              style={{
                background: isDark ? 'rgba(248,113,113,0.2)' : 'rgba(248,113,113,0.12)',
                color: accentColor,
              }}
            >
              ON
            </span>
          </div>
          <CollisionGripperSection
            data={data}
            setData={setData}
            selectedAreaId={data.selectedCollisionAreaId}
            collisionCategoryId={categoryId}
            t={t}
          />
          <button
            type="button"
            className="w-full py-2 rounded-[10px] text-[12px] font-semibold border transition-all duration-200 active:scale-[0.98]"
            style={{
              borderColor: t.inputBorder,
              background: theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.9)',
              color: t.textPrimary,
            }}
            onClick={() => setData((p) => ({ ...p, collisionContinuousGenerationMode: false }))}
          >
            {L.collisionContinuousGenerationEndBtn}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="w-full flex items-center justify-center text-[13px] font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.98] py-2.5 shrink-0 border"
          style={{
            color: 'white',
            background: 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)',
            borderColor: 'rgba(255,107,0,0.45)',
            boxShadow: '0 4px 16px rgba(255,107,0,0.35)',
          }}
          aria-pressed={false}
          onClick={() =>
            setData((p) => ({
              ...p,
              collisionContinuousGenerationMode: true,
            }))
          }
        >
          {L.collisionContinuousGenerationModeBtn}
        </button>
      )}
    </>
  );
}

function ManipConnRowLines({ row, L, t }: { row: ManipLinkedRow; L: AppLabels; t: Tokens }) {
  return (
    <>
      <p className="text-[12px] font-semibold leading-tight truncate" style={{ color: t.textPrimary }} title={row.name}>
        <span style={{ color: t.textSecondary, fontWeight: 500 }}>{L.connColName}</span>{' '}
        <span style={{ color: t.textPrimary }}>{row.name}</span>
      </p>
      <p className="text-[11px] mt-1.5 leading-snug truncate" style={{ color: t.textSecondary }}>
        <span style={{ fontWeight: 600 }}>{L.connColModel}</span> {row.model}
      </p>
      <p className="text-[11px] mt-0.5 leading-snug truncate" style={{ color: t.textSecondary }}>
        <span style={{ fontWeight: 600 }}>{L.connColKind}</span> {row.kind}
      </p>
    </>
  );
}

function ManipConnNoneLine({ L, t }: { L: AppLabels; t: Tokens }) {
  return (
    <p className="text-[12px] font-medium leading-snug" style={{ color: t.textValue }}>
      {L.connNone}
    </p>
  );
}

export function ManipConnectionLinksContent({ links, L, t }: { links: ManipConnectionLinks; L: AppLabels; t: Tokens }) {
  const grippers = links.grippers.slice(0, 5);
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
        <p className="text-[12px] font-semibold leading-tight mb-2" style={{ color: t.textSecondary }}>{L.connLinkedController}</p>
        {links.controller ? <ManipConnRowLines row={links.controller} L={L} t={t} /> : <ManipConnNoneLine L={L} t={t} />}
      </div>
      <div className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
        <p className="text-[12px] font-semibold leading-tight mb-2" style={{ color: t.textSecondary }}>{L.connLinkedAuxAxis}</p>
        {links.auxiliaryAxes.length === 0 ? (
          <ManipConnNoneLine L={L} t={t} />
        ) : (
          <div className="flex flex-col gap-2">
            {links.auxiliaryAxes.map((row, i) => (
              <div key={i}>
                <ManipConnRowLines row={row} L={L} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
        <p className="text-[12px] font-semibold leading-tight mb-2" style={{ color: t.textSecondary }}>{L.connLinkedCell}</p>
        {links.cell ? <ManipConnRowLines row={links.cell} L={L} t={t} /> : <ManipConnNoneLine L={L} t={t} />}
      </div>
      <div className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
        <p className="text-[12px] font-semibold leading-tight mb-2" style={{ color: t.textSecondary }}>{L.connLinkedEstop}</p>
        {links.emergencyStop ? <ManipConnRowLines row={links.emergencyStop} L={L} t={t} /> : <ManipConnNoneLine L={L} t={t} />}
      </div>
      <div className="rounded-[10px] px-3 py-2.5" style={{ border: `1px solid ${t.inputBorder}`, background: t.inputBg }}>
        <p className="text-[12px] font-semibold leading-tight mb-2" style={{ color: t.textSecondary }}>{L.connLinkedGrippers}</p>
        {grippers.length === 0 ? (
          <ManipConnNoneLine L={L} t={t} />
        ) : (
          <div className="flex flex-col gap-2">
            {grippers.map((row, i) => (
              <div key={i}>
                <ManipConnRowLines row={row} L={L} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ManipulatorListSection({ data, setData, t, accentColor }: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  accentColor: string;
}) {
  const { L } = useLocale();
  const isDark = t === DARK;
  const { slotActiveBg } = accentSlotStyles(accentColor, isDark);
  const robots = data.manipRobots;
  const sel = data.manipSelectedRobotIdx == null
    ? -1
    : Math.min(Math.max(0, data.manipSelectedRobotIdx), Math.max(0, robots.length - 1));
  const isSingle = robots.length <= 1;
  const listHint = isSingle ? L.manipListHintSingle : L.manipListHintMultiple;

  return (
    <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: `1px solid ${t.panelBorder}` }}>
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: t.sectionHeaderBg }}>
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
        <span className="flex-1 text-[12px]" style={{ color: t.textPrimary, fontWeight: 600 }}>{L.manipListTitle}</span>
        <span className="text-[10px]" style={{ color: t.textSecondary }}>{robots.length}</span>
      </div>
      <div style={{ height: 1, background: t.divider }} />
      <div
        className="px-3 py-2.5 text-[10px] leading-relaxed"
        style={{ color: t.textSecondary, background: t.inputBg, borderBottom: `1px solid ${t.divider}` }}
      >
        {listHint}
      </div>
      <div className="flex flex-col">
        {robots.map((r, i) => {
          const isSelected = sel === i;
          return (
            <div key={`${r.manipObjectName}-${i}`}>
              {i > 0 && <div style={{ height: 1, background: t.divider }} />}
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 transition-all duration-150 text-left"
                style={{ background: isSelected ? slotActiveBg : 'transparent' }}
                onClick={() => setData((p) => ({ ...p, manipSelectedRobotIdx: i }))}
              >
                <div
                  className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 text-[10px] font-bold"
                  style={{
                    background: isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'),
                    color: isSelected ? 'white' : t.textSecondary,
                  }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[12px] font-semibold leading-tight truncate"
                    style={{ color: isSelected ? accentColor : t.textPrimary }}
                  >
                    {r.manipObjectName}
                  </p>
                  <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: t.textSecondary }}>
                    {r.manipModel}{' \u00B7 '}{r.manipMaker}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center rounded-[6px] px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        color: isSelected ? accentColor : t.textSecondary,
                        background: isSelected ? accentRgba(accentColor, 0.14) : t.tabBarBg,
                        border: `1px solid ${isSelected ? accentRgba(accentColor, 0.38) : t.inputBorder}`,
                      }}
                    >
                      {isSingle ? L.manipListSingleItemTag : `${L.manipListCombinedItemTag} ${i + 1}`}
                    </span>
                  </div>
                </div>
                <SfdChevronTree
                  expanded={isSelected}
                  color={isSelected ? accentColor : t.textSecondary}
                  size={14}
                />
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: t.divider }} />
      <div className="p-2.5">
        <button
          type="button"
          className="w-full h-[34px] rounded-[9px] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
          style={{
            color: accentColor,
            background: isDark ? accentRgba(accentColor, 0.12) : accentRgba(accentColor, 0.08),
            border: `1px dashed ${accentRgba(accentColor, 0.42)}`,
          }}
          title={L.manipAddBindingHint}
          aria-label={L.manipAddBindingHint}
          onClick={() => {}}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
          {L.manipAddBindingBtn}
        </button>
      </div>
    </div>
  );
}

// ?? ?? ?? ??? ????????????????????????????????????????????????????????
function TabSection({ tabId, data, setData, t, eeSelectedIdx, setEeSelectedIdx, theme, activeCategoryId, objectAccent }: {
  tabId: TabContentId;
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
  eeSelectedIdx: number | null;
  setEeSelectedIdx: React.Dispatch<React.SetStateAction<number | null>>;
  theme: 'light' | 'dark';
  activeCategoryId?: string;
  objectAccent: string;
}) {
  const { L, locale } = useLocale();
  function f(key: keyof PanelData) { return (v: string) => setData((p) => ({ ...p, [key]: v })); }

  switch (tabId) {
    // ?? ????? ?? (??? + ??) ??????????????????
    case 'ee-list':
      return (
        <EeListSection
          data={data}
          setData={setData}
          t={t}
          selectedIdx={eeSelectedIdx}
          setSelectedIdx={setEeSelectedIdx}
          variant="settings-list-only"
          accentColor={objectAccent}
        />
      );
    case 'ee-conn':
      return (
        <EeListSection
          data={data}
          setData={setData}
          t={t}
          selectedIdx={eeSelectedIdx}
          setSelectedIdx={setEeSelectedIdx}
          variant="settings-list-only"
          accentColor={objectAccent}
        />
      );

    // ?? ?? ?? ??????????????????????????????????????
    case 'motion-path':
      return (
        <Section title={L.motionPath} accentColor={objectAccent} t={t}>
          <InputField label={L.pathType}    value={data.pathType}    onChange={f('pathType')}    t={t} />
          <InputField label={L.blendRadius} value={data.blendRadius} onChange={f('blendRadius')} t={t} />
        </Section>
      );
    case 'motion-speed':
      return (
        <Section title={L.motionSpeed} accentColor={objectAccent} t={t}>
          <InputField label={L.maxSpeed}     value={data.maxSpeed}     onChange={f('maxSpeed')}     t={t} />
          <InputField label={L.acceleration} value={data.acceleration} onChange={f('acceleration')} t={t} />
          <InputField label={L.jerk}         value={data.jerk}         onChange={f('jerk')}         t={t} />
        </Section>
      );
    // ?? ?? ?? ?? ?????????????????????????????????
    case 'collision-zone': {
      const cat = activeCategoryId as CollisionCategoryId | undefined;
      if (
        cat === 'collision-robot' ||
        cat === 'collision-endeffector' ||
        cat === 'collision-additional-axis' ||
        cat === 'collision-workpiece'
      ) {
        const zoneLabels: Record<
          CollisionCategoryId,
          { listTitle: string; areasTitle: string; entitySelectedPrefix: string }
        > = {
          'collision-robot': {
            listTitle: L.collisionRobotListTitle,
            areasTitle: L.collisionRobotExpectedAreasTitle,
            entitySelectedPrefix: L.collisionRobotSelectedPrefix,
          },
          'collision-endeffector': {
            listTitle: L.collisionEeListTitle,
            areasTitle: L.collisionEeExpectedAreasTitle,
            entitySelectedPrefix: L.collisionEeSelectedPrefix,
          },
          'collision-additional-axis': {
            listTitle: L.collisionAxisListTitle,
            areasTitle: L.collisionAxisExpectedAreasTitle,
            entitySelectedPrefix: L.collisionAxisSelectedPrefix,
          },
          'collision-workpiece': {
            listTitle: L.collisionWorkpieceListTitle,
            areasTitle: L.collisionWorkpieceExpectedAreasTitle,
            entitySelectedPrefix: L.collisionWorkpieceSelectedPrefix,
          },
        };
        const zl = zoneLabels[cat];
        return (
          <CollisionEntityZoneContent
            data={data}
            setData={setData}
            t={t}
            theme={theme}
            categoryId={cat}
            listTitle={zl.listTitle}
            areasTitle={zl.areasTitle}
            entitySelectedPrefix={zl.entitySelectedPrefix}
            accentColor={objectAccent}
          />
        );
      }
      return (
        <Section title={L.collisionZone} accentColor={objectAccent} t={t}>
          <InputField label={L.zoneShape}  value={data.zoneShape}  onChange={f('zoneShape')}  t={t} />
          <InputField label={L.zoneRadius} value={data.zoneRadius} onChange={f('zoneRadius')} t={t} />
          <InputField label={L.zoneHeight} value={data.zoneHeight} onChange={f('zoneHeight')} t={t} />
        </Section>
      );
    }
    case 'collision-detect': {
      const hideZoneDetect = [
        'collision-robot',
        'collision-endeffector',
        'collision-additional-axis',
        'collision-workpiece',
      ].includes(activeCategoryId ?? '');
      if (hideZoneDetect) return null;
      return (
        <Section title={L.collisionDet} accentColor={objectAccent} t={t}>
          <InputField label={L.sensitivity}  value={data.sensitivity}  onChange={f('sensitivity')}  t={t} />
          <InputField label={L.responseType} value={data.responseType} onChange={f('responseType')} t={t} />
        </Section>
      );
    }

    // ?? ?? ?? ?? ?????????????????????????????????
    case 'collab-workspaces':
      return (
        <CollabWorkspacePanel
          data={data}
          setData={setData}
          t={t}
          L={L}
          locale={locale}
          objectAccent={objectAccent}
          theme={theme}
        />
      );
    default:
      return null;
  }
}

// ?? PropertyPanel ????????????????????????????????????????????????????????????
interface PropertyPanelProps {
  theme?: 'dark' | 'light';
  initialX?: number;
  initialY?: number;
  selectedObjectId?: string;
  onClose?: () => void;
  onPosChange?: (x: number, y: number) => void;
  /** 헤더 그립 드래그 시작/종료 — App에서 서브레이어 도킹 기준 분리용 */
  onHeaderDragChange?: (dragging: boolean) => void;
  /** ?? ? ??(App)? ???? ????? ?? ?? ???? ?? */
  data?: PanelData;
  setData?: React.Dispatch<React.SetStateAction<PanelData>>;
  /** App?? ??? ?? ??? lightPos? ?? ? ?? ?? ??? ??? */
  syncedPosition?: { x: number; y: number } | null;
  /** App? CategoryMenu ???? ?? ???? (??? ? ?? state) */
  selectedMotionSeqId?: string | null;
  setSelectedMotionSeqId?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedMotionUploadKey?: string | null;
  setSelectedMotionUploadKey?: React.Dispatch<React.SetStateAction<string | null>>;
  selectedEeIdx?: number | null;
  setSelectedEeIdx?: React.Dispatch<React.SetStateAction<number | null>>;
  onMotionCategoryChange?: (categoryId: string) => void;
  /** ?? ??: ???? ?(??/EE/?) ? CategoryMenu ???? ?? */
  onCollisionCategoryChange?: (categoryId: string) => void;
  onEndEffectorCategoryChange?: (categoryId: string) => void;
  endeffectorActiveCategoryId?: string;
}

export default function PropertyPanel({
  theme = 'dark',
  initialX = 24,
  initialY = 24,
  selectedObjectId,
  onClose,
  onPosChange,
  onHeaderDragChange,
  syncedPosition,
  data: controlledData,
  setData: controlledSetData,
  selectedMotionSeqId: controlledSelectedMotionSeqId,
  setSelectedMotionSeqId: controlledSetSelectedMotionSeqId,
  selectedMotionUploadKey: controlledUploadKey,
  setSelectedMotionUploadKey: controlledSetUploadKey,
  selectedEeIdx: controlledEeSelectedIdx,
  setSelectedEeIdx: controlledSetEeSelectedIdx,
  onMotionCategoryChange,
  onCollisionCategoryChange,
  onEndEffectorCategoryChange,
  endeffectorActiveCategoryId: controlledEndeffectorCategoryId,
}: PropertyPanelProps) {
  const { L, objects, pointScheme } = useLocale();
  const objectAccent = useMemo(
    () => getObjectAccent(selectedObjectId ?? 'manipulator', pointScheme),
    [selectedObjectId, pointScheme],
  );
  const t = theme === 'light' ? LIGHT : DARK;
  const [internalData, setInternalData] = useState<PanelData>(DEFAULT_DATA);
  const data = controlledData ?? internalData;
  const setData = controlledSetData ?? setInternalData;
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: initialX, y: Math.max(WORKSPACE_CONTENT_TOP_PX, initialY) });
  useLayoutEffect(() => {
    if (syncedPosition == null) return;
    setPos({ x: syncedPosition.x, y: Math.max(WORKSPACE_CONTENT_TOP_PX, syncedPosition.y) });
  }, [syncedPosition?.x, syncedPosition?.y]);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const [internalEeSelectedIdx, setInternalEeSelectedIdx] = useState<number | null>(0);
  const eeSelectedIdx = controlledEeSelectedIdx !== undefined ? controlledEeSelectedIdx : internalEeSelectedIdx;
  const setEeSelectedIdx = controlledSetEeSelectedIdx ?? setInternalEeSelectedIdx;
  const [internalMotionSeqId, setInternalMotionSeqId] = useState<string | null>(null);
  const selectedMotionSeqId = controlledSelectedMotionSeqId !== undefined ? controlledSelectedMotionSeqId : internalMotionSeqId;
  const setSelectedMotionSeqId = controlledSetSelectedMotionSeqId ?? setInternalMotionSeqId;
  const [internalUploadKey, setInternalUploadKey] = useState<string | null>(null);
  const selectedMotionUploadKey = controlledUploadKey !== undefined ? controlledUploadKey : internalUploadKey;
  const setSelectedMotionUploadKey = controlledSetUploadKey ?? setInternalUploadKey;
  const [panelHeightPx, setPanelHeightPx] = useState<number | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'top' | 'bottom' | null>(null);
  const resizeRef = useRef({ clientY: 0, top: 0, height: 0, posX: 0 });

  const selectedObject = objects.find((o) => o.id === selectedObjectId) ?? objects[0];
  const isMotionObject = selectedObject.id === 'motion';
  const isManipulatorObject = selectedObject.id === 'manipulator';
  const [activeCategoryId, setActiveCategoryId] = useState(selectedObject.categories[0].id);

  useEffect(() => {
    const obj = objects.find((o) => o.id === selectedObjectId) ?? objects[0];
    setActiveCategoryId(obj.categories[0].id);
  }, [selectedObjectId, objects]);

  useEffect(() => {
    if (selectedObject.id !== 'endeffector') return;
    if (!controlledEndeffectorCategoryId) return;
    setActiveCategoryId((prev) => (prev === controlledEndeffectorCategoryId ? prev : controlledEndeffectorCategoryId));
  }, [selectedObject.id, controlledEndeffectorCategoryId]);

  useEffect(() => {
    if (selectedObject.id !== 'motion') setSelectedMotionSeqId(null);
  }, [selectedObject.id]);

  useEffect(() => {
    if (selectedObject.id === 'motion' && onMotionCategoryChange) {
      onMotionCategoryChange(activeCategoryId);
    }
  }, [activeCategoryId, selectedObject.id, onMotionCategoryChange]);

  useEffect(() => {
    if (selectedObject.id === 'collision' && onCollisionCategoryChange) {
      onCollisionCategoryChange(activeCategoryId);
    }
  }, [activeCategoryId, selectedObject.id, onCollisionCategoryChange]);

  useEffect(() => {
    if (selectedObject.id === 'endeffector' && onEndEffectorCategoryChange) {
      onEndEffectorCategoryChange(activeCategoryId);
    }
  }, [activeCategoryId, selectedObject.id, onEndEffectorCategoryChange]);

  useEffect(() => {
    setPanelHeightPx(null);
    setPos((p) => {
      const maxX = Math.max(0, window.innerWidth - PANEL_WIDTH);
      return {
        x: Math.min(p.x, maxX),
        y: Math.max(WORKSPACE_CONTENT_TOP_PX, p.y),
      };
    });
  }, [selectedObject.id]);

  useEffect(() => {
    if (!resizeEdge) return;
    const minH = PANEL_MIN_HEIGHT;
    function onMove(e: PointerEvent) {
      const maxH = Math.max(minH, window.innerHeight - WORKSPACE_CONTENT_TOP_PX - 16);
      if (resizeEdge === 'bottom') {
        const dy = e.clientY - resizeRef.current.clientY;
        let nh = resizeRef.current.height + dy;
        nh = Math.min(Math.max(nh, minH), maxH);
        setPanelHeightPx(nh);
      } else {
        const dy = e.clientY - resizeRef.current.clientY;
        let newTop = resizeRef.current.top + dy;
        let nh = resizeRef.current.height - dy;
        if (nh < minH) {
          newTop = resizeRef.current.top + resizeRef.current.height - minH;
          nh = minH;
        } else if (nh > maxH) {
          newTop = resizeRef.current.top + resizeRef.current.height - maxH;
          nh = maxH;
        }
        newTop = Math.max(WORKSPACE_CONTENT_TOP_PX, newTop);
        const x = resizeRef.current.posX;
        setPos({ x, y: newTop });
        setPanelHeightPx(nh);
        onPosChange?.(x, newTop);
      }
    }
    function onUp() {
      setResizeEdge(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [resizeEdge, onPosChange]);

  const activeCategory = selectedObject.categories.find((c) => c.id === activeCategoryId) ?? selectedObject.categories[0];
  const isMotionUploadCategory = isMotionObject && activeCategory.id === 'motion-upload';
  const isMotionGenerateCategory = isMotionObject && activeCategory.id === 'motion-generate';

  const startTopResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!panelRef.current) return;
    const h = panelHeightPx ?? panelRef.current.offsetHeight;
    resizeRef.current = { clientY: e.clientY, top: pos.y, height: h, posX: pos.x };
    if (panelHeightPx === null) setPanelHeightPx(h);
    setResizeEdge('top');
  }, [panelHeightPx, pos.x, pos.y]);

  const startBottomResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!panelRef.current) return;
    const h = panelHeightPx ?? panelRef.current.offsetHeight;
    resizeRef.current = { clientY: e.clientY, top: pos.y, height: h, posX: pos.x };
    if (panelHeightPx === null) setPanelHeightPx(h);
    setResizeEdge('bottom');
  }, [panelHeightPx, pos.x, pos.y]);

  const categoryTabRowRef = useRef<HTMLDivElement>(null);
  const scrollCategoryTabsToEnd = useCallback(() => {
    const el = categoryTabRowRef.current;
    if (!el || el.scrollWidth <= el.clientWidth + 1) return;
    el.scrollTo({ left: el.scrollWidth - el.clientWidth, behavior: 'smooth' });
  }, []);
  const scrollCategoryTabsToStart = useCallback(() => {
    const el = categoryTabRowRef.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (selectedObject.id !== 'motion' || !data.handGuidingMode) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key !== 'Enter') return;
      e.preventDefault();
      setData((p) => ({
        ...p,
        motionSequenceItems: [
          ...p.motionSequenceItems,
          createMotionSeqItemMove(p, `ms-${Date.now()}`, 'MoveL'),
        ],
      }));
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedObject.id, data.handGuidingMode, setData]);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true; setIsDragging(true);
    onHeaderDragChange?.(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos, onHeaderDragChange]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const panel = panelRef.current;
    const w = panel?.offsetWidth ?? PANEL_WIDTH;
    const maxX = window.innerWidth - w;
    const maxY = window.innerHeight - (panel?.offsetHeight ?? 200);
    const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), maxX);
    const newY = Math.min(
      Math.max(WORKSPACE_CONTENT_TOP_PX, e.clientY - dragOffset.current.y),
      maxY,
    );
    setPos({ x: newX, y: newY });
    onPosChange?.(newX, newY);
  }, [onPosChange]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
    onHeaderDragChange?.(false);
  }, [onHeaderDragChange]);

  useEffect(() => {
    function onResize() {
      const panel = panelRef.current;
      const pw = panel?.offsetWidth ?? PANEL_WIDTH;
      setPos((prev) => {
        const newX = Math.min(prev.x, window.innerWidth - pw);
        const newY = Math.min(
          Math.max(prev.y, WORKSPACE_CONTENT_TOP_PX),
          window.innerHeight - (panel?.offsetHeight ?? 200),
        );
        onPosChange?.(newX, newY);
        return { x: newX, y: newY };
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onPosChange]);

  return (
    <div
      ref={panelRef}
      className="absolute flex flex-col w-[320px] rounded-[16px] overflow-hidden"
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: 50,
        width: PANEL_WIDTH,
        minHeight: panelHeightPx != null ? undefined : (isMotionObject ? PANEL_MIN_HEIGHT : undefined),
        height: panelHeightPx ?? undefined,
        maxHeight: panelHeightPx ? undefined : `calc(100vh - ${WORKSPACE_CONTENT_TOP_PX + 12}px)`,
        background: t.panelBg,
        backdropFilter: theme === 'dark' ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: theme === 'dark' ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
        border: `1px solid ${t.panelBorder}`,
        boxShadow: t.panelShadow,
      }}
    >
      <div
        className="absolute left-0 right-0 top-0 z-[60] h-1.5 cursor-ns-resize hover:bg-[rgba(59,130,246,0.12)]"
        style={{ touchAction: 'none' }}
        onPointerDown={startTopResize}
        role="separator"
        aria-label={L.panelResizeTopAria}
      />

      {/* ?? */}
      <div
        className="flex items-center gap-3 px-4 py-4 shrink-0 select-none box-border"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          minHeight: PROPERTY_PANEL_DRAG_HEADER_HEIGHT_PX,
        }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      >
        <div className="shrink-0" style={{ color: t.dragHandleColor }}><GripHorizontal className="w-4 h-4" strokeWidth={2} /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] leading-tight truncate" style={{ color: t.textPrimary, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {selectedObject.id === 'endeffector'
              ? L.panelEeDetailTitle
              : selectedObject.id === 'manipulator'
                ? L.panelManipulatorDetailTitle
                : selectedObject.label}
          </p>
          <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: t.textSecondary }}>
            {isManipulatorObject
              ? (() => {
                  const robots = data.manipRobots;
                  if (data.manipSelectedRobotIdx == null) return L.manipListPanelSubtitle;
                  const idx = Math.min(Math.max(0, data.manipSelectedRobotIdx), Math.max(0, robots.length - 1));
                  const r = robots[idx];
                  return r ? `${r.manipObjectName} · ${r.manipModel}` : L.manipListPanelSubtitle;
                })()
              : activeCategory.panelSubtitle}
          </p>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] transition-all duration-150 shrink-0"
          title="최소화"
          aria-label="최소화"
          style={{ background: t.closeButtonBg, color: t.textSecondary }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.closeButtonHoverBg; (e.currentTarget as HTMLButtonElement).style.color = t.closeButtonHoverColor; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.closeButtonBg; (e.currentTarget as HTMLButtonElement).style.color = t.textSecondary; }}>
          <SfdIconByIndex index={2} color="currentColor" size={14} />
        </button>
      </div>

      <div style={{ height: 1, background: t.divider }} />

      {/* 카테고리가 2개 이상일 때만 상단 탭 표시 (협동 작업 등 단일 카테고리는 생략) */}
      {selectedObject.categories.length > 1 && selectedObject.id !== 'endeffector' ? (
        <>
          <div
            ref={categoryTabRowRef}
            className="flex shrink-0 px-4 pt-4 pb-0 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden box-border"
            style={{
              background: t.tabBarBg,
              scrollbarWidth: 'none',
              minHeight: PROPERTY_PANEL_CATEGORY_TAB_ROW_HEIGHT_PX,
            }}
            onMouseEnter={scrollCategoryTabsToEnd}
            onMouseLeave={scrollCategoryTabsToStart}
          >
            {selectedObject.categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="shrink-0 px-3 py-2 text-[11px] rounded-t-[8px] transition-all duration-150 relative"
                  style={{
                    color: isActive ? cat.color : t.textSecondary,
                    background: isActive ? t.tabActiveBg : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    boxShadow: isActive ? t.elevationRaised : 'none',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    if (isActive) el.style.filter = 'brightness(1.08)';
                    else el.style.background = t.sectionHeaderHover;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.filter = '';
                    el.style.background = isActive ? t.tabActiveBg : 'transparent';
                  }}
                >
                  {cat.label}
                  {isActive && <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: cat.color }} />}
                </button>
              );
            })}
          </div>

          <div style={{ height: 1, background: t.divider }} />
        </>
      ) : null}

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <div
          className={
            isMotionObject
              ? 'flex-none min-h-0 h-fit overflow-y-auto sfd-scroll w-full'
              : 'flex-1 min-h-0 overflow-y-auto sfd-scroll'
          }
          style={
            isMotionObject
              ? { scrollbarWidth: 'none', height: 'fit-content', maxHeight: 'min(32vh, 220px)' }
              : { scrollbarWidth: 'none' }
          }
        >
          {isManipulatorObject ? (
            <div className="flex flex-col gap-2 p-4">
              <ManipulatorListSection
                data={data}
                setData={setData}
                t={t}
                accentColor={objectAccent}
              />
            </div>
          ) : activeCategory.tabs.length > 0 ? (
            <div className="flex flex-col gap-2 p-4">
              {activeCategory.tabs.map((tab) => (
                <TabSection
                  key={tab.id}
                  tabId={tab.id}
                  data={data}
                  setData={setData}
                  t={t}
                  eeSelectedIdx={eeSelectedIdx}
                  setEeSelectedIdx={setEeSelectedIdx}
                  theme={theme}
                  activeCategoryId={activeCategoryId}
                  objectAccent={objectAccent}
                />
              ))}
            </div>
          ) : null}
        </div>

        {selectedObject.id === 'motion' && isMotionUploadCategory && (
          <div
            className="flex flex-1 min-h-0 flex-col gap-2 px-3 pt-2 pb-2 border-t"
            style={{ borderColor: t.footerBorder, background: t.tabBarBg }}
          >
            <MotionUploadFileListDock
              data={data}
              setData={setData}
              t={t}
              theme={theme}
              selectedUploadKey={selectedMotionUploadKey}
              setSelectedUploadKey={setSelectedMotionUploadKey}
              accentColor={objectAccent}
            />
            <div className="shrink-0 flex justify-end w-full">
              <button
                type="button"
                title={L.toolChangeTooltip}
                aria-pressed={data.toolChangeMode}
                aria-label={L.toolChangeBtn}
                className="inline-flex items-center gap-1 px-2 py-2 rounded-[10px] text-[10px] font-semibold tracking-tight border transition-all active:scale-[0.98] whitespace-nowrap"
                style={{
                  height: 38,
                  color: data.toolChangeMode ? '#7c3aed' : t.textPrimary,
                  borderColor: data.toolChangeMode
                    ? 'rgba(139, 92, 246, 0.75)'
                    : theme === 'light'
                      ? 'rgba(100, 116, 139, 0.45)'
                      : 'rgba(148, 163, 184, 0.45)',
                  background: data.toolChangeMode
                    ? (theme === 'light' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.22)')
                    : (theme === 'light' ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)'),
                  boxShadow: data.toolChangeMode ? '0 0 0 1px rgba(139, 92, 246, 0.2)' : 'none',
                }}
                onClick={() =>
                  setData((p) => ({ ...p, toolChangeMode: !p.toolChangeMode }))
                }
              >
                {L.toolChangeBtn}
              </button>
            </div>
          </div>
        )}

        {selectedObject.id === 'motion' && isMotionGenerateCategory && (
          <>
            <div
              className="flex flex-1 min-h-0 flex-col px-3 pt-1.5 pb-1 border-t"
              style={{ borderColor: t.footerBorder, background: t.tabBarBg }}
            >
              {data.motionSequenceItems.length === 0 ? (
                <div className="flex-1 min-h-[100px] flex items-start">
                  <p className="text-[11px] py-1 px-0.5" style={{ color: t.textSecondary }}>{L.motionSequenceEmpty}</p>
                </div>
              ) : (
                <div
                  className="rounded-[10px] overflow-hidden flex flex-col flex-1 min-h-0 h-[280px]"
                  style={{
                    minHeight: 96,
                    background: theme === 'light' ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${t.inputBorder}`,
                    boxShadow: t.elevationSection,
                  }}
                >
                  <div className="flex items-center gap-2 px-2.5 py-1.5 shrink-0" style={{ background: t.sectionHeaderBg }}>
                    <span className="text-[10px] font-semibold uppercase tracking-wide truncate flex-1" style={{ color: t.textSecondary }}>
                      {L.motionSequenceListTitle}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-1 py-0.5 flex flex-col gap-0.5">
                    {(() => {
                      let moveOrd = 0;
                      let waitOrd = 0;
                      return data.motionSequenceItems.map((it) => {
                        const isMove = it.kind === 'move';
                        if (isMove) moveOrd += 1;
                        else waitOrd += 1;
                        const rowLabel = isMove
                          ? `${L.motionListWaypointPrefix}${moveOrd}`
                          : `${L.motionListWaitTimeLabel} ${waitOrd}`;
                        const dur = it.durationSec;
                        const selected = selectedMotionSeqId === it.id;
                        return (
                          <button
                            key={it.id}
                            type="button"
                            className="w-full flex items-center gap-1.5 px-1.5 py-1 rounded-[6px] text-left transition-colors duration-150 min-h-0"
                            style={{
                              background: theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.85)',
                              border: selected ? '2px solid #3b82f6' : `1px solid ${t.inputBorder}`,
                              boxShadow: selected ? '0 0 0 1px rgba(59,130,246,0.2)' : undefined,
                            }}
                            onClick={() =>
                              setSelectedMotionSeqId((k) => (k === it.id ? null : it.id))
                            }
                          >
                            <div
                              className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center shrink-0"
                              style={{ background: '#2a2a2f' }}
                            >
                              <SfdIconByIndex
                                index={motionSeqRowIconIndex(it)}
                                color="#f5f5f5"
                                size={PP_ICON_PX.sm}
                              />
                            </div>
                            <span className="flex-1 min-w-0 text-[10px] font-medium truncate leading-tight" style={{ color: t.textPrimary }}>
                              {rowLabel}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {dur !== undefined && dur !== '' && (
                                <span className="text-[10px] font-medium tabular-nums" style={{ color: t.textSecondary }}>
                                  {dur}s
                                </span>
                              )}
                              {isMove && it.showVisibilityIcon && (
                                <Eye className="w-3.5 h-3.5 shrink-0" strokeWidth={2} style={{ color: t.textSecondary }} aria-hidden />
                              )}
                            </div>
                          </button>
                        );
                      });
                    })()}
                  </div>
                  <div
                    className="shrink-0 flex justify-end px-2 py-0.5 border-t"
                    style={{ borderColor: t.divider, background: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(0,0,0,0.15)' }}
                  >
                    <span className="text-[10px] font-medium tabular-nums leading-none" style={{ color: t.textSecondary }}>
                      {L.motionListTotalLabel} : {formatMotionTotalSec(sumMotionDurationSec(data.motionSequenceItems))}s
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div
              className="shrink-0 sticky bottom-0 z-20 px-3 py-2 border-t"
              style={{
                borderColor: t.footerBorder,
                background: t.panelBg,
                boxShadow: '0 -10px 28px rgba(0,0,0,0.07)',
              }}
            >
              {data.handGuidingMode ? (
                <div
                  className="rounded-[12px] shrink-0 flex flex-col gap-2 p-2.5"
                  style={{
                    border: `1px solid ${t.panelBorder}`,
                    background: t.sectionHeaderBg,
                    boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.06)' : '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="flex items-center gap-2 px-0.5 pb-0.5 border-b" style={{ borderColor: t.divider }}>
                    <span className="text-[12px] font-bold leading-tight" style={{ color: '#ff8e2b' }}>
                      핸드가이딩 모드
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-[4px] leading-none"
                      style={{
                        background: theme === 'light' ? 'rgba(255,107,0,0.14)' : 'rgba(255,107,0,0.24)',
                        color: '#ff8e2b',
                      }}
                    >
                      ON
                    </span>
                  </div>
                  <p className="text-[10px] leading-snug px-0.5" style={{ color: t.textSecondary }}>
                    {L.motionGenerateEmptyHint}
                  </p>
                  <div className="flex gap-2 w-full min-w-0">
                    <button
                      type="button"
                      className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-[10px] text-[11px] font-semibold border transition-all active:scale-[0.98] whitespace-nowrap"
                      style={{
                        height: 34,
                        background:
                          theme === 'light'
                            ? 'linear-gradient(145deg, #3d3d3d 0%, #141414 100%)'
                            : 'linear-gradient(145deg, #4a4a4a 0%, #1f1f1f 100%)',
                        borderColor: theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.12)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.38)',
                        color: '#f5f5f5',
                      }}
                      onClick={() =>
                        setData((p) => {
                          const mv =
                            p.motionSequenceItems.filter((x) => x.kind === 'move').length % 2 === 0 ? 'MoveL' : 'MoveJ';
                          return {
                            ...p,
                            motionSequenceItems: [
                              ...p.motionSequenceItems,
                              createMotionSeqItemMove(p, `ms-${Date.now()}`, mv),
                            ],
                          };
                        })
                      }
                    >
                      <SfdIconByIndex index={SFD_ICON_HAND_GUIDING_ADD_MOVE} color="#f5f5f5" size={PP_ICON_PX.md} />
                      이동 모션 추가
                    </button>
                    <button
                      type="button"
                      className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-[10px] text-[11px] font-semibold border transition-all active:scale-[0.98] whitespace-nowrap"
                      style={{
                        height: 34,
                        background:
                          theme === 'light'
                            ? 'linear-gradient(145deg, #2a2a2a 0%, #0a0a0a 100%)'
                            : 'linear-gradient(145deg, #383838 0%, #121212 100%)',
                        borderColor: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.42)',
                        color: '#f5f5f5',
                      }}
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          motionSequenceItems: [
                            ...p.motionSequenceItems,
                            createMotionSeqItemStop(p, `ms-${Date.now()}`),
                          ],
                        }))
                      }
                    >
                      <SfdIconByIndex index={SFD_ICON_HAND_GUIDING_ADD_STOP} color="#f5f5f5" size={PP_ICON_PX.md} />
                      정지 시간 추가
                    </button>
                  </div>
                  <button
                    type="button"
                    className="w-full py-2 rounded-[10px] text-[12px] font-semibold border transition-all duration-200 active:scale-[0.98]"
                    style={{
                      borderColor: t.inputBorder,
                      background: theme === 'light' ? 'rgba(252,252,253,0.95)' : 'rgba(22,23,28,0.9)',
                      color: t.textPrimary,
                    }}
                    onClick={() => setData((p) => ({ ...p, handGuidingMode: false }))}
                  >
                    {L.handGuidingExit}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full min-w-0">
                  <p className="text-[10px] leading-snug text-center" style={{ color: t.textSecondary }}>
                    {L.motionGenerateEmptyHint}
                  </p>
                  <div className="flex flex-nowrap items-center justify-center gap-2 w-full min-w-0">
                    <button
                      type="button"
                      title={L.tooltipAddMoveMotion}
                      className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-[10px] text-[11px] font-semibold border transition-all active:scale-[0.98] whitespace-nowrap"
                      style={{
                        height: 34,
                        background:
                          theme === 'light'
                            ? 'linear-gradient(145deg, #3d3d3d 0%, #141414 100%)'
                            : 'linear-gradient(145deg, #4a4a4a 0%, #1f1f1f 100%)',
                        borderColor: theme === 'light' ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.12)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.38)',
                        color: '#f5f5f5',
                      }}
                      onClick={() =>
                        setData((p) => {
                          const mv =
                            p.motionSequenceItems.filter((x) => x.kind === 'move').length % 2 === 0 ? 'MoveL' : 'MoveJ';
                          return {
                            ...p,
                            motionSequenceItems: [
                              ...p.motionSequenceItems,
                              createMotionSeqItemMove(p, `ms-${Date.now()}`, mv),
                            ],
                          };
                        })
                      }
                    >
                      <SfdIconByIndex index={SFD_ICON_HAND_GUIDING_ADD_MOVE} color="#f5f5f5" size={PP_ICON_PX.md} />
                      이동 모션 추가
                    </button>
                    <button
                      type="button"
                      title={L.tooltipAddStopMotion}
                      className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-[10px] text-[11px] font-semibold border transition-all active:scale-[0.98] whitespace-nowrap"
                      style={{
                        height: 34,
                        background:
                          theme === 'light'
                            ? 'linear-gradient(145deg, #2a2a2a 0%, #0a0a0a 100%)'
                            : 'linear-gradient(145deg, #383838 0%, #121212 100%)',
                        borderColor: theme === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.42)',
                        color: '#f5f5f5',
                      }}
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          motionSequenceItems: [
                            ...p.motionSequenceItems,
                            createMotionSeqItemStop(p, `ms-${Date.now()}`),
                          ],
                        }))
                      }
                    >
                      <SfdIconByIndex index={SFD_ICON_HAND_GUIDING_ADD_STOP} color="#f5f5f5" size={PP_ICON_PX.md} />
                      정지 시간 추가
                    </button>
                  </div>
                  <button
                    type="button"
                    className="w-full px-3 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all active:scale-[0.98] border"
                    style={{
                      height: 40,
                      color: 'white',
                      borderColor: 'rgba(255,107,0,0.45)',
                      background: 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)',
                      boxShadow: '0 4px 16px rgba(255,107,0,0.35)',
                    }}
                    onClick={() => setData((p) => ({ ...p, handGuidingMode: true }))}
                  >
                    핸드가이딩 모드 On
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div
        className="absolute left-0 right-0 bottom-0 z-[60] h-1.5 cursor-ns-resize hover:bg-[rgba(59,130,246,0.12)]"
        style={{ touchAction: 'none' }}
        onPointerDown={startBottomResize}
        role="separator"
        aria-label={L.panelResizeBottomAria}
      />
    </div>
  );
}
