import { useState } from 'react';
import { AlertTriangle, ChevronDown, ClipboardList, Cpu, ExternalLink, Info, LayoutDashboard, Shield } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER, ANALYSIS_SAFE, ANALYSIS_WARN } from './analysisPanelSemantics';
import { ANALYSIS_FRAME_DARK, ANALYSIS_FRAME_LIGHT } from './analysisPanelFrameRef';
import type { AnalysisFrameTokens, HazardRowTone } from './analysisPanelFrameRef';
import { RobotPflAnalysisContent } from './RobotPflAnalysisContent';
import { SensorAnalysisContent } from './SensorAnalysisContent';
import { FenceAnalysisContent } from './FenceAnalysisContent';
import { ResidualRiskContent } from './ResidualRiskContent';
import {
  AnalysisFigmaDraftChrome,
  AnalysisFigmaDraftRegulations,
  AnalysisFigmaDraftSummary,
} from './AnalysisPanelFigmaDraft';
import { AnalysisPanelSafetics698Wire } from './AnalysisPanelSafetics698Wire';
import { AnalysisPanelSafeticsV2, SafeticsV2CellHeader } from './AnalysisPanelSafeticsV2';
import { LIGHT_HAZARD_ROWS, LIGHT_REG_ROWS } from './analysisPanelSummaryRows';

export type AnalysisEquipmentTab = 'robot' | 'sensor' | 'fence';

/** UI 비교용: 참고안(와이어) vs 컴팩트 vs 대시보드 vs Figma Draft — 라이트·다크 공통으로 전환 */
export type AnalysisPanelUiVersion =
  | 'frameRef'
  | 'compactTiles'
  | 'dashboard'
  | 'figmaDraft'
  | 'safetics698Wire'
  | 'safeticsV2';

/** 우측 프로퍼티 패널(`PropertyPanel` LIGHT/DARK)과 동일 계열 — 글래스·소프트 섀도 */
type PanelTokens = {
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  inputBg: string;
  tabBarBg: string;
  sectionHeaderBg: string;
  panelBg: string;
  panelBorder: string;
  panelShadow: string;
  elevationSection: string;
  elevationRaised: string;
  divider: string;
};

type Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  /** 좌측 크롬 헤더와 동기화 — 패널 레이아웃(참고안/컴팩트/대시보드) */
  panelUiVersion: AnalysisPanelUiVersion;
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
      cellValue: 'Robot Cell — Welding line A-3',
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
      summaryGridCaption: 'Summary',
      snapshotCaption: 'Key counts at a glance. Dots reflect severity mix for this cell.',
      cardHazard: 'Hazardous areas',
      cardRobot: 'Robot-related',
      cardSensorFence: 'Sensor / fence',
      cardRegulatory: 'Safety regulations',
      unitCount: (n: number) => `${n}`,
      hazardSection: (n: number) => `Hazardous areas (${n})`,
      regulationsSection: (n: number) => `Safety regulations (${n})`,
      frameHazardZone: 'Hazardous areas',
      frameRegulations: 'Safety regulations',
      frameEquipmentAnalysis: 'Robot & device / facility analysis',
      tabRobotCount: (n: number) => `Robot (${n})`,
      countermeasureSuggest: 'Suggest countermeasure',
      editProperties: 'Edit properties',
      detailView: 'View details',
      markDone: 'Mark done',
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
      panelVersionLabel: 'Panel layout (compare)',
      panelVersionFrameRef: 'Reference · Apr 2026 (HTML wireframe)',
      panelVersionCompact: 'Compact · tile snapshot',
      panelVersionDashboard: 'Dashboard · KPI widgets',
      dashKpiBlockDesign: 'Installation',
      dashKpiBlockDesignSub: 'Robot & sensor / fence counts from your design.',
      dashKpiBlockDiagnosis: 'Diagnosis (variable)',
      dashKpiBlockDiagnosisSub: 'Hazard areas and residual / regulatory items — from 0 upward depending on properties and options.',
      dashCardResidualRegulatory: 'Residual / regulatory',
      extensionSlotPlaceholder: 'Reserved — new layout slot',
    };
  }
  return {
    title: '셀 안전진단',
    cellFilter: '로봇 셀 필터',
    cellValue: 'Robot Cell — 용접공정 A-3',
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
    summaryGridCaption: '진단 결과 요약',
    snapshotCaption: '이번 실행의 핵심 수치입니다. 점 색상은 심각도 혼합을 나타냅니다.',
    cardHazard: '위험영역',
    cardRobot: '로봇 관련',
    cardSensorFence: '센서/펜스 관련',
    cardRegulatory: '안전규정 관련',
    unitCount: (n: number) => `${n}개`,
    hazardSection: (n: number) => `위험영역 (${n})`,
    regulationsSection: (n: number) => `안전규정 (${n})`,
    frameHazardZone: '위험영역',
    frameRegulations: '안전규정',
    frameEquipmentAnalysis: '로봇 및 장치/설비 분석',
    tabRobotCount: (n: number) => `로봇 (${n})`,
    countermeasureSuggest: '대책 추천',
    editProperties: '속성 수정',
    detailView: '상세 보기',
    markDone: '확인 완료 처리',
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
    panelVersionLabel: '패널 레이아웃 (비교)',
    panelVersionFrameRef: '참고안 · 2026.04 (HTML 와이어)',
    panelVersionCompact: '컴팩트 · 타일 스냅샷',
    panelVersionDashboard: '대시보드 · KPI 위젯',
    dashKpiBlockDesign: '설치·구성',
    dashKpiBlockDesignSub: '설계에 배치한 로봇·센서/펜스 개수입니다.',
    dashKpiBlockDiagnosis: '진단·가변',
    dashKpiBlockDiagnosisSub: '위험영역·잔존/안전규정 항목 — 속성·옵션에 따라 0부터 늘어날 수 있습니다.',
    dashCardResidualRegulatory: '잔존·안전규정',
    extensionSlotPlaceholder: '신규 구성용 슬롯',
  };
}

