import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { AnalysisChartTheme } from './bottomDockAnalysisChartTheme';
import {
  DEMO_CRI_STEP,
  DEMO_CRI_VS_TIME,
  DEMO_REC_SPEED_PCT,
  DEMO_SPEED_MM_S,
  DEMO_BAR_AT_POS,
  DEMO_BAR_BY_FORCE,
  DEMO_BAR_BY_PRESSURE,
} from './bottomDockAnalysisDemoData';
import { useResizeObserverWidth } from './useResizeObserverWidth';

type Locale = 'ko' | 'en';

const BAR_CATEGORIES = [
  'R1',
  'R2',
  'R3',
  'R4',
  'R5',
  'R6',
  'EE1',
  'EE2',
  'EE3',
  'EE4',
  'EE5',
  'EE6',
  'EE7',
  'EE8',
  'EE9',
  'EE10',
  'EE11',
  'EE12',
  'EE13',
  'EE14',
  'EE15',
  'EE16',
  'EE17',
  'EE18',
  'EE19',
  'EE20',
] as const;

const P1 = {
  ko: {
    p1Title: '시계열 분석',
    p1Hint: '타임 스텝별 속도·CRI. 추천 속도(%)는 속도 그래프에 두 번째 선으로 표시됩니다.',
    speed: '속도 [mm/s]',
    cri: 'CRI',
    rec: '추천 속도 [%]',
    safety: 'SafetyLine',
    current: 'Current Speed',
    timeAxis: '시간 스텝',
    p2Title: 'CRI·충돌 상세',
    p2Hint: '구간별 CRI 및 위치·힘·압력',
    criTime: 'CRI — Time',
    timeSec: 'Time [sec]',
    criAtPos: 'CRI at each Pos.',
    criByForce: 'CRI by Force',
    criByPressure: 'CRI by Pressure',
    colliPos: 'Colli. Pos. Number',
    barBlockTitle: '위치·힘·압력별 CRI',
    legSpeedSeries: '측정 속도 (TCP·축)',
    legSpeedBar: '작업 구간 표시',
    legCriSeries: 'CRI (시계열)',
    legCriSafety: 'SafetyLine (CRI ≤ 1)',
    legRecSeries: '추천 속도 %',
    legRecBaseline: '현재 속도 기준 (100%)',
    legCriTimeSeries: 'CRI (시간)',
    legCriTimeThreshold: '임계 CRI = 1',
    legBarCri: 'CRI (막대)',
    legBarThreshold: '허용 한계 (1.0)',
    legTipSpeedSeries:
      '타임 스텝마다 계산된 TCP 또는 관절 축의 합성 속도(mm/s)입니다. 피크는 빠른 이송·재현 구간을 나타냅니다.',
    legTipSpeedBar: '현재 분석에 포함된 모션 구간을 시간 축 아래 갈색 바로 표시합니다.',
    legTipCriSeries:
      '충돌 위험 지수(CRI)의 시계열입니다. ISO 10218 / ISO/TS 15066 등에서 정의된 평가 흐름을 따른 예시 곡선입니다.',
    legTipCriSafety: 'CRI가 이 선을 넘지 않도록 감속·경로 수정이 권장됩니다. (예시: CRI ≤ 1)',
    legTipRecSeries:
      '위험 구간에서 목표로 하는 상대 속도 비율(%)입니다. 100% 미만이면 현재 대비 감속을 의미합니다.',
    legTipRecBaseline: '프로그램에 설정된 현재 속도를 100%로 두고, 추천 %와 비교하는 기준선입니다.',
    legTipCriTimeSeries: '시뮬레이션 시간(초)에 따른 CRI 변화입니다. 스파이크는 특정 구간의 근접·접촉 위험이 커질 때 나타납니다.',
    legTipCriTimeThreshold: '허용 가능한 CRI 상한(예시 1.0)입니다. 이를 초과하면 Fail 판정·감속이 필요합니다.',
    legTipBarCri: '충돌 예상 위치(로봇 축 R1–R6, 엔드 EE 등)별로 집계한 CRI입니다. 탭에 따라 산출 방식이 달라집니다.',
    legTipBarThreshold: '막대 그래프에서 사용하는 CRI 허용 한계값입니다. 막대가 이 선 위로 올라가면 초과입니다.',
    barFilterEmpty: 'CRI가 1.0 이상인 항목이 없습니다.',
  },
  en: {
    p1Title: 'Time-series analysis',
    p1Hint: 'Speed and CRI per step. Recommended % appears as a second line on the speed chart.',
    speed: 'Speed [mm/s]',
    cri: 'CRI',
    rec: 'Recommended speed [%]',
    safety: 'SafetyLine',
    current: 'Current Speed',
    timeAxis: 'Time step',
    p2Title: 'CRI & collision detail',
    p2Hint: 'CRI by time, position, force, pressure',
    criTime: 'CRI — Time',
    timeSec: 'Time [sec]',
    criAtPos: 'CRI at each Pos.',
    criByForce: 'CRI by Force',
    criByPressure: 'CRI by Pressure',
    colliPos: 'Colli. Pos. Number',
    barBlockTitle: 'CRI by position / force / pressure',
    legSpeedSeries: 'Measured speed (TCP / axes)',
    legSpeedBar: 'Motion segment',
    legCriSeries: 'CRI (time series)',
    legCriSafety: 'SafetyLine (CRI ≤ 1)',
    legRecSeries: 'Recommended speed %',
    legRecBaseline: 'Current speed baseline (100%)',
    legCriTimeSeries: 'CRI vs. time',
    legCriTimeThreshold: 'Threshold CRI = 1',
    legBarCri: 'CRI (bars)',
    legBarThreshold: 'Limit (1.0)',
    legTipSpeedSeries:
      'Synthesized TCP / joint-axis speed (mm/s) per time step. Peaks correspond to faster transfer or motion segments.',
    legTipSpeedBar: 'Brown band along the time axis marks motion segments included in this analysis window.',
    legTipCriSeries:
      'Time series of Collision Risk Index (CRI), aligned with ISO 10218 / ISO/TS 15066-style assessment flow (demo curve).',
    legTipCriSafety: 'Keep CRI at or below this line via deceleration or path changes. (Example: CRI ≤ 1)',
    legTipRecSeries:
      'Recommended relative speed (%). Values below 100% mean “slow down versus the current programmed speed.”',
    legTipRecBaseline: 'Baseline at 100% matches the current programmed speed; compare the recommended % against it.',
    legTipCriTimeSeries: 'CRI over simulation time (seconds). Spikes indicate higher transient contact/proximity risk.',
    legTipCriTimeThreshold: 'Upper CRI bound for pass/fail (example 1.0). Exceeding it requires mitigation.',
    legTipBarCri: 'CRI aggregated per collision candidate (axes R1–R6, end-effector EE1–EE20). Meaning varies by tab.',
    legTipBarThreshold: 'Threshold drawn across bars. Bars above this line exceed the allowed CRI.',
    barFilterEmpty: 'No items with CRI ≥ 1.0.',
  },
};

