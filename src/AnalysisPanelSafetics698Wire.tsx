import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';

/**
 * Safetics 698-990 레이아웃 — 우측 PropertyPanel과 동일 토큰 계열.
 * 본문 최소 14px, 수치 최소 20px, 포인트 컬러 #FF8E2B 우선.
 */
export type PanelTokens = {
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

export type AnalysisPanelSafetics698WireProps = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  onHazardViewClick?: (itemId: string, category: 'collision' | 'pinch') => void;
};

function copy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      cellLabel: 'Select diagnosis target cell',
      cellPlaceholder: 'Robot Cell name',
      cellA: 'Welding line A-3',
      cellB: 'Assembly cell B-1',
      conditionsChanged: 'Analysis conditions changed',
      cellSelectHint: 'Choose a cell to align results.',
      summaryHeading: 'Diagnosis summary',
      m1: 'Residual risk',
      m2: 'Protective device safety distance',
      m3: 'Robot PFL compliance',
      m4: 'Hazard zones',
      chartCaption: 'Relative scale (max in this cell)',
      hazardSectionTitle: 'Hazard zones',
      hazardCount: (n: number) => `${n} items`,
      riskTag: '(risk)',
      collisionRow: 'Collision hazard zone',
      pinchRow: 'Pinch hazard zone',
      listLine: '{Facility near hazard zone} — 1 vicinity',
      view: 'View in scene',
      collisionNote:
        'Collision risk is expected when workers enter. Review guarding, light curtains, and procedures before production.',
      pinchNote: 'Pinch points may exist near tooling. Verify clearance and add warnings where needed.',
      equipmentHeading: 'Robot & device / facility analysis',
      tabFence: (n: number) => `Fence (${n})`,
      tabSensor: (n: number) => `Sensor (${n})`,
      tabPfl: 'Robot PFL analysis',
      robotLine: 'Robot: IRB 1600-6/1.2',
      fail: 'Fail',
      pass: 'PASS',
      pfl: 'PFL',
      failDetail:
        'Measured force/pressure exceeds the allowed envelope for collaborative speed. Reduce approach speed or adjust the PFL profile.',
      passDetail: 'Within configured PFL limits for the current operating mode.',
      residualTitle: (n: number) => `Residual risk (${n})`,
      residualItem: 'E-stop button visibility',
      residualBody:
        'Ensure the emergency stop is visible and reachable from the main approach paths. Add signage if contrast is insufficient.',
      actionHint: 'Recommended actions',
    };
  }
  return {
    cellLabel: '진단 대상 셀 선택',
    cellPlaceholder: 'Robot Cell name',
    cellA: '용접공정 A-3',
    cellB: '조립 셀 B-1',
    conditionsChanged: '분석 조건 변경됨',
    cellSelectHint: '결과를 맞출 로봇 셀을 선택하세요.',
    summaryHeading: '진단결과 요약',
    m1: '잔존 위험성',
    m2: '방호장치 안전거리',
    m3: '로봇 PFL 적합',
    m4: '위험영역',
    chartCaption: '상대 비교 (이 셀 기준 최댓값 대비)',
    hazardSectionTitle: '위험영역',
    hazardCount: (n: number) => `${n}건`,
    riskTag: '(위험)',
    collisionRow: '충돌 위험영역',
    pinchRow: '끼임 위험영역',
    listLine: '{위험영역 주변 설비} 주변부 1곳',
    view: '장면에서 보기',
    collisionNote:
      '작업자 진입 시 충돌 위험이 예상됩니다. 생산 전 방호·라이트커튼·절차를 점검하세요.',
    pinchNote: '툴링 주변 끼임 가능성이 있습니다. 간격과 경고 표지를 확인하세요.',
    equipmentHeading: '로봇 및 장치/설비 분석',
    tabFence: (n: number) => `펜스(${n})`,
    tabSensor: (n: number) => `센서(${n})`,
    tabPfl: '로봇 PFL 분석',
    robotLine: '로봇 : IRB 1600-6/1.2',
    fail: 'Fail',
    pass: 'PASS',
    pfl: 'PFL',
    failDetail:
      '설정된 협동 속도 대비 허용 힘/압력 범위를 초과했습니다. 접근 속도를 낮추거나 PFL 프로파일을 조정하세요.',
    passDetail: '현재 운전 모드에서 구성된 PFL 한도 내에 있습니다.',
    residualTitle: (n: number) => `잔존 위험성(${n})`,
    residualItem: '비상정지 버튼 시인성',
    residualBody:
      '비상정지가 주 동선에서 잘 보이고 닿을 수 있는지 확인하세요. 대비가 부족하면 표지를 보강하세요.',
    actionHint: '조치 안내',
  };
}

