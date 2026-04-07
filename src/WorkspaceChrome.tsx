import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen,
  FolderTree,
  BarChart3,
  ShieldAlert,
  Bot,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowLeft,
  Map,
  User,
  Upload,
  Settings,
  Sparkles,
  GripHorizontal,
  Play,
  Square,
  Repeat,
} from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';
import { DARK as PROPERTY_DARK_TOKENS, LIGHT as PROPERTY_LIGHT_TOKENS } from './PropertyPanel';
import { getItemIconPreference } from './sfd/itemIconPreferences';
import {
  WORKSPACE_CONTENT_TOP_PX,
  WORKSPACE_HEADER_HEIGHT_PX,
  WORKSPACE_HEADER_TOP_PX,
} from './chromeLayout';

export type LeftMode = 'library' | 'tree' | 'analysis' | 'riskassessment' | 'safetyai';
type BottomTab = 'timeline' | 'analysis';
type TreeNodeType = 'cell' | 'manipulator' | 'gripper' | 'zone' | 'impact' | 'axis' | 'mobile';
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
  id: string;
  title: string;
  icon: 'doc' | 'robot' | 'layout' | 'human';
  chips: LibraryChip[];
}

const LEFT_GNB_WIDTH = 56;
const LEFT_PANEL_MIN_WIDTH = 320;
const LEFT_PANEL_MAX_WIDTH = 460;
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
        label: '매니퓰레이터',
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
            id: 'robot-settings',
            label: '로봇 설정',
            type: 'manipulator',
            children: [
              { id: 'zone-operating', label: '운전 영역', type: 'zone' },
              { id: 'zone-max', label: '최대운전영역', type: 'zone' },
              { id: 'zone-collab', label: '협동작업영역', type: 'zone' },
              { id: 'impact-robot', label: '로봇 충돌예상부위', type: 'impact' },
            ],
          },
        ],
      },
      {
        id: 'mobile-manip',
        label: '모바일 매니퓰레이터',
        type: 'mobile',
        children: [
          { id: 'mobile-base', label: '모바일', type: 'mobile', processBadge: true },
          { id: 'mobile-manipulator', label: '매니퓰레이터', type: 'manipulator', cri: '0.7', processBadge: true },
        ],
      },
      {
        id: 'manip-plus-axis',
        label: '매니퓰레이터 + 부가축',
        type: 'manipulator',
        children: [
          { id: 'main-manip', label: '매니퓰레이터', type: 'manipulator', cri: '0.7', processBadge: true },
          { id: 'axis-1', label: '부가축 1', type: 'axis', processBadge: true },
          { id: 'axis-2', label: '부가축 2', type: 'axis', processBadge: true },
        ],
      },
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
};

