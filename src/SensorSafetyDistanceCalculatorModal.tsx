import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

type Props = {
  open: boolean;
  locale: 'ko' | 'en';
  isDark: boolean;
  /** 진단 대상 셀 표시명 */
  cellLabel: string;
  onClose: () => void;
};

type FieldId = 'sensorMm' | 'approachMmS' | 'stopSec' | 'penetrateMm';

const MODAL_TOKENS_LIGHT = {
  scrim: 'rgba(0,0,0,0.5)',
  scrimBlur: 'blur(2px)',
  dialogBg: '#ffffff',
  dialogBorder: 'rgba(15,23,42,0.12)',
  dialogShadow: '0 24px 48px rgba(15,23,42,0.18)',
  headerBorder: 'rgba(15,23,42,0.08)',
  text: '#18181b',
  muted: '#52525b',
  inputBg: '#ffffff',
  inputBorder: 'rgba(15,23,42,0.14)',
  sectionBg: 'rgba(250,250,250,0.96)',
  focusRing: '#18181b',
} as const;

const MODAL_TOKENS_DARK = {
  scrim: 'rgba(0,0,0,0.62)',
  scrimBlur: 'blur(6px)',
  dialogBg: 'rgba(18,20,26,0.98)',
  dialogBorder: 'rgba(255,255,255,0.14)',
  dialogShadow: '0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
  headerBorder: 'rgba(255,255,255,0.1)',
  text: '#f4f4f5',
  muted: 'rgba(228,228,231,0.72)',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.16)',
  sectionBg: 'rgba(255,255,255,0.04)',
  focusRing: '#e5e7eb',
} as const;

/**
 * 센서 안전거리 계산기 — 분석 메뉴(좌측 패널)에서 센서 관련 도구로 연결
 */