export type ChartLegendEntry = {
  label: string;
  tooltip: string;
  kind: 'line' | 'dashedLine' | 'bar';
  color: string;
};

/** NaN이면 구간을 끊어 여러 `M…L…` 경로로 이어 붙임 (CRI≥1만 보기 등) */
function buildLinePathFromSeries(
  series: readonly number[],
  xMax: number,
  xToSvg: (x: number) => number,
  yToSvg: (y: number) => number,
  clampVal: (raw: number) => number,
): string {
  const n = series.length;
  if (n < 2) return '';
  const steps = n - 1;
  const chunks: string[] = [];
  let segment: string[] = [];
  const flush = () => {
    if (segment.length < 2) {
      segment = [];
      return;
    }
    chunks.push(`M ${segment.map((p) => p.replace(',', ' ')).join(' L ')}`);
    segment = [];
  };
  for (let i = 0; i < n; i++) {
    const raw = series[i]!;
    if (Number.isNaN(raw)) {
      flush();
      continue;
    }
    const x = (i / steps) * xMax;
    const y = clampVal(raw);
    segment.push(`${xToSvg(x).toFixed(1)},${yToSvg(y).toFixed(1)}`);
  }
  flush();
  return chunks.join(' ');
}

/** 하단 돌크 `overflow` 안에서도 잘리지 않도록 body 포털 */
function AnalysisLegendTooltip({
  isDark,
  label,
  children,
}: {
  isDark: boolean;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePos = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ top: r.top, left: r.left + r.width / 2 });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onMove = () => updatePos();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, updatePos]);

  const surface = isDark
    ? {
        borderColor: 'rgba(255,255,255,0.14)',
        color: '#e5e7eb',
        background: 'rgba(24,25,30,0.97)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.5)',
      }
    : {
        borderColor: 'rgba(15,23,42,0.14)',
        color: '#0f172a',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 8px 18px rgba(15,23,42,0.16)',
      };

  return (
    <>
      <span
        ref={wrapRef}
        className="inline-flex max-w-full min-w-0"
        onMouseEnter={() => {
          updatePos();
          setOpen(true);
        }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => {
          updatePos();
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        tabIndex={0}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[100] max-w-[min(280px,calc(100vw-24px))] rounded-[8px] border px-3 py-2 text-[12px] font-medium leading-[1.45] shadow-lg"
            style={{
              top: pos.top,
              left: pos.left,
              transform: 'translate(-50%, calc(-100% - 8px))',
              ...surface,
            }}
          >
            {label}
          </span>,
          document.body,
        )}
    </>
  );
}

