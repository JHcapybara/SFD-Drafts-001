/**
 * 3D 워크스페이스 헤더 에딧 툴용 토글형 메뉴 — 레퍼런스(다크 셸·오렌지 선택·체크) 기반.
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight } from 'lucide-react';
import { POINT_ORANGE } from './pointColorSchemes';
import { SfdIconByIndex } from './sfd/SfdIconByIndex';

export const EDIT_MENU_SURFACE = '#2d2d2d';
const BORDER_OUT = 'rgba(255, 255, 255, 0.1)';
const SECTION = 'rgba(255, 255, 255, 0.42)';
const TEXT = '#f4f4f5';
const TEXT_MUTED = 'rgba(255, 255, 255, 0.55)';
const ROW_SELECTED_BG = 'rgba(255, 255, 255, 0.07)';
const DIVIDER = 'rgba(255, 255, 255, 0.08)';

const GRID_ICON_INDEX = 83;

export type CanvasBackgroundId = 'white' | 'blue' | 'brown' | 'black';
export type SnapModeId = 'vertex' | 'edge' | 'face';

export type HeaderEditToolPopover =
  | 'grid'
  | 'layout'
  | 'scale'
  | 'rotate'
  | 'ruler'
  | 'object snap'
  | 'snap'
  | 'view';

type Locale = 'ko' | 'en';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function sectionLabel(locale: Locale, key: 'gridSize' | 'bg'): string {
  if (locale === 'en') {
    return key === 'gridSize' ? '3D grid size' : 'Background color';
  }
  return key === 'gridSize' ? '3D 그리드 크기' : '배경색 설정';
}

function EditMenuDivider() {
  return <div className="h-px mx-2.5 my-0.5" style={{ background: DIVIDER }} />;
}

function EditMenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="px-2.5 pt-2 pb-0.5 text-[9px] font-semibold uppercase tracking-[0.05em]"
      style={{ color: SECTION }}
    >
      {children}
    </div>
  );
}

type SelectRowProps = {
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  shortcut?: string;
};

const SUB_HIGHLIGHT = 'rgba(255, 142, 43, 0.18)';

type ToggleRowProps = { checked: boolean; onToggle: () => void; label: string };

function EditMenuToggleRow({ checked, onToggle, label }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 rounded-lg mx-1 text-left text-[11px] font-medium transition-[background,color] duration-150"
      style={{
        color: checked ? TEXT : TEXT_MUTED,
        background: 'transparent',
      }}
    >
      <span
        className="w-3.5 h-3.5 shrink-0 rounded-[2px] border flex items-center justify-center"
        style={{
          borderColor: checked ? POINT_ORANGE : DIVIDER,
          background: checked ? `${POINT_ORANGE}22` : 'transparent',
          boxShadow: checked ? `0 0 0 1px ${POINT_ORANGE}55` : undefined,
        }}
        aria-hidden
      >
        {checked ? <Check className="w-2.5 h-2.5" strokeWidth={3} style={{ color: POINT_ORANGE }} /> : null}
      </span>
      <span className="flex-1 min-w-0 leading-snug">{label}</span>
    </button>
  );
}

function EditMenuSelectRow({ selected, onClick, icon, label, shortcut }: SelectRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg mx-1 text-left text-[11px] font-medium transition-[background,border,color] duration-150 min-h-0"
      style={{
        color: selected ? TEXT : TEXT_MUTED,
        background: selected ? ROW_SELECTED_BG : 'transparent',
        border: `1px solid ${selected ? POINT_ORANGE : 'transparent'}`,
        boxShadow: selected ? `0 0 0 1px ${POINT_ORANGE}40` : undefined,
      }}
    >
      {icon ? <span className="shrink-0 w-4 h-4 flex items-center justify-center">{icon}</span> : null}
      <span className="flex-1 min-w-0 leading-tight text-left">{label}</span>
      {shortcut ? (
        <span
          className="shrink-0 text-[9px] font-medium tabular-nums px-1 py-0.5 rounded"
          style={{ color: TEXT_MUTED, border: `1px solid ${DIVIDER}` }}
        >
          {shortcut}
        </span>
      ) : null}
      {selected ? (
        <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} style={{ color: POINT_ORANGE }} aria-hidden />
      ) : (
        <span className="w-3.5 h-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );
}

function ColorSwatch({ color, selected }: { color: string; selected: boolean }) {
  return (
    <span
      className="inline-block rounded shrink-0 border"
      style={{
        width: 14,
        height: 14,
        background: color,
        borderColor: selected ? POINT_ORANGE : 'rgba(255,255,255,0.35)',
        boxShadow: selected ? `0 0 0 1px ${POINT_ORANGE}` : undefined,
      }}
      aria-hidden
    />
  );
}

type PopoverFrameProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  width: number;
  ariaLabel: string;
  children: ReactNode;
};

function EditMenuPopoverFrame({ open, anchorRef, onClose, width, ariaLabel, children }: PopoverFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const left = clamp(r.left + r.width / 2 - width / 2, 8, maxLeft);
    const gap = 8;
    const maxH = Math.min(window.innerHeight * 0.72, 360);
    let top = r.bottom + gap;
    if (top + maxH > window.innerHeight - gap) {
      const aboveTop = r.top - gap - maxH;
      if (aboveTop >= gap) top = aboveTop;
    }
    setPos({ top, left });
  }, [anchorRef, width]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[96] pointer-events-none" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-label={ariaLabel}
        className="fixed z-[100] rounded-xl overflow-hidden pointer-events-auto flex flex-col max-h-[min(72vh,360px)]"
        style={{
          top: pos.top,
          left: pos.left,
          width,
          maxWidth: 'calc(100vw - 16px)',
          background: EDIT_MENU_SURFACE,
          border: `1px solid ${BORDER_OUT}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain sfd-scroll py-1.5 flex flex-col">
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

type ViewSubKey = 'safety' | 'design' | 'layout';

type ViewModeEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  onClose: () => void;
};

function viewModeCopy(locale: Locale) {
  if (locale === 'en') {
    return {
      title: 'View mode',
      safety: 'Safety analysis',
      design: 'Design',
      layout: 'Layout',
      safetyItems: [
        { id: 'collision', label: 'Collision Point' },
        { id: 'collisionDir', label: 'Direction of Collision Point' },
        { id: 'reachable', label: 'Reachable space' },
        { id: 'cowork', label: 'Co-workspace' },
        { id: 'waypoint', label: 'Waypoint' },
        { id: 'pathPt', label: 'Path point' },
        { id: 'robotCri', label: 'Robot CRI' },
      ] as const,
      designItems: [
        { id: 'robot', label: 'Robot' },
        { id: 'mobileRobot', label: 'Mobile Robot' },
        { id: 'gripper', label: 'Gripper' },
        { id: 'robotStand', label: 'Robot stand' },
        { id: 'conveyor', label: 'Conveyor belt' },
        { id: 'people', label: 'People' },
        { id: 'production', label: 'Production equipment' },
        { id: 'safetyEq', label: 'Safety equipment' },
        { id: 'profile', label: 'Profile' },
        { id: 'interior', label: 'Interior' },
        { id: 'accessory', label: 'Robot accessory' },
        { id: 'button', label: 'Button' },
        { id: 'box', label: 'Box' },
        { id: 'palette', label: 'Palette' },
        { id: 'fence', label: 'Fence' },
        { id: 'etc', label: 'Etc' },
      ] as const,
      layoutItems: [
        { id: 'grid', label: 'Grid' },
        { id: 'layout2d', label: '2D layout image' },
      ] as const,
    };
  }
  return {
    title: '뷰 모드',
    safety: '안전 분석',
    design: '디자인',
    layout: '레이아웃',
    safetyItems: [
      { id: 'collision', label: '충돌 지점' },
      { id: 'collisionDir', label: '충돌 지점 방향' },
      { id: 'reachable', label: '도달 가능 공간' },
      { id: 'cowork', label: '협업 작업 공간' },
      { id: 'waypoint', label: '웨이포인트' },
      { id: 'pathPt', label: '경로 포인트' },
      { id: 'robotCri', label: '로봇 CRI' },
    ] as const,
    designItems: [
      { id: 'robot', label: '로봇' },
      { id: 'mobileRobot', label: '모바일 로봇' },
      { id: 'gripper', label: '그리퍼' },
      { id: 'robotStand', label: '로봇 스탠드' },
      { id: 'conveyor', label: '컨베이어' },
      { id: 'people', label: '사람' },
      { id: 'production', label: '생산 설비' },
      { id: 'safetyEq', label: '안전 설비' },
      { id: 'profile', label: '프로파일' },
      { id: 'interior', label: '인테리어' },
      { id: 'accessory', label: '로봇 액세서리' },
      { id: 'button', label: '버튼' },
      { id: 'box', label: '박스' },
      { id: 'palette', label: '팔레트' },
      { id: 'fence', label: '펜스' },
      { id: 'etc', label: '기타' },
    ] as const,
    layoutItems: [
      { id: 'grid', label: '그리드' },
      { id: 'layout2d', label: '2D 레이아웃 이미지' },
    ] as const,
  };
}

const VIEW_SAFETY_DEFAULTS: Record<string, boolean> = {
  collision: true,
  collisionDir: true,
  reachable: false,
  cowork: true,
  waypoint: true,
  pathPt: true,
  robotCri: false,
};

const VIEW_DESIGN_DEFAULTS: Record<string, boolean> = {
  robot: true,
  mobileRobot: false,
  gripper: true,
  robotStand: false,
  conveyor: false,
  people: false,
  production: false,
  safetyEq: false,
  profile: false,
  interior: false,
  accessory: false,
  button: false,
  box: false,
  palette: false,
  fence: false,
  etc: true,
};

const VIEW_LAYOUT_DEFAULTS: Record<string, boolean> = {
  grid: true,
  layout2d: false,
};

const VIEW_MODE_L1_W = 156;
const VIEW_MODE_L2_W = 188;
/** L2가 열려도 1뎁스 좌표가 흔들리지 않도록, 배치 시 항상 L1+L2 폭을 확보해 클램프 */
const VIEW_MODE_FULL_W = VIEW_MODE_L1_W + VIEW_MODE_L2_W;

