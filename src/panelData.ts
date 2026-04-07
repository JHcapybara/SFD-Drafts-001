/** 모션 시퀀스에 추가된 한 줄 */
export interface MotionUploadWaypoint {
  id: string;
  waypointIndex: number;
  /** 예: 00:05.00 */
  timecode: string;
  /** 업로드 소스에 있으면 서브모달 조회 전용으로 표시 */
  moveVariant?: 'MoveL' | 'MoveJ';
  moveSpeedBasis?: 'time' | 'speed';
  moveJ_angularSpeedDegSec?: string;
  moveJ_angularAccelDegSec2?: string;
  moveL_linearSpeedMmSec?: string;
  moveL_linearAccelMmSec2?: string;
}

/** 타임코드 문자열 → 초 (예: 00:02.00, 01:03.70) */
export function parseUploadTimecodeToSeconds(tc: string): number {
  const t = tc.trim();
  const colon = t.indexOf(':');
  if (colon < 0) return 0;
  const min = parseInt(t.slice(0, colon), 10) || 0;
  const rest = t.slice(colon + 1);
  const dot = rest.indexOf('.');
  const sec = dot >= 0 ? parseInt(rest.slice(0, dot), 10) || 0 : parseInt(rest, 10) || 0;
  const frac = dot >= 0 ? parseInt((rest.slice(dot + 1) + '00').slice(0, 2), 10) / 100 : 0;
  return min * 60 + sec + frac;
}

export function formatUploadDurationSecDisplay(total: number): string {
  if (Number.isInteger(total)) return String(total);
  return total.toFixed(1);
}

export interface MotionUploadFileGroup {
  id: string;
  fileName: string;
  expanded: boolean;
  waypoints: MotionUploadWaypoint[];
}

/** 한 업로드 파일 그룹의 웨이포인트 타임코드 합(모션 시간 표시용) */
export function sumMotionUploadGroupDurationSec(g: MotionUploadFileGroup): number {
  return g.waypoints.reduce((acc, w) => acc + parseUploadTimecodeToSeconds(w.timecode), 0);
}

/** 패널 푸터 등: 전체 업로드 그룹 합계 */
export function sumAllUploadGroupsDurationSec(groups: MotionUploadFileGroup[]): number {
  return groups.reduce((acc, g) => acc + sumMotionUploadGroupDurationSec(g), 0);
}

/** 모션 행별 TCP (mm / deg) */
export type MotionTcpPos = { x: string; y: string; z: string };
export type MotionTcpRot = { rx: string; ry: string; rz: string };

/** 서브모달 조인트 슬라이더 축 수 (기본 6축) */
export const MOTION_JOINT_COUNT = 6;

export interface MotionSeqItem {
  id: string;
  kind: 'move' | 'stop';
  moveVariant?: 'MoveL' | 'MoveJ';
  /** 소요 시간(초), UI에 "3s" 형식으로 표시 · 이동+시간 기준일 때 모션 시간 */
  durationSec?: string;
  /** 참고 UI: 일부 Waypoint에 가시성 아이콘 */
  showVisibilityIcon?: boolean;
  /** 이동 모션: 시간 기준 / 속도 기준 (항목별 저장) */
  moveSpeedBasis?: 'time' | 'speed';
  moveJ_angularSpeedDegSec?: string;
  moveJ_angularAccelDegSec2?: string;
  moveL_linearSpeedMmSec?: string;
  moveL_linearAccelMmSec2?: string;
  tcpPos?: MotionTcpPos;
  tcpRot?: MotionTcpRot;
  /** 조인트별 각도(deg), 길이 MOTION_JOINT_COUNT */
  jointAnglesDeg?: string[];
}

export interface ManipLinkedRow {
  name: string;
  model: string;
  kind: string;
}

/** 매니퓰레이터 연결 정보 탭 — 카테고리별 영역, 비어 있으면 UI에서 NONE 표시 */
export interface ManipConnectionLinks {
  controller: ManipLinkedRow | null;
  auxiliaryAxes: ManipLinkedRow[];
  cell: ManipLinkedRow | null;
  emergencyStop: ManipLinkedRow | null;
  /** 최대 5개까지 */
  grippers: ManipLinkedRow[];
}

export const EMPTY_MANIP_CONN_LINKS: ManipConnectionLinks = {
  controller: null,
  auxiliaryAxes: [],
  cell: null,
  emergencyStop: null,
  grippers: [],
};

/** 서브모달: 기본 형상 프리미티브 */
export type CollisionPrimitive = 'cube' | 'cylinder' | 'halfSphere' | 'corner';

/** 충돌 예상 부위 고급 형상·자세 (카테고리 서브모달) */
export interface CollisionShapeSettings {
  primitive: CollisionPrimitive;
  /** 큐브·코너 등 한 변/대표 길이 (mm) */
  sizeMm: string;
  radiusMm: string;
  heightMm: string;
  filletMm: string;
  posX: string;
  posY: string;
  posZ: string;
  rotRx: string;
  rotRy: string;
  rotRz: string;
  gripperGenerate: boolean;
  gripperVertices: boolean;
  gripperWireframe: boolean;
  gripperEnlarge: boolean;
  softCover: boolean;
  softCoverSafetyRec: boolean;
}

