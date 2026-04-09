/** WorkspaceChrome `LeftMode` 와 동일 — 순환 참조 방지용 복제 */
export type OnboardingLeftGnbMode = 'library' | 'tree' | 'analysis' | 'riskassessment' | 'safetyai';

/**
 * 온보딩 Play 시 관련 패널·모달을 자동으로 맞추기 위한 명령.
 * WorkspaceChrome이 좌측 GNB/라이브러리, App이 객체·충돌·모션 등을 처리합니다.
 */
export type OnboardingOpenAppAction =
  | { kind: 'library' }
  | { kind: 'left-gnb-mode'; mode: OnboardingLeftGnbMode }
  | { kind: 'select-object'; objectId: string }
  | { kind: 'collision-category'; categoryId: string }
  /** 충돌 > 엔드이펙터 + 첫 그룹의 첫 충돌예상부위 선택 → 서브모달(그리퍼 등) 연동 */
  | { kind: 'collision-eef-first-area'; areaId?: string }
  | { kind: 'motion-category'; categoryId: string }
  | { kind: 'bump-submodal' }
  /** 하단 타임라인 도킹 영역 펼침 (WorkspaceChrome) */
  | { kind: 'timeline-dock' }
  /** 하단 도크만 펼침 — 좌측 모드가 analysis면 타임라인 effect와 함께 분석 탭 유지 (WorkspaceChrome) */
  | { kind: 'bottom-dock-open' };