function ChartLegendTwoCol({
  theme,
  items,
  isDark,
}: {
  theme: AnalysisChartTheme;
  items: readonly ChartLegendEntry[];
  isDark: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div
      className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-b px-3 py-2.5"
      style={{ borderColor: theme.gridMinor, background: theme.chartSurface }}
      role="group"
      aria-label="Legend"
    >
      {items.map((it, i) => (
        <AnalysisLegendTooltip key={i} isDark={isDark} label={it.tooltip}>
          <div className="flex min-h-[24px] w-full min-w-0 cursor-help items-start gap-2.5 rounded-md outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-orange-400/50">
            {it.kind === 'line' ? (
              <span className="mt-1.5 h-[3px] w-8 shrink-0 rounded-full" style={{ background: it.color }} aria-hidden />
            ) : it.kind === 'dashedLine' ? (
              <span className="mt-1.5 h-0 w-8 shrink-0" style={{ borderTop: `3px dashed ${it.color}` }} aria-hidden />
            ) : (
              <span
                className="mt-1 h-2.5 w-7 shrink-0 rounded-sm"
                style={{ background: it.color, opacity: 0.95 }}
                aria-hidden
              />
            )}
            <span
              className="min-w-0 flex-1 text-[12px] leading-snug"
              style={{ color: theme.axisPrimary, fontWeight: 600 }}
            >
              {it.label}
            </span>
          </div>
        </AnalysisLegendTooltip>
      ))}
    </div>
  );
}

export type BarChartTabId = 'atPos' | 'force' | 'pressure';

