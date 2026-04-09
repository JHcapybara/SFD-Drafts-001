import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe, Minus, Search } from 'lucide-react';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';
import type { SafetyDiagnosisCellItem } from './SafetyDiagnosisCellPickerModal';

type Props = {
  open: boolean;
  locale: 'ko' | 'en';
  isDark: boolean;
  cell: SafetyDiagnosisCellItem | null;
  onClose: () => void;
  /** 설정에서 진단 시작 시 — 좌측 분석 워크스페이스 등 */
  onStartAnalysis: () => void;
};

type Phase = 'setup' | 'running';

type LogicRow = {
  id: string;
  labelKo: string;
  labelEn: string;
  subEn: string;
};

const LOGIC_ROWS: LogicRow[] = [
  {
    id: 'collision-pfl',
    labelKo: '로봇 충돌안전분석',
    labelEn: 'Robot collision safety analysis',
    subEn: 'Power Force limit mode',
  },
  {
    id: 'sensor-distance',
    labelKo: '센서 안전거리',
    labelEn: 'Sensor safety distance',
    subEn: 'Safety distance',
  },
  {
    id: 'fence',
    labelKo: '펜스 설치 규격',
    labelEn: 'Fence installation standards',
    subEn: 'Safety set',
  },
  {
    id: 'hazardzone',
    labelKo: '셀 위험영역 진단',
    labelEn: 'Cell hazard zone diagnosis',
    subEn: 'Hazardzone distance',
  },
];

const ROBOT_ROWS_KO = ['로봇 1', '로봇 1', '로봇 1', '로봇 2'] as const;
const ROBOT_ROWS_EN = ['Robot 1', 'Robot 1', 'Robot 1', 'Robot 2'] as const;

