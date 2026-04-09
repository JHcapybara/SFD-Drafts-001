import {
  Bot, Wrench, Zap, AlertTriangle, Users, Link2, LayoutGrid, Building2,
} from 'lucide-react';
import type { AppLocale, ObjectDef, ObjectHeaderMeta, TabDef } from './types';
import { POINT_ORANGE } from './pointColorSchemes';

export const OBJECTS_MODAL_CONTEXT: ObjectHeaderMeta = {
  objectName: 'IRB_6700_Line01',
  cri: 0.72,
  analysis: 'done',
  collaboration: 'on',
  tier: 'paid',
  objectGroupKind: 'manipulator',
};

function collisionTabs(locale: AppLocale): TabDef[] {
  if (locale === 'en') {
    return [
      { id: 'collision-zone', label: 'Zone' },
      { id: 'collision-detect', label: 'Detection' },
    ];
  }
  return [
    { id: 'collision-zone', label: '영역 설정' },
    { id: 'collision-detect', label: '감지 설정' },
  ];
}

/** 언어별 Objects 트리 (충돌: 로봇 / 엔드이펙터 / 부가축 / 작업대상물) */
function getObjectsBase(locale: AppLocale): ObjectDef[] {
  const ctabs = collisionTabs(locale);
  const collisionPanelSub = locale === 'en' ? 'IRB 6700 · ABB' : 'IRB 6700 · ABB';

  return [
    {
      id: 'cell',
      label: locale === 'en' ? 'Robot cell' : '로봇 셀',
      icon: LayoutGrid,
      color: '#a78bfa',
      categories: [
        {
          id: 'cell-overview',
          label: locale === 'en' ? 'Cell' : '셀',
          icon: LayoutGrid,
          color: '#a78bfa',
          panelTitle: locale === 'en' ? 'Robot cell' : '로봇 셀',
          panelSubtitle: locale === 'en' ? 'Tree selection' : '트리 선택',
          tabs: [{ id: 'tree-context-stub', label: locale === 'en' ? 'Overview' : '개요' }],
        },
      ],
    },
    {
      id: 'facility',
      label: locale === 'en' ? 'Facility' : '설비',
      icon: Building2,
      color: '#a78bfa',
      categories: [
        {
          id: 'facility-overview',
          label: locale === 'en' ? 'Facility' : '설비',
          icon: Building2,
          color: '#a78bfa',
          panelTitle: locale === 'en' ? 'Facility' : '설비',
          panelSubtitle: locale === 'en' ? 'Tree selection' : '트리 선택',
          tabs: [{ id: 'tree-context-stub', label: locale === 'en' ? 'Overview' : '개요' }],
        },
      ],
    },
    {
      id: 'manipulator',
      label: locale === 'en' ? 'Manipulator' : '매니퓰레이터',
      icon: Bot,
      color: '#a78bfa',
      categories: [
        {
          id: 'manip-list',
          label: locale === 'en' ? 'Robots' : '로봇',
          icon: Bot,
          color: '#a78bfa',
          panelTitle: locale === 'en' ? 'Robot detail settings' : '로봇 상세 설정',
          panelSubtitle: locale === 'en' ? 'Select a robot' : '로봇을 선택하세요',
          tabs: [],
        },
      ],
    },
    {
      id: 'endeffector',
      label: locale === 'en' ? 'End effector group' : '엔드이펙터 그룹',
      icon: Wrench,
      color: '#60a5fa',
      categories: [
        {
          id: 'ee-basic',
          label: locale === 'en' ? 'End effector' : '엔드이펙터 설정',
          icon: Wrench,
          color: '#60a5fa',
          panelTitle: locale === 'en' ? 'End effector group' : '엔드이펙터 그룹',
          panelSubtitle: locale === 'en' ? 'Tool Group #1' : 'Tool Group #1',
          tabs: [
            { id: 'ee-list', label: locale === 'en' ? 'End effector setup' : '엔드이펙터 설정' },
          ],
        },
        {
          id: 'ee-connect',
          label: locale === 'en' ? 'Connections' : '연결 정보',
          icon: Link2,
          color: '#60a5fa',
          panelTitle: locale === 'en' ? 'End effector group' : '엔드이펙터 그룹',
          panelSubtitle: locale === 'en' ? 'Tool Group #1' : 'Tool Group #1',
          tabs: [
            { id: 'ee-conn', label: locale === 'en' ? 'Connections' : '연결 정보' },
          ],
        },
      ],
    },
    {
      id: 'motion',
      label: locale === 'en' ? 'Motion' : '모션 설정',
      icon: Zap,
      color: '#34d399',
      categories: [
        {
          id: 'motion-generate',
          label: locale === 'en' ? 'Generated motion' : '생성 모션',
          icon: Zap,
          color: '#34d399',
          panelTitle: locale === 'en' ? 'Motion' : '모션 설정',
          panelSubtitle: locale === 'en' ? 'IRB 6700 · ABB' : 'IRB 6700 · ABB',
          tabs: [],
        },
        {
          id: 'motion-upload',
          label: locale === 'en' ? 'Uploaded motion' : '업로드 모션',
          icon: Zap,
          color: '#34d399',
          panelTitle: locale === 'en' ? 'Motion' : '모션 설정',
          panelSubtitle: locale === 'en' ? 'IRB 6700 · ABB' : 'IRB 6700 · ABB',
          tabs: [],
        },
      ],
    },
    {
      id: 'collision',
      label: locale === 'en' ? 'Collision hazard' : '충돌 예상 부위',
      icon: AlertTriangle,
      color: '#f87171',
      categories: [
        {
          id: 'collision-robot',
          label: locale === 'en' ? 'Robot' : '로봇',
          icon: AlertTriangle,
          color: '#f87171',
          panelTitle: locale === 'en' ? 'Collision hazard' : '충돌 예상 부위',
          panelSubtitle: collisionPanelSub,
          tabs: ctabs,
        },
        {
          id: 'collision-endeffector',
          label: locale === 'en' ? 'End effector' : '엔드이펙터',
          icon: AlertTriangle,
          color: '#f87171',
          panelTitle: locale === 'en' ? 'Collision hazard' : '충돌 예상 부위',
          panelSubtitle: collisionPanelSub,
          tabs: ctabs,
        },
        {
          id: 'collision-additional-axis',
          label: locale === 'en' ? 'Additional Axis' : '부가축',
          icon: AlertTriangle,
          color: '#f87171',
          panelTitle: locale === 'en' ? 'Collision hazard' : '충돌 예상 부위',
          panelSubtitle: collisionPanelSub,
          tabs: ctabs,
        },
        {
          id: 'collision-workpiece',
          label: locale === 'en' ? 'Workpiece' : '작업대상물',
          icon: AlertTriangle,
          color: '#f87171',
          panelTitle: locale === 'en' ? 'Collision hazard' : '충돌 예상 부위',
          panelSubtitle: collisionPanelSub,
          tabs: ctabs,
        },
      ],
    },
    {
      id: 'collab',
      label: locale === 'en' ? 'Collaborative space' : '협동 작업 영역',
      icon: Users,
      color: '#fbbf24',
      categories: [
        {
          id: 'collab-basic',
          label: locale === 'en' ? 'Area / safety' : '영역/안전',
          icon: Users,
          color: '#fbbf24',
          panelTitle: locale === 'en' ? 'Collaborative space' : '협동 작업 영역',
          panelSubtitle: locale === 'en' ? 'IRB 6700 · ABB' : 'IRB 6700 · ABB',
          tabs: [{ id: 'collab-workspaces', label: locale === 'en' ? 'Collaborative workspace' : '협동작업공간' }],
        },
      ],
    },
  ];
}

function mapObjectColorsUnified(defs: ObjectDef[], color: string): ObjectDef[] {
  return defs.map((o) => ({
    ...o,
    color,
    categories: o.categories.map((c) => ({ ...c, color })),
  }));
}

/** 카테고리 포인트를 #FF8E2B 로 통일 */
export function getObjects(locale: AppLocale): ObjectDef[] {
  return mapObjectColorsUnified(getObjectsBase(locale), POINT_ORANGE);
}

/** 기존 코드 호환: 한국어 트리 */
export const OBJECTS: ObjectDef[] = getObjects('ko');