const LIBRARY_SECTIONS: LibrarySection[] = [
  {
    id: 'doc',
    title: '도면',
    icon: 'doc',
    chips: [{ id: 'doc-upload', label: '도면 업로드' }],
  },
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
    ],
  },
  {
    id: 'human',
    title: '사람',
    icon: 'human',
    chips: [{ id: 'worker', label: '작업자' }],
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

const TIMELINE_TICKS = ['00:00', '00:50', '01:00', '01:50', '02:00', '02:50', '03:00', '03:50', '04:00'];
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
}: {
  locale: 'ko' | 'en';
  rightPanelVisible: boolean;
  onToggleLocale?: () => void;
  uiPreviewMode?: 'light' | 'dark';
  onUiPreviewModeChange?: (mode: 'light' | 'dark') => void;
}) {
  const [leftMode, setLeftMode] = useState<LeftMode>('tree');
  const [leftOpen, setLeftOpen] = useState(true);
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
  const [internalUiPreviewMode, setInternalUiPreviewMode] = useState<'light' | 'dark'>('light');
  const [selectedRobotType, setSelectedRobotType] = useState('협동 로봇');
  const [selectedBrand, setSelectedBrand] = useState('Universal');
  const [selectedModel, setSelectedModel] = useState('UR10');
  const [expandedTreeIds, setExpandedTreeIds] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    defaults.add('cell-robot-abc');
    defaults.add('manip-main');
    defaults.add('gripper');
    defaults.add('robot-settings');
    defaults.add('mobile-manip');
    defaults.add('manip-plus-axis');
    return defaults;
  });
  const uiPreviewMode = controlledUiPreviewMode ?? internalUiPreviewMode;
  const isDarkPreview = uiPreviewMode === 'dark';
  const sidePanelTokens = isDarkPreview ? PROPERTY_DARK_TOKENS : PROPERTY_LIGHT_TOKENS;

  useEffect(() => {
    if (leftMode === 'analysis') setBottomTab('analysis');
    else setBottomTab('timeline');
  }, [leftMode]);

  const leftOffset = LEFT_GNB_WIDTH + (leftOpen ? leftWidth : 0) + 8;
  const rightReserve = rightPanelVisible ? 12 : 12;

  const resizingRef = useRef<{
    startX: number;
    startWidth: number;
  } | null>(null);
  const bottomResizingRef = useRef<{ startY: number; startH: number } | null>(null);

  const onResizeStart = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!leftOpen) return;
    e.preventDefault();
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
  }, [leftOpen, leftWidth]);

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
    { id: 'library' as const, labelKo: '라이브러리', labelEn: 'Library', Icon: BookOpen },
    { id: 'tree' as const, labelKo: '트리', labelEn: 'Tree', Icon: FolderTree },
    { id: 'analysis' as const, labelKo: '분석', labelEn: 'Analysis', Icon: BarChart3 },
    { id: 'riskassessment' as const, labelKo: '위험성평가', labelEn: 'Risk', Icon: ShieldAlert },
    { id: 'safetyai' as const, labelKo: 'Safety AI', labelEn: 'Safety AI', Icon: Bot },
  ]), []);

  const modeLabel = modeDefs.find((m) => m.id === leftMode);
  const modeIcon = modeLabel?.Icon ?? FolderTree;
  const ModeIcon = modeIcon;
  const isRiskMode = leftMode === 'riskassessment';
  const primaryHeaderActionLabel = isRiskMode ? 'Report Issue' : 'Analysis';
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
  }), [
    isDarkPreview,
    sidePanelTokens.divider,
    sidePanelTokens.inputBg,
    sidePanelTokens.inputBorder,
    sidePanelTokens.sectionHeaderBg,
    sidePanelTokens.textPrimary,
    sidePanelTokens.textSecondary,
  ]);

  const renderTreeNode = useCallback((node: TreeNodeItem, depth: number) => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedTreeIds.has(node.id);
    const rowPaddingLeft = 10 + depth * TREE_INDENT_PX;
    const iconColor = node.type === 'impact'
      ? (isDarkPreview ? '#f59e0b' : '#737373')
      : leftUiTokens.treeIcon;

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
          className="h-8 rounded-[8px] flex items-center gap-1.5 transition-colors duration-120"
          style={{
            paddingLeft: rowPaddingLeft,
            paddingRight: 8,
            background: depth === 0 ? 'rgba(255,142,43,0.12)' : 'transparent',
            border: depth === 0 ? `1px solid ${accentRgba(POINT_ORANGE, 0.45)}` : '1px solid transparent',
          }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="w-4 h-4 rounded-[4px] flex items-center justify-center text-[10px] leading-none"
              style={{ color: leftUiTokens.treeToggle }}
              onClick={() => toggleTreeNode(node.id)}
              aria-label={isExpanded ? '하위 항목 접기' : '하위 항목 펼치기'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-4 h-4" aria-hidden />
          )}
          <span className="text-[11px] leading-none" style={{ color: iconColor }}>
            {TREE_TYPE_ICON[node.type]}
          </span>
          <span
            className="text-[12px] font-medium leading-tight truncate"
            style={{ color: leftUiTokens.treeText }}
            title={node.label}
          >
            {node.label}
          </span>
          <div className="flex-1" />
          {node.cri && (
            <span className="text-[11px] font-semibold leading-none" style={{ color: '#16a34a' }}>
              CRI: {node.cri}
            </span>
          )}
          {node.processBadge && (
            <span
              className="h-4 min-w-4 px-1 rounded-[4px] text-[10px] font-bold leading-[16px] text-center"
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
  }, [expandedTreeIds, isDarkPreview, leftUiTokens.treeGuide, leftUiTokens.treeIcon, leftUiTokens.treeText, leftUiTokens.treeToggle, locale, toggleTreeNode]);

  const getSectionIcon = useCallback((icon: LibrarySection['icon']) => {
    if (icon === 'layout') return <Map className="w-3.5 h-3.5" style={{ color: leftUiTokens.libraryMuted }} />;
    if (icon === 'human') return <User className="w-3.5 h-3.5" style={{ color: leftUiTokens.libraryMuted }} />;
    if (icon === 'robot') return <Bot className="w-3.5 h-3.5" style={{ color: leftUiTokens.libraryMuted }} />;
    return <Upload className="w-3.5 h-3.5" style={{ color: leftUiTokens.libraryMuted }} />;
  }, [leftUiTokens.libraryMuted]);

  const goToLibraryRoot = useCallback(() => {
    setLibraryStage('root');
    setSelectedBrand('Universal');
  }, []);

  const renderLibraryRoot = useCallback(() => (
    <div className="flex flex-col gap-3">
      {LIBRARY_SECTIONS.map((section) => (
        <section key={section.id} className="pb-3 border-b last:border-b-0" style={{ borderColor: leftUiTokens.librarySectionBorder }}>
          <div className="flex items-center gap-2 mb-2 px-1">
            {getSectionIcon(section.icon)}
            <h4 className="text-[13px] font-semibold" style={{ color: leftUiTokens.libraryTitle }}>{section.title}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {section.chips.map((chip) => {
              const isSingle = section.chips.length === 1;
              return (
                <button
                  key={chip.id}
                  type="button"
                  className={`h-11 rounded-[8px] text-[12px] font-semibold transition-colors ${isSingle ? 'col-span-2' : ''}`}
                  style={{
                    background: leftUiTokens.libraryChipBg,
                    color: leftUiTokens.libraryBodyText,
                    border: `1px solid ${leftUiTokens.libraryChipBorder}`,
                  }}
                  onClick={() => {
                    if (chip.id === 'collab-robot') {
                      setSelectedRobotType(chip.label);
                      setLibraryStage('brands');
                    }
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  ), [getSectionIcon, leftUiTokens.libraryBodyText, leftUiTokens.libraryChipBg, leftUiTokens.libraryChipBorder, leftUiTokens.librarySectionBorder, leftUiTokens.libraryTitle]);

  const renderBrandList = useCallback(() => (
    <div className="flex flex-col">
      <button
        type="button"
        className="h-10 inline-flex items-center gap-2 w-fit px-1 mb-2"
        onClick={goToLibraryRoot}
        style={{ color: leftUiTokens.libraryBodyText }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-[27px] font-semibold">{selectedRobotType}</span>
      </button>
      <div className="flex flex-col border-t" style={{ borderColor: leftUiTokens.librarySectionBorder }}>
        {LIBRARY_BRANDS.map((brand) => (
          <button
            key={brand}
            type="button"
            className="h-10 flex items-center gap-2 border-b px-1"
            style={{ borderColor: leftUiTokens.librarySectionBorder, color: leftUiTokens.libraryBodyText }}
            onClick={() => {
              setSelectedBrand(brand);
              setLibraryStage('models');
            }}
          >
            <span className="text-[20px] font-semibold truncate">{brand}</span>
            <div className="flex-1" />
            <ChevronRight className="w-4 h-4" style={{ color: leftUiTokens.libraryMuted }} />
          </button>
        ))}
      </div>
    </div>
  ), [goToLibraryRoot, leftUiTokens.libraryBodyText, leftUiTokens.libraryMuted, leftUiTokens.librarySectionBorder, selectedRobotType]);

  const renderModelGrid = useCallback(() => {
    const models = LIBRARY_MODELS[selectedBrand] ?? ['RX-1', 'RX-2', 'RX-3', 'RX-5', 'RX-8'];
    return (
      <div className="flex flex-col">
        <button
          type="button"
          className="h-10 inline-flex items-center gap-2 w-fit px-1 mb-2"
          onClick={() => setLibraryStage('brands')}
        style={{ color: leftUiTokens.libraryBodyText }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[27px] font-semibold">{selectedRobotType}</span>
        </button>
        <button
          type="button"
          className="h-10 w-full border-b inline-flex items-center"
          style={{ borderColor: leftUiTokens.librarySectionBorder, color: leftUiTokens.libraryBodyText }}
        >
          <span className="text-[20px] font-semibold">{selectedBrand}</span>
          <div className="flex-1" />
          <ChevronUp className="w-4 h-4" style={{ color: leftUiTokens.libraryMuted }} />
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {models.map((model) => {
            const active = selectedModel === model;
            return (
              <button
                key={model}
                type="button"
                className="h-[92px] rounded-[8px] border overflow-hidden"
                style={{
                  background: leftUiTokens.libraryModelCardBg,
                  borderColor: active ? '#ff8e2b' : leftUiTokens.libraryChipBorder,
                  boxShadow: active ? `0 0 0 1px ${accentRgba(POINT_ORANGE, 0.25)} inset` : 'none',
                }}
                onClick={() => setSelectedModel(model)}
              >
                <div className="h-12 flex items-center justify-center text-[14px]" style={{ color: leftUiTokens.libraryMuted }}>
                  Robot
                </div>
                <div className="h-10 border-t flex items-center justify-center text-[12px] font-semibold" style={{ borderColor: leftUiTokens.libraryModelCardDivider, color: leftUiTokens.libraryBodyText }}>
                  {model}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }, [leftUiTokens.libraryBodyText, leftUiTokens.libraryChipBorder, leftUiTokens.libraryModelCardBg, leftUiTokens.libraryModelCardDivider, leftUiTokens.libraryMuted, leftUiTokens.librarySectionBorder, selectedBrand, selectedModel, selectedRobotType]);

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
        borderColor: 'rgba(0,0,0,0.08)',
        cursor: onClick ? 'pointer' : 'default',
        background: 'transparent',
      }}
      onClick={onClick}
      disabled={!onClick}
    >
      <div className="px-2 text-[10px] font-semibold flex items-center border-r truncate" style={{ borderColor: 'rgba(0,0,0,0.08)', color: '#374151' }}>
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
  ), []);

  const renderTimelineTransportBar = useCallback((compact = false) => (
    <div
      className={`${compact ? 'h-9' : 'h-10'} w-full rounded-[9px] border px-3 flex items-center gap-2`}
      style={{
        borderColor: 'rgba(0,0,0,0.12)',
        background: 'rgba(255,255,255,0.92)',
        color: '#374151',
      }}
    >
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(0,0,0,0.22)' }}>
        <Play className="w-3 h-3" />
      </button>
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(0,0,0,0.22)' }}>
        <Square className="w-2.5 h-2.5" />
      </button>
      <span className="text-[11px] font-semibold tabular-nums">00:00.0/04:07.1</span>
      <div className="relative">
        <button
          type="button"
          className="h-6 px-2 rounded-[6px] border text-[10px] font-semibold"
          style={{ borderColor: 'rgba(0,0,0,0.16)', background: 'rgba(255,255,255,0.78)' }}
          onClick={() => setPlaybackMenuOpen((v) => !v)}
        >
          x {playbackRate.toFixed(1)}
        </button>
        {playbackMenuOpen && (
          <div
            className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 rounded-[8px] border p-1 flex flex-col gap-0.5 z-10"
            style={{
              borderColor: 'rgba(0,0,0,0.14)',
              background: 'rgba(255,255,255,0.98)',
              boxShadow: '0 10px 18px rgba(0,0,0,0.24)',
            }}
          >
            {TIMELINE_PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                type="button"
                className="h-6 px-2 rounded-[6px] text-[10px] font-semibold text-left"
                style={{
                  color: rate === playbackRate ? POINT_ORANGE : '#1f2937',
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
      <div className="flex-1 h-1.5 rounded-full relative" style={{ background: 'rgba(0,0,0,0.14)' }}>
        <div className="absolute left-[35%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full" style={{ background: '#ff8e2b' }} />
      </div>
      <button type="button" className="w-5 h-5 rounded-full border flex items-center justify-center" style={{ borderColor: 'rgba(0,0,0,0.18)' }}>
        <Repeat className="w-3 h-3" />
      </button>
    </div>
  ), [playbackMenuOpen, playbackRate]);

  const renderTimelineRuler = useCallback(() => (
    <div className="h-10 px-2 grid grid-cols-[58px_1fr] border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
      <div />
      <div className="relative">
        <div
          className="absolute inset-x-0 top-0 bottom-4"
          style={{
            background:
              'repeating-linear-gradient(to right, rgba(0,0,0,0.18) 0 1px, transparent 1px 10%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 bottom-5"
          style={{
            background:
              'repeating-linear-gradient(to right, rgba(0,0,0,0.08) 0 1px, transparent 1px 2%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between text-[9px]" style={{ color: '#6b7280' }}>
          {TIMELINE_TICKS.map((tick) => <span key={tick}>{tick}</span>)}
        </div>
      </div>
    </div>
  ), []);

  const renderTimelineOverview = useCallback(() => (
    <div className="h-full rounded-[10px] overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.14)', background: 'rgba(255,255,255,0.94)' }}>
      <div className="h-[46px] px-2 py-1 border-b flex flex-col gap-1 justify-center" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
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
          <div className="border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
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
  ), [renderTimelineRow, timelineCollapsedTree, renderTimelineRuler, renderTimelineTransportBar]);

  const renderTimelineDetail = useCallback(() => (
    <div className="h-full rounded-[10px] overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,0.14)', background: 'rgba(255,255,255,0.94)' }}>
      <div className="h-[72px] px-2 py-1 border-b flex flex-col gap-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <div className="h-6 flex items-center gap-2">
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{ borderColor: 'rgba(0,0,0,0.14)', background: 'rgba(255,255,255,0.72)', color: '#4b5563' }}
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
              borderColor: selectedTimelineTarget === 'additional' ? accentRgba(POINT_ORANGE, 0.45) : 'rgba(0,0,0,0.14)',
              background: selectedTimelineTarget === 'additional' ? accentRgba(POINT_ORANGE, 0.2) : 'rgba(255,255,255,0.72)',
              color: selectedTimelineTarget === 'additional' ? POINT_ORANGE : '#4b5563',
            }}
            onClick={() => setSelectedTimelineTarget('additional')}
          >
            Additional
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{
              borderColor: selectedTimelineTarget === 'cobot2' ? accentRgba(POINT_ORANGE, 0.45) : 'rgba(0,0,0,0.14)',
              background: selectedTimelineTarget === 'cobot2' ? accentRgba(POINT_ORANGE, 0.2) : 'rgba(255,255,255,0.72)',
              color: selectedTimelineTarget === 'cobot2' ? POINT_ORANGE : '#4b5563',
            }}
            onClick={() => setSelectedTimelineTarget('cobot2')}
          >
            COBOT2
          </button>
          <button
            type="button"
            className="h-6 px-2 rounded-[6px] text-[10px] font-semibold border"
            style={{
              borderColor: selectedTimelineTarget === 'mobile' ? accentRgba(POINT_ORANGE, 0.45) : 'rgba(0,0,0,0.14)',
              background: selectedTimelineTarget === 'mobile' ? accentRgba(POINT_ORANGE, 0.2) : 'rgba(255,255,255,0.72)',
              color: selectedTimelineTarget === 'mobile' ? POINT_ORANGE : '#4b5563',
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
            <div className="relative h-10 border-b" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
              <div className="absolute inset-x-1 top-3 h-4 rounded-[3px]" style={{ background: '#0f4ea3' }} />
              {[20, 46, 72].map((left, idx) => (
                <div key={idx} className="absolute top-1 h-8 w-[2px]" style={{ left: `${left}%`, background: '#f97316' }} />
              ))}
              <div className="absolute top-0 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded-[4px]" style={{ background: 'rgba(249,115,22,0.18)', color: POINT_ORANGE }}>
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
  ), [renderTimelineRow, selectedTimelineTarget, renderTimelineRuler, renderTimelineTransportBar]);

  const renderCollapsedTimeline = useCallback(() => (
    <div className="h-full flex flex-col items-center justify-center gap-1.5 px-3">
      <button
        type="button"
        className="group relative h-6 w-12 rounded-[8px] border transition-colors duration-150 inline-flex items-center justify-center"
        style={{
          borderColor: 'rgba(0,0,0,0.14)',
          background: 'rgba(255,255,255,0.95)',
          color: '#374151',
        }}
        onClick={() => setBottomOpen(true)}
        title="클릭하여 타임라인 열기"
      >
        <ChevronUp className="w-3.5 h-3.5" />
        <span
          className="pointer-events-none absolute left-1/2 top-[calc(100%+6px)] -translate-x-1/2 rounded-[6px] border px-2 py-1 text-[10px] font-medium leading-none whitespace-nowrap opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0"
          style={{
            borderColor: 'rgba(0,0,0,0.12)',
            color: '#111827',
            background: 'rgba(255,255,255,0.96)',
            boxShadow: '0 6px 14px rgba(0,0,0,0.22)',
          }}
          aria-hidden
        >
          클릭하여 타임라인 열기
        </span>
      </button>
      {renderTimelineTransportBar(true)}
    </div>
  ), [renderTimelineTransportBar]);

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

  const renderAnalysisAreaLayout = useCallback(() => (
    <div className="h-full relative flex flex-col border rounded-[10px] overflow-hidden p-3 gap-3" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.tabBarBg }}>
      <div className="w-[112px] h-8 rounded-[7px] border px-3 flex items-center justify-between text-[11px] font-semibold" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg, color: sidePanelTokens.textPrimary }}>
        <span>Robot Cell</span>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
      </div>
      <div className="text-[12px] font-semibold" style={{ color: sidePanelTokens.textPrimary }}>Recommend Solution</div>
      <div className="h-28 rounded-[8px] border" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }} />
      <div className="h-28 rounded-[8px] border" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }} />
      <div className="mt-2 text-[12px] font-semibold" style={{ color: sidePanelTokens.textPrimary }}>Robot Analysis Result</div>
      <div className="h-36 rounded-[8px] border" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }} />
      <div className="mt-2 text-[12px] font-semibold" style={{ color: sidePanelTokens.textPrimary }}>Unresolved Issues</div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-10 rounded-[8px] border" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }} />
        ))}
      </div>
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[7px] w-3.5 h-10 rounded-r-[4px] border"
        style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.sectionHeaderBg }}
        aria-hidden
      />
    </div>
  ), [sidePanelTokens.inputBg, sidePanelTokens.inputBorder, sidePanelTokens.sectionHeaderBg, sidePanelTokens.tabBarBg, sidePanelTokens.textPrimary]);

  const renderSafetyAiAreaLayout = useCallback(() => (
    <div className="h-full border rounded-[10px] overflow-hidden relative" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.tabBarBg }}>
      <div className="absolute inset-x-0 top-0 h-[72%] border-b" style={{ borderColor: sidePanelTokens.inputBorder }} />
      <div className="absolute inset-x-4 bottom-8 h-24 rounded-[8px] border" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }} />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[7px] w-3.5 h-10 rounded-r-[4px] border"
        style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.sectionHeaderBg }}
        aria-hidden
      />
    </div>
  ), [sidePanelTokens.inputBg, sidePanelTokens.inputBorder, sidePanelTokens.sectionHeaderBg, sidePanelTokens.tabBarBg]);

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
            {modeDefs.map(({ id, labelKo, labelEn, Icon }) => {
              const active = leftMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  className="group relative h-12 rounded-[12px] flex items-center justify-center transition-all duration-150 border"
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
                  <Icon className="w-4.5 h-4.5" strokeWidth={2.1} />
                  <CustomTooltip label={locale === 'en' ? labelEn : labelKo} placement="right" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="group fixed z-[31] h-14 w-7 rounded-[10px] border transition-colors duration-150 inline-flex items-center justify-center"
        style={{
          left: leftMenuRight + 2,
          top: `calc(${WORKSPACE_CONTENT_TOP_PX}px + (100vh - ${WORKSPACE_CONTENT_TOP_PX + 8}px) / 2)`,
          transform: 'translateY(-50%)',
          borderColor: sidePanelTokens.inputBorder,
          background: sidePanelTokens.inputBg,
          color: sidePanelTokens.textPrimary,
          boxShadow: sidePanelTokens.elevationRaised,
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
            <div className="px-3 py-2.5 border-b flex items-center gap-2" style={{ borderColor: sidePanelTokens.divider, background: sidePanelTokens.sectionHeaderBg }}>
              {modeIcon === FolderTree
                ? <FolderTree className="w-3.5 h-3.5" style={{ color: POINT_ORANGE }} />
                : <ModeIcon className="w-3.5 h-3.5" style={{ color: POINT_ORANGE }} />}
              <span className="text-[12px] font-semibold" style={{ color: sidePanelTokens.textPrimary }}>
                {locale === 'en' ? modeLabel?.labelEn : modeLabel?.labelKo}
              </span>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll p-3">
              {leftMode === 'library' ? (
                <div className="flex flex-col gap-3">
                  <div className="h-10 rounded-[8px] border px-3 flex items-center gap-2" style={{ borderColor: sidePanelTokens.inputBorder, background: sidePanelTokens.inputBg }}>
                    <Search className="w-4 h-4" style={{ color: sidePanelTokens.textSecondary }} />
                    <input
                      value={librarySearch}
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      placeholder={locale === 'en' ? 'Search by keyword' : '검색어를 입력해 주세요.'}
                      className="bg-transparent outline-none w-full text-[12px] placeholder:text-zinc-500"
                      style={{ color: sidePanelTokens.textPrimary }}
                    />
                  </div>
                  {renderLibraryContent()}
                </div>
              ) : leftMode === 'tree' ? (
                renderTreeAreaLayout()
              ) : leftMode === 'analysis' || leftMode === 'riskassessment' ? (
                renderAnalysisAreaLayout()
              ) : leftMode === 'safetyai' ? (
                renderSafetyAiAreaLayout()
              ) : (
                <div className="rounded-[10px] p-3 text-[11px] leading-relaxed" style={{ background: sidePanelTokens.sectionHeaderBg, color: sidePanelTokens.textSecondary }}>
                  {locale === 'en'
                    ? 'Left area placeholder based on selected GNB mode.'
                    : 'Left GNB 모드에 따라 바뀌는 영역입니다.'}
                </div>
              )}
            </div>
          </div>
          <div
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize"
            onPointerDown={onResizeStart}
            title={locale === 'en' ? 'Resize' : '너비 조절'}
          >
            <div className="w-full h-full flex items-center justify-center opacity-30">
              <GripVertical className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}

      {/* Header (top_area) */}
      <div
        className="fixed z-[28] flex flex-col px-3 py-2 gap-2"
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
          className="h-8 flex items-center gap-3 rounded-[8px] px-2"
          style={{ background: isDarkPreview ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)' }}
        >
          <button
            type="button"
            className="h-7 px-2.5 rounded-[7px] border text-[10px] font-semibold"
            style={{
              borderColor: 'rgba(255,255,255,0.16)',
              color: '#e5e7eb',
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            Statics
          </button>
          <div className="flex-1 min-w-0 flex justify-start">
            <div
              className="h-8 min-w-[340px] max-w-[520px] px-3 border rounded-[8px] text-[11px] font-semibold flex items-center justify-start"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#e5e7eb', background: 'rgba(255,255,255,0.08)' }}
            >
              <span className="flex-1 min-w-0 truncate">
                {locale === 'en' ? 'Mockup: EV Battery Pack Assembly Line 01' : '목업: EV 배터리 팩 조립 라인 01'}
              </span>
              <button
                type="button"
                className="group relative h-6 w-6 rounded-[6px] border inline-flex items-center justify-center shrink-0 transition-colors duration-150"
                style={{
                  borderColor: 'rgba(255,255,255,0.16)',
                  color: '#e5e7eb',
                  background: 'rgba(255,255,255,0.1)',
                }}
                aria-label={locale === 'en' ? 'Edit process info' : '공정 정보 수정'}
              >
                <Settings className="w-3.5 h-3.5" strokeWidth={2} />
                <CustomTooltip label={locale === 'en' ? 'Edit process info' : '공정 정보 수정'} placement="bottom" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              className="h-7 px-2 rounded-[7px] border text-[10px] font-semibold outline-none"
              style={{
                borderColor: 'rgba(255,255,255,0.16)',
                color: '#e5e7eb',
                background: 'rgba(255,255,255,0.08)',
              }}
              value={uiPreviewMode}
              onChange={(e) => {
                const next = e.target.value as 'light' | 'dark';
                setInternalUiPreviewMode(next);
                onUiPreviewModeChange?.(next);
              }}
              aria-label={locale === 'en' ? 'UI mode' : 'UI 모드'}
            >
              <option value="light">{locale === 'en' ? 'Light' : '라이트'}</option>
              <option value="dark">{locale === 'en' ? 'Dark' : '다크'}</option>
            </select>
            {([
              { id: 'comment', ko: '코멘트', en: 'Comment', iconIndex: HEADER_ACTION_ICON_INDEX.comment },
              { id: 'share', ko: '공유', en: 'Share', iconIndex: HEADER_ACTION_ICON_INDEX.share },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                className="group relative h-7 w-7 rounded-[7px] border inline-flex items-center justify-center"
                style={{
                  borderColor: 'rgba(255,255,255,0.16)',
                  color: '#e5e7eb',
                  background: 'rgba(255,255,255,0.08)',
                }}
                aria-label={locale === 'en' ? item.en : item.ko}
              >
                <SfdIconByIndex index={item.iconIndex} color="currentColor" size={12} />
                <CustomTooltip label={locale === 'en' ? item.en : item.ko} placement="bottom" />
              </button>
            ))}
            <button
              type="button"
              className="group relative h-8 px-3 rounded-[8px] border text-[10px] font-bold inline-flex items-center gap-1.5"
              style={{
                borderColor: 'rgba(255,196,64,0.55)',
                color: '#fff7ed',
                background: 'linear-gradient(135deg, rgba(255,170,84,0.98) 0%, rgba(255,142,43,0.98) 56%, rgba(235,115,21,0.98) 100%)',
                boxShadow: '0 8px 20px rgba(255,120,16,0.35), inset 0 1px 0 rgba(255,255,255,0.45)',
              }}
              aria-label={locale === 'en' ? 'Plan info' : '플랜 정보'}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
              <span className="leading-none">{locale === 'en' ? 'Plan Info' : '플랜 정보'}</span>
              <CustomTooltip label={locale === 'en' ? 'Premium trigger' : '유료 기능 안내'} placement="bottom" />
            </button>
            <button
              type="button"
              className="group relative h-7 w-7 rounded-[7px] border inline-flex items-center justify-center"
              style={{
                borderColor: 'rgba(255,255,255,0.16)',
                color: '#e5e7eb',
                background: 'rgba(255,255,255,0.08)',
              }}
              aria-label={locale === 'en' ? 'My Page' : '마이페이지'}
            >
              <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.mypage} color="currentColor" size={12} />
              <CustomTooltip label={locale === 'en' ? 'My Page' : '마이페이지'} placement="bottom" />
            </button>
            <button
              type="button"
              className="group relative h-7 w-7 rounded-[7px] border inline-flex items-center justify-center"
              style={{
                borderColor: 'rgba(255,255,255,0.16)',
                color: '#e5e7eb',
                background: 'rgba(255,255,255,0.08)',
              }}
              onClick={onToggleLocale}
              aria-label={locale === 'en' ? 'Switch language' : '언어 변경'}
            >
              <SfdIconByIndex index={HEADER_ACTION_ICON_INDEX.lang} color="currentColor" size={12} />
              <CustomTooltip label={locale === 'en' ? 'language' : '언어'} placement="bottom" />
            </button>
          </div>
        </div>
        <div
          className="h-8 flex items-center gap-3 rounded-[8px] px-2"
          style={{ background: isDarkPreview ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            {([
              { id: 'menu', index: HEADER_LEFT_ICON_INDEX.menu, active: true, ko: '메뉴', en: 'menu' },
              { id: 'undo', index: HEADER_LEFT_ICON_INDEX.undo, active: false, ko: '실행 취소', en: 'undo' },
              { id: 'redo', index: HEADER_LEFT_ICON_INDEX.redo, active: false, ko: '다시 실행', en: 'redo' },
            ] as const).map((item) => (
              <button
                key={item.id}
                type="button"
                className="group relative h-7 w-9 rounded-[7px] border transition-colors duration-150 inline-flex items-center justify-center"
                style={{
                  borderColor: item.active ? accentRgba(POINT_ORANGE, 0.42) : 'rgba(255,255,255,0.16)',
                  color: item.active ? POINT_ORANGE : '#e5e7eb',
                  background: item.active ? accentRgba(POINT_ORANGE, 0.18) : 'rgba(255,255,255,0.08)',
                }}
                title={locale === 'en' ? item.en : item.ko}
                aria-label={locale === 'en' ? item.en : item.ko}
              >
                <SfdIconByIndex
                  index={item.index}
                  color="currentColor"
                  size={12}
                  style={item.id === 'redo' ? { transform: 'scaleX(-1)', transformOrigin: 'center' } : undefined}
                />
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-0 flex justify-center">
            <div className="flex items-center gap-1">
            {headerViewButtons.map((label) => {
              const iconIndex = HEADER_VIEW_ICON_INDEX[label];
              const isActive = label === 'view';
              return (
                <button
                  key={label}
                  type="button"
                    className="group relative h-7 w-8 rounded-[7px] border transition-colors duration-150 inline-flex items-center justify-center"
                  style={{
                    borderColor: isActive ? accentRgba(POINT_ORANGE, 0.42) : 'rgba(255,255,255,0.16)',
                    color: isActive ? POINT_ORANGE : '#e5e7eb',
                    background: isActive
                      ? accentRgba(POINT_ORANGE, 0.18)
                      : 'rgba(255,255,255,0.08)',
                  }}
                  title={label}
                  aria-label={label}
                >
                  <SfdIconByIndex index={iconIndex} color="currentColor" size={12} />
                </button>
              );
            })}
            </div>
          </div>
          <button
            type="button"
            className="h-8 px-3 text-[11px] rounded-[8px] border font-semibold shrink-0"
            style={{
              borderColor: headerPrimaryActive ? accentRgba(POINT_ORANGE, 0.5) : 'rgba(255,255,255,0.16)',
              color: '#ffffff',
              background: isRiskMode ? '#f59e0b' : POINT_ORANGE,
            }}
          >
            {primaryHeaderActionLabel}
          </button>
        </div>
      </div>

      {/* Bottom area (timeline / analysis) */}
      <div
        className="fixed z-[28] rounded-[14px] overflow-hidden"
        style={{
          left: bottomOpen ? leftOffset : '50%',
          right: bottomOpen ? rightReserve : undefined,
          bottom: BOTTOM_GAP,
          height: bottomOpen ? bottomHeight : BOTTOM_HEIGHT_COLLAPSED,
          width: bottomOpen ? undefined : collapsedTimelineWidth,
          transform: bottomOpen ? undefined : 'translateX(-50%)',
          background: bottomOpen ? (isDarkPreview ? 'rgba(10,12,16,0.74)' : 'rgba(255,255,255,0.95)') : 'transparent',
          border: bottomOpen ? (isDarkPreview ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(0,0,0,0.12)') : 'none',
          boxShadow: bottomOpen ? (isDarkPreview ? '0 18px 44px rgba(0,0,0,0.35)' : '0 18px 44px rgba(0,0,0,0.16)') : 'none',
          backdropFilter: bottomOpen ? (isDarkPreview ? 'blur(26px) saturate(160%)' : 'blur(18px) saturate(150%)') : 'none',
          WebkitBackdropFilter: bottomOpen ? (isDarkPreview ? 'blur(26px) saturate(160%)' : 'blur(18px) saturate(150%)') : 'none',
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
              style={{ background: 'rgba(0,0,0,0.02)' }}
            >
              <GripHorizontal className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="h-[calc(100%-8px)]">
              {bottomTab === 'timeline' ? (
                timelineView === 'overview' ? renderTimelineOverview() : renderTimelineDetail()
              ) : (
                <div
                  className="h-full rounded-[10px] border p-3 text-[11px] leading-relaxed overflow-y-auto sfd-scroll"
                  style={{
                    borderColor: isDarkPreview ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)',
                    background: isDarkPreview ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.94)',
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
            background: isDarkPreview ? 'rgba(17,24,39,0.74)' : 'rgba(255,255,255,0.98)',
            border: isDarkPreview ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(15,23,42,0.12)',
            boxShadow: isDarkPreview ? '0 10px 22px rgba(0,0,0,0.34)' : '0 10px 22px rgba(15,23,42,0.16)',
            backdropFilter: isDarkPreview ? 'blur(22px) saturate(160%)' : 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(22px) saturate(160%)' : 'blur(14px) saturate(140%)',
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
      {bottomOpen && (
        <button
          type="button"
          className="group fixed z-[29] h-8 w-14 rounded-[10px] border transition-colors duration-150 inline-flex items-center justify-center"
          style={{
            left: '50%',
            top: `calc(100vh - ${BOTTOM_GAP + bottomHeight}px - 18px)`,
            transform: 'translate(-50%, -100%)',
            borderColor: isDarkPreview ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.14)',
            background: isDarkPreview ? 'rgba(17,24,39,0.74)' : 'rgba(255,255,255,0.98)',
            color: isDarkPreview ? '#e5e7eb' : '#334155',
            boxShadow: isDarkPreview ? '0 10px 22px rgba(0,0,0,0.34)' : '0 10px 22px rgba(15,23,42,0.16)',
            backdropFilter: isDarkPreview ? 'blur(22px) saturate(160%)' : 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: isDarkPreview ? 'blur(22px) saturate(160%)' : 'blur(14px) saturate(140%)',
          }}
          onClick={() => setBottomOpen(false)}
          aria-label={locale === 'en' ? 'Collapse timeline' : '타임라인 접기'}
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <CustomTooltip label={locale === 'en' ? 'Collapse timeline' : '타임라인 접기'} placement="top" />
        </button>
      )}
    </>
  );
}

