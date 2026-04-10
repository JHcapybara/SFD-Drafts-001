import { type ReactNode, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { ANALYSIS_DANGER, ANALYSIS_SAFE } from './analysisPanelSemantics';

type PanelTokens = {
  textPrimary: string;
  textSecondary: string;
  inputBorder: string;
  inputBg: string;
  tabBarBg: string;
  sectionHeaderBg: string;
  elevationSection?: string;
};

type Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  onPflViewClick?: (id: string, kind: 'interval' | 'collab') => void;
};

function strings(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      robotPrefix: 'Robot:',
      analysisResult: 'Analysis result',
      maxCri: 'MAX CRI',
      analysisTime: 'Analysis time',
      completedAtLabel: 'Analysis completion time',
      pass: 'PASS',
      fail: 'FAIL',
      pfl: 'PFL',
      conditionChangeTitle: 'How to change conditions',
      conditionItems: [
        'Safely reshape the expected collision area',
        'Adjust robot speed',
        'Switch to safe collision via soft cover',
      ],
      criByIntervalTitle: 'CRI by analysis interval',
      overallMaxCri: 'Overall MAX CRI',
      intervalName: (n: number) => `Analysis interval ${n}`,
      collabCriTitle: 'CRI by collaborative workspace',
      collabRows: [
        { id: 'cw1', label: 'Collaborative workspace 1: Upper arm' },
        { id: 'cw2', label: 'Collaborative workspace 2: Chest' },
        { id: 'cw3', label: 'Collaborative workspace 1: Forearm' },
      ],
      view: 'View',
    };
  }
  return {
    robotPrefix: '로봇:',
    analysisResult: '분석 결과',
    maxCri: 'MAX CRI',
    analysisTime: '분석 시간',
    completedAtLabel: '분석 완료 시간',
    pass: 'PASS',
    fail: 'FAIL',
    pfl: 'PFL',
    conditionChangeTitle: '조건 변경 방법',
    conditionItems: [
      '충돌예상부위 안전하게 형상 변경하기',
      '로봇 속도 조절',
      '소프트 커버를 통해 안전한 충돌로 변경하기',
    ],
    criByIntervalTitle: '분석 구간 별 CRI 결과',
    overallMaxCri: '전체 MAX CRI',
    intervalName: (n: number) => `분석 구간 ${n}`,
    collabCriTitle: '협동작업영역 별 CRI 분석 결과',
    collabRows: [
      { id: 'cw1', label: '협동작업영역 1: 상완' },
      { id: 'cw2', label: '협동작업영역 2: 가슴' },
      { id: 'cw3', label: '협동작업영역 1: 전완' },
    ],
    view: '보기',
  };
}

const ROBOT_MODEL = 'IRB 1600-6/1.2';
const TIME_MAIN = '00:00:00 ~ 00:03:00';
const TIME_INTERVAL = '00:00:00 ~ 00:02:00';
const COMPLETED_AT = '2026.01.01 15:35:32';

