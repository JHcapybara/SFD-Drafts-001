import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { accentRgba, POINT_ORANGE } from './pointColorSchemes';
import { SafeticsAccordion, type PanelTokens } from './AnalysisPanelSafetics698Wire';

export type AnalysisPanelSafeticsV2Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
  onHazardViewClick?: (itemId: string, category: 'collision' | 'pinch') => void;
};

function copy(locale: 'ko' | 'en') {
  if (locale === 'en') {
    return {
      cellHeading: 'Select diagnosis target cell',
      cellPlaceholder: 'Robot Cell name',
      cellA: 'Welding line A-3',
      cellB: 'Assembly cell B-1',
      conditionsChanged: 'Analysis conditions changed',
      cellSelectHint: 'Choose a cell to align results.',
      summaryHeading: 'Diagnosis summary',
      analysisTime: 'Analysis time',
      m1: 'Residual risk',
      m2: 'Protective device safety distance',
      m3: 'Robot PFL compliance',
      m4: 'Hazard zones',
      tabHazard: 'Hazard zones',
      tabEquipment: 'Robot / devices',
      tabResidual: 'Residual risk',
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
    cellHeading: '진단 대상 셀 선택',
    cellPlaceholder: 'Robot Cell name',
    cellA: '용접공정 A-3',
    cellB: '조립 셀 B-1',
    conditionsChanged: '분석 조건 변경됨',
    cellSelectHint: '결과를 맞출 로봇 셀을 선택하세요.',
    summaryHeading: '진단결과 요약',
    analysisTime: '분석 일시',
    m1: '잔존 위험성',
    m2: '방호장치 안전거리',
    m3: '로봇 PFL 적합',
    m4: '위험영역',
    tabHazard: '위험영역',
    tabEquipment: '로봇·장치/설비',
    tabResidual: '잔존 위험성',
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

/** 패널 상단 스트립 — 셀 선택만 (힌트 문구는 `AnalysisSidePanel`에서 제목 아래로 배치) */
export function SafeticsV2CellHeader({
  locale,
  isDark,
  tokens: t,
}: {
  locale: 'ko' | 'en';
  isDark: boolean;
  tokens: PanelTokens;
}) {
  const L = copy(locale);
  const [cellId, setCellId] = useState('a');
  const selectShell: React.CSSProperties = {
    borderColor: t.inputBorder,
    background: t.inputBg,
    color: t.textPrimary,
    boxShadow: t.elevationRaised,
  };

  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[16px] font-semibold" style={{ color: t.textPrimary }}>
          {L.cellHeading}
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-[16px] font-medium"
          style={{
            background: accentRgba(POINT_ORANGE, isDark ? 0.14 : 0.1),
            color: POINT_ORANGE,
            border: `1px solid ${accentRgba(POINT_ORANGE, 0.35)}`,
          }}
        >
          {L.conditionsChanged}
        </span>
      </div>
      <label htmlFor="safetics-v2-cell-select" className="sr-only">
        {L.cellHeading}
      </label>
      <div className="relative">
        <select
          id="safetics-v2-cell-select"
          value={cellId}
          onChange={(e) => setCellId(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-[10px] border py-2 pl-3 pr-10 text-[16px] font-medium leading-snug"
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
    </div>
  );
}

export function AnalysisPanelSafeticsV2({ locale, isDark, tokens: t, onHazardViewClick }: AnalysisPanelSafeticsV2Props) {
  const L = copy(locale);
  const [mainTab, setMainTab] = useState<'hazard' | 'equipment' | 'residual'>('hazard');
  const [equipTab, setEquipTab] = useState<'fence' | 'sensor' | 'robot'>('robot');
  const [openRobotRow, setOpenRobotRow] = useState<string | null>(null);

  const metrics = [
    { key: 'm1', label: L.m1, display: locale === 'en' ? '8' : '8건' },
    { key: 'm2', label: L.m2, display: locale === 'en' ? '2' : '2건' },
    { key: 'm3', label: L.m3, display: locale === 'en' ? '3' : '3건' },
    { key: 'm4', label: L.m4, display: locale === 'en' ? '6' : '6건' },
  ];

  const analysisAt = useMemo(() => new Date(), []);
  const formattedTime = useMemo(() => {
    return analysisAt.toLocaleString(locale === 'en' ? 'en-GB' : 'ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [analysisAt, locale]);

  const mainTabs: { id: typeof mainTab; label: string }[] = [
    { id: 'hazard', label: L.tabHazard },
    { id: 'equipment', label: L.tabEquipment },
    { id: 'residual', label: L.tabResidual },
  ];

  const accTitleClass = 'text-[16px] font-semibold leading-snug';
  const accBadgeClass = 'text-[14px] font-medium leading-none';

  const theadBg = isDark
    ? `linear-gradient(180deg, ${accentRgba(POINT_ORANGE, 0.16)} 0%, ${accentRgba(POINT_ORANGE, 0.08)} 100%)`
    : accentRgba(POINT_ORANGE, 0.11);
  const tbodyBg = isDark ? t.tabBarBg : '#ffffff';

  return (
    <div className="flex min-w-0 flex-col gap-3 pb-1" style={{ color: t.textPrimary }}>
      {/* 요약: 표 + 분석 일시 (막대 없음) */}
      <div className="min-w-0 border-b pb-3 pt-4" style={{ borderColor: t.divider }}>
        <div className="mb-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h3 className="min-w-0 shrink text-[18px] font-bold leading-snug tracking-tight" style={{ color: t.textPrimary }}>
            {L.summaryHeading}
          </h3>
          <div
            className="flex shrink-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[16px] leading-snug sm:justify-end"
            style={{ color: t.textSecondary }}
          >
            <span className="font-semibold">{L.analysisTime}</span>
            <time dateTime={analysisAt.toISOString()} className="tabular-nums font-medium" style={{ color: t.textPrimary }}>
              {formattedTime}
            </time>
          </div>
        </div>
        <div
          className="overflow-hidden rounded-[12px] border"
          style={{
            borderColor: t.inputBorder,
            boxShadow: `${t.elevationRaised}, 0 0 0 1px ${accentRgba(POINT_ORANGE, isDark ? 0.12 : 0.08)} inset`,
            background: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
          }}
        >
          <table className="w-full table-fixed border-collapse text-[16px]">
            <thead>
              <tr style={{ background: theadBg }}>
                {metrics.map((row) => (
                  <th
                    key={`h-${row.key}`}
                    scope="col"
                    className="border-b border-r px-1.5 py-2.5 text-center text-[16px] font-semibold leading-snug last:border-r-0"
                    style={{ borderColor: t.divider, color: t.textPrimary }}
                  >
                    <span className="line-clamp-3 break-words">{row.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: tbodyBg }}>
                {metrics.map((row) => (
                  <td
                    key={`v-${row.key}`}
                    className="border-r px-1 py-2.5 text-center align-middle tabular-nums font-bold tracking-tight last:border-r-0"
                    style={{ fontSize: 22, borderColor: t.divider, color: t.textPrimary }}
                  >
                    {row.display}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 위험 / 장비 / 잔존 — 단일 탭 */}
      <div className="min-w-0" role="tablist" aria-label={locale === 'en' ? 'Analysis sections' : '분석 구역'}>
        <div className="flex min-w-0 gap-0 border-b" style={{ borderColor: t.divider }}>
          {mainTabs.map((tab) => {
            const active = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className="min-h-[48px] min-w-0 flex-1 px-1.5 py-2 text-center text-[16px] font-bold leading-tight"
                style={{
                  color: active ? t.textPrimary : t.textSecondary,
                  borderBottom: active ? `3px solid ${POINT_ORANGE}` : '3px solid transparent',
                  marginBottom: -1,
                  background: active ? t.tabBarBg : 'transparent',
                }}
                onClick={() => setMainTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="pt-3" role="tabpanel">
          {mainTab === 'hazard' && (
            <div className="flex flex-col gap-3">
              <SafeticsAccordion
                id="v2-acc-hazard"
                title={L.hazardSectionTitle}
                badge={L.hazardCount(4)}
                defaultOpen
                tokens={t}
                isDark={isDark}
                titleClassName={accTitleClass}
                badgeClassName={accBadgeClass}
              >
                <div className="flex flex-col gap-3">
                  <SafeticsAccordion
                    id="v2-acc-collision"
                    title={L.collisionRow}
                    badge={L.riskTag}
                    tokens={t}
                    isDark={isDark}
                    titleClassName={accTitleClass}
                    badgeClassName={accBadgeClass}
                  >
                    <ul className="flex flex-col gap-0">
                      {[0, 1, 2].map((i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-3 border-b py-2.5 last:border-b-0"
                          style={{ borderColor: t.divider }}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: POINT_ORANGE }} aria-hidden />
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
                      className="mt-2 rounded-[10px] border-l-[3px] px-3 py-2 text-[14px] leading-relaxed"
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
                  <SafeticsAccordion
                    id="v2-acc-pinch"
                    title={L.pinchRow}
                    badge={L.riskTag}
                    tokens={t}
                    isDark={isDark}
                    titleClassName={accTitleClass}
                    badgeClassName={accBadgeClass}
                  >
                    <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                      {L.pinchNote}
                    </p>
                  </SafeticsAccordion>
                </div>
              </SafeticsAccordion>
            </div>
          )}

          {mainTab === 'equipment' && (
            <div className="min-w-0 border-t-0">
              {/* 2뎁스: 메인 탭과 구분 — 세그먼트(칩) 스타일 */}
              <div
                className="flex min-w-0 gap-1 rounded-[12px] border p-1"
                style={{
                  borderColor: t.inputBorder,
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  boxShadow: `inset 0 1px 2px rgba(0,0,0,${isDark ? 0.25 : 0.06})`,
                }}
                role="tablist"
                aria-label={L.equipmentHeading}
              >
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
                      className="min-h-[38px] min-w-0 flex-1 rounded-[8px] px-2 py-1.5 text-center text-[14px] font-semibold leading-tight transition-[color,background,box-shadow] duration-150"
                      style={{
                        color: active ? t.textPrimary : t.textSecondary,
                        background: active
                          ? isDark
                            ? 'rgba(255,255,255,0.1)'
                            : '#ffffff'
                          : 'transparent',
                        boxShadow: active ? `${t.elevationRaised}, 0 0 0 1px ${accentRgba(POINT_ORANGE, 0.35)}` : 'none',
                      }}
                      onClick={() => setEquipTab(tab.id)}
                    >
                      <span className="line-clamp-2 break-words">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="pt-3">
                {equipTab === 'robot' && (
                  <div className="flex flex-col gap-2.5">
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
                          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                          aria-expanded={openRobotRow === row.id}
                          onClick={() => setOpenRobotRow((cur) => (cur === row.id ? null : row.id))}
                        >
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span
                              className="rounded-full border px-2.5 py-1 text-[16px] font-semibold"
                              style={{
                                borderColor: row.status === 'fail' ? POINT_ORANGE : t.inputBorder,
                                color: row.status === 'fail' ? POINT_ORANGE : t.textPrimary,
                                background:
                                  row.status === 'pass' ? accentRgba(POINT_ORANGE, isDark ? 0.08 : 0.06) : 'transparent',
                              }}
                            >
                              {row.status === 'fail' ? L.fail : L.pass}
                            </span>
                            <span className="min-w-0 text-[16px] font-medium leading-snug" style={{ color: t.textPrimary }}>
                              {L.robotLine}
                            </span>
                            <span
                              className="rounded-full border px-2 py-0.5 text-[14px] font-semibold"
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
                          <div className="border-t px-3 py-2.5 text-[14px] leading-relaxed" style={{ borderColor: t.divider, color: t.textSecondary }}>
                            {row.detail}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
                {equipTab === 'sensor' && (
                  <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                    {locale === 'en'
                      ? 'Sensor evaluation is summarized here; link detailed checks from the main sensor workflow when connected.'
                      : '센서 평가 요약 영역입니다. 메인 센서 분석 흐름과 연결되면 상세 점검으로 이동할 수 있습니다.'}
                  </p>
                )}
                {equipTab === 'fence' && (
                  <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                    {locale === 'en'
                      ? 'Fence height and opening checks appear in this slot for the selected cell.'
                      : '선택한 셀의 펜스 높이·개구 점검 요약이 이 슬롯에 표시됩니다.'}
                  </p>
                )}
              </div>
            </div>
          )}

          {mainTab === 'residual' && (
            <SafeticsAccordion
              id="v2-acc-residual"
              title={L.residualTitle(10)}
              defaultOpen
              tokens={t}
              isDark={isDark}
              titleClassName={accTitleClass}
              contentClassName="flex flex-col gap-3"
            >
              {[0, 1].map((i) => (
                <SafeticsAccordion
                  key={i}
                  id={`v2-acc-res-${i}`}
                  title={L.residualItem}
                  badge={L.riskTag}
                  tokens={t}
                  isDark={isDark}
                  titleClassName={accTitleClass}
                  badgeClassName={accBadgeClass}
                >
                  <p className="text-[14px] leading-relaxed" style={{ color: t.textSecondary }}>
                    {L.residualBody}
                  </p>
                </SafeticsAccordion>
              ))}
            </SafeticsAccordion>
          )}
        </div>
      </div>
    </div>
  );
}
