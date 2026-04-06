import type { WorkspaceObjectGroupKind } from '../types';

/** Objects 모달 헤더(그립 옆) — 객체 그룹별 아이콘 인덱스 */
export const WORKSPACE_OBJECT_GROUP_ICON_INDEX: Record<WorkspaceObjectGroupKind, number> = {
  manipulator: 33,
  mobileRobot: 38,
  mobileManipulator: 37,
  workpiece: 133,
  facility: 89,
  additionalAxis: 123,
};

export function workspaceHeaderIconIndex(kind: WorkspaceObjectGroupKind | undefined): number {
  return WORKSPACE_OBJECT_GROUP_ICON_INDEX[kind ?? 'manipulator'];
}
