import { Wrench } from 'lucide-react';
import { useLocale } from './localeContext';

/** 항목 A1 — 엔드이펙터 모델 요약 카드(모달·패널 등 재사용) */
export interface EeModelSummaryCardTokens {
  panelBorder: string;
  textPrimary: string;
  textSecondary: string;
  inputBg: string;
}

export interface EeModelSummaryCardProps {
  modelFileName: string;
  type: string;
  /** 도구 이름 표시값(카탈로그: 짧은 모델명, 커스텀: 전체 파일명 등) */
  modelDisplayName: string;
  makerLabel?: string;
  source?: 'catalog' | 'custom';
  t: EeModelSummaryCardTokens;
  isDark: boolean;
}

export function EeModelSummaryCard({
  modelFileName,
  type,
  modelDisplayName,
  makerLabel,
  source,
  t,
  isDark,
}: EeModelSummaryCardProps) {
  const { L } = useLocale();
  const detailLine = `${type} · ${modelDisplayName}`;
  const sourceLine =
    source === 'custom'
      ? (makerLabel ?? '')
      : makerLabel
        ? `${L.eeMakerPrefix} · ${makerLabel}`
        : '';

  return (
    <div
      className="flex items-center gap-3 rounded-[12px] px-3 py-3"
      style={{ background: t.inputBg, border: `1px solid ${t.panelBorder}` }}
    >
      <div
        className="w-14 h-14 rounded-[10px] flex items-center justify-center shrink-0"
        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
      >
        <Wrench className="w-7 h-7" style={{ color: t.textPrimary }} strokeWidth={1.2} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[13px] font-bold truncate" style={{ color: t.textPrimary }}>
          {modelFileName}
        </p>
        <p className="text-[11px] leading-snug" style={{ color: t.textSecondary }}>
          {detailLine}
        </p>
        {sourceLine ? (
          <p className="text-[11px] leading-snug truncate" style={{ color: t.textSecondary }}>
            {sourceLine}
          </p>
        ) : null}
      </div>
    </div>
  );
}