export const COLLISION_SHAPE_DEFAULTS: CollisionShapeSettings = {
  primitive: 'cylinder',
  sizeMm: '20',
  radiusMm: '10',
  heightMm: '10',
  filletMm: '3',
  posX: '0',
  posY: '0',
  posZ: '0',
  rotRx: '0',
  rotRy: '0',
  rotRz: '0',
  gripperGenerate: true,
  gripperVertices: false,
  gripperWireframe: false,
  gripperEnlarge: true,
  softCover: false,
  softCoverSafetyRec: true,
};

/** 충돌 예상 부위 생성 리스트 항목 */
export interface CollisionExpectedAreaItem {
  id: string;
  label: string;
  shape: 'box' | 'cylinder';
  /** 가시성(눈 아이콘) */
  visible?: boolean;
  /** 리스트 항목별 형상 설정(비어 있으면 collisionShapeDefaults 사용) */
  shapeDetail?: Partial<CollisionShapeSettings>;
}

/** 충돌(로봇·EE·부가축·작업물) — 엔티티 한 줄 + 해당 엔티티 전용 충돌 예상 부위 */
export interface CollisionEntityListItem {
  id: string;
  objectName: string;
  /** 예: IRB 6700 · ABB */
  subtitle: string;
  expectedAreas: CollisionExpectedAreaItem[];
}

/** @deprecated CollisionEntityListItem 사용 */
export type CollisionRobotListItem = CollisionEntityListItem;

export function mergeCollisionShapeSettings(
  defaults: CollisionShapeSettings,
  item: CollisionExpectedAreaItem | null | undefined,
): CollisionShapeSettings {
  if (!item?.shapeDetail) return defaults;
  return { ...defaults, ...item.shapeDetail };
}

export interface EeSlot {
  objectName: string;
  name: string;
  modelFileName: string;
  type: string;
  mass: string;
  makerLabel?: string;
  source?: 'catalog' | 'custom';
  tcpPos: { x: string; y: string; z: string };
  tcpRot: { rx: string; ry: string; rz: string };
  eeSize: { w: string; d: string; h: string };
  eeOuterDiam: string;
  eeCom: { cx: string; cy: string; cz: string };
  eeAutoCom: boolean;
  linkedItems: ManipLinkedRow[];
}

/** 매니퓰레이터 스펙 — 로봇 유형 (도메인 상수) */
export const MANIP_ROBOT_TYPES = ['MANIPULATOR', 'MOBILE', 'MOBILE_MANIPULATOR', 'DUAL_ARM'] as const;
export type ManipRobotType = (typeof MANIP_ROBOT_TYPES)[number];
export const MANIP_COLLAB_MODES = ['PFL', 'SSM', 'SRS', 'HGG'] as const;
export type ManipCollabMode = (typeof MANIP_COLLAB_MODES)[number];

/** 프로퍼티·서브레이어에서 로봇별로 나뉘는 매니퓰레이터 필드 */
export interface ManipRobotItem {
  manipObjectName: string;
  manipRobotType: ManipRobotType;
  manipModel: string;
  manipMaker: string;
  manipPayload: string;
  manipReach: string;
  manipJointCount: string;
  manipCurrentLoadWeight: string;
  manipCollaboration: boolean;
  manipCollaborationMode: ManipCollabMode;
  position: { x: string; y: string; z: string };
  rotation: { rx: string; ry: string; rz: string };
  size: { w: string; d: string; h: string };
  mass: string;
  autoCoM: boolean;
  centerOfMass: { cx: string; cy: string; cz: string };
  safetyPl: string;
  safetyCategory: string;
  safetySil: string;
  certStatus: string;
  safetyStopTime: string;
  safetyTcpLimit: string;
  safetyLogicApplied: boolean;
  safetyMonitoringStatus: string;
  safetyLastVerified: string;
  stopTsMs: string;
  stopSsMm: string;
  responseDelayMs: string;
  responseDelayLocked: boolean;
  manipConnLinks: ManipConnectionLinks;
}

