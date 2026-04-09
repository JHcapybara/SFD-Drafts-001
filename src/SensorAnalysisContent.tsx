import { useState, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER, ANALYSIS_SAFE, ANALYSIS_WARN } from './analysisPanelSemantics';

type PanelTokens = {
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  inputBg: string;
  tabBarBg: string;
  sectionHeaderBg: string;
};

type Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  onOpenSensorCalculator: () => void;
  onSensorCalcDetailViewClick?: () => void;
};

function copy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      laserScanner: (n: number) => `Laser scanner ${n}`,
      insufficientDistance: 'Insufficient safety distance',
      analysisResult: 'Analysis result',
      completedAtLabel: 'Analysis completion time',
      suggestionTitle: 'Suggested ways to change conditions',
      suggestions: [
        'Operate the robot in PFL mode',
        'Modify the detection zone',
        'Change sensor performance (model)',
        'Adjust sensor installation position',
      ],
      calcResultTitle: 'Safety distance calculation results',
      insufficientStopTitle: 'Insufficient sensor stopping distance',
      adequateStopTitle: 'Adequate sensor stopping distance',
      adequateMm: 'Appropriate safety distance (mm)',
      versusCurrent: (deltaMm: string) => `(+${deltaMm} mm vs. current)`,
      currentInstall: 'Current installation distance',
      view: 'View',
      pflStopProposal: 'Stopping distance proposal when PFL is applied',
      formulaLabel: 'Formula',
      paramDetection: 'Sensor detection capability (mm)',
      paramStopTime: 'Time for robot to stop (s)',
      paramPenetration: 'Penetration distance to hazard (mm)',
      paramApproach: 'Worker approach speed (mm/s)',
      learnMoreCalc: 'Learn more about safety distance calculation',
      toggle: 'Toggle',
      sensor2Summary: 'Analysis result: adequate safety distance.',
    };
  }
  return {
    laserScanner: (n: number) => `레이저 스캐너 ${n}`,
    insufficientDistance: '안전거리 불충분',
    analysisResult: '분석 결과',
    completedAtLabel: '분석 완료 시간',
    suggestionTitle: '조건 변경 방법 제안',
    suggestions: [
      '로봇을 PFL모드로 운영하기',
      '감지영역 수정하기',
      '센서 성능 변경(모델 변경)하기',
      '센서 설치 위치 수정하기',
    ],
    calcResultTitle: '안전거리 계산결과',
    insufficientStopTitle: '센서 정지거리 불충분',
    adequateStopTitle: '센서 정지거리 적정',
    adequateMm: '적정 안전거리(mm)',
    versusCurrent: (deltaMm: string) => `(현재 대비 +${deltaMm}mm)`,
    currentInstall: '현재 설치 거리',
    view: '보기',
    pflStopProposal: 'PFL 적용 시 정지 거리 제안',
    formulaLabel: '산출식',
    paramDetection: '센서감지능력(mm)',
    paramStopTime: '로봇 정지까지의 소요시간(sec)',
    paramPenetration: '위험점까지의 침투거리(mm)',
    paramApproach: '작업자의 접근속도(mm)',
    learnMoreCalc: '안전거리 계산 방식 자세히 알아보기',
    toggle: '토글',
    sensor2Summary: '분석 결과: 안전거리 충족.',
  };
}

const COMPLETED_AT = '2026.01.01 15:35:32';
const MOCK_MM = '1300';
const MOCK_DELTA = '200';

