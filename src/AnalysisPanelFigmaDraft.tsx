/**
 * Figma Drafts 노드 기반 분석 결과 패널 레이아웃 (얕은 DOM, 프로퍼티 패널 토큰 정합)
 * — 시각은 Safetics 주노 Draft 방향의 단일 열·플랫 리스트
 */
import type { ElementType } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_FRAME_DARK, ANALYSIS_FRAME_LIGHT } from './analysisPanelFrameRef';
import type { AnalysisFrameTokens, HazardRowTone } from './analysisPanelFrameRef';
import type { LightHazardRow, LightRegRow } from './analysisPanelSummaryRows';

export type { LightHazardRow as FigmaDraftHazardRow } from './analysisPanelSummaryRows';

type PanelTokens = {
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  inputBg: string;
  divider: string;
  elevationRaised: string;
};

function frameBadge(tone: HazardRowTone, tok: AnalysisFrameTokens) {
  if (tone === 'fail') return { bg: tok.badgeFailBg, fg: tok.badgeFailFg, label: '✕' as const };
  if (tone === 'warn') return { bg: tok.badgeWarnBg, fg: tok.badgeWarnFg, label: '!' as const };
  return { bg: tok.badgePassBg, fg: tok.badgePassFg, label: '✓' as const };
}

type Metric = { label: string; value: number };

type ChromeProps = {
  locale: 'ko' | 'en';
  isDark: boolean;
  t: PanelTokens;
  title: string;
  cellFilter: string;
  cellValue: string;
  conditionsChanged: string;
  metrics: Metric[];
  processOrder: { id: string; label: string; short: string }[];
  processTab: string;
  onProcessTab: (id: 'summary' | 'equipment' | 'residual') => void;
  stepIcons: readonly [ElementType, ElementType, ElementType];
  cellId: string;
  onCellId: (v: string) => void;
};

