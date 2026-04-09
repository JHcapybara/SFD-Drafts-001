/**
 * 온보딩 하이라이트 앵커 — DOM 구조가 바뀌어도 이 식별자만 유지되면 스포트라이트가 따라갑니다.
 * 요소에 `data-sfd-onboarding-target="<값>"` 형태로 부착합니다.
 */
export const SFD_ONBOARDING_TARGET_ATTR = 'data-sfd-onboarding-target' as const;

export const SfdOnboardingTarget = {
  libraryDrawingUpload: 'library-drawing-upload',
  librarySectionRobot: 'library-section-robot',
  librarySectionLayout: 'library-section-layout',
  libraryChipCollabRobot: 'library-chip-collab-robot',
  /** 좌측 워크스페이스 패널(라이브러리/트리 등) 전체 */
  leftWorkspaceLibraryPanel: 'left-workspace-library-panel',
  /** Objects 플로팅 모달(카테고리 메뉴 본체) */
  categoryMenuObjectsModal: 'category-menu-objects-modal',
  /** Objects 옆 서브모달(로봇 상세·충돌 편집·모션 등) */
  categoryMenuSubModal: 'category-menu-sub-modal',
  /** 우측 프로퍼티 패널 */
  propertyPanelModal: 'property-panel-modal',
  /** @deprecated 온보딩은 UI 모달을 가리키도록 property/category/left 타깃 사용 */
  workspaceViewport3d: 'workspace-viewport-3d',
  leftGnbLibrary: 'left-gnb-mode-library',
  bottomTimelineDock: 'bottom-timeline-dock',
} as const;

export type SfdOnboardingTargetId = (typeof SfdOnboardingTarget)[keyof typeof SfdOnboardingTarget];

export function onboardingTargetSelector(id: SfdOnboardingTargetId): string {
  return `[${SFD_ONBOARDING_TARGET_ATTR}="${id}"]`;
}
