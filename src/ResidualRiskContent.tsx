import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER } from './analysisPanelSemantics';
import { ANALYSIS_FRAME_LIGHT } from './analysisPanelFrameRef';

type PanelTokens = {
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  inputBg: string;
  tabBarBg: string;
  sectionHeaderBg: string;
};

type LocationRow = { id: string; labelKo: string; labelEn: string; detailKind?: 'fenceTop' };

type RiskItem = {
  id: string;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  locations: LocationRow[];
};

type Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  totalCount: number;
  /** 위치 [보기] — fenceTop 외 씬 포커스 등 */
  onResidualLocationView?: (riskItemId: string, locationId: string) => void;
  /** flow: 펼침 없이 스크롤로 전체 노출 (분석 패널 기본) */
  presentation?: 'accordion' | 'flow';
  /** brand: 메인 오렌지 톤 / risk: 적색 톤 */
  accent?: 'risk' | 'brand';
};

function strings(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      riskTag: '(Risk)',
      view: 'View',
      confirmDone: 'Done',
      residualIconPlaceholder: 'Residual risk icon',
      fenceTopModalTitle: 'Upper fence area',
      fenceTopModalSubtitle: 'Possibility of worker entry',
      fenceTopModalBody:
        'At a fence height of 1,800 mm, normal reach is not possible, but the top may still be reachable using aids such as ladders or boxes. This residual risk remains.',
      recommendedActions: 'Recommended actions',
      fenceTopBullets: [
        '· Establish rules prohibiting introduction of aids into the work area',
        '· Attach warning signs at the top of the fence',
        '· Keep records of worker safety training completion',
      ],
      lightBadgeOk: 'Within acceptable level',
      lightModalTitle: 'Residual risk area details',
      lightModalSub: 'Risks remaining after protective measures — Robot Cell',
      lightCtxCell: 'Target cell',
      lightCtxMeasures: 'Protective measures',
      lightCtxMeasuresVal: 'Fence · light curtain',
      lightCtxResidualNum: 'Residual risks',
      lightCtxCri: 'Highest CRI',
      lightDefTitle: 'What is residual risk?',
      lightDefBody:
        'Residual risk is risk that remains after protective measures. It should be reduced as far as possible and verified to be acceptable for the intended use.',
      lightInstance: 'Residual risk instances',
      lightRiskType: 'Risk type',
      lightSeverity: 'Severity',
      lightProbability: 'Probability',
      lightVerdictTitle: 'Acceptable level',
      lightVerdictSub: 'Record the assessment outcome in the risk assessment report.',
      lightRef: 'Reference',
    };
  }
  return {
    riskTag: '(위험)',
    view: '보기',
    confirmDone: '확인완료',
    residualIconPlaceholder: '잔존 위험 아이콘',
    fenceTopModalTitle: '펜스 상단부',
    fenceTopModalSubtitle: '작업자 진입 가능성',
    fenceTopModalBody:
      '펜스 높이 1,800mm로 일반 도달은 불가하나, 보조 수단(사다리, 박스 등) 사용 시 상단부 도달 가능성이 잔존합니다.',
    recommendedActions: '권고조치',
    fenceTopBullets: [
      '· 작업구역 내 보조 수단 반입 금지 규정 수립',
      '· 펜스 상단부 경고 표지 부착',
      '· 작업자 안전교육 이수 기록 관리',
    ],
    lightBadgeOk: '허용 수준 이내',
    lightModalTitle: '잔존 위험영역 상세',
    lightModalSub: '방호 조치 후 남아있는 위험 — Robot Cell',
    lightCtxCell: '대상 셀',
    lightCtxMeasures: '방호 조치 수',
    lightCtxMeasuresVal: '펜스 · 라이트 커튼',
    lightCtxResidualNum: '잔존 위험 수',
    lightCtxCri: '최고 CRI',
    lightDefTitle: '잔존 위험이란?',
    lightDefBody:
      '잔존 위험은 방호 조치를 적용한 뒤에도 남아 있는 위험을 말합니다. 합리적으로 달성 가능한 한까지 감소시키고, 용도에 맞게 수용 가능한지 확인합니다.',
    lightInstance: '잔존 위험 인스턴스',
    lightRiskType: '위험 유형',
    lightSeverity: '중대성',
    lightProbability: '발생 가능성',
    lightVerdictTitle: '수용 가능한 수준',
    lightVerdictSub: '위험성 평가 보고서에 결과를 기록하세요.',
    lightRef: '참조',
  };
}

