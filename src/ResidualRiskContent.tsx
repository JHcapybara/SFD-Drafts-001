import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER } from './analysisPanelSemantics';

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

  return (
    <>
      {presentation === 'flow' ? (
        <section className="relative pb-1">
          <div
            className="rounded-xl border overflow-hidden border-t-[3px]"
            style={{
              borderColor: t.inputBorder,
              borderTopColor: accent === 'brand' ? POINT_ORANGE : undefined,
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.72)',
            }}
          >
            <div
              className="px-4 py-3 text-base font-bold border-b"
              style={{
                borderColor: t.inputBorder,
                background:
                  accent === 'brand'
                    ? isDark
                      ? 'rgba(255,142,43,0.12)'
                      : accentRgba(POINT_ORANGE, 0.1)
                    : t.sectionHeaderBg,
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
