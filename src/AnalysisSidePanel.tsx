import { useState } from 'react';
import { AlertTriangle, ChevronDown, ClipboardList, Cpu, Shield } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER, ANALYSIS_SAFE, ANALYSIS_WARN } from './analysisPanelSemantics';
import { RobotPflAnalysisContent } from './RobotPflAnalysisContent';
import { SensorAnalysisContent } from './SensorAnalysisContent';
import { FenceAnalysisContent } from './FenceAnalysisContent';
import { ResidualRiskContent } from './ResidualRiskContent';

export type AnalysisEquipmentTab = 'robot' | 'sensor' | 'fence';

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
  onHazardViewClick?: (itemId: string, category: 'collision' | 'pinch') => void;
  onRobotPflViewClick?: (id: string, kind: 'interval' | 'collab') => void;
  onSensorCalcDetailViewClick?: () => void;
  onFenceProposalClick?: (proposalId: 'height' | 'opening') => void;
  onResidualLocationView?: (riskItemId: string, locationId: string) => void;
};

type ProcessTab = 'summary' | 'equipment' | 'residual';

function copy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      title: 'Cell safety diagnosis',
      cellFilter: 'Robot cell filter',
      cellValue: 'Robot Cell',
      conditionsChanged: 'Analysis conditions changed',
      flowLead: 'Follow the three steps below. Colors show priority: red = address first, then review, then OK.',
      tabSummary: 'Diagnosis & hazards',
      tabEquipment: 'PFL · Sensor · Fence',
      tabResidual: 'Residual risk',
      step1Short: 'Results & risk',
      step2Short: 'Devices',
      step3Short: 'Residual',
      equipmentLead: 'Per-device analysis. Switch tabs to compare PFL, sensors, and fences.',
      hazardCallout:
        'Collision and pinch hazards are present. Review the zones below and apply guarding or procedural controls.',
      summaryTitle: 'Diagnosis snapshot',
      snapshotCaption: 'Key counts at a glance. Status reflects automated checks for this cell.',
      cardHazard: 'Hazardous areas',
      cardRobot: 'Robot (PFL)',
      cardSensorFence: 'Sensor / fence',
      cardResidual: 'Residual risk',
      unitCount: (n: number) => `${n}`,
      hazardSection: (n: number) => `Hazardous areas (${n})`,
      collisionHazard: 'Collision hazard',
      pinchHazard: 'Pinch hazard',
      collisionIntro:
        'Workers entering the zone may face collision risk. Reduce risk before production.',
      pinchIntro: 'Pinch points may exist. Review guarding and procedures.',
      viewInScene: 'View in 3D',
      vicinitySuffixKo: '주변부 1곳',
      vicinitySuffixEn: '— 1 vicinity point',
      badgeOk: 'OK',
      badgeReview: 'Review',
      badgeRisk: 'Risk',
      badgeBrand: 'Action',
      hazardItemsCollision: [
        { id: 'c1', nameKo: '그리퍼 1', nameEn: 'Gripper 1' },
        { id: 'c2', nameKo: '매니퓰레이터 본체', nameEn: 'Manipulator body' },
        { id: 'c3', nameKo: '주변 이송 설비', nameEn: 'Nearby transfer equipment' },
      ],
      tabRobotPfl: 'Robot PFL',
      tabSensor: (n: number) => `Sensor (${n})`,
      tabFence: (n: number) => `Fence (${n})`,
      emptyHint: 'Content will be connected in a later step.',
    };
  }
  return {
    title: '셀 안전진단',
    cellFilter: '로봇 셀 필터',
    cellValue: 'Robot Cell',
    conditionsChanged: '분석 조건 변경됨',
    flowLead: '아래 3단계를 순서대로 확인하세요. 색상은 우선순위를 뜻합니다 — 위험(적) → 점검(주황) → 양호(녹).',
    tabSummary: '진단 · 위험',
    tabEquipment: 'PFL · 센서 · 펜스',
    tabResidual: '잔존 위험',
    step1Short: '결과·위험',
    step2Short: '장치',
    step3Short: '잔존',
    equipmentLead: '장치 유형별 상세 분석입니다. 탭을 바꿔 로봇(PFL), 센서, 펜스 결과를 비교하세요.',
    hazardCallout: '충돌·끼임 위험이 확인되었습니다. 아래 구역을 우선 점검하고 방호·절차 조치를 적용하세요.',
    summaryTitle: '진단 스냅샷',
    snapshotCaption: '이번 실행의 핵심 수치입니다. 자동 분석 기준으로 집계되었습니다.',
    cardHazard: '위험영역',
    cardRobot: '로봇(PFL)',
    cardSensorFence: '센서/펜스',
    cardResidual: '잔존 위험성',
    unitCount: (n: number) => `${n}개`,
    hazardSection: (n: number) => `위험영역 (${n})`,
    collisionHazard: '충돌 위험',
    pinchHazard: '끼임 위험',
    collisionIntro: '작업자 진입 시 충돌 위험이 예상됩니다. 조치가 필요합니다.',
    pinchIntro: '끼임 가능 구간이 감지되었습니다. 방호 및 절차를 검토하세요.',
    viewInScene: '3D에서 보기',
    vicinitySuffixKo: '주변부 1곳',
    vicinitySuffixEn: '— 1 vicinity point',
    badgeOk: '양호',
    badgeReview: '점검',
    badgeRisk: '위험',
    badgeBrand: '조치',
    hazardItemsCollision: [
      { id: 'c1', nameKo: '그리퍼 1', nameEn: 'Gripper 1' },
      { id: 'c2', nameKo: '매니퓰레이터 본체', nameEn: 'Manipulator body' },
      { id: 'c3', nameKo: '주변 이송 설비', nameEn: 'Nearby transfer equipment' },
    ],
    tabRobotPfl: '로봇 PFL',
    tabSensor: (n: number) => `센서(${n})`,
    tabFence: (n: number) => `펜스(${n})`,
    emptyHint: '상세 내용은 이후 단계에서 연결됩니다.',
  };
}