export function SensorAnalysisContent({
  locale,
  isDark,
  tokens: t,
  onOpenSensorCalculator,
  onSensorCalcDetailViewClick,
}: Props) {
  const L = copy(locale);
  const [pflToggle, setPflToggle] = useState(false);

  const surfaceMuted = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
  const surfaceCard = isDark ? 'rgba(255,255,255,0.04)' : '#f4f4f5';
  const formulaBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)';

  const badgeWarn = (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
      style={{
        background: ANALYSIS_WARN.bg,
        color: ANALYSIS_WARN.textStrong,
        border: `1px solid ${ANALYSIS_WARN.border}`,
      }}
    >
      {L.insufficientDistance}
    </span>
  );

  const rowLine = (label: string, value: ReactNode) => (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span style={{ color: t.textSecondary }}>{label}</span>
      <div className="text-right font-semibold min-w-0" style={{ color: t.textPrimary }}>
        {value}
      </div>
    </div>
  );

  const paramRow = (label: string, value: string) => (
    <div className="flex items-center justify-between gap-2 text-sm py-2 border-b last:border-b-0" style={{ borderColor: t.inputBorder }}>
      <span style={{ color: t.textSecondary }}>{label}</span>
      <span
        className="tabular-nums font-semibold px-2 py-1 rounded-lg border min-w-[2.5rem] text-center text-sm"
        style={{ borderColor: t.inputBorder, background: t.inputBg, color: t.textPrimary }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 스캐너 1 — 주황/적 위험 톤, 전체 펼침 */}
      <div
        className="rounded-xl border overflow-hidden border-l-4"
        style={{ borderColor: t.inputBorder, borderLeftColor: ANALYSIS_WARN.border, background: t.inputBg }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: t.inputBorder, background: ANALYSIS_WARN.bg }}>
          <span className="flex-1 text-base font-bold" style={{ color: t.textPrimary }}>
            {L.laserScanner(1)}
          </span>
          {badgeWarn}
        </div>
        <div className="px-4 py-4 space-y-4" style={{ borderColor: t.inputBorder, background: surfaceCard }}>
          <div className="space-y-2">
            {rowLine(L.analysisResult, badgeWarn)}
            <p className="text-xs text-right" style={{ color: t.textSecondary }}>
              {L.completedAtLabel} {COMPLETED_AT}
            </p>
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: ANALYSIS_WARN.textStrong }}>
              {L.suggestionTitle}
            </p>
            <ul className="flex flex-col gap-2">
              {L.suggestions.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors"
                  style={{ borderColor: t.inputBorder, background: surfaceMuted }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(245,158,11,0.12)' : 'rgba(255,251,235,0.95)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = surfaceMuted;
                  }}
                >
                  <span className="leading-snug" style={{ color: t.textPrimary }}>
                    {line}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-45" style={{ color: t.textSecondary }} aria-hidden />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: t.textPrimary }}>
              {L.calcResultTitle}
            </p>
            <div
              className="rounded-lg border px-3 py-3 mb-3 space-y-2 border-l-4"
              style={{ borderColor: t.inputBorder, borderLeftColor: ANALYSIS_DANGER.border, background: t.inputBg }}
            >
              <p className="text-sm font-bold" style={{ color: ANALYSIS_DANGER.textStrong }}>
                {L.insufficientStopTitle}
              </p>
              <p className="text-sm leading-snug" style={{ color: t.textSecondary }}>
                {L.adequateMm} <strong style={{ color: t.textPrimary }}>{MOCK_MM}mm</strong> {L.versusCurrent(MOCK_DELTA)}
              </p>
              <p className="text-sm" style={{ color: t.textSecondary }}>
                {L.currentInstall} : {MOCK_MM}mm
              </p>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ borderColor: t.inputBorder, background: t.inputBg }}>
              <div className="px-3 py-3 flex flex-wrap items-center gap-2 border-b" style={{ borderColor: t.inputBorder }}>
                <p className="text-sm font-bold flex-1 min-w-0" style={{ color: t.textPrimary }}>
                  {L.adequateStopTitle}
                </p>
                <button
                  type="button"
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border shrink-0"
                  style={{
                    borderColor: accentRgba(POINT_ORANGE, 0.45),
                    color: POINT_ORANGE,
                    background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.08)',
                  }}
                  onClick={() => onSensorCalcDetailViewClick?.()}
                >
                  {L.view}
                </button>
              </div>
              <div className="px-3 py-2 flex flex-wrap items-center justify-end gap-2 border-b" style={{ borderColor: t.inputBorder }}>
                <span className="text-xs font-medium flex-1 min-w-0 text-left" style={{ color: t.textSecondary }}>
                  {L.pflStopProposal}
                </span>
                <span className="text-xs shrink-0" style={{ color: t.textSecondary }}>
                  {L.toggle}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pflToggle}
                  aria-label={L.toggle}
                  className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                  style={{
                    background: pflToggle ? POINT_ORANGE : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.2)',
                  }}
                  onClick={() => setPflToggle((v) => !v)}
                >
                  <span
                    className="absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform"
                    style={{ left: pflToggle ? '22px' : '4px' }}
                  />
                </button>
              </div>
              <div className="px-3 py-3 space-y-1 text-sm">
                <p style={{ color: t.textSecondary }}>
                  {L.adequateMm}{' '}
                  <strong style={{ color: t.textPrimary }}>{pflToggle ? '1280' : MOCK_MM}mm</strong>
                </p>
                <p style={{ color: t.textSecondary }}>
                  {L.currentInstall} : {MOCK_MM}mm
                </p>
              </div>
              <div className="mx-3 mb-3 rounded-lg px-3 py-2 space-y-1" style={{ background: formulaBg }}>
                <p className="text-xs font-bold" style={{ color: t.textSecondary }}>
                  {L.formulaLabel}
                </p>
                <p className="text-xs font-mono leading-relaxed break-all" style={{ color: t.textPrimary }}>
                  S = (1600ms × 1s) + 8 × (40 − 14mm) = {pflToggle ? '1280' : MOCK_MM}mm
                </p>
              </div>
              <div className="px-3 pb-3 space-y-0">
                {paramRow(L.paramDetection, '40')}
                {paramRow(L.paramStopTime, '40')}
                {paramRow(L.paramPenetration, '40')}
                {paramRow(L.paramApproach, '40')}
              </div>
              <div className="p-3 pt-0">
                <button
                  type="button"
                  className="w-full text-center text-sm font-bold py-2.5 rounded-lg border"
                  style={{
                    borderColor: accentRgba(POINT_ORANGE, 0.35),
                    color: POINT_ORANGE,
                    background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.08)',
                  }}
                  onClick={onOpenSensorCalculator}
                >
                  {L.learnMoreCalc}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 스캐너 2 — 녹색 요약 한 블록 */}
      <div
        className="rounded-xl border px-4 py-3 flex flex-col gap-2 border-l-4"
        style={{
          borderColor: t.inputBorder,
          borderLeftColor: ANALYSIS_SAFE.border,
          background: isDark ? 'rgba(34,197,94,0.1)' : ANALYSIS_SAFE.bg,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold min-w-0" style={{ color: t.textPrimary }}>
            {L.laserScanner(2)}
          </span>
          <span
            className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: ANALYSIS_SAFE.bgStrong,
              color: ANALYSIS_SAFE.textStrong,
              border: `1px solid ${ANALYSIS_SAFE.border}`,
            }}
          >
            OK
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>
          {L.sensor2Summary}
        </p>
      </div>
    </div>
  );
}