export function ViewModeEditMenuPopover({ open, anchorRef, locale, onClose }: ViewModeEditMenuPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [activeSub, setActiveSub] = useState<ViewSubKey | null>(null);
  const [safety, setSafety] = useState(VIEW_SAFETY_DEFAULTS);
  const [design, setDesign] = useState(VIEW_DESIGN_DEFAULTS);
  const [layout, setLayout] = useState(VIEW_LAYOUT_DEFAULTS);

  const L = viewModeCopy(locale);
  const panelOuterW = activeSub ? VIEW_MODE_FULL_W : VIEW_MODE_L1_W;

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const gap = 8;
    const maxH = Math.min(window.innerHeight * 0.72, 336);
    let top = r.bottom + gap;
    if (top + maxH > window.innerHeight - gap) {
      const aboveTop = r.top - gap - maxH;
      if (aboveTop >= gap) top = aboveTop;
    }
    // 앵커 중심에 L1 정렬; L2는 항상 L1 오른쪽 — 전체 폭이 들어가도록 좌측 클램프(상한은 음수 방지)
    let left = r.left + r.width / 2 - VIEW_MODE_L1_W / 2;
    const maxLeft = Math.max(8, window.innerWidth - VIEW_MODE_FULL_W - 8);
    left = clamp(left, 8, maxLeft);
    setPos({ top, left });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    setActiveSub(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  const toggleMap = (map: Record<string, boolean>, setMap: (v: Record<string, boolean>) => void, id: string) => {
    setMap({ ...map, [id]: !map[id] });
  };

  const subTitle =
    activeSub === 'safety' ? L.safety : activeSub === 'design' ? L.design : activeSub === 'layout' ? L.layout : '';

  if (!open) return null;

  const l1Keys: { key: ViewSubKey; label: string }[] = [
    { key: 'safety', label: L.safety },
    { key: 'design', label: L.design },
    { key: 'layout', label: L.layout },
  ];

  return createPortal(
    <>
      <div className="fixed inset-0 z-[96] pointer-events-none" aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-label={L.title}
        className="fixed z-[100] rounded-xl pointer-events-auto flex max-h-[min(72vh,336px)] overflow-y-auto overscroll-contain sfd-scroll"
        style={{
          top: pos.top,
          left: pos.left,
          width: panelOuterW,
          background: EDIT_MENU_SURFACE,
          border: `1px solid ${BORDER_OUT}`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
        }}
      >
        <div className="shrink-0 py-1.5 flex flex-col" style={{ width: VIEW_MODE_L1_W }}>
          <div className="px-2 pt-0.5 pb-1 text-[11px] font-bold leading-tight" style={{ color: TEXT }}>
            {L.title}
          </div>
          <div className="flex flex-col gap-px px-0.5">
            {l1Keys.map(({ key, label }) => {
              const on = activeSub === key;
              return (
                <button
                  key={key}
                  type="button"
                  className="w-full flex items-center justify-between gap-1 pl-2 pr-1 py-1.5 rounded-lg text-left text-[11px] font-medium transition-colors duration-150"
                  style={{
                    color: TEXT,
                    background: on ? SUB_HIGHLIGHT : 'transparent',
                  }}
                  onMouseEnter={() => setActiveSub(key)}
                  onFocus={() => setActiveSub(key)}
                  onClick={() => setActiveSub((s) => (s === key ? null : key))}
                >
                  <span className="min-w-0 truncate" title={label}>
                    {label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: on ? POINT_ORANGE : TEXT_MUTED }} aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
        {activeSub ? (
          <div
            className="flex flex-col shrink-0 py-1.5 border-l"
            style={{ width: VIEW_MODE_L2_W, borderColor: DIVIDER }}
          >
            <div className="px-2 pt-0.5 pb-1 text-[11px] font-bold leading-tight truncate" style={{ color: TEXT }} title={subTitle}>
              {subTitle}
            </div>
            <div className="flex flex-col gap-px pb-0.5 px-0.5">
              {activeSub === 'safety' &&
                L.safetyItems.map((row) => (
                  <EditMenuToggleRow
                    key={row.id}
                    label={row.label}
                    checked={!!safety[row.id]}
                    onToggle={() => toggleMap(safety, setSafety, row.id)}
                  />
                ))}
              {activeSub === 'design' &&
                L.designItems.map((row) => (
                  <EditMenuToggleRow
                    key={row.id}
                    label={row.label}
                    checked={!!design[row.id]}
                    onToggle={() => toggleMap(design, setDesign, row.id)}
                  />
                ))}
              {activeSub === 'layout' &&
                L.layoutItems.map((row) => (
                  <EditMenuToggleRow
                    key={row.id}
                    label={row.label}
                    checked={!!layout[row.id]}
                    onToggle={() => toggleMap(layout, setLayout, row.id)}
                  />
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </>,
    document.body,
  );
}

const BG_OPTIONS: { id: CanvasBackgroundId; hex: string; ko: string; en: string }[] = [
  { id: 'white', hex: '#f5f5f5', ko: '흰색', en: 'White' },
  { id: 'blue', hex: '#1e3a5f', ko: '파랑색', en: 'Blue' },
  { id: 'brown', hex: '#8b6914', ko: '갈색', en: 'Brown' },
  { id: 'black', hex: '#171717', ko: '검정색', en: 'Black' },
];

const GRID_MM = [50, 100, 200] as const;

type GridCanvasEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  gridMm: number;
  onGridMmChange: (mm: number) => void;
  canvasBg: CanvasBackgroundId;
  onCanvasBgChange: (id: CanvasBackgroundId) => void;
  onClose: () => void;
};

export function GridCanvasEditMenuPopover({
  open,
  anchorRef,
  locale,
  gridMm,
  onGridMmChange,
  canvasBg,
  onCanvasBgChange,
  onClose,
}: GridCanvasEditMenuPopoverProps) {
  const aria = locale === 'en' ? 'Grid and canvas settings' : '그리드·캔버스 설정';
  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={248} ariaLabel={aria}>
      <EditMenuSectionLabel>{sectionLabel(locale, 'gridSize')}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5">
        {GRID_MM.map((mm) => {
          const selected = gridMm === mm;
          return (
            <EditMenuSelectRow
              key={mm}
              selected={selected}
              onClick={() => onGridMmChange(mm)}
              label={`${mm}mm`}
              icon={
                <SfdIconByIndex
                  index={GRID_ICON_INDEX}
                  color={selected ? POINT_ORANGE : TEXT_MUTED}
                  size={14}
                />
              }
            />
          );
        })}
      </div>
      <EditMenuDivider />
      <EditMenuSectionLabel>{sectionLabel(locale, 'bg')}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5">
        {BG_OPTIONS.map((opt) => {
          const selected = canvasBg === opt.id;
          return (
            <EditMenuSelectRow
              key={opt.id}
              selected={selected}
              onClick={() => onCanvasBgChange(opt.id)}
              label={locale === 'en' ? opt.en : opt.ko}
              icon={<ColorSwatch color={opt.hex} selected={selected} />}
            />
          );
        })}
      </div>
    </EditMenuPopoverFrame>
  );
}

type ScaleEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  uniformScaleActive: boolean;
  onUniformScaleActiveChange: (v: boolean) => void;
  onClose: () => void;
};

export function ScaleEditMenuPopover({
  open,
  anchorRef,
  locale,
  uniformScaleActive,
  onUniformScaleActiveChange,
  onClose,
}: ScaleEditMenuPopoverProps) {
  const title = locale === 'en' ? 'Scale' : '스케일';
  const aria = locale === 'en' ? 'Scale mode' : '스케일 모드';
  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={252} ariaLabel={aria}>
      <EditMenuSectionLabel>{locale === 'en' ? 'Object transform' : '객체 변형'}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5 px-0.5">
        <EditMenuSelectRow
          selected={uniformScaleActive}
          onClick={() => onUniformScaleActiveChange(!uniformScaleActive)}
          label={locale === 'en' ? 'Uniform XYZ scale mode' : '균일 XYZ 스케일 모드'}
          shortcut="S"
        />
      </div>
      <p className="px-2.5 pb-1.5 text-[10px] leading-snug" style={{ color: TEXT_MUTED }}>
        {locale === 'en'
          ? 'When enabled, the pivot controller scales object X/Y/Z together by the same ratio.'
          : '활성화하면 객체 피봇 컨트롤러에서 X/Y/Z가 동일 비율로 함께 스케일됩니다.'}
      </p>
    </EditMenuPopoverFrame>
  );
}

type RotatePivotEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  pivotEditActive: boolean;
  onPivotEditActiveChange: (v: boolean) => void;
  onClose: () => void;
};

/** 헤더 rotate 툴 — 회전점(피봇) 설정 안내·토글 (스케일 팝오버와 동일 프레임) */
export function RotatePivotEditMenuPopover({
  open,
  anchorRef,
  locale,
  pivotEditActive,
  onPivotEditActiveChange,
  onClose,
}: RotatePivotEditMenuPopoverProps) {
  const aria = locale === 'en' ? 'Rotation pivot settings' : '회전점 설정';
  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={250} ariaLabel={aria}>
      <EditMenuSectionLabel>{locale === 'en' ? 'Object transform' : '객체 변형'}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5 px-0.5">
        <EditMenuSelectRow
          selected={pivotEditActive}
          onClick={() => onPivotEditActiveChange(!pivotEditActive)}
          label={locale === 'en' ? 'Custom rotation pivot mode' : '회전점(피봇) 편집 모드'}
          shortcut="R"
        />
      </div>
      <p className="px-2.5 pb-1.5 text-[10px] leading-snug" style={{ color: TEXT_MUTED }}>
        {locale === 'en'
          ? 'When enabled, you can place or move the pivot that object rotations use — e.g. drag the pivot gizmo in the viewport.'
          : '활성화하면 뷰포트에서 회전 기준점(피봇)을 배치·이동할 수 있습니다. 피봇 컨트롤러로 회전 중심을 바꿉니다.'}
      </p>
    </EditMenuPopoverFrame>
  );
}

type LayoutAlignEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  onClose: () => void;
};

type AlignPositionKey = 'x' | 'y' | 'z' | 'origin';
type AlignDirectionKey = 'origin' | 'x' | 'y' | 'z';

export function LayoutAlignEditMenuPopover({
  open,
  anchorRef,
  locale,
  onClose,
}: LayoutAlignEditMenuPopoverProps) {
  const [overallAll, setOverallAll] = useState(true);
  const [position, setPosition] = useState<AlignPositionKey>('origin');
  const [direction, setDirection] = useState<AlignDirectionKey>('origin');
  const aria = locale === 'en' ? 'Object align' : '객체 정렬';
  const title = locale === 'en' ? 'Align' : '정렬';
  const refLabel = locale === 'en' ? 'Reference object' : 'Reference object';
  const overallLabel = locale === 'en' ? 'Overall' : 'Overall';
  const positionLabel = locale === 'en' ? 'Position' : 'Position';
  const directionLabel = locale === 'en' ? 'Direction' : 'Direction';

  const optionBtn = (selected: boolean): CSSProperties => ({
    minHeight: 26,
    border: `1px solid ${selected ? POINT_ORANGE : 'rgba(255,255,255,0.38)'}`,
    background: selected ? `${POINT_ORANGE}1e` : 'rgba(0,0,0,0.22)',
    color: selected ? '#fed7aa' : TEXT,
    fontSize: 11,
    fontWeight: 600,
    lineHeight: '14px',
  });

  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={276} ariaLabel={aria}>
      <div className="px-2.5 py-1.5 border-b flex items-center justify-between" style={{ borderColor: DIVIDER }}>
        <span className="text-[12px] font-bold tracking-tight" style={{ color: TEXT }}>
          {title}
        </span>
        <button
          type="button"
          className="w-5 h-5 rounded flex items-center justify-center text-[12px] font-bold"
          style={{ color: TEXT }}
          onClick={onClose}
          aria-label={locale === 'en' ? 'Close align panel' : '정렬 패널 닫기'}
        >
          X
        </button>
      </div>

      <div className="px-2.5 py-2.5 flex flex-col gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold" style={{ color: TEXT }}>
            {refLabel} : -
          </p>
        </div>

        <div className="grid grid-cols-[58px_1fr] items-center gap-2">
          <span className="text-[11px] font-semibold" style={{ color: TEXT }}>
            {overallLabel}:
          </span>
          <button
            type="button"
            className="rounded-sm"
            style={optionBtn(overallAll)}
            onClick={() => setOverallAll((v) => !v)}
          >
            ALL
          </button>
        </div>

        <div className="grid grid-cols-[58px_1fr] items-center gap-2">
          <span className="text-[11px] font-semibold" style={{ color: TEXT }}>
            {positionLabel}:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {([
              ['x', 'X'],
              ['y', 'Y'],
              ['z', 'Z'],
              ['origin', 'Origin'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="rounded-sm"
                style={optionBtn(position === id)}
                onClick={() => setPosition(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[58px_1fr] items-center gap-2">
          <span className="text-[11px] font-semibold" style={{ color: TEXT }}>
            {directionLabel}:
          </span>
          <div className="grid grid-cols-4 gap-2">
            {([
              ['origin', 'Origin'],
              ['x', 'X'],
              ['y', 'Y'],
              ['z', 'Z'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className="rounded-sm"
                style={optionBtn(direction === id)}
                onClick={() => setDirection(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </EditMenuPopoverFrame>
  );
}

type RulerEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  measureActive: boolean;
  onMeasureActiveChange: (v: boolean) => void;
  onClose: () => void;
};

export function RulerEditMenuPopover({
  open,
  anchorRef,
  locale,
  measureActive,
  onMeasureActiveChange,
  onClose,
}: RulerEditMenuPopoverProps) {
  const aria = locale === 'en' ? 'Distance calculation' : '거리 계산';
  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={252} ariaLabel={aria}>
      <EditMenuSectionLabel>{locale === 'en' ? 'Measure' : '측정'}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5 px-0.5">
        <EditMenuSelectRow
          selected={measureActive}
          onClick={() => onMeasureActiveChange(!measureActive)}
          label={locale === 'en' ? 'Distance measure mode' : '거리 측정 모드'}
          shortcut="D"
        />
      </div>
      <p className="px-2.5 pb-1.5 text-[10px] leading-snug" style={{ color: TEXT_MUTED }}>
        {locale === 'en'
          ? 'Toggle to pick two points on the canvas. Shortcut (D) can be wired later.'
          : '캔버스에서 두 점을 선택해 거리를 확인합니다. 단축키 D는 이후 연동 가능합니다.'}
      </p>
    </EditMenuPopoverFrame>
  );
}

type SnapSettingsEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  moveMm: number;
  onMoveMmChange: (n: number) => void;
  rotateDeg: number;
  onRotateDegChange: (n: number) => void;
  onReset: () => void;
  onClose: () => void;
};

const SNAP_ROWS: { id: SnapModeId; ko: string; en: string; shortcut: string }[] = [
  { id: 'vertex', ko: '버텍스 스냅', en: 'Vertex snap', shortcut: 'Shift + 1' },
  { id: 'edge', ko: '엣지 스냅', en: 'Edge snap', shortcut: 'Shift + 2' },
  { id: 'face', ko: '면 스냅', en: 'Face snap', shortcut: 'Shift + 3' },
];

export function SnapSettingsEditMenuPopover({
  open,
  anchorRef,
  locale,
  moveMm,
  onMoveMmChange,
  rotateDeg,
  onRotateDegChange,
  onReset,
  onClose,
}: SnapSettingsEditMenuPopoverProps) {
  const title = locale === 'en' ? 'Snap settings' : '스냅 설정';
  const inputStyle: CSSProperties = {
    width: 64,
    background: 'rgba(0,0,0,0.35)',
    border: `1px solid ${DIVIDER}`,
    color: TEXT,
    borderRadius: 4,
    padding: '3px 6px',
    fontSize: 11,
    textAlign: 'right' as const,
  };

  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={264} ariaLabel={title}>
      <div className="flex items-center justify-between px-2.5 pt-0.5 pb-1.5 gap-2">
        <span className="text-[11px] font-bold" style={{ color: TEXT }}>
          {title}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors"
          style={{ color: TEXT, border: `1px solid ${DIVIDER}` }}
        >
          {locale === 'en' ? 'Reset' : '초기화'}
        </button>
      </div>
      <EditMenuDivider />
      <div className="px-2.5 py-1.5 flex flex-col gap-1.5">
        <label className="flex items-center justify-between gap-2 text-[11px]">
          <span style={{ color: TEXT_MUTED }}>{locale === 'en' ? 'Move distance (mm)' : '이동 거리 (mm)'}</span>
          <input
            type="number"
            value={moveMm}
            min={0}
            onChange={(e) => onMoveMmChange(Number(e.target.value) || 0)}
            style={inputStyle}
          />
        </label>
        <label className="flex items-center justify-between gap-2 text-[11px]">
          <span style={{ color: TEXT_MUTED }}>{locale === 'en' ? 'Rotation (°)' : '회전 각도 (°)'}</span>
          <input
            type="number"
            value={rotateDeg}
            onChange={(e) => onRotateDegChange(Number(e.target.value) || 0)}
            style={inputStyle}
          />
        </label>
      </div>
    </EditMenuPopoverFrame>
  );
}

type ObjectSnapEditMenuPopoverProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  locale: Locale;
  mode: SnapModeId;
  onModeChange: (m: SnapModeId) => void;
  onClose: () => void;
};

export function ObjectSnapEditMenuPopover({
  open,
  anchorRef,
  locale,
  mode,
  onModeChange,
  onClose,
}: ObjectSnapEditMenuPopoverProps) {
  const aria = locale === 'en' ? 'Object snap' : '오브젝트 스냅';
  return (
    <EditMenuPopoverFrame open={open} anchorRef={anchorRef} onClose={onClose} width={268} ariaLabel={aria}>
      <EditMenuSectionLabel>{aria}</EditMenuSectionLabel>
      <div className="flex flex-col gap-px pb-0.5">
        {SNAP_ROWS.map((row) => (
          <EditMenuSelectRow
            key={row.id}
            selected={mode === row.id}
            onClick={() => onModeChange(row.id)}
            label={locale === 'en' ? row.en : row.ko}
            shortcut={row.shortcut}
          />
        ))}
      </div>
    </EditMenuPopoverFrame>
  );
}
