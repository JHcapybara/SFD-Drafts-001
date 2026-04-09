import { useState } from 'react';
import { AlertTriangle, ChevronDown, ClipboardList, Cpu, ExternalLink, Shield } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER, ANALYSIS_SAFE, ANALYSIS_WARN } from './analysisPanelSemantics';
import { ANALYSIS_FRAME_DARK, ANALYSIS_FRAME_LIGHT } from './analysisPanelFrameRef';
import type { AnalysisFrameTokens, HazardRowTone } from './analysisPanelFrameRef';
import { RobotPflAnalysisContent } from './RobotPflAnalysisContent';
import { SensorAnalysisContent } from './SensorAnalysisContent';
import { FenceAnalysisContent } from './FenceAnalysisContent';
import { ResidualRiskContent } from './ResidualRiskContent';

export type AnalysisEquipmentTab = 'robot' | 'sensor' | 'fence';

/** UI 비교용: 참고안(와이어) vs 컴팩트 — 라이트·다크 공통으로 전환 */
export type AnalysisPanelUiVersion = 'frameRef' | 'compactTiles';

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

type LightHazardRow = {
  id: string;
  tone: HazardRowTone;
  nameKo: string;
  nameEn: string;
  subKo: string;
  subEn: string;
  bodyKo: string;
  bodyEn: string;
  refKo: string;
  refEn: string;
  showView3d: boolean;
  primaryKo?: string;
  primaryEn?: string;
  secondaryKo?: string;
  secondaryEn?: string;
  primaryIsSuggest?: boolean;
};

