/**
 * 셀 트리 노드 → Objects / 프로퍼티 패널 선택 상태 매핑
 * (UX: safetydesigner_ux/Cell, Tree/tree (현재) 통합 관리형 구조 기준)
 */

export type CellTreeNodeType =
  | 'cell'
  | 'manipulator'
  | 'gripper'
  | 'zone'
  | 'impact'
  | 'axis'
  | 'mobile'
  | 'motion'
  | 'safety'
  | 'facility';

export type TreePropertyBridgeResult = {
  objectId: string;
  collisionCategoryId?: string;
  motionActiveCategoryId?: 'motion-generate' | 'motion-upload';
  endeffectorActiveCategoryId?: 'ee-basic' | 'ee-connect';
  /** 프로퍼티 패널 부제·스텁 본문에 표시 */
  contextLabel?: string;
};

export function treeNodeToPropertyBridge(node: {
  id: string;
  type: CellTreeNodeType;
  label: string;
}): TreePropertyBridgeResult {
  const { id, type, label } = node;
  const ctx = label;

  if (type === 'facility' || id.startsWith('facility-') || id.startsWith('unassigned-fac-')) {
    return { objectId: 'facility', contextLabel: ctx };
  }

  if (type === 'cell') {
    return { objectId: 'cell', contextLabel: ctx };
  }

  if (
    type === 'safety' ||
    id.startsWith('safety-') ||
    id.startsWith('estop-') ||
    id.startsWith('fence-') ||
    id.startsWith('laser-') ||
    id.startsWith('light-') ||
    id.startsWith('mat-') ||
    id.startsWith('lidar-')
  ) {
    return { objectId: 'cell', contextLabel: ctx };
  }

  if (type === 'motion' || id === 'motion-file') {
    return { objectId: 'motion', motionActiveCategoryId: 'motion-upload', contextLabel: ctx };
  }

  if (type === 'gripper' || id === 'gripper' || id.startsWith('gripper-')) {
    return { objectId: 'endeffector', endeffectorActiveCategoryId: 'ee-basic', contextLabel: ctx };
  }

  if (id === 'zone-collab') {
    return { objectId: 'collab', contextLabel: ctx };
  }

  if (type === 'zone') {
    return { objectId: 'collision', collisionCategoryId: 'collision-robot', contextLabel: ctx };
  }

  if (type === 'impact') {
    if (id.includes('gripper') || id.startsWith('impact-g')) {
      return { objectId: 'collision', collisionCategoryId: 'collision-endeffector', contextLabel: ctx };
    }
    if (id.includes('axis')) {
      return { objectId: 'collision', collisionCategoryId: 'collision-additional-axis', contextLabel: ctx };
    }
    return { objectId: 'collision', collisionCategoryId: 'collision-robot', contextLabel: ctx };
  }

  if (type === 'axis') {
    return { objectId: 'manipulator', contextLabel: ctx };
  }

  if (type === 'manipulator' || type === 'mobile') {
    return { objectId: 'manipulator', contextLabel: ctx };
  }

  return { objectId: 'manipulator', contextLabel: ctx };
}
