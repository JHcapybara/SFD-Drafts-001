import type { OnboardingOpenAppAction } from './onboardingAppActions';
import { TUTORIAL_KO_KR } from './data/tutorialKoKr';
import { SfdOnboardingTarget, type SfdOnboardingTargetId } from './sfd/sfdOnboardingTargets';

export type OnboardingTabId =
  | 'robot-design'
  | 'cell-safety'
  | 'analysis-conditions'
  | 'risk-assessment';

export type OnboardingGuideStep = {
  id: string;
  tabId: OnboardingTabId;
  labelKo: string;
  labelEn: string;
  spotlightTarget?: SfdOnboardingTargetId;
  titleKo: string;
  titleEn: string;
  bodyKo: string;
  bodyEn: string;
  openAppActions?: OnboardingOpenAppAction[];
};

export type OnboardingTabIntro = {
  headingKo: string;
  headingEn: string;
  subKo: string;
  subEn: string;
};

type TutKey = keyof typeof TUTORIAL_KO_KR;

/** ko_KR 튜토리얼 JSON의 title/content + 영문 요약 */
function copyFromTutorial(
  id: TutKey,
  en: { label: string; body: string },
): Pick<OnboardingGuideStep, 'labelKo' | 'labelEn' | 'titleKo' | 'titleEn' | 'bodyKo' | 'bodyEn'> {
  const k = TUTORIAL_KO_KR[id];
  return {
    labelKo: k.title,
    labelEn: en.label,
    titleKo: k.title,
    titleEn: en.label,
    bodyKo: k.content,
    bodyEn: en.body,
  };
}

/** 튜토리얼 본문은 그대로, 목록 라벨만 별도(와이어프레임 단계명 등) */
function copyFromTutorialWithLabel(
  id: TutKey,
  labelKo: string,
  en: { label: string; body: string },
): Pick<OnboardingGuideStep, 'labelKo' | 'labelEn' | 'titleKo' | 'titleEn' | 'bodyKo' | 'bodyEn'> {
  const k = TUTORIAL_KO_KR[id];
  return {
    labelKo,
    labelEn: en.label,
    titleKo: k.title,
    titleEn: en.label,
    bodyKo: k.content,
    bodyEn: en.body,
  };
}

export const ONBOARDING_TAB_ORDER: OnboardingTabId[] = [
  'robot-design',
  'cell-safety',
  'analysis-conditions',
  'risk-assessment',
];

export const ONBOARDING_TAB_LABELS: Record<OnboardingTabId, { ko: string; en: string }> = {
  'robot-design': { ko: '로봇 시스템 설계', en: 'Robot system design' },
  'cell-safety': { ko: '셀 안전 진단', en: 'Cell safety diagnosis' },
  'analysis-conditions': { ko: '분석 조건 설정', en: 'Analysis conditions' },
  'risk-assessment': { ko: '위험성 평가', en: 'Risk assessment' },
};

export const ONBOARDING_TAB_INTROS: Record<OnboardingTabId, OnboardingTabIntro> = {
  'robot-design': {
    headingKo: '로봇 시스템 설계가 처음이신가요?',
    headingEn: 'New to robot system design?',
    subKo:
      '마우스·키보드로 3D 화면을 조작할 수 있습니다. 도면 업로드, 라이브러리 설치, 로봇·그리퍼 배치, 모션까지 단계별로 안내합니다.',
    subEn:
      'Use mouse and keyboard to work in 3D. Follow the steps from drawings and the library to robots, grippers, and motion.',
  },
  'cell-safety': {
    headingKo: '셀 안전 진단이 처음이신가요?',
    headingEn: 'New to cell safety diagnosis?',
    subKo:
      '3D에 로봇·설비를 배치하고, 충돌 예상 부위·협동 작업 공간을 설정한 뒤 분석을 실행하고 결과·보고서를 확인해 보세요.',
    subEn:
      'Place equipment in 3D, set collision areas and collaborative space, run analysis, then review results and reports.',
  },
  'analysis-conditions': {
    headingKo: '분석 조건 설정이 처음이신가요?',
    headingEn: 'New to analysis conditions?',
    subKo:
      '충돌 예상 부위와 협동 작업 공간을 설정한 뒤, 분석 옵션을 선택해 실행하고 분석 결과 화면으로 이동합니다.',
    subEn:
      'Configure collision areas and collaborative workspace, choose analysis options, run, then open the results view.',
  },
  'risk-assessment': {
    headingKo: '위험성 평가·보고·협업이 처음이신가요?',
    headingEn: 'New to risk assessment and reports?',
    subKo:
      '유료 플랜·보고서를 검토하고, 충돌 안전 분석·타임라인·공정 공유 등 연계 기능을 단계별로 살펴보세요.',
    subEn:
      'Review plans and reports, then explore collision analysis, timeline playback, and process sharing.',
  },
};