const LIGHT_HAZARD_ROWS: LightHazardRow[] = [
  {
    id: 'hz1',
    tone: 'fail',
    nameKo: '충돌 위험가능성 영역',
    nameEn: 'Collision risk zone',
    subKo: '펜스 개구부 안전거리 미달 — 600mm / 기준 870mm',
    subEn: 'Fence opening safety distance short — 600mm / required 870mm',
    bodyKo:
      'ISO 13857 Table 4 기준, 개구부 폭 600mm 시 최소 안전거리는 870mm입니다. 현재 라이트 커튼까지의 이격 거리가 기준에 미달합니다.',
    bodyEn:
      'Per ISO 13857 Table 4, a 600mm opening requires at least 870mm safety distance. The current clearance to the light curtain is below the requirement.',
    refKo: '참조: ISO 13857:2019 Table 4',
    refEn: 'Ref: ISO 13857:2019 Table 4',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz2',
    tone: 'warn',
    nameKo: '끼임 가능성 영역',
    nameEn: 'Pinch / entrapment zone',
    subKo: '컨베이어 하단부 간격 25mm 이하 감지',
    subEn: '≤25mm gap detected under conveyor',
    bodyKo:
      '컨베이어 하단 구조물과 바닥 사이 간격이 25mm 이하로 감지되었습니다. 신체 끼임 가능성이 있어 가드 설치 또는 구조 변경이 권고됩니다.',
    bodyEn:
      'A ≤25mm gap was detected under the conveyor. Entrapment risk is present; guarding or structural change is recommended.',
    refKo: '참조: ISO 13854:2017',
    refEn: 'Ref: ISO 13854:2017',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz3',
    tone: 'warn',
    nameKo: '충돌과 끼임 동시 가능성 영역',
    nameEn: 'Combined collision & pinch zone',
    subKo: '로봇 운전영역 내 복합 위험요소 존재',
    subEn: 'Multiple hazards present in robot operating space',
    bodyKo:
      '로봇 운전영역 내에 충돌과 끼임이 동시에 발생할 수 있는 구간이 확인되었습니다. 설비 재배치 또는 추가 방호 조치가 필요합니다.',
    bodyEn:
      'Areas where collision and pinch can occur together were found. Relocate equipment or add guarding.',
    refKo: '참조: ISO 10218-2:2011 §5.4',
    refEn: 'Ref: ISO 10218-2:2011 §5.4',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz4',
    tone: 'pass',
    nameKo: '개구부',
    nameEn: 'Opening',
    subKo: '상단 개구부 없음 — 기준 충족',
    subEn: 'No top opening — requirement met',
    bodyKo: '상단 개구부가 없으며, 현재 설치 기준을 충족합니다.',
    bodyEn: 'No top opening; installation meets the applicable requirements.',
    refKo: '참조: ISO 13857:2019',
    refEn: 'Ref: ISO 13857:2019',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
  {
    id: 'hz5',
    tone: 'pass',
    nameKo: '잔존 위험영역',
    nameEn: 'Residual risk zone',
    subKo: '방호 후 잔존 위험 — 허용 수준 이내',
    subEn: 'After guarding — residual risk within acceptable limits',
    bodyKo: '방호 조치 후 잔존 위험이 허용 수준 이내로 관리되고 있습니다.',
    bodyEn: 'Residual risk after protective measures is within acceptable limits.',
    refKo: '참조: ISO 12100:2010',
    refEn: 'Ref: ISO 12100:2010',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
];

type LightRegRow = {
  id: string;
  tone: HazardRowTone;
  nameKo: string;
  nameEn: string;
  subKo: string;
  subEn: string;
  bodyKo: string;
  bodyEn: string;
  refKo: string;
  refEn: string;
  showView3d: boolean;
  primaryKo?: string;
  primaryEn?: string;
  secondaryKo?: string;
  secondaryEn?: string;
  primaryIsSuggest?: boolean;
  singleKo?: string;
  singleEn?: string;
};

const LIGHT_REG_ROWS: LightRegRow[] = [
  {
    id: 'rg1',
    tone: 'fail',
    nameKo: '비상정지 버튼 위치 위반',
    nameEn: 'E-stop placement violation',
    subKo: 'E-STOP이 보호영역 내부에 위치',
    subEn: 'E-stop located inside the protected zone',
    bodyKo:
      '비상정지 버튼이 보호영역 내부에 설치되어 있습니다. 비상 시 작업자가 위험에 노출될 수 있으므로 보호영역 외부로 재배치가 필요합니다.',
    bodyEn:
      'The e-stop is inside the protected zone. Relocate it outside so operators are not exposed during emergencies.',
    refKo: '참조: ISO 10218-2:2011 §5.7.1',
    refEn: 'Ref: ISO 10218-2:2011 §5.7.1',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'rg2',
    tone: 'warn',
    nameKo: '산업안전보건 표지 미확인',
    nameEn: 'Safety signage not verified',
    subKo: '출입문 표지 부착 여부 확인 필요',
    subEn: 'Verify signage on access doors',
    bodyKo:
      '출입문에 산업안전보건 표지 부착 여부를 확인해주세요. 안전보건규칙 제37조에 따라 부착이 의무입니다.',
    bodyEn: 'Verify industrial safety signage on doors. Attachment is mandatory under applicable rules.',
    refKo: '참조: 산업안전보건규칙 제37조',
    refEn: 'Ref: Industrial safety and health rules (Art. 37)',
    showView3d: false,
    singleKo: '확인 완료 처리',
    singleEn: 'Mark done',
  },
  {
    id: 'rg3',
    tone: 'pass',
    nameKo: '로봇 설치 신고',
    nameEn: 'Robot installation notification',
    subKo: '유해·위험 기계 설치 신고 대상 확인',
    subEn: 'Hazardous machinery notification applicability checked',
    bodyKo: '유해·위험 기계 설치 신고 대상 여부가 확인되었습니다.',
    bodyEn: 'Notification requirements for hazardous machinery were checked.',
    refKo: '참조: 산업안전보건법 제44조',
    refEn: 'Ref: OSH Act (Art. 44)',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
  {
    id: 'rg4',
    tone: 'pass',
    nameKo: '안전검사 주기',
    nameEn: 'Safety inspection cycle',
    subKo: '정기검사 주기 내 운용 중',
    subEn: 'Operating within periodic inspection cycle',
    bodyKo: '현재 설비는 정기 안전검사 주기 내에서 운용 중입니다.',
    bodyEn: 'The equipment is operated within the periodic safety inspection cycle.',
    refKo: '참조: 산업안전보건법 제93조',
    refEn: 'Ref: OSH Act (Art. 93)',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
];

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
  onOpenSensorCalculator,
  onHazardViewClick,
  onRobotPflViewClick,
  onSensorCalcDetailViewClick,
  onFenceProposalClick,
  onResidualLocationView,
}: Props) {
  const L = copy(locale);
  const [panelUiVersion, setPanelUiVersion] = useState<AnalysisPanelUiVersion>('frameRef');
  const [processTab, setProcessTab] = useState<ProcessTab>('summary');
  const [equipmentTab, setEquipmentTab] = useState<AnalysisEquipmentTab>('robot');
  const [lightHazardOpenId, setLightHazardOpenId] = useState<string | null>('hz1');
  const [lightRegOpenId, setLightRegOpenId] = useState<string | null>(null);
  const [lightEmbedEquipTab, setLightEmbedEquipTab] = useState<AnalysisEquipmentTab>('robot');

  const FL = ANALYSIS_FRAME_LIGHT;
  const useFrameRefChrome = panelUiVersion === 'frameRef';
  const FT: AnalysisFrameTokens = isDark ? ANALYSIS_FRAME_DARK : ANALYSIS_FRAME_LIGHT;

  const summaryCards = [
    { key: 'hazard' as const, label: L.cardHazard, count: SUMMARY.hazard },
    { key: 'robot' as const, label: L.cardRobot, count: SUMMARY.robot },
    { key: 'sf' as const, label: L.cardSensorFence, count: SUMMARY.sensorFence },
    { key: 'regulatory' as const, label: L.cardRegulatory, count: SUMMARY.regulatory },
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

  const canvasBg = useFrameRefChrome ? FT.bgCanvas : isDark ? 'rgba(0,0,0,0.12)' : FL.bgCanvas;
  const hairline = t.inputBorder;
  const versionUsesFrameTokens = useFrameRefChrome;

  const toggleLightHazard = (id: string) => {
    setLightHazardOpenId((cur) => (cur === id ? null : id));
  };
  const toggleLightReg = (id: string) => {
    setLightRegOpenId((cur) => (cur === id ? null : id));
  };

  const equipmentUseUnderlineTabs = useFrameRefChrome;

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
      className="h-full flex flex-col rounded-xl overflow-hidden min-h-0 min-w-0 border"
      style={{
        borderColor: t.inputBorder,
        background: t.tabBarBg,
        boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.28)' : '0 2px 16px rgba(15,23,42,0.06)',
      }}
    >
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b"
        style={{
          borderColor: hairline,
          background: versionUsesFrameTokens ? FT.bgSecondary : isDark ? 'rgba(255,255,255,0.04)' : FL.bgSecondary,
        }}
      >
        <label
          htmlFor="analysis-panel-ui-version"
          className="text-[10px] font-semibold shrink-0 max-w-[40%]"
          style={{ color: versionUsesFrameTokens ? FT.textSecondary : isDark ? t.textSecondary : FL.textSecondary }}
        >
          {L.panelVersionLabel}
        </label>
        <div className="relative flex-1 min-w-0">
          <select
            id="analysis-panel-ui-version"
            value={panelUiVersion}
            onChange={(e) => setPanelUiVersion(e.target.value as AnalysisPanelUiVersion)}
            className="w-full text-[11px] font-medium py-1 pl-2 pr-8 rounded-md border appearance-none cursor-pointer"
            style={
              versionUsesFrameTokens
                ? {
                    borderColor: FT.border,
                    background: FT.bgPanel,
                    color: FT.textPrimary,
                  }
                : {
                    borderColor: isDark ? t.inputBorder : FL.border,
                    background: isDark ? t.inputBg : FL.bgPanel,
                    color: isDark ? t.textPrimary : FL.textPrimary,
                  }
            }
            aria-label={L.panelVersionLabel}
          >
            <option value="frameRef">{L.panelVersionFrameRef}</option>
            <option value="compactTiles">{L.panelVersionCompact}</option>
          </select>
          <ChevronDown
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: versionUsesFrameTokens ? FT.textTertiary : isDark ? t.textSecondary : FL.textTertiary }}
            aria-hidden
          />
        </div>
      </div>

      {/* 상단: 컴팩트=SafetyDesigner·오렌지 탭 / 참고안=셀렉트·요약 그리드·밑줄 단계 탭 (라이트·다크) */}
      <div className="shrink-0 border-b" style={{ borderColor: hairline, background: useFrameRefChrome ? FT.bgPanel : undefined }}>
        {!useFrameRefChrome ? (
          <div className="px-3 pt-2 pb-2">
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
        ) : (
          <div className="px-3 pt-2 pb-1.5">
            <p className="text-[13px] font-medium leading-tight" style={{ color: FT.textPrimary }}>
              {L.title}
            </p>
            <div className="relative mt-1.5 mb-2">
              <select
                className="w-full text-xs py-1 pl-2 pr-8 rounded-md border appearance-none cursor-pointer"
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
        className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-3 py-2.5 flex flex-col min-w-0"
        style={{ background: canvasBg }}
      >
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

        {processTab === 'summary' && panelUiVersion === 'frameRef' && (
          <div className="flex flex-col gap-3.5 min-w-0 pb-1">
            <p className="text-[11px] leading-relaxed" style={{ color: FT.textSecondary }}>
              {L.snapshotCaption}
            </p>

            <section>
              <div className="flex items-center justify-between gap-2 mb-1.5 pt-0.5">
                <span className="text-[11px] font-medium" style={{ color: FT.textPrimary }}>
                  {L.frameHazardZone}
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
                    <div key={row.id} className="mb-1">
                      <div
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md border text-left transition-colors hover:opacity-95 cursor-pointer"
                        style={{
                          borderColor: open ? FT.borderInfo : FT.border,
                          background: open ? FT.bgInfoRow : FT.bgPanel,
                        }}
                        role="button"
                        tabIndex={0}
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

            <div className="h-px my-1" style={{ background: FT.borderSubtle }} aria-hidden />

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

            <div className="h-px my-1" style={{ background: FT.borderSubtle }} aria-hidden />

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
      </div>
    </div>
  );
}
