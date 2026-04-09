/** 분석 패널 — 안전(녹) / 위험(적) / 주의(앰버) 시맨틱 토큰 */

export const ANALYSIS_SAFE = {
  border: 'rgba(34, 197, 94, 0.55)',
  bg: 'rgba(34, 197, 94, 0.08)',
  bgStrong: 'rgba(34, 197, 94, 0.18)',
  bgHover: 'rgba(34, 197, 94, 0.12)',
  ring: 'rgba(34, 197, 94, 0.25)',
  text: '#15803d',
  textStrong: '#166534',
} as const;

export const ANALYSIS_DANGER = {
  border: 'rgba(239, 68, 68, 0.55)',
  bg: 'rgba(239, 68, 68, 0.08)',
  bgStrong: 'rgba(239, 68, 68, 0.18)',
  bgHover: 'rgba(239, 68, 68, 0.12)',
  ring: 'rgba(239, 68, 68, 0.22)',
  text: '#b91c1c',
  textStrong: '#991b1b',
} as const;

export const ANALYSIS_WARN = {
  border: 'rgba(245, 158, 11, 0.5)',
  bg: 'rgba(245, 158, 11, 0.1)',
  bgHover: 'rgba(245, 158, 11, 0.14)',
  text: '#b45309',
  textStrong: '#9a3412',
} as const;
