import {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';

/** 공정 객체 한도 (목업 — 추후 공정/플랜 데이터와 연동) */
const LIMITS = {
  robotsTotal: 10,
  userEquipment: 30,
  libraryEquipment: 240,
  equipmentTotal: 270,
  collabWorkspace: 30,
  /** 분석 요소 R/A/F 중 A% 분모: 협동작업공간 한도 + 기타 항목 가상 상한 합 */
  analysisTotal: 280,
} as const;

const STORAGE_KEY = 'sfd-scene-info-panel-pos';
const PANEL_MAX_W = 320;
/** 하단 타임라인·툴바 여유 */
const BOTTOM_RESERVE_PX = 100;
const H_MARGIN = 10;

export type SceneInfoCounts = {
  collabRobot: number;
  mobileRobot: number;
  industrialRobot: number;
  userUploadedEquipment: number;
  libraryEquipment: number;
  libraryEquipmentPedestal: number;
  collabWorkspace: number;
  gripper: number;
  collisionExpected: number;
  waypoint: number;
  pathPoint: number;
};

/** 목업: 링·표가 채워진 상태로 표시 (실데이터 연동 시 counts prop으로 덮어씀) */
const DEFAULT_COUNTS: SceneInfoCounts = {
  collabRobot: 2,
  mobileRobot: 1,
  industrialRobot: 1,
  userUploadedEquipment: 8,
  libraryEquipment: 78,
  libraryEquipmentPedestal: 8,
  collabWorkspace: 12,
  gripper: 6,
  collisionExpected: 4,
  waypoint: 40,
  pathPoint: 28,
};

function pct(used: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((used / max) * 100));
}

function clampPosition(
  left: number,
  top: number,
  panelW: number,
  panelH: number,
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minT = WORKSPACE_CONTENT_TOP_PX + H_MARGIN;
  const maxL = Math.max(H_MARGIN, vw - panelW - H_MARGIN);
  const maxT = Math.max(minT, vh - panelH - BOTTOM_RESERVE_PX);
  return {
    left: Math.min(maxL, Math.max(H_MARGIN, left)),
    top: Math.min(maxT, Math.max(minT, top)),
  };
}

/** 우측 상단 기본값 — 좌측 라이브러리·GNB와 겹침 최소화 */
function defaultPosition(panelW: number, panelH: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = vw - panelW - H_MARGIN;
  const top = WORKSPACE_CONTENT_TOP_PX + H_MARGIN;
  return clampPosition(left, top, panelW, panelH);
}

