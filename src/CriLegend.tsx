import { useMemo } from 'react';
import { WORKSPACE_CONTENT_TOP_PX } from './chromeLayout';

const LABELS = [0, 0.5, 1, 1.5, 2] as const;

/** 가로 스케일 바 길이 (px) */
const BAR_WIDTH_PX = 168;

type Props = {
  visible: boolean;
  locale: 'ko' | 'en';
};

/**
 * CRI(Collision Risk Index) 색상 범례 — 0~2 스케일, 1.0 이상부터 충돌 위험 구간.
 * 좌측 메뉴「분석」선택 시 캔버스 상단 중앙에 표시.
 */
export function CriLegend({ visible, locale }: Props) {
  const copy = useMemo(
    () =>
      locale === 'en'
        ? {
            title: 'CRI',
            tooltip:
              'Collision Risk Index (company term). Risk of collision is present at values of 1.0 and above.',
            threshold: '≥1.0: collision risk',
          }
        : {
            title: 'CRI',
            tooltip:
              'CRI(Collision Risk Index, 당사 용어). 1.0 이상부터 충돌 시 위험이 존재하는 구간을 나타냅니다.',
            threshold: '1.0 이상: 충돌 위험',
          },
    [locale],
  );

  const barGradient = useMemo(
    () =>
      'linear-gradient(to right, #0c1749 0%, #0891b2 18%, #22c55e 38%, #eab308 52%, #ea580c 72%, #dc2626 100%)',
    [],
  );

  if (!visible) return null;

  return (
    <div
      className="fixed z-[26] pointer-events-none select-none rounded-lg border border-white/10 bg-black/40 px-1.5 py-1 shadow-md backdrop-blur-md"
      style={{
        left: '50%',
        transform: 'translateX(-50%)',
        top: `calc(${WORKSPACE_CONTENT_TOP_PX}px + 8px)`,
        width: 'max-content',
        maxWidth: 'min(calc(100vw - 24px), 280px)',
      }}
      role="img"
      aria-label={copy.tooltip}
    >
      <div className="flex items-start justify-between gap-2 mb-0.5">
        <p
          className="text-[8px] leading-tight text-left min-w-0 flex-1 max-w-[148px]"
          style={{ color: 'rgba(203, 213, 225, 0.88)' }}
        >
          {copy.threshold}
        </p>
        <div
          className="text-[10px] font-semibold tracking-wide shrink-0 leading-none pt-0.5"
          style={{ color: 'rgba(228, 228, 231, 0.92)' }}
          title={copy.tooltip}
        >
          {copy.title}
        </div>
      </div>

      <div className="flex flex-col gap-px" style={{ width: BAR_WIDTH_PX }}>
        <div
          className="h-2 w-full shrink-0 rounded-[2px] border border-white/15 shadow-inner"
          style={{ background: barGradient }}
        />
        <div
          className="flex flex-row justify-between text-[9px] font-medium tabular-nums leading-none pt-px"
          style={{ color: 'rgba(203, 213, 225, 0.88)' }}
        >
          {LABELS.map((v) => (
            <span key={v}>{v === Math.floor(v) ? String(v) : v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