const SUMMARY = { hazard: 4, robot: 4, sensorFence: 4, residual: 10 } as const;
const TAB_COUNTS = { sensor: 2, fence: 2 } as const;

type CardTone = 'danger' | 'warn' | 'safe' | 'brand';

function summaryTone(key: string): CardTone {
  if (key === 'residual') return 'brand';
  if (key === 'hazard') return 'danger';
  if (key === 'sf') return 'warn';
  return 'safe';
}

function toneStyle(tone: CardTone, isDark: boolean) {
  if (tone === 'brand')
    return {
      stripe: accentRgba(POINT_ORANGE, 0.9),
      background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.07)',
      label: POINT_ORANGE,
      badgeBg: accentRgba(POINT_ORANGE, 0.2),
    };
  if (tone === 'danger')
    return {
      stripe: ANALYSIS_DANGER.border,
      background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(254,242,242,0.9)',
      label: ANALYSIS_DANGER.text,
      badgeBg: ANALYSIS_DANGER.bgStrong,
    };
  if (tone === 'warn')
    return {
      stripe: ANALYSIS_WARN.border,
      background: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(255,251,235,0.95)',
      label: ANALYSIS_WARN.textStrong,
      badgeBg: ANALYSIS_WARN.bgHover,
    };
  return {
    stripe: ANALYSIS_SAFE.border,
    background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(240,253,244,0.95)',
    label: ANALYSIS_SAFE.textStrong,
    badgeBg: ANALYSIS_SAFE.bgStrong,
  };
}

function badgeForTone(tone: CardTone, L: ReturnType<typeof copy>) {
  if (tone === 'brand') return L.badgeBrand;
  if (tone === 'danger') return L.badgeRisk;
  if (tone === 'warn') return L.badgeReview;
  return L.badgeOk;
}

const stepIcons = [ClipboardList, Cpu, Shield] as const;