/** `WorkspaceChrome` 좌측 패널 헤더 — 패널 레이아웃 셀렉트용 문구 */
export function getAnalysisPanelLayoutChromeCopy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      label: 'Panel layout (compare)',
      frameRef: 'Reference · Apr 2026 (HTML wireframe)',
      compact: 'Compact · tile snapshot',
      dashboard: 'Dashboard · KPI widgets',
      figmaDraft: 'Figma Draft · flat list (node 698-990)',
      safetics698Wire: 'Safetics wire · node 698-990 (new)',
      safeticsV2: 'Safetics · table + tabs (v2)',
    };
  }
  return {
    label: '패널 레이아웃 (비교)',
    frameRef: '참고안 · 2026.04 (HTML 와이어)',
    compact: '컴팩트 · 타일 스냅샷',
    dashboard: '대시보드 · KPI 위젯',
    figmaDraft: 'Figma Draft · 플랫 리스트 (노드 698-990)',
    safetics698Wire: 'Safetics 와이어 · 노드 698-990 (신규)',
    safeticsV2: 'Safetics · 표 + 탭 통합 (v2)',
  };
}

const SUMMARY = { hazard: 5, robot: 4, sensorFence: 4, regulatory: 4, residual: 10 } as const;
const TAB_COUNTS = { sensor: 2, fence: 2 } as const;
const EQUIPMENT_FRAME_TOTAL = 8;

const SUMMARY_DOT_PATTERN: Record<'hazard' | 'robot' | 'sf' | 'regulatory', ('f' | 'w' | 'p')[]> = {
  hazard: ['f', 'f', 'w', 'w', 'p'],
  robot: ['f', 'w', 'p', 'p'],
  sf: ['w', 'w', 'p', 'p'],
  regulatory: ['f', 'w', 'p', 'p'],
};

type CardTone = 'danger' | 'warn' | 'safe' | 'brand';

function summaryTone(key: string): CardTone {
  if (key === 'regulatory') return 'warn';
  if (key === 'hazard') return 'danger';
  if (key === 'sf') return 'warn';
  return 'safe';
}