export const ONBOARDING_GUIDE_STEPS: OnboardingGuideStep[] = [
  // ── 로봇 시스템 설계 (tutorial_app.json APP-TTP-03-xx)
  {
    id: 'drawing-upload',
    tabId: 'robot-design',
    ...copyFromTutorial('APP-TTP-03-08', {
      label: '(Optional) Upload drawing',
      body:
        'Upload a drawing image to place it on the design grid (floor). Supported formats: PNG, JPG. If you already have a drawing, upload it before placing equipment.',
    }),
    spotlightTarget: SfdOnboardingTarget.libraryDrawingUpload,
    openAppActions: [{ kind: 'library' }],
  },
  {
    id: 'library-layout',
    tabId: 'robot-design',
    ...copyFromTutorial('APP-TTP-03-09', {
      label: '(Optional) Library · Facilities & workers',
      body:
        'Use the registered library for finer process design. Install equipment, workers, and safety devices, then adjust dimensions to match your layout.',
    }),
    spotlightTarget: SfdOnboardingTarget.librarySectionLayout,
    openAppActions: [{ kind: 'library' }],
  },
  {
    id: 'collab-robot',
    tabId: 'robot-design',
    ...copyFromTutorial('APP-TTP-03-01', {
      label: 'Place a robot in the 3D view',
      body:
        'Select a registered robot and place it in the 3D view. If your robot is missing from the library, contact us to have it added.',
    }),
    spotlightTarget: SfdOnboardingTarget.libraryChipCollabRobot,
    openAppActions: [{ kind: 'library' }],
  },
  {
    id: 'viewport-place',
    tabId: 'robot-design',
    ...copyFromTutorial('APP-TTP-03-02', {
      label: 'Install a gripper on the robot',
      body:
        'Collaborative and industrial robots can use a gripper (end effector). Pick one from the gripper library or use + to upload your own model.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'select-object', objectId: 'endeffector' }, { kind: 'bump-submodal' }],
  },
  {
    id: 'motion',
    tabId: 'robot-design',
    ...copyFromTutorial('APP-TTP-03-03', {
      label: 'Upload or generate motion',
      body:
        'Apply motion by uploading a file or creating waypoints. Some robots only support upload. Hand-guiding lets you drag the robot; Enter adds a waypoint at the current pose.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [
      { kind: 'select-object', objectId: 'motion' },
      { kind: 'motion-category', categoryId: 'motion-generate' },
      { kind: 'bump-submodal' },
    ],
  },

  // ── 셀 안전 진단
  {
    id: 'cell-install-3d',
    tabId: 'cell-safety',
    ...copyFromTutorial('APP-TTP-03-01', {
      label: 'Place robots & equipment in 3D',
      body:
        'Select a registered robot and place it in the 3D view. If your robot is missing from the library, contact us to have it added.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'library' }],
  },
  {
    id: 'cell-range',
    tabId: 'cell-safety',
    ...copyFromTutorialWithLabel(
      'APP-TTP-03-05',
      '셀 범위를 지정하세요.',
      {
        label: 'Define the cell / collaborative zone',
        body:
          'In collaborative (PFL) mode, create and edit the zone where the robot works with people. Assign it to the robot and set worker stance and clothing thickness for realistic analysis.',
      },
    ),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'select-object', objectId: 'collab' }, { kind: 'bump-submodal' }],
  },
  {
    id: 'cell-safety-input',
    tabId: 'cell-safety',
    ...copyFromTutorial('APP-TTP-03-04', {
      label: 'Add & configure collision areas',
      body:
        'Two kinds exist: gripper collision areas and robot-body areas. Configure up to 50 gripper points; robot body areas are preset with optional soft cover or exclusions.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'collision-eef-first-area' }],
  },
  {
    id: 'cell-options-run',
    tabId: 'cell-safety',
    ...copyFromTutorial('APP-TTP-03-06', {
      label: 'Select options and run analysis',
      body:
        'When all items are set, robot menu icons light orange—then run collision safety analysis. Recommended speed balances safety and productivity. Tip: disable video for faster first runs; use 0.1 s interval for report export.',
    }),
    spotlightTarget: SfdOnboardingTarget.bottomTimelineDock,
    openAppActions: [
      { kind: 'select-object', objectId: 'collision' },
      { kind: 'collision-category', categoryId: 'collision-robot' },
      { kind: 'timeline-dock' },
      { kind: 'bump-submodal' },
    ],
  },
  {
    id: 'cell-risk-field',
    tabId: 'cell-safety',
    ...copyFromTutorial('APP-TTP-03-07', {
      label: 'Go to analysis results',
      body:
        'When analysis finishes, select the robot to enable the analysis result button and open the results screen.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'riskassessment' }],
  },
  {
    id: 'cell-report',
    tabId: 'cell-safety',
    ...copyFromTutorial('APP-TTP-04-01', {
      label: 'View / download report sample',
      body:
        'If you are on Partner plan or higher, you can download a sample of the collision safety analysis report.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'analysis' }],
  },

  // ── 분석 조건 설정
  {
    id: 'analysis-collision',
    tabId: 'analysis-conditions',
    ...copyFromTutorial('APP-TTP-03-04', {
      label: 'Add & configure collision areas',
      body:
        'Two kinds exist: gripper collision areas and robot-body areas. Configure up to 50 gripper points; robot body areas are preset with optional soft cover or exclusions.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'collision-eef-first-area' }],
  },
  {
    id: 'analysis-collab-space',
    tabId: 'analysis-conditions',
    ...copyFromTutorial('APP-TTP-03-05', {
      label: 'Create collaborative workspace',
      body:
          'In collaborative (PFL) mode, create and edit the zone where the robot works with people. Assign it to the robot and set worker stance and clothing thickness for realistic analysis.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [
      { kind: 'select-object', objectId: 'collab' },
      { kind: 'bump-submodal' },
    ],
  },
  {
    id: 'analysis-run',
    tabId: 'analysis-conditions',
    ...copyFromTutorial('APP-TTP-03-06', {
      label: 'Select options and run analysis',
      body:
        'When all items are set, robot menu icons light orange—then run collision safety analysis. Recommended speed balances safety and productivity. Tip: disable video for faster first runs; use 0.1 s interval for report export.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'analysis' }, { kind: 'bottom-dock-open' }],
  },
  {
    id: 'analysis-result',
    tabId: 'analysis-conditions',
    ...copyFromTutorial('APP-TTP-03-07', {
      label: 'Open analysis results',
      body:
        'When analysis finishes, select the robot to enable the analysis result button and open the results screen.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'analysis' }],
  },

  // ── 위험성 평가 (analysis.json + 기능 문구 병행)
  {
    id: 'risk-scope',
    tabId: 'risk-assessment',
    ...copyFromTutorial('APP-TTP-04-02', {
      label: 'Review paid plans',
      body:
        'Review paid plans for risk assessment reports, collision safety analysis reports, and tailored services.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'riskassessment' }],
  },
  {
    id: 'risk-hazard-id',
    tabId: 'risk-assessment',
    ...copyFromTutorial('APP-TTP-03-04', {
      label: 'Collision areas (hazard identification)',
      body:
        'Two kinds exist: gripper collision areas and robot-body areas. Configure up to 50 gripper points; robot body areas are preset with optional soft cover or exclusions.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'select-object', objectId: 'collision' }, { kind: 'bump-submodal' }],
  },
  {
    id: 'risk-rating',
    tabId: 'risk-assessment',
    ...copyFromTutorial('APP-TTP-03-06', {
      label: 'Analysis options & severity',
      body:
        'When all items are set, robot menu icons light orange—then run collision safety analysis. Recommended speed balances safety and productivity.',
    }),
    spotlightTarget: SfdOnboardingTarget.propertyPanelModal,
    openAppActions: [{ kind: 'select-object', objectId: 'collision' }, { kind: 'collision-category', categoryId: 'collision-robot' }],
  },
  {
    id: 'risk-measures',
    tabId: 'risk-assessment',
    ...copyFromTutorial('APP-CTM-001-04', {
      label: 'Motion playback (timeline)',
      body:
        'Use the timeline to review motion over time across the process. Set per-robot analysis ranges and risk level for richer results.',
    }),
    spotlightTarget: SfdOnboardingTarget.bottomTimelineDock,
    openAppActions: [{ kind: 'timeline-dock' }],
  },
  {
    id: 'risk-report-signoff',
    tabId: 'risk-assessment',
    ...copyFromTutorial('APP-TTP-04-03', {
      label: 'Share process with others',
      body:
        'Share your process easily. Recipients open it from email or Project > Shared processes and can see layout and analyzed robot CRI values.',
    }),
    spotlightTarget: SfdOnboardingTarget.leftWorkspaceLibraryPanel,
    openAppActions: [{ kind: 'left-gnb-mode', mode: 'analysis' }],
  },
];

export function stepsForTab(tabId: OnboardingTabId): OnboardingGuideStep[] {
  return ONBOARDING_GUIDE_STEPS.filter((s) => s.tabId === tabId);
}