export interface PanelData {
  manipRobots: ManipRobotItem[];
  /** `manipRobots` 인덱스 */
  manipSelectedRobotIdx: number;
  eeSlots: (EeSlot | null)[];
  pathType: string; blendRadius: string;
  maxSpeed: string; acceleration: string; jerk: string;
  /** 카테고리 서브모달: 이동 모션 추가 기본값 */
  motionAddMoveVariant: 'MoveL' | 'MoveJ';
  motionAddSpeedBasis: 'time' | 'speed';
  motionAddTimeSec: string;
  motionAddMoveJ_angularSpeedDegSec: string;
  motionAddMoveJ_angularAccelDegSec2: string;
  motionAddMoveL_linearSpeedMmSec: string;
  motionAddMoveL_linearAccelMmSec2: string;
  /** 카테고리 서브모달: 정지 모션 추가 기본값 (sec) */
  motionAddStopSec: string;
  /** 새 이동 행·기본값용 TCP */
  motionAddTcpPos: MotionTcpPos;
  motionAddTcpRot: MotionTcpRot;
  /** 새 이동 행·기본값용 조인트 각도(deg) */
  motionAddJointAnglesDeg: string[];
  zoneShape: string; zoneRadius: string; zoneHeight: string;
  sensitivity: string; responseType: string;
  areaWidth: string; areaDepth: string; areaHeight: string;
  pflEnabled: boolean; ssmEnabled: boolean; minSepDist: string; safeSpeed: string;
  /** 업로드 모션: 파일별 트리 + 웨이포인트 */
  motionUploadFileGroups: MotionUploadFileGroup[];
  motionSequenceItems: MotionSeqItem[];
  handGuidingMode: boolean;
  /** 모션 푸터: Tool-Change 모드(표시/후속 연동용) */
  toolChangeMode: boolean;
  /** 충돌 > 로봇: 로봇별 충돌 예상 부위 */
  collisionRobotList: CollisionEntityListItem[];
  collisionSelectedRobotIdx: number | null;
  /** 충돌 > 엔드 이펙터 */
  collisionEndEffectorList: CollisionEntityListItem[];
  collisionEndEffectorSelectedIdx: number | null;
  /** 충돌 > 부가축 */
  collisionAdditionalAxisList: CollisionEntityListItem[];
  collisionAdditionalAxisSelectedIdx: number | null;
  /** 충돌 > 작업대상물 */
  collisionWorkpieceList: CollisionEntityListItem[];
  collisionWorkpieceSelectedIdx: number | null;
  /** 현재 카테고리·선택 엔티티 기준 선택된 충돌 예상 부위 id */
  selectedCollisionAreaId: string | null;
  /** 로봇 탭: 연속 생성 모드 */
  collisionContinuousGenerationMode: boolean;
  /** 충돌 서브모달 — 리스트 미선택 시 편집하는 기본 형상 */
  collisionShapeDefaults: CollisionShapeSettings;

  /** 협동 작업 영역 — 패널 상단「기본값」(신규 생성 시 복사) */
  collabCreationDefaults: CollabCreationDefaults;
  /** 생성된 협동작업공간 전체 */
  collabWorkspaces: CollabWorkspaceItem[];
  /** 현재 선택 로봇 그룹에 할당된 공간 id */
  collabAssignedWorkspaceIds: string[];
  /** 목록에서 포커스된 공간 id */
  collabSelectedWorkspaceId: string | null;
  /** 협동 작업 영역 편집 모달 대상 id (null이면 미편집) */
  collabEditingWorkspaceId: string | null;
}

/** 협동작업공간 — 신규 생성에 쓰는 기본값 블록 */
export interface CollabCreationDefaults {
  posX: string;
  posY: string;
  widthMm: string;
  heightMm: string;
  bodyPartId: string;
  clothingThickness: boolean;
  workerDirection: boolean;
}

/** 협동작업공간 한 개 */
export interface CollabWorkspaceItem {
  id: string;
  name: string;
  posX: string;
  posY: string;
  widthMm: string;
  heightMm: string;
  bodyPartId: string;
  clothingThickness: boolean;
  workerDirection: boolean;
  /** 3D 표시 색 (hex) */
  colorHex: string;
  /** 불투명도 0–100 */
  opacityPercent: number;
  /** 공유된 로봇 이름 (예: COBOT3) */
  sharedRobotIds: string[];
  /** 뷰포 가시성 */
  visible: boolean;
}

export const COLLAB_BODY_PART_OPTIONS: { id: string; labelKo: string; labelEn: string }[] = [
  { id: 'hand-palm-d', labelKo: '손(손바닥 D)', labelEn: 'Hand (palm D)' },
  { id: 'chest-sternum', labelKo: '가슴(흉골)', labelEn: 'Chest (sternum)' },
  { id: 'upper-arm-del', labelKo: '상완(삼각근)', labelEn: 'Upper arm (deltoid)' },
  { id: 'forearm', labelKo: '전완(전완근)', labelEn: 'Forearm' },
  { id: 'thigh-quad', labelKo: '대퇴(대퇴근)', labelEn: 'Thigh (quadriceps)' },
];

/** 협동 신체 부위 — `sfd-icon-2026` 파일명 인덱스 */
export const COLLAB_BODY_PART_ICON_INDEX: Record<(typeof COLLAB_BODY_PART_OPTIONS)[number]['id'], number> = {
  'hand-palm-d': 119,
  'chest-sternum': 115,
  'upper-arm-del': 118,
  forearm: 113,
  'thigh-quad': 116,
};

/** 충돌 예상 부위 리스트(슬롯) — box=큐브, cylinder=원기둥 에셋 */
export const COLLISION_EXPECTED_AREA_SHAPE_ICON_INDEX: Record<'box' | 'cylinder', number> = {
  box: 95,
  cylinder: 96,
};

/** 편집 모달 로봇 체크박스 목록 (스크롤로 전체 탐색) */
export const COLLAB_ROBOT_NAMES = [
  'COBOT1',
  'COBOT2',
  'COBOT3',
  'COBOT4',
  'COBOT5',
  'COBOT6',
  'COBOT7',
  'COBOT8',
  'COBOT9',
  'COBOT10',
] as const;

