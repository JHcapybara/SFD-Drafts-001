import type { LucideIcon } from 'lucide-react';

/** 앱 UI 언어 */
export type AppLocale = 'ko' | 'en';

// ── 탭 콘텐츠 종류 ──────────────────────────────
export type TabContentId =
  // 엔드이펙터 그룹
  | 'ee-list'
  | 'ee-conn'
  // 모션 설정
  | 'motion-path'
  | 'motion-speed'
  | 'motion-upload'
  // 충돌 예상 부위
  | 'collision-zone'
  | 'collision-detect'
  // 협동 작업 영역
  | 'collab-workspaces'
  // 셀 트리 연동(설비·안전 조건 등 — property_db 연계 전 스텁)
  | 'tree-context-stub';

// ── 탭 정의 ─────────────────────────────────────
export interface TabDef {
  id: TabContentId;
  label: string;
}

// ── 카테고리 정의 ────────────────────────────────
export interface CategoryDef {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  panelTitle: string;
  panelSubtitle: string;
  tabs: TabDef[];
}

/** Objects 헤더(드래그 영역) 왼쪽 아이콘 — `sfd-icon-2026` 파일 인덱스 매핑용 */
export type WorkspaceObjectGroupKind =
  | 'manipulator'
  | 'mobileRobot'
  | 'mobileManipulator'
  | 'workpiece'
  | 'facility'
  | 'additionalAxis';

/** 상위 로봇/셀 한 대 — Objects 모달 헤더 전용 (목록 항목과 독립) */
export interface ObjectHeaderMeta {
  objectName: string;
  /** CRI: 1.0 미만 안전, 초과 시 위험 */
  cri: number;
  analysis: 'done' | 'pending';
  collaboration: 'on' | 'off';
  tier: 'free' | 'paid';
  /** 미지정 시 매니퓰레이터(033) 아이콘 */
  objectGroupKind?: WorkspaceObjectGroupKind;
}

// ── 객체 타입 정의 ───────────────────────────────
export interface ObjectDef {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  categories: CategoryDef[];
}
