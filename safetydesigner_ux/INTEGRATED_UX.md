# SafetyDesigner 통합 UX 문서

> **목적**: 와이어프레임 가이드·속성 메뉴 스펙과 실제 구현을 한곳에서 대응시키고, 좌·우 패널·3D·하단 영역의 **연동 방향**을 명확히 둔다.  
> **유지**: 기능·레이아웃을 바꿀 때마다 아래 **변경 이력**과 **구현 현황**을 함께 갱신한다.

---

## 1. 참고 문서 (Source of truth)

| 구분 | 경로 | 역할 |
|------|------|------|
| 와이어프레임·영역 정의 | [`wireframe_guide_kr.md`](./wireframe_guide_kr.md) | selection 영역(top / left / 3d / right / bottom), GNB별 동작, Analysis·Tree·Library·Bottom·Safety AI 흐름 |
| 속성 카테고리 메뉴 | [`Property/menu`](./Property/menu) | 우측 Property 왼쪽 카테고리 메뉴 — 대상 객체, 조합별 탭 구성, Tree·3D 선택 동기화 요구 |
| 속성 일반 | [`Property/property`](./Property/property) | (보조) property 프레임 참고 |
| 로봇 DB/필드 | [`Property/property_db/robot_property_db.md`](./Property/property_db/robot_property_db.md) | 로봇 속성 데이터 참고 |
| 엔드이펙터(그리퍼) | [`Property/property_db/end-effector.md`](./Property/property_db/end-effector.md) | 그리퍼 등 엔드이펙터 속성 참고 |
| 설비(Facility) | [`Property/property_db/facility.md`](./Property/property_db/facility.md) | 펜스·라이트커튼·스캐너·매트·E-Stop·터널가드·부가축·인터록 등 |
| 트리·셀 | `safetydesigner_ux/Cell, Tree/` | `tree`, `robotcell flow`, `tree구조 조합*` 등 — Design Tree / Robot Cell Tree 방향 |

Figma·외부 링크는 `wireframe_guide_kr.md` 내 노드 URL을 따른다.

---

## 2. 제품 UX 방향 (요약)

### 2.1 화면 구조 (와이어프레임과 동일 용어)

- **top_area**: `left_gnb` 활성 항목에 따라 상단 GNB 종류 변경 (design/analysis vs risk assessment 등).
- **left_area**: Library / Tree / Analysis / Risk assessment / Safety AI — **320px 기본, 최대 460px** 리사이즈.
- **3d_area**: 공정 뷰; 필요 시 오버레이 UI.
- **right_area**: **활성 left 모드 + 3D/Tree 선택**에 따라 내용 변경 (`property_normal`, 분석 시 셀 속성, risk 시 보고서 preview 등).
- **bottom_area**: **left_area를 가리지 않음** — 3d + right 하단에만 배치, 열림 시 가로 폭 축소. Timeline / Analysis 탭, dock in·out.

### 2.2 좌·우 연동 원칙 (앞으로 맞출 핵심)

문서상 **right는 left 단독이 아니라 “GNB 모드 × 선택 객체”의 함수**다.

| 모드 | left | right (목표) |
|------|------|----------------|
| Library | 카탈로그 | 라이브러리만 열었다고 열리지 않음 → **설치 순간** 설치 객체의 `property_normal` |
| Tree | 계층 선택 | 선택 객체 유형별 Property ([`Property/menu`](./Property/menu) 규칙) |
| Analysis | 셀·진단·장치별 결과 | **해당 로봇 셀** 속성 노출; left의 “자세히 보기” 등 → **bottom analysis**와 로봇 단위 연동 |
| Risk assessment | (문서상 좌측) | 보고서 preview + 편집/발급 |
| Safety AI | AI 패널 | (와이어프레임 § Safety AI) 승인 기반 플로우 |

**Tree ↔ Property 카테고리 메뉴** ([`Property/menu`](./Property/menu)):

- 카테고리 전환 시 **Tree 선택도 같이 바뀌어야** 함 (역방향 동기화).
- 로봇 조합(머니퓰레이터·모바일·부가축)에 따라 노출 탭 목록이 달라짐.

**Tree 이중 구조** ([`wireframe_guide_kr.md`](./wireframe_guide_kr.md) § 트리):

- Design Tree(물리) / Robot Cell Tree(안전·방호) — Cross-highlight, Logic→Physical 하이라이트, Property 수정 시 배지(Pass/Fail·CRI) 실시간 동기화 등 **Sync Logic**이 구현 목표.

---

## 3. 현재 구현 현황 (코드 기준 스냅샷)

> *갱신 시 날짜와 한 줄 요약을 변경 이력에 남긴다.*

### 3.1 구현되어 있는 것

- **WorkspaceChrome** (`src/WorkspaceChrome.tsx`): `left_gnb`에 따른 `leftMode` (library, tree, analysis, riskassessment, safetyai), 좌측 패널 리사이즈(분석·위험성·AI 시 확장), **Analysis 모드 시 bottom 탭을 analysis로 전환**하는 로컬 연동.
- **Analysis 좌측 패널** (`src/AnalysisSidePanel.tsx` 및 하위 콘텐츠): 진단 스냅샷, 위험 구역, PFL/센서/펜스/잔존 위험 플로우(목업 중심).
- **우측 Property** (`src/PropertyPanel.tsx`, `src/App.tsx`): 플로팅 패널, `CategoryMenu`, `selectedObjectId` 등 **앱 레벨 상태**로 속성·카테고리 전환 (와이어의 “셀 단위 right”와는 아직 다른 축).
- **CriLegend**: Analysis 모드일 때만 표시 (`WorkspaceChrome` + `CriLegend`).
- **Bottom**: timeline / analysis UI 뼈대, `rightPanelVisible` 등으로 3D 영역 예약.

