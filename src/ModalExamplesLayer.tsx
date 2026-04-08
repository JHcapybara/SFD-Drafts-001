import { createPortal } from 'react-dom';
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronDown, GripVertical, X } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { DARK, LIGHT, type Tokens } from './PropertyPanel';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';
import {
  MODAL_EXAMPLE_L_MAX_BODY_VH,
  MODAL_WIDTH_LG_PX,
  MODAL_WIDTH_MD_PX,
  MODAL_WIDTH_SM_PX,
} from './modalSizeTokens';

type Locale = 'ko' | 'en';

type DraggableModalProps = {
  title: string;
  widthPx: number;
  initialLeft: number;
  initialTop: number;
  t: Tokens;
  isDark: boolean;
  onClose: () => void;
  children: ReactNode;
  maxBodyHeight?: string;
};

function DraggableExampleModal({
  title,
  widthPx,
  initialLeft,
  initialTop,
  t,
  isDark,
  onClose,
  children,
  maxBodyHeight,
}: DraggableModalProps) {
  const [pos, setPos] = useState({ left: initialLeft, top: initialTop });
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragRef.current = {
      x: e.clientX - pos.left,
      y: e.clientY - pos.top,
    };
  }, [pos.left, pos.top]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = e.clientX - d.x;
      let top = e.clientY - d.y;
      left = Math.max(margin, Math.min(left, vw - widthPx - margin));
      top = Math.max(WORKSPACE_CONTENT_TOP_PX + margin, Math.min(top, vh - margin - 48));
      setPos((p) => (p.left === left && p.top === top ? p : { left, top }));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [widthPx]);

  return (
    <div
      className="fixed z-[61] flex flex-col rounded-[14px] overflow-hidden shadow-2xl border box-border"
      style={{
        left: pos.left,
        top: pos.top,
        width: widthPx,
        maxWidth: `min(${widthPx}px, calc(100vw - 16px))`,
        background: t.panelBg,
        borderColor: t.panelBorder,
        boxShadow: t.panelShadow,
        backdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: isDark ? 'blur(28px) saturate(165%)' : 'blur(24px) saturate(180%)',
      }}
      role="dialog"
      aria-label={title}
    >
      <div
        className="shrink-0 flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing select-none border-b"
        style={{ borderColor: t.divider, background: t.sectionHeaderBg }}
        onPointerDown={onPointerDown}
      >
        <GripVertical className="w-4 h-4 shrink-0" style={{ color: t.dragHandleColor }} strokeWidth={2} aria-hidden />
        <span className="flex-1 min-w-0 text-[12px] font-semibold truncate" style={{ color: t.textPrimary }}>
          {title}
        </span>
        <button
          type="button"
          className="shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center transition-colors"
          style={{ background: t.closeButtonBg, color: t.textSecondary }}
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.2} />
        </button>
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-3 py-3 text-[11px] leading-[18px]"
        style={{
          color: t.textSecondary,
          maxHeight: maxBodyHeight,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ExampleSelect({
  t,
  label,
  id,
  defaultValue,
  options,
}: {
  t: Tokens;
  label: string;
  id: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = options.find((o) => o.value === value) ?? options[0];

  const updateMenuPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuPos({ top: r.bottom + 4, left: r.left, width: r.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updateMenuPosition();
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => updateMenuPosition();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open, updateMenuPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          className="fixed z-[100] max-h-[min(220px,40vh)] overflow-y-auto sfd-scroll rounded-[8px] border py-1 shadow-xl"
          style={{
            top: menuPos.top,
            left: menuPos.left,
            width: Math.max(menuPos.width, 120),
            borderColor: t.inputBorder,
            background: t.panelBg,
            boxShadow: t.panelShadow,
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          {options.map((o) => {
            const isSel = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={isSel}
                className="w-full px-2.5 py-2 text-left text-[11px] font-medium transition-colors duration-150"
                style={{
                  color: isSel ? POINT_ORANGE : t.textPrimary,
                  background: isSel ? accentRgba(POINT_ORANGE, 0.14) : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSel) e.currentTarget.style.background = t.sectionHeaderHover;
                }}
                onMouseLeave={(e) => {
                  if (!isSel) e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => {
                  setValue(o.value);
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="flex flex-col gap-1">
      <span
        id={`${id}-label`}
        className="text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: t.textPrimary }}
      >
        {label}
      </span>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="w-full rounded-[8px] border px-2 py-1.5 text-[11px] outline-none cursor-pointer inline-flex items-center justify-between gap-2 text-left transition-[box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-orange-400/45"
        style={{
          borderColor: open ? t.inputFocusBorder : t.inputBorder,
          backgroundColor: t.inputBg,
          color: t.textPrimary,
          boxShadow: open ? t.inputFocusShadow : 'none',
        }}
        aria-labelledby={`${id}-label`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDown
          className="w-3.5 h-3.5 shrink-0 opacity-75 transition-transform duration-200"
          strokeWidth={2.2}
          aria-hidden
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>
      {menu}
    </div>
  );
}

function ExampleSparkline({ t, accent }: { t: Tokens; accent: string }) {
  const w = 120;
  const h = 44;
  const pad = 6;
  const pts = [0.22, 0.5, 0.38, 0.72, 0.48, 0.84, 0.58, 0.68];
  const step = (w - pad * 2) / (pts.length - 1);
  const d = pts
    .map((py, i) => {
      const x = pad + i * step;
      const y = pad + (1 - py) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const gridY = [0.25, 0.5, 0.75].map((gy) => pad + (1 - gy) * (h - pad * 2));
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block max-w-[120px]" aria-hidden>
      <rect x={0} y={0} width={w} height={h} rx={8} fill={t.tabBarBg} stroke={t.inputBorder} />
      {gridY.map((gy) => (
        <line key={gy} x1={pad} y1={gy} x2={w - pad} y2={gy} stroke={t.divider} strokeWidth={0.75} opacity={0.6} />
      ))}
      <path d={d} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExampleBarChart({
  t,
  accent,
  title,
  axisDays,
}: {
  t: Tokens;
  accent: string;
  title: string;
  axisDays: string;
}) {
  const w = 260;
  const h = 96;
  const pad = { l: 28, r: 8, t: 10, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const vals = [32, 48, 28, 56, 44, 62];
  const max = Math.max(...vals);
  const n = vals.length;
  const slotW = innerW / n;
  const bw = slotW * 0.62;
  return (
    <figure className="space-y-1.5">
      <figcaption className="text-[10px] font-semibold" style={{ color: t.textPrimary }}>
        {title}
      </figcaption>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block" role="img" aria-label={title}>
        <rect x={0} y={0} width={w} height={h} rx={10} fill={t.tabBarBg} stroke={t.inputBorder} />
        {vals.map((v, i) => {
          const bh = (v / max) * innerH;
          const x = pad.l + i * slotW + (slotW - bw) / 2;
          const y = pad.t + innerH - bh;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={bw}
              height={Math.max(bh, 2)}
              rx={3}
              fill={accentRgba(accent, 0.75)}
            />
          );
        })}
        <text x={pad.l} y={h - 6} fill={t.textSecondary} fontSize="9">
          {axisDays}
        </text>
      </svg>
    </figure>
  );
}

function ExampleLineChart({
  t,
  accent,
  title,
  foot,
}: {
  t: Tokens;
  accent: string;
  title: string;
  foot: string;
}) {
  const w = 300;
  const h = 110;
  const pad = { l: 36, r: 12, t: 14, b: 24 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const series = [12, 18, 15, 22, 19, 28, 24, 31];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const span = max - min || 1;
  const step = iw / (series.length - 1);
  const pts = series.map((v, i) => {
    const x = pad.l + i * step;
    const y = pad.t + ih - ((v - min) / span) * ih;
    return { x, y };
  });
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${d} L ${pts[pts.length - 1].x} ${pad.t + ih} L ${pts[0].x} ${pad.t + ih} Z`;
  return (
    <figure className="space-y-1.5 min-w-0">
      <figcaption className="text-[10px] font-semibold" style={{ color: t.textPrimary }}>
        {title}
      </figcaption>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="block max-w-full" role="img" aria-label={title}>
        <rect x={0} y={0} width={w} height={h} rx={10} fill={t.tabBarBg} stroke={t.inputBorder} />
        <path d={areaD} fill={accentRgba(accent, 0.12)} />
        <path d={d} fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={accent} />
        ))}
        <text x={pad.l} y={h - 6} fill={t.textSecondary} fontSize="9">
          {foot}
        </text>
      </svg>
    </figure>
  );
}

function ExampleImagePlate({
  t,
  accent,
  caption,
  compact,
}: {
  t: Tokens;
  accent: string;
  caption: string;
  compact?: boolean;
}) {
  const gid = useId();
  const h = compact ? 72 : 112;
  return (
    <figure className="space-y-1">
      <div
        className="rounded-[10px] border overflow-hidden"
        style={{ borderColor: t.inputBorder, background: t.inputReadonlyBg }}
      >
        <svg viewBox={`0 0 240 ${h}`} className="w-full h-auto block" role="img" aria-label={caption}>
          <defs>
            <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <rect width="240" height={h} fill={`url(#${gid}-bg)`} />
          <rect x="24" y={h - 36} width="192" height="22" rx="4" fill={t.textPrimary} opacity="0.08" />
          <path
            d={`M 32 ${h - 18} L 72 ${h * 0.35} L 120 ${h * 0.55} L 168 ${h * 0.28} L 208 ${h * 0.42}`}
            stroke={t.textPrimary}
            strokeWidth="2"
            fill="none"
            opacity="0.35"
          />
          <circle cx="168" cy={h * 0.28} r="9" fill={accent} opacity="0.9" />
          <rect x="182" y={h * 0.48} width="36" height="18" rx="3" fill={t.textSecondary} opacity="0.35" />
        </svg>
      </div>
      <figcaption className="text-[10px] leading-[14px]" style={{ color: t.textSecondary }}>
        {caption}
      </figcaption>
    </figure>
  );
}

const COPY: Record<
  Locale,
  {
    backdrop: string;
    sTitle: string;
    mTitle: string;
    lTitle: string;
    s: {
      p1: string;
      riskLabel: string;
      riskOpt1: string;
      riskOpt2: string;
      riskOpt3: string;
      trendCaption: string;
      imgCaption: string;
      lorem: string;
    };
    m: {
      p1: string;
      processLabel: string;
      processOpt1: string;
      processOpt2: string;
      processOpt3: string;
      standardLabel: string;
      standardOpt1: string;
      standardOpt2: string;
      standardOpt3: string;
      barTitle: string;
      fieldA: string;
      fieldB: string;
      imgTitle: string;
      imgCaption: string;
      lorem: string;
    };
    l: {
      p1: string;
      zoneLabel: string;
      zoneOpt1: string;
      zoneOpt2: string;
      zoneOpt3: string;
      metricLabel: string;
      metricOpt1: string;
      metricOpt2: string;
      metricOpt3: string;
      lineTitle: string;
      barTitle: string;
      imgCaption: string;
      tableCol1: string;
      tableCol2: string;
      tableCol3: string;
      lorem: string;
    };
  }
> = {
  ko: {
    backdrop: '모달 예시 닫기',
    sTitle: `소형 (${MODAL_WIDTH_SM_PX}px)`,
    mTitle: `중형 (${MODAL_WIDTH_MD_PX}px)`,
    lTitle: `대형 (${MODAL_WIDTH_LG_PX}px)`,
    s: {
      p1: '알림·짧은 확인·좁은 폭 폼 목업입니다. 프로퍼티 패널과 동일 320px 축입니다.',
      riskLabel: '위험 등급 (예시)',
      riskOpt1: '낮음 — 협동 구역 외',
      riskOpt2: '보통 — SSM 적용',
      riskOpt3: '높음 — PFL 필수',
      trendCaption: '지난 7일 이벤트 (목업)',
      imgCaption: '셀 레이아웃 스냅샷 (SVG 목업)',
      lorem:
        '본문은 실제 데이터가 아닙니다. PL=d 8.2m/s, 최소 거리 0.45m 가정 시 알람 3건이 기록되었습니다.',
    },
    m: {
      p1: '한 열 편집·피커류에 맞는 480px 폭입니다. 드롭다운·막대 그래프·이미지·목업 텍스트를 함께 배치했습니다.',
      processLabel: '공정 템플릿',
      processOpt1: 'EV 배터리 팩 조립 — 라인 01',
      processOpt2: '서브어셈블리 — 프레스',
      processOpt3: '검사 스테이션 — 비전',
      standardLabel: '적용 표준',
      standardOpt1: 'ISO 10218-2 + TS 15066',
      standardOpt2: 'ISO 13849 PL d',
      standardOpt3: '사내 안전 규정 v3.1',
      barTitle: '주간 알람 건수 (목업)',
      fieldA: '셀 ID',
      fieldB: '담당자',
      imgTitle: '참조 이미지',
      imgCaption: '로봇 작업 반경과 펜스 게이트 위치 (목업)',
      lorem:
        '모션 프로파일은 MoveL 기준으로 업로드되었으며, 최대 속도는 구역별 SSM 한도에 맞춰 클램프됩니다. 변경 사항은 시뮬레이션 재실행 후 리포트에 반영됩니다.',
    },
    l: {
      p1: '표·2열 레이아웃·큰 차트·긴 스크롤을 한 번에 검토할 때 쓰는 720px 폭 예시입니다.',
      zoneLabel: '안전 구역',
      zoneOpt1: 'Zone A — 협동',
      zoneOpt2: 'Zone B — 펜스 내',
      zoneOpt3: 'Zone C — 유지보수',
      metricLabel: '집계 지표',
      metricOpt1: '충돌 예상 영역 면적',
      metricOpt2: '가동률 (%)',
      metricOpt3: '알람/시간',
      lineTitle: '시간대별 접근 이벤트 (목업)',
      barTitle: '구역별 위험도 스코어 (목업)',
      imgCaption: '3D 셀 프리뷰 대신 쓸 수 있는 와이드 플레이스홀더',
      tableCol1: '항목',
      tableCol2: '값',
      tableCol3: '비고',
      lorem:
        '리스크 평가 요약: 협동 구역에서 사람 접근 시 SSM이 속도를 제한하고, 펜스 게이트 개방 시 인터록이 적용됩니다. PFL 파라미터는 툴 질량·페이로드에 따라 자동 제안되며, 사용자는 상한을 낮출 수 있습니다. 내보내기 전 모든 웨이포인트가 TS 15066 부속서의 힘/압력 한도를 통과했는지 확인하세요. 동일 설정으로 재현 가능한 감사 로그가 생성됩니다.',
    },
  },
  en: {
    backdrop: 'Close modal examples',
    sTitle: `Small (${MODAL_WIDTH_SM_PX}px)`,
    mTitle: `Medium (${MODAL_WIDTH_MD_PX}px)`,
    lTitle: `Large (${MODAL_WIDTH_LG_PX}px)`,
    s: {
      p1: 'Compact alert / confirm pattern at the 320px axis used by the property panel.',
      riskLabel: 'Risk level (sample)',
      riskOpt1: 'Low — outside cobot zone',
      riskOpt2: 'Medium — SSM applied',
      riskOpt3: 'High — PFL required',
      trendCaption: 'Last 7 days (mock)',
      imgCaption: 'Cell layout snapshot (SVG mock)',
      lorem:
        'Not real data. With PL=d, v=8.2 m/s, min distance 0.45 m, three alarms were logged in the scenario.',
    },
    m: {
      p1: '480px single-column editor: dropdowns, bar chart, image, and body copy together.',
      processLabel: 'Process template',
      processOpt1: 'EV pack assembly — line 01',
      processOpt2: 'Sub-assembly — press',
      processOpt3: 'Inspection — vision',
      standardLabel: 'Applicable standard',
      standardOpt1: 'ISO 10218-2 + TS 15066',
      standardOpt2: 'ISO 13849 PL d',
      standardOpt3: 'Internal safety policy v3.1',
      barTitle: 'Weekly alarms (mock)',
      fieldA: 'Cell ID',
      fieldB: 'Owner',
      imgTitle: 'Reference image',
      imgCaption: 'Robot reach and fence gate placement (mock)',
      lorem:
        'Motion profiles are uploaded as MoveL; peak speed is clamped to per-zone SSM limits. Changes apply after simulation re-run and appear in the report.',
    },
    l: {
      p1: '720px for tables, two columns, charts, and long scroll in one pass.',
      zoneLabel: 'Safety zone',
      zoneOpt1: 'Zone A — collaborative',
      zoneOpt2: 'Zone B — fenced',
      zoneOpt3: 'Zone C — maintenance',
      metricLabel: 'Aggregate metric',
      metricOpt1: 'Expected collision area',
      metricOpt2: 'Utilization (%)',
      metricOpt3: 'Alarms / hr',
      lineTitle: 'Access events by hour (mock)',
      barTitle: 'Risk score by zone (mock)',
      imgCaption: 'Wide placeholder instead of a 3D cell preview',
      tableCol1: 'Item',
      tableCol2: 'Value',
      tableCol3: 'Note',
      lorem:
        'Risk summary: in the collaborative zone, SSM limits speed on human approach; fence gate opening applies interlocks. PFL parameters are suggested from tool mass and payload, and you may lower the cap. Before export, confirm every waypoint meets TS 15066 force/pressure limits. An audit log is generated for reproducible review.',
    },
  },
};

export function ModalExamplesLayer({
  open,
  onClose,
  isDark,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  locale: Locale;
}) {
  const t: Tokens = isDark ? DARK : LIGHT;
  const L = COPY[locale];
  const accent = POINT_ORANGE;
  const barAxisDays = locale === 'ko' ? '월 화 수 목 금 토' : 'Mon Tue Wed Thu Fri Sat';
  const lineChartFoot = locale === 'ko' ? '08:00–16:00 (시간별)' : '08:00–16:00 (hourly)';
  const [visible, setVisible] = useState({ s: true, m: true, l: true });

  useEffect(() => {
    if (!open) {
      setVisible({ s: true, m: true, l: true });
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && !visible.s && !visible.m && !visible.l) {
      onClose();
    }
  }, [open, visible.s, visible.m, visible.l, onClose]);

  if (!open) return null;

  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const baseLeft = Math.min(24, vw * 0.02);
  const stagger = 36;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] cursor-default border-0 p-0"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        aria-label={L.backdrop}
        onClick={onClose}
      />
      {visible.s && (
        <DraggableExampleModal
          title={L.sTitle}
          widthPx={MODAL_WIDTH_SM_PX}
          initialLeft={baseLeft}
          initialTop={WORKSPACE_CONTENT_TOP_PX + 16}
          t={t}
          isDark={isDark}
          onClose={() => setVisible((v) => ({ ...v, s: false }))}
          maxBodyHeight="min(72vh, 560px)"
        >
          <p className="mb-3 text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
            {L.s.p1}
          </p>
          <ExampleSelect
            t={t}
            label={L.s.riskLabel}
            id="modal-ex-s-risk"
            defaultValue="med"
            options={[
              { value: 'low', label: L.s.riskOpt1 },
              { value: 'med', label: L.s.riskOpt2 },
              { value: 'high', label: L.s.riskOpt3 },
            ]}
          />
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
            <div className="shrink-0">
              <span className="text-[10px] font-semibold block mb-1" style={{ color: t.textPrimary }}>
                {L.s.trendCaption}
              </span>
              <ExampleSparkline t={t} accent={accent} />
            </div>
            <div className="min-w-0 flex-1">
              <ExampleImagePlate t={t} accent={accent} caption={L.s.imgCaption} compact />
            </div>
          </div>
          <p className="mt-3 text-[10px] leading-[16px] border-t pt-3" style={{ color: t.textSecondary, borderColor: t.divider }}>
            {L.s.lorem}
          </p>
        </DraggableExampleModal>
      )}
      {visible.m && (
        <DraggableExampleModal
          title={L.mTitle}
          widthPx={MODAL_WIDTH_MD_PX}
          initialLeft={baseLeft + stagger}
          initialTop={WORKSPACE_CONTENT_TOP_PX + 16 + stagger}
          t={t}
          isDark={isDark}
          onClose={() => setVisible((v) => ({ ...v, m: false }))}
          maxBodyHeight="min(76vh, 620px)"
        >
          <p className="mb-3 text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
            {L.m.p1}
          </p>
          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2.5">
            <ExampleSelect
              t={t}
              label={L.m.processLabel}
              id="modal-ex-m-proc"
              defaultValue="p1"
              options={[
                { value: 'p1', label: L.m.processOpt1 },
                { value: 'p2', label: L.m.processOpt2 },
                { value: 'p3', label: L.m.processOpt3 },
              ]}
            />
            <ExampleSelect
              t={t}
              label={L.m.standardLabel}
              id="modal-ex-m-std"
              defaultValue="s1"
              options={[
                { value: 's1', label: L.m.standardOpt1 },
                { value: 's2', label: L.m.standardOpt2 },
                { value: 's3', label: L.m.standardOpt3 },
              ]}
            />
          </div>
          <div className="mt-3">
            <ExampleBarChart t={t} accent={accent} title={L.m.barTitle} axisDays={barAxisDays} />
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold" style={{ color: t.textPrimary }}>
                {L.m.fieldA}
              </span>
              <input
                type="text"
                readOnly
                defaultValue="CELL-ROBOT-ABC"
                className="h-8 rounded-[8px] border px-2 text-[11px] outline-none"
                style={{
                  borderColor: t.inputBorder,
                  background: t.inputReadonlyBg,
                  color: t.inputReadonlyValue,
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold" style={{ color: t.textPrimary }}>
                {L.m.fieldB}
              </span>
              <input
                type="text"
                readOnly
                defaultValue={locale === 'ko' ? '김안전 / 설비팀' : 'J. Kim / Facilities'}
                className="h-8 rounded-[8px] border px-2 text-[11px] outline-none"
                style={{
                  borderColor: t.inputBorder,
                  background: t.inputReadonlyBg,
                  color: t.inputReadonlyValue,
                }}
              />
            </label>
          </div>
          <p className="text-[10px] font-semibold mt-4 mb-1.5" style={{ color: t.textPrimary }}>
            {L.m.imgTitle}
          </p>
          <ExampleImagePlate t={t} accent={accent} caption={L.m.imgCaption} />
          <p className="mt-3 text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
            {L.m.lorem}
          </p>
        </DraggableExampleModal>
      )}
      {visible.l && (
        <DraggableExampleModal
          title={L.lTitle}
          widthPx={MODAL_WIDTH_LG_PX}
          initialLeft={baseLeft + stagger * 2}
          initialTop={WORKSPACE_CONTENT_TOP_PX + 16 + stagger * 2}
          t={t}
          isDark={isDark}
          onClose={() => setVisible((v) => ({ ...v, l: false }))}
          maxBodyHeight={`min(${MODAL_EXAMPLE_L_MAX_BODY_VH}vh, 640px)`}
        >
          <p className="mb-3 text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
            {L.l.p1}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <ExampleSelect
              t={t}
              label={L.l.zoneLabel}
              id="modal-ex-l-zone"
              defaultValue="z1"
              options={[
                { value: 'z1', label: L.l.zoneOpt1 },
                { value: 'z2', label: L.l.zoneOpt2 },
                { value: 'z3', label: L.l.zoneOpt3 },
              ]}
            />
            <ExampleSelect
              t={t}
              label={L.l.metricLabel}
              id="modal-ex-l-metric"
              defaultValue="m1"
              options={[
                { value: 'm1', label: L.l.metricOpt1 },
                { value: 'm2', label: L.l.metricOpt2 },
                { value: 'm3', label: L.l.metricOpt3 },
              ]}
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 min-[560px]:grid-cols-2">
            <ExampleLineChart t={t} accent={accent} title={L.l.lineTitle} foot={lineChartFoot} />
            <div className="min-w-0">
              <ExampleImagePlate t={t} accent={accent} caption={L.l.imgCaption} />
            </div>
          </div>
          <div className="mt-3">
            <ExampleBarChart t={t} accent={accent} title={L.l.barTitle} axisDays={barAxisDays} />
          </div>
          <div
            className="mt-4 rounded-[10px] border overflow-hidden text-[10px]"
            style={{ borderColor: t.inputBorder, background: t.tabBarBg }}
          >
            <div
              className="grid grid-cols-[1fr_0.7fr_1.2fr] gap-2 px-2 py-1.5 font-semibold border-b"
              style={{ borderColor: t.divider, color: t.textPrimary, background: t.sectionHeaderBg }}
            >
              <span>{L.l.tableCol1}</span>
              <span>{L.l.tableCol2}</span>
              <span>{L.l.tableCol3}</span>
            </div>
            {[
              { a: 'SSM v_lim', b: '0.25 m/s', c: locale === 'ko' ? '게이트 개방' : 'Gate open' },
              { a: 'PFL E', b: '42 N', c: locale === 'ko' ? '팔꿈치 축' : 'Elbow axis' },
              { a: 'PL', b: 'd', c: 'ISO 13849' },
              { a: locale === 'ko' ? '감사 ID' : 'Audit ID', b: 'AUD-2026-0412', c: locale === 'ko' ? '시뮬 일치' : 'Sim match' },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_0.7fr_1.2fr] gap-2 px-2 py-1.5 border-b last:border-b-0"
                style={{ borderColor: t.divider, color: t.textSecondary }}
              >
                <span style={{ color: t.textPrimary }}>{row.a}</span>
                <span>{row.b}</span>
                <span>{row.c}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-[18px]" style={{ color: t.textSecondary }}>
            {L.l.lorem}
          </p>
        </DraggableExampleModal>
      )}
    </>
  );
}