export function collabBodyPartLabel(id: string, locale: 'ko' | 'en'): string {
  const o = COLLAB_BODY_PART_OPTIONS.find((x) => x.id === id);
  if (!o) return id;
  return locale === 'en' ? o.labelEn : o.labelKo;
}

export function createCollabWorkspaceFromDefaults(
  p: PanelData,
  newId: string,
  name: string,
): CollabWorkspaceItem {
  const d = p.collabCreationDefaults;
  return {
    id: newId,
    name,
    posX: d.posX,
    posY: d.posY,
    widthMm: d.widthMm,
    heightMm: d.heightMm,
    bodyPartId: d.bodyPartId,
    clothingThickness: d.clothingThickness,
    workerDirection: d.workerDirection,
    colorHex: '#8b5cf6',
    opacityPercent: 40,
    sharedRobotIds: [],
    visible: true,
  };
}

/** 충돌 UI 하위 카테고리 (로봇 / EE / 부가축 / 작업물) */
export type CollisionCategoryId =
  | 'collision-robot'
  | 'collision-endeffector'
  | 'collision-additional-axis'
  | 'collision-workpiece';

/** 충돌 엔티티 리스트 / 선택 인덱스 필드 매핑 */
export const COLLISION_CATEGORY_KEYS: Record<
  CollisionCategoryId,
  {
    listKey: keyof Pick<
      PanelData,
      | 'collisionRobotList'
      | 'collisionEndEffectorList'
      | 'collisionAdditionalAxisList'
      | 'collisionWorkpieceList'
    >;
    idxKey: keyof Pick<
      PanelData,
      | 'collisionSelectedRobotIdx'
      | 'collisionEndEffectorSelectedIdx'
      | 'collisionAdditionalAxisSelectedIdx'
      | 'collisionWorkpieceSelectedIdx'
    >;
  }
> = {
  'collision-robot': { listKey: 'collisionRobotList', idxKey: 'collisionSelectedRobotIdx' },
  'collision-endeffector': { listKey: 'collisionEndEffectorList', idxKey: 'collisionEndEffectorSelectedIdx' },
  'collision-additional-axis': { listKey: 'collisionAdditionalAxisList', idxKey: 'collisionAdditionalAxisSelectedIdx' },
  'collision-workpiece': { listKey: 'collisionWorkpieceList', idxKey: 'collisionWorkpieceSelectedIdx' },
};

/** 충돌 예상 부위 한 줄 추가 (선택된 엔티티 기준, 이름 번호 자동) */
export function appendCollisionExpectedArea(
  p: PanelData,
  locale: 'ko' | 'en' = 'ko',
  cat: CollisionCategoryId = 'collision-robot',
): PanelData {
  const { listKey, idxKey } = COLLISION_CATEGORY_KEYS[cat];
  const idx = p[idxKey] as number | null;
  if (idx === null || idx < 0) return p;
  const list = p[listKey] as CollisionEntityListItem[];
  const ent = list[idx];
  if (!ent) return p;

  let maxSuffix = 0;
  for (const a of ent.expectedAreas) {
    const m = a.label.match(/(\d+)\s*$/);
    if (m) maxSuffix = Math.max(maxSuffix, parseInt(m[1], 10));
  }
  const n = maxSuffix + 1;
  const id = `ca-${Date.now()}`;
  const label = locale === 'en' ? `Expected area ${n}` : `충돌예상부위${n}`;
  const item: CollisionExpectedAreaItem = {
    id,
    label,
    shape: 'box',
    visible: true,
  };
  const newList = [...list];
  newList[idx] = { ...ent, expectedAreas: [...ent.expectedAreas, item] };
  return { ...p, [listKey]: newList, selectedCollisionAreaId: id };
}

/** 패널「모션 생성 기본값」을 복사해 새 이동 행 생성 */
export function createMotionSeqItemMove(
  p: Pick<
    PanelData,
    | 'motionAddSpeedBasis'
    | 'motionAddTimeSec'
    | 'motionAddMoveJ_angularSpeedDegSec'
    | 'motionAddMoveJ_angularAccelDegSec2'
    | 'motionAddMoveL_linearSpeedMmSec'
    | 'motionAddMoveL_linearAccelMmSec2'
    | 'motionAddTcpPos'
    | 'motionAddTcpRot'
    | 'motionAddJointAnglesDeg'
  >,
  id: string,
  moveVariant: 'MoveL' | 'MoveJ',
): MotionSeqItem {
  return {
    id,
    kind: 'move',
    moveVariant,
    durationSec: p.motionAddTimeSec,
    moveSpeedBasis: p.motionAddSpeedBasis,
    moveJ_angularSpeedDegSec: p.motionAddMoveJ_angularSpeedDegSec,
    moveJ_angularAccelDegSec2: p.motionAddMoveJ_angularAccelDegSec2,
    moveL_linearSpeedMmSec: p.motionAddMoveL_linearSpeedMmSec,
    moveL_linearAccelMmSec2: p.motionAddMoveL_linearAccelMmSec2,
    tcpPos: { ...p.motionAddTcpPos },
    tcpRot: { ...p.motionAddTcpRot },
    jointAnglesDeg: [...p.motionAddJointAnglesDeg],
  };
}

