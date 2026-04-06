/* eslint-disable */
// Generator script - run with: node gen-components.cjs
const fs = require('fs');

const PANEL = `import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ChevronDown, Info, GripHorizontal, Plus, ChevronRight, Lock } from 'lucide-react';
import { OBJECTS } from './menuData';
import type { TabContentId } from './types';
import { L } from './labels';

// ── 엔드이펙터 슬롯 타입 ────────────────────────────────────────────────────
interface EeSlot {
  name: string;
  type: string;
  mass: string;
  tcpPos: { x: string; y: string; z: string };
  tcpRot: { rx: string; ry: string; rz: string };
}

interface ManipLinkedRow {
  name: string;
  model: string;
  kind: string;
}

// ── 공유 데이터 인터페이스 ───────────────────────────────────────────────────
interface PanelData {
  // 매니퓰레이터 - 스펙
  manipObjectName: string;
  manipModel: string; manipMaker: string; manipPayload: string; manipReach: string;
  // 매니퓰레이터 - 위치/방향
  position: { x: string; y: string; z: string };
  rotation: { rx: string; ry: string; rz: string };
  size: { w: string; d: string; h: string };
  // 매니퓰레이터 - 질량
  mass: string; autoCoM: boolean;
  centerOfMass: { cx: string; cy: string; cz: string };
  // 매니퓰레이터 - 안전 등급/인증
  safetyPl: string; safetyCategory: string; safetySil: string;
  certStatus: string;
  safetyStopTime: string; safetyTcpLimit: string;
  safetyLogicApplied: boolean;
  safetyMonitoringStatus: string;
  safetyLastVerified: string;
  stopTsMs: string; stopSsMm: string;
  responseDelayMs: string; responseDelayLocked: boolean;
  // 매니퓰레이터 - 연결 정보 (참조·3D 결합 등)
  manipLinkedItems: ManipLinkedRow[];
  // 엔드이펙터 그룹 - 슬롯 목록 (최대 5개)
  eeSlots: (EeSlot | null)[];
  // 모션 설정
  pathType: string; blendRadius: string;
  maxSpeed: string; acceleration: string; jerk: string;
  // 충돌 예상 부위
  zoneShape: string; zoneRadius: string; zoneHeight: string;
  sensitivity: string; responseType: string;
  // 협동 작업 영역
  areaWidth: string; areaDepth: string; areaHeight: string;
  pflEnabled: boolean; ssmEnabled: boolean; minSepDist: string; safeSpeed: string;
}

// ── 디자인 토큰 ─────────────────────────────────────────────────────────────
interface Tokens {
  panelBg: string; panelBorder: string; panelShadow: string;
  sectionHeaderBg: string; sectionHeaderHover: string;
  inputBg: string; inputBorder: string; inputFocusBorder: string; inputFocusShadow: string;
  textPrimary: string; textSecondary: string; textValue: string;
  divider: string; closeButtonBg: string; closeButtonHoverBg: string; closeButtonHoverColor: string;
  dragHandleColor: string; footerBorder: string; tabBarBg: string; tabActiveBg: string;
}

const DARK: Tokens = {
  panelBg: 'rgba(16, 17, 20, 0.82)', panelBorder: 'rgba(255,255,255,0.09)',
  panelShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.06) inset',
  sectionHeaderBg: 'rgba(255,255,255,0.04)', sectionHeaderHover: 'rgba(255,255,255,0.07)',
  inputBg: 'rgba(255,255,255,0.05)', inputBorder: 'rgba(255,255,255,0.10)',
  inputFocusBorder: '#ff8e2b', inputFocusShadow: '0 0 0 2px rgba(255,142,43,0.15)',
  textPrimary: '#f0f0f0', textSecondary: '#777', textValue: '#c8c8c8',
  divider: 'rgba(255,255,255,0.06)', closeButtonBg: 'rgba(255,255,255,0.06)',
  closeButtonHoverBg: 'rgba(255,255,255,0.14)', closeButtonHoverColor: '#f0f0f0',
  dragHandleColor: 'rgba(255,255,255,0.2)', footerBorder: 'rgba(255,255,255,0.06)',
  tabBarBg: 'rgba(255,255,255,0.03)', tabActiveBg: 'rgba(255,255,255,0.08)',
};

const LIGHT: Tokens = {
  panelBg: 'rgba(252, 252, 253, 0.92)', panelBorder: 'rgba(0,0,0,0.08)',
  panelShadow: '0 24px 48px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06) inset',
  sectionHeaderBg: 'rgba(0,0,0,0.025)', sectionHeaderHover: 'rgba(0,0,0,0.05)',
  inputBg: 'rgba(0,0,0,0.035)', inputBorder: 'rgba(0,0,0,0.10)',
  inputFocusBorder: '#ff8e2b', inputFocusShadow: '0 0 0 2px rgba(255,142,43,0.18)',
  textPrimary: '#111111', textSecondary: '#999', textValue: '#333',
  divider: 'rgba(0,0,0,0.07)', closeButtonBg: 'rgba(0,0,0,0.05)',
  closeButtonHoverBg: 'rgba(0,0,0,0.10)', closeButtonHoverColor: '#111',
  dragHandleColor: 'rgba(0,0,0,0.18)', footerBorder: 'rgba(0,0,0,0.07)',
  tabBarBg: 'rgba(0,0,0,0.02)', tabActiveBg: 'rgba(0,0,0,0.06)',
};

// ── 주요 CTA 버튼 (적용하기와 동일 스타일) ─────────────────────────────────
function PrimaryCtaButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button type="button"
      className="w-full flex items-center justify-center text-[13px] font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.98]"
      style={{ height: 38, color: 'white', background: 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)', boxShadow: '0 4px 16px rgba(255,107,0,0.35)', letterSpacing: '-0.01em' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.50)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(255,107,0,0.35)'; }}
      onClick={onClick}>
      {children}
    </button>
  );
}

// ── 기본 컴포넌트 ───────────────────────────────────────────────────────────
function InputField({ label, value, onChange, t }: { label: string; value: string; onChange?: (v: string) => void; t: Tokens }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] transition-all duration-150"
      style={{ background: t.inputBg, border: \`1px solid \${focused ? t.inputFocusBorder : t.inputBorder}\`, boxShadow: focused ? t.inputFocusShadow : 'none' }}>
      <span className="text-[13px] shrink-0 leading-none" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
      <input className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
        style={{ color: t.textValue, fontWeight: 500 }}
        value={value} onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}

function DropdownField({ label, value, options, onChange, t }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; t: Tokens }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const display = options.find((o) => o.value === value)?.label ?? value;
  return (
    <div className="relative w-full shrink-0" ref={rootRef}>
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] cursor-pointer transition-all duration-150"
        style={{ background: t.inputBg, border: \`1px solid \${open ? t.inputFocusBorder : t.inputBorder}\`, boxShadow: open ? t.inputFocusShadow : 'none' }}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        {!label ? null : (
          <span className="text-[13px] shrink-0 leading-none truncate max-w-[48%]" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        )}
        <span className="flex-1 min-w-0 text-right text-[12px] font-medium truncate" style={{ color: t.textValue }}>{display}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" style={{ color: t.textSecondary, transform: open ? 'rotate(180deg)' : 'none' }} />
      </div>
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 max-h-[220px] overflow-y-auto rounded-[10px] py-1 sfd-scroll"
          style={{
            background: t === DARK ? 'rgba(22,23,28,0.96)' : 'rgba(252,252,253,0.98)',
            border: \`1px solid \${t.inputBorder}\`,
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
      )}
    </div>
  );
}

function CertStatusDropdown({ label, value, onChange, t }: { label: string; value: string; onChange: (v: string) => void; t: Tokens }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const presets = [
    { value: 'KCs', label: 'KCs' },
    { value: 'ISO_10218_1', label: 'ISO_10218_1' },
    { value: 'CE', label: 'CE' },
    { value: 'UL', label: 'UL' },
  ];
  useEffect(() => {
    function h(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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
  return (
    <div className="relative w-full shrink-0" ref={rootRef}>
      <div
        role="button"
        tabIndex={0}
        className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] cursor-pointer transition-all duration-150"
        style={{ background: t.inputBg, border: \`1px solid \${open ? t.inputFocusBorder : t.inputBorder}\`, boxShadow: open ? t.inputFocusShadow : 'none' }}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        <span className="text-[13px] shrink-0 leading-none truncate max-w-[48%]" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        <span className="flex-1 min-w-0 text-right text-[12px] font-medium truncate" style={{ color: t.textValue }}>{display || '\u2014'}</span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform duration-200" style={{ color: t.textSecondary, transform: open ? 'rotate(180deg)' : 'none' }} />
      </div>
      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-40 max-h-[280px] overflow-y-auto rounded-[10px] py-1 sfd-scroll"
          style={{
            background: t === DARK ? 'rgba(22,23,28,0.96)' : 'rgba(252,252,253,0.98)',
            border: \`1px solid \${t.inputBorder}\`,
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
              style={{ background: t.inputBg, border: \`1px solid \${t.inputBorder}\`, color: t.textPrimary }}
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
      )}
    </div>
  );
}

function TripleInput({ labels, values, onChange, t }: { labels: [string, string, string]; values: [string, string, string]; onChange?: (i: number, v: string) => void; t: Tokens }) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5 w-full overflow-hidden">
      {labels.map((label, i) => (
        <div key={label} className="relative flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px] transition-all duration-150"
          style={{ background: t.inputBg, border: \`1px solid \${fi === i ? t.inputFocusBorder : t.inputBorder}\`, boxShadow: fi === i ? t.inputFocusShadow : 'none' }}>
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

function SubLabel({ text, t }: { text: string; t: Tokens }) {
  return <p className="text-[12px] px-1 pt-1" style={{ color: t.textSecondary, fontWeight: 500, letterSpacing: '0.04em' }}>{text.toUpperCase()}</p>;
}

function Toggle({ label, tooltip, value, onChange, t }: { label: string; tooltip?: string; value: boolean; onChange: (v: boolean) => void; t: Tokens }) {
  return (
    <div className="flex items-center gap-2 px-1 min-h-[34px]">
      <div className="flex-1 flex items-center gap-1.5">
        <span className="text-[14px] leading-none" style={{ color: t.textSecondary, fontWeight: 500 }}>{label}</span>
        {tooltip && <div title={tooltip}><Info className="w-3 h-3" style={{ color: t.textSecondary }} /></div>}
      </div>
      <button onClick={() => onChange(!value)} className="relative shrink-0 transition-all duration-200"
        style={{ width: 36, height: 20, borderRadius: 999, background: value ? 'linear-gradient(135deg,#ff8e2b,#ff6b00)' : (t === LIGHT ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'), boxShadow: value ? '0 0 8px rgba(255,142,43,0.4)' : 'none', border: \`1px solid \${value ? 'transparent' : t.inputBorder}\` }}>
        <div className="absolute top-[2px] transition-all duration-200" style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', left: value ? 'calc(100% - 16px)' : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

function Section({ title, accentColor = '#ff8e2b', defaultOpen = true, children, t }: { title: string; accentColor?: string; defaultOpen?: boolean; children: React.ReactNode; t: Tokens }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: \`1px solid \${t.panelBorder}\` }}>
      <button className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors duration-150"
        style={{ background: hovered ? t.sectionHeaderHover : (open ? t.sectionHeaderBg : 'transparent') }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpen(!open)}>
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
        <span className="flex-1 text-left text-[12px] leading-none" style={{ color: t.textPrimary, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 shrink-0" style={{ color: t.textSecondary, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </button>
      {open && <div style={{ height: 1, background: t.divider }} />}
      {open && <div className="flex flex-col gap-2 p-3">{children}</div>}
    </div>
  );
}

function StopPerformanceSection({ data, setData, t }: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
}) {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState(false);
  const locked = data.responseDelayLocked;
  return (
    <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: \`1px solid \${t.panelBorder}\` }}>
      <button type="button" className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors duration-150"
        style={{ background: hovered ? t.sectionHeaderHover : (open ? t.sectionHeaderBg : 'transparent') }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpen(!open)}>
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: '#a78bfa' }} />
        <span className="flex-1 text-left text-[12px] leading-none" style={{ color: t.textPrimary, fontWeight: 600, letterSpacing: '-0.01em' }}>{L.stopPerfTitle}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 shrink-0" style={{ color: t.textSecondary, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </button>
      {open && <div style={{ height: 1, background: t.divider }} />}
      {open && (
        <div className="flex flex-col gap-2.5 p-3">
          <div className="rounded-[10px] p-3.5" style={{ border: '1px solid rgba(255,142,43,0.42)', background: t.inputBg }}>
            <p className="text-[12px] mb-1.5 font-medium" style={{ color: t.textSecondary }}>{L.stopTsLabel}</p>
            <div className="flex items-baseline gap-1.5">
              <input className="min-w-0 flex-1 text-[22px] font-bold leading-none bg-transparent outline-none tabular-nums"
                style={{ color: t.textPrimary }}
                value={data.stopTsMs}
                onChange={(e) => setData((p) => ({ ...p, stopTsMs: e.target.value }))} />
              <span className="text-[18px] font-bold shrink-0" style={{ color: t.textPrimary }}>ms</span>
            </div>
            <p className="text-[10px] mt-2.5 leading-relaxed" style={{ color: t.textSecondary }}>{L.stopPerfHint}</p>
          </div>
          <div className="rounded-[10px] p-3.5" style={{ border: \`1px solid \${t.inputBorder}\`, background: t.inputBg }}>
            <p className="text-[12px] mb-1.5 font-medium" style={{ color: t.textSecondary }}>{L.stopSsLabel}</p>
            <div className="flex items-baseline gap-1.5">
              <input className="min-w-0 flex-1 text-[22px] font-bold leading-none bg-transparent outline-none tabular-nums"
                style={{ color: '#ff8e2b' }}
                value={data.stopSsMm}
                onChange={(e) => setData((p) => ({ ...p, stopSsMm: e.target.value }))} />
              <span className="text-[18px] font-bold shrink-0" style={{ color: '#ff8e2b' }}>mm</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.responseDelayLabel}</span>
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 min-h-[36px]" style={{ background: t.tabBarBg, border: \`1px solid \${t.inputBorder}\` }}>
              <button type="button" className="p-0.5 rounded-md transition-opacity" style={{ opacity: locked ? 1 : 0.45, color: t.textSecondary }}
                onClick={() => setData((p) => ({ ...p, responseDelayLocked: !p.responseDelayLocked }))}>
                <Lock className="w-3.5 h-3.5" />
              </button>
              <input className="w-14 bg-transparent text-right text-[12px] font-semibold outline-none tabular-nums"
                style={{ color: t.textValue, opacity: locked ? 0.55 : 1 }}
                value={data.responseDelayMs}
                readOnly={locked}
                onChange={(e) => setData((p) => ({ ...p, responseDelayMs: e.target.value }))} />
              <span className="text-[11px] font-medium shrink-0" style={{ color: t.textSecondary }}>ms</span>
              <span className="text-[11px] font-semibold shrink-0 pl-1" style={{ color: t.textSecondary }}>{L.measureLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 엔드이펙터 목록 + 상세 컴포넌트 ─────────────────────────────────────────
function EeListSection({ data, setData, t }: {
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
}) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);
  const accentColor = '#60a5fa';

  const MAX_SLOTS = 5;
  const selectedEe = selectedIdx !== null ? data.eeSlots[selectedIdx] : null;

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

  const isDark = t === DARK;
  const slotActiveBg = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(96,165,250,0.10)';
  const slotActiveBorder = 'rgba(96,165,250,0.45)';
  const slotEmptyBg = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)';
  const slotEmptyBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)';

  return (
    <>
      {/* 슬롯 목록 */}
      <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: \`1px solid \${t.panelBorder}\` }}>
        {/* 헤더 */}
        <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: t.sectionHeaderBg }}>
          <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
          <span className="flex-1 text-[12px]" style={{ color: t.textPrimary, fontWeight: 600 }}>{L.eeListTitle}</span>
          <span className="text-[10px]" style={{ color: t.textSecondary }}>
            {data.eeSlots.filter(Boolean).length} / {MAX_SLOTS}
          </span>
        </div>
        <div style={{ height: 1, background: t.divider }} />

        {/* 슬롯 아이템 */}
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
                  onClick={() => setSelectedIdx(isSelected ? null : i)}
                >
                  {/* 슬롯 번호 뱃지 */}
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
                          {ee.name}
                        </p>
                        <p className="text-[10px] leading-none mt-0.5" style={{ color: t.textSecondary }}>
                          {ee.type} · {ee.mass} kg
                        </p>
                      </div>
                      <ChevronRight
                        className="w-3.5 h-3.5 shrink-0 transition-transform duration-200"
                        style={{ color: isSelected ? accentColor : t.textSecondary, transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      />
                    </>
                  ) : (
                    <>
                      <p className="flex-1 text-[11px]" style={{ color: t.textSecondary, fontStyle: 'italic' }}>{L.eeSlotEmpty}</p>
                      <Plus className="w-3.5 h-3.5 shrink-0" style={{ color: t.textSecondary, opacity: 0.4 }} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 패널 - 선택된 슬롯이 있고 데이터가 있을 때만 표시 */}
      {selectedIdx !== null && selectedEe && (
        <div className="flex flex-col gap-2">
          {/* 상세 헤더 표시선 */}
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: \`\${accentColor}40\` }} />
            <span className="text-[14px] font-semibold px-1" style={{ color: accentColor }}>
              EE {selectedIdx + 1}{' \\u00B7 '}{selectedEe.name}
            </span>
            <div className="flex-1 h-px" style={{ background: \`\${accentColor}40\` }} />
          </div>

          {/* 기본 정보 */}
          <Section title={L.eeDetail} accentColor={accentColor} t={t}>
            <InputField label={L.eeType} value={selectedEe.type}
              onChange={(v) => updateEeField(selectedIdx, 'type', v)} t={t} />
            <InputField label={L.eeName} value={selectedEe.name}
              onChange={(v) => updateEeField(selectedIdx, 'name', v)} t={t} />
            <InputField label={L.eeMass} value={selectedEe.mass}
              onChange={(v) => updateEeField(selectedIdx, 'mass', v)} t={t} />
          </Section>

          {/* TCP 설정 */}
          <Section title={L.eeTcpSetting} accentColor={accentColor} t={t}>
            <SubLabel text={L.tcpPosition} t={t} />
            <TripleInput
              labels={['X', 'Y', 'Z']}
              values={[selectedEe.tcpPos.x, selectedEe.tcpPos.y, selectedEe.tcpPos.z]}
              onChange={(i, v) => {
                const k = ['x', 'y', 'z'] as const;
                updateEeTcp(selectedIdx, 'tcpPos', k[i], v);
              }} t={t} />
            <SubLabel text={L.tcpDirection} t={t} />
            <TripleInput
              labels={['Rx', 'Ry', 'Rz']}
              values={[selectedEe.tcpRot.rx, selectedEe.tcpRot.ry, selectedEe.tcpRot.rz]}
              onChange={(i, v) => {
                const k = ['rx', 'ry', 'rz'] as const;
                updateEeTcp(selectedIdx, 'tcpRot', k[i], v);
              }} t={t} />
          </Section>
        </div>
      )}

      {selectedIdx !== null && selectedEe === null && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <div className="flex-1 h-px" style={{ background: \`\${accentColor}40\` }} />
            <span className="text-[14px] font-semibold px-1" style={{ color: accentColor }}>
              EE {selectedIdx + 1}{' \\u00B7 '}{L.eeSlotEmpty}
            </span>
            <div className="flex-1 h-px" style={{ background: \`\${accentColor}40\` }} />
          </div>
          <PrimaryCtaButton onClick={() => {}}>
            {L.eeSelectModel}
          </PrimaryCtaButton>
        </div>
      )}
    </>
  );
}

// ── 탭별 섹션 렌더링 ────────────────────────────────────────────────────────
function TabSection({ tabId, data, setData, t }: {
  tabId: TabContentId;
  data: PanelData;
  setData: React.Dispatch<React.SetStateAction<PanelData>>;
  t: Tokens;
}) {
  function f(key: keyof PanelData) { return (v: string) => setData((p) => ({ ...p, [key]: v })); }
  function n<K extends 'position' | 'rotation' | 'size' | 'centerOfMass'>(
    key: K, field: keyof PanelData[K], v: string
  ) { setData((p) => ({ ...p, [key]: { ...p[key], [field]: v } })); }

  switch (tabId) {
    // ── 매니퓰레이터 ───────────────────────────────────
    case 'manip-spec':
      return (
        <Section title={L.manipSpec} accentColor="#a78bfa" t={t}>
          <InputField label={L.manipObjectName} value={data.manipObjectName} onChange={f('manipObjectName')} t={t} />
          <InputField label={L.manipModel}   value={data.manipModel}   onChange={f('manipModel')}   t={t} />
          <InputField label={L.manipMaker}   value={data.manipMaker}   onChange={f('manipMaker')}   t={t} />
          <InputField label={L.manipPayload} value={data.manipPayload} onChange={f('manipPayload')} t={t} />
          <InputField label={L.manipReach}   value={data.manipReach}   onChange={f('manipReach')}   t={t} />
        </Section>
      );
    case 'manip-position':
      return (
        <Section title={L.manipPosition} accentColor="#a78bfa" t={t}>
          <SubLabel text={L.positionMm} t={t} />
          <TripleInput labels={['X','Y','Z']} values={[data.position.x, data.position.y, data.position.z]}
            onChange={(i,v)=>{const k=['x','y','z'] as const; n('position',k[i],v);}} t={t} />
          <SubLabel text={L.directionDeg} t={t} />
          <TripleInput labels={['Rx','Ry','Rz']} values={[data.rotation.rx, data.rotation.ry, data.rotation.rz]}
            onChange={(i,v)=>{const k=['rx','ry','rz'] as const; n('rotation',k[i],v);}} t={t} />
          <SubLabel text={L.sizeMm} t={t} />
          <TripleInput labels={['W','D','H']} values={[data.size.w, data.size.d, data.size.h]}
            onChange={(i,v)=>{const k=['w','d','h'] as const; n('size',k[i],v);}} t={t} />
        </Section>
      );
    case 'manip-mass':
      return (
        <Section title={L.manipMass} accentColor="#a78bfa" t={t}>
          <InputField label={L.mass} value={data.mass} onChange={f('mass')} t={t} />
          <div style={{ height: 1, background: t.divider }} />
          <Toggle label={L.autoCoM} tooltip={L.autoCoMTooltip} value={data.autoCoM}
            onChange={(v) => setData((p) => ({ ...p, autoCoM: v }))} t={t} />
          <SubLabel text={L.weightCoMMm} t={t} />
          <TripleInput labels={['Cx','Cy','Cz']} values={[data.centerOfMass.cx, data.centerOfMass.cy, data.centerOfMass.cz]}
            onChange={(i,v)=>{const k=['cx','cy','cz'] as const; n('centerOfMass',k[i],v);}} t={t} />
        </Section>
      );
    case 'manip-safety-grade':
      return (
        <>
          <Section title={L.safetySection} accentColor="#a78bfa" t={t}>
            <DropdownField label={L.safetyPl} value={data.safetyPl} t={t}
              options={[
                { value: 'a', label: 'PL a (ISO 13849-1)' },
                { value: 'b', label: 'PL b' },
                { value: 'c', label: 'PL c' },
                { value: 'd', label: 'PL d' },
                { value: 'e', label: 'PL e' },
              ]}
              onChange={(v) => setData((p) => ({ ...p, safetyPl: v }))} />
            <DropdownField label={L.safetyCategory} value={data.safetyCategory} t={t}
              options={[
                { value: 'safety_category', label: 'safety_category' },
                { value: 'Cat B', label: 'Cat B' },
                { value: 'Cat 1', label: 'Cat 1' },
                { value: 'Cat 2', label: 'Cat 2' },
                { value: 'Cat 3', label: 'Cat 3' },
                { value: 'Cat 4', label: 'Cat 4' },
              ]}
              onChange={(v) => setData((p) => ({ ...p, safetyCategory: v }))} />
            <DropdownField label={L.safetySil} value={data.safetySil} t={t}
              options={[
                { value: 'SIL1', label: 'SIL 1 (IEC 62061)' },
                { value: 'SIL2', label: 'SIL 2' },
                { value: 'SIL3', label: 'SIL 3' },
                { value: 'SIL4', label: 'SIL 4' },
                { value: '-', label: '\u2014' },
              ]}
              onChange={(v) => setData((p) => ({ ...p, safetySil: v }))} />
            <CertStatusDropdown label={L.safetyCertStatus} value={data.certStatus} t={t}
              onChange={(v) => setData((p) => ({ ...p, certStatus: v }))} />
          </Section>
          <Section title={L.safetyCertSpecs} accentColor="#a78bfa" t={t}>
            <InputField label={L.safetyStopTime} value={data.safetyStopTime} onChange={f('safetyStopTime')} t={t} />
            <InputField label={L.safetyTcpLimit} value={data.safetyTcpLimit} onChange={f('safetyTcpLimit')} t={t} />
          </Section>
          <Section title={L.safetyLogicTitle} accentColor="#a78bfa" t={t}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.safetyApplied}</span>
              <button type="button"
                className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-opacity"
                style={{
                  background: data.safetyLogicApplied ? 'rgba(34,197,94,0.22)' : 'rgba(120,120,120,0.18)',
                  color: data.safetyLogicApplied ? '#22c55e' : t.textSecondary,
                }}
                onClick={() => setData((p) => ({ ...p, safetyLogicApplied: !p.safetyLogicApplied }))}
              >
                {data.safetyLogicApplied ? L.badgeApplied : L.badgeNotApplied}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] shrink-0" style={{ color: t.textSecondary, fontWeight: 500 }}>{L.safetyMonitor}</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.2)', color: '#3b82f6' }}>{data.safetyMonitoringStatus}</span>
            </div>
            <DropdownField label={L.safetyMonitorPick} value={data.safetyMonitoringStatus} t={t}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Standby', label: 'Standby' },
                { value: 'Idle', label: 'Idle' },
                { value: 'Fault', label: 'Fault' },
              ]}
              onChange={(v) => setData((p) => ({ ...p, safetyMonitoringStatus: v }))} />
            <InputField label={L.safetyLastVerify} value={data.safetyLastVerified} onChange={f('safetyLastVerified')} t={t} />
          </Section>
          <StopPerformanceSection data={data} setData={setData} t={t} />
        </>
      );
    case 'manip-conn-list':
      return (
        <Section title={L.connLinkedList} accentColor="#a78bfa" t={t}>
          {data.manipLinkedItems.length === 0 ? (
            <p className="text-[12px] px-1 py-2 leading-relaxed" style={{ color: t.textSecondary }}>{L.connListEmpty}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.manipLinkedItems.map((row, i) => (
                <div key={i} className="rounded-[10px] px-3 py-2.5" style={{ border: \`1px solid \${t.inputBorder}\`, background: t.inputBg }}>
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
      );

    // ── 엔드이펙터 그룹 (리스트 + 상세) ──────────────────
    case 'ee-list':
      return <EeListSection data={data} setData={setData} t={t} />;

    // ── 모션 설정 ──────────────────────────────────────
    case 'motion-path':
      return (
        <Section title={L.motionPath} accentColor="#34d399" t={t}>
          <InputField label={L.pathType}    value={data.pathType}    onChange={f('pathType')}    t={t} />
          <InputField label={L.blendRadius} value={data.blendRadius} onChange={f('blendRadius')} t={t} />
        </Section>
      );
    case 'motion-speed':
      return (
        <Section title={L.motionSpeed} accentColor="#34d399" t={t}>
          <InputField label={L.maxSpeed}     value={data.maxSpeed}     onChange={f('maxSpeed')}     t={t} />
          <InputField label={L.acceleration} value={data.acceleration} onChange={f('acceleration')} t={t} />
          <InputField label={L.jerk}         value={data.jerk}         onChange={f('jerk')}         t={t} />
        </Section>
      );
    case 'motion-upload':
      return (
        <Section title={L.motionUploadFile} accentColor="#34d399" t={t}>
          <p className="text-[11px] leading-relaxed px-0.5" style={{ color: t.textSecondary }}>
            {L.motionUploadHint}
          </p>
        </Section>
      );

    // ── 충돌 예상 부위 ─────────────────────────────────
    case 'collision-zone':
      return (
        <Section title={L.collisionZone} accentColor="#f87171" t={t}>
          <InputField label={L.zoneShape}  value={data.zoneShape}  onChange={f('zoneShape')}  t={t} />
          <InputField label={L.zoneRadius} value={data.zoneRadius} onChange={f('zoneRadius')} t={t} />
          <InputField label={L.zoneHeight} value={data.zoneHeight} onChange={f('zoneHeight')} t={t} />
        </Section>
      );
    case 'collision-detect':
      return (
        <Section title={L.collisionDet} accentColor="#f87171" t={t}>
          <InputField label={L.sensitivity}  value={data.sensitivity}  onChange={f('sensitivity')}  t={t} />
          <InputField label={L.responseType} value={data.responseType} onChange={f('responseType')} t={t} />
        </Section>
      );

    // ── 협동 작업 영역 ─────────────────────────────────
    case 'collab-area':
      return (
        <Section title={L.collabArea} accentColor="#fbbf24" t={t}>
          <InputField label={L.areaWidth}  value={data.areaWidth}  onChange={f('areaWidth')}  t={t} />
          <InputField label={L.areaDepth}  value={data.areaDepth}  onChange={f('areaDepth')}  t={t} />
          <InputField label={L.areaHeight} value={data.areaHeight} onChange={f('areaHeight')} t={t} />
        </Section>
      );
    case 'collab-safety':
      return (
        <Section title={L.collabSafety} accentColor="#fbbf24" t={t}>
          <Toggle label={L.pflActive} value={data.pflEnabled} onChange={(v) => setData((p) => ({ ...p, pflEnabled: v }))} t={t} />
          <Toggle label={L.ssmActive} value={data.ssmEnabled} onChange={(v) => setData((p) => ({ ...p, ssmEnabled: v }))} t={t} />
          <div style={{ height: 1, background: t.divider }} />
          <InputField label={L.minSepDist} value={data.minSepDist} onChange={f('minSepDist')} t={t} />
          <InputField label={L.safeSpeed}  value={data.safeSpeed}  onChange={f('safeSpeed')}  t={t} />
        </Section>
      );

    default:
      return null;
  }
}

// ── 기본값 ──────────────────────────────────────────────────────────────────
const DEFAULT_DATA: PanelData = {
  manipObjectName: 'IRB_6700_Line01',
  manipModel: 'IRB 6700', manipMaker: 'ABB', manipPayload: '150', manipReach: '3,200',
  position: { x: '1,250', y: '800', z: '0' },
  rotation: { rx: '0', ry: '0', rz: '45' },
  size: { w: '600', d: '600', h: '2,100' },
  mass: '1,280', autoCoM: true,
  centerOfMass: { cx: '0', cy: '0', cz: '450' },
  safetyPl: 'd', safetyCategory: 'Cat 3', safetySil: 'SIL2',
  certStatus: 'CE',
  safetyStopTime: '0.5', safetyTcpLimit: '250',
  safetyLogicApplied: true,
  safetyMonitoringStatus: 'Active',
  safetyLastVerified: '2026-04-03 14:30',
  stopTsMs: '320', stopSsMm: '42.8',
  responseDelayMs: '45', responseDelayLocked: true,
  manipLinkedItems: [
    { name: 'EE_Group_01', model: 'Schunk EGP 64', kind: 'End effector' },
    { name: 'Motion_Profile_A', model: 'Linear / Blend-50', kind: 'Motion' },
    { name: 'Hazard_Zone_03', model: 'Cylinder 1.5m', kind: 'Collision' },
    { name: 'CollabSpace_Main', model: 'Vol 2.0x1.5x2.2m', kind: 'Collaboration' },
    { name: 'F-CPU Safety', model: 'S7-1510F', kind: 'Safety controller' },
  ],
  eeSlots: [
    { name: 'Schunk EGP 64', type: 'Gripper', mass: '2.5', tcpPos: { x: '0', y: '0', z: '200' }, tcpRot: { rx: '0', ry: '0', rz: '0' } },
    { name: 'Cognex 3D', type: 'Vision', mass: '0.8', tcpPos: { x: '0', y: '0', z: '150' }, tcpRot: { rx: '0', ry: '0', rz: '0' } },
    null, null, null,
  ],
  pathType: 'Linear', blendRadius: '50',
  maxSpeed: '1,000', acceleration: '500', jerk: '200',
  zoneShape: 'Cylinder', zoneRadius: '1,500', zoneHeight: '2,500',
  sensitivity: 'Medium', responseType: 'Stop',
  areaWidth: '2,000', areaDepth: '1,500', areaHeight: '2,200',
  pflEnabled: true, ssmEnabled: true, minSepDist: '500', safeSpeed: '300',
};

// ── PropertyPanel ────────────────────────────────────────────────────────────
interface PropertyPanelProps {
  theme?: 'dark' | 'light';
  initialX?: number;
  initialY?: number;
  selectedObjectId?: string;
  onClose?: () => void;
  onPosChange?: (x: number, y: number) => void;
}

export default function PropertyPanel({ theme = 'dark', initialX = 24, initialY = 24, selectedObjectId, onClose, onPosChange }: PropertyPanelProps) {
  const t = theme === 'light' ? LIGHT : DARK;
  const [data, setData] = useState<PanelData>(DEFAULT_DATA);
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedObject = OBJECTS.find((o) => o.id === selectedObjectId) ?? OBJECTS[0];
  const [activeCategoryId, setActiveCategoryId] = useState(selectedObject.categories[0].id);

  useEffect(() => {
    const obj = OBJECTS.find((o) => o.id === selectedObjectId) ?? OBJECTS[0];
    setActiveCategoryId(obj.categories[0].id);
  }, [selectedObjectId]);

  const activeCategory = selectedObject.categories.find((c) => c.id === activeCategoryId) ?? selectedObject.categories[0];

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true; setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const panel = panelRef.current;
    const maxX = window.innerWidth - (panel?.offsetWidth ?? 320);
    const maxY = window.innerHeight - (panel?.offsetHeight ?? 200);
    const newX = Math.min(Math.max(0, e.clientX - dragOffset.current.x), maxX);
    const newY = Math.min(Math.max(0, e.clientY - dragOffset.current.y), maxY);
    setPos({ x: newX, y: newY });
    onPosChange?.(newX, newY);
  }, [onPosChange]);

  const onPointerUp = useCallback(() => { dragging.current = false; setIsDragging(false); }, []);

  useEffect(() => {
    function onResize() {
      const panel = panelRef.current;
      setPos((prev) => {
        const newX = Math.min(prev.x, window.innerWidth - (panel?.offsetWidth ?? 320));
        const newY = Math.min(prev.y, window.innerHeight - (panel?.offsetHeight ?? 200));
        onPosChange?.(newX, newY);
        return { x: newX, y: newY };
      });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onPosChange]);

  return (
    <div ref={panelRef}
      className="absolute flex flex-col w-[320px] rounded-[16px] overflow-hidden"
      style={{ left: pos.x, top: pos.y, zIndex: 50, background: t.panelBg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: \`1px solid \${t.panelBorder}\`, boxShadow: t.panelShadow }}>

      {/* 헤더 */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="shrink-0" style={{ color: t.dragHandleColor }}><GripHorizontal className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] leading-tight truncate" style={{ color: t.textPrimary, fontWeight: 700, letterSpacing: '-0.02em' }}>{selectedObject.label}</p>
          <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: t.textSecondary }}>{activeCategory.panelSubtitle}</p>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] transition-all duration-150 shrink-0"
          style={{ background: t.closeButtonBg, color: t.textSecondary }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.closeButtonHoverBg; (e.currentTarget as HTMLButtonElement).style.color = t.closeButtonHoverColor; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.closeButtonBg; (e.currentTarget as HTMLButtonElement).style.color = t.textSecondary; }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div style={{ height: 1, background: t.divider }} />

      {/* 카테고리 탭 바 */}
      <div className="flex shrink-0 px-3 pt-2 pb-0 gap-1 overflow-x-auto" style={{ background: t.tabBarBg, scrollbarWidth: 'none' }}>
        {selectedObject.categories.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)}
              className="shrink-0 px-3 py-2 text-[11px] rounded-t-[8px] transition-all duration-150 relative"
              style={{ color: isActive ? cat.color : t.textSecondary, background: isActive ? t.tabActiveBg : 'transparent', fontWeight: isActive ? 700 : 500 }}>
              {cat.label}
              {isActive && <div className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full" style={{ background: cat.color }} />}
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: t.divider }} />

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto sfd-scroll" style={{ maxHeight: 'calc(100vh - 200px)', scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-2 p-3">
          {activeCategory.tabs.map((tab) => (
            <TabSection key={tab.id} tabId={tab.id} data={data} setData={setData} t={t} />
          ))}
        </div>
      </div>

      {/* 푸터 CTA — 매니퓰레이터·엔드이펙터 그룹은 제외 */}
      {selectedObject.id !== 'manipulator' && selectedObject.id !== 'endeffector' && (
        <div className="px-3 py-3 shrink-0" style={{ borderTop: \`1px solid \${t.footerBorder}\` }}>
          <PrimaryCtaButton>{L.apply}</PrimaryCtaButton>
        </div>
      )}
    </div>
  );
}
`;