const BASE_RISKS: RiskItem[] = [
  {
    id: 'rr1',
    titleKo: '비상정지 버튼 시인성',
    titleEn: 'E-stop button visibility',
    descriptionKo: '작업자 진입 시 충돌 위험이 예상됩니다. 충돌 위험 감소를 위해 조치가 필요합니다.',
    descriptionEn:
      'Collision risk is expected when workers enter. Action is needed to reduce collision risk.',
    locations: [
      {
        id: 'loc-near',
        labelKo: '{위험영역 주변 설비} 주변부 1곳',
        labelEn: '{Hazard-area adjacent equipment} — 1 vicinity point',
      },
      {
        id: 'fence-top',
        labelKo: '펜스 상단부',
        labelEn: 'Upper fence area',
        detailKind: 'fenceTop',
      },
    ],
  },
  {
    id: 'rr2',
    titleKo: '안전 PLC 무결성',
    titleEn: 'Safety PLC integrity',
    descriptionKo: '제어계 무결성 검토가 필요합니다.',
    descriptionEn: 'Control-system integrity should be reviewed.',
    locations: [],
  },
];

const MOCK_ITEMS: RiskItem[] = [
  ...BASE_RISKS,
  ...Array.from({ length: 8 }, (_, i) => {
    const n = i + 3;
    return {
      id: `rr${n}`,
      titleKo: `잔존 위험 항목 ${n}`,
      titleEn: `Residual risk item ${n}`,
      descriptionKo: '상세 내용은 이후 단계에서 연결됩니다.',
      descriptionEn: 'Details will be connected in a later step.',
      locations: [] as LocationRow[],
    };
  }),
];