export function RobotPflAnalysisContent({ locale, isDark, tokens: t, onPflViewClick }: Props) {
  const S = strings(locale);
  const [passOpen, setPassOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);
  const cardLift = t.elevationSection ?? '0 2px 10px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)';
  const surfaceMuted = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
  const surfaceCard = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';

  const badgePass = (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide"
      style={{
        background: ANALYSIS_SAFE.bgStrong,
        color: ANALYSIS_SAFE.textStrong,
        border: `1px solid ${ANALYSIS_SAFE.border}`,
      }}
    >
      {S.pass}
    </span>
  );
  const badgeFail = (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold tracking-wide"
      style={{
        background: ANALYSIS_DANGER.bgStrong,
        color: ANALYSIS_DANGER.textStrong,
        border: `1px solid ${ANALYSIS_DANGER.border}`,
      }}
    >
      {S.fail}
    </span>
  );
  const badgePfl = (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-[12px] font-bold"
      style={{
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        color: t.textPrimary,
        border: `1px solid ${t.inputBorder}`,
      }}
    >
      {S.pfl}
    </span>
  );

  const rowLine = (label: string, value: ReactNode) => (
    <div className="flex items-start justify-between gap-3 text-[12px] leading-snug">
      <span style={{ color: t.textSecondary }}>{label}</span>
      <div className="text-right font-semibold min-w-0 text-[12px]" style={{ color: t.textPrimary }}>
        {value}
      </div>
    </div>
  );

  const passHeaderBg = isDark ? 'rgba(34,197,94,0.08)' : ANALYSIS_SAFE.bg;
  const failHeaderBg = isDark ? 'rgba(239,68,68,0.1)' : ANALYSIS_DANGER.bg;

  return (
    <div className="flex flex-col gap-4">
      {/* PASS — 녹색 강조 (아코디언) */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          borderLeft: `5px solid ${ANALYSIS_SAFE.border}`,
          background: isDark ? t.inputBg : '#ffffff',
          boxShadow: cardLift,
        }}
      >
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          style={{
            borderBottom: passOpen ? `1px solid ${t.inputBorder}` : undefined,
            background: passHeaderBg,
          }}
          aria-expanded={passOpen}
          onClick={() => setPassOpen((o) => !o)}
        >
          {badgePass}
          <span className="flex-1 min-w-0 text-[14px] font-bold truncate" style={{ color: t.textPrimary }}>
            {S.robotPrefix} {ROBOT_MODEL}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${passOpen ? 'rotate-180' : ''}`}
            style={{ color: t.textSecondary }}
            aria-hidden
          />
        </button>
        {passOpen ? (
          <div className="px-4 py-4 space-y-3" style={{ background: surfaceCard }}>
            {rowLine(S.analysisResult, badgePass)}
            {rowLine(S.maxCri, <span className="tabular-nums text-[14px] font-bold">0.9</span>)}
            {rowLine(S.analysisTime, <span className="tabular-nums font-semibold">{TIME_MAIN}</span>)}
            <p className="text-[12px] text-right pt-1" style={{ color: t.textSecondary }}>
              {S.completedAtLabel} {COMPLETED_AT}
            </p>
          </div>
        ) : null}
      </div>

      {/* FAIL — 적색 강조 (아코디언) */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          borderLeft: `5px solid ${ANALYSIS_DANGER.border}`,
          background: isDark ? t.inputBg : '#ffffff',
          boxShadow: cardLift,
        }}
      >
        <button
          type="button"
          className="w-full flex items-center gap-3 px-4 py-3 text-left"
          style={{
            borderBottom: failOpen ? `1px solid ${t.inputBorder}` : undefined,
            background: failHeaderBg,
          }}
          aria-expanded={failOpen}
          onClick={() => setFailOpen((o) => !o)}
        >
          {badgeFail}
          <span className="flex-1 min-w-0 text-[14px] font-bold truncate" style={{ color: t.textPrimary }}>
            {S.robotPrefix} {ROBOT_MODEL}
          </span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${failOpen ? 'rotate-180' : ''}`}
            style={{ color: t.textSecondary }}
            aria-hidden
          />
        </button>
        {failOpen ? (
          <div className="px-4 py-4 space-y-4 border-t" style={{ borderColor: t.inputBorder, background: surfaceCard }}>
          <div
            className="rounded-lg border px-3 py-2.5 flex items-center gap-2"
            style={{ borderColor: t.inputBorder, background: t.inputBg }}
          >
            <span className="flex-1 text-[12px] font-semibold" style={{ color: t.textPrimary }}>
              {S.robotPrefix} {ROBOT_MODEL}
            </span>
            {badgePfl}
          </div>

          <div className="space-y-2">
            {rowLine(S.analysisResult, badgeFail)}
            {rowLine(S.analysisTime, <span className="tabular-nums font-semibold">{TIME_MAIN}</span>)}
            <p className="text-[12px] text-right" style={{ color: t.textSecondary }}>
              {S.completedAtLabel} {COMPLETED_AT}
            </p>
          </div>

          <div>
            <p className="text-[12px] font-bold mb-2" style={{ color: ANALYSIS_DANGER.textStrong }}>
              {S.conditionChangeTitle}
            </p>
            <ul className="flex flex-col gap-2">
              {S.conditionItems.map((line, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-[12px] transition-colors"
                  style={{
                    borderColor: t.inputBorder,
                    background: surfaceMuted,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.12)' : 'rgba(254,242,242,0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = surfaceMuted;
                  }}
                >
                  <span className="leading-snug" style={{ color: t.textPrimary }}>
                    {line}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-50" style={{ color: t.textSecondary }} aria-hidden />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-bold mb-2" style={{ color: t.textPrimary }}>
              {S.criByIntervalTitle}
            </p>
            <p className="text-[12px] mb-2" style={{ color: t.textSecondary }}>
              {S.overallMaxCri}{' '}
              <span className="font-bold tabular-nums text-[14px]" style={{ color: t.textPrimary }}>
                0.9
              </span>
            </p>
            <ul className="flex flex-col gap-2">
              {[
                { id: 'int1', n: 1, cri: '1.3' },
                { id: 'int2', n: 2, cri: '1.7' },
              ].map((it) => (
                <li
                  key={it.id}
                  className="rounded-lg border px-3 py-3 flex flex-col gap-2"
                  style={{ borderColor: t.inputBorder, background: t.inputBg }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold" style={{ color: t.textPrimary }}>
                      {S.intervalName(it.n)}
                    </span>
                    {badgePass}
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="tabular-nums" style={{ color: t.textSecondary }}>
                      {TIME_INTERVAL}
                    </span>
                    <span style={{ color: t.textSecondary }}>
                      {S.maxCri}: <strong style={{ color: t.textPrimary }}>{it.cri}</strong>
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-[12px] font-bold px-3 py-1.5 rounded-lg border"
                      style={{
                        borderColor: accentRgba(POINT_ORANGE, 0.45),
                        color: POINT_ORANGE,
                        background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.08)',
                      }}
                      onClick={() => onPflViewClick?.(it.id, 'interval')}
                    >
                      {S.view}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[12px] font-bold mb-2" style={{ color: t.textPrimary }}>
              {S.collabCriTitle}
            </p>
            <ul className="flex flex-col gap-2">
              {S.collabRows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                  style={{ borderColor: t.inputBorder, background: surfaceMuted }}
                >
                  <div
                    className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-[12px]"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
                      color: t.textSecondary,
                    }}
                    aria-hidden
                  >
                    ●
                  </div>
                  <span className="flex-1 min-w-0 text-[12px] font-medium leading-snug" style={{ color: t.textPrimary }}>
                    {row.label}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-lg border"
                    style={{
                      borderColor: accentRgba(POINT_ORANGE, 0.45),
                      color: POINT_ORANGE,
                      background: isDark ? 'rgba(255,142,43,0.1)' : 'rgba(255,142,43,0.08)',
                    }}
                    onClick={() => onPflViewClick?.(row.id, 'collab')}
                  >
                    {S.view}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        ) : null}
      </div>
    </div>
  );
}