export function createMotionSeqItemStop(
  p: Pick<PanelData, 'motionAddStopSec' | 'motionAddTcpPos' | 'motionAddTcpRot' | 'motionAddJointAnglesDeg'>,
  id: string,
): MotionSeqItem {
  return {
    id,
    kind: 'stop',
    durationSec: p.motionAddStopSec,
    tcpPos: { ...p.motionAddTcpPos },
    tcpRot: { ...p.motionAddTcpRot },
    jointAnglesDeg: [...p.motionAddJointAnglesDeg],
  };
}

/** 카테고리 서브모달「이동/정지 모션 추가」필드 기본값 (표시·초기 state 공통) */
export const MOTION_ADD_DEFAULTS: Pick<
  PanelData,
  | 'motionAddMoveVariant'
  | 'motionAddSpeedBasis'
  | 'motionAddTimeSec'
  | 'motionAddMoveJ_angularSpeedDegSec'
  | 'motionAddMoveJ_angularAccelDegSec2'
  | 'motionAddMoveL_linearSpeedMmSec'
  | 'motionAddMoveL_linearAccelMmSec2'
  | 'motionAddStopSec'
  | 'motionAddTcpPos'
  | 'motionAddTcpRot'
  | 'motionAddJointAnglesDeg'
> = {
  motionAddMoveVariant: 'MoveL',
  motionAddSpeedBasis: 'time',
  motionAddTimeSec: '3',
  motionAddMoveJ_angularSpeedDegSec: '1000',
  motionAddMoveJ_angularAccelDegSec2: '100',
  motionAddMoveL_linearSpeedMmSec: '1000',
  motionAddMoveL_linearAccelMmSec2: '100',
  motionAddStopSec: '3',
  motionAddTcpPos: { x: '500', y: '0', z: '800' },
  motionAddTcpRot: { rx: '0', ry: '0', rz: '0' },
  motionAddJointAnglesDeg: ['0', '25', '-40', '85', '0', '15'],
};

/** 시퀀스 행에 조인트 배열이 없거나 길이가 맞지 않으면 기본값으로 채움 */
export function mergeMotionJointAnglesDeg(item: MotionSeqItem | null | undefined): string[] {
  const base = MOTION_ADD_DEFAULTS.motionAddJointAnglesDeg;
  const j = item?.jointAnglesDeg;
  if (!j || j.length !== MOTION_JOINT_COUNT) {
    return [...base];
  }
  return Array.from({ length: MOTION_JOINT_COUNT }, (_, i) => j[i] ?? base[i]);
}

const DEFAULT_MANIP_CONN: ManipConnectionLinks = {
  controller: { name: 'F-CPU Safety', model: 'S7-1510F', kind: 'Safety controller' },
  auxiliaryAxes: [],
  cell: null,
  emergencyStop: null,
  grippers: [{ name: 'EE_Group_01', model: 'Schunk EGP 64', kind: 'End effector' }],
};

