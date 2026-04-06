/* eslint-disable */
// node gen-data.cjs
const fs = require('fs');

// ── menuData.ts ──────────────────────────────────────────────────────────────
/** Objects 모달 헤더 = 상위 로봇/셀 한 대에 대한 메타 (목록 버튼과 독립) */
const objectsModalContext = {
  objectName: 'IRB_6700_Line01',
  cri: 0.72,
  analysis: 'done',
  collaboration: 'on',
  tier: 'paid',
};

const objects = [
  {
    id: 'manipulator',
    label: '\uB9E4\uB2C8\uD4F0\uB808\uC774\uD130',
    icon: 'Bot',
    color: '#a78bfa',
    categories: [
      {
        id: 'manip-detail',
        label: '\uB85C\uBD07 \uC0C1\uC138',
        icon: 'Bot',
        color: '#a78bfa',
        panelTitle: '\uB9E4\uB2C8\uD4F0\uB808\uC774\uD130',
        panelSubtitle: 'IRB 6700 \u00B7 ABB',
        tabs: [
          { id: 'manip-spec',     label: '\uC2A4\uD399' },
          { id: 'manip-position', label: '\uC704\uCE58/\uBC29\uD5A5' },
          { id: 'manip-mass',     label: '\uC9C8\uB7C9' },
        ],
      },
      {
        id: 'manip-safety',
        label: '\uC548\uC804 \uC815\uBCF4',
        icon: 'Anchor',
        color: '#a78bfa',
        panelTitle: '\uB9E4\uB2C8\uD4F0\uB808\uC774\uD130',
        panelSubtitle: '\uC548\uC804 \uC815\uBCF4',
        tabs: [
          { id: 'manip-safety-grade', label: '\uB4F1\uAE09/\uC778\uC99D' },
        ],
      },
      {
        id: 'manip-connect',
        label: '\uC5F0\uACB0 \uC815\uBCF4',
        icon: 'Link2',
        color: '#a78bfa',
        panelTitle: '\uB9E4\uB2C8\uD4F0\uB808\uC774\uD130',
        panelSubtitle: '\uC5F0\uACB0 \uC815\uBCF4',
        tabs: [
          { id: 'manip-conn-list', label: '\uC5F0\uACB0 \uC694\uC18C' },
        ],
      },
    ],
  },
  {
    id: 'endeffector',
    label: '\uC5D4\uB4DC\uC774\uD399\uD130 \uADF8\uB8F9',
    icon: 'Wrench',
    color: '#60a5fa',
    categories: [
      {
        id: 'ee-basic',
        label: '\uB3C4\uAD6C \uBAA9\uB85D',
        icon: 'Wrench',
        color: '#60a5fa',
        panelTitle: '\uC5D4\uB4DC\uC774\uD399\uD130 \uADF8\uB8F9',
        panelSubtitle: 'Tool Group #1',
        tabs: [
          { id: 'ee-list', label: '\uB3C4\uAD6C \uBAA9\uB85D' },
        ],
      },
    ],
  },
  {
    id: 'motion',
    label: '\uBAA8\uC158 \uC124\uC815',
    icon: 'Zap',
    color: '#34d399',
    categories: [
      {
        id: 'motion-generate',
        label: '\uC0DD\uC131 \uBAA8\uC158',
        icon: 'Zap',
        color: '#34d399',
        panelTitle: '\uBAA8\uC158 \uC124\uC815',
        panelSubtitle: 'IRB 6700 \u00B7 ABB',
        tabs: [],
      },
      {
        id: 'motion-upload',
        label: '\uC5C5\uB85C\uB4DC \uBAA8\uC158',
        icon: 'Zap',
        color: '#34d399',
        panelTitle: '\uBAA8\uC158 \uC124\uC815',
        panelSubtitle: 'IRB 6700 \u00B7 ABB',
        tabs: [{ id: 'motion-upload', label: '\uBAA8\uC158 \uD30C\uC77C' }],
      },
    ],
  },
  {
    id: 'collision',
    label: '\uCDA9\uB3CC \uC608\uC0C1 \uBD80\uC704',
    icon: 'AlertTriangle',
    color: '#f87171',
    categories: [
      {
        id: 'collision-basic',
        label: '\uC601\uC5ED/\uAC10\uC9C0',
        icon: 'AlertTriangle',
        color: '#f87171',
        panelTitle: '\uCDA9\uB3CC \uC608\uC0C1 \uBD80\uC704',
        panelSubtitle: 'IRB 6700 \u00B7 ABB',
        tabs: [
          { id: 'collision-zone',   label: '\uC601\uC5ED \uC124\uC815' },
          { id: 'collision-detect', label: '\uAC10\uC9C0 \uC124\uC815' },
        ],
      },
    ],
  },
  {
    id: 'collab',
    label: '\uD611\uB3D9 \uC791\uC5C5 \uC601\uC5ED',
    icon: 'Users',
    color: '#fbbf24',
    categories: [
      {
        id: 'collab-basic',
        label: '\uC601\uC5ED/\uC548\uC804',
        icon: 'Users',
        color: '#fbbf24',
        panelTitle: '\uD611\uB3D9 \uC791\uC5C5 \uC601\uC5ED',
        panelSubtitle: 'IRB 6700 \u00B7 ABB',
        tabs: [
          { id: 'collab-area',   label: '\uC601\uC5ED \uC124\uC815' },
          { id: 'collab-safety', label: '\uC548\uC804 \uC124\uC815' },
        ],
      },
    ],
  },
];