export function ParagraphOneCharts({
  locale,
  theme,
  isDark,
  showRecommended = true,
}: {
  locale: Locale;
  theme: AnalysisChartTheme;
  isDark: boolean;
  showRecommended?: boolean;
}) {
  const L = locale === 'en' ? P1.en : P1.ko;

  const speedLegendItems = useMemo((): ChartLegendEntry[] => {
    const base: ChartLegendEntry[] = [
      { label: L.legSpeedSeries, tooltip: L.legTipSpeedSeries, kind: 'line', color: theme.dataLine },
      { label: L.legSpeedBar, tooltip: L.legTipSpeedBar, kind: 'bar', color: theme.baseBar },
    ];
    if (!showRecommended) return base;
    return [
      ...base,
      { label: L.legRecSeries, tooltip: L.legTipRecSeries, kind: 'line', color: theme.safetyLine },
      { label: L.legRecBaseline, tooltip: L.legTipRecBaseline, kind: 'dashedLine', color: theme.currentSpeedLine },
    ];
  }, [L, showRecommended, theme]);

  return (
    <section className="space-y-3" aria-labelledby="bd-an-p1-title">
      <header>
        <h3
          id="bd-an-p1-title"
          className="text-[13px] font-bold leading-tight tracking-tight"
          style={{ color: theme.sectionTitle }}
        >
          {L.p1Title}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium leading-snug" style={{ color: theme.sectionSubtitle }}>
          {L.p1Hint}
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch">
        <TimeSeriesLineChart
          title={L.speed}
          yMax={1000}
          yTicks={[0, 200, 400, 600, 800, 1000]}
          xMax={42}
          theme={theme}
          variant="speed"
          series={DEMO_SPEED_MM_S}
          legendItems={speedLegendItems}
          isDark={isDark}
          recommendedOverlay={
            showRecommended
              ? {
                  values: DEMO_REC_SPEED_PCT,
                  yMax: 200,
                  yTicks: [0, 50, 100, 150, 200],
                  baselineAt: 100,
                }
              : undefined
          }
        />
        <TimeSeriesLineChart
          title={L.cri}
          yMax={1}
          yTicks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
          xMax={42}
          theme={theme}
          variant="cri"
          safetyAtY={1}
          series={DEMO_CRI_STEP}
          legendItems={[
            { label: L.legCriSeries, tooltip: L.legTipCriSeries, kind: 'line', color: theme.dataLine },
            { label: L.legCriSafety, tooltip: L.legTipCriSafety, kind: 'dashedLine', color: theme.safetyLine },
          ]}
          isDark={isDark}
        />
      </div>
    </section>
  );
}