function loadStoredPosition(panelW: number, panelH: number): { left: number; top: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as { left?: unknown; top?: unknown };
    if (typeof p.left === 'number' && typeof p.top === 'number') {
      return clampPosition(p.left, p.top, panelW, panelH);
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** R / A / F 사용률 링 — 굵은 도넛, 퍼센트는 링 안쪽 중앙 */
function UsageRing({
  value,
  accent,
  track,
  label,
  centerColor,
  size = 52,
  strokeWidth: strokeW = 6,
}: {
  value: number;
  accent: string;
  track: string;
  label: string;
  /** 링 중앙 % 글자색 */
  centerColor: string;
  size?: number;
  strokeWidth?: number;
}) {
  const stroke = strokeW;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (Math.min(100, value) / 100) * circumference;
  const pctFont = size >= 50 ? 12 : 10;
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <svg width={size} height={size} className="shrink-0 drop-shadow-md" aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fill={centerColor}
          style={{
            fontSize: pctFont,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}%
        </text>
      </svg>
      <span
        className="max-w-[76px] text-center text-[8px] font-bold leading-[10px]"
        style={{ color: accent }}
      >
        {label}
      </span>
    </div>
  );
}

type Props = {
  theme: 'light' | 'dark';
  locale: 'ko' | 'en';
  /** 미전달 시 목업 0 */
  counts?: Partial<SceneInfoCounts>;
  /** 닫기 시 패널 숨김(헤더에서 다시 열기) */
  onClose?: () => void;
};

export function SceneInfoPanel({ theme, locale, counts: countsProp, onClose }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [dragging, setDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ left: 0, top: 0 });
  const dragRef = useRef<{ sx: number; sy: number; ol: number; ot: number } | null>(null);

  const panelW = Math.min(PANEL_MAX_W, typeof window !== 'undefined' ? window.innerWidth - 24 : PANEL_MAX_W);

  const [pos, setPos] = useState<{ left: number; top: number }>(() => {
    if (typeof window === 'undefined') return { left: 400, top: 140 };
    const w = Math.min(PANEL_MAX_W, window.innerWidth - 24);
    const estH = expanded ? 400 : 72;
    return loadStoredPosition(w, estH) ?? defaultPosition(w, estH);
  });

  const c = { ...DEFAULT_COUNTS, ...countsProp };

  const robotsUsed = c.collabRobot + c.mobileRobot + c.industrialRobot;
  const equipmentUsed = c.userUploadedEquipment + c.libraryEquipment + c.libraryEquipmentPedestal;
  const analysisUsed =
    c.collabWorkspace + c.gripper + c.collisionExpected + c.waypoint + c.pathPoint;

  const pR = pct(robotsUsed, LIMITS.robotsTotal);
  const pF = pct(equipmentUsed, LIMITS.equipmentTotal);
  const pA = pct(analysisUsed, LIMITS.analysisTotal);

  const tokens = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      panelBg: isDark ? 'rgba(10,12,16,0.88)' : 'rgba(255,255,255,0.92)',
      panelBorder: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.1)',
      ringGlow: isDark ? '0 0 24px rgba(0,0,0,0.35)' : '0 8px 32px rgba(15,23,42,0.08)',
      headerText: isDark ? '#f8fafc' : '#0f172a',
      muted: isDark ? 'rgba(248,250,252,0.55)' : 'rgba(15,23,42,0.5)',
      sectionBorder: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)',
      sectionBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.65)',
      divider: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.07)',
      chevronBtn: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)',
      dragHover: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
      trackRing: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)',
      accentRobot: POINT_ORANGE,
      accentAnalysis: isDark ? '#7dd3fc' : '#0284c7',
      accentFacility: isDark ? '#c4b5fd' : '#7c3aed',
    };
  }, [theme]);

  const L = useMemo(
    () =>
      locale === 'en'
        ? {
            titleSuffix: 'Object usage rate',
            ringRobot: 'Robots',
            ringAnalysis: 'Analysis elements',
            ringFacility: 'Equipment',
            robot: 'Robot',
            collabRobot: 'Collaborative robot',
            mobileRobot: 'Mobile robot',
            industrialRobot: 'Industrial robot',
            robotsTotal: 'Robots',
            equipment: 'Equipment',
            userUpload: 'User-uploaded equipment',
            libraryEq: 'Library equipment (+robot pedestal)',
            equipmentTotal: 'Equipment',
            analysisBlock: 'Analysis / workspace',
            collabSpace: 'Collaborative workspace',
            gripper: 'Gripper',
            collision: 'Expected collision area',
            waypoint: 'Waypoint',
            pathPoint: 'Path point',
            expand: 'Expand details',
            collapse: 'Collapse details',
            dragHint: 'Drag to move panel',
            closePanel: 'Close panel',
          }
        : {
            titleSuffix: '객체 사용률',
            ringRobot: '로봇',
            ringAnalysis: '분석 요소',
            ringFacility: '설비',
            robot: '로봇',
            collabRobot: '협동 로봇',
            mobileRobot: '이동 로봇',
            industrialRobot: '산업용 로봇',
            robotsTotal: '로봇',
            equipment: '설비',
            userUpload: '사용자 업로드 설비',
            libraryEq: '라이브러리 설비 (+로봇 받침대)',
            equipmentTotal: '설비',
            analysisBlock: '분석·작업공간',
            collabSpace: '협동작업공간',
            gripper: '그리퍼',
            collision: '충돌예상부위',
            waypoint: 'Waypoint',
            pathPoint: 'Path Point',
            expand: '세부 펼치기',
            collapse: '세부 접기',
            dragHint: '드래그하여 패널 이동',
            closePanel: '패널 닫기',
          },
    [locale],
  );

  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  const reclampToViewport = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos((p) => clampPosition(p.left, p.top, rect.width, rect.height));
  }, []);

  useLayoutEffect(() => {
    reclampToViewport();
  }, [expanded, reclampToViewport]);

  useEffect(() => {
    const onResize = () => reclampToViewport();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [reclampToViewport]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d || !panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const next = clampPosition(d.ol + (e.clientX - d.sx), d.ot + (e.clientY - d.sy), rect.width, rect.height);
      setPos(next);
    };
    const onUp = () => {
      dragRef.current = null;
      setDragging(false);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posRef.current));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging]);

  const onDragHandleDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('[data-scene-no-drag]')) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ol: posRef.current.left, ot: posRef.current.top };
    setDragging(true);
  }, []);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const row = (label: string, right: string, key: string) => (
    <div key={key} className="flex items-center justify-between gap-3 text-[12px] leading-[17px] py-1.5">
      <span className="min-w-0 pr-1" style={{ color: tokens.muted }}>
        {label}
      </span>
      <span className="tabular-nums font-semibold shrink-0" style={{ color: tokens.headerText }}>
        {right}
      </span>
    </div>
  );

  const totalChip = (accentHex: string, text: string) => (
    <span
      className="rounded-lg px-2 py-0.5 text-[9px] font-bold tabular-nums shrink-0"
      style={{
        background: accentRgba(accentHex, theme === 'dark' ? 0.22 : 0.14),
        color: tokens.headerText,
        boxShadow: theme === 'dark' ? '0 1px 0 rgba(255,255,255,0.06) inset' : '0 1px 0 rgba(255,255,255,0.9) inset',
      }}
    >
      {text}
    </span>
  );

  const section = (accent: string, title: string, body: ReactNode, headerEnd: ReactNode) => (
    <div
      className="rounded-[12px] border overflow-hidden flex flex-col shadow-sm"
      style={{
        borderColor: tokens.sectionBorder,
        background: tokens.sectionBg,
        boxShadow: theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : 'inset 0 1px 0 rgba(255,255,255,0.8)',
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 border-b"
        style={{
          borderColor: tokens.divider,
          background: accentRgba(accent, theme === 'dark' ? 0.12 : 0.08),
        }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-5 w-1 shrink-0 rounded-full" style={{ background: accent }} />
          <div className="truncate text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.headerText }}>
            {title}
          </div>
        </div>
        {headerEnd}
      </div>
      <div className="px-3 py-2.5 flex flex-col">{body}</div>
    </div>
  );

  const expandedScrollMaxH = `min(calc(100vh - ${WORKSPACE_CONTENT_TOP_PX + 128}px), 720px)`;

  return (
    <div
      ref={panelRef}
      className={`fixed z-[22] rounded-[14px] border shadow-lg backdrop-blur-xl select-none ${
        dragging ? 'cursor-grabbing' : ''
      }`}
      style={{
        left: pos.left,
        top: pos.top,
        width: panelW,
        maxWidth: `min(100vw - 24px, ${PANEL_MAX_W}px)`,
        borderColor: tokens.panelBorder,
        background: tokens.panelBg,
        boxShadow:
          theme === 'dark'
            ? `${tokens.ringGlow}, 0 0 0 1px rgba(255,255,255,0.06) inset`
            : `${tokens.ringGlow}, 0 0 0 1px rgba(255,255,255,0.85) inset`,
      }}
    >
      <div
        role="toolbar"
        aria-label={L.dragHint}
        className="flex items-stretch gap-0 border-b cursor-grab active:cursor-grabbing"
        style={{ borderColor: tokens.divider, background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.45)' }}
        onPointerDown={onDragHandleDown}
      >
        <div
          className="flex items-center justify-center px-1.5 shrink-0 transition-colors rounded-tl-[13px]"
          style={{ background: dragging ? tokens.dragHover : undefined }}
          title={L.dragHint}
        >
          <GripVertical className="w-4 h-4" style={{ color: tokens.muted }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 py-2 pr-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2 pr-1">
            <div className="min-w-0 flex-1">
              <h3 className="text-[12px] font-bold tracking-tight leading-[17px]" style={{ color: tokens.headerText }}>
                <span className="opacity-[0.88]">Scene Info</span>
                <span style={{ color: tokens.muted, fontWeight: 700 }}> : </span>
                <span>{L.titleSuffix}</span>
              </h3>
            </div>
            <div data-scene-no-drag className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={toggle}
                className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors duration-150"
                style={{
                  background: tokens.chevronBtn,
                  color: tokens.headerText,
                }}
                aria-expanded={expanded}
                aria-label={expanded ? L.collapse : L.expand}
              >
                {expanded ? <ChevronUp className="w-4 h-4" strokeWidth={2.2} /> : <ChevronDown className="w-4 h-4" strokeWidth={2.2} />}
              </button>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors duration-150 hover:opacity-90"
                  style={{
                    background: tokens.chevronBtn,
                    color: tokens.headerText,
                  }}
                  aria-label={L.closePanel}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={2.25} />
                </button>
              ) : null}
            </div>
          </div>
          <div className="flex items-end justify-around gap-0.5 px-0.5 pb-1">
            <UsageRing
              value={pR}
              accent={tokens.accentRobot}
              track={tokens.trackRing}
              label={L.ringRobot}
              centerColor={tokens.headerText}
              size={56}
              strokeWidth={6.5}
            />
            <UsageRing
              value={pA}
              accent={tokens.accentAnalysis}
              track={tokens.trackRing}
              label={L.ringAnalysis}
              centerColor={tokens.headerText}
              size={56}
              strokeWidth={6.5}
            />
            <UsageRing
              value={pF}
              accent={tokens.accentFacility}
              track={tokens.trackRing}
              label={L.ringFacility}
              centerColor={tokens.headerText}
              size={56}
              strokeWidth={6.5}
            />
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="px-3 py-3 flex flex-col gap-2.5 overflow-y-auto sfd-scroll"
          style={{ maxHeight: expandedScrollMaxH }}
        >
          {section(
            tokens.accentRobot,
            L.robot,
            <>
              {row(L.collabRobot, String(c.collabRobot), 'cr')}
              {row(L.mobileRobot, String(c.mobileRobot), 'mr')}
              {row(L.industrialRobot, String(c.industrialRobot), 'ir')}
            </>,
            totalChip(
              tokens.accentRobot,
              `${locale === 'en' ? 'Robots' : '로봇'} ${robotsUsed}/${LIMITS.robotsTotal}`,
            ),
          )}
          {section(
            tokens.accentFacility,
            L.equipment,
            <>
              {row(L.userUpload, `${c.userUploadedEquipment} / ${LIMITS.userEquipment}`, 'ue')}
              {row(
                L.libraryEq,
                `${c.libraryEquipment} (+${c.libraryEquipmentPedestal}) / ${LIMITS.libraryEquipment}`,
                'le',
              )}
            </>,
            totalChip(
              tokens.accentFacility,
              `${locale === 'en' ? 'Equipment' : '설비'} ${equipmentUsed}/${LIMITS.equipmentTotal}`,
            ),
          )}
          {section(
            tokens.accentAnalysis,
            L.analysisBlock,
            <>
              {row(L.collabSpace, `${c.collabWorkspace} / ${LIMITS.collabWorkspace}`, 'cw')}
              {row(L.gripper, String(c.gripper), 'g')}
              {row(L.collision, String(c.collisionExpected), 'col')}
              {row(L.waypoint, String(c.waypoint), 'wp')}
              {row(L.pathPoint, String(c.pathPoint), 'pp')}
            </>,
            totalChip(
              tokens.accentAnalysis,
              `${locale === 'en' ? 'Analysis' : '분석'} ${analysisUsed}/${LIMITS.analysisTotal}`,
            ),
          )}
        </div>
      )}
    </div>
  );
}