export function SensorSafetyDistanceCalculatorModal({ open, locale, isDark, cellLabel, onClose }: Props) {
  const tok = isDark ? MODAL_TOKENS_DARK : MODAL_TOKENS_LIGHT;

  const [sensorMm, setSensorMm] = useState(40);
  const [approachMmS, setApproachMmS] = useState(40);
  const [stopSec, setStopSec] = useState(40);
  const [penetrateMm, setPenetrateMm] = useState(40);
  const [focusedField, setFocusedField] = useState<FieldId | null>('approachMmS');
  const [resultMm, setResultMm] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const L = useMemo(() => {
    if (locale === 'en') {
      return {
        title: 'Sensor safety distance calculator',
        targetCell: 'Diagnostic target robot cell',
        safetyCalc: 'Safety distance calculation',
        sensorName: 'Laser scanner 1',
        conditions: 'Calculation conditions',
        sensorCapability: 'Sensor capability (mm)',
        approachSpeed: 'Worker approach speed (mm/s)',
        robotStop: 'Time until robot stops (sec)',
        penetration: 'Penetration distance to hazard point (mm)',
        connectedRobots: 'Connected robots',
        calculate: 'Calculate',
        result: 'Calculation result',
        close: 'Close',
      };
    }
    return {
      title: '센서 안전거리 계산기',
      targetCell: '진단 대상 로봇 셀',
      safetyCalc: '안전거리 계산',
      sensorName: '레이저 스캐너 1',
      conditions: '계산조건',
      sensorCapability: '센서감지능력(mm)',
      approachSpeed: '작업자의 접근속도(mm/s)',
      robotStop: '로봇 정지까지의 소요시간(sec)',
      penetration: '위험점까지의 침투거리(mm)',
      connectedRobots: '연결된로봇',
      calculate: '계산하기',
      result: '계산결과',
      close: '닫기',
    };
  }, [locale]);

  const robots = locale === 'en' ? ['Robot 1', 'Robot 1'] : ['로봇 1', '로봇 1'];

  const formulaText = useMemo(() => {
    const a = Number.isFinite(approachMmS) ? approachMmS : 0;
    const t = Number.isFinite(stopSec) ? stopSec : 0;
    const s = Number.isFinite(sensorMm) ? sensorMm : 0;
    return `S = (${a}mm/s * ${t}s) + 8 * (${s}mm - 14mm)`;
  }, [approachMmS, stopSec, sensorMm]);

  const handleCalculate = useCallback(() => {
    const a = Number(approachMmS) || 0;
    const t = Number(stopSec) || 0;
    const s = Number(sensorMm) || 0;
    const mm = a * t + 8 * (s - 14);
    setResultMm(mm);
  }, [approachMmS, stopSec, sensorMm]);

  const numInput = (id: FieldId, value: number, set: (n: number) => void) => {
    const focused = focusedField === id;
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium" style={{ color: tok.muted }}>
          {id === 'sensorMm' && L.sensorCapability}
          {id === 'approachMmS' && L.approachSpeed}
          {id === 'stopSec' && L.robotStop}
          {id === 'penetrateMm' && L.penetration}
        </span>
        <div className="relative">
          <input
            type="number"
            value={Number.isFinite(value) ? value : ''}
            onChange={(e) => set(parseFloat(e.target.value) || 0)}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField((f) => (f === id ? null : f))}
            className="w-full rounded-lg border px-3 py-2 pr-9 text-[12px] font-semibold tabular-nums outline-none transition-[box-shadow,border-color]"
            style={{
              borderColor: focused ? tok.focusRing : tok.inputBorder,
              borderWidth: focused ? 2 : 1,
              background: tok.inputBg,
              color: tok.text,
              boxShadow: focused ? `0 0 0 1px ${focused ? tok.focusRing : 'transparent'}` : undefined,
            }}
          />
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-45"
            style={{ color: tok.muted }}
            aria-hidden
          />
        </div>
      </div>
    );
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        style={{
          background: tok.scrim,
          backdropFilter: tok.scrimBlur,
          WebkitBackdropFilter: tok.scrimBlur,
        }}
        aria-label={L.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sensor-safety-calc-title"
        className="relative w-full max-w-[720px] max-h-[min(92vh,800px)] rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
        style={{
          borderColor: tok.dialogBorder,
          background: tok.dialogBg,
          boxShadow: tok.dialogShadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b" style={{ borderColor: tok.headerBorder }}>
          <h2 id="sensor-safety-calc-title" className="text-[16px] font-bold leading-tight pr-2" style={{ color: tok.text }}>
            {L.title}
          </h2>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: tok.muted }}
            aria-label={L.close}
            onClick={onClose}
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tok.muted }}>
              {L.targetCell}
            </label>
            <div
              className="w-full rounded-lg border px-3 py-2 text-[13px]"
              style={{ borderColor: tok.inputBorder, background: tok.inputBg, color: tok.text }}
            >
              {cellLabel || (locale === 'en' ? 'Cell name' : '셀 이름')}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <span className="text-[11px] font-semibold shrink-0" style={{ color: tok.muted }}>
              {L.safetyCalc}
            </span>
            <span className="text-[13px] font-semibold" style={{ color: tok.text }}>
              {L.sensorName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div
              className="rounded-xl border p-4 flex flex-col gap-3"
              style={{ borderColor: tok.inputBorder, background: tok.sectionBg }}
            >
              <p className="text-[12px] font-bold" style={{ color: tok.text }}>
                {L.conditions}
              </p>
              {numInput('sensorMm', sensorMm, setSensorMm)}
              {numInput('approachMmS', approachMmS, setApproachMmS)}
              {numInput('stopSec', stopSec, setStopSec)}
              {numInput('penetrateMm', penetrateMm, setPenetrateMm)}
            </div>

            <div
              className="rounded-xl border p-4 flex flex-col gap-3 min-h-[200px]"
              style={{ borderColor: tok.inputBorder, background: tok.sectionBg }}
            >
              <p className="text-[12px] font-bold" style={{ color: tok.text }}>
                {L.connectedRobots}
              </p>
              <ul className="text-[12px] leading-relaxed pl-4 list-disc flex-1" style={{ color: tok.text }}>
                {robots.map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </ul>
              <button
                type="button"
                className="w-full min-h-10 rounded-[10px] text-[12px] font-bold border-2 transition-opacity hover:opacity-95 mt-1"
                style={{
                  borderColor: 'rgba(255,220,140,0.95)',
                  color: '#1a0a00',
                  background: 'linear-gradient(180deg, #fff4e0 0%, #ffcc66 22%, #ff8e2b 52%, #ea6c12 100%)',
                  boxShadow: `0 6px 16px ${accentRgba(POINT_ORANGE, 0.35)}`,
                }}
                onClick={handleCalculate}
              >
                {L.calculate}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-bold mb-2" style={{ color: tok.text }}>
              {L.result}
            </p>
            <div
              className="w-full rounded-lg border px-3 py-3 text-[12px] font-mono leading-relaxed break-all"
              style={{ borderColor: tok.inputBorder, background: tok.inputBg, color: tok.text }}
            >
              {formulaText}
              {resultMm != null && (
                <span className="block mt-2 font-sans font-semibold" style={{ color: POINT_ORANGE }}>
                  = {resultMm.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', { maximumFractionDigits: 2 })} mm
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
