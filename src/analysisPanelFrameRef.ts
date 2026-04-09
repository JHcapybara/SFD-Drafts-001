/**
 * refer/frame6378_analysis_panel_detailed.html · 라이트/다크 공통 키 (와이어 레이아웃용)
 */
export type AnalysisFrameTokens = {
  bgPanel: string;
  bgSecondary: string;
  bgCanvas: string;
  bgInfoTint: string;
  bgInfoRow: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInfo: string;
  textInfoStrong: string;
  dotFail: string;
  dotWarn: string;
  dotPass: string;
  badgeFailBg: string;
  badgeFailFg: string;
  badgeWarnBg: string;
  badgeWarnFg: string;
  badgePassBg: string;
  badgePassFg: string;
  viewBtnBorder: string;
  viewBtnText: string;
  expandBoxBg: string;
  defBoxBg: string;
  defBoxBorderLeft: string;
  criBarTrack: string;
  borderInfo: string;
};

export const ANALYSIS_FRAME_LIGHT: AnalysisFrameTokens = {
  bgPanel: '#ffffff',
  bgSecondary: '#f4f4f5',
  bgCanvas: '#fafafa',
  bgInfoTint: '#e8f4fc',
  bgInfoRow: '#f0f9ff',
  border: 'rgba(0,0,0,0.1)',
  borderSubtle: 'rgba(0,0,0,0.06)',
  textPrimary: '#111111',
  textSecondary: '#525252',
  textTertiary: '#a3a3a3',
  textInfo: '#185fa5',
  textInfoStrong: '#0c447c',
  dotFail: '#e24b4a',
  dotWarn: '#ef9f27',
  dotPass: '#639922',
  badgeFailBg: '#fcebeb',
  badgeFailFg: '#a32d2d',
  badgeWarnBg: '#faeeda',
  badgeWarnFg: '#633806',
  badgePassBg: '#eaf3de',
  badgePassFg: '#27500a',
  viewBtnBorder: 'rgba(24,95,165,0.35)',
  viewBtnText: '#185fa5',
  expandBoxBg: '#f4f4f5',
  defBoxBg: '#f8f8f6',
  defBoxBorderLeft: '#888888',
  criBarTrack: '#efefef',
  borderInfo: 'rgba(24,95,165,0.35)',
};

/** 다크 UI에서 동일 와이어 구조용 (시안 강조·고대비 텍스트) */
export const ANALYSIS_FRAME_DARK: AnalysisFrameTokens = {
  bgPanel: '#171a1f',
  bgSecondary: '#20242c',
  bgCanvas: '#12151a',
  bgInfoTint: 'rgba(56,189,248,0.14)',
  bgInfoRow: 'rgba(56,189,248,0.09)',
  border: 'rgba(255,255,255,0.12)',
  borderSubtle: 'rgba(255,255,255,0.08)',
  textPrimary: '#f4f4f5',
  textSecondary: '#a1a1aa',
  textTertiary: '#71717a',
  textInfo: '#38bdf8',
  textInfoStrong: '#7dd3fc',
  dotFail: '#fb7185',
  dotWarn: '#fbbf24',
  dotPass: '#86efac',
  badgeFailBg: 'rgba(251,113,133,0.16)',
  badgeFailFg: '#fecdd3',
  badgeWarnBg: 'rgba(251,191,36,0.14)',
  badgeWarnFg: '#fde68a',
  badgePassBg: 'rgba(134,239,172,0.12)',
  badgePassFg: '#bbf7d0',
  viewBtnBorder: 'rgba(56,189,248,0.45)',
  viewBtnText: '#7dd3fc',
  expandBoxBg: '#1e2229',
  defBoxBg: '#1a1d24',
  defBoxBorderLeft: '#71717a',
  criBarTrack: '#2a2f38',
  borderInfo: 'rgba(56,189,248,0.42)',
};

export type HazardRowTone = 'fail' | 'warn' | 'pass';
