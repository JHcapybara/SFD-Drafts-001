import { ChevronRight } from 'lucide-react';
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
  onFenceProposalClick?: (proposalId: 'height' | 'opening') => void;
};

function strings(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      fenceName: (n: number) => `Fence ${n}`,
      insufficientSafetyDistance: 'Insufficient safety distance',
      analysisResult: 'Analysis result',
      insufficientInstallHeight: 'Insufficient installation height',
      completedAtLabel: 'Analysis completion time',
      suggestionTitle: 'Proposal for changing conditions',
      suggestions: [
        { id: 'height' as const, label: 'Change fence installation height' },
        { id: 'opening' as const, label: 'Add blocking for openings other than the fence' },
      ],
      specResultTitle: 'Installation specification results',
      adequateHeightMm: 'Appropriate installation height (mm)',
      versusCurrent: (deltaMm: string) => `(+${deltaMm} mm vs. current)`,
      currentInstallDistance: 'Current installation distance',
      fence2Summary: 'Installation requirements met.',
    };
  }
  return {
    fenceName: (n: number) => `펜스 ${n}`,
    insufficientSafetyDistance: '안전거리 불충분',
    analysisResult: '분석 결과',
    insufficientInstallHeight: '설치 높이 불충분',
    completedAtLabel: '분석 완료 시간',
    suggestionTitle: '조건 변경 방법 제안',
    suggestions: [
      { id: 'height' as const, label: '펜스 설치 높이 변경' },
      { id: 'opening' as const, label: '펜스 외 개구부 차단 설치물 추가' },
    ],
    specResultTitle: '설치 규격 결과',
    adequateHeightMm: '적정 설치높이(mm)',
    versusCurrent: (deltaMm: string) => `(현재 대비 +${deltaMm}mm)`,
    currentInstallDistance: '현재 설치 거리',
    fence2Summary: '설치 규격 충족.',
  };
}

const COMPLETED_AT = '2026.01.01 15:35:32';
const ADEQUATE_MM = '1800';
const DELTA_MM = '700';
const CURRENT_MM = '1100';

export function FenceAnalysisContent({ locale, isDark, tokens: t, onFenceProposalClick }: Props) {
  const L = strings(locale);
  const surfaceMuted = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
  const surfaceCard = isDark ? 'rgba(255,255,255,0.04)' : '#f4f4f5';

  const badgeHeaderWarn = (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
      style={{
        background: ANALYSIS_WARN.bg,
        color: ANALYSIS_WARN.textStrong,
        border: `1px solid ${ANALYSIS_WARN.border}`,
      }}
    >
      {L.insufficientSafetyDistance}
    </span>
  );

  const badgeHeightWarn = (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold shrink-0"
      style={{
        background: ANALYSIS_WARN.bg,
        color: ANALYSIS_WARN.textStrong,
        border: `1px solid ${ANALYSIS_WARN.border}`,
      }}
    >
      {L.insufficientInstallHeight}
    </span>
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-xl border overflow-hidden border-l-4"
        style={{ borderColor: t.inputBorder, borderLeftColor: ANALYSIS_WARN.border, background: t.inputBg }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: t.inputBorder, background: ANALYSIS_WARN.bg }}>
          <span className="flex-1 text-base font-bold" style={{ color: t.textPrimary }}>
            {L.fenceName(1)}
          </span>
          {badgeHeaderWarn}
        </div>
        <div className="px-4 py-4 space-y-4" style={{ background: surfaceCard }}>
          <div className="rounded-lg border px-3 py-3 space-y-2" style={{ borderColor: t.inputBorder, background: t.inputBg }}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <span className="text-sm font-bold" style={{ color: t.textPrimary }}>
                {L.analysisResult}
              </span>
              {badgeHeightWarn}
            </div>
            <p className="text-xs text-right w-full" style={{ color: t.textSecondary }}>
              {L.completedAtLabel} {COMPLETED_AT}
            </p>
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: ANALYSIS_WARN.textStrong }}>
              {L.suggestionTitle}
            </p>
            <ul className="flex flex-col gap-2">
              {L.suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors"
                    style={{ borderColor: t.inputBorder, background: surfaceMuted }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? 'rgba(245,158,11,0.12)' : 'rgba(255,251,235,0.95)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = surfaceMuted;
                    }}
                    onClick={() => onFenceProposalClick?.(s.id)}
                  >
                    <span className="leading-snug" style={{ color: t.textPrimary }}>
                      {s.label}
                    </span>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-45" style={{ color: t.textSecondary }} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold mb-2" style={{ color: t.textPrimary }}>
              {L.specResultTitle}
            </p>
            <div
              className="rounded-lg border px-3 py-3 space-y-2 border-l-4"
              style={{ borderColor: t.inputBorder, borderLeftColor: ANALYSIS_DANGER.border, background: t.inputBg }}
            >
              <p className="text-sm leading-snug" style={{ color: t.textSecondary }}>
                {L.adequateHeightMm} <strong style={{ color: t.textPrimary }}>{ADEQUATE_MM}mm</strong>{' '}
                {L.versusCurrent(DELTA_MM)}
              </p>
              <p className="text-sm" style={{ color: t.textSecondary }}>
                {L.currentInstallDistance} : {CURRENT_MM}mm
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border px-4 py-3 flex flex-col gap-2 border-l-4"
        style={{
          borderColor: t.inputBorder,
          borderLeftColor: ANALYSIS_SAFE.border,
          background: isDark ? 'rgba(34,197,94,0.1)' : ANALYSIS_SAFE.bg,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold" style={{ color: t.textPrimary }}>
            {L.fenceName(2)}
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
          {L.fence2Summary}
        </p>
      </div>
    </div>
  );
}
