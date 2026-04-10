import { useMemo, useState, useEffect, useCallback, useRef, type CSSProperties } from 'react';
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Upload,
  FileText,
  Settings,
  GripHorizontal,
  Play,
  Square,
  Repeat,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import { DARK as PROPERTY_DARK_TOKENS, LIGHT as PROPERTY_LIGHT_TOKENS } from './PropertyPanel';
import { getItemIconPreference, rotationDegForPreference } from './sfd/itemIconPreferences';
import {
  WORKSPACE_CONTENT_TOP_PX,
  WORKSPACE_HEADER_HEIGHT_PX,
  WORKSPACE_HEADER_TOP_PX,
} from './chromeLayout';
import { SafeticsBrandLockup } from './SafeticsBrandLockup';
import { ProcessInfoEditModal, type ProcessInfoSnapshot } from './ProcessInfoEditModal';
import { ModalExamplesLayer } from './ModalExamplesLayer';
import type { OnboardingOpenAppAction } from './onboardingAppActions';
import { OnboardingGuideLayer } from './OnboardingGuideLayer';
import { SFD_ONBOARDING_TARGET_ATTR, SfdOnboardingTarget } from './sfd/sfdOnboardingTargets';
import { SafetyAiPanel, type SafetyAiColors } from './SafetyAiPanel';
import { SafetyDiagnosisCellPickerModal, type SafetyDiagnosisCellItem } from './SafetyDiagnosisCellPickerModal';
import { SafetyDiagnosisModal } from './SafetyDiagnosisModal';
import { SensorSafetyDistanceCalculatorModal } from './SensorSafetyDistanceCalculatorModal';
import { CriLegend } from './CriLegend';
import {
  AnalysisSidePanel,
  type AnalysisPanelUiVersion,
  getAnalysisPanelLayoutChromeCopy,
} from './AnalysisSidePanel';
import {
  GridCanvasEditMenuPopover,
  LayoutAlignEditMenuPopover,
  ScaleEditMenuPopover,
  RulerEditMenuPopover,
  SnapSettingsEditMenuPopover,
  ObjectSnapEditMenuPopover,
  ViewModeEditMenuPopover,
  type CanvasBackgroundId,
  type HeaderEditToolPopover,
  type SnapModeId,
} from './WorkspaceEditMenuPopover';
import type { CellTreeNodeType } from './treePropertyBridge';

const HEADER_EDIT_POPOVER_KEYS: HeaderEditToolPopover[] = [
  'grid',
  'view',
  'layout',
  'scale',
  'ruler',
  'object snap',
  'snap',
];

function isHeaderEditPopoverKey(label: string): label is HeaderEditToolPopover {
  return HEADER_EDIT_POPOVER_KEYS.includes(label as HeaderEditToolPopover);
}

const DEFAULT_HEADER_PROCESS_NAME: Record<'ko' | 'en', string> = {
  ko: '목업: EV 배터리 팩 조립 라인 01',
  en: 'Mockup: EV Battery Pack Assembly Line 01',
};

export type LeftMode = 'library' | 'tree' | 'analysis' | 'riskassessment' | 'safetyai';

const LEFT_GNB_ICON_FALLBACK: Record<LeftMode, number> = {
  library: 45,
  tree: 70,
  analysis: 164,
  riskassessment: 47,
  safetyai: 197,
};

function leftGnbIconIndex(mode: LeftMode): number {
  const p = getItemIconPreference(`workspace-gnb:${mode}`);
  return p?.iconIndex ?? LEFT_GNB_ICON_FALLBACK[mode];
}

type BottomTab = 'timeline' | 'analysis';
type TreeNodeType = CellTreeNodeType;
type LibraryStage = 'root' | 'brands' | 'models';
type HeaderViewKey = 'grid' | 'view' | 'rotate' | 'layout' | 'scale' | 'ruler' | 'object snap' | 'snap';
type TimelineTarget = 'additional' | 'cobot1' | 'cobot2' | 'mobile' | 'mobile_ee' | 'manipulator';

interface TreeNodeItem {
  id: string;
  label: string;
  type: TreeNodeType;
  cri?: string;
  processBadge?: boolean;
  children?: TreeNodeItem[];
}

interface LibraryChip {
  id: string;
  label: string;
}

interface LibrarySection {
  id: 'robot' | 'layout';
  title: string;
  icon: 'robot' | 'layout';
  chips: LibraryChip[];
}

type LibraryDrawingInfo = {
  fileName: string;
  sizeLabel: string;
  updatedAtMs: number;
};

function formatDrawingFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const LEFT_GNB_WIDTH = 56;
const LEFT_PANEL_MIN_WIDTH = 320;
/** 좌측 영역(라이브러리 등) 공통 상한. Safety AI는 선택 시 이 값으로 맞춤 */
const LEFT_PANEL_MAX_WIDTH = 560;
const BOTTOM_GAP = 8;
const BOTTOM_HEIGHT_EXPANDED = 220;
const BOTTOM_HEIGHT_COLLAPSED = 74;
const BOTTOM_COLLAPSED_WIDTH = 460;
const BOTTOM_HEIGHT_MIN = 140;
const BOTTOM_HEIGHT_MAX = 360;
const TREE_INDENT_PX = 16;

const TREE_DATA: TreeNodeItem[] = [
  {
    id: 'cell-robot-abc',
    label: '로봇 셀 ABC',
    type: 'cell',
    children: [
      {
        id: 'manip-main',
        label: '머니퓰레이터',
        type: 'manipulator',
        cri: '0.7',
        processBadge: true,
        children: [
          {
            id: 'gripper',
            label: '그리퍼',
            type: 'gripper',
            children: [
              { id: 'gripper-1', label: '그리퍼 1', type: 'gripper' },
              { id: 'impact-g1', label: '그리퍼 충돌예상부위', type: 'impact' },
              { id: 'gripper-2', label: '그리퍼 2', type: 'gripper' },
              { id: 'impact-g2', label: '그리퍼 충돌예상부위', type: 'impact' },
            ],
          },
          {
            id: 'motion-settings',
            label: '모션 설정',
            type: 'manipulator',
            children: [{ id: 'motion-file', label: '모션 파일명', type: 'motion' }],
          },
          { id: 'zone-operating', label: '운전 영역', type: 'zone' },
          { id: 'zone-max', label: '최대운전영역', type: 'zone' },
          { id: 'zone-collab', label: '협동작업영역', type: 'zone' },
          { id: 'impact-robot', label: '로봇 충돌예상부위', type: 'impact' },
        ],
      },
      {
        id: 'mobile-manip',
        label: '모바일 머니퓰레이터',
        type: 'mobile',
        children: [
          {
            id: 'mobile-base',
            label: '모바일',
            type: 'mobile',
            processBadge: true,
            children: [
              { id: 'mobile-path', label: '경로 설정', type: 'mobile' },
              { id: 'mobile-drive-1', label: '모바일 1 운전 구역 1', type: 'zone' },
              { id: 'mobile-work-1', label: '모바일 1 작업 구역 1', type: 'zone' },
            ],
          },
          {
            id: 'mobile-inner-manip',
            label: '머니퓰레이터',
            type: 'manipulator',
            cri: '0.7',
            processBadge: true,
            children: [
              { id: 'zone-operating-mm', label: '운전 영역', type: 'zone' },
              { id: 'zone-max-mm', label: '최대운전영역', type: 'zone' },
              { id: 'zone-collab-mm', label: '협동작업영역', type: 'zone' },
            ],
          },
        ],
      },
      {
        id: 'manip-plus-axis',
        label: '머니퓰레이터 + 부가축',
        type: 'manipulator',
        children: [
          { id: 'main-manip', label: '머니퓰레이터', type: 'manipulator', cri: '0.7', processBadge: true },
          { id: 'axis-1', label: '부가축 1', type: 'axis', processBadge: true },
          { id: 'axis-2', label: '부가축 2', type: 'axis', processBadge: true },
        ],
      },
      {
        id: 'safety-conditions',
        label: '로봇 셀 안전 분석 조건',
        type: 'safety',
        children: [
          {
            id: 'estop-group',
            label: '비상정지 버튼',
            type: 'safety',
            children: [
              { id: 'estop-a', label: '비상정지 버튼(0정지) · 로봇 1', type: 'safety' },
              { id: 'estop-b', label: '비상정지 버튼(1정지) · 로봇 2, 로봇 3', type: 'safety' },
            ],
          },
          {
            id: 'fence-group',
            label: '펜스 그룹',
            type: 'safety',
            children: [
              { id: 'fence-1', label: '펜스 1', type: 'safety' },
              { id: 'fence-dist-1', label: '안전 설치 거리', type: 'safety' },
              { id: 'fence-2', label: '펜스 2', type: 'safety' },
              { id: 'fence-dist-2', label: '안전 설치 거리', type: 'safety' },
            ],
          },
          {
            id: 'laser-group',
            label: '레이저 스캐너',
            type: 'safety',
            children: [
              { id: 'laser-dev-1', label: '레이저 스캐너 1', type: 'safety' },
              { id: 'laser-z1', label: '감지영역 1 · 로봇 1', type: 'safety' },
              { id: 'laser-z2', label: '감지영역 2 · 로봇 2, 로봇 3', type: 'safety' },
              { id: 'laser-stop', label: '안전 정지 거리', type: 'safety' },
            ],
          },
          {
            id: 'light-group',
            label: '라이트커튼',
            type: 'safety',
            children: [
              { id: 'light-1', label: '라이트 커튼 1', type: 'safety' },
              { id: 'light-z1', label: '감지영역', type: 'safety' },
              { id: 'light-dist', label: '안전 설치 거리', type: 'safety' },
            ],
          },
          {
            id: 'mat-group',
            label: '안전매트',
            type: 'safety',
            children: [
              { id: 'mat-1', label: '안전매트 1', type: 'safety' },
              { id: 'mat-z', label: '감지영역', type: 'safety' },
              { id: 'mat-stop', label: '안전 정지 거리', type: 'safety' },
            ],
          },
          {
            id: 'lidar-group',
            label: '라이다 센서',
            type: 'safety',
            children: [
              { id: 'lidar-dev-1', label: '라이다 1', type: 'safety' },
              { id: 'lidar-z1', label: '감지영역 1 · 로봇 1', type: 'safety' },
            ],
          },
        ],
      },
      { id: 'facility-1', label: '설비', type: 'facility' },
      { id: 'facility-2', label: '설비', type: 'facility' },
    ],
  },
  {
    id: 'unassigned-root',
    label: '셀 미지정 그룹',
    type: 'cell',
    children: [
      { id: 'unassigned-laser', label: '레이저 스캐너', type: 'safety' },
      { id: 'unassigned-fac-1', label: '설비', type: 'facility' },
      { id: 'unassigned-fac-2', label: '설비', type: 'facility' },
    ],
  },
];

const TREE_TYPE_ICON: Record<TreeNodeType, string> = {
  cell: '▦',
  manipulator: '🦾',
  gripper: '🖐',
  zone: '⬚',
  impact: '·',
  axis: '⚙',
  mobile: '▸',
  motion: '⌁',
  safety: '⚠',
  facility: '🏭',
};

const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: 'robot',
    title: '로봇',
    icon: 'robot',
    chips: [
      { id: 'collab-robot', label: '협동 로봇' },
      { id: 'industrial-robot', label: '산업용 로봇' },
      { id: 'mobile-robot', label: '이동 로봇' },
      { id: 'robot-tech', label: '로봇 기술 설비' },
      { id: 'axis', label: '부가축' },
    ],
  },
  {
    id: 'layout',
    title: '레이아웃 설비',
    icon: 'layout',
    chips: [
      { id: 'conveyor', label: '컨베이어' },
      { id: 'production', label: '생산 설비' },
      { id: 'profile', label: '프로파일' },
      { id: 'interior', label: '인테리어' },
      { id: 'button', label: '버튼' },
      { id: 'box', label: '박스' },
      { id: 'pallet', label: '팔레트' },
      { id: 'etc-layout', label: '기타 설비' },
      { id: 'worker', label: '작업자' },
    ],
  },
];

const LIBRARY_BRANDS = [
  'Universal',
  'Doosan',
  'Fanuc',
  'Rainbow Robotics',
  'Neuromeka',
  'Hanwha Robotics',
  'Techman Robot',
  'Hyundai Wia',
  'PLOON',
  'LG',
  'AtomRobot',
  'SIASUN',
  'Elite',
  'ABB',
  'DOBOT',
  'FAIRINO',
  'KUKA',
];

const LIBRARY_MODELS: Record<string, string[]> = {
  Universal: ['UR3', 'UR3e', 'UR5', 'UR5e', 'UR10', 'UR10e', 'UR16e', 'UR20'],
};

function libraryBrandInitials(name: string): string {
  const t = name.trim();
  if (!t) return '?';
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const a = words[0][0] ?? '';
    const b = words[1][0] ?? '';
    return (a + b).toUpperCase();
  }
  return t.slice(0, Math.min(2, t.length)).toUpperCase();
}

function libraryBrandAvatarColors(brand: string, isDark: boolean): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < brand.length; i++) h = (h * 31 + brand.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  if (isDark) {
    return {
      bg: `hsl(${hue}, 38%, 24%)`,
      fg: `hsl(${hue}, 48%, 90%)`,
    };
  }
  return {
    bg: `hsl(${hue}, 45%, 93%)`,
    fg: `hsl(${hue}, 58%, 30%)`,
  };
}