export function AnalysisFigmaDraftChrome({
  locale,
  isDark,
  t,
  title,
  cellFilter,
  cellValue,
  conditionsChanged,
  metrics,
  processOrder,
  processTab,
  onProcessTab,
  stepIcons,
  cellId,
  onCellId,
}: ChromeProps) {
  const FT: AnalysisFrameTokens = isDark ? ANALYSIS_FRAME_DARK : ANALYSIS_FRAME_LIGHT;
  const hairline = t.divider;

  return (
    <div className="shrink-0 space-y-2 border-b px-3 py-2" style={{ borderColor: hairline, background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)' }}>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 text-[14px] font-bold leading-tight tracking-tight" style={{ color: t.textPrimary }}>
          {title}
        </h2>
        <div className="flex min-w-0 shrink-0 items-center gap-1.5">
          <label htmlFor="figma-draft-cell" className="sr-only">
            {cellFilter}
          </label>
          <select
            id="figma-draft-cell"
            value={cellId}
            onChange={(e) => onCellId(e.target.value)}
            className="max-w-[14rem] min-w-[10rem] cursor-pointer appearance-none rounded-md py-1 pl-2 pr-7 text-[12px] font-medium"
            style={{
              border: `1px solid ${t.inputBorder}`,
              background: t.inputBg,
              color: t.textPrimary,
              boxShadow: t.elevationRaised,
            }}
          >
            <option value="cell1">{cellValue}</option>
          </select>
          <ChevronDown className="pointer-events-none relative -ml-6 h-3 w-3" style={{ color: FT.textTertiary }} aria-hidden />
          <span
            className="hidden max-w-[6rem] truncate rounded px-1 py-0.5 text-[12px] font-semibold sm:inline"
            style={{ background: 'rgba(251,191,36,0.14)', color: '#d97706' }}
            title={conditionsChanged}
          >
            {conditionsChanged}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg" style={{ background: hairline }}>
        {metrics.map((m) => (
          <div key={m.label} className="px-1.5 py-1.5 text-center" style={{ background: isDark ? FT.bgSecondary : t.inputBg }}>
            <div className="truncate text-[12px] font-medium leading-tight" style={{ color: t.textSecondary }} title={m.label}>
              {m.label}
            </div>
            <div className="mt-0.5 text-[14px] font-bold tabular-nums leading-none" style={{ color: t.textPrimary }}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-0" role="tablist" aria-label={locale === 'en' ? 'Diagnosis steps' : '진단 단계'}>
        {processOrder.map((step, idx) => {
          const active = processTab === step.id;
          const Icon = stepIcons[idx];
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={active}
              className="min-h-[30px] flex-1 border-b-2 px-1 py-1 text-[14px] font-semibold transition-colors"
              style={{
                color: active ? POINT_ORANGE : t.textSecondary,
                borderBottomColor: active ? POINT_ORANGE : 'transparent',
              }}
              onClick={() => onProcessTab(step.id as 'summary' | 'equipment' | 'residual')}
              title={step.label}
            >
              <span className="flex flex-col items-center gap-0.5">
                <Icon className="h-3 w-3" strokeWidth={2.2} />
                <span className="truncate">{step.short}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type SummaryProps = {
  locale: 'ko' | 'en';
  t: PanelTokens;
  FT: AnalysisFrameTokens;
  hairline: string;
  rows: LightHazardRow[];
  openId: string | null;
  onToggle: (id: string) => void;
  onHazardViewClick?: (itemId: string, category: 'collision' | 'pinch') => void;
  viewInScene: string;
  snapshotCaption: string;
  frameHazardZone: string;
  unitCount: (n: number) => string;
  hazardTotal: number;
};

export function AnalysisFigmaDraftSummary({
  locale,
  t,
  FT,
  hairline,
  rows,
  openId,
  onToggle,
  onHazardViewClick,
  viewInScene,
  snapshotCaption,
  frameHazardZone,
  unitCount,
  hazardTotal,
}: SummaryProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3 pb-1">
      <p className="text-[12px] leading-relaxed" style={{ color: FT.textSecondary }}>
        {snapshotCaption}
      </p>

      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
            {frameHazardZone}
          </span>
          <span className="text-[12px] tabular-nums" style={{ color: t.textSecondary }}>
            {unitCount(hazardTotal)}
          </span>
        </div>
        <div role="list">
          {rows.map((row) => {
            const open = openId === row.id;
            const b = frameBadge(row.tone, FT);
            const name = locale === 'en' ? row.nameEn : row.nameKo;
            const sub = locale === 'en' ? row.subEn : row.subKo;
            const body = locale === 'en' ? row.bodyEn : row.bodyKo;
            const refLine = locale === 'en' ? row.refEn : row.refKo;
            const primary = row.primaryKo ? (locale === 'en' ? row.primaryEn! : row.primaryKo) : undefined;
            const secondary = row.secondaryKo && (locale === 'en' ? row.secondaryEn! : row.secondaryKo);
            return (
              <div key={row.id} className="border-b last:border-b-0" style={{ borderColor: hairline }} role="listitem">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 py-2 text-left"
                  style={{ color: t.textPrimary }}
                  aria-expanded={open}
                  onClick={() => onToggle(row.id)}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-medium leading-none" style={{ background: b.bg, color: b.fg }}>
                    {b.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-medium leading-snug">{name}</span>
                    <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: t.textSecondary }}>
                      {sub}
                    </span>
                  </span>
                  {row.showView3d ? (
                    <span
                      role="presentation"
                      onClick={(e) => e.stopPropagation()}
                      className="contents"
                    >
                      <button
                        type="button"
                        className="shrink-0 rounded border px-1.5 py-0.5 text-[12px] font-medium"
                        style={{ borderColor: FT.viewBtnBorder, color: FT.viewBtnText, background: FT.bgPanel }}
                        onClick={() => onHazardViewClick?.('c1', row.tone === 'warn' && row.id === 'hz2' ? 'pinch' : 'collision')}
                      >
                        {viewInScene}
                      </button>
                    </span>
                  ) : null}
                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: FT.textTertiary }} aria-hidden />
                </button>
                {open ? (
                  <div className="pb-2 pl-6 pr-1" style={{ color: FT.textSecondary }}>
                    <p className="text-[12px] leading-relaxed">{body}</p>
                    <p className="mt-1 text-[12px]" style={{ color: FT.textTertiary }}>
                      {refLine}
                    </p>
                    {(primary || secondary) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {primary ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[12px] font-medium"
                            style={{
                              borderColor: row.primaryIsSuggest ? FT.viewBtnBorder : FT.border,
                              background: row.primaryIsSuggest ? FT.bgInfoTint : FT.bgPanel,
                              color: row.primaryIsSuggest ? FT.viewBtnText : FT.textPrimary,
                            }}
                          >
                            {primary}
                            {row.primaryIsSuggest ? <ExternalLink className="h-3 w-3 opacity-70" aria-hidden /> : null}
                          </button>
                        ) : null}
                        {secondary ? (
                          <button
                            type="button"
                            className="rounded border px-2 py-1 text-[12px] font-medium"
                            style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                          >
                            {secondary}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type RegProps = {
  locale: 'ko' | 'en';
  t: PanelTokens;
  FT: AnalysisFrameTokens;
  hairline: string;
  rows: LightRegRow[];
  openId: string | null;
  onToggle: (id: string) => void;
  onHazardViewClick?: (itemId: string, category: 'collision' | 'pinch') => void;
  viewInScene: string;
  frameRegulations: string;
  unitCount: (n: number) => string;
  regTotal: number;
};

export function AnalysisFigmaDraftRegulations({
  locale,
  t,
  FT,
  hairline,
  rows,
  openId,
  onToggle,
  onHazardViewClick,
  viewInScene,
  frameRegulations,
  unitCount,
  regTotal,
}: RegProps) {
  return (
    <div className="mt-4 flex min-w-0 flex-col gap-2 border-t pt-3" style={{ borderColor: hairline }}>
      <div className="mb-0.5 flex items-center justify-between gap-2">
        <span className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
          {frameRegulations}
        </span>
        <span className="text-[12px] tabular-nums" style={{ color: t.textSecondary }}>
          {unitCount(regTotal)}
        </span>
      </div>
      <div role="list">
        {rows.map((row) => {
          const open = openId === row.id;
          const b = frameBadge(row.tone, FT);
          const name = locale === 'en' ? row.nameEn : row.nameKo;
          const sub = locale === 'en' ? row.subEn : row.subKo;
          const body = locale === 'en' ? row.bodyEn : row.bodyKo;
          const refLine = locale === 'en' ? row.refEn : row.refKo;
          const primary = row.primaryKo ? (locale === 'en' ? row.primaryEn! : row.primaryKo) : undefined;
          const secondary = row.secondaryKo && (locale === 'en' ? row.secondaryEn! : row.secondaryKo);
          const single = row.singleKo && (locale === 'en' ? row.singleEn! : row.singleKo);
          return (
            <div key={row.id} className="border-b last:border-b-0" style={{ borderColor: hairline }} role="listitem">
              <button
                type="button"
                className="flex w-full items-center gap-2 py-2 text-left"
                style={{ color: t.textPrimary }}
                aria-expanded={open}
                onClick={() => onToggle(row.id)}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-medium leading-none" style={{ background: b.bg, color: b.fg }}>
                  {b.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-medium leading-snug">{name}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: t.textSecondary }}>
                    {sub}
                  </span>
                </span>
                {row.showView3d ? (
                  <span role="presentation" onClick={(e) => e.stopPropagation()} className="contents">
                    <button
                      type="button"
                      className="shrink-0 rounded border px-1.5 py-0.5 text-[12px] font-medium"
                      style={{ borderColor: FT.viewBtnBorder, color: FT.viewBtnText, background: FT.bgPanel }}
                      onClick={() => onHazardViewClick?.('c1', 'collision')}
                    >
                      {viewInScene}
                    </button>
                  </span>
                ) : null}
                <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: FT.textTertiary }} aria-hidden />
              </button>
              {open ? (
                <div className="pb-2 pl-6 pr-1" style={{ color: FT.textSecondary }}>
                  <p className="text-[12px] leading-relaxed">{body}</p>
                  <p className="mt-1 text-[12px]" style={{ color: FT.textTertiary }}>
                    {refLine}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {single ? (
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-[12px] font-medium"
                        style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                      >
                        {single}
                      </button>
                    ) : null}
                    {primary ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[12px] font-medium"
                        style={{
                          borderColor: row.primaryIsSuggest ? FT.viewBtnBorder : FT.border,
                          background: row.primaryIsSuggest ? FT.bgInfoTint : FT.bgPanel,
                          color: row.primaryIsSuggest ? FT.viewBtnText : FT.textPrimary,
                        }}
                      >
                        {primary}
                        {row.primaryIsSuggest ? <ExternalLink className="h-3 w-3 opacity-70" aria-hidden /> : null}
                      </button>
                    ) : null}
                    {secondary ? (
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-[12px] font-medium"
                        style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                      >
                        {secondary}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