### 3.2 문서 대비 갭 (의도적으로 남겨 둔 과제)

| 항목 | 문서 요구 | 현재 |
|------|-----------|------|
| 좌·우 단일 상태 모델 | Analysis 시 right에 **셀 속성**; Tree 선택과 동일 객체 축 | 좌 Analysis와 우 Property가 **공유 selection / cell 컨텍스트 없음** |
| Library → right | 설치 시점에 property | App 쪽 선택·라이브러리 설치 플로우와 크롬 좌측이 분리 |
| Analysis → bottom | left “자세히 보기” → 해당 로봇 분석이 bottom에 | 상세 네비게이션·로봇 스코프 연동 미구현 |
| Tree | Design / Robot Cell 분할 + Sync Logic | 단일 목 트리 위주 |
| 카테고리 ↔ Tree | 메뉴 변경 시 Tree 선택 동기화 | CategoryMenu와 Workspace 트리 **미연결** |
| Risk right | `right_property_riskassessment` | riskassessment 좌측만 일부, 우측 보고서 preview는 로드맵 |

이 갭 목록은 스프린트마다 “해결 / 진행중 / 보류”로 옮겨 적는다.

---

## 4. 구현 매핑 (빠른 탐색)

| UX 영역 | 주요 코드 |
|---------|-----------|
| 좌측 GNB·패널·라이브러리·트리 | `WorkspaceChrome.tsx` |
| 분석 패널 | `AnalysisSidePanel.tsx`, `RobotPflAnalysisContent.tsx`, `SensorAnalysisContent.tsx`, `FenceAnalysisContent.tsx`, `ResidualRiskContent.tsx` |
| 우측 속성·카테고리 | `App.tsx`, `PropertyPanel.tsx`, `CategoryMenu.tsx`, `panelData.ts` |
| 시맨틱·색 토큰 | `analysisPanelSemantics.ts`, `pointColorSchemes.ts` |
| 온보딩·스포트라이트 | `OnboardingGuideLayer` 등 (크롬과 연동) |

---

## 5. 작업 시 체크리스트 (연동 UX)

새 기능을 넣을 때 아래를 검토하고, 해당하면 본 문서 **§3·§6**을 업데이트한다.

1. **right_area**가 바뀌는 트리거가 무엇인가? (left 모드 / selection / 둘 다)
2. **같은 객체**를 좌·우·3D에서 볼 때 ID·이름이 일치하는가?
3. Analysis·Bottom을 동시에 쓸 때 **스코프**(어느 로봇·어느 구간)를 사용자가 잃지 않는가?
4. [`Property/menu`](./Property/menu)에 해당 객체 조합이 있으면 탭 구성이 스펙과 맞는가?
5. **프로퍼티 모달·서브 모달**: 화면에 나오는 필드가 [`Property/property_db/`](./Property/property_db/) 해당 md(로봇·셀·엔드이펙터·facility 등)와 **필드키·라벨·노출 여부**까지 맞는지 작업마다 대조한다.  
   - 불일치 시 **코드 기준** vs **문서 기준** vs **둘 다 수정** 중 무엇으로 맞출지 **사용자에게 반드시 확인**한다.  
   - 답이 없으면 **구현을 진행하지 않고**, 이후에도 **답이 나올 때까지 같은 질문을 반복**한다. (에이전트 규칙: `.cursor/rules/sfd-property-db-modals.mdc`)

---

## 6. 백로그 (문서 기반 다음 단계 제안)

우선순위는 팀 합의 후 조정; 여기서는 **연동 가치가 큰 순**으로 초안만 둔다.

1. **공유 컨텍스트 도입**: `activeCellId`, `activeRobotId`, `leftMode`를 상위(또는 store)에서 정의하고 Analysis 패널·Property·(향후) bottom analysis가 동일 소스를 읽게 하기.
2. **Analysis ↔ right**: Analysis 활성 시 우측을 “선택 셀 속성” 프레임으로 전환 (와이어프레임 § Right area · analysis).
3. **CategoryMenu ↔ Tree**: 카테고리 변경 시 트리 노드 선택 동기화, 역방향 동일.
4. **Tree 로드맵**: Design / Robot Cell 분할 및 Cross-highlight 최소 버전.
5. **left “자세히 보기” → bottom**: 해당 로봇·구간으로 bottom analysis 포커스.

완료 시 항목을 백로그에서 제거하거나 “완료”로 옮기고 변경 이력에 기록한다.

---

## 7. 변경 이력

| 날짜 | 요약 |
|------|------|
| 2026-04-09 | 초안 작성. `wireframe_guide_kr.md`, `Property/menu`를 기준으로 통합 방향·현재 갭·참고 경로·백로그 정리. |
| 2026-04-09 | 속성 DB: `Property/property_db/gripper.md` 삭제, `end-effector.md`를 정식 참조로 전환. 통합 문서 §1 링크 갱신. `robot_property_db.md` 경로를 `property_db/`로 수정. |
| 2026-04-09 | `property_db/facility.md` 추가(설비 속성 필드). 통합 문서 §1에 링크. |
| 2026-04-09 | §5: 프로퍼티·서브 모달 ↔ `property_db` 정합 검토 및 불일치 시 사용자 결정 절차 추가. Cursor 규칙 `sfd-property-db-modals.mdc` 추가. |
