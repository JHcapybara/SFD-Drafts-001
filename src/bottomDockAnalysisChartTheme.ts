/**
 * 하단 패널 분석 차트 — PropertyPanel `Tokens`·포인트 컬러와 정합
 */
import type { Tokens } from './PropertyPanel';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

export type AnalysisChartTheme = {
  chartSurface: string;
  plotBackground: string;
  axisPrimary: string;
  axisMuted: string;
  gridMajor: string;
  gridMinor: string;
  dataLine: string;
  safetyLine: string;
  thresholdLine: string;
  currentSpeedLine: string;
  barFill: string;
  barValue: string;
  baseBar: string;
  sectionTitle: string;
  sectionSubtitle: string;
  /** 카드 래퍼 (인풋·섹션과 동일 계열) */
  cardBorder: string;
  cardShadow: string;
  tabBarBg: string;
  tabActiveBg: string;
  tabActiveFg: string;
  tabInactiveFg: string;
  accent: string;
};

export function getAnalysisChartTheme(t: Tokens, isDark: boolean): AnalysisChartTheme {
  const threshold = isDark ? '#fb7185' : '#e11d48';
  const safety = isDark ? '#34d399' : '#059669';
  const baseBar = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';

  return {
    chartSurface: t.inputBg,
    plotBackground: t.inputReadonlyBg,
    axisPrimary: t.textPrimary,
    axisMuted: t.textSecondary,
    gridMajor: t.inputBorder,
    gridMinor: t.divider,
    dataLine: POINT_ORANGE,
    safetyLine: safety,
    thresholdLine: threshold,
    currentSpeedLine: POINT_ORANGE,
    barFill: accentRgba(POINT_ORANGE, isDark ? 0.92 : 0.95),
    barValue: t.textPrimary,
    baseBar,
    sectionTitle: t.textPrimary,
    sectionSubtitle: t.textSecondary,
    cardBorder: t.inputBorder,
    cardShadow: t.elevationRaised,
    tabBarBg: t.tabBarBg,
    tabActiveBg: t.tabActiveBg,
    tabActiveFg: POINT_ORANGE,
    tabInactiveFg: t.textSecondary,
    accent: POINT_ORANGE,
  };
}