export function SafeticsAccordion({
  title,
  badge,
  defaultOpen,
  tokens,
  children,
  id,
  isDark: dark,
  titleClassName = 'text-[14px] font-semibold leading-snug',
  badgeClassName = 'text-[14px] font-medium leading-none',
  contentClassName,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  tokens: PanelTokens;
  children: React.ReactNode;
  id: string;
  isDark: boolean;
  /** 버튼 라벨 타이포 (기본 14px) */
  titleClassName?: string;
  badgeClassName?: string;
  /** 펼침 영역 래퍼에 추가 클래스 (예: flex flex-col gap-3) */
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      className="min-w-0 overflow-hidden rounded-[10px] border"
      style={{ borderColor: tokens.inputBorder, boxShadow: tokens.elevationSection, background: tokens.panelBg }}
    >
      <button
        id={id}
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors"
        style={{ background: tokens.sectionHeaderBg }}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className={`min-w-0 ${titleClassName}`} style={{ color: tokens.textPrimary }}>
            {title}
          </span>
          {badge ? (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 font-medium leading-none ${badgeClassName}`}
              style={{
                background: accentRgba(POINT_ORANGE, dark ? 0.18 : 0.12),
                color: POINT_ORANGE,
              }}
            >
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          style={{ color: tokens.textSecondary }}
          aria-hidden
          strokeWidth={2}
        />
      </button>
      {open ? (
        <div className={`border-t px-3 py-3 ${contentClassName ?? ''}`} style={{ borderColor: tokens.divider }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function AnalysisPanelSafetics698Wire({
  locale,
  isDark,
  tokens: t,
  onHazardViewClick,
}: AnalysisPanelSafetics698WireProps) {
  const L = copy(locale);
  const [cellId, setCellId] = useState('a');
  const [equipTab, setEquipTab] = useState<'fence' | 'sensor' | 'robot'>('robot');
  const [openRobotRow, setOpenRobotRow] = useState<string | null>('r0');

  const metrics = [
    { key: 'm1', label: L.m1, value: locale === 'en' ? '8' : '8', suffix: locale === 'en' ? '' : '건', raw: 8 },
    { key: 'm2', label: L.m2, value: locale === 'en' ? '2' : '2', suffix: locale === 'en' ? '' : '건', raw: 2 },
    { key: 'm3', label: L.m3, value: locale === 'en' ? '3' : '3', suffix: locale === 'en' ? '' : '건', raw: 3 },
    { key: 'm4', label: L.m4, value: locale === 'en' ? '6' : '6', suffix: locale === 'en' ? '' : '건', raw: 6 },
  ];
  const maxRaw = Math.max(...metrics.map((m) => m.raw), 1);

  const selectShell: React.CSSProperties = {
    borderColor: t.inputBorder,
    background: t.inputBg,
    color: t.textPrimary,
    boxShadow: t.elevationRaised,
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 pb-2" style={{ color: t.textPrimary }}>
      {/* 셀 선택 */}
      <section
        className="rounded-[10px] border p-3"
        style={{ borderColor: t.inputBorder, boxShadow: t.elevationRaised, background: t.panelBg }}
      >
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[14px] font-semibold" style={{ color: t.textPrimary }}>
            {L.cellLabel}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-[14px] font-medium"
            style={{
              background: accentRgba(POINT_ORANGE, isDark ? 0.14 : 0.1),
              color: POINT_ORANGE,
              border: `1px solid ${accentRgba(POINT_ORANGE, 0.35)}`,
            }}
          >
            {L.conditionsChanged}
          </span>
        </div>
        <label htmlFor="safetics-cell-select" className="sr-only">
          {L.cellLabel}
        </label>
        <div className="relative">
          <select
            id="safetics-cell-select"
            value={cellId}
            onChange={(e) => setCellId(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-[10px] border py-2.5 pl-3 pr-10 text-[14px] font-medium leading-snug"
            style={{
              ...selectShell,
              borderWidth: 1,
              outline: 'none',
            }}
          >
            <option value="a">{`${L.cellPlaceholder} — ${L.cellA}`}</option>
            <option value="b">{`${L.cellPlaceholder} — ${L.cellB}`}</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: t.textSecondary }}
            aria-hidden
            strokeWidth={2}
          />
        </div>
        <p className="mt-2 text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
          {L.cellSelectHint}
        </p>
      </section>

      {/* 요약 수치 + 막대 */}
      <section
        className="rounded-[10px] border p-3"
        style={{ borderColor: t.inputBorder, boxShadow: t.elevationSection, background: t.panelBg }}
      >
        <h3 className="text-[15px] font-semibold leading-snug" style={{ color: t.textPrimary }}>
          {L.summaryHeading}
        </h3>
        <div className="mt-3 grid min-w-0 gap-3 sm:grid-cols-2">
          {metrics.map((m) => (
            <div
              key={m.key}
              className="rounded-[10px] border px-3 py-3"
              style={{ borderColor: t.divider, background: t.tabBarBg }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 text-[14px] leading-snug" style={{ color: t.textSecondary }}>
                  {m.label}
                </span>
                <span
                  className="shrink-0 tabular-nums tracking-tight"
                  style={{ fontSize: 22, fontWeight: 700, color: t.textPrimary }}
                >
                  {m.value}
                  {m.suffix ? <span className="text-[14px] font-semibold">{m.suffix}</span> : null}
                </span>
              </div>
              <div
                className="mt-3 h-3 w-full overflow-hidden rounded-full"
                style={{ background: t.inputBg }}
                aria-hidden
              >
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${(m.raw / maxRaw) * 100}%`,
                    minWidth: m.raw > 0 ? '8%' : 0,
                    background: `linear-gradient(90deg, ${accentRgba(POINT_ORANGE, 0.85)}, ${POINT_ORANGE})`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
          {L.chartCaption}
        </p>
      </section>

      {/* 위험영역 */}
      <SafeticsAccordion
        id="acc-hazard"
        title={L.hazardSectionTitle}
        badge={L.hazardCount(4)}
        defaultOpen
        tokens={t}
        isDark={isDark}
      >
        <div className="flex flex-col gap-3">
          <SafeticsAccordion id="acc-collision" title={L.collisionRow} badge={L.riskTag} defaultOpen tokens={t} isDark={isDark}>
            <ul className="flex flex-col gap-0">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                  style={{ borderColor: t.divider }}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: POINT_ORANGE }}
                      aria-hidden
                    />
                    <span className="min-w-0 text-[14px] leading-snug" style={{ color: t.textPrimary }}>
                      {L.listLine}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-lg px-2.5 py-1.5 text-[14px] font-semibold transition-opacity hover:opacity-90"
                    style={{
                      color: '#fff',
                      background: `linear-gradient(135deg, ${accentRgba(POINT_ORANGE, 1)} 0%, #ff6b00 100%)`,
                      boxShadow: t.elevationRaised,
                    }}
                    onClick={() => onHazardViewClick?.(`hz-${i}`, i === 1 ? 'pinch' : 'collision')}
                  >
                    {L.view}
                  </button>
                </li>
              ))}
            </ul>
            <div
              className="mt-3 rounded-[10px] border-l-[3px] px-3 py-2.5 text-[14px] leading-relaxed"
              style={{
                borderLeftColor: POINT_ORANGE,
                background: t.sectionHeaderBg,
                color: t.textSecondary,
              }}
            >
              <span className="font-semibold" style={{ color: t.textPrimary }}>
                {L.actionHint}:{' '}
              </span>
              {L.collisionNote}
            </div>
          </SafeticsAccordion>

          <SafeticsAccordion id="acc-pinch" title={L.pinchRow} badge={L.riskTag} tokens={t} isDark={isDark}>
            <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
              {L.pinchNote}
            </p>
          </SafeticsAccordion>
        </div>
      </SafeticsAccordion>

      {/* 장비 분석 */}
      <section
        className="overflow-hidden rounded-[10px] border"
        style={{ borderColor: t.inputBorder, boxShadow: t.elevationSection, background: t.panelBg }}
      >
        <div className="border-b px-3 py-3" style={{ borderColor: t.divider, background: t.sectionHeaderBg }}>
          <h3 className="text-[15px] font-semibold leading-snug" style={{ color: t.textPrimary }}>
            {L.equipmentHeading}
          </h3>
        </div>
        <div className="flex border-b" style={{ borderColor: t.divider }} role="tablist" aria-label={L.equipmentHeading}>
          {(
            [
              { id: 'fence' as const, label: L.tabFence(2) },
              { id: 'sensor' as const, label: L.tabSensor(2) },
              { id: 'robot' as const, label: L.tabPfl },
            ]
          ).map((tab) => {
            const active = equipTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="min-h-[48px] flex-1 px-2 py-2 text-[14px] font-medium leading-snug"
                style={{
                  color: active ? t.textPrimary : t.textSecondary,
                  borderBottom: active ? `3px solid ${POINT_ORANGE}` : '3px solid transparent',
                  marginBottom: -1,
                  background: active ? t.tabBarBg : 'transparent',
                }}
                onClick={() => setEquipTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-3">
          {equipTab === 'robot' && (
            <div className="flex flex-col gap-3">
              {[
                { id: 'r0', status: 'fail' as const, detail: L.failDetail },
                { id: 'r1', status: 'pass' as const, detail: L.passDetail },
                { id: 'r2', status: 'pass' as const, detail: L.passDetail },
              ].map((row) => (
                <div
                  key={row.id}
                  className="overflow-hidden rounded-[10px] border"
                  style={{ borderColor: t.inputBorder, background: t.tabBarBg }}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left"
                    aria-expanded={openRobotRow === row.id}
                    onClick={() => setOpenRobotRow((cur) => (cur === row.id ? null : row.id))}
                  >
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span
                        className="rounded-full border px-2.5 py-1 text-[14px] font-semibold"
                        style={{
                          borderColor: row.status === 'fail' ? POINT_ORANGE : t.inputBorder,
                          color: row.status === 'fail' ? POINT_ORANGE : t.textPrimary,
                          background:
                            row.status === 'pass' ? accentRgba(POINT_ORANGE, isDark ? 0.08 : 0.06) : 'transparent',
                        }}
                      >
                        {row.status === 'fail' ? L.fail : L.pass}
                      </span>
                      <span className="min-w-0 text-[14px] leading-snug" style={{ color: t.textPrimary }}>
                        {L.robotLine}
                      </span>
                      <span
                        className="rounded-full border px-2 py-0.5 text-[14px] font-medium"
                        style={{ borderColor: t.inputBorder, color: t.textSecondary }}
                      >
                        {L.pfl}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 transition-transform ${openRobotRow === row.id ? 'rotate-180' : ''}`}
                      style={{ color: t.textSecondary }}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </button>
                  {openRobotRow === row.id ? (
                    <div className="border-t px-3 py-3 text-[14px] leading-relaxed" style={{ borderColor: t.divider, color: t.textSecondary }}>
                      {row.detail}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {equipTab === 'sensor' && (
            <p className="py-2 text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
              {locale === 'en'
                ? 'Sensor evaluation is summarized here; link detailed checks from the main sensor workflow when connected.'
                : '센서 평가 요약 영역입니다. 메인 센서 분석 흐름과 연결되면 상세 점검으로 이동할 수 있습니다.'}
            </p>
          )}
          {equipTab === 'fence' && (
            <p className="py-2 text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
              {locale === 'en'
                ? 'Fence height and opening checks appear in this slot for the selected cell.'
                : '선택한 셀의 펜스 높이·개구 점검 요약이 이 슬롯에 표시됩니다.'}
            </p>
          )}
        </div>
      </section>

      {/* 잔존 위험성 */}
      <SafeticsAccordion id="acc-residual" title={L.residualTitle(10)} defaultOpen tokens={t} isDark={isDark}>
        {[0, 1].map((i) => (
          <SafeticsAccordion key={i} id={`acc-res-${i}`} title={L.residualItem} badge={L.riskTag} tokens={t} isDark={isDark}>
            <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
              {L.residualBody}
            </p>
          </SafeticsAccordion>
        ))}
      </SafeticsAccordion>
    </div>
  );
}