export function SafetyDiagnosisModal({
  open,
  locale,
  isDark,
  cell,
  onClose,
  onStartAnalysis,
}: Props) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [minimized, setMinimized] = useState(false);
  const [specsOpen, setSpecsOpen] = useState(false);

  const [logicChecked, setLogicChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LOGIC_ROWS.map((r) => [r.id, true])),
  );
  const [logicToggles, setLogicToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LOGIC_ROWS.map((r) => [r.id, false])),
  );
  const [selectedRobotIdx, setSelectedRobotIdx] = useState(0);
  const [robotChecked, setRobotChecked] = useState([true, true, true, true]);
  const [collabMode, setCollabMode] = useState('pfl');
  const [pflRecommend, setPflRecommend] = useState(false);
  const [timeStep, setTimeStep] = useState(0);
  const [safetyStandard, setSafetyStandard] = useState('list');

  useEffect(() => {
    if (open && cell) {
      setPhase('setup');
      setMinimized(false);
    }
  }, [open, cell?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (minimized) setMinimized(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, minimized]);

  const tok = useMemo(() => {
    if (isDark) {
      return {
        scrim: 'rgba(0,0,0,0.62)',
        scrimBlur: 'blur(6px)',
        bg: 'rgba(18,20,26,0.98)',
        border: 'rgba(255,255,255,0.14)',
        shadow: '0 24px 56px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
        text: '#f4f4f5',
        muted: 'rgba(228,228,231,0.7)',
        sectionBorder: 'rgba(255,255,255,0.1)',
        inputBg: 'rgba(255,255,255,0.06)',
        inputBorder: 'rgba(255,255,255,0.16)',
        boxBg: 'rgba(255,255,255,0.04)',
        listSelected: 'rgba(255,255,255,0.08)',
        lineBlue: '#1e3a8a',
        lineOrange: '#fbbf24',
        accentBlue: '#1d4ed8',
      };
    }
    return {
      scrim: 'rgba(0,0,0,0.5)',
      scrimBlur: 'blur(2px)',
      bg: '#ffffff',
      border: 'rgba(15,23,42,0.12)',
      shadow: '0 24px 48px rgba(15,23,42,0.18)',
      text: '#18181b',
      muted: '#52525b',
      sectionBorder: 'rgba(15,23,42,0.12)',
      inputBg: '#ffffff',
      inputBorder: 'rgba(15,23,42,0.14)',
      boxBg: 'rgba(250,250,250,0.96)',
      listSelected: 'rgba(15,23,42,0.05)',
      lineBlue: '#1e40af',
      lineOrange: '#f59e0b',
      accentBlue: '#2563eb',
    };
  }, [isDark]);

  const L = useMemo(() => {
    if (locale === 'en') {
      return {
        modalName: 'Safety diagnosis',
        titleSetup: 'Safety diagnosis',
        runningTitle: (name: string) => `Safety diagnosis in progress for “${name}”.`,
        targetLabel: 'Diagnostic target robot cell',
        logicTitle: 'Cell safety diagnosis logic',
        perRobotTitle: 'Detailed analysis option settings per robot',
        collabMode: 'Collaborative operation mode',
        pflRecommend: 'Get PFL analysis recommendation',
        timeUnit: 'Minimum analysis time unit (sec)',
        safetyStandard: 'Safety standard',
        standardPlaceholder: 'Standard list',
        toggle: 'Toggle',
        startDiagnosis: 'Start diagnosis',
        minimize: 'Minimize',
        expand: 'Expand',
        browserNotice:
          'We are currently generating safety simulation videos using your local hardware resources. Do not close or refresh this page. If you leave, the analysis will be terminated and all progress will be lost. (*It is fine to use other programs in different browser windows.)',
        specsTitle: 'Recommended system specifications',
        specsBody:
          'Multi-core CPU, 16 GB RAM or more, and a dedicated GPU are recommended for smooth simulation video generation.',
        otherTasksNotice:
          'You can edit other robots and libraries within SafetyDesigner except the robot being analyzed, and the analysis will continue to run in the background.',
      };
    }
    return {
      modalName: '안전진단 모달',
      titleSetup: '안전진단 모달',
      runningTitle: (name: string) => `${name} 셀 안전 진단 중입니다.`,
      targetLabel: '진단 대상 로봇 셀',
      logicTitle: '셀 안전진단 로직',
      perRobotTitle: '로봇 별 분석 옵션 세부 설정',
      collabMode: '협동운전 모드',
      pflRecommend: 'PFL 분석 추천 받기',
      timeUnit: '분석 최소 시간 단위 설정(sec)',
      safetyStandard: '안전 표준',
      standardPlaceholder: '표준 목록',
      toggle: '토글',
      startDiagnosis: '진단 시작',
      minimize: '최소화',
      expand: '펼치기',
      browserNotice:
        '로컬 하드웨어로 안전 시뮬레이션 영상을 생성 중입니다. 이 페이지를 닫거나 새로고침하지 마세요. 이탈 시 진단이 중단되고 진행 내용이 모두 사라집니다. (*다른 브라우저 창에서 다른 프로그램을 사용하는 것은 괜찮습니다.)',
      specsTitle: '권장 시스템 사양',
      specsBody:
        '시뮬레이션 영상 생성을 원활히 하려면 멀티코어 CPU, RAM 16GB 이상, 전용 GPU 사용을 권장합니다.',
      otherTasksNotice:
        '진단 중인 로봇을 제외한 다른 로봇·라이브러리는 SafetyDesigner에서 편집할 수 있으며, 백그라운드에서 진단이 계속 진행됩니다.',
    };
  }, [locale]);

  if (!open || typeof document === 'undefined' || !cell) return null;

  const cellName = locale === 'en' ? cell.labelEn : cell.labelKo;

  const handleStartDiagnosis = () => {
    onStartAnalysis();
    setPhase('running');
  };

  const renderLogicRows = (readOnly: boolean) => (
    <div
      className="rounded-xl border p-2 flex flex-col gap-0"
      style={{ borderColor: tok.sectionBorder, background: tok.boxBg }}
    >
      {LOGIC_ROWS.map((row) => {
        const checked = logicChecked[row.id] ?? false;
        const toggleOn = logicToggles[row.id] ?? false;
        return (
          <div
            key={row.id}
            className="flex items-center gap-3 px-2 py-2.5 border-b last:border-b-0"
            style={{ borderColor: tok.sectionBorder }}
          >
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border cursor-pointer disabled:opacity-60"
              style={{ accentColor: POINT_ORANGE }}
              checked={checked}
              disabled={readOnly}
              onChange={(e) =>
                setLogicChecked((p) => ({ ...p, [row.id]: e.target.checked }))
              }
              aria-label={locale === 'en' ? row.labelEn : row.labelKo}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium leading-snug" style={{ color: tok.text }}>
                {locale === 'en' ? row.labelEn : row.labelKo}
              </div>
              {locale === 'en' && (
                <div className="text-[10px] mt-0.5" style={{ color: tok.muted }}>
                  {row.subEn}
                </div>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={toggleOn}
              disabled={readOnly}
              className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold border transition-colors disabled:opacity-70 disabled:pointer-events-none"
              style={{
                borderColor: toggleOn ? accentRgba(POINT_ORANGE, 0.45) : tok.inputBorder,
                background: toggleOn ? accentRgba(POINT_ORANGE, 0.15) : 'transparent',
                color: toggleOn ? POINT_ORANGE : tok.muted,
              }}
              onClick={() => {
                if (readOnly) return;
                setLogicToggles((p) => ({ ...p, [row.id]: !toggleOn }));
              }}
            >
              {L.toggle}
            </button>
          </div>
        );
      })}
    </div>
  );

  /** 와이어프레임: 1번·2번 노드 사이 연결선만 주황/노랑, 나머지 연결선·노드는 진한 파랑 */
  const renderProgressBar = () => (
    <div className="w-full px-2 py-3">
      <div className="flex items-center w-full max-w-md mx-auto">
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border-2"
          style={{
            borderColor: tok.accentBlue,
            background: tok.accentBlue,
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(18,20,26,0.98)' : '#fff'}`,
          }}
        />
        <div className="h-1 flex-1 min-w-[10px] mx-0.5 rounded-full" style={{ background: tok.lineOrange }} />
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border-2"
          style={{
            borderColor: tok.accentBlue,
            background: tok.accentBlue,
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(18,20,26,0.98)' : '#fff'}`,
          }}
        />
        <div className="h-1 flex-1 min-w-[10px] mx-0.5 rounded-full" style={{ background: tok.accentBlue }} />
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border-2"
          style={{
            borderColor: tok.accentBlue,
            background: tok.accentBlue,
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(18,20,26,0.98)' : '#fff'}`,
          }}
        />
        <div className="h-1 flex-1 min-w-[10px] mx-0.5 rounded-full" style={{ background: tok.accentBlue }} />
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 border-2"
          style={{
            borderColor: tok.accentBlue,
            background: tok.accentBlue,
            boxShadow: `0 0 0 2px ${isDark ? 'rgba(18,20,26,0.98)' : '#fff'}`,
          }}
        />
      </div>
    </div>
  );

  const runningBody = (
    <>
      <div className="shrink-0 px-5 sm:px-6 pt-4 pb-3 flex items-start justify-between gap-3 border-b" style={{ borderColor: tok.sectionBorder }}>
        <h2 id="safety-diagnosis-running-title" className="text-[15px] font-bold leading-snug pr-2" style={{ color: tok.text }}>
          {L.runningTitle(cellName)}
        </h2>
        <button
          type="button"
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors hover:opacity-90"
          style={{ borderColor: tok.inputBorder, color: tok.muted, background: tok.boxBg }}
          onClick={() => setMinimized(true)}
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden />
          {L.minimize}
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-5 sm:px-6 py-4 flex flex-col gap-5">
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <span className="text-[12px] font-semibold shrink-0" style={{ color: tok.text }}>
              {L.targetLabel}
            </span>
            <div
              className="flex-1 rounded-[10px] border px-3 py-2 text-[13px] min-w-0"
              style={{
                borderColor: tok.inputBorder,
                background: tok.inputBg,
                color: tok.text,
              }}
            >
              {cellName}
            </div>
          </div>
        </section>

        <section aria-label={locale === 'en' ? 'Progress' : '진행 단계'}>{renderProgressBar()}</section>

        <section>
          <p className="text-[12px] font-semibold mb-2" style={{ color: tok.text }}>
            {L.logicTitle}
          </p>
          {renderLogicRows(true)}
        </section>

        <section className="flex flex-col gap-3 pb-2">
          <div
            className="rounded-xl border p-3 flex gap-3"
            style={{ borderColor: tok.sectionBorder, background: tok.boxBg }}
          >
            <Globe className="w-5 h-5 shrink-0 mt-0.5" style={{ color: tok.accentBlue }} aria-hidden />
            <p className="text-[11px] leading-[18px]" style={{ color: tok.text }}>
              {L.browserNotice}
            </p>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: tok.sectionBorder }}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-[11px] font-semibold"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)',
                color: tok.text,
              }}
              aria-expanded={specsOpen}
              onClick={() => setSpecsOpen((v) => !v)}
            >
              {L.specsTitle}
              <ChevronDown
                className={`w-4 h-4 shrink-0 transition-transform ${specsOpen ? 'rotate-180' : ''}`}
                style={{ color: tok.muted }}
                aria-hidden
              />
            </button>
            {specsOpen && (
              <div className="px-3 pb-3 text-[11px] leading-[17px] border-t" style={{ borderColor: tok.sectionBorder, color: tok.muted }}>
                {L.specsBody}
              </div>
            )}
          </div>

          <div
            className="rounded-xl border p-3 flex gap-3"
            style={{ borderColor: tok.sectionBorder, background: tok.boxBg }}
          >
            <Search className="w-5 h-5 shrink-0 mt-0.5" style={{ color: tok.accentBlue }} aria-hidden />
            <p className="text-[11px] leading-[18px]" style={{ color: tok.text }}>
              {L.otherTasksNotice}
            </p>
          </div>
        </section>
      </div>
    </>
  );

  const setupBody = (
    <>
      <div className="shrink-0 px-5 sm:px-6 pt-5 pb-4 border-b" style={{ borderColor: tok.sectionBorder }}>
        <h2 id="safety-diagnosis-setup-title" className="text-[16px] font-bold leading-tight" style={{ color: tok.text }}>
          {L.titleSetup}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-5 sm:px-6 py-4 flex flex-col gap-5">
        <section>
          <label className="block text-[12px] font-semibold mb-2" style={{ color: tok.text }}>
            {L.targetLabel}
          </label>
          <div
            className="w-full rounded-[10px] border px-3 py-2.5 text-[13px]"
            style={{
              borderColor: tok.inputBorder,
              background: tok.inputBg,
              color: tok.text,
            }}
          >
            {cellName}
          </div>
        </section>

        <section>
          <p className="text-[12px] font-semibold mb-2" style={{ color: tok.text }}>
            {L.logicTitle}
          </p>
          {renderLogicRows(false)}
        </section>

        <section>
          <p className="text-[12px] font-semibold mb-3" style={{ color: tok.text }}>
            {L.perRobotTitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 min-h-[220px]">
            <div
              className="shrink-0 w-full sm:w-[200px] rounded-xl border overflow-hidden flex flex-col"
              style={{ borderColor: tok.sectionBorder, background: tok.boxBg }}
            >
              {(locale === 'en' ? ROBOT_ROWS_EN : ROBOT_ROWS_KO).map((label, idx) => {
                const selected = selectedRobotIdx === idx;
                return (
                  <button
                    key={`${label}-${idx}`}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2.5 text-left border-b last:border-b-0 w-full"
                    style={{
                      borderColor: tok.sectionBorder,
                      background: selected ? tok.listSelected : 'transparent',
                      boxShadow: selected
                        ? `inset 0 0 0 1px ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)'}`
                        : undefined,
                    }}
                    onClick={() => setSelectedRobotIdx(idx)}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 shrink-0 rounded cursor-pointer"
                      style={{ accentColor: '#3b82f6' }}
                      checked={robotChecked[idx]}
                      onChange={(e) => {
                        const next = [...robotChecked];
                        next[idx] = e.target.checked;
                        setRobotChecked(next);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-[12px] font-medium truncate" style={{ color: tok.text }}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className="flex-1 min-w-0 rounded-xl border p-4 flex flex-col gap-4"
              style={{ borderColor: tok.sectionBorder, background: tok.inputBg }}
            >
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tok.muted }}>
                  {L.collabMode}
                </label>
                <div className="relative">
                  <select
                    value={collabMode}
                    onChange={(e) => setCollabMode(e.target.value)}
                    className="w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-[12px] font-medium outline-none cursor-pointer"
                    style={{
                      borderColor: tok.inputBorder,
                      background: tok.bg,
                      color: tok.text,
                    }}
                  >
                    <option value="pfl">PFL</option>
                    <option value="ssm">SSM</option>
                    <option value="sms">SMS</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
                    style={{ color: tok.muted }}
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[12px] font-medium flex-1" style={{ color: tok.text }}>
                  {L.pflRecommend}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={pflRecommend}
                  className="shrink-0 px-2.5 py-1 rounded-md text-[10px] font-semibold border"
                  style={{
                    borderColor: pflRecommend ? accentRgba(POINT_ORANGE, 0.45) : tok.inputBorder,
                    background: pflRecommend ? accentRgba(POINT_ORANGE, 0.15) : 'transparent',
                    color: pflRecommend ? POINT_ORANGE : tok.muted,
                  }}
                  onClick={() => setPflRecommend((v) => !v)}
                >
                  {L.toggle}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-2" style={{ color: tok.muted }}>
                  {L.timeUnit}
                </label>
                <div className="relative pt-1 pb-2 px-1">
                  <div
                    className="absolute left-4 right-4 top-[13px] h-[3px] rounded-full"
                    style={{ background: tok.lineBlue, opacity: 0.35 }}
                  />
                  <div className="relative flex justify-between items-center px-1">
                    {[0, 1, 2, 3].map((i) => {
                      const active = timeStep === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          className="relative z-[1] w-4 h-4 rounded-full border-2 shrink-0 transition-transform hover:scale-110"
                          style={{
                            borderColor: active ? POINT_ORANGE : tok.lineBlue,
                            background: active ? POINT_ORANGE : tok.lineBlue,
                            boxShadow: active ? `0 0 0 3px ${accentRgba(POINT_ORANGE, 0.25)}` : undefined,
                          }}
                          aria-label={`${i + 1}`}
                          onClick={() => setTimeStep(i)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: tok.muted }}>
                  {L.safetyStandard}
                </label>
                <div className="relative">
                  <select
                    value={safetyStandard}
                    onChange={(e) => setSafetyStandard(e.target.value)}
                    className="w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-[12px] font-medium outline-none cursor-pointer"
                    style={{
                      borderColor: tok.inputBorder,
                      background: tok.bg,
                      color: tok.text,
                    }}
                  >
                    <option value="list">{L.standardPlaceholder}</option>
                    <option value="iso">ISO 10218</option>
                    <option value="iso13849">ISO 13849</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-60"
                    style={{ color: tok.muted }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div
        className="shrink-0 px-5 sm:px-6 py-4 border-t flex justify-end"
        style={{ borderColor: tok.sectionBorder, background: isDark ? 'rgba(12,14,18,0.92)' : 'rgba(250,250,250,0.98)' }}
      >
        <button
          type="button"
          className="min-h-10 px-8 rounded-[10px] text-[13px] font-bold border-2 transition-opacity hover:opacity-95"
          style={{
            borderColor: 'rgba(255,220,140,0.95)',
            color: '#1a0a00',
            background: 'linear-gradient(180deg, #fff4e0 0%, #ffcc66 22%, #ff8e2b 52%, #ea6c12 100%)',
            boxShadow: `0 8px 20px ${accentRgba(POINT_ORANGE, 0.4)}`,
          }}
          onClick={handleStartDiagnosis}
        >
          {L.startDiagnosis}
        </button>
      </div>
    </>
  );

  /** 최소화: 하단 고정 스트립 */
  if (phase === 'running' && minimized) {
    return createPortal(
      <div className="fixed inset-x-0 bottom-4 z-[106] flex justify-center px-4 pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-2.5 shadow-xl max-w-lg w-full"
          style={{
            borderColor: tok.border,
            background: tok.bg,
            boxShadow: tok.shadow,
          }}
        >
          <p className="flex-1 min-w-0 text-[12px] font-semibold truncate" style={{ color: tok.text }}>
            {L.runningTitle(cellName)}
          </p>
          <button
            type="button"
            className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: accentRgba(POINT_ORANGE, 0.45), color: POINT_ORANGE }}
            onClick={() => setMinimized(false)}
          >
            {L.expand}
          </button>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        style={{
          background: tok.scrim,
          backdropFilter: tok.scrimBlur,
          WebkitBackdropFilter: tok.scrimBlur,
        }}
        aria-label={locale === 'en' ? 'Close' : '닫기'}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={phase === 'running' ? 'safety-diagnosis-running-title' : 'safety-diagnosis-setup-title'}
        className="relative w-full max-w-[920px] max-h-[min(92vh,880px)] rounded-2xl border flex flex-col overflow-hidden"
        style={{
          borderColor: tok.border,
          background: tok.bg,
          boxShadow: tok.shadow,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sr-only">{L.modalName}</div>
        {phase === 'setup' ? setupBody : runningBody}
      </div>
    </div>,
    document.body,
  );
}
