/**
 * 하단 분석 패널용 예시 데이터 (PFL·충돌 위험 시나리오에 맞춘 목업)
 * 실제 연동 시 동일 형태의 배열로 교체하면 됨.
 */

const TS_LEN = 49;
const TS_XMAX = 42;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 0–42 타임 스텝 구간: 이송(저속) → 접근(가속) → 짧은 고속 구간 → 감속 → 재접근 → 대기 */
function demoSpeedMmS(x: number): number {
  let s = 90;
  if (x < 4.5) s = lerp(88, 295, x / 4.5);
  else if (x < 10) s = lerp(295, 498, (x - 4.5) / 5.5);
  else if (x < 15.5) s = lerp(498, 920, (x - 10) / 5.5);
  else if (x < 20) s = lerp(920, 655, (x - 15.5) / 4.5);
  else if (x < 26) s = lerp(655, 228, (x - 20) / 6);
  else if (x < 31.5) s = lerp(228, 185, (x - 26) / 5.5);
  else s = lerp(185, 92, (x - 31.5) / (TS_XMAX - 31.5));
  s += 14 * Math.sin(x * 0.95) + 6 * Math.sin(x * 2.1);
  return clamp(s, 0, 1000);
}

/** 속도·근접 구간에 따라 CRI 상승, 임계(1) 근접 구간 2곳 */
function demoCri01(x: number, speed: number): number {
  const sp = 0.38 * (speed / 1000) ** 1.15;
  const windowA = 0.34 * Math.exp(-((x - 14.8) ** 2) / 9);
  const windowB = 0.22 * Math.exp(-((x - 36) ** 2) / 11);
  const c = 0.1 + sp + windowA + windowB + 0.035 * Math.sin(x * 1.05);
  return clamp(c, 0.06, 0.99);
}

/**
 * 추천 속도 %: CRI 높을수록 감속 권고(낮은 %), 여유 구간은 100% 기준·상한 200%까지
 */
function demoRecSpeedPct(cri: number, x: number): number {
  const wobble = 6 * Math.sin(x * 0.55);
  if (cri >= 0.52) {
    const t = clamp((cri - 0.52) / 0.48, 0, 1);
    return clamp(lerp(78, 41, t) + wobble * 0.4, 32, 92);
  }
  const head = lerp(104, 188, (0.52 - cri) / 0.52);
  return clamp(head + wobble, 100, 200);
}

function buildTimeSeries42(): {
  speedMmS: number[];
  cri: number[];
  recPct: number[];
} {
  const speedMmS: number[] = [];
  const cri: number[] = [];
  const recPct: number[] = [];
  for (let i = 0; i < TS_LEN; i++) {
    const x = (i / (TS_LEN - 1)) * TS_XMAX;
    const sp = demoSpeedMmS(x);
    speedMmS.push(sp);
    const cr = demoCri01(x, sp);
    cri.push(cr);
    recPct.push(demoRecSpeedPct(cr, x));
  }
  return { speedMmS, cri, recPct };
}

export const DEMO_TIME_STEP_X_MAX = TS_XMAX;
export const { speedMmS: DEMO_SPEED_MM_S, cri: DEMO_CRI_STEP, recPct: DEMO_REC_SPEED_PCT } = buildTimeSeries42();

/** Time [sec] 0–600: 대부분 안전, 2회 스파이크로 임계선(1) 초과 */
function demoCriVsTime600(t: number): number {
  const floor = 0.32 + 0.08 * Math.sin(t / 95) + 0.06 * Math.sin(t / 41);
  const spike1 = 0.62 * Math.exp(-((t - 155) ** 2) / (2 * 38 ** 2));
  const spike2 = 0.48 * Math.exp(-((t - 418) ** 2) / (2 * 52 ** 2));
  return clamp(floor + spike1 + spike2, 0.12, 2.78);
}

const CRI_TIME_LEN = 81;

export const DEMO_CRI_TIME_SEC_MAX = 600;
export const DEMO_CRI_VS_TIME: number[] = Array.from({ length: CRI_TIME_LEN }, (_, i) => {
  const t = (i / (CRI_TIME_LEN - 1)) * DEMO_CRI_TIME_SEC_MAX;
  return demoCriVsTime600(t);
});

/**
 * 막대: 축(R1–R6)은 상대적으로 낮음, 엔드 이펙터 접촉부 일부는 힘·압력 집중으로 CRI>1
 * (위치별 / 힘 기여 / 압력 기여 — 탭마다 값이 달라짐)
 */
export const DEMO_BAR_AT_POS: number[] = [
  0.44, 0.53, 0.39, 0.59, 0.46, 0.51, 0.55, 0.48, 0.64, 0.57, 0.61, 0.66, 0.52, 0.58, 0.63, 0.56, 0.69, 0.73, 0.61, 0.67, 0.59, 0.71, 0.64, 1.14, 1.22, 1.18,
];

export const DEMO_BAR_BY_FORCE: number[] = [
  0.41, 0.5, 0.37, 0.56, 0.44, 0.48, 0.52, 0.45, 0.6, 0.54, 0.58, 0.62, 0.5, 0.55, 0.6, 0.53, 0.66, 0.7, 0.58, 0.64, 0.56, 0.68, 0.61, 1.02, 1.08, 1.05,
];

export const DEMO_BAR_BY_PRESSURE: number[] = [
  0.38, 0.46, 0.34, 0.52, 0.42, 0.45, 0.48, 0.42, 0.55, 0.5, 0.54, 0.58, 0.47, 0.52, 0.57, 0.49, 0.62, 0.66, 0.54, 0.6, 0.52, 0.64, 0.58, 1.22, 1.34, 1.28,
];