function frameBadgeStyle(tone: HazardRowTone, tok: AnalysisFrameTokens) {
  if (tone === 'fail') return { bg: tok.badgeFailBg, fg: tok.badgeFailFg, label: '✕' as const };
  if (tone === 'warn') return { bg: tok.badgeWarnBg, fg: tok.badgeWarnFg, label: '!' as const };
  return { bg: tok.badgePassBg, fg: tok.badgePassFg, label: '✓' as const };
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
  panelUiVersion,
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
  const [lightHazardOpenId, setLightHazardOpenId] = useState<string | null>('hz1');
  const [lightRegOpenId, setLightRegOpenId] = useState<string | null>(null);
  const [lightEmbedEquipTab, setLightEmbedEquipTab] = useState<AnalysisEquipmentTab>('robot');
  /** 대시보드: 분석 결과를 볼 셀 선택(와이어용) */
  const [dashboardCellId, setDashboardCellId] = useState('cell1');

  const FL = ANALYSIS_FRAME_LIGHT;
  const useFrameRefChrome = panelUiVersion === 'frameRef';
  const isDashboardLayout = panelUiVersion === 'dashboard';
  const isFigmaDraftLayout = panelUiVersion === 'figmaDraft';
  const isSafetics698Wire = panelUiVersion === 'safetics698Wire';
  const isSafeticsV2 = panelUiVersion === 'safeticsV2';
  const FT: AnalysisFrameTokens = isDark ? ANALYSIS_FRAME_DARK : ANALYSIS_FRAME_LIGHT;

  const summaryCards = [
    { key: 'hazard' as const, label: L.cardHazard, count: SUMMARY.hazard },
    { key: 'robot' as const, label: L.cardRobot, count: SUMMARY.robot },
    { key: 'sf' as const, label: L.cardSensorFence, count: SUMMARY.sensorFence },
    { key: 'regulatory' as const, label: L.cardRegulatory, count: SUMMARY.regulatory },
  ];

  /** 대시보드: 설계에 고정되는 설치 개수 vs 진단으로 가변인 항목 */
  const dashboardKpiDesignInstall = [
    { key: 'robot' as const, label: L.cardRobot, count: SUMMARY.robot },
    { key: 'sf' as const, label: L.cardSensorFence, count: SUMMARY.sensorFence },
  ];
  const dashboardKpiDiagnosisVariable = [
    { key: 'hazard' as const, label: L.cardHazard, count: SUMMARY.hazard },
    { key: 'regulatory' as const, label: L.dashCardResidualRegulatory, count: SUMMARY.regulatory },
  ];

  const equipmentTabs: { id: AnalysisEquipmentTab; label: string }[] = [
    { id: 'robot', label: L.tabRobotPfl },
    { id: 'sensor', label: L.tabSensor(TAB_COUNTS.sensor) },
    { id: 'fence', label: L.tabFence(TAB_COUNTS.fence) },
  ];

  const equipmentTabsFrame: { id: AnalysisEquipmentTab; label: string }[] = [
    { id: 'robot', label: L.tabRobotCount(SUMMARY.robot) },
    { id: 'sensor', label: L.tabSensor(TAB_COUNTS.sensor) },
    { id: 'fence', label: L.tabFence(TAB_COUNTS.fence) },
  ];

  const processOrder: { id: ProcessTab; label: string; short: string }[] = [
    { id: 'summary', label: L.tabSummary, short: L.step1Short },
    { id: 'equipment', label: L.tabEquipment, short: L.step2Short },
    { id: 'residual', label: L.tabResidual, short: L.step3Short },
  ];

  const canvasBgGradient = isDashboardLayout || isFigmaDraftLayout || isSafetics698Wire || isSafeticsV2
    ? isDark
      ? 'linear-gradient(165deg, #151a22 0%, #0f1218 55%, #0c0e12 100%)'
      : 'linear-gradient(180deg, #e2e8f0 0%, #eef2f7 45%, #e8edf2 100%)'
    : useFrameRefChrome
      ? FT.bgCanvas
      : isDark
        ? 'rgba(0,0,0,0.12)'
        : FL.bgCanvas;
  /** safeticsV2: 스크롤 영역 단색(라이트 흰색 / 다크 차분한 단색) */
  const canvasBg =
    isSafeticsV2 && !isDark ? '#ffffff' : isSafeticsV2 && isDark ? '#161618' : canvasBgGradient;
  const hairline = t.divider;
  const versionUsesFrameTokens = useFrameRefChrome;

  const toggleLightHazard = (id: string) => {
    setLightHazardOpenId((cur) => (cur === id ? null : id));
  };
  const toggleLightReg = (id: string) => {
    setLightRegOpenId((cur) => (cur === id ? null : id));
  };

  const equipmentUseUnderlineTabs =
    useFrameRefChrome || isDashboardLayout || isFigmaDraftLayout || isSafetics698Wire || isSafeticsV2;

  const placeholderBox = (
    <div
      className="min-h-[72px] rounded-lg flex items-center justify-center px-3 py-4 text-center text-sm leading-relaxed"
      style={{
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
        color: t.textSecondary,
      }}
    >
      {L.emptyHint}
    </div>
  );

  return (
    <div
      className="h-full flex flex-col rounded-[18px] overflow-hidden min-h-0 min-w-0"
      style={{
        border: `1px solid ${t.panelBorder}`,
        background: t.panelBg,
        boxShadow: t.panelShadow,
        backdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
      }}
    >
      {/* 상단: 컴팩트=SafetyDesigner·오렌지 탭 / 참고안=셀렉트·요약 그리드·밑줄 단계 탭 (라이트·다크) — 패널 레이아웃은 WorkspaceChrome 헤더 */}
      <div
        className="shrink-0 border-b"
        style={{
          borderColor: hairline,
          background: isDashboardLayout || isFigmaDraftLayout || isSafetics698Wire || isSafeticsV2
            ? isDark
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(255,255,255,0.78)'
            : useFrameRefChrome
              ? FT.bgPanel
              : undefined,
        }}
      >
        {panelUiVersion === 'compactTiles' ? (
          <div className="px-3 pt-2 pb-2">
            <div className="flex items-start gap-2 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: POINT_ORANGE }}>
                    SafetyDesigner
                  </span>
                  <h2 className="text-[14px] font-bold leading-tight tracking-tight" style={{ color: t.textPrimary }}>
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
              <div className="shrink-0 flex h-7 w-7 items-center justify-center" style={{ color: POINT_ORANGE }} aria-hidden>
                <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.2} />
              </div>
            </div>

            <div
              className="mt-1.5 flex items-center gap-2 px-0.5 py-1 min-h-[30px] border-t"
              style={{ borderColor: hairline }}
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
                  background: 'rgba(251,191,36,0.18)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.35)',
                }}
                title={L.conditionsChanged}
              >
                {L.conditionsChanged}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" style={{ color: t.textSecondary }} aria-hidden />
            </div>

            <div className="mt-1.5" role="tablist" aria-label={locale === 'en' ? 'Diagnosis steps' : '진단 단계'}>
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
                      className="flex-1 min-w-0 flex flex-row items-center justify-center gap-1 rounded-md px-1.5 py-1 min-h-[30px] transition-all duration-200"
                      style={{
                        color: active ? '#fff' : t.textSecondary,
                        background: active ? POINT_ORANGE : 'transparent',
                        border: active ? `1px solid ${accentRgba(POINT_ORANGE, 0.4)}` : '1px solid transparent',
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
        ) : panelUiVersion === 'dashboard' ? (
          <div className="px-3 pt-2 pb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: isDark
                    ? 'linear-gradient(160deg, rgba(255,142,43,0.2), rgba(255,142,43,0.06))'
                    : 'linear-gradient(160deg, rgba(255,142,43,0.22), rgba(255,142,43,0.07))',
                  boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.65)',
                }}
                aria-hidden
              >
                <LayoutDashboard className="h-3.5 w-3.5" style={{ color: POINT_ORANGE }} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-wider leading-none" style={{ color: FT.textTertiary }}>
                  SafetyDesigner
                </p>
                <h2 className="text-[14px] font-bold leading-snug mt-0.5 tracking-tight" style={{ color: FT.textPrimary }}>
                  {L.title}
                </h2>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md p-1 transition-colors"
                style={{ color: FT.textTertiary }}
                title={L.flowLead}
                aria-label={L.flowLead}
              >
                <Info className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
              <div className="flex min-w-0 shrink-0 items-center gap-1.5 max-w-[min(58%,240px)]">
                <label htmlFor="dashboard-cell-select" className="sr-only">
                  {L.cellFilter}
                </label>
                <div className="relative min-w-0 flex-1">
                  <select
                    id="dashboard-cell-select"
                    value={dashboardCellId}
                    onChange={(e) => setDashboardCellId(e.target.value)}
                    className="w-full min-w-0 cursor-pointer appearance-none rounded-xl py-1 pl-2 pr-7 text-[11px] font-medium"
                    style={{
                      background: isDark ? FT.bgSecondary : '#ffffff',
                      color: FT.textPrimary,
                      boxShadow: `${t.elevationRaised}, inset 0 0 0 1px ${FT.borderSubtle}`,
                    }}
                  >
                    <option value="cell1">{L.cellValue}</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2"
                    style={{ color: FT.textTertiary }}
                    aria-hidden
                  />
                </div>
                <span
                  className="inline max-w-[4.5rem] shrink-0 truncate rounded px-1 py-0.5 text-[8px] font-semibold sm:max-w-[5.5rem] sm:px-1.5 sm:text-[9px]"
                  style={{
                    background: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(251,191,36,0.16)',
                    color: '#d97706',
                  }}
                  title={L.conditionsChanged}
                >
                  {L.conditionsChanged}
                </span>
              </div>
            </div>

            <div className="mt-2 min-w-0 space-y-2">
              <div
                className="rounded-xl px-2 py-1.5"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.72)',
                  boxShadow: t.elevationRaised,
                  border: isDark ? 'none' : '1px solid rgba(255,255,255,0.85)',
                }}
              >
                <div className="mb-1 flex min-w-0 items-center gap-0.5">
                  <span className="text-[10px] font-bold leading-none" style={{ color: FT.textPrimary }}>
                    {L.dashKpiBlockDesign}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5"
                    style={{ color: FT.textTertiary }}
                    title={L.dashKpiBlockDesignSub}
                    aria-label={L.dashKpiBlockDesignSub}
                  >
                    <Info className="h-3 w-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div className="grid min-w-0 grid-cols-2 gap-1.5">
                  {dashboardKpiDesignInstall.map((c) => {
                    const tone = summaryTone(c.key);
                    const st = toneStyle(tone, isDark);
                    return (
                      <div
                        key={c.key}
                        className="flex min-h-0 min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-1"
                        style={{
                          borderLeft: `3px solid ${st.stripe}`,
                          background: isDark ? st.background : '#ffffff',
                          boxShadow: isDark ? undefined : '0 1px 2px rgba(15,23,42,0.06)',
                        }}
                      >
                        <span
                          className="min-w-0 truncate text-[9px] font-medium leading-none"
                          style={{ color: FT.textSecondary }}
                          title={c.label}
                        >
                          {c.label}
                        </span>
                        <span className="shrink-0 text-sm font-bold tabular-nums leading-none" style={{ color: FT.textPrimary }}>
                          {c.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="rounded-xl px-2 py-1.5"
                style={{
                  background: isDark ? 'rgba(255,142,43,0.07)' : 'rgba(255,142,43,0.08)',
                  boxShadow: t.elevationRaised,
                  border: isDark ? '1px solid rgba(255,142,43,0.12)' : '1px solid rgba(255,142,43,0.14)',
                }}
              >
                <div className="mb-1 flex min-w-0 items-center gap-0.5">
                  <span className="text-[10px] font-bold leading-none" style={{ color: FT.textPrimary }}>
                    {L.dashKpiBlockDiagnosis}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded p-0.5"
                    style={{ color: FT.textTertiary }}
                    title={L.dashKpiBlockDiagnosisSub}
                    aria-label={L.dashKpiBlockDiagnosisSub}
                  >
                    <Info className="h-3 w-3" strokeWidth={2} aria-hidden />
                  </button>
                </div>
                <div className="grid min-w-0 grid-cols-2 gap-1.5">
                  {dashboardKpiDiagnosisVariable.map((c) => {
                    const tone = summaryTone(c.key);
                    const st = toneStyle(tone, isDark);
                    return (
                      <div
                        key={c.key}
                        className="flex min-h-0 min-w-0 items-center justify-between gap-2 rounded-lg px-2 py-1"
                        style={{
                          borderLeft: `3px solid ${st.stripe}`,
                          background: isDark ? st.background : '#ffffff',
                          boxShadow: isDark ? undefined : '0 1px 2px rgba(15,23,42,0.06)',
                        }}
                      >
                        <span
                          className="min-w-0 truncate text-[9px] font-medium leading-none"
                          style={{ color: FT.textSecondary }}
                          title={c.label}
                        >
                          {c.label}
                        </span>
                        <span className="shrink-0 text-sm font-bold tabular-nums leading-none" style={{ color: FT.textPrimary }}>
                          {c.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="mt-2 min-h-[48px] rounded-xl border border-dashed px-2 py-2 flex flex-col items-center justify-center text-center"
              style={{
                borderColor: hairline,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.4)',
              }}
              data-analysis-extension-slot
              aria-label={L.extensionSlotPlaceholder}
            >
              <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: FT.textTertiary }}>
                {locale === 'en' ? 'Extension' : '확장'}
              </span>
              <span className="text-[10px] mt-0.5 leading-snug" style={{ color: t.textSecondary }}>
                {L.extensionSlotPlaceholder}
              </span>
            </div>

            <div
              className="mt-2 flex gap-0.5 rounded-2xl p-0.5"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.92)',
                boxShadow: t.elevationRaised,
              }}
              role="tablist"
              aria-label={locale === 'en' ? 'Diagnosis steps' : '진단 단계'}
            >
              {processOrder.map((step, idx) => {
                const active = processTab === step.id;
                const Icon = stepIcons[idx];
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="flex min-h-[28px] flex-1 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-0.5 transition-all"
                    style={{
                      color: active ? '#fff' : FT.textSecondary,
                      background: active ? POINT_ORANGE : 'transparent',
                      boxShadow: active ? '0 4px 14px rgba(255,142,43,0.45)' : undefined,
                    }}
                    onClick={() => setProcessTab(step.id)}
                    title={step.label}
                  >
                    <Icon className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                    <span className="max-w-full truncate text-[9px] font-bold leading-none">{step.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : panelUiVersion === 'figmaDraft' ? (
          <AnalysisFigmaDraftChrome
            locale={locale}
            isDark={isDark}
            t={t}
            title={L.title}
            cellFilter={L.cellFilter}
            cellValue={L.cellValue}
            conditionsChanged={L.conditionsChanged}
            metrics={summaryCards.map((c) => ({ label: c.label, value: c.count }))}
            processOrder={processOrder}
            processTab={processTab}
            onProcessTab={setProcessTab}
            stepIcons={stepIcons}
            cellId={dashboardCellId}
            onCellId={setDashboardCellId}
          />
        ) : panelUiVersion === 'safeticsV2' ? (
          <div
            className="shrink-0 border-b px-3 pt-2.5 pb-2.5"
            style={{
              borderColor: hairline,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
            }}
          >
            <SafeticsV2CellHeader locale={locale} isDark={isDark} tokens={t} />
            <p className="mt-2 text-[12px] leading-snug" style={{ color: t.textSecondary }}>
              {locale === 'en' ? 'Choose a cell to align results.' : '결과를 맞출 로봇 셀을 선택하세요.'}
            </p>
          </div>
        ) : panelUiVersion === 'safetics698Wire' ? (
          <div
            className="shrink-0 border-b px-3 pt-2.5 pb-2.5"
            style={{
              borderColor: hairline,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.78)',
            }}
          >
            <p className="text-[14px] font-semibold leading-tight" style={{ color: t.textPrimary }}>
              {L.title}
            </p>
            <p className="mt-1 text-[12px] leading-snug" style={{ color: t.textSecondary }}>
              {locale === 'en' ? 'Analysis results and recommended actions for this cell.' : '이 셀에 대한 분석 결과와 조치 안내입니다.'}
            </p>
          </div>
        ) : (
          <div className="px-3 pt-2 pb-1.5">
            <p className="text-[14px] font-medium leading-tight" style={{ color: FT.textPrimary }}>
              {L.title}
            </p>
            <div className="relative mt-1.5 mb-2">
              <select
                className="w-full text-[12px] py-1 pl-2 pr-8 rounded-md border appearance-none cursor-pointer"
                style={{
                  borderColor: FT.border,
                  background: FT.bgSecondary,
                  color: FT.textPrimary,
                }}
                aria-label={L.cellFilter}
                defaultValue="cell1"
              >
                <option value="cell1">{L.cellValue}</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: FT.textTertiary }}
                aria-hidden
              />
            </div>

            <p className="text-[9px] font-medium mb-1 leading-none" style={{ color: FT.textSecondary }}>
              {L.summaryGridCaption}
            </p>
            {/* 한 줄 4열 + 타이트 패딩으로 고정 헤더 높이 절약 */}
            <div className="grid grid-cols-4 gap-1 mb-2 min-w-0">
              {summaryCards.map((c) => {
                const dots = SUMMARY_DOT_PATTERN[c.key];
                return (
                  <div
                    key={c.key}
                    className="rounded-md px-1.5 py-1 min-w-0"
                    style={{ background: FT.bgSecondary }}
                  >
                    <p
                      className="text-[9px] leading-[1.2] mb-0.5 line-clamp-2 break-words"
                      style={{ color: FT.textSecondary }}
                      title={c.label}
                    >
                      {c.label}
                    </p>
                    <p className="text-[15px] font-semibold tabular-nums leading-none" style={{ color: FT.textPrimary }}>
                      {c.count}
                    </p>
                    <div className="flex flex-wrap gap-px mt-0.5" aria-hidden>
                      {dots.map((d, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: d === 'f' ? FT.dotFail : d === 'w' ? FT.dotWarn : FT.dotPass,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="flex border-b -mx-3 px-3"
              style={{ borderColor: FT.borderSubtle }}
              role="tablist"
              aria-label={locale === 'en' ? 'Diagnosis steps' : '진단 단계'}
            >
              {processOrder.map((step, idx) => {
                const active = processTab === step.id;
                const Icon = stepIcons[idx];
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className="flex-1 min-w-0 flex flex-col items-center gap-0.5 pb-1.5 pt-0.5 transition-colors"
                    style={{
                      color: active ? FT.textPrimary : FT.textSecondary,
                      borderBottom: active ? `2px solid ${FT.textPrimary}` : '2px solid transparent',
                      marginBottom: -1,
                    }}
                    onClick={() => setProcessTab(step.id)}
                    title={step.label}
                  >
                    <Icon className="h-3 w-3 shrink-0" strokeWidth={2.2} />
                    <span className="text-[9px] font-medium leading-none text-center truncate max-w-full">{step.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 본문 */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto sfd-scroll flex flex-col min-w-0 ${
          isSafeticsV2
            ? 'px-2 py-1'
            : isDashboardLayout || isFigmaDraftLayout || isSafetics698Wire
              ? 'px-3 py-1'
              : 'px-3 py-2.5'
        }`}
        style={{ background: canvasBg }}
      >
        {panelUiVersion === 'safeticsV2' ? (
          <AnalysisPanelSafeticsV2
            locale={locale}
            isDark={isDark}
            tokens={t}
            onHazardViewClick={onHazardViewClick}
          />
        ) : panelUiVersion === 'safetics698Wire' ? (
          <AnalysisPanelSafetics698Wire
            locale={locale}
            isDark={isDark}
            tokens={t}
            onHazardViewClick={onHazardViewClick}
          />
        ) : (
          <>
        {processTab === 'summary' && isDark && panelUiVersion === 'compactTiles' && (
          <div className="flex flex-col gap-5 min-w-0">
            <div
              className="pl-3 pr-2 py-2.5 text-sm leading-relaxed flex gap-2 border-l-[3px]"
              style={{
                borderLeftColor: ANALYSIS_DANGER.border,
                background: 'rgba(239,68,68,0.08)',
                color: ANALYSIS_DANGER.textStrong,
              }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.2} />
              <span>{L.hazardCallout}</span>
            </div>

            <section>
              <p className="text-sm font-bold" style={{ color: t.textPrimary }}>
                {L.summaryTitle}
              </p>
              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: t.textSecondary }}>
                {L.snapshotCaption}
              </p>
              <div
                className="mt-2 grid gap-2 min-w-0"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))',
                }}
              >
                {summaryCards.map((c) => {
                  const tone = summaryTone(c.key);
                  const st = toneStyle(tone, true);
                  return (
                    <div
                      key={c.key}
                      className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border"
                      style={{
                        borderColor: hairline,
                        background: st.background,
                        boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                      }}
                    >
                      <div className="h-1 w-full shrink-0" style={{ background: st.stripe }} aria-hidden />
                      <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2 min-w-0">
                        <p
                          className="text-[10px] font-semibold leading-tight line-clamp-2"
                          style={{ color: t.textSecondary }}
                          title={c.label}
                        >
                          {c.label}
                        </p>
                        <p
                          className="text-lg font-bold tabular-nums leading-none tracking-tight"
                          style={{ color: t.textPrimary }}
                        >
                          {L.unitCount(c.count)}
                        </p>
                        <span
                          className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded-full max-w-full truncate"
                          style={{ color: st.label, background: st.badgeBg, border: `1px solid ${st.stripe}` }}
                          title={badgeForTone(tone, L)}
                        >
                          {badgeForTone(tone, L)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="pt-1 border-t" style={{ borderColor: hairline }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: t.textSecondary }}>
                {L.hazardSection(SUMMARY.hazard)}
              </p>
              <div className="mt-3 space-y-5">
                <div>
                  <p className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: ANALYSIS_DANGER.textStrong }}>
                    <span className="inline-block w-0.5 h-3.5 rounded-full" style={{ background: ANALYSIS_DANGER.border }} />
                    {L.collisionHazard}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2.5" style={{ color: t.textSecondary }}>
                    {L.collisionIntro}
                  </p>
                  <ul className="flex flex-col">
                    {L.hazardItemsCollision.map((item) => {
                      const label =
                        locale === 'en' ? `${item.nameEn} ${L.vicinitySuffixEn}` : `${item.nameKo} ${L.vicinitySuffixKo}`;
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-2.5 py-2.5 border-b last:border-b-0"
                          style={{ borderColor: hairline }}
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: ANALYSIS_DANGER.border }}
                            aria-hidden
                          />
                          <span className="flex-1 min-w-0 text-[13px] font-medium leading-snug" style={{ color: t.textPrimary }}>
                            {label}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-md"
                            style={{
                              color: POINT_ORANGE,
                              background: 'rgba(255,142,43,0.12)',
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
                <div>
                  <p className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: ANALYSIS_WARN.textStrong }}>
                    <span className="inline-block w-0.5 h-3.5 rounded-full" style={{ background: ANALYSIS_WARN.border }} />
                    {L.pinchHazard}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2" style={{ color: t.textSecondary }}>
                    {L.pinchIntro}
                  </p>
                  {placeholderBox}
                </div>
              </div>
            </section>
          </div>
        )}

        {processTab === 'summary' && !isDark && panelUiVersion === 'compactTiles' && (
          <div className="flex flex-col gap-5 min-w-0">
            <div
              className="pl-3 pr-2 py-2.5 text-sm leading-relaxed flex gap-2 border-l-[3px]"
              style={{
                borderLeftColor: ANALYSIS_DANGER.border,
                background: 'rgba(254,226,226,0.55)',
                color: ANALYSIS_DANGER.textStrong,
              }}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.2} />
              <span>{L.hazardCallout}</span>
            </div>

            <section>
              <p className="text-sm font-bold" style={{ color: t.textPrimary }}>
                {L.summaryTitle}
              </p>
              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: t.textSecondary }}>
                {L.snapshotCaption}
              </p>
              <div
                className="mt-2 grid gap-2 min-w-0"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(7.5rem, 1fr))',
                }}
              >
                {summaryCards.map((c) => {
                  const tone = summaryTone(c.key);
                  const st = toneStyle(tone, false);
                  return (
                    <div
                      key={c.key}
                      className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border"
                      style={{
                        borderColor: hairline,
                        background: st.background,
                        boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset',
                      }}
                    >
                      <div className="h-1 w-full shrink-0" style={{ background: st.stripe }} aria-hidden />
                      <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-2 min-w-0">
                        <p
                          className="text-[10px] font-semibold leading-tight line-clamp-2"
                          style={{ color: t.textSecondary }}
                          title={c.label}
                        >
                          {c.label}
                        </p>
                        <p
                          className="text-lg font-bold tabular-nums leading-none tracking-tight"
                          style={{ color: t.textPrimary }}
                        >
                          {L.unitCount(c.count)}
                        </p>
                        <span
                          className="self-start text-[9px] font-bold px-1.5 py-0.5 rounded-full max-w-full truncate"
                          style={{ color: st.label, background: st.badgeBg, border: `1px solid ${st.stripe}` }}
                          title={badgeForTone(tone, L)}
                        >
                          {badgeForTone(tone, L)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="pt-1 border-t" style={{ borderColor: hairline }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: t.textSecondary }}>
                {L.hazardSection(SUMMARY.hazard)}
              </p>
              <div className="mt-3 space-y-5">
                <div>
                  <p className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: ANALYSIS_DANGER.textStrong }}>
                    <span className="inline-block w-0.5 h-3.5 rounded-full" style={{ background: ANALYSIS_DANGER.border }} />
                    {L.collisionHazard}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2.5" style={{ color: t.textSecondary }}>
                    {L.collisionIntro}
                  </p>
                  <ul className="flex flex-col">
                    {L.hazardItemsCollision.map((item) => {
                      const label =
                        locale === 'en' ? `${item.nameEn} ${L.vicinitySuffixEn}` : `${item.nameKo} ${L.vicinitySuffixKo}`;
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-2.5 py-2.5 border-b last:border-b-0"
                          style={{ borderColor: hairline }}
                        >
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: ANALYSIS_DANGER.border }}
                            aria-hidden
                          />
                          <span className="flex-1 min-w-0 text-[13px] font-medium leading-snug" style={{ color: t.textPrimary }}>
                            {label}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-md"
                            style={{
                              color: POINT_ORANGE,
                              background: 'rgba(255,142,43,0.1)',
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
                <div>
                  <p className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: ANALYSIS_WARN.textStrong }}>
                    <span className="inline-block w-0.5 h-3.5 rounded-full" style={{ background: ANALYSIS_WARN.border }} />
                    {L.pinchHazard}
                  </p>
                  <p className="text-[13px] leading-relaxed mb-2" style={{ color: t.textSecondary }}>
                    {L.pinchIntro}
                  </p>
                  {placeholderBox}
                </div>
              </div>
            </section>
          </div>
        )}

        {processTab === 'summary' && panelUiVersion === 'figmaDraft' && (
          <div className="flex min-w-0 flex-col gap-3 pb-0.5">
            <AnalysisFigmaDraftSummary
              locale={locale}
              t={t}
              FT={FT}
              hairline={hairline}
              rows={LIGHT_HAZARD_ROWS}
              openId={lightHazardOpenId}
              onToggle={toggleLightHazard}
              onHazardViewClick={onHazardViewClick}
              viewInScene={L.viewInScene}
              snapshotCaption={L.snapshotCaption}
              frameHazardZone={L.frameHazardZone}
              unitCount={L.unitCount}
              hazardTotal={SUMMARY.hazard}
            />
            <section className="min-w-0 border-t pt-3" style={{ borderColor: hairline }}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
                  {L.frameEquipmentAnalysis}
                </span>
                <span className="text-[12px] tabular-nums" style={{ color: t.textSecondary }}>
                  {L.unitCount(EQUIPMENT_FRAME_TOTAL)}
                </span>
              </div>
              <div className="flex border-b mb-2" style={{ borderColor: FT.borderSubtle }} role="tablist" aria-label={L.tabEquipment}>
                {equipmentTabsFrame.map((tab) => {
                  const active = lightEmbedEquipTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="flex-1 min-w-0 px-2 py-1.5 text-[12px] font-medium transition-colors"
                      style={{
                        color: active ? FT.textPrimary : FT.textSecondary,
                        borderBottom: active ? `2px solid ${POINT_ORANGE}` : '2px solid transparent',
                        marginBottom: -1,
                      }}
                      onClick={() => setLightEmbedEquipTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="min-h-0 min-w-0">
                {lightEmbedEquipTab === 'robot' && (
                  <RobotPflAnalysisContent locale={locale} isDark={isDark} tokens={t} onPflViewClick={onRobotPflViewClick} />
                )}
                {lightEmbedEquipTab === 'sensor' && (
                  <SensorAnalysisContent
                    locale={locale}
                    isDark={isDark}
                    tokens={t}
                    onOpenSensorCalculator={onOpenSensorCalculator}
                    onSensorCalcDetailViewClick={onSensorCalcDetailViewClick}
                  />
                )}
                {lightEmbedEquipTab === 'fence' && (
                  <FenceAnalysisContent locale={locale} isDark={isDark} tokens={t} onFenceProposalClick={onFenceProposalClick} />
                )}
              </div>
            </section>
            <AnalysisFigmaDraftRegulations
              locale={locale}
              t={t}
              FT={FT}
              hairline={hairline}
              rows={LIGHT_REG_ROWS}
              openId={lightRegOpenId}
              onToggle={toggleLightReg}
              onHazardViewClick={onHazardViewClick}
              viewInScene={L.viewInScene}
              frameRegulations={L.frameRegulations}
              unitCount={L.unitCount}
              regTotal={SUMMARY.regulatory}
            />
          </div>
        )}

        {processTab === 'summary' && (panelUiVersion === 'frameRef' || panelUiVersion === 'dashboard') && (
          <div className={`flex min-w-0 flex-col ${isDashboardLayout ? 'gap-4 pb-0.5' : 'gap-3.5 pb-1'}`}>
            {!isDashboardLayout ? (
              <p className="text-[11px] leading-relaxed" style={{ color: FT.textSecondary }}>
                {L.snapshotCaption}
              </p>
            ) : null}

            <section>
              <div className="mb-1.5 flex items-center justify-between gap-2 pt-0.5">
                <span className="flex min-w-0 items-center gap-1">
                  <span className="text-[11px] font-medium" style={{ color: FT.textPrimary }}>
                    {L.frameHazardZone}
                  </span>
                  {isDashboardLayout ? (
                    <button
                      type="button"
                      className="shrink-0 rounded p-0.5 transition-colors hover:opacity-90"
                      style={{ color: FT.textTertiary }}
                      title={L.snapshotCaption}
                      aria-label={L.snapshotCaption}
                    >
                      <Info className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                    </button>
                  ) : null}
                </span>
                <span
                  className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ color: FT.textTertiary, background: FT.bgSecondary }}
                >
                  {L.unitCount(SUMMARY.hazard)}
                </span>
              </div>
              <div className="flex flex-col gap-0">
                {LIGHT_HAZARD_ROWS.map((row) => {
                  const open = lightHazardOpenId === row.id;
                  const b = frameBadgeStyle(row.tone, FT);
                  const name = locale === 'en' ? row.nameEn : row.nameKo;
                  const sub = locale === 'en' ? row.subEn : row.subKo;
                  const body = locale === 'en' ? row.bodyEn : row.bodyKo;
                  const refLine = locale === 'en' ? row.refEn : row.refKo;
                  const primary = row.primaryKo
                    ? locale === 'en'
                      ? row.primaryEn!
                      : row.primaryKo
                    : undefined;
                  const secondary =
                    row.secondaryKo && (locale === 'en' ? row.secondaryEn! : row.secondaryKo);
                  return (
                    <div
                      key={row.id}
                      className="rounded-2xl overflow-hidden mb-3 last:mb-0"
                      style={{
                        boxShadow: t.elevationSection,
                        border: isDark
                          ? open
                            ? '1px solid rgba(56,189,248,0.22)'
                            : 'none'
                          : `1px solid ${open ? 'rgba(24,95,165,0.22)' : 'rgba(15,23,42,0.07)'}`,
                      }}
                    >
                      <div
                        className="w-full flex items-center gap-2 px-2.5 py-2 text-left transition-colors hover:opacity-95 cursor-pointer"
                        style={{
                          background: open ? FT.bgInfoRow : FT.bgPanel,
                          borderBottom: open ? `1px solid ${FT.borderSubtle}` : undefined,
                        }}
                        role="button"
                        tabIndex={0}
                        aria-expanded={open}
                        onClick={() => toggleLightHazard(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleLightHazard(row.id);
                          }
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-medium"
                          style={{ background: b.bg, color: b.fg }}
                          aria-hidden
                        >
                          {b.label}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-xs font-medium leading-snug"
                            style={{ color: open ? FT.textInfoStrong : FT.textPrimary }}
                          >
                            {name}
                          </span>
                          <span
                            className="block text-[10px] mt-0.5 leading-snug"
                            style={{ color: open ? FT.textInfo : FT.textSecondary }}
                          >
                            {sub}
                          </span>
                        </span>
                        {row.showView3d && (
                          <button
                            type="button"
                            className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border cursor-pointer"
                            style={{
                              borderColor: FT.viewBtnBorder,
                              background: FT.bgPanel,
                              color: FT.viewBtnText,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onHazardViewClick?.('c1', row.tone === 'warn' && row.id === 'hz2' ? 'pinch' : 'collision');
                            }}
                          >
                            {L.viewInScene}
                          </button>
                        )}
                        <ChevronDown
                          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                          style={{ color: FT.textTertiary }}
                          aria-hidden
                        />
                      </div>
                      {open && (
                        <div className="px-3 py-2.5" style={{ background: FT.expandBoxBg }}>
                          <p className="text-[11px] leading-relaxed" style={{ color: FT.textSecondary }}>
                            {body}
                          </p>
                          <p className="text-[10px] mt-1.5" style={{ color: FT.textTertiary }}>
                            {refLine}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {primary && (
                              <button
                                type="button"
                                className="text-[10px] font-medium px-2 py-1 rounded-md border flex items-center gap-1"
                                style={{
                                  borderColor: row.primaryIsSuggest ? FT.viewBtnBorder : FT.border,
                                  background: row.primaryIsSuggest ? FT.bgInfoTint : FT.bgPanel,
                                  color: row.primaryIsSuggest ? FT.viewBtnText : FT.textPrimary,
                                }}
                              >
                                {primary}
                                {row.primaryIsSuggest && <ExternalLink className="w-3 h-3 opacity-70" aria-hidden />}
                              </button>
                            )}
                            {secondary && (
                              <button
                                type="button"
                                className="text-[10px] font-medium px-2 py-1 rounded-md border"
                                style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                              >
                                {secondary}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {!isDashboardLayout ? (
              <div className="h-px my-1" style={{ background: FT.borderSubtle }} aria-hidden />
            ) : null}

            <section>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium" style={{ color: FT.textPrimary }}>
                  {L.frameEquipmentAnalysis}
                </span>
                <span
                  className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ color: FT.textTertiary, background: FT.bgSecondary }}
                >
                  {L.unitCount(EQUIPMENT_FRAME_TOTAL)}
                </span>
              </div>
              <div
                className="flex border-b mb-2"
                style={{ borderColor: FT.borderSubtle }}
                role="tablist"
                aria-label={L.tabEquipment}
              >
                {equipmentTabsFrame.map((tab) => {
                  const active = lightEmbedEquipTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="text-[11px] px-2.5 py-1.5 font-medium transition-colors"
                      style={{
                        color: active ? FT.textPrimary : FT.textSecondary,
                        borderBottom: active ? `2px solid ${FT.textPrimary}` : '2px solid transparent',
                        marginBottom: -1,
                      }}
                      onClick={() => setLightEmbedEquipTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <div className="min-h-0 min-w-0">
                {lightEmbedEquipTab === 'robot' && (
                  <RobotPflAnalysisContent
                    locale={locale}
                    isDark={isDark}
                    tokens={t}
                    onPflViewClick={onRobotPflViewClick}
                  />
                )}
                {lightEmbedEquipTab === 'sensor' && (
                  <SensorAnalysisContent
                    locale={locale}
                    isDark={isDark}
                    tokens={t}
                    onOpenSensorCalculator={onOpenSensorCalculator}
                    onSensorCalcDetailViewClick={onSensorCalcDetailViewClick}
                  />
                )}
                {lightEmbedEquipTab === 'fence' && (
                  <FenceAnalysisContent locale={locale} isDark={isDark} tokens={t} onFenceProposalClick={onFenceProposalClick} />
                )}
              </div>
            </section>

            {!isDashboardLayout ? (
              <div className="h-px my-1" style={{ background: FT.borderSubtle }} aria-hidden />
            ) : null}

            <section>
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="text-[11px] font-medium" style={{ color: FT.textPrimary }}>
                  {L.frameRegulations}
                </span>
                <span
                  className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ color: FT.textTertiary, background: FT.bgSecondary }}
                >
                  {L.unitCount(SUMMARY.regulatory)}
                </span>
              </div>
              <div className="flex flex-col gap-0">
                {LIGHT_REG_ROWS.map((row) => {
                  const open = lightRegOpenId === row.id;
                  const b = frameBadgeStyle(row.tone, FT);
                  const name = locale === 'en' ? row.nameEn : row.nameKo;
                  const sub = locale === 'en' ? row.subEn : row.subKo;
                  const body = locale === 'en' ? row.bodyEn : row.bodyKo;
                  const refLine = locale === 'en' ? row.refEn : row.refKo;
                  const primary = row.primaryKo
                    ? locale === 'en'
                      ? row.primaryEn!
                      : row.primaryKo
                    : undefined;
                  const secondary =
                    row.secondaryKo && (locale === 'en' ? row.secondaryEn! : row.secondaryKo);
                  const single = row.singleKo && (locale === 'en' ? row.singleEn! : row.singleKo);
                  return (
                    <div key={row.id} className="mb-1">
                      <div
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md border text-left transition-colors hover:opacity-95 cursor-pointer"
                        style={{
                          borderColor: open ? FT.borderInfo : FT.border,
                          background: open ? FT.bgInfoRow : FT.bgPanel,
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleLightReg(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleLightReg(row.id);
                          }
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[8px] font-medium"
                          style={{ background: b.bg, color: b.fg }}
                          aria-hidden
                        >
                          {b.label}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-xs font-medium leading-snug"
                            style={{ color: open ? FT.textInfoStrong : FT.textPrimary }}
                          >
                            {name}
                          </span>
                          <span
                            className="block text-[10px] mt-0.5 leading-snug"
                            style={{ color: open ? FT.textInfo : FT.textSecondary }}
                          >
                            {sub}
                          </span>
                        </span>
                        {row.showView3d && (
                          <button
                            type="button"
                            className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-md border cursor-pointer"
                            style={{
                              borderColor: FT.viewBtnBorder,
                              background: FT.bgPanel,
                              color: FT.viewBtnText,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onHazardViewClick?.('c1', 'collision');
                            }}
                          >
                            {L.viewInScene}
                          </button>
                        )}
                      </div>
                      {open && (
                        <div
                          className="mt-0.5 rounded-md border px-3 py-2.5 mb-0.5"
                          style={{ borderColor: FT.border, background: FT.expandBoxBg }}
                        >
                          <p className="text-[11px] leading-relaxed" style={{ color: FT.textSecondary }}>
                            {body}
                          </p>
                          <p className="text-[10px] mt-1.5" style={{ color: FT.textTertiary }}>
                            {refLine}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {single && (
                              <button
                                type="button"
                                className="text-[10px] font-medium px-2 py-1 rounded-md border"
                                style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                              >
                                {single}
                              </button>
                            )}
                            {primary && (
                              <button
                                type="button"
                                className="text-[10px] font-medium px-2 py-1 rounded-md border flex items-center gap-1"
                                style={{
                                  borderColor: row.primaryIsSuggest ? FT.viewBtnBorder : FT.border,
                                  background: row.primaryIsSuggest ? FT.bgInfoTint : FT.bgPanel,
                                  color: row.primaryIsSuggest ? FT.viewBtnText : FT.textPrimary,
                                }}
                              >
                                {primary}
                                {row.primaryIsSuggest && <ExternalLink className="w-3 h-3 opacity-70" aria-hidden />}
                              </button>
                            )}
                            {secondary && (
                              <button
                                type="button"
                                className="text-[10px] font-medium px-2 py-1 rounded-md border"
                                style={{ borderColor: FT.border, background: FT.bgPanel, color: FT.textPrimary }}
                              >
                                {secondary}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {processTab === 'equipment' && (
          <div className="flex flex-col gap-2.5 min-h-0 min-w-0">
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: equipmentUseUnderlineTabs ? FT.textSecondary : isDark ? t.textSecondary : FL.textSecondary }}
            >
              {L.equipmentLead}
            </p>
            {equipmentUseUnderlineTabs ? (
              <div
                className="flex border-b shrink-0"
                style={{ borderColor: FT.borderSubtle }}
                role="tablist"
                aria-label={L.tabEquipment}
              >
                {equipmentTabsFrame.map((tab) => {
                  const active = equipmentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className="flex-1 min-w-0 text-[11px] font-medium px-2 py-2 transition-colors"
                      style={{
                        color: active ? FT.textPrimary : FT.textSecondary,
                        borderBottom: active ? `2px solid ${FT.textPrimary}` : '2px solid transparent',
                        marginBottom: -1,
                      }}
                      onClick={() => setEquipmentTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                className="flex rounded-lg p-0.5 gap-0.5 shrink-0"
                style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(15,23,42,0.06)' }}
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
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-md text-[11px] font-bold leading-tight transition-all"
                      style={{
                        color: active ? '#fff' : t.textSecondary,
                        background: active ? POINT_ORANGE : 'transparent',
                      }}
                      onClick={() => setEquipmentTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="min-h-0 min-w-0 pt-1">
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
          </>
        )}
      </div>
    </div>
  );
}