let menuOut = "import {\n  Bot, Wrench, Zap, AlertTriangle, Users, Anchor, Link2,\n} from 'lucide-react';\nimport type { ObjectDef, ObjectHeaderMeta } from './types';\n\n";
menuOut += `export const OBJECTS_MODAL_CONTEXT: ObjectHeaderMeta = ${JSON.stringify(objectsModalContext)};\n\n`;
menuOut += 'export const OBJECTS: ObjectDef[] = [\n';
for (const o of objects) {
  menuOut += `  {\n    id: '${o.id}',\n    label: '${o.label}',\n    icon: ${o.icon},\n    color: '${o.color}',\n`;
  menuOut += `    categories: [\n`;
  for (const c of o.categories) {
    menuOut += `      {\n        id: '${c.id}',\n        label: '${c.label}',\n        icon: ${c.icon},\n        color: '${c.color}',\n        panelTitle: '${c.panelTitle}',\n        panelSubtitle: '${c.panelSubtitle}',\n        tabs: [\n`;
    for (const t of c.tabs) {
      menuOut += `          { id: '${t.id}', label: '${t.label}' },\n`;
    }
    menuOut += `        ],\n      },\n`;
  }
  menuOut += `    ],\n  },\n`;
}
menuOut += '];\n';

fs.writeFileSync('src/menuData.ts', menuOut, 'utf8');
console.log('menuData.ts OK, size:', menuOut.length);