export function AnalysisSidePanel({
  locale,
  isDark,
  tokens: t,
  onOpenSensorCalculator,
  onHazardViewClick,
  onRobotPflViewClick,
  onSensorCalcDetailViewClick,
  onFenceProposalClick,
  onResidualLocationView,
}: Props) {
  const L = copy(locale);
  const [processTab, setProcessTab] = useState<ProcessTab>('summary');
  const [equipmentTab, setEquipmentTab] = useState<AnalysisEquipmentTab>('robot');

  const summaryCards = [
    { key: 'hazard', label: L.cardHazard, count: SUMMARY.hazard },
    { key: 'robot', label: L.cardRobot, count: SUMMARY.robot },
    { key: 'sf', label: L.cardSensorFence, count: SUMMARY.sensorFence },
    { key: 'residual', label: L.cardResidual, count: SUMMARY.residual },
  ] as const;

  const equipmentTabs: { id: AnalysisEquipmentTab; label: string }[] = [
    { id: 'robot', label: L.tabRobotPfl },
    { id: 'sensor', label: L.tabSensor(TAB_COUNTS.sensor) },
    { id: 'fence', label: L.tabFence(TAB_COUNTS.fence) },
  ];

  const processOrder: { id: ProcessTab; label: string; short: string }[] = [
    { id: 'summary', label: L.tabSummary, short: L.step1Short },
    { id: 'equipment', label: L.tabEquipment, short: L.step2Short },
    { id: 'residual', label: L.tabResidual, short: L.step3Short },
  ];

  const canvasBg = isDark ? 'rgba(0,0,0,0.18)' : 'rgba(248,250,252,0.95)';
  const cardShell = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff';

  const placeholderBox = (
    <div
      className="min-h-[88px] rounded-xl border border-dashed flex items-center justify-center px-4 py-5 text-center text-sm leading-relaxed"
      style={{
        borderColor: t.inputBorder,
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
        color: t.textSecondary,
      }}
    >
      {L.emptyHint}
    </div>
  );

  return (
    <div
      className="h-full flex flex-col rounded-2xl overflow-hidden min-h-0 min-w-0 border"
      style={{
        borderColor: t.inputBorder,
        background: t.tabBarBg,
        boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.35)' : '0 4px 24px rgba(15,23,42,0.07)',
      }}
    >
      {/* 상단: 맥락 + 셀 + 단계 (높이 최소화) */}
      <div
        className="shrink-0 px-3 pt-2 pb-2 border-b"
        style={{ borderColor: t.inputBorder, background: cardShell }}
      >
        <div className="flex items-start gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: POINT_ORANGE }}>
                SafetyDesigner
              </span>
              <h2 className="text-base font-bold leading-tight tracking-tight" style={{ color: t.textPrimary }}>
                {L.title}
              </h2>
            </div>
            <p
              className="text-[10px] leading-snug mt-0.5 line-clamp-2"
              style={{ color: t.textSecondary }}
              title={L.flowLead}
            >
              {L.flowLead}
            </p>
          </div>
          <div
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: accentRgba(POINT_ORANGE, 0.1),
              border: `1px solid ${accentRgba(POINT_ORANGE, 0.22)}`,
              color: POINT_ORANGE,
            }}
            aria-hidden
          >
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.2} />
          </div>
        </div>

        <div
          className="mt-1.5 flex items-center gap-2 rounded-lg border px-2 py-1 min-h-[32px]"
          style={{
            borderColor: t.inputBorder,
            background: t.inputBg,
          }}
        >
          <span className="shrink-0 text-[10px] font-medium" style={{ color: t.textSecondary }}>
            {L.cellFilter}
          </span>
          <span className="flex-1 min-w-0 truncate text-xs font-semibold" style={{ color: t.textPrimary }}>
            {L.cellValue}
          </span>
          <span
            className="shrink-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold max-w-[9rem] truncate"
            style={{
              background: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(245,158,11,0.2)',
              color: isDark ? '#fbbf24' : '#b45309',
              border: `1px solid ${isDark ? 'rgba(251,191,36,0.35)' : 'rgba(245,158,11,0.35)'}`,
            }}
            title={L.conditionsChanged}
          >
            {L.conditionsChanged}
          </span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" style={{ color: t.textSecondary }} aria-hidden />
        </div>

        <div
          className="mt-1.5"
          role="tablist"
          aria-label={locale === 'en' ? 'Diagnosis steps' : '진단 단계'}
        >
          <div className="flex items-center gap-0.5">
            {processOrder.map((step, idx) => {
              const active = processTab === step.id;
              const Icon = stepIcons[idx];
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className="flex-1 min-w-0 flex flex-row items-center justify-center gap-1 rounded-lg px-1.5 py-1 min-h-[30px] transition-all duration-200"
                  style={{
                    color: active ? (isDark ? '#fff' : '#0f172a') : t.textSecondary,
                    background: active ? POINT_ORANGE : canvasBg,
                    boxShadow: active ? (isDark ? '0 1px 8px rgba(255,142,43,0.22)' : '0 1px 6px rgba(255,142,43,0.22)') : undefined,
                    border: active ? `1px solid ${accentRgba(POINT_ORANGE, 0.45)}` : `1px solid transparent`,
                  }}
                  onClick={() => setProcessTab(step.id)}
                  title={step.label}
                >
                  <Icon className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                  <span className="text-[10px] font-bold leading-none text-center truncate">{step.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 본문 */}
      <div
        className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-2 py-2 flex flex-col min-w-0"
        style={{ background: canvasBg }}
      >
        {processTab === 'summary' && (
          <div className="flex flex-col gap-4 min-w-0">
            <div
              className="rounded-xl border px-3 py-3 text-sm leading-relaxed flex gap-2"
              style={{
                borderColor: accentRgba(ANALYSIS_DANGER.textStrong, 0.35),
                background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,226,226,0.65)',
                color: ANALYSIS_DANGER.textStrong,
              }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.2} />
              <span>{L.hazardCallout}</span>
            </div>

            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: t.inputBorder, background: cardShell }}
            >
              <div className="px-4 py-3 border-b" style={{ borderColor: t.inputBorder }}>
                <p className="text-sm font-bold" style={{ color: t.textPrimary }}>
                  {L.summaryTitle}
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: t.textSecondary }}>
                  {L.snapshotCaption}
                </p>
              </div>
              {/* 항상 세로 4행(1열) — 컨테이너 쿼리 불필요 */}
              <div className="flex flex-col divide-y" style={{ borderColor: t.inputBorder }}>
                {summaryCards.map((c) => {
                  const tone = summaryTone(c.key);
                  const st = toneStyle(tone, isDark);
                  return (
                    <div key={c.key} className="flex min-h-[76px] min-w-0">
                      <div className="w-1.5 shrink-0 self-stretch" style={{ background: st.stripe }} aria-hidden />
                      <div
                        className="flex flex-1 items-center justify-between gap-3 px-4 py-3"
                        style={{ background: st.background }}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium leading-tight" style={{ color: t.textSecondary }}>
                            {c.label}
                          </p>
                          <p className="text-2xl font-bold tabular-nums mt-1 tracking-tight" style={{ color: t.textPrimary }}>
                            {L.unitCount(c.count)}
                          </p>
                        </div>
                        <span
                          className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ color: st.label, background: st.badgeBg, border: `1px solid ${st.stripe}` }}
                        >
                          {badgeForTone(tone, L)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: t.inputBorder, background: cardShell }}>
              <div
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide border-b"
                style={{ borderColor: t.inputBorder, color: t.textSecondary }}
              >
                {L.hazardSection(SUMMARY.hazard)}
              </div>
              <div className="border-t" style={{ borderColor: t.inputBorder }}>
                <div
                  className="border-b px-4 py-4"
                  style={{
                    borderColor: t.inputBorder,
                    background: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(254,242,242,0.88)',
                  }}
                >
                  <p className="text-sm font-bold mb-1.5 flex items-center gap-2" style={{ color: ANALYSIS_DANGER.textStrong }}>
                    <span className="inline-block w-1 h-4 rounded-full" style={{ background: ANALYSIS_DANGER.border }} />
                    {L.collisionHazard}
                  </p>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: t.textSecondary }}>
                    {L.collisionIntro}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {L.hazardItemsCollision.map((item) => {
                      const label =
                        locale === 'en' ? `${item.nameEn} ${L.vicinitySuffixEn}` : `${item.nameKo} ${L.vicinitySuffixKo}`;
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                          style={{ borderColor: t.inputBorder, background: t.inputBg }}
                        >
                          <div
                            className="h-8 w-8 shrink-0 rounded-full"
                            style={{ background: isDark ? 'rgba(239,68,68,0.22)' : 'rgba(239,68,68,0.12)' }}
                            aria-hidden
                          />
                          <span className="flex-1 min-w-0 text-sm font-medium leading-snug" style={{ color: t.textPrimary }}>
                            {label}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border"
                            style={{
                              borderColor: accentRgba(POINT_ORANGE, 0.45),
                              color: POINT_ORANGE,
                              background: isDark ? 'rgba(255,142,43,0.12)' : 'rgba(255,142,43,0.08)',
                            }}
                            onClick={() => onHazardViewClick?.(item.id, 'collision')}
                          >
                            {L.viewInScene}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div
                  className="px-4 py-4"
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(255,251,235,0.92)',
                  }}
                >
                  <p className="text-sm font-bold mb-1.5 flex items-center gap-2" style={{ color: ANALYSIS_WARN.textStrong }}>
                    <span className="inline-block w-1 h-4 rounded-full" style={{ background: ANALYSIS_WARN.border }} />
                    {L.pinchHazard}
                  </p>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: t.textSecondary }}>
                    {L.pinchIntro}
                  </p>
                  {placeholderBox}
                </div>
              </div>
            </div>
          </div>
        )}

        {processTab === 'equipment' && (
          <div className="flex flex-col gap-3 min-h-0 min-w-0">
            <p className="text-xs leading-relaxed px-0.5" style={{ color: t.textSecondary }}>
              {L.equipmentLead}
            </p>
            <div
              className="flex rounded-xl p-1 gap-0.5 shrink-0 border"
              style={{
                borderColor: t.inputBorder,
                background: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.9)',
              }}
              role="tablist"
              aria-label={L.tabEquipment}
            >
              {equipmentTabs.map((tab) => {
                const active = equipmentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="flex-1 min-w-0 px-2 py-2 rounded-[10px] text-[11px] font-bold leading-tight transition-all"
                    style={{
                      color: active ? (isDark ? '#fff' : '#0f172a') : t.textSecondary,
                      background: active ? POINT_ORANGE : 'transparent',
                      boxShadow: active ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
                    }}
                    onClick={() => setEquipmentTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div
              className="rounded-2xl border p-3 min-h-0 min-w-0"
              style={{ borderColor: t.inputBorder, background: cardShell }}
            >
              {equipmentTab === 'robot' && (
                <RobotPflAnalysisContent
                  locale={locale}
                  isDark={isDark}
                  tokens={t}
                  onPflViewClick={onRobotPflViewClick}
                />
              )}
              {equipmentTab === 'sensor' && (
                <SensorAnalysisContent
                  locale={locale}
                  isDark={isDark}
                  tokens={t}
                  onOpenSensorCalculator={onOpenSensorCalculator}
                  onSensorCalcDetailViewClick={onSensorCalcDetailViewClick}
                />
              )}
              {equipmentTab === 'fence' && (
                <FenceAnalysisContent locale={locale} isDark={isDark} tokens={t} onFenceProposalClick={onFenceProposalClick} />
              )}
            </div>
          </div>
        )}

        {processTab === 'residual' && (
          <ResidualRiskContent
            locale={locale}
            isDark={isDark}
            tokens={t}
            totalCount={SUMMARY.residual}
            onResidualLocationView={onResidualLocationView}
            presentation="flow"
            accent="brand"
          />
        )}
      </div>
    </div>
  );
}