const CLASSIC = `import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ChevronDown, Info, GripHorizontal } from 'lucide-react';
import { L } from './labels';

const T = {
  panelBg: 'rgba(252, 252, 253, 0.92)', panelBorder: 'rgba(0,0,0,0.08)',
  panelShadow: '0 24px 48px rgba(0,0,0,0.14), 0 0 0 0.5px rgba(0,0,0,0.06) inset',
  sectionHeaderBg: 'rgba(0,0,0,0.025)', sectionHeaderHover: 'rgba(0,0,0,0.05)',
  inputBg: 'rgba(0,0,0,0.035)', inputBorder: 'rgba(0,0,0,0.10)',
  inputFocusBorder: '#ff8e2b', inputFocusShadow: '0 0 0 2px rgba(255,142,43,0.18)',
  textPrimary: '#111111', textSecondary: '#999', textValue: '#333',
  divider: 'rgba(0,0,0,0.07)', closeButtonBg: 'rgba(0,0,0,0.05)',
  closeButtonHoverBg: 'rgba(0,0,0,0.10)', dragHandleColor: 'rgba(0,0,0,0.18)',
  footerBorder: 'rgba(0,0,0,0.07)',
};

function InputField({ label, value, onChange }: { label: string; value: string; onChange?: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-2 px-3 rounded-[8px] min-h-[34px] transition-all duration-150"
      style={{ background: T.inputBg, border: \`1px solid \${focused ? T.inputFocusBorder : T.inputBorder}\`, boxShadow: focused ? T.inputFocusShadow : 'none' }}>
      <span className="text-[13px] shrink-0 leading-none" style={{ color: T.textSecondary, fontWeight: 500 }}>{label}</span>
      <input className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
        style={{ color: T.textValue, fontWeight: 500 }}
        value={value} onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
    </div>
  );
}

function TripleInput({ labels, values, onChange }: { labels: [string, string, string]; values: [string, string, string]; onChange?: (i: number, v: string) => void }) {
  const [fi, setFi] = useState<number | null>(null);
  return (
    <div className="flex gap-1.5 w-full overflow-hidden">
      {labels.map((label, i) => (
        <div key={label} className="relative flex-1 min-w-0 flex items-center gap-1 px-2 rounded-[8px] min-h-[34px] transition-all duration-150"
          style={{ background: T.inputBg, border: \`1px solid \${fi === i ? T.inputFocusBorder : T.inputBorder}\`, boxShadow: fi === i ? T.inputFocusShadow : 'none' }}>
          <span className="text-[12px] shrink-0 leading-none" style={{ color: '#ff8e2b', fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
          <input className="flex-1 min-w-0 text-[12px] text-right bg-transparent outline-none leading-none"
            style={{ color: T.textValue, fontWeight: 500 }}
            value={values[i]} onChange={(e) => onChange?.(i, e.target.value)}
            onFocus={() => setFi(i)} onBlur={() => setFi(null)} />
        </div>
      ))}
    </div>
  );
}

function SubLabel({ text }: { text: string }) {
  return <p className="text-[12px] px-1 pt-1" style={{ color: T.textSecondary, fontWeight: 500, letterSpacing: '0.04em' }}>{text.toUpperCase()}</p>;
}

function Toggle({ label, tooltip, value, onChange }: { label: string; tooltip?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 px-1 min-h-[34px]">
      <div className="flex-1 flex items-center gap-1.5">
        <span className="text-[14px] leading-none" style={{ color: T.textSecondary, fontWeight: 500 }}>{label}</span>
        {tooltip && <div title={tooltip}><Info className="w-3 h-3" style={{ color: T.textSecondary }} /></div>}
      </div>
      <button onClick={() => onChange(!value)} className="relative shrink-0 transition-all duration-200"
        style={{ width: 36, height: 20, borderRadius: 999, background: value ? 'linear-gradient(135deg,#ff8e2b,#ff6b00)' : 'rgba(0,0,0,0.12)', boxShadow: value ? '0 0 8px rgba(255,142,43,0.4)' : 'none', border: \`1px solid \${value ? 'transparent' : T.inputBorder}\` }}>
        <div className="absolute top-[2px] transition-all duration-200"
          style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', left: value ? 'calc(100% - 16px)' : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
      </button>
    </div>
  );
}

function Section({ title, accentColor = '#ff8e2b', defaultOpen = true, children }: { title: string; accentColor?: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hovered, setHovered] = useState(false);
  return (
    <div className="rounded-[12px] overflow-hidden shrink-0" style={{ border: \`1px solid \${T.panelBorder}\` }}>
      <button className="w-full flex items-center gap-2 px-3 py-2.5 transition-colors duration-150"
        style={{ background: hovered ? T.sectionHeaderHover : (open ? T.sectionHeaderBg : 'transparent') }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={() => setOpen(!open)}>
        <div className="w-[8px] h-[8px] rounded-[2px] shrink-0" style={{ background: accentColor }} />
        <span className="flex-1 text-left text-[12px] leading-none" style={{ color: T.textPrimary, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 shrink-0"
          style={{ color: T.textSecondary, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }} />
      </button>
      {open && <div style={{ height: 1, background: T.divider }} />}
      {open && <div className="flex flex-col gap-2 p-3">{children}</div>}
    </div>
  );
}

interface Props { initialX?: number; initialY?: number; onClose?: () => void; }

export default function PropertyPanelClassic({ initialX = 24, initialY = 24, onClose }: Props) {
  const [manipObjectName, setManipObjectName] = useState('IRB_6700_Line01');
  const [manipModel, setManipModel] = useState('IRB 6700');
  const [manipMaker, setManipMaker] = useState('ABB');
  const [manipPayload, setManipPayload] = useState('150');
  const [manipReach, setManipReach] = useState('3,200');
  const [posXyz, setPosXyz] = useState<[string, string, string]>(['1,250', '800', '0']);
  const [rotXyz, setRotXyz] = useState<[string, string, string]>(['0', '0', '45']);
  const [sizeXyz, setSizeXyz] = useState<[string, string, string]>(['600', '600', '2,100']);
  const [mass, setMass] = useState('1,280');
  const [autoCoM, setAutoCoM] = useState(true);
  const [comXyz, setComXyz] = useState<[string, string, string]>(['0', '0', '450']);

  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true; setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const el = panelRef.current;
    const maxX = window.innerWidth - (el?.offsetWidth ?? 320);
    const maxY = window.innerHeight - (el?.offsetHeight ?? 200);
    setPos({ x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), maxX), y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), maxY) });
  }, []);

  const onPointerUp = useCallback(() => { dragging.current = false; setIsDragging(false); }, []);

  useEffect(() => {
    function onResize() {
      const el = panelRef.current;
      setPos((p) => ({ x: Math.min(p.x, window.innerWidth - (el?.offsetWidth ?? 320)), y: Math.min(p.y, window.innerHeight - (el?.offsetHeight ?? 200)) }));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div ref={panelRef}
      className="absolute flex flex-col w-[320px] rounded-[16px] overflow-hidden"
      style={{ left: pos.x, top: pos.y, zIndex: 50, background: T.panelBg, backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: \`1px solid \${T.panelBorder}\`, boxShadow: T.panelShadow }}>

      <div className="flex items-center gap-3 px-4 pt-4 pb-3 shrink-0 select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="shrink-0" style={{ color: T.dragHandleColor }}><GripHorizontal className="w-4 h-4" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] leading-tight truncate" style={{ color: T.textPrimary, fontWeight: 700, letterSpacing: '-0.02em' }}>Property-Name</p>
          <p className="text-[10px] leading-none mt-0.5 truncate" style={{ color: T.textSecondary }}>IRB 6700 · ABB</p>
        </div>
        <div className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] shrink-0"
          style={{ background: 'rgba(255,142,43,0.12)', color: '#ff8e2b', letterSpacing: '0.06em' }}>
          CLASSIC
        </div>
        <button onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] transition-all duration-150 shrink-0"
          style={{ background: T.closeButtonBg, color: T.textSecondary }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.closeButtonHoverBg; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.closeButtonBg; }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div style={{ height: 1, background: T.divider, marginBottom: 2 }} />

      <div className="flex-1 overflow-y-auto sfd-scroll" style={{ maxHeight: 'calc(100vh - 160px)', scrollbarWidth: 'none' }}>
        <div className="flex flex-col gap-2 p-3">

          <Section title={L.manipSpec} accentColor="#a78bfa">
            <InputField label={L.manipObjectName} value={manipObjectName} onChange={setManipObjectName} />
            <InputField label={L.manipModel}   value={manipModel}   onChange={setManipModel} />
            <InputField label={L.manipMaker}   value={manipMaker}   onChange={setManipMaker} />
            <InputField label={L.manipPayload} value={manipPayload} onChange={setManipPayload} />
            <InputField label={L.manipReach}   value={manipReach}   onChange={setManipReach} />
          </Section>

          <Section title={L.manipPosition} accentColor="#a78bfa">
            <SubLabel text={L.positionMm} />
            <TripleInput labels={['X','Y','Z']} values={posXyz} onChange={(i,v)=>setPosXyz((p)=>{const n=[...p] as [string,string,string]; n[i]=v; return n;})} />
            <SubLabel text={L.directionDeg} />
            <TripleInput labels={['Rx','Ry','Rz']} values={rotXyz} onChange={(i,v)=>setRotXyz((p)=>{const n=[...p] as [string,string,string]; n[i]=v; return n;})} />
            <SubLabel text={L.sizeMm} />
            <TripleInput labels={['W','D','H']} values={sizeXyz} onChange={(i,v)=>setSizeXyz((p)=>{const n=[...p] as [string,string,string]; n[i]=v; return n;})} />
          </Section>

          <Section title={L.manipMass} accentColor="#a78bfa">
            <InputField label={L.mass} value={mass} onChange={setMass} />
            <div style={{ height: 1, background: T.divider }} />
            <Toggle label={L.autoCoM} tooltip={L.autoCoMTooltip} value={autoCoM} onChange={setAutoCoM} />
            <SubLabel text={L.weightCoMMm} />
            <TripleInput labels={['Cx','Cy','Cz']} values={comXyz} onChange={(i,v)=>setComXyz((p)=>{const n=[...p] as [string,string,string]; n[i]=v; return n;})} />
          </Section>

        </div>
      </div>

      <div className="px-3 py-3 shrink-0" style={{ borderTop: \`1px solid \${T.footerBorder}\` }}>
        <button
          className="w-full flex items-center justify-center text-[13px] font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.98]"
          style={{ height: 38, color: 'white', background: 'linear-gradient(135deg,#ff9a3c 0%,#ff6b00 100%)', boxShadow: '0 4px 16px rgba(255,107,0,0.35)', letterSpacing: '-0.01em' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(255,107,0,0.50)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(255,107,0,0.35)'; }}>
          {L.apply}
        </button>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/PropertyPanel.tsx', PANEL, 'utf8');
fs.writeFileSync('src/PropertyPanelClassic.tsx', CLASSIC, 'utf8');
console.log('Done! Panel:', PANEL.length, 'Classic:', CLASSIC.length);