export function ResidualRiskContent({
  locale,
  isDark,
  tokens: t,
  totalCount,
  onResidualLocationView,
  presentation = 'accordion',
  accent = 'risk',
}: Props) {
  const L = strings(locale);
  const [openId, setOpenId] = useState<string | null>('rr1');
  const [flowLightOpenId, setFlowLightOpenId] = useState<string | null>('rr1');
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [fenceTopModalOpen, setFenceTopModalOpen] = useState(false);

  const surfaceCard = isDark ? 'rgba(255,255,255,0.04)' : '#f4f4f5';

  const sectionTitle = (n: number) =>
    locale === 'en' ? `Residual risk (${n})` : `잔존 위험성(${n})`;

  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  const handleView = (riskId: string, loc: LocationRow) => {
    if (loc.detailKind === 'fenceTop') {
      setFenceTopModalOpen(true);
      return;
    }
    onResidualLocationView?.(riskId, loc.id);
  };

  const renderRiskCard = (item: RiskItem, idx: number, flow: boolean) => {
    const title = locale === 'en' ? item.titleEn : item.titleKo;
    const desc = locale === 'en' ? item.descriptionEn : item.descriptionKo;
    const isDone = confirmed[item.id];
    const compact = flow && idx >= 2;
    const brand = accent === 'brand';
    const leftColor = brand ? accentRgba(POINT_ORANGE, 0.75) : ANALYSIS_DANGER.border;
    const bgCard = brand
      ? isDark
        ? 'rgba(255,142,43,0.1)'
        : 'rgba(255,251,245,0.95)'
      : isDark
        ? 'rgba(239,68,68,0.07)'
        : 'rgba(254,242,242,0.75)';
    const titleColor = brand ? POINT_ORANGE : ANALYSIS_DANGER.textStrong;
    const tagClass = brand ? 'text-[#c2410c]/90' : 'text-red-600/90';

    return (
      <div
        key={item.id}
        className={`rounded-xl border overflow-hidden border-l-4 ${compact ? 'px-3 py-3' : 'p-4'}`}
        style={{
          borderColor: t.inputBorder,
          borderLeftColor: leftColor,
          background: bgCard,
        }}
      >
        <p className={`font-bold leading-snug ${compact ? 'text-sm' : 'text-base'}`} style={{ color: titleColor }}>
          <span className={`${tagClass} text-sm font-semibold`}>{L.riskTag}</span> {title}
        </p>
        <p className={`mt-2 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`} style={{ color: t.textSecondary }}>
          {desc}
        </p>

        {!compact && item.locations.length > 0 && (
          <ul className="flex flex-col gap-2 mt-3">
            {item.locations.map((loc) => {
              const locLabel = locale === 'en' ? loc.labelEn : loc.labelKo;
              return (
                <li
                  key={loc.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:opacity-95"
                  style={{ borderColor: t.inputBorder, background: t.inputBg }}
                >
                  <div
                    className="h-9 w-9 shrink-0 rounded-full"
                    style={{ background: isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.1)' }}
                    aria-hidden
                  />
                  <span className="flex-1 min-w-0 text-sm font-medium leading-snug" style={{ color: t.textPrimary }}>
                    {locLabel}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-sm font-bold px-3 py-1.5 rounded-lg border"
                    style={{
                      borderColor: accentRgba(POINT_ORANGE, 0.4),
                      color: POINT_ORANGE,
                      background: isDark ? 'rgba(255,142,43,0.12)' : 'rgba(255,142,43,0.1)',
                    }}
                    onClick={() => handleView(item.id, loc)}
                  >
                    {L.view}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex justify-start mt-3">
          <button
            type="button"
            disabled={isDone}
            className="text-sm font-bold px-4 py-2 rounded-lg border transition-opacity"
            style={{
              borderColor: t.textPrimary,
              color: t.textPrimary,
              background: isDone ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)') : t.inputBg,
              opacity: isDone ? 0.55 : 1,
            }}
            onClick={() => setConfirmed((c) => ({ ...c, [item.id]: true }))}
          >
            {L.confirmDone}
          </button>
        </div>
      </div>
    );
  };

  const FL = ANALYSIS_FRAME_LIGHT;
  const criForItem = (id: string) => {
    const h = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.round((0.25 + (h % 47) / 100) * 100) / 100;
  };

  return (
    <>
      {presentation === 'flow' && !isDark ? (
        <section className="relative pb-1">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: FL.border, background: FL.bgPanel }}
          >
            <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: FL.borderSubtle }}>
              <div className="mb-2">
                <span
                  className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: FL.badgePassBg, color: FL.badgePassFg }}
                >
                  {L.lightBadgeOk}
                </span>
              </div>
              <h3 className="text-base font-medium leading-tight" style={{ color: FL.textPrimary }}>
                {L.lightModalTitle}
              </h3>
              <p className="text-xs mt-1" style={{ color: FL.textTertiary }}>
                {L.lightModalSub}
              </p>
            </div>

            <div className="flex border-b" style={{ borderColor: FL.borderSubtle }}>
              {[
                { lab: L.lightCtxCell, val: locale === 'en' ? 'Robot Cell A-3' : 'Robot Cell A-3' },
                { lab: L.lightCtxMeasures, val: L.lightCtxMeasuresVal },
                {
                  lab: L.lightCtxResidualNum,
                  val: locale === 'en' ? String(totalCount) : `${totalCount}곳`,
                },
                { lab: L.lightCtxCri, val: String(criForItem('rr-summary')) },
              ].map((cell, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-0 py-2.5 px-3 flex flex-col gap-0.5 border-r last:border-r-0"
                  style={{ borderColor: FL.borderSubtle }}
                >
                  <span className="text-[10px]" style={{ color: FL.textTertiary }}>
                    {cell.lab}
                  </span>
                  <span className="text-xs font-medium leading-snug truncate" style={{ color: FL.textPrimary }}>
                    {cell.val}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-4 py-4 flex flex-col gap-4">
              <div
                className="rounded-[10px] py-3.5 px-4 border-l-[3px]"
                style={{
                  background: FL.defBoxBg,
                  borderLeftColor: FL.defBoxBorderLeft,
                }}
              >
                <p className="text-[11px] font-medium mb-1" style={{ color: FL.textSecondary }}>
                  {L.lightDefTitle}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: FL.textSecondary }}>
                  {L.lightDefBody}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium mb-2" style={{ color: FL.textPrimary }}>
                  {L.lightInstance}
                </p>
                <div className="flex flex-col gap-2">
                  {MOCK_ITEMS.map((item, idx) => {
                    const open = flowLightOpenId === item.id;
                    const title = locale === 'en' ? item.titleEn : item.titleKo;
                    const desc = locale === 'en' ? item.descriptionEn : item.descriptionKo;
                    const cri = criForItem(item.id);
                    const criPct = Math.min(100, cri * 100);
                    const barColor = cri < 0.45 ? FL.dotPass : cri < 0.65 ? FL.dotWarn : FL.dotFail;
                    const iconBg = cri < 0.45 ? FL.badgePassBg : cri < 0.65 ? FL.badgeWarnBg : FL.badgeFailBg;
                    const iconFg = cri < 0.45 ? FL.badgePassFg : cri < 0.65 ? FL.badgeWarnFg : FL.badgeFailFg;
                    return (
                      <div
                        key={item.id}
                        className="rounded-[10px] border overflow-hidden"
                        style={{ borderColor: FL.border }}
                      >
                        <button
                          type="button"
                          className="w-full flex items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-[#fafafa]"
                          onClick={() => setFlowLightOpenId((cur) => (cur === item.id ? null : item.id))}
                        >
                          <span
                            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-medium"
                            style={{ background: iconBg, color: iconFg }}
                            aria-hidden
                          >
                            {idx + 1}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-xs font-medium leading-snug" style={{ color: FL.textPrimary }}>
                              {title}
                            </span>
                            <span className="block text-[11px] mt-0.5 line-clamp-2" style={{ color: FL.textTertiary }}>
                              {desc}
                            </span>
                          </span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            <span className="w-[60px] h-1.5 rounded-full overflow-hidden" style={{ background: FL.criBarTrack }}>
                              <span className="h-full rounded-full block" style={{ width: `${criPct}%`, background: barColor }} />
                            </span>
                            <span className="text-[11px] font-medium tabular-nums w-8 text-right" style={{ color: FL.textSecondary }}>
                              {cri.toFixed(2)}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                              style={{ color: FL.textTertiary }}
                              aria-hidden
                            />
                          </span>
                        </button>
                        {open && (
                          <div className="border-t px-3.5 py-3" style={{ borderColor: FL.borderSubtle, background: '#fafafa' }}>
                            <div className="flex gap-2 mb-2">
                              {[
                                { k: L.lightRiskType, v: locale === 'en' ? 'Operational' : '운용' },
                                { k: L.lightSeverity, v: locale === 'en' ? 'S2' : 'S2' },
                                { k: L.lightProbability, v: locale === 'en' ? 'P1' : 'P1' },
                              ].map((cell) => (
                                <div key={cell.k} className="flex-1 rounded-lg border px-2.5 py-2" style={{ borderColor: FL.borderSubtle, background: FL.bgPanel }}>
                                  <p className="text-[10px] mb-0.5" style={{ color: FL.textTertiary }}>
                                    {cell.k}
                                  </p>
                                  <p className="text-xs font-medium" style={{ color: FL.textPrimary }}>
                                    {cell.v}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <p className="text-[11px] leading-relaxed" style={{ color: FL.textSecondary }}>
                              {desc}
                            </p>
                            {item.locations.length > 0 && (
                              <div
                                className="mt-2 rounded-lg border px-2.5 py-2 text-[11px] leading-relaxed"
                                style={{ borderColor: FL.border, background: FL.bgPanel, color: FL.textPrimary }}
                              >
                                <p className="text-[10px] mb-1" style={{ color: FL.textTertiary }}>
                                  {L.recommendedActions}
                                </p>
                                <ul className="space-y-1" style={{ color: FL.textSecondary }}>
                                  {item.locations.map((loc) => (
                                    <li key={loc.id} className="flex items-center justify-between gap-2">
                                      <span className="min-w-0 flex-1">{locale === 'en' ? loc.labelEn : loc.labelKo}</span>
                                      <button
                                        type="button"
                                        className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border"
                                        style={{ borderColor: FL.viewBtnBorder, color: FL.viewBtnText }}
                                        onClick={() => handleView(item.id, loc)}
                                      >
                                        {L.view}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <p className="text-[10px] mt-2" style={{ color: FL.textTertiary }}>
                              {L.lightRef}: ISO 12100:2010
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="flex items-start gap-3 rounded-[10px] border px-3.5 py-3.5"
                style={{
                  background: FL.badgePassBg,
                  borderColor: 'rgba(99,153,34,0.2)',
                }}
              >
                <span
                  className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-base border"
                  style={{ background: FL.bgPanel, borderColor: 'rgba(99,153,34,0.3)' }}
                  aria-hidden
                >
                  ✓
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium" style={{ color: FL.badgePassFg }}>
                    {L.lightVerdictTitle}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: '#3b6d11' }}>
                    {L.lightVerdictSub}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : presentation === 'flow' ? (
        <section className="relative pb-1">
          <div
            className="rounded-xl border overflow-hidden border-t-[3px]"
            style={{
              borderColor: t.inputBorder,
              borderTopColor: accent === 'brand' ? POINT_ORANGE : undefined,
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div
              className="px-4 py-3 text-base font-bold border-b"
              style={{
                borderColor: t.inputBorder,
                background: accent === 'brand' ? 'rgba(255,142,43,0.12)' : t.sectionHeaderBg,
                color: accent === 'brand' ? POINT_ORANGE : t.textPrimary,
              }}
            >
              {sectionTitle(totalCount)}
            </div>
            <div className="p-4 flex flex-col gap-3">{MOCK_ITEMS.map((item, idx) => renderRiskCard(item, idx, true))}</div>
          </div>
        </section>
      ) : (
        <section className="relative mt-1 pb-1">
          <div
            className="rounded-[10px] border pt-3.5 px-2.5 pb-2"
            style={{ borderColor: t.inputBorder, background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)' }}
          >
            <div
              className="absolute left-3 -top-[11px] z-[1] px-2 py-0.5 text-[10px] font-bold rounded-t-md border border-b-0 max-w-[calc(100%-24px)] truncate"
              style={{
                background: t.tabBarBg,
                borderColor: t.inputBorder,
                color: t.textPrimary,
              }}
            >
              {sectionTitle(totalCount)}
            </div>

            <div className="flex flex-col gap-0">
              {MOCK_ITEMS.map((item, idx) => {
                const open = openId === item.id;
                const title = locale === 'en' ? item.titleEn : item.titleKo;
                const desc = locale === 'en' ? item.descriptionEn : item.descriptionKo;
                const isDone = confirmed[item.id];

                return (
                  <div
                    key={item.id}
                    className={idx < MOCK_ITEMS.length - 1 ? 'border-b' : ''}
                    style={{ borderColor: t.inputBorder }}
                  >
                    <button
                      type="button"
                      className="w-full flex items-start gap-2 py-2 text-left"
                      onClick={() => toggle(item.id)}
                    >
                      <span className="flex-1 min-w-0 text-[10px] font-bold leading-snug" style={{ color: t.textPrimary }}>
                        <span style={{ color: t.textSecondary }}>{L.riskTag}</span> {title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 mt-0.5 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
                        style={{ color: t.textSecondary }}
                        aria-hidden
                      />
                    </button>

                    {open && (
                      <div className="pb-2 flex flex-col gap-2">
                        <div
                          className="rounded-[8px] border px-2 py-2 space-y-2"
                          style={{ borderColor: t.inputBorder, background: surfaceCard }}
                        >
                          <p className="text-[9px] leading-[15px]" style={{ color: t.textSecondary }}>
                            {desc}
                          </p>

                          {item.locations.length > 0 && (
                            <ul className="flex flex-col gap-1.5">
                              {item.locations.map((loc) => {
                                const locLabel = locale === 'en' ? loc.labelEn : loc.labelKo;
                                return (
                                  <li
                                    key={loc.id}
                                    className="flex items-center gap-2 rounded-[8px] border px-2 py-1.5"
                                    style={{ borderColor: t.inputBorder, background: t.inputBg }}
                                  >
                                    <div
                                      className="h-6 w-6 shrink-0 rounded-full"
                                      style={{ background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)' }}
                                      aria-hidden
                                    />
                                    <span className="flex-1 min-w-0 text-[10px] font-medium leading-snug" style={{ color: t.textPrimary }}>
                                      {locLabel}
                                    </span>
                                    <button
                                      type="button"
                                      className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md border transition-colors hover:opacity-90"
                                      style={{
                                        borderColor: accentRgba(POINT_ORANGE, 0.4),
                                        color: POINT_ORANGE,
                                        background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.08)',
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleView(item.id, loc);
                                      }}
                                    >
                                      {L.view}
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}

                          <div className="flex justify-start pt-0.5">
                            <button
                              type="button"
                              disabled={isDone}
                              className="text-[9px] font-bold px-2.5 py-1 rounded-md border transition-opacity"
                              style={{
                                borderColor: t.textPrimary,
                                color: t.textPrimary,
                                background: isDone ? (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)') : t.inputBg,
                                opacity: isDone ? 0.55 : 1,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmed((c) => ({ ...c, [item.id]: true }));
                              }}
                            >
                              {L.confirmDone}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {fenceTopModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.45)' }}
          role="presentation"
          onClick={() => setFenceTopModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-[340px] rounded-[10px] border shadow-lg flex flex-col max-h-[min(90vh,520px)]"
            style={{ borderColor: t.inputBorder, background: t.tabBarBg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 pt-3 pb-2 border-b shrink-0" style={{ borderColor: t.inputBorder }}>
              <div className="flex items-start gap-2">
                <div
                  className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-[8px] text-center leading-tight px-0.5"
                  style={{
                    border: `1px dashed ${t.inputBorder}`,
                    color: t.textSecondary,
                    background: t.inputBg,
                  }}
                >
                  ({L.residualIconPlaceholder})
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold" style={{ color: t.textPrimary }}>
                    {L.fenceTopModalTitle}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: t.textSecondary }}>
                    {L.fenceTopModalSubtitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-3 py-3 overflow-y-auto sfd-scroll flex-1 min-h-0 flex flex-col gap-3">
              <div
                className="rounded-[8px] border px-2.5 py-2 text-[9px] leading-[15px]"
                style={{ borderColor: t.inputBorder, background: t.inputBg, color: t.textSecondary }}
              >
                {L.fenceTopModalBody}
              </div>
              <div>
                <p className="text-[10px] font-bold mb-1.5" style={{ color: t.textPrimary }}>
                  {L.recommendedActions}
                </p>
                <ul className="space-y-1 text-[9px] leading-snug" style={{ color: t.textSecondary }}>
                  {L.fenceTopBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-3 py-2.5 border-t flex justify-end shrink-0" style={{ borderColor: t.inputBorder }}>
              <button
                type="button"
                className="text-[9px] font-bold px-3 py-1.5 rounded-md border"
                style={{
                  borderColor: t.textPrimary,
                  color: t.textPrimary,
                  background: t.inputBg,
                }}
                onClick={() => setFenceTopModalOpen(false)}
              >
                {L.confirmDone}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