/** 라이브러리 섹션 헤더용 추상 도형(그라데이션·글로우) — 아이콘 대신 */
function librarySectionOrbStyle(
  id: LibrarySection['id'],
  isDark: boolean,
): { shell: CSSProperties; glow: CSSProperties } {
  const shellBase: CSSProperties = {
    borderRadius: 14,
    boxShadow: isDark
      ? '0 10px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.14)'
      : '0 8px 24px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.95)',
  };
  const glowBase: CSSProperties = {
    borderRadius: 999,
    filter: 'blur(12px)',
    opacity: isDark ? 0.5 : 0.65,
  };
  switch (id) {
    case 'robot':
      return {
        shell: {
          ...shellBase,
          background: isDark
            ? `linear-gradient(148deg, ${accentRgba(POINT_ORANGE, 0.65)} 0%, ${accentRgba(POINT_ORANGE, 0.22)} 48%, rgba(15,23,42,0.55) 100%)`
            : `linear-gradient(148deg, #ffedd5 0%, ${accentRgba(POINT_ORANGE, 0.75)} 38%, #fff7ed 100%)`,
        },
        glow: { ...glowBase, background: POINT_ORANGE },
      };
    case 'layout':
      return {
        shell: {
          ...shellBase,
          background: isDark
            ? 'linear-gradient(148deg, rgba(192,132,252,0.55) 0%, rgba(139,92,246,0.22) 48%, rgba(15,23,42,0.52) 100%)'
            : 'linear-gradient(148deg, #ddd6fe 0%, #c4b5fd 45%, #faf5ff 100%)',
        },
        glow: { ...glowBase, background: isDark ? '#c084fc' : '#8b5cf6' },
      };
  }
}

const LIBRARY_SECTION_ICON_INDEX: Record<LibrarySection['id'], number> = {
  robot: getItemIconPreference('library-section:robot')?.iconIndex ?? 33,
  layout: getItemIconPreference('library-section:layout')?.iconIndex ?? 83,
};

const TIMELINE_TICKS = ['00:00', '00:50', '01:00', '01:50', '02:00', '02:50', '03:00', '03:50', '04:00'];

/** 좌측 패널 토글 · 접힌 타임라인 열기 등 가장자리 플로팅 버튼 공통 */
const CHROME_EDGE_TOGGLE_BTN_CLASS =
  'group border transition-all duration-150 inline-flex items-center justify-center active:scale-[0.98]';
const TIMELINE_PLAYBACK_RATES = [0.1, 0.2, 0.5, 1.0, 1.5, 2.0, 4.0] as const;

const HEADER_VIEW_ICON_INDEX: Record<HeaderViewKey, number> = {
  grid: 83,
  view: 6,
  rotate: 160,
  layout: 161,
  scale: 162,
  ruler: 174,
  'object snap': 175,
  snap: 163,
};
const HEADER_LEFT_ICON_INDEX = {
  logo: getItemIconPreference('workspace-header:logo')?.iconIndex ?? 111,
  menu: getItemIconPreference('workspace-header:menu')?.iconIndex ?? 58,
  undo: getItemIconPreference('workspace-header:undo')?.iconIndex ?? 157,
  redo: getItemIconPreference('workspace-header:redo')?.iconIndex ?? 157,
} as const;
const HEADER_ACTION_ICON_INDEX = {
  sceneInfo: getItemIconPreference('workspace-header:scene-info')?.iconIndex ?? 80,
  plan: getItemIconPreference('workspace-header:plan')?.iconIndex ?? 186,
  comment: getItemIconPreference('workspace-header:comment')?.iconIndex ?? 59,
  share: getItemIconPreference('workspace-header:share')?.iconIndex ?? 43,
  mypage: getItemIconPreference('workspace-header:mypage')?.iconIndex ?? 61,
  lang: getItemIconPreference('workspace-header:lang')?.iconIndex ?? 62,
} as const;

