import { useState, type CSSProperties } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Tokens } from './PropertyPanel';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { getAnalysisChartTheme } from './bottomDockAnalysisChartTheme';
import { ParagraphOneCharts, ParagraphTwoCharts } from './BottomDockAnalysisChartBlocks';

type BottomDockChartLayout = 'stacked' | 'panelSplit';

type Locale = 'ko' | 'en';

function AnalysisToggleSwitch({
  checked,
  onCheckedChange,
  t,
  isDark,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  t: Tokens;
  isDark: boolean;
  ariaLabel: string;
}) {
  const trackOn = accentRgba(POINT_ORANGE, 0.45);
  const trackOff = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className="relative h-9 w-[52px] shrink-0 rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2"
      style={{
        background: checked ? trackOn : trackOff,
        borderColor: checked ? accentRgba(POINT_ORANGE, 0.75) : t.inputBorder,
        boxShadow: checked
          ? `0 0 0 1px ${accentRgba(POINT_ORANGE, 0.35)} inset, 0 4px 16px ${accentRgba(POINT_ORANGE, 0.35)}`
          : isDark
            ? '0 1px 4px rgba(0,0,0,0.35)'
            : '0 1px 3px rgba(0,0,0,0.12)',
      }}
    >
      <span
        className="pointer-events-none absolute top-1 left-1 h-7 w-7 rounded-full shadow-md transition-transform duration-200 ease-out"
        style={{
          background: checked ? '#ffffff' : isDark ? 'rgba(255,255,255,0.92)' : '#ffffff',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}

/** 하단 돌크「분석」탭 — Figma node 283:27841 구조. 그래프 데이터는 추후 연동 */
export function BottomDockAnalysisResultsPanel({
  locale,
  tokens: t,
  isDark,
}: {
  locale: Locale;
  tokens: Tokens;
  isDark: boolean;
}) {
  const L = locale === 'en' ? copyEn : copyKo;
  const [recommendedGraphOn, setRecommendedGraphOn] = useState(true);
  const [criOnlyOn, setCriOnlyOn] = useState(false);
  const [chartLayout, setChartLayout] = useState<BottomDockChartLayout>('panelSplit');
  const [workspaceTab, setWorkspaceTab] = useState<'filter' | 'cw1' | 'cw2' | 'cw'>('cw1');
  const [barChartTab, setBarChartTab] = useState<'atPos' | 'force' | 'pressure'>('atPos');

  const chartTheme = getAnalysisChartTheme(t, isDark);

  const labelStyle: CSSProperties = { color: t.textPrimary };
  const mutedStyle: CSSProperties = { color: t.textSecondary };
  const chipBorder = t.inputBorder;
  const surface: CSSProperties = {
    borderColor: t.inputBorder,
    background: t.inputBg,
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 text-[11px] leading-[18px]">
      {/* 상단: 제목 + 토글 */}
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-2">
        <h2 className="pr-2 text-[12px] font-bold tracking-tight" style={labelStyle}>
          {L.title}
        </h2>
        <div
          className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 rounded-[10px] border px-3 py-2"
          style={{
            borderColor: accentRgba(POINT_ORANGE, 0.42),
            background: isDark ? 'rgba(255, 142, 43, 0.09)' : 'rgba(255, 107, 0, 0.07)',
            boxShadow: isDark
              ? '0 0 0 1px rgba(255,142,43,0.12) inset'
              : '0 0 0 1px rgba(255,107,0,0.12) inset',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="max-w-[140px] text-[11px] font-bold leading-tight sm:max-w-none" style={labelStyle}>
              {L.recommendedToggleLabel}
            </span>
            <AnalysisToggleSwitch
              checked={recommendedGraphOn}
              onCheckedChange={setRecommendedGraphOn}
              t={t}
              isDark={isDark}
              ariaLabel={L.recommendedToggleLabel}
            />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="max-w-[160px] text-[11px] font-bold leading-tight sm:max-w-none" style={labelStyle}>
              {L.criToggleLabel}
            </span>
            <AnalysisToggleSwitch
              checked={criOnlyOn}
              onCheckedChange={setCriOnlyOn}
              t={t}
              isDark={isDark}
              ariaLabel={L.criToggleLabel}
            />
          </div>
        </div>
      </div>

      {/* 협동작업영역 탭 */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-1 border-b pb-2"
        style={{ borderColor: t.divider }}
      >
        {(
          [
            { id: 'filter' as const, label: L.tabFilter },
            { id: 'cw1' as const, label: L.tabCw1 },
            { id: 'cw2' as const, label: L.tabCw2 },
            { id: 'cw' as const, label: L.tabCw },
          ] as const
        ).map((tab) => {
          const active = workspaceTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className="rounded-md px-2 py-1 text-[10px] font-semibold transition-colors"
              style={{
                background: active ? accentRgba(POINT_ORANGE, 0.18) : 'transparent',
                color: active ? POINT_ORANGE : t.textSecondary,
                border: active ? `1px solid ${accentRgba(POINT_ORANGE, 0.4)}` : '1px solid transparent',
              }}
              onClick={() => setWorkspaceTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 좌측 분석 패널과 유사: 전체 그래프 배치 */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <label htmlFor="bd-chart-layout" className="text-[10px] font-semibold" style={mutedStyle}>
          {L.layoutLabel}
        </label>
        <div className="relative min-w-[11rem] max-w-[min(100%,280px)]">
          <select
            id="bd-chart-layout"
            value={chartLayout}
            onChange={(e) => setChartLayout(e.target.value as BottomDockChartLayout)}
            className="w-full cursor-pointer appearance-none rounded-md border py-1.5 pl-2 pr-8 text-[10px] font-semibold"
            style={{
              borderColor: chipBorder,
              background: t.inputBg,
              color: t.textPrimary,
            }}
            aria-label={L.layoutLabel}
          >
            <option value="stacked">{L.layoutStacked}</option>
            <option value="panelSplit">{L.layoutPanelSplit}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-70"
            style={{ color: t.textSecondary }}
            aria-hidden
          />
        </div>
      </div>

      {/* 요약 지표 */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-[10px] font-semibold"
        style={mutedStyle}
      >
        <span>
          <span className="mr-2">{L.metricRange}</span>
          <span style={{ color: t.textPrimary }}>{L.metricRangeValue}</span>
        </span>
        <span>
          <span className="mr-2">{L.metricResult}</span>
          <span style={{ color: t.textPrimary }}>{L.metricResultValue}</span>
        </span>
        <span>
          <span className="mr-2">{L.metricSpeed}</span>
          <span style={{ color: t.textPrimary }}>{L.metricSpeedValue}</span>
        </span>
      </div>

      {/* 그래프 본문: 단일 세로 스크롤 (겹침 방지) */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5 sfd-scroll">
        <div
          className={
            chartLayout === 'panelSplit'
              ? 'grid min-h-0 grid-cols-1 gap-8 pb-2 lg:grid-cols-2 lg:gap-5 lg:items-start'
              : 'space-y-8 pb-2'
          }
        >
          <ParagraphOneCharts
            locale={locale}
            theme={chartTheme}
            isDark={isDark}
            showRecommended={recommendedGraphOn}
          />
          <ParagraphTwoCharts
            locale={locale}
            theme={chartTheme}
            isDark={isDark}
            barChartTab={barChartTab}
            onBarChartTab={setBarChartTab}
            criOnlyOn={criOnlyOn}
          />
        </div>
      </div>
    </div>
  );
}

const copyKo = {
  title: '분석 결과 그래프',
  recommendedToggleLabel: '추천 속도 (속도 그래프에 표시)',
  criToggleLabel: '막대: CRI 1.0 이상만',
  layoutLabel: '그래프 배치',
  layoutStacked: '세로 — 시계열 → 상세',
  layoutPanelSplit: '나란히 — 시계열 | 상세 (넓은 화면)',
  tabFilter: '협동작업영역 필터링',
  tabCw1: '협동작업영역 1',
  tabCw2: '협동작업영역2',
  tabCw: '협동작업영역',
  metricRange: '분석 구간',
  metricRangeValue: 'MAX CRI: 1.2',
  metricResult: '분석 결과',
  metricResultValue: 'Fail',
  metricSpeed: '평균 추천 속도',
  metricSpeedValue: '120%',
};

const copyEn = {
  title: 'Analysis result charts',
  recommendedToggleLabel: 'Recommended % (on speed chart)',
  criToggleLabel: 'Bars: CRI ≥ 1.0 only',
  layoutLabel: 'Chart layout',
  layoutStacked: 'Vertical — time series, then detail',
  layoutPanelSplit: 'Side by side — time series | detail (wide)',
  tabFilter: 'Collab space filter',
  tabCw1: 'Collab space 1',
  tabCw2: 'Collab space 2',
  tabCw: 'Collab space',
  metricRange: 'Range',
  metricRangeValue: 'MAX CRI: 1.2',
  metricResult: 'Result',
  metricResultValue: 'Fail',
  metricSpeed: 'Avg. recommended speed',
  metricSpeedValue: '120%',
};
