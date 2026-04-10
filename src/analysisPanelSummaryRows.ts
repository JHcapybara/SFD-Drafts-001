import type { HazardRowTone } from './analysisPanelFrameRef';

export type LightHazardRow = {
  id: string;
  tone: HazardRowTone;
  nameKo: string;
  nameEn: string;
  subKo: string;
  subEn: string;
  bodyKo: string;
  bodyEn: string;
  refKo: string;
  refEn: string;
  showView3d: boolean;
  primaryKo?: string;
  primaryEn?: string;
  secondaryKo?: string;
  secondaryEn?: string;
  primaryIsSuggest?: boolean;
};

export const LIGHT_HAZARD_ROWS: LightHazardRow[] = [
  {
    id: 'hz1',
    tone: 'fail',
    nameKo: '충돌 위험가능성 영역',
    nameEn: 'Collision risk zone',
    subKo: '펜스 개구부 안전거리 미달 — 600mm / 기준 870mm',
    subEn: 'Fence opening safety distance short — 600mm / required 870mm',
    bodyKo:
      'ISO 13857 Table 4 기준, 개구부 폭 600mm 시 최소 안전거리는 870mm입니다. 현재 라이트 커튼까지의 이격 거리가 기준에 미달합니다.',
    bodyEn:
      'Per ISO 13857 Table 4, a 600mm opening requires at least 870mm safety distance. The current clearance to the light curtain is below the requirement.',
    refKo: '참조: ISO 13857:2019 Table 4',
    refEn: 'Ref: ISO 13857:2019 Table 4',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz2',
    tone: 'warn',
    nameKo: '끼임 가능성 영역',
    nameEn: 'Pinch / entrapment zone',
    subKo: '컨베이어 하단부 간격 25mm 이하 감지',
    subEn: '≤25mm gap detected under conveyor',
    bodyKo:
      '컨베이어 하단 구조물과 바닥 사이 간격이 25mm 이하로 감지되었습니다. 신체 끼임 가능성이 있어 가드 설치 또는 구조 변경이 권고됩니다.',
    bodyEn:
      'A ≤25mm gap was detected under the conveyor. Entrapment risk is present; guarding or structural change is recommended.',
    refKo: '참조: ISO 13854:2017',
    refEn: 'Ref: ISO 13854:2017',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz3',
    tone: 'warn',
    nameKo: '충돌과 끼임 동시 가능성 영역',
    nameEn: 'Combined collision & pinch zone',
    subKo: '로봇 운전영역 내 복합 위험요소 존재',
    subEn: 'Multiple hazards present in robot operating space',
    bodyKo:
      '로봇 운전영역 내에 충돌과 끼임이 동시에 발생할 수 있는 구간이 확인되었습니다. 설비 재배치 또는 추가 방호 조치가 필요합니다.',
    bodyEn:
      'Areas where collision and pinch can occur together were found. Relocate equipment or add guarding.',
    refKo: '참조: ISO 10218-2:2011 §5.4',
    refEn: 'Ref: ISO 10218-2:2011 §5.4',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'hz4',
    tone: 'pass',
    nameKo: '개구부',
    nameEn: 'Opening',
    subKo: '상단 개구부 없음 — 기준 충족',
    subEn: 'No top opening — requirement met',
    bodyKo: '상단 개구부가 없으며, 현재 설치 기준을 충족합니다.',
    bodyEn: 'No top opening; installation meets the applicable requirements.',
    refKo: '참조: ISO 13857:2019',
    refEn: 'Ref: ISO 13857:2019',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
  {
    id: 'hz5',
    tone: 'pass',
    nameKo: '잔존 위험영역',
    nameEn: 'Residual risk zone',
    subKo: '방호 후 잔존 위험 — 허용 수준 이내',
    subEn: 'After guarding — residual risk within acceptable limits',
    bodyKo: '방호 조치 후 잔존 위험이 허용 수준 이내로 관리되고 있습니다.',
    bodyEn: 'Residual risk after protective measures is within acceptable limits.',
    refKo: '참조: ISO 12100:2010',
    refEn: 'Ref: ISO 12100:2010',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
];

export type LightRegRow = {
  id: string;
  tone: HazardRowTone;
  nameKo: string;
  nameEn: string;
  subKo: string;
  subEn: string;
  bodyKo: string;
  bodyEn: string;
  refKo: string;
  refEn: string;
  showView3d: boolean;
  primaryKo?: string;
  primaryEn?: string;
  secondaryKo?: string;
  secondaryEn?: string;
  primaryIsSuggest?: boolean;
  singleKo?: string;
  singleEn?: string;
};

export const LIGHT_REG_ROWS: LightRegRow[] = [
  {
    id: 'rg1',
    tone: 'fail',
    nameKo: '비상정지 버튼 위치 위반',
    nameEn: 'E-stop placement violation',
    subKo: 'E-STOP이 보호영역 내부에 위치',
    subEn: 'E-stop located inside the protected zone',
    bodyKo:
      '비상정지 버튼이 보호영역 내부에 설치되어 있습니다. 비상 시 작업자가 위험에 노출될 수 있으므로 보호영역 외부로 재배치가 필요합니다.',
    bodyEn:
      'The e-stop is inside the protected zone. Relocate it outside so operators are not exposed during emergencies.',
    refKo: '참조: ISO 10218-2:2011 §5.7.1',
    refEn: 'Ref: ISO 10218-2:2011 §5.7.1',
    showView3d: true,
    primaryKo: '대책 추천',
    primaryEn: 'Suggest countermeasure',
    secondaryKo: '속성 수정',
    secondaryEn: 'Edit properties',
    primaryIsSuggest: true,
  },
  {
    id: 'rg2',
    tone: 'warn',
    nameKo: '산업안전보건 표지 미확인',
    nameEn: 'Safety signage not verified',
    subKo: '출입문 표지 부착 여부 확인 필요',
    subEn: 'Verify signage on access doors',
    bodyKo:
      '출입문에 산업안전보건 표지 부착 여부를 확인해주세요. 안전보건규칙 제37조에 따라 부착이 의무입니다.',
    bodyEn: 'Verify industrial safety signage on doors. Attachment is mandatory under applicable rules.',
    refKo: '참조: 산업안전보건규칙 제37조',
    refEn: 'Ref: Industrial safety and health rules (Art. 37)',
    showView3d: false,
    singleKo: '확인 완료 처리',
    singleEn: 'Mark done',
  },
  {
    id: 'rg3',
    tone: 'pass',
    nameKo: '로봇 설치 신고',
    nameEn: 'Robot installation notification',
    subKo: '유해·위험 기계 설치 신고 대상 확인',
    subEn: 'Hazardous machinery notification applicability checked',
    bodyKo: '유해·위험 기계 설치 신고 대상 여부가 확인되었습니다.',
    bodyEn: 'Notification requirements for hazardous machinery were checked.',
    refKo: '참조: 산업안전보건법 제44조',
    refEn: 'Ref: OSH Act (Art. 44)',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
  {
    id: 'rg4',
    tone: 'pass',
    nameKo: '안전검사 주기',
    nameEn: 'Safety inspection cycle',
    subKo: '정기검사 주기 내 운용 중',
    subEn: 'Operating within periodic inspection cycle',
    bodyKo: '현재 설비는 정기 안전검사 주기 내에서 운용 중입니다.',
    bodyEn: 'The equipment is operated within the periodic safety inspection cycle.',
    refKo: '참조: 산업안전보건법 제93조',
    refEn: 'Ref: OSH Act (Art. 93)',
    showView3d: false,
    primaryKo: '상세 보기',
    primaryEn: 'View details',
  },
];