function CustomTooltip({
  label,
  placement = 'bottom',
}: {
  label: string;
  placement?: 'bottom' | 'right' | 'top';
}) {
  const placementClass = placement === 'right'
    ? 'left-[calc(100%+8px)] top-1/2 -translate-y-1/2'
    : placement === 'top'
      ? 'left-1/2 bottom-[calc(100%+8px)] -translate-x-1/2'
      : 'left-1/2 top-[calc(100%+8px)] -translate-x-1/2';
  return (
    <span
      className={`pointer-events-none absolute ${placementClass} rounded-[8px] border px-2.5 py-1.5 text-[11px] font-semibold leading-none whitespace-nowrap opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0`}
      style={{
        borderColor: 'rgba(15,23,42,0.14)',
        color: '#0f172a',
        background: 'rgba(255,255,255,0.98)',
        boxShadow: '0 8px 18px rgba(15,23,42,0.16)',
      }}
      aria-hidden
    >
      {label}
    </span>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function WorkspaceChrome({
  locale,
  rightPanelVisible,
  onToggleLocale,
  uiPreviewMode: controlledUiPreviewMode,
  onUiPreviewModeChange,
  sceneInfoPanelHidden,
  onShowSceneInfoPanel,
  onOnboardingAppAction,
  selectedTreeNodeId,
  onTreeNodeSelect,
}: {
  locale: 'ko' | 'en';
  rightPanelVisible: boolean;
  onToggleLocale?: () => void;
  uiPreviewMode?: 'light' | 'dark';
  onUiPreviewModeChange?: (mode: 'light' | 'dark') => void;
  /** true면 헤더에 씬 정보(객체 사용률) 패널 다시 열기 버튼 표시 */
  sceneInfoPanelHidden?: boolean;
  onShowSceneInfoPanel?: () => void;
  /** 온보딩 Play 시 App 쪽 상태(객체·충돌·모션 등)만 조정 — 라이브러리/GNB/타임라인은 크롬 내부 처리 */
  onOnboardingAppAction?: (action: OnboardingOpenAppAction) => void;
  /** 셀 트리 선택 — 프로퍼티 패널·Objects 메뉴와 동기화 */
  selectedTreeNodeId?: string | null;
  onTreeNodeSelect?: (node: { id: string; type: TreeNodeType; label: string }) => void;
}) {
  const [leftMode, setLeftMode] = useState<LeftMode>('tree');
  const [leftOpen, setLeftOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(320);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>('timeline');
  const [bottomHeight, setBottomHeight] = useState(BOTTOM_HEIGHT_EXPANDED);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [playbackMenuOpen, setPlaybackMenuOpen] = useState(false);
  const [timelineView, setTimelineView] = useState<'overview' | 'detail'>('overview');
  const [timelineCollapsedTree] = useState(false);
  const [selectedTimelineTarget, setSelectedTimelineTarget] = useState<TimelineTarget>('cobot2');
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryStage, setLibraryStage] = useState<LibraryStage>('root');
  const [libraryDrawing, setLibraryDrawing] = useState<LibraryDrawingInfo | null>(null);
  const [libraryDrawingModalOpen, setLibraryDrawingModalOpen] = useState(false);
  const libraryDrawingInputRef = useRef<HTMLInputElement>(null);
  const [internalUiPreviewMode, setInternalUiPreviewMode] = useState<'light' | 'dark'>('light');
  const [uiModeMenuOpen, setUiModeMenuOpen] = useState(false);
  const uiModeMenuRef = useRef<HTMLDivElement>(null);
  const gridToolAnchorRef = useRef<HTMLButtonElement>(null);
  const layoutToolAnchorRef = useRef<HTMLButtonElement>(null);
  const scaleToolAnchorRef = useRef<HTMLButtonElement>(null);
  const rulerToolAnchorRef = useRef<HTMLButtonElement>(null);
  const viewToolAnchorRef = useRef<HTMLButtonElement>(null);
  const objectSnapToolAnchorRef = useRef<HTMLButtonElement>(null);
  const snapToolAnchorRef = useRef<HTMLButtonElement>(null);
  const [headerEditPopover, setHeaderEditPopover] = useState<HeaderEditToolPopover | null>(null);
  const [workspaceGridMm, setWorkspaceGridMm] = useState(100);
  const [workspaceCanvasBg, setWorkspaceCanvasBg] = useState<CanvasBackgroundId>('white');
  const [uniformScaleByPivotActive, setUniformScaleByPivotActive] = useState(false);
  const [rulerMeasureActive, setRulerMeasureActive] = useState(false);
  const [snapMode, setSnapMode] = useState<SnapModeId>('vertex');
  const [snapMoveMm, setSnapMoveMm] = useState(200);
  const [snapRotateDeg, setSnapRotateDeg] = useState(10);
  const resetSnapToDefaults = useCallback(() => {
    setSnapMode('vertex');
    setSnapMoveMm(200);
    setSnapRotateDeg(10);
  }, []);
  const [selectedRobotType, setSelectedRobotType] = useState('협동 로봇');
  const [selectedBrand, setSelectedBrand] = useState('Universal');
  const [selectedModel, setSelectedModel] = useState('UR10');
  /** 기본: 모두 접힘 — 펼치기는 ▶ 토글로만 */
  const [expandedTreeIds, setExpandedTreeIds] = useState<Set<string>>(() => new Set());
  const [processInfoModalOpen, setProcessInfoModalOpen] = useState(false);
  const [modalExamplesOpen, setModalExamplesOpen] = useState(false);
  const [onboardingGuideOpen, setOnboardingGuideOpen] = useState(false);
  const [safetyDiagnosisCellPickerOpen, setSafetyDiagnosisCellPickerOpen] = useState(false);
  const [safetyDiagnosisModalOpen, setSafetyDiagnosisModalOpen] = useState(false);
  const [safetyDiagnosisPickedCell, setSafetyDiagnosisPickedCell] = useState<SafetyDiagnosisCellItem | null>(null);
  const [sensorSafetyCalculatorOpen, setSensorSafetyCalculatorOpen] = useState(false);
  const [analysisPanelUiVersion, setAnalysisPanelUiVersion] = useState<AnalysisPanelUiVersion>('frameRef');
  const analysisHeaderActionRef = useRef<HTMLButtonElement>(null);
  const [savedProcessInfo, setSavedProcessInfo] = useState<ProcessInfoSnapshot | null>(null);
  const uiPreviewMode = controlledUiPreviewMode ?? internalUiPreviewMode;
  const isDarkPreview = uiPreviewMode === 'dark';
  const sidePanelTokens = isDarkPreview ? PROPERTY_DARK_TOKENS : PROPERTY_LIGHT_TOKENS;
  const analysisLayoutChrome = useMemo(() => getAnalysisPanelLayoutChromeCopy(locale), [locale]);

  const chromeEdgeToggleSurface = useMemo(
    () => ({
      borderColor: sidePanelTokens.inputBorder,
      background: sidePanelTokens.inputBg,
      color: sidePanelTokens.textPrimary,
      boxShadow: sidePanelTokens.elevationRaised,
    }),
    [sidePanelTokens.elevationRaised, sidePanelTokens.inputBg, sidePanelTokens.inputBorder, sidePanelTokens.textPrimary],
  );

  const handleOnboardingOpenRelated = useCallback(
    (action: OnboardingOpenAppAction) => {
      if (action.kind === 'library') {
        setLeftMode('library');
        setLeftOpen(true);
        return;
      }
      if (action.kind === 'left-gnb-mode') {
        setLeftMode(action.mode);
        setLeftOpen(true);
        return;
      }
      if (action.kind === 'timeline-dock') {
        setBottomOpen(true);
        setBottomTab('timeline');
        return;
      }
      if (action.kind === 'bottom-dock-open') {
        setBottomOpen(true);
        return;
      }
      onOnboardingAppAction?.(action);
    },
    [onOnboardingAppAction],
  );

  useEffect(() => {
    if (leftMode === 'analysis') setBottomTab('analysis');
    else setBottomTab('timeline');
  }, [leftMode]);

  useEffect(() => {
    if (!uiModeMenuOpen) return;
    const onDocDown = (e: MouseEvent) => {
      const el = uiModeMenuRef.current;
      if (el && !el.contains(e.target as Node)) setUiModeMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUiModeMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [uiModeMenuOpen]);

  const prevLeftModeRef = useRef<LeftMode>(leftMode);
  /** Safety AI·분석·위험성 = 최대 너비 기본 / 이탈 시 최소. 그 외 모드 전환 시 최소(다른 탭에 폭이 이어지지 않게) */
  useEffect(() => {
    const prev = prevLeftModeRef.current;
    prevLeftModeRef.current = leftMode;
    if (leftMode === 'safetyai') {
      setLeftWidth(LEFT_PANEL_MAX_WIDTH);
    } else if (prev === 'safetyai') {
      setLeftWidth(LEFT_PANEL_MIN_WIDTH);
    } else if (leftMode === 'analysis' || leftMode === 'riskassessment') {
      setLeftWidth(LEFT_PANEL_MAX_WIDTH);
    } else if (prev !== leftMode) {
      setLeftWidth(LEFT_PANEL_MIN_WIDTH);
    }
  }, [leftMode]);

  const leftOffset = LEFT_GNB_WIDTH + (leftOpen ? leftWidth : 0) + 8;
  const rightReserve = rightPanelVisible ? 12 : 12;

  const resizingRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);
  const bottomResizingRef = useRef<{ startY: number; startH: number } | null>(null);

  const leftPanelResizable =
    leftMode === 'safetyai' || leftMode === 'analysis' || leftMode === 'riskassessment';

  const onResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!leftOpen || !leftPanelResizable) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    resizingRef.current = { startX: e.clientX, startWidth: leftWidth };
    const onMove = (ev: PointerEvent) => {
      const r = resizingRef.current;
      if (!r) return;
      const dx = ev.clientX - r.startX;
      setLeftWidth(clamp(r.startWidth + dx, LEFT_PANEL_MIN_WIDTH, LEFT_PANEL_MAX_WIDTH));
    };
    const onUp = () => {
      resizingRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [leftOpen, leftPanelResizable, leftWidth]);

  const onBottomResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!bottomOpen) return;
    e.preventDefault();
    bottomResizingRef.current = { startY: e.clientY, startH: bottomHeight };
    const onMove = (ev: PointerEvent) => {
      const r = bottomResizingRef.current;
      if (!r) return;
      const dy = r.startY - ev.clientY;
      setBottomHeight(clamp(r.startH + dy, BOTTOM_HEIGHT_MIN, BOTTOM_HEIGHT_MAX));
    };
    const onUp = () => {
      bottomResizingRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [bottomOpen, bottomHeight]);

  const modeDefs = useMemo(() => ([
    { id: 'library' as const, labelKo: '라이브러리', labelEn: 'Library' },
    { id: 'tree' as const, labelKo: '트리', labelEn: 'Tree' },
    { id: 'analysis' as const, labelKo: '셀 안전 진단(분석 결과)', labelEn: 'Cell safety diagnosis (analysis)' },
    { id: 'riskassessment' as const, labelKo: '위험성평가', labelEn: 'Risk' },
    { id: 'safetyai' as const, labelKo: 'Safety AI', labelEn: 'Safety AI' },
  ]), []);

  const modeLabel = modeDefs.find((m) => m.id === leftMode);
  const headerGnbPref = getItemIconPreference(`workspace-gnb:${leftMode}`);
  const isRiskMode = leftMode === 'riskassessment';
  const primaryHeaderActionLabel = isRiskMode ? 'Report Issue' : 'Analysis';

  useEffect(() => {
    if (isRiskMode) {
      setSafetyDiagnosisCellPickerOpen(false);
      setSafetyDiagnosisModalOpen(false);
      setSafetyDiagnosisPickedCell(null);
      setSensorSafetyCalculatorOpen(false);
    }
  }, [isRiskMode]);

  const processInfoFormInitial = useMemo(
    (): ProcessInfoSnapshot => ({
      processName: savedProcessInfo?.processName ?? DEFAULT_HEADER_PROCESS_NAME[locale],
      processType: savedProcessInfo?.processType ?? '',
      memo: savedProcessInfo?.memo ?? '',
    }),
    [savedProcessInfo, locale],
  );
  const leftMenuRight = leftOpen ? LEFT_GNB_WIDTH + 8 + leftWidth : LEFT_GNB_WIDTH + 2;
  const collapsedTimelineWidth = Math.min(BOTTOM_COLLAPSED_WIDTH, Math.max(300, window.innerWidth - 24));
  const headerViewButtons = locale === 'en'
    ? (['grid', 'view', 'rotate', 'layout', 'scale', 'ruler', 'object snap', 'snap'] as const)
    : (['grid', 'view', 'rotate', 'layout', 'scale', 'ruler', 'object snap', 'snap'] as const);
  const headerPrimaryActive = leftMode === 'analysis' || leftMode === 'riskassessment';
  const toggleTreeNode = useCallback((nodeId: string) => {
    setExpandedTreeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const leftUiTokens = useMemo(() => ({
    treeIcon: sidePanelTokens.textSecondary,
    treeText: sidePanelTokens.textPrimary,
    treeGuide: isDarkPreview ? 'rgba(148,163,184,0.35)' : 'rgba(82,82,91,0.22)',
    treeToggle: sidePanelTokens.textSecondary,
    librarySectionBorder: sidePanelTokens.divider,
    libraryTitle: sidePanelTokens.textPrimary,
    libraryBodyText: sidePanelTokens.textPrimary,
    libraryMuted: sidePanelTokens.textSecondary,
    libraryChipBg: sidePanelTokens.inputBg,
    libraryChipBorder: sidePanelTokens.inputBorder,
    libraryModelCardBg: sidePanelTokens.sectionHeaderBg,
    libraryModelCardDivider: sidePanelTokens.divider,
    libraryBrandTileBg: sidePanelTokens.inputBg,
    libraryBrandTileBorder: sidePanelTokens.inputBorder,
    libraryBrandTileShadow: isDarkPreview
      ? '0 1px 0 rgba(255,255,255,0.05) inset, 0 6px 16px rgba(0,0,0,0.22)'
      : '0 1px 2px rgba(15,23,42,0.04), 0 6px 16px rgba(15,23,42,0.05)',
    libraryBrandEmptyBg: sidePanelTokens.sectionHeaderBg,
  }), [
    isDarkPreview,
    sidePanelTokens.divider,
    sidePanelTokens.inputBg,
    sidePanelTokens.inputBorder,
    sidePanelTokens.sectionHeaderBg,
    sidePanelTokens.textPrimary,
    sidePanelTokens.textSecondary,
  ]);

  const timelineUiTokens = useMemo(
    () => ({
      /** 타임라인 내부 셸·접힘 트랜스포트: 우측 프로퍼티 패널과 동일 `panelBg` / 테두리 */
      shellBg: sidePanelTokens.panelBg,
      shellBorder: sidePanelTokens.panelBorder,
      headerBarBorder: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      rowBorder: isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      rowLabelText: isDarkPreview ? '#e5e7eb' : '#374151',
      rowLabelDivider: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      transportBg: sidePanelTokens.panelBg,
      transportBackdrop: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
      transportBorder: sidePanelTokens.panelBorder,
      transportText: isDarkPreview ? '#e5e7eb' : '#374151',
      transportIconBorder: isDarkPreview ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)',
      transportRateBtnBorder: isDarkPreview ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)',
      transportRateBtnBg: isDarkPreview ? 'rgba(40,41,48,0.9)' : 'rgba(255,255,255,0.78)',
      playbackMenuBorder: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
      playbackMenuBg: isDarkPreview ? 'rgba(24,25,30,0.98)' : 'rgba(255,255,255,0.98)',
      playbackMenuShadow: isDarkPreview ? '0 10px 18px rgba(0,0,0,0.45)' : '0 10px 18px rgba(0,0,0,0.24)',
      playbackMenuText: isDarkPreview ? '#f3f4f6' : '#1f2937',
      scrubTrack: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
      rulerBorder: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      rulerMajorTicks: isDarkPreview
        ? 'repeating-linear-gradient(to right, rgba(255,255,255,0.22) 0 1px, transparent 1px 10%)'
        : 'repeating-linear-gradient(to right, rgba(0,0,0,0.18) 0 1px, transparent 1px 10%)',
      rulerMinorTicks: isDarkPreview
        ? 'repeating-linear-gradient(to right, rgba(255,255,255,0.1) 0 1px, transparent 1px 2%)'
        : 'repeating-linear-gradient(to right, rgba(0,0,0,0.08) 0 1px, transparent 1px 2%)',
      rulerTickText: isDarkPreview ? '#9ca3af' : '#6b7280',
      detailTabInactiveBorder: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
      detailTabInactiveBg: isDarkPreview ? 'rgba(40,41,48,0.85)' : 'rgba(255,255,255,0.72)',
      detailTabInactiveText: isDarkPreview ? '#d1d5db' : '#4b5563',
      toolChangeRowBorder: isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      toolChangeBadgeBg: isDarkPreview ? 'rgba(249,115,22,0.28)' : 'rgba(249,115,22,0.18)',
      collapsedTooltipBorder: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)',
      collapsedTooltipBg: isDarkPreview ? 'rgba(24,25,30,0.96)' : 'rgba(255,255,255,0.96)',
      collapsedTooltipText: isDarkPreview ? '#f3f4f6' : '#111827',
      collapsedTooltipShadow: isDarkPreview ? '0 6px 14px rgba(0,0,0,0.45)' : '0 6px 14px rgba(0,0,0,0.22)',
      bottomResizeHandleBg: isDarkPreview ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.02)',
      bottomResizeGrip: isDarkPreview ? '#9ca3af' : '#a1a1aa',
    }),
    [isDarkPreview, sidePanelTokens.panelBg, sidePanelTokens.panelBorder],
  );

  const renderTreeNode = useCallback((node: TreeNodeItem, depth: number) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedTreeIds.has(node.id);
    const rowPaddingLeft = 10 + depth * TREE_INDENT_PX;
    const iconColor = node.type === 'impact'
      ? (isDarkPreview ? '#f59e0b' : '#737373')
      : leftUiTokens.treeIcon;
    const isTreeSelected = selectedTreeNodeId != null && selectedTreeNodeId === node.id;
    const rowBg = isTreeSelected
      ? accentRgba(POINT_ORANGE, isDarkPreview ? 0.22 : 0.14)
      : depth === 0
        ? 'rgba(255,142,43,0.12)'
        : 'transparent';
    const rowBorder = isTreeSelected
      ? `1px solid ${accentRgba(POINT_ORANGE, 0.5)}`
      : depth === 0
        ? `1px solid ${accentRgba(POINT_ORANGE, 0.45)}`
        : '1px solid transparent';

    return (
      <div key={node.id} className="relative">
        {depth > 0 && (
          <div
            className="absolute top-0 bottom-0 border-l"
            style={{
              left: 8 + (depth - 1) * TREE_INDENT_PX,
              borderColor: leftUiTokens.treeGuide,
            }}
            aria-hidden
          />
        )}
        <div
          role={onTreeNodeSelect ? 'button' : undefined}
          tabIndex={onTreeNodeSelect ? 0 : undefined}
          className={`h-8 rounded-[8px] flex items-center gap-1.5 transition-colors duration-120${onTreeNodeSelect ? ' cursor-pointer' : ''}`}
          style={{
            paddingLeft: rowPaddingLeft,
            paddingRight: 8,
            background: rowBg,
            border: rowBorder,
          }}
          onClick={onTreeNodeSelect ? () => onTreeNodeSelect({ id: node.id, type: node.type, label: node.label }) : undefined}
          onKeyDown={
            onTreeNodeSelect
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onTreeNodeSelect({ id: node.id, type: node.type, label: node.label });
                  }
                }
              : undefined
          }
        >
          {hasChildren ? (
            <button
              type="button"
              className="w-4 h-4 rounded-[4px] flex items-center justify-center text-[10px] leading-none shrink-0"
              style={{ color: leftUiTokens.treeToggle }}
              onClick={(e) => {
                e.stopPropagation();
                toggleTreeNode(node.id);
              }}
              aria-label={isExpanded ? '하위 항목 접기' : '하위 항목 펼치기'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" aria-hidden />
          )}
          <span className="text-[11px] leading-none shrink-0" style={{ color: iconColor }}>
            {TREE_TYPE_ICON[node.type]}
          </span>
          <span
            className="text-[12px] font-medium leading-[15px] truncate"
            style={{ color: leftUiTokens.treeText }}
            title={node.label}
          >
            {node.label}
          </span>
          <div className="flex-1 min-w-0" />
          {node.cri && (
            <span className="text-[11px] font-semibold leading-none shrink-0" style={{ color: '#16a34a' }}>
              CRI: {node.cri}
            </span>
          )}
          {node.processBadge && (
            <span
              className="h-4 min-w-4 px-1 rounded-[4px] text-[10px] font-bold leading-[16px] text-center shrink-0"
              style={{ background: '#ff8e2b', color: '#fff' }}
              title={locale === 'en' ? 'Process' : '프로세스'}
            >
              P
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-0.5 flex flex-col gap-0.5">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }, [
    expandedTreeIds,
    isDarkPreview,
    leftUiTokens.treeGuide,
    leftUiTokens.treeIcon,
    leftUiTokens.treeText,
    leftUiTokens.treeToggle,
    locale,
    onTreeNodeSelect,
    selectedTreeNodeId,
    toggleTreeNode,
  ]);

  const goToLibraryRoot = useCallback(() => {
    setLibraryStage('root');
    setSelectedBrand('Universal');
    setLibrarySearch('');
  }, []);

  const openLibraryDrawingPicker = useCallback(() => {
    libraryDrawingInputRef.current?.click();
  }, []);

  const openLibraryDrawingHelpModal = useCallback(() => setLibraryDrawingModalOpen(true), []);

  useEffect(() => {
    if (!libraryDrawingModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLibraryDrawingModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [libraryDrawingModalOpen]);

  const renderLibraryDrawingDock = useCallback(() => {
    const drawingDate =
      libraryDrawing &&
      new Date(libraryDrawing.updatedAtMs).toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

    return (
      <>
        <input
          ref={libraryDrawingInputRef}
          type="file"
          className="hidden"
          accept=".dwg,.dxf,.pdf,.png,.jpg,.jpeg,.step,.stp,.svg"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setLibraryDrawing({
                fileName: f.name,
                sizeLabel: formatDrawingFileSize(f.size),
                updatedAtMs: Date.now(),
              });
              setLibraryDrawingModalOpen(false);
            }
            e.target.value = '';
          }}
        />
        <div
          className="flex flex-col gap-2.5"
          {...{ [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.libraryDrawingUpload }}
        >
          <div className="flex items-center justify-between gap-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: leftUiTokens.libraryMuted }}>
              {locale === 'en' ? 'Drawing' : '도면'}
            </span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                color: isDarkPreview ? '#d4d4d8' : '#3f3f46',
                background: isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
              }}
            >
              {locale === 'en' ? 'Always visible' : '항시 표시'}
            </span>
          </div>
          {libraryDrawing ? (
            <div
              className="rounded-2xl border px-3 py-3"
              style={{
                borderColor: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.09)',
                background: isDarkPreview
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, #f8fafc 100%)',
                boxShadow: isDarkPreview
                  ? '0 10px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.09)'
                  : '0 10px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)',
              }}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: isDarkPreview ? 'rgba(255,142,43,0.18)' : 'rgba(255,142,43,0.14)',
                    color: isDarkPreview ? '#fdba74' : '#c2410c',
                  }}
                  aria-hidden
                >
                  <FileText className="w-4.5 h-4.5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-[12px] font-bold leading-[15px] truncate" style={{ color: leftUiTokens.libraryTitle }}>
                    {libraryDrawing.fileName}
                  </p>
                  <p className="mt-1 text-[10px] leading-[14px]" style={{ color: leftUiTokens.libraryMuted }}>
                    {libraryDrawing.sizeLabel}
                    <span className="mx-1 opacity-50">·</span>
                    {drawingDate}
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-0.5 shrink-0 rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all duration-150 hover:opacity-90"
                  style={{
                    color: isDarkPreview ? '#fed7aa' : '#9a3412',
                    background: isDarkPreview ? 'rgba(255,142,43,0.22)' : accentRgba(POINT_ORANGE, 0.18),
                    border: `1px solid ${isDarkPreview ? 'rgba(255,142,43,0.35)' : 'rgba(255,142,43,0.28)'}`,
                  }}
                  onClick={openLibraryDrawingHelpModal}
                >
                  {locale === 'en' ? 'Replace' : '교체'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="flex min-h-[52px] w-full items-center gap-2.5 rounded-2xl border px-3 text-left text-[11px] font-bold transition-all duration-200 hover:opacity-[0.98] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45"
              style={{
                borderColor: isDarkPreview ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.12)',
                background: isDarkPreview
                  ? 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, #f8fafc 100%)',
                color: leftUiTokens.libraryBodyText,
                boxShadow: isDarkPreview
                  ? '0 8px 20px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08)'
                  : '0 8px 20px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)',
              }}
              onClick={openLibraryDrawingHelpModal}
              aria-label={locale === 'en' ? 'Upload drawing file' : '도면 파일 업로드'}
            >
              <div
                className="h-8 w-8 rounded-lg shrink-0 flex items-center justify-center"
                style={{
                  background: isDarkPreview ? 'rgba(255,142,43,0.2)' : 'rgba(255,142,43,0.14)',
                  color: isDarkPreview ? '#fdba74' : '#c2410c',
                }}
              >
                <Upload className="w-4 h-4" style={{ color: 'currentColor' }} strokeWidth={2.25} aria-hidden />
              </div>
              <span className="min-w-0 flex-1 truncate">
                {locale === 'en' ? 'Upload drawing…' : '도면 업로드…'}
              </span>
            </button>
          )}
        </div>
      </>
    );
  }, [
    isDarkPreview,
    leftUiTokens.libraryBodyText,
    leftUiTokens.libraryMuted,
    leftUiTokens.libraryTitle,
    libraryDrawing,
    locale,
    openLibraryDrawingHelpModal,
  ]);

  const renderLibraryRoot = useCallback(() => (
    <div className="flex flex-col gap-4 pb-1">
      {LIBRARY_SECTIONS.map((section) => {
        const orb = librarySectionOrbStyle(section.id, isDarkPreview);
        return (
          <section
            key={section.id}
            {...(section.id === 'robot'
              ? { [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.librarySectionRobot }
              : section.id === 'layout'
                ? { [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.librarySectionLayout }
                : {})}
            className="rounded-[18px] p-3.5 transition-shadow duration-300"
            style={{
              background: isDarkPreview ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.72)',
              border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.07)'}`,
              boxShadow: isDarkPreview
                ? '0 6px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)'
                : '0 6px 26px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl">
                <div className="absolute -right-1 -top-1 h-7 w-7" style={orb.glow} aria-hidden />
                <div className="relative h-full w-full" style={orb.shell} aria-hidden />
                <div
                  className="pointer-events-none absolute inset-[3px] rounded-[10px] opacity-25"
                  style={{
                    background: isDarkPreview
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 55%)'
                      : 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 50%)',
                  }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                  <SfdIconByIndex
                    index={LIBRARY_SECTION_ICON_INDEX[section.id]}
                    color={isDarkPreview ? 'rgba(255,255,255,0.92)' : 'rgba(15,23,42,0.82)'}
                    size={22}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[12px] font-bold tracking-tight" style={{ color: leftUiTokens.libraryTitle }}>
                  {section.title}
                </h4>
                <p className="mt-0.5 text-[10px] font-medium leading-[14px]" style={{ color: leftUiTokens.libraryMuted }}>
                  {section.chips.length}
                  {locale === 'en' ? ' items' : '개 항목'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {section.chips.map((chip) => {
                const isSingle = section.chips.length === 1;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    {...(chip.id === 'collab-robot'
                      ? { [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.libraryChipCollabRobot }
                      : {})}
                    className={`group/chip relative overflow-hidden rounded-xl py-2.5 px-3 text-left text-[11px] font-semibold leading-[16px] transition-all duration-200 ease-out will-change-transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40 ${isSingle ? 'col-span-2' : ''}`}
                    style={{
                      background: isDarkPreview ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.92)',
                      color: leftUiTokens.libraryBodyText,
                      border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
                      boxShadow: isDarkPreview
                        ? '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)'
                        : '0 2px 10px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                    onClick={() => {
                      if (chip.id === 'collab-robot') {
                        setSelectedRobotType(chip.label);
                        setLibraryStage('brands');
                      }
                    }}
                  >
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/chip:opacity-100"
                      style={{
                        background: isDarkPreview
                          ? `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 0.12)} 0%, transparent 55%)`
                          : `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 0.14)} 0%, transparent 50%)`,
                      }}
                      aria-hidden
                    />
                    <span className="relative">{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  ), [isDarkPreview, leftUiTokens.libraryBodyText, leftUiTokens.libraryMuted, leftUiTokens.libraryTitle, locale]);

  const renderBrandList = useCallback(() => {
    const q = librarySearch.trim().toLowerCase();
    const filtered = q
      ? LIBRARY_BRANDS.filter((b) => b.toLowerCase().includes(q))
      : LIBRARY_BRANDS;

    return (
      <div className="flex flex-col gap-4">
        <div
          className="relative overflow-hidden rounded-[18px] p-3.5"
          style={{
            background: isDarkPreview
              ? `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 0.14)} 0%, rgba(255,255,255,0.04) 48%, rgba(0,0,0,0.15) 100%)`
              : `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 0.12)} 0%, rgba(255,255,255,0.95) 45%, #f8fafc 100%)`,
            border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDarkPreview
              ? '0 10px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 10px 32px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-40 blur-2xl"
            style={{ background: POINT_ORANGE }}
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <button
              type="button"
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45"
              style={{
                border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)'}`,
                background: isDarkPreview ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.85)',
                color: leftUiTokens.libraryBodyText,
                boxShadow: isDarkPreview ? '0 6px 16px rgba(0,0,0,0.35)' : '0 6px 16px rgba(15,23,42,0.1)',
              }}
              onClick={goToLibraryRoot}
              aria-label={locale === 'en' ? 'Back to library' : '라이브러리로 돌아가기'}
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.25} />
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="mb-1.5 h-1 w-10 rounded-full" style={{ background: accentRgba(POINT_ORANGE, 0.85) }} aria-hidden />
              <p
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: leftUiTokens.libraryMuted }}
              >
                {selectedRobotType}
              </p>
              <h2 className="mt-0.5 text-[16px] font-bold leading-[22px] tracking-tight" style={{ color: leftUiTokens.libraryTitle }}>
                {locale === 'en' ? 'Manufacturers' : '제조사'}
              </h2>
              <p className="mt-1.5 text-[10px] leading-[16px]" style={{ color: leftUiTokens.libraryMuted }}>
                {locale === 'en'
                  ? 'Pick a brand to browse available robot models.'
                  : '브랜드를 선택하면 해당 로봇 모델을 확인할 수 있습니다.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div
              className="rounded-[16px] px-4 py-12 text-center text-[11px] leading-[18px] transition-shadow duration-200"
              style={{
                border: `1px dashed ${isDarkPreview ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.12)'}`,
                background: isDarkPreview ? 'rgba(255,255,255,0.03)' : 'rgba(248,250,252,0.9)',
                color: leftUiTokens.libraryMuted,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            >
              {locale === 'en' ? 'No manufacturers match your search.' : '검색과 일치하는 제조사가 없습니다.'}
            </div>
          ) : (
            filtered.map((brand) => {
              const av = libraryBrandAvatarColors(brand, isDarkPreview);
              return (
                <button
                  key={brand}
                  type="button"
                  className="group/brand relative flex w-full items-center gap-3 overflow-hidden rounded-[14px] px-3 py-2.5 text-left transition-all duration-200 ease-out hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45 active:translate-y-0 active:scale-[0.995]"
                  style={{
                    border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
                    background: isDarkPreview ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.88)',
                    boxShadow: isDarkPreview
                      ? '0 4px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.06)'
                      : '0 4px 18px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                  }}
                  onClick={() => {
                    setSelectedBrand(brand);
                    setLibraryStage('models');
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/brand:opacity-100"
                    style={{
                      background: isDarkPreview
                        ? 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 55%)'
                        : 'linear-gradient(90deg, rgba(255,142,43,0.08) 0%, transparent 50%)',
                    }}
                    aria-hidden
                  />
                  <div
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold tabular-nums tracking-tight"
                    style={{
                      background: av.bg,
                      color: av.fg,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.15), 0 0 0 2px ${isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.95)'}`,
                    }}
                    aria-hidden
                  >
                    {libraryBrandInitials(brand)}
                  </div>
                  <span className="relative min-w-0 flex-1 text-[12px] font-bold leading-[15px] tracking-tight truncate" style={{ color: leftUiTokens.libraryBodyText }}>
                    {brand}
                  </span>
                  <div
                    className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 group-hover/brand:translate-x-0.5"
                    style={{
                      background: isDarkPreview ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
                    }}
                    aria-hidden
                  >
                    <ChevronRight
                      className="h-4 w-4 opacity-50 transition-opacity duration-200 group-hover/brand:opacity-100"
                      style={{ color: leftUiTokens.libraryMuted }}
                      strokeWidth={2.25}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }, [
    goToLibraryRoot,
    isDarkPreview,
    leftUiTokens.libraryBodyText,
    leftUiTokens.libraryMuted,
    leftUiTokens.libraryTitle,
    librarySearch,
    locale,
    selectedRobotType,
  ]);

  const renderModelGrid = useCallback(() => {
    const models = LIBRARY_MODELS[selectedBrand] ?? ['RX-1', 'RX-2', 'RX-3', 'RX-5', 'RX-8'];
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          className="group/back inline-flex items-center gap-2 rounded-xl py-1.5 pl-1 pr-2 text-[11px] font-semibold transition-colors duration-200 hover:bg-white/5"
          style={{ color: leftUiTokens.libraryMuted }}
          onClick={() => setLibraryStage('brands')}
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 group-hover/back:-translate-x-0.5"
            style={{
              background: isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
              color: leftUiTokens.libraryBodyText,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.25} />
          </span>
          {locale === 'en' ? 'Manufacturers' : '제조사로 돌아가기'}
        </button>

        <div
          className="relative overflow-hidden rounded-[18px] p-3"
          style={{
            background: isDarkPreview ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)',
            border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDarkPreview
              ? '0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.06)'
              : '0 8px 26px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1)',
          }}
        >
          <div
            className="pointer-events-none absolute -left-6 bottom-0 h-20 w-20 rounded-full opacity-30 blur-2xl"
            style={{ background: POINT_ORANGE }}
            aria-hidden
          />
          <div className="relative flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: leftUiTokens.libraryMuted }}>
                {selectedRobotType}
              </p>
              <p className="truncate text-[15px] font-bold leading-[19px] tracking-tight" style={{ color: leftUiTokens.libraryTitle }}>
                {selectedBrand}
              </p>
            </div>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: isDarkPreview ? 'rgba(0,0,0,0.35)' : 'rgba(15,23,42,0.06)',
                color: leftUiTokens.libraryMuted,
              }}
              aria-hidden
            >
              <ChevronUp className="w-4 h-4" strokeWidth={2.25} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {models.map((model) => {
            const active = selectedModel === model;
            return (
              <button
                key={model}
                type="button"
                className="group/model relative flex h-[100px] flex-col overflow-hidden rounded-[14px] border text-left transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45 active:translate-y-0 active:scale-[0.98]"
                style={{
                  background: isDarkPreview ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                  borderColor: active ? accentRgba(POINT_ORANGE, 0.65) : isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
                  boxShadow: active
                    ? `0 6px 20px ${accentRgba(POINT_ORANGE, 0.2)}, 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.35)} inset`
                    : isDarkPreview
                      ? '0 4px 14px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                      : '0 4px 16px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,1)',
                }}
                onClick={() => setSelectedModel(model)}
              >
                <div
                  className="relative flex flex-1 flex-col items-center justify-center gap-1"
                  style={{ color: leftUiTokens.libraryMuted }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/model:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${accentRgba(POINT_ORANGE, isDarkPreview ? 0.12 : 0.15)} 0%, transparent 65%)`,
                    }}
                    aria-hidden
                  />
                  <div className="relative flex flex-col items-center gap-1 opacity-[0.42]">
                    <div className="h-1.5 w-9 rounded-full bg-current" />
                    <div className="h-6 w-[52px] rounded-lg bg-current" style={{ opacity: 0.85 }} />
                    <div className="h-1.5 w-6 rounded-full bg-current" style={{ opacity: 0.65 }} />
                  </div>
                </div>
                <div
                  className="flex h-9 items-center justify-center border-t text-[11px] font-bold tabular-nums"
                  style={{
                    borderColor: isDarkPreview ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)',
                    color: leftUiTokens.libraryBodyText,
                    background: isDarkPreview ? 'rgba(0,0,0,0.25)' : 'rgba(248,250,252,0.95)',
                  }}
                >
                  {model}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [
    isDarkPreview,
    leftUiTokens.libraryBodyText,
    leftUiTokens.libraryMuted,
    leftUiTokens.libraryTitle,
    locale,
    selectedBrand,
    selectedModel,
    selectedRobotType,
  ]);

  const renderLibraryContent = useCallback(() => {
    if (libraryStage === 'models') return renderModelGrid();
    if (libraryStage === 'brands') return renderBrandList();
    return renderLibraryRoot();
  }, [libraryStage, renderModelGrid, renderBrandList, renderLibraryRoot]);

  const renderTimelineRow = useCallback((
    label: string,
    segments: Array<{ w: number; tone?: 'blue' | 'cyan' | 'green'; text: string }>,
    compact = false,
    onClick?: () => void,
  ) => (
    <button
      type="button"
      className={`${compact ? 'h-7' : 'h-8'} w-full grid grid-cols-[58px_1fr] border-b text-left transition-colors duration-150`}
      style={{
        borderColor: timelineUiTokens.rowBorder,
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
      }}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="px-2 text-[10px] font-semibold flex items-center border-r truncate" style={{ borderColor: timelineUiTokens.rowLabelDivider, color: timelineUiTokens.rowLabelText }}>
        {label}
      </div>
      <div className="flex items-center gap-1 px-1 overflow-hidden">
        {segments.map((seg, i) => {
          const tone = seg.tone ?? 'blue';
          const bg = tone === 'green' ? '#3cb98f' : tone === 'cyan' ? '#1db7ea' : '#0f4ea3';
          return (
            <div
              key={`${label}-${i}`}
              className={`${compact ? 'h-5' : 'h-6'} rounded-[3px] px-1.5 text-[9px] font-semibold flex items-center justify-center whitespace-nowrap`}
              style={{ width: `${seg.w}%`, background: bg, color: '#eef7ff' }}
            >
              {seg.text}
            </div>
          );
        })}
      </div>
    </button>
  ), [timelineUiTokens.rowBorder, timelineUiTokens.rowLabelDivider, timelineUiTokens.rowLabelText]);

  const renderTimelineTransportBar = useCallback((compact = false) => (
    <div
      className={`${compact ? 'h-9' : 'h-10'} w-full rounded-[9px] border px-3 flex items-center gap-2`}
      style={{
        borderColor: timelineUiTokens.transportBorder,
        background: timelineUiTokens.transportBg,
        color: timelineUiTokens.transportText,
        backdropFilter: timelineUiTokens.transportBackdrop,
        WebkitBackdropFilter: timelineUiTokens.transportBackdrop,
      }}
    >
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: timelineUiTokens.transportIconBorder }}>
        <Play className="w-3 h-3" />
      </button>
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: timelineUiTokens.transportIconBorder }}>
        <Square className="w-2.5 h-2.5" />
      </button>
      <span className="text-[11px] font-semibold tabular-nums">00:00.0/04:07.1</span>
      <div className="relative">
        <button
          type="button"
          className="h-6 px-2 rounded-[6px] border text-[10px] font-semibold"
          style={{ borderColor: timelineUiTokens.transportRateBtnBorder, background: timelineUiTokens.transportRateBtnBg }}
          onClick={() => setPlaybackMenuOpen((v) => !v)}
        >
          x {playbackRate.toFixed(1)}
        </button>
        {playbackMenuOpen && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 rounded-[8px] border p-1 flex flex-col gap-0.5 z-10"
            style={{
              borderColor: timelineUiTokens.playbackMenuBorder,
              background: timelineUiTokens.playbackMenuBg,
              boxShadow: timelineUiTokens.playbackMenuShadow,
            }}
          >
            {TIMELINE_PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                className="h-6 px-2 rounded-[6px] text-[10px] font-semibold text-left"
                style={{
                  color: rate === playbackRate ? POINT_ORANGE : timelineUiTokens.playbackMenuText,
                  background: rate === playbackRate ? accentRgba(POINT_ORANGE, 0.22) : 'transparent',
                }}
                onClick={() => {
                  setPlaybackRate(rate);
                  setPlaybackMenuOpen(false);
                }}
              >
                {rate.toFixed(1)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 h-1.5 rounded-full relative" style={{ background: timelineUiTokens.scrubTrack }}>
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full" style={{ background: '#ff8e2b' }} />
      </div>
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: timelineUiTokens.transportIconBorder }}>
        <Repeat className="w-3 h-3" />
      </button>
    </div>
  ), [
    playbackMenuOpen,
    playbackRate,
    timelineUiTokens.playbackMenuBg,
    timelineUiTokens.playbackMenuBorder,
    timelineUiTokens.playbackMenuShadow,
    timelineUiTokens.playbackMenuText,
    timelineUiTokens.scrubTrack,
    timelineUiTokens.transportBackdrop,
    timelineUiTokens.transportBg,
    timelineUiTokens.transportBorder,
    timelineUiTokens.transportIconBorder,
    timelineUiTokens.transportRateBtnBg,
    timelineUiTokens.transportRateBtnBorder,
    timelineUiTokens.transportText,
  ]);

  const renderTimelineRuler = useCallback(() => (
    <div className="h-10 px-2 grid grid-cols-[58px_1fr] border-b" style={{ borderColor: timelineUiTokens.rulerBorder }}>
      <div />
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 bottom-4"
          style={{
            background: timelineUiTokens.rulerMajorTicks,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 bottom-5"
          style={{
            background: timelineUiTokens.rulerMinorTicks,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between text-[9px]" style={{ color: timelineUiTokens.rulerTickText }}>
          {TIMELINE_TICKS.map((tick) => <span key={tick}>{tick}</span>)}
        </div>
      </div>
    </div>
  ), [
    timelineUiTokens.rulerBorder,
    timelineUiTokens.rulerMajorTicks,
    timelineUiTokens.rulerMinorTicks,
    timelineUiTokens.rulerTickText,
  ]);

  const renderTimelineOverview = useCallback(() => (
    <div className="h-full rounded-[10px] overflow-hidden border" style={{ borderColor: timelineUiTokens.shellBorder, background: timelineUiTokens.shellBg }}>
      <div className="h-[46px] px-2 py-1 border-b flex flex-col gap-1 justify-center" style={{ borderColor: timelineUiTokens.headerBarBorder }}>
        {renderTimelineTransportBar(true)}
      </div>
      {renderTimelineRuler()}
      <div className="h-[calc(100%-86px)] overflow-y-auto sfd-scroll">
        {renderTimelineRow('Additional', [
          { w: 14, text: 'Axis-Point 1' }, { w: 14, text: 'Axis-Point 2' }, { w: 14, text: 'Axis-Point 3' }, { w: 30, text: 'Axis-Point 5' },
        ], false, () => {
          setSelectedTimelineTarget('additional');
          setTimelineView('detail');
        })}
        {renderTimelineRow('COBOT1', [
          { w: 16, tone: 'cyan', text: 'Waypoint2' }, { w: 16, tone: 'cyan', text: 'Waypoint5' }, { w: 16, tone: 'cyan', text: 'Waypoint7' }, { w: 18, tone: 'cyan', text: 'Waypoint9' },
        ], false, () => {
          setSelectedTimelineTarget('cobot1');
          setTimelineView('detail');
        })}
        {renderTimelineRow('COBOT2', [
          { w: 13, tone: 'cyan', text: 'Waypoint2' }, { w: 13, tone: 'cyan', text: 'Waypoint3' }, { w: 13, tone: 'cyan', text: 'Waypoint4' }, { w: 13, tone: 'cyan', text: 'Waypoint6' }, { w: 14, tone: 'cyan', text: 'Waypoint8' }, { w: 16, tone: 'cyan', text: 'Waypoint9' },
        ], false, () => {
          setSelectedTimelineTarget('cobot2');
          setTimelineView('detail');
        })}
        {!timelineCollapsedTree ? (
          <>
            {renderTimelineRow('MOBILE', [
              { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' }, { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' },
            ], false, () => {
              setSelectedTimelineTarget('mobile');
              setTimelineView('detail');
            })}
            {renderTimelineRow('MOBILE_EE', [
              { w: 22, tone: 'green', text: '파지 해제' }, { w: 22, tone: 'green', text: '이동' }, { w: 22, tone: 'green', text: '재파지' },
            ], false, () => {
              setSelectedTimelineTarget('mobile_ee');
              setTimelineView('detail');
            })}
          </>
        ) : (
          <div className="border-b" style={{ borderColor: timelineUiTokens.rowBorder }}>
            {renderTimelineRow('MOBILE', [
              { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' }, { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' },
            ], true, () => {
              setSelectedTimelineTarget('mobile');
              setTimelineView('detail');
            })}
            {renderTimelineRow('└ EE', [
              { w: 22, tone: 'green', text: '파지 해제' }, { w: 22, tone: 'green', text: '이동' }, { w: 22, tone: 'green', text: '재파지' },
            ], true, () => {
              setSelectedTimelineTarget('mobile_ee');
              setTimelineView('detail');
            })}
          </div>
        )}
      </div>
    </div>
  ), [
    renderTimelineRow,
    timelineCollapsedTree,
    renderTimelineRuler,
    renderTimelineTransportBar,
    timelineUiTokens.headerBarBorder,
    timelineUiTokens.rowBorder,
    timelineUiTokens.shellBg,
    timelineUiTokens.shellBorder,
  ]);

  const renderTimelineDetail = useCallback(() => (
    <div className="h-full rounded-[10px] overflow-hidden border" style={{ borderColor: timelineUiTokens.shellBorder, background: timelineUiTokens.shellBg }}>
      <div className="h-[72px] px-2 py-1 border-b flex flex-col gap-1" style={{ borderColor: timelineUiTokens.headerBarBorder }}>
        <div className="h-6 flex items-center gap-2">
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{ borderColor: timelineUiTokens.detailTabInactiveBorder, background: timelineUiTokens.detailTabInactiveBg, color: timelineUiTokens.detailTabInactiveText }}
            onClick={() => setTimelineView('overview')}
          >
            전체 보기
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{ borderColor: accentRgba(POINT_ORANGE, 0.45), background: accentRgba(POINT_ORANGE, 0.2), color: POINT_ORANGE }}
            onClick={() => setTimelineView('detail')}
          >
            상세 보기
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{
              borderColor: selectedTimelineTarget === 'additional' ? accentRgba(POINT_ORANGE, 0.45) : timelineUiTokens.detailTabInactiveBorder,
              background: selectedTimelineTarget === 'additional' ? accentRgba(POINT_ORANGE, 0.2) : timelineUiTokens.detailTabInactiveBg,
              color: selectedTimelineTarget === 'additional' ? POINT_ORANGE : timelineUiTokens.detailTabInactiveText,
            }}
            onClick={() => setSelectedTimelineTarget('additional')}
          >
            Additional
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{
              borderColor: selectedTimelineTarget === 'cobot2' ? accentRgba(POINT_ORANGE, 0.45) : timelineUiTokens.detailTabInactiveBorder,
              background: selectedTimelineTarget === 'cobot2' ? accentRgba(POINT_ORANGE, 0.2) : timelineUiTokens.detailTabInactiveBg,
              color: selectedTimelineTarget === 'cobot2' ? POINT_ORANGE : timelineUiTokens.detailTabInactiveText,
            }}
            onClick={() => setSelectedTimelineTarget('cobot2')}
          >
            COBOT2
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{
              borderColor: selectedTimelineTarget === 'mobile' ? accentRgba(POINT_ORANGE, 0.45) : timelineUiTokens.detailTabInactiveBorder,
              background: selectedTimelineTarget === 'mobile' ? accentRgba(POINT_ORANGE, 0.2) : timelineUiTokens.detailTabInactiveBg,
              color: selectedTimelineTarget === 'mobile' ? POINT_ORANGE : timelineUiTokens.detailTabInactiveText,
            }}
            onClick={() => setSelectedTimelineTarget('mobile')}
          >
            MOBILE
          </button>
          <div className="flex-1" />
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{ borderColor: accentRgba(POINT_ORANGE, 0.45), background: accentRgba(POINT_ORANGE, 0.2), color: POINT_ORANGE }}
          >
            툴 체인지 설정 시작
          </button>
        </div>
        {renderTimelineTransportBar(true)}
      </div>
      {renderTimelineRuler()}
      <div className="h-[calc(100%-112px)] overflow-y-auto sfd-scroll">
        {selectedTimelineTarget === 'additional' ? (
          <>
            {renderTimelineRow('Axis', [
              { w: 13, text: 'Axis Point 1' }, { w: 13, text: 'Axis Point 2' }, { w: 13, text: 'Axis Point 3' }, { w: 13, text: 'Axis Point 4' }, { w: 13, text: 'Axis Point 5' }, { w: 13, text: 'Axis Point 6' },
            ])}
            {renderTimelineRow('엔드이펙터', [
              { w: 28, tone: 'cyan', text: 'SEG24' }, { w: 28, tone: 'cyan', text: 'SEG32' }, { w: 28, tone: 'cyan', text: 'XEG34' },
            ])}
            <div className="relative h-10 border-b" style={{ borderColor: timelineUiTokens.toolChangeRowBorder }}>
              <div className="absolute inset-x-1 top-3 h-4 rounded-[3px]" style={{ background: '#0f4ea3' }} />
              {[20, 46, 72].map((left, idx) => (
                <div key={idx} className="absolute top-1 h-8 w-[2px]" style={{ left: `${left}%`, background: '#f97316' }} />
              ))}
              <div className="absolute top-0 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px]" style={{ background: timelineUiTokens.toolChangeBadgeBg, color: POINT_ORANGE }}>
                툴 체인지
              </div>
            </div>
          </>
        ) : selectedTimelineTarget === 'cobot1' ? (
          <>
            {renderTimelineRow('COBOT1', [
              { w: 18, tone: 'cyan', text: 'Waypoint1' }, { w: 18, tone: 'cyan', text: 'Waypoint4' }, { w: 18, tone: 'cyan', text: 'Waypoint8' },
            ])}
            {renderTimelineRow('EE', [
              { w: 22, tone: 'blue', text: 'SEG10' }, { w: 22, tone: 'blue', text: 'SEG18' }, { w: 22, tone: 'blue', text: 'SEG24' },
            ])}
          </>
        ) : selectedTimelineTarget === 'mobile' ? (
          <>
            {renderTimelineRow('MOBILE', [
              { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' }, { w: 19, tone: 'green', text: '이동' }, { w: 19, tone: 'green', text: '정지' },
            ])}
            {renderTimelineRow('경로', [
              { w: 22, tone: 'green', text: 'Path-A' }, { w: 22, tone: 'green', text: 'Path-B' }, { w: 22, tone: 'green', text: 'Path-C' },
            ])}
          </>
        ) : selectedTimelineTarget === 'mobile_ee' ? (
          <>
            {renderTimelineRow('MOBILE_EE', [
              { w: 22, tone: 'green', text: '파지 해제' }, { w: 22, tone: 'green', text: '이동' }, { w: 22, tone: 'green', text: '재파지' },
            ])}
            {renderTimelineRow('도구', [
              { w: 20, tone: 'blue', text: 'Tool-A' }, { w: 20, tone: 'blue', text: 'Tool-B' }, { w: 20, tone: 'blue', text: 'Tool-C' },
            ])}
          </>
        ) : (
          <>
            {renderTimelineRow('COBOT2', [
              { w: 16, tone: 'cyan', text: 'Waypoint2' }, { w: 16, tone: 'cyan', text: 'Waypoint4' }, { w: 16, tone: 'cyan', text: 'Waypoint7' }, { w: 16, tone: 'cyan', text: 'Waypoint9' },
            ])}
            {renderTimelineRow('EE', [
              { w: 20, tone: 'blue', text: 'SEG24' }, { w: 20, tone: 'blue', text: 'SEG32' }, { w: 20, tone: 'blue', text: 'XEG34' },
            ])}
          </>
        )}
      </div>
    </div>
  ), [
    renderTimelineRow,
    selectedTimelineTarget,
    renderTimelineRuler,
    renderTimelineTransportBar,
    timelineUiTokens.detailTabInactiveBg,
    timelineUiTokens.detailTabInactiveBorder,
    timelineUiTokens.detailTabInactiveText,
    timelineUiTokens.headerBarBorder,
    timelineUiTokens.shellBg,
    timelineUiTokens.shellBorder,
    timelineUiTokens.toolChangeBadgeBg,
    timelineUiTokens.toolChangeRowBorder,
  ]);

  const renderCollapsedTimeline = useCallback(() => (
    <div className="h-full flex flex-col items-center justify-center gap-1.5 px-3">
      <button
        type="button"
        className={`${CHROME_EDGE_TOGGLE_BTN_CLASS} relative h-6 w-12 rounded-[10px]`}
        style={chromeEdgeToggleSurface}
        onClick={() => setBottomOpen(true)}
        title="클릭하여 타임라인 열기"
      >
        <ChevronUp className="w-3.5 h-3.5" />
        <span
          className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 rounded-[6px] border px-2 py-1 text-[10px] font-medium leading-none whitespace-nowrap opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0"
          style={{
            borderColor: timelineUiTokens.collapsedTooltipBorder,
            color: timelineUiTokens.collapsedTooltipText,
            background: timelineUiTokens.collapsedTooltipBg,
            boxShadow: timelineUiTokens.collapsedTooltipShadow,
          }}
          aria-hidden
        >
          클릭하여 타임라인 열기
        </span>
      </button>
      {renderTimelineTransportBar(true)}
    </div>
  ), [
    chromeEdgeToggleSurface,
    renderTimelineTransportBar,
    timelineUiTokens.collapsedTooltipBg,
    timelineUiTokens.collapsedTooltipBorder,
    timelineUiTokens.collapsedTooltipShadow,
    timelineUiTokens.collapsedTooltipText,
  ]);

  const renderTreeAreaLayout = useCallback(() => (
    <div className="h-full flex flex-col border rounded-[10px] overflow-hidden" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.tabBarBg }}>
      <section className="flex-1 min-h-0">
        <div className="h-9 px-3 flex items-center text-[12px] font-semibold" style={{ color: sidePanelTokens.textPrimary }}>
          Design Tree
        </div>
        <div className="h-[calc(100%-36px)] overflow-y-auto sfd-scroll px-2 pb-2">
          <div className="flex flex-col gap-0.5">
            {TREE_DATA.map((node) => renderTreeNode(node, 0))}
          </div>
        </div>
      </section>
    </div>
  ), [renderTreeNode, sidePanelTokens.inputBorder, sidePanelTokens.tabBarBg, sidePanelTokens.textPrimary]);

  const renderAnalysisAreaLayout = useCallback(
    () => (
      <AnalysisSidePanel
        locale={locale}
        isDark={isDarkPreview}
        panelUiVersion={analysisPanelUiVersion}
        tokens={{
          textPrimary: isDarkPreview ? sidePanelTokens.textPrimary : '#0f172a',
          textSecondary: isDarkPreview ? sidePanelTokens.textSecondary : '#475569',
          inputBorder: sidePanelTokens.inputBorder,
          inputBg: sidePanelTokens.inputBg,
          tabBarBg: sidePanelTokens.tabBarBg,
          sectionHeaderBg: sidePanelTokens.sectionHeaderBg,
          panelBg: sidePanelTokens.panelBg,
          panelBorder: sidePanelTokens.panelBorder,
          panelShadow: sidePanelTokens.panelShadow,
          elevationSection: sidePanelTokens.elevationSection,
          elevationRaised: sidePanelTokens.elevationRaised,
          divider: sidePanelTokens.divider,
        }}
        onOpenSensorCalculator={() => setSensorSafetyCalculatorOpen(true)}
        onSensorCalcDetailViewClick={() => setSensorSafetyCalculatorOpen(true)}
      />
    ),
    [
      analysisPanelUiVersion,
      isDarkPreview,
      locale,
      sidePanelTokens.divider,
      sidePanelTokens.elevationRaised,
      sidePanelTokens.elevationSection,
      sidePanelTokens.inputBg,
      sidePanelTokens.inputBorder,
      sidePanelTokens.panelBg,
      sidePanelTokens.panelBorder,
      sidePanelTokens.panelShadow,
      sidePanelTokens.sectionHeaderBg,
      sidePanelTokens.tabBarBg,
      sidePanelTokens.textPrimary,
      sidePanelTokens.textSecondary,
    ],
  );

  const safetyAiColors: SafetyAiColors = useMemo(
    () => ({
      bg: sidePanelTokens.tabBarBg,
      border: sidePanelTokens.inputBorder,
      text: sidePanelTokens.textPrimary,
      muted: sidePanelTokens.textSecondary,
      inputBg: sidePanelTokens.inputBg,
      sidebarBg: sidePanelTokens.sectionHeaderBg,
      cardBg: isDarkPreview ? 'rgba(255,255,255,0.04)' : '#ffffff',
      aiBubble: isDarkPreview ? 'rgba(255,255,255,0.1)' : '#f4f4f5',
      bannerBg: isDarkPreview ? 'rgba(251,191,36,0.12)' : '#fef3c7',
      userBubble: POINT_ORANGE,
    }),
    [
      isDarkPreview,
      sidePanelTokens.inputBg,
      sidePanelTokens.inputBorder,
      sidePanelTokens.sectionHeaderBg,
      sidePanelTokens.tabBarBg,
      sidePanelTokens.textPrimary,
      sidePanelTokens.textSecondary,
    ],
  );

  return (
    <>
      {/* Left GNB */}
      <div
        className="fixed left-0 bottom-0 z-[30]"
        style={{
          top: WORKSPACE_CONTENT_TOP_PX,
          width: LEFT_GNB_WIDTH,
          background: sidePanelTokens.panelBg,
          borderRight: `1px solid ${sidePanelTokens.panelBorder}`,
          boxShadow: sidePanelTokens.panelShadow,
          backdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
        }}
      >
        <div className="h-full flex flex-col py-2.5">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sfd-scroll px-1.5 flex flex-col gap-2.5">
            {modeDefs.map(({ id, labelKo, labelEn }) => {
              const active = leftMode === id;
              const gnbPref = getItemIconPreference(`workspace-gnb:${id}`);
              return (
                <button
                  key={id}
                  type="button"
                  {...(id === 'library' ? { [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.leftGnbLibrary } : {})}
                  className="group relative w-full aspect-square shrink-0 rounded-[12px] flex items-center justify-center transition-all duration-150 border box-border"
                  style={{
                    background: active
                      ? accentRgba(POINT_ORANGE, 0.14)
                      : sidePanelTokens.inputBg,
                    color: active ? POINT_ORANGE : sidePanelTokens.textPrimary,
                    borderColor: active ? accentRgba(POINT_ORANGE, 0.42) : sidePanelTokens.inputBorder,
                    boxShadow: active
                      ? `0 0 0 1px ${accentRgba(POINT_ORANGE, 0.32)} inset, ${sidePanelTokens.elevationRaised}`
                      : sidePanelTokens.elevationRaised,
                    transform: active ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                  onClick={() => {
                    setLeftMode(id);
                    if (!leftOpen) setLeftOpen(true);
                  }}
                >
                  <SfdIconByIndex
                    index={leftGnbIconIndex(id)}
                    color={active ? POINT_ORANGE : sidePanelTokens.textPrimary}
                    size={18}
                    rotationDeg={gnbPref ? rotationDegForPreference(gnbPref) : 0}
                  />
                  <CustomTooltip label={locale === 'en' ? labelEn : labelKo} placement="right" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <button
        type="button"
        className={`${CHROME_EDGE_TOGGLE_BTN_CLASS} fixed z-[31] h-14 w-7 rounded-[10px]`}
        style={{
          left: leftMenuRight + 2,
          top: `calc(${WORKSPACE_CONTENT_TOP_PX}px + (100vh - ${WORKSPACE_CONTENT_TOP_PX + 8}px) / 2)`,
          transform: 'translateY(-50%)',
          ...chromeEdgeToggleSurface,
        }}
        onClick={() => setLeftOpen((v) => !v)}
      >
        {leftOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        <CustomTooltip
          label={leftOpen ? (locale === 'en' ? 'Hide left menu' : '좌측 메뉴 숨기기') : (locale === 'en' ? 'Show left menu' : '좌측 메뉴 표시')}
          placement="right"
        />
      </button>

      {/* Left Area panel */}
      {leftOpen && (
        <div
          className="fixed z-[29] rounded-[14px] overflow-hidden"
          {...{ [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.leftWorkspaceLibraryPanel }}
          style={{
            left: LEFT_GNB_WIDTH + 8,
            top: WORKSPACE_CONTENT_TOP_PX,
            bottom: 8,
            width: leftWidth,
            background: sidePanelTokens.panelBg,
            border: `1px solid ${sidePanelTokens.panelBorder}`,
            boxShadow: sidePanelTokens.panelShadow,
            backdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          }}
        >
          <div className="h-full flex flex-col">
            {leftMode !== 'safetyai' && (
              <div
                className="px-3 py-2.5 border-b flex items-center justify-between gap-2 min-w-0"
                style={{ borderColor: sidePanelTokens.divider, background: sidePanelTokens.sectionHeaderBg }}
              >
                <div className="flex items-center gap-2 min-w-0 shrink">
                  <SfdIconByIndex
                    index={leftGnbIconIndex(leftMode)}
                    color={POINT_ORANGE}
                    size={14}
                    rotationDeg={headerGnbPref ? rotationDegForPreference(headerGnbPref) : 0}
                  />
                  <span className="text-[14px] font-semibold truncate" style={{ color: sidePanelTokens.textPrimary }}>
                    {locale === 'en' ? modeLabel?.labelEn : modeLabel?.labelKo}
                  </span>
                </div>
                {(leftMode === 'analysis' || leftMode === 'riskassessment') && (
                  <div className="flex items-center gap-1.5 shrink-0 max-w-[min(72%,320px)]">
                    <label htmlFor="ws-analysis-panel-layout" className="sr-only">
                      {analysisLayoutChrome.label}
                    </label>
                    <span
                      className="hidden sm:inline text-[10px] font-semibold whitespace-nowrap"
                      style={{ color: sidePanelTokens.textSecondary }}
                    >
                      {analysisLayoutChrome.label}
                    </span>
                    <div className="relative min-w-[10rem] flex-1 max-w-[220px]">
                      <select
                        id="ws-analysis-panel-layout"
                        value={analysisPanelUiVersion}
                        onChange={(e) => setAnalysisPanelUiVersion(e.target.value as AnalysisPanelUiVersion)}
                        className="w-full min-w-0 text-[11px] font-medium py-1 pl-2 pr-8 rounded-md border appearance-none cursor-pointer"
                        style={{
                          borderColor: sidePanelTokens.inputBorder,
                          background: sidePanelTokens.inputBg,
                          color: sidePanelTokens.textPrimary,
                        }}
                        aria-label={analysisLayoutChrome.label}
                      >
                        <option value="frameRef">{analysisLayoutChrome.frameRef}</option>
                        <option value="compactTiles">{analysisLayoutChrome.compact}</option>
                        <option value="dashboard">{analysisLayoutChrome.dashboard}</option>
                        <option value="figmaDraft">{analysisLayoutChrome.figmaDraft}</option>
                        <option value="safetics698Wire">{analysisLayoutChrome.safetics698Wire}</option>
                        <option value="safeticsV2">{analysisLayoutChrome.safeticsV2}</option>
                      </select>
                      <ChevronDown
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                        style={{ color: sidePanelTokens.textSecondary }}
                        aria-hidden
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div
              className={
                leftMode === 'safetyai'
                  ? 'flex-1 min-h-0 overflow-hidden'
                  : leftMode === 'analysis' || leftMode === 'riskassessment'
                    ? 'flex-1 min-h-0 overflow-y-auto sfd-scroll px-2.5 py-2'
                    : 'flex-1 min-h-0 overflow-y-auto sfd-scroll p-3'
              }
            >
              {leftMode === 'library' ? (
                <div className="flex min-h-0 flex-col gap-0">
                  <div
                    className="sticky top-0 z-[4] -mx-1 mb-3 space-y-3 px-2 pb-3 pt-1"
                    style={{
                      background: isDarkPreview
                        ? 'linear-gradient(180deg, rgba(20,22,28,0.9) 0%, rgba(20,22,28,0.74) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.84) 100%)',
                      borderBottom: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)'}`,
                      boxShadow: isDarkPreview
                        ? '0 14px 28px rgba(0,0,0,0.32), inset 0 -1px 0 rgba(255,255,255,0.04)'
                        : '0 14px 28px rgba(15,23,42,0.1), inset 0 -1px 0 rgba(255,255,255,0.8)',
                      backdropFilter: isDarkPreview ? 'blur(22px) saturate(145%)' : 'blur(18px) saturate(135%)',
                      WebkitBackdropFilter: isDarkPreview ? 'blur(22px) saturate(145%)' : 'blur(18px) saturate(135%)',
                    }}
                  >
                    {renderLibraryDrawingDock()}
                  </div>
                  {renderLibraryContent()}
                </div>
              ) : leftMode === 'tree' ? (
                renderTreeAreaLayout()
              ) : leftMode === 'analysis' || leftMode === 'riskassessment' ? (
                renderAnalysisAreaLayout()
              ) : leftMode === 'safetyai' ? (
                <SafetyAiPanel
                  locale={locale}
                  isDark={isDarkPreview}
                  colors={safetyAiColors}
                  onClosePanel={() => setLeftOpen(false)}
                />
              ) : (
                <div className="rounded-[10px] p-3 text-[11px] leading-[18px]" style={{ background: sidePanelTokens.sectionHeaderBg, color: sidePanelTokens.textSecondary }}>
                  {locale === 'en'
                    ? 'Left area placeholder based on selected GNB mode.'
                    : 'Left GNB 모드에 따라 바뀌는 영역입니다.'}
                </div>
              )}
            </div>
          </div>
          {leftPanelResizable && (
            <div
              className="absolute top-0 right-0 z-20 w-2.5 h-full cursor-ew-resize group flex items-center justify-center pointer-events-auto touch-none select-none"
              onPointerDown={onResizeStart}
              title={locale === 'en' ? 'Drag to resize panel' : '드래그하여 패널 너비 조절'}
              aria-label={locale === 'en' ? 'Resize left panel' : '좌측 패널 너비 조절'}
            >
              <div
                className="absolute inset-y-3 right-1 w-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: sidePanelTokens.textSecondary }}
              />
              <div
                className={`relative flex h-8 w-full items-center justify-center rounded-md opacity-40 group-hover:opacity-90 transition-opacity ${
                  isDarkPreview ? 'group-hover:bg-white/[0.08]' : 'group-hover:bg-black/[0.05]'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5" style={{ color: sidePanelTokens.textSecondary }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header (top_area) */}
      <div
        className="fixed z-[28] flex flex-col px-3 py-2.5 gap-2.5"
        style={{
          left: 0,
          right: 0,
          top: WORKSPACE_HEADER_TOP_PX,
          height: WORKSPACE_HEADER_HEIGHT_PX,
          background: 'rgba(8,10,14,0.96)',
          border: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.36)',
          backdropFilter: 'blur(14px) saturate(140%)',
        }}
      >
        <div
          className="h-11 min-h-[44px] flex items-center gap-3 rounded-[10px] px-2"
          style={{ background: isDarkPreview ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)' }}
        >
          <div
            className="flex h-9 shrink-0 items-center rounded-[8px] border px-2.5"
            style={{
              borderColor: 'rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.07)',
              boxShadow: '0 0 0 1px rgba(255,142,43,0.12) inset',
            }}
          >
            <SafeticsBrandLockup />
          </div>
          <div className="flex-1 min-w-0 flex justify-start">
            <div
              className="h-10 min-w-[300px] max-w-[520px] pl-3 pr-1 border rounded-[9px] text-[12px] font-semibold flex items-center"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#f3f4f6', background: 'rgba(255,255,255,0.09)' }}
            >
              <span className="flex-1 min-w-0 truncate pr-2">{processInfoFormInitial.processName}</span>
              <button
                type="button"
                className="group relative h-9 w-9 shrink-0 rounded-[6px] inline-flex items-center justify-center transition-colors duration-150 hover:bg-white/[0.08] active:bg-white/[0.12]"
                style={{
                  border: 'none',
                  color: '#f3f4f6',
                  background: 'transparent',
                }}
                aria-label={locale === 'en' ? 'Edit process info' : '공정 정보 수정'}
                onClick={() => setProcessInfoModalOpen(true)}
              >
                <Settings className="w-4 h-4" strokeWidth={2.1} />
                <CustomTooltip label={locale === 'en' ? 'Edit process info' : '공정 정보 수정'} placement="bottom" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="h-9 px-2.5 rounded-[8px] border text-[12px] font-semibold outline-none cursor-pointer inline-flex items-center justify-center gap-2 transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-0 shrink-0"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#f3f4f6',
                background: 'rgba(255,255,255,0.1)',
              }}
              aria-pressed={modalExamplesOpen}
              aria-label={locale === 'en' ? 'Modal examples' : '모달 예시'}
              onClick={() => setModalExamplesOpen((o) => !o)}
            >
              {locale === 'en' ? 'Modal examples' : '모달 예시'}
            </button>
            <button
              type="button"
              className="h-9 px-2.5 rounded-[8px] border text-[12px] font-semibold outline-none cursor-pointer inline-flex items-center justify-center gap-2 transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-0 shrink-0"
              style={{
                borderColor: accentRgba(POINT_ORANGE, 0.35),
                color: '#fff7ed',
                background: accentRgba(POINT_ORANGE, 0.12),
              }}
              aria-pressed={onboardingGuideOpen}
              aria-label={locale === 'en' ? 'Onboarding guide' : '온보딩 가이드'}
              onClick={() => setOnboardingGuideOpen((o) => !o)}
            >
              {locale === 'en' ? 'Onboarding' : '온보딩 가이드'}
            </button>
            <div className="relative shrink-0" ref={uiModeMenuRef}>
              <button
                type="button"
                id="workspace-ui-mode-trigger"
                className="h-9 min-w-[128px] pl-2.5 pr-2 rounded-[8px] border text-[12px] font-semibold outline-none cursor-pointer inline-flex items-center justify-between gap-2 transition-colors duration-150 hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-orange-400/50 focus-visible:ring-offset-0"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#f3f4f6',
                  background: 'rgba(255,255,255,0.1)',
                }}
                aria-haspopup="listbox"
                aria-expanded={uiModeMenuOpen}
                aria-controls="workspace-ui-mode-listbox"
                aria-label={locale === 'en' ? 'UI mode' : 'UI 모드'}
                onClick={() => setUiModeMenuOpen((o) => !o)}
              >
                <span className="inline-flex items-center gap-2 min-w-0">
                  {uiPreviewMode === 'light' ? (
                    <Sun className="w-4 h-4 shrink-0 text-amber-300" strokeWidth={2.1} aria-hidden />
                  ) : (
                    <Moon className="w-4 h-4 shrink-0 text-sky-300" strokeWidth={2.1} aria-hidden />
                  )}
                  <span className="truncate">
                    {uiPreviewMode === 'light'
                      ? locale === 'en'
                        ? 'Light'
                        : '라이트'
                      : locale === 'en'
                        ? 'Dark'
                        : '다크'}
                  </span>
                </span>
                <ChevronDown
                  className="w-3.5 h-3.5 shrink-0 opacity-70 transition-transform duration-200"
                  strokeWidth={2.2}
                  aria-hidden
                  style={{ transform: uiModeMenuOpen ? 'rotate(180deg)' : undefined }}
                />
              </button>
              {uiModeMenuOpen && (
                <div
                  id="workspace-ui-mode-listbox"
                  role="listbox"
                  aria-labelledby="workspace-ui-mode-trigger"
                  className="absolute right-0 top-[calc(100%+6px)] z-[40] min-w-full rounded-[10px] border py-1 shadow-xl"
                  style={{
                    borderColor: 'rgba(255,255,255,0.18)',
                    background: 'rgba(14,16,22,0.98)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {(
                    [
                      { mode: 'light' as const, Icon: Sun, iconClass: 'text-amber-300', labelKo: '라이트', labelEn: 'Light' },
                      { mode: 'dark' as const, Icon: Moon, iconClass: 'text-sky-300', labelKo: '다크', labelEn: 'Dark' },
                    ] as const
                  ).map(({ mode, Icon, iconClass, labelKo, labelEn }) => {
                    const selected = uiPreviewMode === mode;
                    const label = locale === 'en' ? labelEn : labelKo;
                    return (
                      <button
                        key={mode}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`w-full px-2.5 py-2 text-left text-[12px] font-semibold flex items-center gap-2.5 transition-colors duration-150 ${
                          selected ? '' : 'hover:bg-white/[0.06]'
                        }`}
                        style={{
                          color: selected ? POINT_ORANGE : '#e5e7eb',
                          background: selected ? accentRgba(POINT_ORANGE, 0.14) : 'transparent',
                        }}
                        onClick={() => {
                          setInternalUiPreviewMode(mode);
                          onUiPreviewModeChange?.(mode);
                          setUiModeMenuOpen(false);
                        }}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} strokeWidth={2.1} aria-hidden />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {sceneInfoPanelHidden && onShowSceneInfoPanel ? (
              <button
                type="button"
                className="group relative h-9 w-9 rounded-[8px] border inline-flex items-center justify-center"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#f3f4f6',
                  background: 'rgba(255,255,255,0.1)',
                }}
                onClick={onShowSceneInfoPanel}
                aria-label={locale === 'en' ? 'Show object usage panel' : '객체 사용률 패널 표시'}
              >
                <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.sceneInfo} color="currentColor" size={15} />
                <CustomTooltip label={locale === 'en' ? 'Scene Info · Object usage' : 'Scene Info · 객체 사용률'} placement="bottom" />
              </button>
            ) : null}
            {([
              { id: 'comment', ko: '코멘트', en: 'Comment', iconIndex: HEADER_ACTION_ICON_INDEX.comment },
              { id: 'share', ko: '공유', en: 'Share', iconIndex: HEADER_ACTION_ICON_INDEX.share },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                className="group relative h-9 w-9 rounded-[8px] border inline-flex items-center justify-center"
                style={{
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: '#f3f4f6',
                  background: 'rgba(255,255,255,0.1)',
                }}
                aria-label={locale === 'en' ? item.en : item.ko}
              >
                <SfdIconByIndex index={item.iconIndex} color="currentColor" size={15} />
                <CustomTooltip label={locale === 'en' ? item.en : item.ko} placement="bottom" />
              </button>
            ))}
            <button
              type="button"
              className="group relative h-9 min-h-9 px-3.5 rounded-[9px] border-2 text-[12px] font-bold inline-flex items-center gap-2"
              style={{
                borderColor: 'rgba(255,220,140,0.95)',
                color: '#1a0a00',
                background: 'linear-gradient(180deg, #fff4e0 0%, #ffcc66 18%, #ff8e2b 55%, #ea6c12 100%)',
                boxShadow:
                  '0 0 0 1px rgba(255,255,255,0.55) inset, 0 10px 28px rgba(255,110,20,0.55), 0 2px 8px rgba(0,0,0,0.35)',
              }}
              aria-label={locale === 'en' ? 'Plan' : '플랜'}
            >
              <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.plan} color="#7c2d12" size={16} />
              <span className="leading-none tracking-tight">{locale === 'en' ? 'Plan' : '플랜'}</span>
              <CustomTooltip label={locale === 'en' ? 'Premium & billing' : '유료 플랜·결제 안내'} placement="bottom" />
            </button>
            <button
              type="button"
              className="group relative h-9 w-9 rounded-[8px] border inline-flex items-center justify-center"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#f3f4f6',
                background: 'rgba(255,255,255,0.1)',
              }}
              aria-label={locale === 'en' ? 'My Page' : '마이페이지'}
            >
              <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.mypage} color="currentColor" size={15} />
              <CustomTooltip label={locale === 'en' ? 'My Page' : '마이페이지'} placement="bottom" />
            </button>
            <button
              type="button"
              className="group relative h-9 w-9 rounded-[8px] border inline-flex items-center justify-center"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#f3f4f6',
                background: 'rgba(255,255,255,0.1)',
              }}
              onClick={onToggleLocale}
              aria-label={locale === 'en' ? 'Switch language' : '언어 변경'}
            >
              <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.lang} color="currentColor" size={15} />
              <CustomTooltip label={locale === 'en' ? 'language' : '언어'} placement="bottom" />
            </button>
          </div>
        </div>
        <div
          className="h-11 min-h-[44px] flex items-center gap-3 rounded-[10px] px-2"
          style={{ background: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-2 shrink-0">
            {([
              { id: 'menu', index: HEADER_LEFT_ICON_INDEX.menu, active: true, ko: '메뉴', en: 'menu' },
              { id: 'undo', index: HEADER_LEFT_ICON_INDEX.undo, active: false, ko: '실행 취소', en: 'undo' },
              { id: 'redo', index: HEADER_LEFT_ICON_INDEX.redo, active: false, ko: '다시 실행', en: 'redo' },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                className="group relative h-9 w-10 rounded-[8px] border transition-colors duration-150 inline-flex items-center justify-center"
                style={{
                  borderColor: item.active ? accentRgba(POINT_ORANGE, 0.5) : 'rgba(255,255,255,0.2)',
                  color: item.active ? POINT_ORANGE : '#f3f4f6',
                  background: item.active ? accentRgba(POINT_ORANGE, 0.22) : 'rgba(255,255,255,0.1)',
                }}
                title={locale === 'en' ? item.en : item.ko}
                aria-label={locale === 'en' ? item.en : item.ko}
              >
                <SfdIconByIndex
                  index={item.index}
                  color="currentColor"
                  size={15}
                  style={item.id === 'redo' ? { transform: 'scaleX(-1)', transformOrigin: 'center' } : undefined}
                />
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="flex items-center gap-1.5">
            {headerViewButtons.map((label) => {
              const iconIndex = HEADER_VIEW_ICON_INDEX[label];
              const popoverOpen = headerEditPopover === label;
              const isActive = popoverOpen || (label === 'scale' && uniformScaleByPivotActive);
              const anchorRef =
                label === 'grid'
                  ? gridToolAnchorRef
                  : label === 'view'
                    ? viewToolAnchorRef
                    : label === 'layout'
                      ? layoutToolAnchorRef
                    : label === 'scale'
                      ? scaleToolAnchorRef
                      : label === 'ruler'
                        ? rulerToolAnchorRef
                        : label === 'object snap'
                          ? objectSnapToolAnchorRef
                          : label === 'snap'
                            ? snapToolAnchorRef
                            : undefined;
              return (
                <button
                  key={label}
                  ref={anchorRef}
                  type="button"
                  className="group relative h-9 w-9 rounded-[8px] border transition-colors duration-150 inline-flex items-center justify-center"
                  style={{
                    borderColor: isActive ? accentRgba(POINT_ORANGE, 0.5) : 'rgba(255,255,255,0.2)',
                    color: isActive ? POINT_ORANGE : '#f3f4f6',
                    background: isActive
                      ? accentRgba(POINT_ORANGE, 0.22)
                      : 'rgba(255,255,255,0.1)',
                  }}
                  title={label}
                  aria-label={label}
                  aria-expanded={isHeaderEditPopoverKey(label) ? popoverOpen : undefined}
                  aria-haspopup={isHeaderEditPopoverKey(label) ? 'dialog' : undefined}
                  onClick={() => {
                    if (isHeaderEditPopoverKey(label)) {
                      setHeaderEditPopover((cur) => (cur === label ? null : label));
                      return;
                    }
                    setHeaderEditPopover(null);
                  }}
                >
                  <SfdIconByIndex index={iconIndex} color="currentColor" size={15} />
                </button>
              );
            })}
            </div>
          </div>
          <button
            ref={analysisHeaderActionRef}
            type="button"
            className="h-9 min-h-9 px-4 text-[12px] rounded-[9px] border font-semibold shrink-0"
            style={{
              borderColor: headerPrimaryActive ? accentRgba(POINT_ORANGE, 0.55) : 'rgba(255,255,255,0.22)',
              color: '#ffffff',
              background: isRiskMode ? '#f59e0b' : POINT_ORANGE,
              boxShadow: headerPrimaryActive ? `0 6px 18px ${accentRgba(POINT_ORANGE, 0.35)}` : '0 4px 12px rgba(0,0,0,0.25)',
            }}
            aria-haspopup="dialog"
            aria-expanded={!isRiskMode ? safetyDiagnosisCellPickerOpen : undefined}
            aria-controls={!isRiskMode ? 'safety-cell-picker-panel' : undefined}
            onClick={() => {
              if (isRiskMode) return;
              setSafetyDiagnosisCellPickerOpen((o) => !o);
            }}
          >
            {primaryHeaderActionLabel}
          </button>
        </div>
      </div>

      {/* Bottom area (timeline / analysis) */}
      <div
        className="fixed z-[28] rounded-[14px] overflow-hidden"
        {...{ [SFD_ONBOARDING_TARGET_ATTR]: SfdOnboardingTarget.bottomTimelineDock }}
        style={{
          left: bottomOpen ? leftOffset : '50%',
          right: bottomOpen ? rightReserve : undefined,
          bottom: BOTTOM_GAP,
          height: bottomOpen ? bottomHeight : BOTTOM_HEIGHT_COLLAPSED,
          width: bottomOpen ? undefined : collapsedTimelineWidth,
          transform: bottomOpen ? undefined : 'translateX(-50%)',
          background: bottomOpen ? sidePanelTokens.panelBg : 'transparent',
          border: bottomOpen ? `1px solid ${sidePanelTokens.panelBorder}` : 'none',
          boxShadow: bottomOpen ? sidePanelTokens.panelShadow : 'none',
          backdropFilter: bottomOpen ? (isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)') : 'none',
          WebkitBackdropFilter: bottomOpen ? (isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)') : 'none',
          transition: 'height 200ms ease',
        }}
      >
        {!bottomOpen ? (
          renderCollapsedTimeline()
        ) : (
          <>
            <div
              className="h-2 cursor-ns-resize flex items-center justify-center"
              onPointerDown={onBottomResizeStart}
              style={{ background: timelineUiTokens.bottomResizeHandleBg }}
            >
              <GripHorizontal className="w-4 h-4" style={{ color: timelineUiTokens.bottomResizeGrip }} />
            </div>
            <div className="h-[calc(100%-8px)]">
              {bottomTab === 'timeline' ? (
                timelineView === 'overview' ? renderTimelineOverview() : renderTimelineDetail()
              ) : (
                <div
                  className="h-full rounded-[10px] border p-3 text-[11px] leading-[18px] overflow-y-auto sfd-scroll"
                  style={{
                    borderColor: sidePanelTokens.inputBorder,
                    background: sidePanelTokens.panelBg,
                    color: isDarkPreview ? '#d1d5db' : '#374151',
                  }}
                >
                  {locale === 'en'
                    ? 'Analysis chart/table area. Default when Analysis mode is active.'
                    : '분석 그래프/테이블 영역입니다. Analysis 모드 활성 시 기본 노출됩니다.'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {bottomOpen && (
        <div
          className="fixed z-[29] h-8 rounded-[10px] p-1 inline-flex items-center gap-1"
          style={{
            left: leftOffset + 8,
            top: `calc(100vh - ${BOTTOM_GAP + bottomHeight}px - 18px)`,
            transform: 'translateY(-100%)',
            background: sidePanelTokens.panelBg,
            border: `1px solid ${sidePanelTokens.panelBorder}`,
            boxShadow: sidePanelTokens.panelShadow,
            backdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          }}
        >
          {([
            { id: 'timeline', ko: '타임라인', en: 'Timeline' },
            { id: 'analysis', ko: '분석', en: 'Analysis' },
          ] as const).map((tab) => {
            const active = bottomTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className="px-3 h-6 rounded-[7px] text-[11px] font-semibold"
                style={{
                  background: active ? accentRgba(POINT_ORANGE, 0.18) : 'transparent',
                  color: active ? POINT_ORANGE : (isDarkPreview ? '#d1d5db' : '#4b5563'),
                  border: active ? `1px solid ${accentRgba(POINT_ORANGE, 0.4)}` : '1px solid transparent',
                }}
                onClick={() => setBottomTab(tab.id)}
              >
                {locale === 'en' ? tab.en : tab.ko}
              </button>
            );
          })}
        </div>
      )}
      <ViewModeEditMenuPopover
        open={headerEditPopover === 'view'}
        anchorRef={viewToolAnchorRef}
        locale={locale}
        onClose={() => setHeaderEditPopover(null)}
      />
      <GridCanvasEditMenuPopover
        open={headerEditPopover === 'grid'}
        anchorRef={gridToolAnchorRef}
        locale={locale}
        gridMm={workspaceGridMm}
        onGridMmChange={setWorkspaceGridMm}
        canvasBg={workspaceCanvasBg}
        onCanvasBgChange={setWorkspaceCanvasBg}
        onClose={() => setHeaderEditPopover(null)}
      />
      <ScaleEditMenuPopover
        open={headerEditPopover === 'scale'}
        anchorRef={scaleToolAnchorRef}
        locale={locale}
        uniformScaleActive={uniformScaleByPivotActive}
        onUniformScaleActiveChange={setUniformScaleByPivotActive}
        onClose={() => setHeaderEditPopover(null)}
      />
      <LayoutAlignEditMenuPopover
        open={headerEditPopover === 'layout'}
        anchorRef={layoutToolAnchorRef}
        locale={locale}
        onClose={() => setHeaderEditPopover(null)}
      />
      <RulerEditMenuPopover
        open={headerEditPopover === 'ruler'}
        anchorRef={rulerToolAnchorRef}
        locale={locale}
        measureActive={rulerMeasureActive}
        onMeasureActiveChange={setRulerMeasureActive}
        onClose={() => setHeaderEditPopover(null)}
      />
      <ObjectSnapEditMenuPopover
        open={headerEditPopover === 'object snap'}
        anchorRef={objectSnapToolAnchorRef}
        locale={locale}
        mode={snapMode}
        onModeChange={setSnapMode}
        onClose={() => setHeaderEditPopover(null)}
      />
      <SnapSettingsEditMenuPopover
        open={headerEditPopover === 'snap'}
        anchorRef={snapToolAnchorRef}
        locale={locale}
        moveMm={snapMoveMm}
        onMoveMmChange={setSnapMoveMm}
        rotateDeg={snapRotateDeg}
        onRotateDegChange={setSnapRotateDeg}
        onReset={resetSnapToDefaults}
        onClose={() => setHeaderEditPopover(null)}
      />
      <SafetyDiagnosisCellPickerModal
        open={safetyDiagnosisCellPickerOpen}
        locale={locale}
        isDark={isDarkPreview}
        anchorRef={analysisHeaderActionRef}
        onClose={() => setSafetyDiagnosisCellPickerOpen(false)}
        onConfirm={(picked) => {
          setSafetyDiagnosisPickedCell(picked);
          setSafetyDiagnosisModalOpen(true);
        }}
      />
      <SafetyDiagnosisModal
        open={safetyDiagnosisModalOpen}
        locale={locale}
        isDark={isDarkPreview}
        cell={safetyDiagnosisPickedCell}
        onClose={() => {
          setSafetyDiagnosisModalOpen(false);
          setSafetyDiagnosisPickedCell(null);
        }}
        onStartAnalysis={() => {
          setLeftMode('analysis');
          setLeftOpen(true);
        }}
      />
      <SensorSafetyDistanceCalculatorModal
        open={sensorSafetyCalculatorOpen}
        locale={locale}
        isDark={isDarkPreview}
        cellLabel={processInfoFormInitial.processName}
        onClose={() => setSensorSafetyCalculatorOpen(false)}
      />
      <ProcessInfoEditModal
        open={processInfoModalOpen}
        locale={locale}
        theme={uiPreviewMode}
        initial={processInfoFormInitial}
        onClose={() => setProcessInfoModalOpen(false)}
        onSave={setSavedProcessInfo}
      />
      <ModalExamplesLayer
        open={modalExamplesOpen}
        onClose={() => setModalExamplesOpen(false)}
        isDark={isDarkPreview}
        locale={locale}
      />
      <OnboardingGuideLayer
        open={onboardingGuideOpen}
        onClose={() => setOnboardingGuideOpen(false)}
        isDark={isDarkPreview}
        locale={locale}
        onOpenRelatedUI={handleOnboardingOpenRelated}
      />

      {libraryDrawingModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{
            background: isDarkPreview ? 'rgba(0,0,0,0.62)' : 'rgba(0,0,0,0.5)',
            backdropFilter: isDarkPreview ? 'blur(6px)' : 'blur(2px)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(6px)' : 'blur(2px)',
          }}
          role="presentation"
          onClick={() => setLibraryDrawingModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-drawing-modal-title"
            className="w-full max-w-[min(420px,calc(100vw-32px))] rounded-2xl border shadow-2xl overflow-hidden"
            style={{
              background: isDarkPreview ? 'rgba(18,20,26,0.96)' : '#ffffff',
              borderColor: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)',
              boxShadow: isDarkPreview
                ? '0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset'
                : '0 24px 48px rgba(15,23,42,0.18)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b"
              style={{ borderColor: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)' }}
            >
              <h2
                id="library-drawing-modal-title"
                className="text-[15px] font-bold leading-[19px] pr-2"
                style={{ color: isDarkPreview ? '#f4f4f5' : '#18181b' }}
              >
                {libraryDrawing
                  ? locale === 'en'
                    ? 'Replace drawing'
                    : '도면 교체'
                  : locale === 'en'
                    ? 'Upload drawing'
                    : '도면 업로드'}
              </h2>
              <button
                type="button"
                className="shrink-0 rounded-lg p-1.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45"
                style={{ color: isDarkPreview ? 'rgba(228,228,231,0.75)' : '#52525b' }}
                onClick={() => setLibraryDrawingModalOpen(false)}
                aria-label={locale === 'en' ? 'Close' : '닫기'}
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <div className="px-4 py-3">
              <p
                className="text-[13px] leading-[21px]"
                style={{ color: isDarkPreview ? 'rgba(228,228,231,0.78)' : '#52525b' }}
              >
                {locale === 'en' ? (
                  <>
                    Reference drawing for the workspace (e.g. header strip). Formats: DWG, DXF, PDF, STEP/STP, PNG,
                    JPG, SVG. This is <strong style={{ color: isDarkPreview ? '#e4e4e7' : '#27272a' }}>not</strong> a
                    library asset—nothing is added to the library tree.
                  </>
                ) : (
                  <>
                    작업 영역 참고용 도면입니다(예: 상단 스트립). 형식: DWG, DXF, PDF, STEP(STP), 이미지, SVG 등.{' '}
                    <strong style={{ color: isDarkPreview ? '#e4e4e7' : '#27272a' }}>라이브러리 자산과 별개</strong>이며
                    트리에 항목이 추가되지 않습니다.
                  </>
                )}
              </p>
            </div>
            <div
              className="flex items-center justify-end gap-2 px-4 py-3 border-t"
              style={{
                borderColor: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
                background: isDarkPreview ? 'rgba(12,14,18,0.92)' : 'rgba(250,250,250,0.96)',
              }}
            >
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-[12px] font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45"
                style={{
                  background: isDarkPreview ? 'transparent' : '#ffffff',
                  border: `1px solid ${isDarkPreview ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.14)'}`,
                  color: isDarkPreview ? '#e4e4e7' : '#27272a',
                }}
                onClick={() => setLibraryDrawingModalOpen(false)}
              >
                {locale === 'en' ? 'Close' : '닫기'}
              </button>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-[12px] font-bold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/45"
                style={{
                  background: accentRgba(POINT_ORANGE, 0.18),
                  border: `1px solid ${accentRgba(POINT_ORANGE, 0.42)}`,
                  color: POINT_ORANGE,
                }}
                onClick={openLibraryDrawingPicker}
              >
                {locale === 'en' ? 'Choose file' : '파일 선택'}
              </button>
            </div>
          </div>
        </div>
      )}

      {bottomOpen && (
        <button
          type="button"
          className="group fixed z-[29] h-8 w-14 rounded-[10px] border transition-colors duration-150 inline-flex items-center justify-center"
          style={{
            left: '50%',
            top: `calc(100vh - ${BOTTOM_GAP + bottomHeight}px - 18px)`,
            transform: 'translate(-50%, -100%)',
            borderColor: sidePanelTokens.panelBorder,
            background: sidePanelTokens.panelBg,
            color: isDarkPreview ? '#e5e7eb' : '#334155',
            boxShadow: sidePanelTokens.panelShadow,
            backdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
          }}
          onClick={() => setBottomOpen(false)}
          aria-label={locale === 'en' ? 'Collapse timeline' : '타임라인 접기'}
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <CustomTooltip label={locale === 'en' ? 'Collapse timeline' : '타임라인 접기'} placement="top" />
        </button>
      )}

      <CriLegend visible={leftMode === 'analysis'} locale={locale} />
    </>
  );
}