// ── labels.ts (full replacement with all labels including new ones) ─────────
const labels = {
  // 섹션 제목
  manipSpec:     '\uB9E4\uB2C8\uD4F0\uB808\uC774\uD130 \uC2A4\uD399',
  manipPosition: '\uC704\uCE58 \uBC0F \uBC29\uD5A5',
  manipMass:     '\uC9C8\uB7C9 \uBC0F \uBB34\uAC8C\uC911\uC2EC',
  safetySection:    '\uC548\uC804 \uB4F1\uAE09/\uC778\uC99D',
  safetyPl:         '\uC548\uC804 \uB4F1\uAE09 (PL)',
  safetyCategory:   '\uCE74\uD14C\uACE0\uB9AC',
  safetySil:        '\uC548\uC804 \uB4F1\uAE09 (SIL)',
  safetyCertStatus: '\uC778\uC99D \uD604\uD669',
  safetyCertSpecs:  '\uC778\uC99D \uC81C\uC6D0 (\uC815\uC9C0\u2022\uC18D\uB3C4)',
  safetyLogicTitle: 'Safety Logic \uAC1C\uC694',
  safetyApplied:    '\uC801\uC6A9 \uC0C1\uD0DC',
  badgeApplied:     '\uC801\uC6A9\uB428',
  badgeNotApplied:  '\uBBF8\uC801\uC6A9',
  safetyMonitor:    '\uBAA8\uB2C8\uD130\uB9C1',
  safetyMonitorPick:'\uC0C1\uD0DC \uC120\uD0DD',
  safetyLastVerify: '\uB9C8\uC9C0\uB9C9 \uAC80\uC99D',
  stopPerfTitle:    '\uC815\uC9C0 \uC131\uB2A5 (\uBD84\uC11D \uD575\uC2EC)',
  stopTsLabel:      '\uC815\uC9C0 \uC2DC\uAC04 TS',
  stopSsLabel:      '\uC815\uC9C0 \uAC70\uB9AC SS',
  stopPerfHint:     'SSM / PFL \uD3C9\uAC00\uC5D0 \uC9C1\uC811 \uBC18\uC601\uB418\uB294 \uC9C0\uD45C\uC785\uB2C8\uB2E4.',
  responseDelayLabel: '\uBC18\uC751 \uC9C0\uC5F0',
  measureLabel:     '\uCE21\uC815',
  certCustomPh:     '\uC9C1\uC811 \uC785\uB825 \uB610\uB294 \uBAA9\uB85D \uCD94\uAC00',
  certApplyBtn:     '\uC801\uC6A9',
  safetyStopTime:   '\uB85C\uBD07 \uC815\uC9C0 \uC2DC\uAC04 (sec)',
  safetyTcpLimit:   'TCP \uC81C\uD55C \uC18D\uB3C4 (mm/sec)',
  connLinkedList: '\uC5F0\uACB0 \uC694\uC18C',
  connColName:    '\uAC1D\uCCB4\uBA85',
  connColModel:   '\uBAA8\uB378',
  connColKind:    '\uC885\uB958',
  connListEmpty:  '\uC5F0\uACB0\uB41C \uAC1D\uCCB4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
  criPrefix:     'CRI',
  criSafe:       '\uC548\uC804',
  criRisk:       '\uC704\uD5D8',
  badgeAnalyzed: '\uBD84\uC11D\uC644\uB8CC',
  badgePending:  '\uBBF8\uBD84\uC11D',
  badgeCollab:   '\uD611\uB3D9\uC6B4\uC804',
  badgeNoCollab: '\uBE44\uD611\uB3D9',
  badgeFree:     '\uBB34\uB8CC \uB85C\uBD07',
  badgePaid:     '\uC720\uB8CC \uB85C\uBD07',
  eeToolInfo:    '\uB3C4\uAD6C \uC815\uBCF4',
  eeTcpSetting:  'TCP \uC124\uC815',
  motionPath:    '\uACBD\uB85C \uC124\uC815',
  motionSpeed:   '\uC18D\uB3C4 \uC124\uC815',
  collisionZone: '\uCDA9\uB3CC \uC608\uC0C1 \uC601\uC5ED',
  collisionDet:  '\uAC10\uC9C0 \uC124\uC815',
  collabArea:    '\uD611\uB3D9 \uC791\uC5C5 \uC601\uC5ED',
  collabSafety:  '\uD611\uB3D9 \uC548\uC804 \uC124\uC815',
  // 매니퓰레이터 필드
  manipObjectName: '\uAC1D\uCCB4\uBA85',
  manipModel:    '\uBAA8\uB378\uBA85',
  manipMaker:    '\uC81C\uC870\uC0AC',
  manipPayload:  '\uD398\uC774\uB85C\uB4DC (kg)',
  manipReach:    '\uCD5C\uB300 \uB3C4\uB2EC \uAC70\uB9AC (mm)',
  positionMm:    '\uC704\uCE58 (mm)',
  directionDeg:  '\uBC29\uD5A5 (deg)',
  sizeMm:        '\uD06C\uAE30 (mm)',
  mass:          '\uC9C8\uB7C9 (kg)',
  autoCoM:       'Auto CoM',
  autoCoMTooltip:'\uBB34\uAC8C\uC911\uC2EC\uC744 \uC790\uB3D9\uC73C\uB85C \uACC4\uC0B0\uD569\uB2C8\uB2E4',
  weightCoMMm:   '\uBB34\uAC8C\uC911\uC2EC (mm)',
  // 엔드이펙터 필드
  eeListTitle:   '\uB3C4\uAD6C \uBAA9\uB85D',
  eeSlotEmpty:   '\uBE44\uC5B4\uC788\uC74C',
  eeDetail:      '\uB3C4\uAD6C \uC0C1\uC138',
  eeType:        '\uB3C4\uAD6C \uC720\uD615',
  eeName:        '\uB3C4\uAD6C \uC774\uB984',
  eeMass:        '\uB3C4\uAD6C \uC9C8\uB7C9 (kg)',
  tcpPosition:   'TCP \uC704\uCE58 (mm)',
  tcpDirection:  'TCP \uBC29\uD5A5 (deg)',
  // 모션 필드
  pathType:      '\uACBD\uB85C \uC720\uD615',
  blendRadius:   '\uBE14\uB80C\uB529 \uBC18\uACBD (mm)',
  maxSpeed:      '\uCD5C\uB300 \uC18D\uB3C4 (mm/s)',
  acceleration:  '\uAC00\uC18D\uB3C4 (mm/s\u00B2)',
  jerk:          '\uC800\uD06C (mm/s\u00B3)',
  // 충돌 예상 부위 필드
  zoneShape:     '\uC601\uC5ED \uD615\uD0DC',
  zoneRadius:    '\uBC18\uACBD (mm)',
  zoneHeight:    '\uB192\uC774 (mm)',
  sensitivity:   '\uAC10\uC9C0 \uBBFC\uAC10\uB3C4',
  responseType:  '\uBC18\uC751 \uC720\uD615',
  // 협동 작업 영역 필드
  areaWidth:     '\uB108\uBE44 (mm)',
  areaDepth:     '\uAE4A\uC774 (mm)',
  areaHeight:    '\uB192\uC774 (mm)',
  pflActive:     'PFL \uD65C\uC131\uD654',
  ssmActive:     'SSM \uD65C\uC131\uD654',
  minSepDist:    '\uCD5C\uC18C \uC774\uACA9 \uAC70\uB9AC (mm)',
  safeSpeed:     '\uC548\uC804 \uC18D\uB3C4 (mm/s)',
  // 공통
  apply:         '\uC801\uC6A9\uD558\uAE30',
};

let labelsOut = 'export const L = {\n';
for (const [k, v] of Object.entries(labels)) {
  labelsOut += `  ${k}: ${JSON.stringify(v)},\n`;
}
labelsOut += '} as const;\n';

fs.writeFileSync('src/labels.ts', labelsOut, 'utf8');
console.log('labels.ts OK, size:', labelsOut.length);
const sample = labelsOut.substring(0, 200);
console.log('Sample:', sample);