function TimeSeriesLineChart({
  title,
  yMax,
  yTicks,
  xMax,
  theme,
  variant,
  safetyAtY,
  series,
  legendItems = [],
  isDark,
  recommendedOverlay,
}: {
  title: string;
  yMax: number;
  yTicks: number[];
  xMax: number;
  theme: AnalysisChartTheme;
  variant: 'speed' | 'cri';
  safetyAtY?: number;
  /** 길이 N: x는 0…xMax를 (N−1)등분한 샘플과 대응 (NaN이면 선이 끊김) */
  series: readonly number[];
  legendItems?: readonly ChartLegendEntry[];
  isDark: boolean;
  /** 속도 차트에만: 추천 속도(%)를 우측 Y축으로 겹쳐 그림 */
  recommendedOverlay?: {
    values: readonly number[];
    yMax: number;
    yTicks: number[];
    baselineAt: number;
  };
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerW = useResizeObserverWidth(wrapRef);
  const W = Math.max(300, containerW > 0 ? containerW : 420);
  const H = 120;
  const padL = 44;
  const padR = recommendedOverlay ? 40 : 14;
  const padT = 28;
  const padB = 36;
  const baseH = 8;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yToSvg = (yVal: number) => padT + plotH - (yVal / yMax) * plotH;
  const xToSvg = (xVal: number) => padL + (xVal / xMax) * plotW;

  const yToSvgRec = (yVal: number, recMax: number) => padT + plotH - (yVal / recMax) * plotH;

  const lineD = useMemo(() => {
    const plotHi = H - padT - padB;
    const pw = W - padL - padR;
    const y0 = (yVal: number) => padT + plotHi - (yVal / yMax) * plotHi;
    const x0 = (xVal: number) => padL + (xVal / xMax) * pw;
    const clamp = (raw: number) => Math.min(yMax, Math.max(0, raw));
    return buildLinePathFromSeries(series, xMax, x0, y0, clamp);
  }, [W, H, padL, padR, padT, padB, yMax, xMax, series]);

  const lineDRec = useMemo(() => {
    if (!recommendedOverlay) return '';
    const ro = recommendedOverlay;
    const plotHi = H - padT - padB;
    const pw = W - padL - padR;
    const y0 = (yVal: number) => padT + plotHi - (yVal / ro.yMax) * plotHi;
    const x0 = (xVal: number) => padL + (xVal / xMax) * pw;
    const clamp = (raw: number) => Math.min(ro.yMax, Math.max(0, raw));
    return buildLinePathFromSeries(ro.values, xMax, x0, y0, clamp);
  }, [recommendedOverlay, W, H, padL, padR, padT, padB, xMax]);

  const xTickEvery = containerW > 0 && containerW < 320 ? 14 : 7;
  const xTicks = useMemo(() => {
    const list: number[] = [];
    for (let x = 0; x <= xMax; x += xTickEvery) list.push(x);
    return list;
  }, [xMax, xTickEvery]);

  return (
    <div
      className="overflow-hidden rounded-[10px] border"
      style={{
        borderColor: theme.cardBorder,
        boxShadow: theme.cardShadow,
        background: theme.chartSurface,
      }}
    >
      <p
        className="border-b px-3 py-2.5 text-[13px] font-semibold leading-tight"
        style={{ color: theme.axisPrimary, borderColor: theme.gridMinor }}
      >
        {title}
      </p>
      <ChartLegendTwoCol theme={theme} items={legendItems} isDark={isDark} />
      <div ref={wrapRef} className="w-full min-w-0">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full max-w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={title}
        >
          <rect x={0} y={0} width={W} height={H} fill={theme.plotBackground} />
          {yTicks.map((yt) => {
            const yy = yToSvg(yt);
            return (
              <line
                key={yt}
                x1={padL}
                x2={W - padR}
                y1={yy}
                y2={yy}
                stroke={theme.gridMinor}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            );
          })}
          {safetyAtY !== undefined && (
            <line
              x1={padL}
              x2={W - padR}
              y1={yToSvg(safetyAtY)}
              y2={yToSvg(safetyAtY)}
              stroke={theme.safetyLine}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {recommendedOverlay ? (
            <line
              x1={padL}
              x2={W - padR}
              y1={yToSvgRec(recommendedOverlay.baselineAt, recommendedOverlay.yMax)}
              y2={yToSvgRec(recommendedOverlay.baselineAt, recommendedOverlay.yMax)}
              stroke={theme.currentSpeedLine}
              strokeWidth={1.5}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {lineD ? (
            <path
              d={lineD}
              fill="none"
              stroke={theme.dataLine}
              strokeWidth={1.8}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {lineDRec ? (
            <path
              d={lineDRec}
              fill="none"
              stroke={theme.safetyLine}
              strokeWidth={1.7}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          <line
            x1={padL}
            x2={padL}
            y1={padT}
            y2={H - padB}
            stroke={theme.gridMajor}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={W - padR}
            x2={W - padR}
            y1={padT}
            y2={H - padB}
            stroke={recommendedOverlay ? theme.gridMajor : 'transparent'}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={padL}
            x2={W - padR}
            y1={H - padB}
            y2={H - padB}
            stroke={theme.gridMajor}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          {yTicks.map((yt) => (
            <text
              key={`yl-${yt}`}
              x={padL - 8}
              y={yToSvg(yt) + 4}
              textAnchor="end"
              fill={theme.axisMuted}
              fontSize={11}
              fontWeight={600}
            >
              {variant === 'cri' ? yt.toFixed(1) : yt}
            </text>
          ))}
          {recommendedOverlay
            ? recommendedOverlay.yTicks.map((yt) => (
                <text
                  key={`yr-${yt}`}
                  x={W - 6}
                  y={yToSvgRec(yt, recommendedOverlay.yMax) + 4}
                  textAnchor="end"
                  fill={theme.safetyLine}
                  fontSize={10}
                  fontWeight={600}
                >
                  {yt}
                </text>
              ))
            : null}
          {xTicks.map((xt) => (
            <text
              key={`x-${xt}`}
              x={xToSvg(xt)}
              y={H - 10}
              textAnchor="middle"
              fill={theme.axisMuted}
              fontSize={10}
              fontWeight={600}
            >
              {xt}
            </text>
          ))}
          {variant === 'speed' ? (
            <rect x={padL} y={H - padB} width={plotW} height={baseH} fill={theme.baseBar} opacity={0.95} />
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export function ParagraphTwoCharts({
  locale,
  theme,
  isDark,
  barChartTab,
  onBarChartTab,
  criOnlyOn = false,
}: {
  locale: Locale;
  theme: AnalysisChartTheme;
  isDark: boolean;
  barChartTab: BarChartTabId;
  onBarChartTab: (t: BarChartTabId) => void;
  /** 막대: CRI ≥ 1.0 인 충돌 후보만 표시 */
  criOnlyOn?: boolean;
}) {
  const L = locale === 'en' ? P1.en : P1.ko;

  const barSeries = useMemo(
    () => ({
      atPos: { yMax: 2 as const, values: [...DEMO_BAR_AT_POS] },
      force: { yMax: 2 as const, values: [...DEMO_BAR_BY_FORCE] },
      pressure: { yMax: 1.5 as const, values: [...DEMO_BAR_BY_PRESSURE] },
    }),
    [],
  );

  const { yMax: barYMax, categories: barCategories, values: barValues } = useMemo(() => {
    const row = barSeries[barChartTab];
    const vals = row.values;
    const cats = [...BAR_CATEGORIES];
    if (!criOnlyOn) {
      return { yMax: row.yMax, categories: cats, values: vals };
    }
    const fc: string[] = [];
    const fv: number[] = [];
    for (let i = 0; i < vals.length; i++) {
      const v = vals[i]!;
      if (v >= 1) {
        fc.push(cats[i]!);
        fv.push(v);
      }
    }
    return { yMax: row.yMax, categories: fc, values: fv };
  }, [barChartTab, barSeries, criOnlyOn]);

  const barTabs: { id: BarChartTabId; label: string }[] = [
    { id: 'atPos', label: L.criAtPos },
    { id: 'force', label: L.criByForce },
    { id: 'pressure', label: L.criByPressure },
  ];

  return (
    <section className="space-y-4" aria-labelledby="bd-an-p2-title">
      <header>
        <h3
          id="bd-an-p2-title"
          className="text-[13px] font-bold leading-tight tracking-tight"
          style={{ color: theme.sectionTitle }}
        >
          {L.p2Title}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium leading-snug" style={{ color: theme.sectionSubtitle }}>
          {L.p2Hint}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start lg:gap-3">
        <div className="min-w-0">
          <div
            className="overflow-hidden rounded-[10px] border"
            style={{ borderColor: theme.cardBorder, boxShadow: theme.cardShadow, background: theme.chartSurface }}
          >
            <p
              className="border-b px-3 py-2.5 text-[13px] font-semibold leading-tight"
              style={{ color: theme.axisPrimary, borderColor: theme.gridMinor }}
            >
              {L.criTime}
            </p>
            <ChartLegendTwoCol
              theme={theme}
              isDark={isDark}
              items={[
                { label: L.legCriTimeSeries, tooltip: L.legTipCriTimeSeries, kind: 'line', color: theme.barFill },
                { label: L.legCriTimeThreshold, tooltip: L.legTipCriTimeThreshold, kind: 'dashedLine', color: theme.thresholdLine },
              ]}
            />
            <CriTimeLineChart theme={theme} series={DEMO_CRI_VS_TIME} />
          </div>
          <p className="mt-1.5 text-[10px] font-medium leading-snug" style={{ color: theme.axisMuted }}>
            {L.timeSec} 0–600 · CRI 0–3
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-[13px] font-semibold" style={{ color: theme.axisPrimary }}>
            {L.barBlockTitle}
          </p>
          <div
            className="overflow-hidden rounded-[10px] border"
            style={{ borderColor: theme.cardBorder, boxShadow: theme.cardShadow, background: theme.chartSurface }}
          >
            <div
              className="flex flex-wrap gap-0.5 p-1"
              role="tablist"
              aria-label={L.barBlockTitle}
              style={{ background: theme.tabBarBg, borderBottom: `1px solid ${theme.gridMinor}` }}
            >
              {barTabs.map((tab) => {
                const active = barChartTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="min-h-[32px] rounded-[6px] px-2.5 py-1.5 text-[11px] font-semibold transition-colors"
                    style={{
                      background: active ? theme.tabActiveBg : 'transparent',
                      color: active ? theme.tabActiveFg : theme.tabInactiveFg,
                      boxShadow: active ? theme.cardShadow : undefined,
                    }}
                    onClick={() => onBarChartTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <ChartLegendTwoCol
              theme={theme}
              isDark={isDark}
              items={[
                { label: L.legBarCri, tooltip: L.legTipBarCri, kind: 'bar', color: theme.barFill },
                { label: L.legBarThreshold, tooltip: L.legTipBarThreshold, kind: 'dashedLine', color: theme.thresholdLine },
              ]}
            />
            <div className="min-w-0">
              {barValues.length === 0 ? (
                <div
                  className="flex min-h-[140px] items-center justify-center px-4 py-6 text-center text-[11px] font-semibold leading-snug"
                  style={{ color: theme.axisMuted, background: theme.plotBackground }}
                  role="status"
                >
                  {L.barFilterEmpty}
                </div>
              ) : (
                <BarChartSvg
                  key={`${barChartTab}-${criOnlyOn ? 'f' : 'a'}-${barCategories.length}`}
                  theme={theme}
                  yMax={barYMax}
                  yLabel="CRI"
                  threshold={1}
                  categories={barCategories}
                  values={barValues}
                  valueFmt={(v) => v.toFixed(2)}
                />
              )}
            </div>
          </div>
          <p className="mt-1.5 text-[10px] font-medium" style={{ color: theme.axisMuted }}>
            {L.colliPos}
          </p>
        </div>
      </div>
    </section>
  );
}

function CriTimeLineChart({
  theme,
  series,
}: {
  theme: AnalysisChartTheme;
  series: readonly number[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerW = useResizeObserverWidth(wrapRef);

  const W = Math.max(320, containerW > 0 ? containerW : 480);
  const H = 120;
  const padL = 40;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const xMax = 600;
  const yMax = 3;

  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yToSvg = (y: number) => padT + plotH - (y / yMax) * plotH;
  const xToSvg = (x: number) => padL + (x / xMax) * plotW;
  const thrY = 1;

  const lineD = useMemo(() => {
    const plotWi = W - padL - padR;
    const plotHi = H - padT - padB;
    const y0 = (yv: number) => padT + plotHi - (yv / yMax) * plotHi;
    const x0 = (xv: number) => padL + (xv / xMax) * plotWi;
    const pts: string[] = [];
    const n = series.length;
    if (n < 2) return '';
    const last = n - 1;
    for (let i = 0; i < n; i++) {
      const x = (i / last) * xMax;
      const raw = series[i] ?? 0;
      const y = Math.min(2.95, Math.max(0.08, raw));
      pts.push(`${x0(x).toFixed(1)},${y0(y).toFixed(1)}`);
    }
    return `M ${pts.map((p) => p.replace(',', ' ')).join(' L ')}`;
  }, [W, H, padL, padR, padT, padB, xMax, yMax, series]);

  const xTicksMajor = useMemo(() => {
    if (containerW > 0 && containerW < 340) return [0, 300, 600];
    return [0, 150, 300, 450, 600];
  }, [containerW]);

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-auto w-full max-w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-hidden
      >
        <rect width={W} height={H} fill={theme.plotBackground} />
        <line
          x1={padL}
          x2={W - padR}
          y1={yToSvg(thrY)}
          y2={yToSvg(thrY)}
          stroke={theme.thresholdLine}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={lineD}
          fill="none"
          stroke={theme.barFill}
          strokeWidth={1.8}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={padL}
          x2={padL}
          y1={padT}
          y2={H - padB}
          stroke={theme.gridMajor}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={padL}
          x2={W - padR}
          y1={H - padB}
          y2={H - padB}
          stroke={theme.gridMajor}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {[0, 1, 2, 3].map((yt) => (
          <text key={yt} x={padL - 8} y={yToSvg(yt) + 4} textAnchor="end" fill={theme.axisMuted} fontSize={11} fontWeight={600}>
            {yt}
          </text>
        ))}
        {xTicksMajor.map((xt) => (
          <text key={xt} x={xToSvg(xt)} y={H - 8} textAnchor="middle" fill={theme.axisMuted} fontSize={10} fontWeight={600}>
            {xt}
          </text>
        ))}
      </svg>
    </div>
  );
}

function BarChartSvg({
  theme,
  yMax,
  yLabel,
  threshold,
  categories,
  values,
  valueFmt,
}: {
  theme: AnalysisChartTheme;
  yMax: number;
  yLabel: string;
  threshold: number;
  categories: string[];
  values: number[];
  valueFmt: (v: number) => string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerW = useResizeObserverWidth(wrapRef);

  const padL = 36;
  const padR = 10;
  const padT = 14;
  const padB = 52;
  const H = 160;
  const n = categories.length;

  const layout = useMemo(() => {
    const cw = containerW > 0 ? containerW : 400;
    const chartW = cw;
    const plotW = Math.max(40, chartW - padL - padR);
    let gap = n > 20 ? 3 : n > 12 ? 4 : 5;
    let barW = (plotW - (n - 1) * gap) / n;
    if (barW < 1.5 && gap > 2) {
      gap = 2;
      barW = (plotW - (n - 1) * gap) / n;
    }
    const startX = padL;
    const narrow = barW < 5;
    return {
      chartW,
      barW,
      gap,
      startX,
      labelFont: narrow ? 7 : 8,
      valueFont: narrow ? 7 : 9,
      showValue: barW >= 3.5,
      showCatLabel: barW >= 2.5,
    };
  }, [containerW, n, padL, padR]);

  const { chartW, barW, gap, startX, labelFont, valueFont, showValue, showCatLabel } = layout;

  const plotH = H - padT - padB;
  const yToSvg = (y: number) => padT + plotH - (y / yMax) * plotH;
  const baseY = padT + plotH;

  const yGridTicks =
    yMax <= 1.6 ? [0, 0.5, 1, 1.5] : [0, 0.5, 1, 1.5, 2].filter((t) => t <= yMax + 0.01);

  return (
    <div ref={wrapRef} className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${chartW} ${H}`}
        className="block h-auto w-full min-w-0"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={yLabel}
      >
        <rect width={chartW} height={H} fill={theme.plotBackground} />
        {yGridTicks.map((yt) => (
          <line
            key={yt}
            x1={padL}
            x2={chartW - padR}
            y1={yToSvg(yt)}
            y2={yToSvg(yt)}
            stroke={theme.gridMinor}
            strokeWidth={1}
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1={padL}
          x2={chartW - padR}
          y1={yToSvg(threshold)}
          y2={yToSvg(threshold)}
          stroke={theme.thresholdLine}
          strokeWidth={1.2}
          strokeDasharray="4 3"
          vectorEffect="non-scaling-stroke"
        />
        {categories.map((c, i) => {
          const x = startX + i * (barW + gap);
          const v = values[i] ?? 0;
          const yTop = yToSvg(v);
          const barHeight = baseY - yTop;
          return (
            <g key={c}>
              <rect
                x={x}
                y={yTop}
                width={barW}
                height={barHeight}
                fill={theme.barFill}
                opacity={0.95}
                rx={1}
              />
              {showValue ? (
                <text
                  x={x + barW / 2}
                  y={yTop - 4}
                  textAnchor="middle"
                  fill={theme.barValue}
                  fontSize={valueFont}
                  fontWeight={600}
                >
                  {valueFmt(v)}
                </text>
              ) : null}
              {showCatLabel ? (
                <text
                  x={x + barW / 2}
                  y={H - 10}
                  textAnchor="end"
                  fill={theme.axisMuted}
                  fontSize={labelFont}
                  fontWeight={500}
                  transform={`rotate(-52 ${x + barW / 2} ${H - 10})`}
                >
                  {c}
                </text>
              ) : null}
            </g>
          );
        })}
        <text x={11} y={H / 2} transform={`rotate(-90 11 ${H / 2})`} fill={theme.axisMuted} fontSize={11} fontWeight={600}>
          {yLabel}
        </text>
      </svg>
    </div>
  );
}