export const DEFAULT_DATA: PanelData = {
  manipRobots: [
    {
      manipObjectName: 'IRB_6700_Line01',
      manipRobotType: 'MANIPULATOR',
      manipModel: 'IRB 6700',
      manipMaker: 'ABB',
      manipPayload: '150',
      manipReach: '3,200',
      manipJointCount: '6',
      manipCurrentLoadWeight: '85',
      manipCollaboration: true,
      manipCollaborationMode: 'PFL',
      position: { x: '1,250', y: '800', z: '0' },
      rotation: { rx: '0', ry: '0', rz: '45' },
      size: { w: '600', d: '600', h: '2,100' },
      mass: '1,280',
      autoCoM: true,
      centerOfMass: { cx: '0', cy: '0', cz: '450' },
      safetyPl: 'd',
      safetyCategory: 'Cat 3',
      safetySil: 'SIL2',
      certStatus: 'CE',
      safetyStopTime: '0.5',
      safetyTcpLimit: '250',
      safetyLogicApplied: true,
      safetyMonitoringStatus: 'Active',
      safetyLastVerified: '2026-04-03 14:30',
      stopTsMs: '320',
      stopSsMm: '42.8',
      responseDelayMs: '45',
      responseDelayLocked: true,
      manipConnLinks: { ...DEFAULT_MANIP_CONN },
    },
    {
      manipObjectName: 'IRB_4600_Sub',
      manipRobotType: 'MANIPULATOR',
      manipModel: 'IRB 4600',
      manipMaker: 'ABB',
      manipPayload: '60',
      manipReach: '2,550',
      manipJointCount: '6',
      manipCurrentLoadWeight: '40',
      manipCollaboration: false,
      manipCollaborationMode: 'SSM',
      position: { x: '2,100', y: '600', z: '0' },
      rotation: { rx: '0', ry: '0', rz: '0' },
      size: { w: '500', d: '500', h: '1,800' },
      mass: '920',
      autoCoM: true,
      centerOfMass: { cx: '0', cy: '0', cz: '380' },
      safetyPl: 'c',
      safetyCategory: 'Cat 3',
      safetySil: 'SIL2',
      certStatus: 'CE',
      safetyStopTime: '0.45',
      safetyTcpLimit: '200',
      safetyLogicApplied: true,
      safetyMonitoringStatus: 'Standby',
      safetyLastVerified: '2026-03-20 10:15',
      stopTsMs: '280',
      stopSsMm: '38.2',
      responseDelayMs: '50',
      responseDelayLocked: false,
      manipConnLinks: {
        controller: { name: 'IRC5', model: 'IRC5 Compact', kind: 'Robot controller' },
        auxiliaryAxes: [],
        cell: null,
        emergencyStop: null,
        grippers: [],
      },
    },
    {
      manipObjectName: 'KR_120_R3200',
      manipRobotType: 'MANIPULATOR',
      manipModel: 'KR 120 R3200',
      manipMaker: 'KUKA',
      manipPayload: '120',
      manipReach: '3,200',
      manipJointCount: '6',
      manipCurrentLoadWeight: '72',
      manipCollaboration: true,
      manipCollaborationMode: 'PFL',
      position: { x: '800', y: '1,200', z: '0' },
      rotation: { rx: '0', ry: '0', rz: '-30' },
      size: { w: '580', d: '580', h: '2,050' },
      mass: '1,140',
      autoCoM: true,
      centerOfMass: { cx: '0', cy: '0', cz: '420' },
      safetyPl: 'd',
      safetyCategory: 'Cat 3',
      safetySil: 'SIL2',
      certStatus: 'CE',
      safetyStopTime: '0.55',
      safetyTcpLimit: '220',
      safetyLogicApplied: true,
      safetyMonitoringStatus: 'Active',
      safetyLastVerified: '2026-04-01 09:00',
      stopTsMs: '340',
      stopSsMm: '45.0',
      responseDelayMs: '42',
      responseDelayLocked: true,
      manipConnLinks: {
        controller: { name: 'KR C5', model: 'KR C5', kind: 'Robot controller' },
        auxiliaryAxes: [{ name: 'Track_01', model: 'KL 1000', kind: 'Linear axis' }],
        cell: null,
        emergencyStop: { name: 'EStop_Global', model: 'Pilz PNOZ', kind: 'Emergency stop' },
        grippers: [{ name: 'Grip_K1', model: 'Schunk PGN-plus', kind: 'End effector' }],
      },
    },
  ],
  manipSelectedRobotIdx: 0,
  eeSlots: [
    {
      objectName: 'object_name',
      name: 'EGP 64',
      modelFileName: 'EGP64.stl',
      type: 'Gripper',
      mass: '2.5',
      makerLabel: 'Schunk',
      source: 'catalog',
      tcpPos: { x: '0', y: '0', z: '200' },
      tcpRot: { rx: '0', ry: '0', rz: '0' },
      eeSize: { w: '120', d: '80', h: '95' },
      eeOuterDiam: '0',
      eeCom: { cx: '0', cy: '0', cz: '40' },
      eeAutoCom: true,
      linkedItems: [
        { name: 'EE_Group_01', model: 'Schunk EGP 64', kind: 'End effector' },
        { name: 'Fieldbus_A1', model: 'PROFINET I/O', kind: 'Fieldbus' },
      ],
    },
    {
      objectName: 'object_name',
      name: 'Cognex 3D',
      modelFileName: 'Cognex3D.stl',
      type: 'Vision',
      mass: '0.8',
      makerLabel: 'Cognex',
      source: 'catalog',
      tcpPos: { x: '0', y: '0', z: '150' },
      tcpRot: { rx: '0', ry: '0', rz: '0' },
      eeSize: { w: '90', d: '60', h: '45' },
      eeOuterDiam: '0',
      eeCom: { cx: '0', cy: '0', cz: '20' },
      eeAutoCom: true,
      linkedItems: [
        { name: 'Vision_Link_01', model: 'Cognex 3D', kind: 'Vision IO' },
      ],
    },
    null, null, null,
  ],
  pathType: 'Linear', blendRadius: '50',
  maxSpeed: '1,000', acceleration: '500', jerk: '200',
  ...MOTION_ADD_DEFAULTS,
  zoneShape: 'Cylinder', zoneRadius: '1,500', zoneHeight: '2,500',
  sensitivity: 'Medium', responseType: 'Stop',
  areaWidth: '2,000', areaDepth: '1,500', areaHeight: '2,200',
  pflEnabled: true, ssmEnabled: true, minSepDist: '500', safeSpeed: '300',
  motionUploadFileGroups: [
    {
      id: 'uf1',
      fileName: 'sv_UR5KTL_RTDE.txt',
      expanded: true,
      waypoints: [
        { id: 'uw1', waypointIndex: 5, timecode: '00:02.00', moveVariant: 'MoveL' },
        { id: 'uw2', waypointIndex: 6, timecode: '00:03.50', moveVariant: 'MoveJ' },
        { id: 'uw3', waypointIndex: 7, timecode: '00:05.00', moveVariant: 'MoveL' },
      ],
    },
    {
      id: 'uf2',
      fileName: 'arc_blend.json',
      expanded: false,
      waypoints: [{ id: 'uw4', waypointIndex: 1, timecode: '00:01.20' }],
    },
  ],
  motionSequenceItems: [
    {
      id: 'ms1',
      kind: 'move',
      moveVariant: 'MoveL',
      durationSec: '5',
      tcpPos: { x: '500', y: '0', z: '800' },
      tcpRot: { rx: '0', ry: '0', rz: '0' },
      jointAnglesDeg: ['0', '25', '-40', '85', '0', '15'],
    },
    {
      id: 'ms2',
      kind: 'move',
      moveVariant: 'MoveJ',
      durationSec: '8',
      showVisibilityIcon: true,
      tcpPos: { x: '520', y: '10', z: '820' },
      tcpRot: { rx: '0', ry: '5', rz: '0' },
      jointAnglesDeg: ['-10', '30', '-20', '60', '5', '-5'],
    },
    {
      id: 'ms3',
      kind: 'stop',
      durationSec: '3',
      tcpPos: { x: '500', y: '0', z: '800' },
      tcpRot: { rx: '0', ry: '0', rz: '0' },
      jointAnglesDeg: ['0', '25', '-40', '85', '0', '15'],
    },
  ],
  handGuidingMode: false,
  toolChangeMode: false,
  collisionRobotList: [
    {
      id: 'cr1',
      objectName: 'IRB_6700_Line01',
      subtitle: 'IRB 6700 · ABB',
      expectedAreas: [
        { id: 'ca-r1-1', label: '충돌예상부위 R1-1', shape: 'box', visible: true },
        { id: 'ca-r1-2', label: '충돌예상부위 R1-2', shape: 'box', visible: true },
        { id: 'ca-r1-3', label: '충돌예상부위 R1-3', shape: 'cylinder', visible: true },
        { id: 'ca-r1-4', label: '충돌예상부위 R1-4', shape: 'box', visible: true },
        { id: 'ca-r1-5', label: '충돌예상부위 R1-5', shape: 'cylinder', visible: true },
      ],
    },
    {
      id: 'cr2',
      objectName: 'IRB_4600_Sub',
      subtitle: 'IRB 4600 · ABB',
      expectedAreas: [
        { id: 'ca-r2-1', label: '충돌예상부위 R2-1', shape: 'box', visible: true },
        { id: 'ca-r2-2', label: '충돌예상부위 R2-2', shape: 'box', visible: true },
        { id: 'ca-r2-3', label: '충돌예상부위 R2-3', shape: 'cylinder', visible: true },
        { id: 'ca-r2-4', label: '충돌예상부위 R2-4', shape: 'box', visible: true },
        { id: 'ca-r2-5', label: '충돌예상부위 R2-5', shape: 'cylinder', visible: true },
      ],
    },
    {
      id: 'cr3',
      objectName: 'KR_120_R3200',
      subtitle: 'KR 120 R3200 · KUKA',
      expectedAreas: [
        { id: 'ca-r3-1', label: '충돌예상부위 R3-1', shape: 'box', visible: true },
        { id: 'ca-r3-2', label: '충돌예상부위 R3-2', shape: 'cylinder', visible: true },
        { id: 'ca-r3-3', label: '충돌예상부위 R3-3', shape: 'box', visible: true },
        { id: 'ca-r3-4', label: '충돌예상부위 R3-4', shape: 'cylinder', visible: true },
        { id: 'ca-r3-5', label: '충돌예상부위 R3-5', shape: 'box', visible: true },
      ],
    },
  ],
  collisionSelectedRobotIdx: 0,
  collisionEndEffectorList: [
    {
      id: 'cee1',
      objectName: 'EE_Group_01',
      subtitle: 'Schunk EGP 64',
      expectedAreas: [
        { id: 'eea-1-1', label: 'EE충돌예상 1-1', shape: 'box', visible: true },
        { id: 'eea-1-2', label: 'EE충돌예상 1-2', shape: 'cylinder', visible: true },
        { id: 'eea-1-3', label: 'EE충돌예상 1-3', shape: 'box', visible: true },
        { id: 'eea-1-4', label: 'EE충돌예상 1-4', shape: 'cylinder', visible: true },
        { id: 'eea-1-5', label: 'EE충돌예상 1-5', shape: 'box', visible: true },
      ],
    },
    {
      id: 'cee2',
      objectName: 'Vision_Head',
      subtitle: 'Cognex 3D',
      expectedAreas: [
        { id: 'eea-2-1', label: 'EE충돌예상 2-1', shape: 'cylinder', visible: true },
        { id: 'eea-2-2', label: 'EE충돌예상 2-2', shape: 'box', visible: true },
        { id: 'eea-2-3', label: 'EE충돌예상 2-3', shape: 'cylinder', visible: true },
        { id: 'eea-2-4', label: 'EE충돌예상 2-4', shape: 'box', visible: true },
        { id: 'eea-2-5', label: 'EE충돌예상 2-5', shape: 'cylinder', visible: true },
      ],
    },
  ],
  collisionEndEffectorSelectedIdx: 0,
  collisionAdditionalAxisList: [
    {
      id: 'cax1',
      objectName: '추가축_A1',
      subtitle: '서보 스테이지',
      expectedAreas: [
        { id: 'eax-1', label: '부가축영역 1', shape: 'cylinder', visible: true },
        { id: 'eax-2', label: '부가축영역 2', shape: 'box', visible: true },
        { id: 'eax-3', label: '부가축영역 3', shape: 'cylinder', visible: true },
        { id: 'eax-4', label: '부가축영역 4', shape: 'box', visible: true },
        { id: 'eax-5', label: '부가축영역 5', shape: 'cylinder', visible: true },
      ],
    },
  ],
  collisionAdditionalAxisSelectedIdx: 0,
  collisionWorkpieceList: [
    {
      id: 'cwp1',
      objectName: 'Workpiece_A',
      subtitle: '알루미늄 블록',
      expectedAreas: [
        { id: 'wp-a-1', label: '작업물충돌 A-1', shape: 'box', visible: true },
        { id: 'wp-a-2', label: '작업물충돌 A-2', shape: 'cylinder', visible: true },
        { id: 'wp-a-3', label: '작업물충돌 A-3', shape: 'box', visible: true },
        { id: 'wp-a-4', label: '작업물충돌 A-4', shape: 'cylinder', visible: true },
        { id: 'wp-a-5', label: '작업물충돌 A-5', shape: 'box', visible: true },
      ],
    },
    {
      id: 'cwp2',
      objectName: 'Pallet_01',
      subtitle: '팔레트',
      expectedAreas: [
        { id: 'wp-p-1', label: '작업물충돌 P-1', shape: 'box', visible: true },
        { id: 'wp-p-2', label: '작업물충돌 P-2', shape: 'box', visible: true },
        { id: 'wp-p-3', label: '작업물충돌 P-3', shape: 'cylinder', visible: true },
        { id: 'wp-p-4', label: '작업물충돌 P-4', shape: 'box', visible: true },
        { id: 'wp-p-5', label: '작업물충돌 P-5', shape: 'cylinder', visible: true },
      ],
    },
  ],
  collisionWorkpieceSelectedIdx: 0,
  selectedCollisionAreaId: null,
  collisionContinuousGenerationMode: false,
  collisionShapeDefaults: { ...COLLISION_SHAPE_DEFAULTS },
  collabCreationDefaults: {
    posX: '-146',
    posY: '5885',
    widthMm: '1924',
    heightMm: '2193',
    bodyPartId: 'hand-palm-d',
    clothingThickness: false,
    workerDirection: false,
  },
  collabWorkspaces: [
    {
      id: 'cw1',
      name: '협동작업공간1',
      posX: '-146',
      posY: '5885',
      widthMm: '1924',
      heightMm: '2193',
      bodyPartId: 'hand-palm-d',
      clothingThickness: false,
      workerDirection: false,
      colorHex: '#22c55e',
      opacityPercent: 40,
      sharedRobotIds: [],
      visible: true,
    },
    {
      id: 'cw2',
      name: '협동작업공간2',
      posX: '-146',
      posY: '5885',
      widthMm: '1924',
      heightMm: '2193',
      bodyPartId: 'hand-palm-d',
      clothingThickness: false,
      workerDirection: false,
      colorHex: '#eab308',
      opacityPercent: 40,
      sharedRobotIds: [],
      visible: true,
    },
    {
      id: 'cw3',
      name: '협동작업공간3',
      posX: '-146',
      posY: '5885',
      widthMm: '1924',
      heightMm: '2193',
      bodyPartId: 'hand-palm-d',
      clothingThickness: false,
      workerDirection: false,
      colorHex: '#3b82f6',
      opacityPercent: 40,
      sharedRobotIds: [],
      visible: true,
    },
    {
      id: 'cw4',
      name: '협동작업공간4',
      posX: '-146',
      posY: '5885',
      widthMm: '1924',
      heightMm: '2193',
      bodyPartId: 'hand-palm-d',
      clothingThickness: false,
      workerDirection: false,
      colorHex: '#8b5cf6',
      opacityPercent: 40,
      sharedRobotIds: ['COBOT3'],
      visible: true,
    },
    {
      id: 'cw5',
      name: '협동작업공간5',
      posX: '-200',
      posY: '5900',
      widthMm: '1800',
      heightMm: '2100',
      bodyPartId: 'chest-sternum',
      clothingThickness: true,
      workerDirection: false,
      colorHex: '#ec4899',
      opacityPercent: 35,
      sharedRobotIds: [],
      visible: true,
    },
    {
      id: 'cw6',
      name: '협동작업공간6',
      posX: '-120',
      posY: '5850',
      widthMm: '2000',
      heightMm: '2200',
      bodyPartId: 'forearm',
      clothingThickness: false,
      workerDirection: true,
      colorHex: '#14b8a6',
      opacityPercent: 45,
      sharedRobotIds: [],
      visible: true,
    },
  ],
  collabAssignedWorkspaceIds: ['cw4'],
  collabSelectedWorkspaceId: 'cw4',
  collabEditingWorkspaceId: null,
};
