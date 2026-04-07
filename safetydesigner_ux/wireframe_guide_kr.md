## 문서 설명

이 문서는 safetydesigner(이하 sfd)의 ux/ui 기획 및 프론트 화면 구현 참고를 위한 가이드라인 문서다.
연결된 figma page에서 ‘wireframe_kit_작업중’이라는 페이지에 제작된 실제 ui 와이어프레임에 대한 설명을 담고 있다. 
sfd는 웹에서 구동하는 SaaS 형태 sw이며, 1920*1080에서 동작하는 ui이고, 권장 브라우저는 chrome이다.
즉, 디자인 결과물의 width는 1920이며, chrome 기본 ui를 제외한 영역을 ui height로 지정한다. 

## UX/UI에 대한 대략적 컨셉 설명
- selection 종류
    - guide
        - 각기 다른 selection들이 조합된 frame을 확인할 수 있는 예시 화면
    - top_area
        - left_gnb_menu에서 어떤 것이 활성되었냐에 따라 달라지는 gnb 메뉴 종류
    - left_area
        - left_gnb_menu와 gnb에서 활성화된 기능에 따라 달라지는 영역에 대한 가이드
    - 3d_area
        - 3d 공정이 보여지는 영역
    - right_area
        - 3d area에서 선택된 객체 혹은 left menu에서 선택된 요소에 따라 우측에 보여지는 UI 영역에 대한 가이드
    - bottom_area
        - 3d 공정 영역 하단에서 timeline, analysis 영역에 대한 기본 틀 가이드
        - **위치 제한**: left_area(좌측 패널)를 침범하지 않으며, 3d_area와 right_area 영역 하단에만 배치됨. left_area가 열려 있으면 bottom_area는 가변적으로 줄어들어 left_area를 가리지 않음.
- selection 하위에 있는 frame에 대한 설명
    - top_area
        - top_gnb_design,analys_mode: 기본 gnb, left_gnb에서 library, tree, analysis 가 활성화되어 있을 때 해당 gnb로 노출
        - top_riskassessment: left_gnb에서 riskassessment 활성화되었을 때 해당 gnb로 노출
    - left_area
        - left_gnb_menus
            - 항상 화면 좌측에 고정되어서 보이며, 활성화된 메뉴가 클릭되면 메뉴에 맞게 ui가 변경됨
                - library: 3d공정 설계에 필요한 로봇, 생산설비, 안전 설비, 도면 등 라이브러리 설치 항목 노출
                - tree: 3d 공정 설계 객체 계층을 볼 수 있는 tree 구조를 가진 UI
                    - tree는 기본 너비 320px, 최대 460px까지 늘리거나 줄일 수 있다. 
                - analysis: 분석 결과의 핵심 문구와 안전대책에 대한 솔루션을 안내받을 수 있는 기능
                - riskassessment: 위험성 평가 보고서 문서에 대한 내용 확인과 수정을 할 수 있는 기능
                - safetyai: ai기능을 활성화하기 위한 메뉴
        - 3d area
            - 3d공정 view가 나오는 화면, 필요에 따라 3d화면에 필요한 ui를 표현함.
        - bottom_area
            - bottom_menu_timeline: 모션 설계된 time block을 확인하고 모션에 대한 상세 설정을 하는 timeline형태의 ui (영상 편집 프로그램과 유사). left_gnb에서 library, tree 가 활성화되어 있을 때 기본적으로 나옴.
            - bottom_menu_analysis: 분석 결과 그래프와 분석 결과에 대한 table이 나오는 영역. left_gnb에서 analysis 기능을 활성화했을 때 보여짐.
        - right_area
            - right_property_riskassessment
                - left_gnb에서 riskassessment를 활성했을 때 위험성 평가 보고서 preview가 나오는 영역. 이 영역에서 보고서에 들어갈 문구 수정과 발급까지 진행, 3d화면과 같이 보면서 진행 가능하다.
            - property_normal
                - 기본적으로 3d_area에서 객체를 클릭하거나 tree에서 객체를 클릭했을 때 나오는 property창

## UX/UI에 대한 기본적인 공통 동작
    - **bottom_area 영역 제한**: bottom_area(타임라인, 분석)는 left_area(좌측 패널)를 침범하지 않는다. left_gnb + left_area는 화면 상단부터 하단까지 전체 높이를 유지하며, bottom_area는 3d_area와 right_area 영역 하단에만 배치된다. left_area가 열려 있으면 bottom_area는 가변적으로 줄어들어 left_area를 가리는 일이 없어야 한다.
    - left_gnb_menu 클릭 시 나오는 영역은 기본 width 320px에서 최대 460px까지 늘릴 수 있다.
    - right_property 영역은 기본 width 320px에서 최대 460px까지 늘릴 수 있다.
    - left_gnb_menu 클릭 시 나오는 영역과, right_property 영역은 ui를 통해 최소화를 할 수 있고 열고 싶을 때 다시 열 수 있다.
    - bottom_menu_analysis에 나오는 그래프와 테이블은 dock in/out이 가능하다.
- UI 디자인 가이드
    - 버튼이나 활성화여부를 결정하는 ui의 경우에는 호버, 셀렉트, 기본 상태를 구분하여 표현한다. 

### left_gnb 기능 활성화에 따른 left_area에 대한 처리

#### 분석(analysis)

**1. 기본 동작 및 트리거 (Trigger & State)**

- **활성화 조건**
  - Left GNB에서 `Analysis` 아이콘 클릭 시
  - 3D Canvas 또는 Tree에서 특정 '로봇 셀' 혹은 '로봇' 객체 선택 시 자동 전환
- **충돌 분석 연동**: 로봇 속성에서 PFL 기능이 활성화된 경우, 분석 결과에 '충돌안전분석' 섹션이 자동으로 추가됨

**2. UI 섹션별 구성 상세**

**A. 셀 선택 및 상태 요약 (Header)**

- **상태 요약 카드**
  - 🔴 **위험 영역**: 안전거리 미달 및 충돌 허용치(CRI) 초과 항목 수
  - 🟢 **적정**: 모든 안전 규격 및 충돌 기준 충족 항목 수
  - 🟠 **최적화 기회**: 로봇 속도 상향 또는 충돌 위험 저감 기회 수

**B. 추천 솔루션 (Recommend Solution)**

- **PFL 기반 제안**: "충돌 예상 부위의 압력이 기준치를 초과합니다. 로봇 베이스 위치를 10cm 이동하거나 접촉 면적을 넓히는 형상을 추천합니다."
- **인터랙션**: [추천 결과 적용하기] 버튼 클릭 시 3D 모델의 위치/포즈가 즉시 변경됨

**C. 로봇/장치 분석 결과 (Detailed Result)**

- **위치**: left_area 내 로봇/장치 분석 결과 섹션 (right_area Property 아님)
- **섹션 1: 로봇 (충돌안전분석)**
  - **장치 표기**: "로봇 1" 등 장치명만 표시 (괄호 내 유형 문구 생략)
  - **분석 조건 요약**: 로봇 영역 내부에 분석 구간별 PFL 결과 카드 노출
    - 분석 구간 선택 드롭다운 (예: 분석 구간 1)
    - 분석 결과: `Pass / Fail` 표시
    - Max CRI (Collision Risk Index) 값 표시 (예: 0.7)
    - 분석 시간: 00:00:00 ~ 00:03:05
    - 분석 완료 시간 (예: 2026-02-19 12:53:26)
- **섹션 2: 센서 (ISO 13855 안전거리)**
  - ISO 13855 기준 최소 안전거리(S) 충족 여부
- **섹션 3: 기타 장치**
  - 펜스 등 안전 설비 분석 결과
- **인터랙션**: 부적합/주의 항목에 [자세히 보기] 클릭 시 신체 부위별 충돌 에너지 분석 리포트 팝업

**D. 미해결 이슈 (Unresolved Issues)**

- **항목**: 센서 사각지대, 기계적 끼임, 충돌 분석 미수행 구간 등 리스팅

### 트리(tree) 
#### 상하 분리형 통합 트리 버전 (Split-Pane Tree)
- Design Tree (상단: 물리적 설계 레이어)
    - **구성 요소**: Scene 내의 모든 3D 객체 (로봇, 컨베이어, 펜스, 센서, 단순 장애물 등).
    - **계층 구조**: 부모-자식(Parent-Child) 관계 기반의 물리적 종속성 표현.
    - **주요 기능**:
        - **Visibility/Lock**: 개별 객체의 가시성 및 편집 잠금 제어.
        - **Group 생성**: 단순 설계 편의를 위한 폴더링 (안전 '셀'과는 무관).
        - **Drag & Drop**: 자유로운 레이어 순서 변경 및 종속 관계 설정.
        - 기타 레이어 우클릭 시 편의 메뉴 제공
- Robot Cell Tree (하단: 안전/방호 논리 레이어)
 
- **셀 구성**
    - 만들어진 셀을 가장 상위 그룹으로 두며, 셀 리스트들이 가장 상위 depth에 노출된다. 로봇 구성, 방호 대책, 안전 영역, 제어 단위는 셀 내부 하위로 들어간다.
- **로봇 구성**
    로봇 타입별(A~D) 특성에 따른 하위 요소를 노출합니다.
    - **Manipulator**: 그리퍼 > 작업대상물 연동 구조.
    - **Mobile**: 경로 설정(Path Point) 및 동작 시나리오.
    - **모션 설정**: Waypoint별 작업대상물 연결 상태 표시.
- **시스템 로봇 방호 대책 (Protection Group)**
    장비의 배치보다 **'어떤 안전 기술이 적용되었는가'**에 집중합니다
    - **PFL(동력 힘 제한)**: 로봇/그리퍼/대상물별 **충돌예상부위 정의**
    - **협동작업공간**: 해당 공간에 소속된 로봇들 간의 간섭 및 협동 관계 정의.
    - **방호 장치 (참조형)**: 펜스, 스캐너, 라이트커튼 등 로봇 셀 내에서 사용한 방호장치 리스트 노출
- **로봇 셀 안전 영역 (Safety Zone - Readonly)**

    설계와 대책의 결과로 도출된 자동 계산 영역입니다.
    - **영역 종류**: 운전영역, 최대 운전영역, 감지/감속/정지 영역.
    - **정보**: 각 영역에 적용된 `Safety Logic` (PFL, SSM 등) 정보 병기.
- **로봇 제어 단위 (Control Group)**
    - **Safety Relay/PLC**: 비상정지 스위치, 인터락, 로봇 등 제어기에 묶인 장치 리스트. 연결된 단위 시각화
- **두 트리 간의 유기적 인터랙션 (Sync Logic)**
    구현해야 할 핵심 연결 로직입니다
    1. **Cross-Highlight**: `Design Tree`에서 객체 선택 시, `Robot Cell Tree` 내 해당 객체가 포함된 셀/방호 그룹이 강조됨.
    2. **Logic to Physical**: `Robot Cell Tree`에서 '감지 영역' 클릭 시, 3D Canvas에서 해당 센서의 감지 메쉬(Mesh)가 하이라이트됨.
    3. **Real-time Update**: 우측 **Property**에서 값을 수정하면 두 트리의 배지(CRI, Pass/Fail)가 실시간 동기화됨.
    4. **UI 비율**: Design Tree 60%, Robot Cell Tree 40% 비율로 영역을 점유한다. 단, UI 비율을 늘리고 줄일 수 있는 형태(리사이즈 핸들)로 구성한다. 

### 라이브러리(Library)
- left_gnb 메뉴에서 ‘라이브러리’가 선택되었을 때나오는 left_area에 대한 설명이다
- 가장 큰 카테고리 (ex. 로봇) > 작은 카테고리 (ex.협동로봇) > 리스트를 볼 수 있다.

### Right area에 대한 동작 및 콘텐츠

- Right area는 left_gnb에서 활성화한 기능, 3d area혹은 tree에서 선택한 객체에 따라 내용이 변경됨
- library
    - library 버튼을 눌렀다고 해서 바로 right area가 열리지는 않음
    - library버튼을 클릭한 뒤 객체를 골라서 3d 화면에 설치하는 순간 설치된 객체의 property가 right area에 나옴. 이때 right area에는 “property_noramal”사이즈의 frame이 나옴
- tree
    - tree에서 선택된 객체가 있으면 해당 객체에 맞는 속성이 “property_noramal”에 보여짐
        - 단, 객체 별로 property구성이 다름.
        - 아래는 각 객체별 참고할 figma link임. 해당 link에 담긴 구성을 참고하라.
            - 로봇:https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=1223-112067&t=MBNWxKGoDxjMikFX-4
            - 그리퍼: https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=675-86543&t=MBNWxKGoDxjMikFX-4
            - 모션 :https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=703-74517&t=MBNWxKGoDxjMikFX-4
            - 충돌예상부위: https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=1256-302021&t=MBNWxKGoDxjMikFX-4
            - 설비
                - 설비 내 객체 종류별로 보이는 데이터는 다른데, 형식은 같음
                https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=1234-212585&t=MBNWxKGoDxjMikFX-4
            - 협동작업공간
                - https://www.figma.com/design/h4cCL5yzBcZ6fw5QNEqpQn/Design-System-v1.2?node-id=1256-310247&t=MBNWxKGoDxjMikFX-4
- analysis
    - analysis를 활성화하면 속성에는 해당 로봇 cell에 속성이 보여짐
- risk assessment
    - risk assessment를 활성화하면 right area에는 위험성 평가 보고서 preview가 노출됨

 ### bottom area에 대한 동작 및 콘텐츠
- bottom area는 기본적으로 기능에 따라 기본적으로 보여지는 tab이 달라짐. 그래도 bottom area에 있는 tab을 변경하면 보고싶은 콘텐츠로 이동 가능함.
- UI 활성조건
    - 기본적으로 bottom area는 닫혀있음
        - tree에서 ‘모션 설정을 클릭하거나’ , ‘모션 설계모드’에 진입했을때 timeline이 열림
        - analysis 분석 기능을 활성화하면 analysis가 열림
        - 혹은 사용자가 직접 bottom area를 열었을 때 ui가 열림
- timeline은 기본적으로 설계된 로봇에 대한 모션을 확인하고 재생할 때 사용하는 ui로서 3d영역 로봇이 움직일때 모션 timeline도 함께 움직임.
- **재생바 (Playbar)**
    - **글로벌 사용**: Library, Tree, Analysis, Safety AI 화면에서 공통으로 사용 가능.
    - **위치 (Bottom area 상태별)**:
        - **Bottom area 비활성**(접힌 상태): 3D area 하단에 표시.
        - **Bottom area 활성**(펼친 상태):
            - **타임라인 탭**: 타임라인 툴바 중앙에 배치. 툴바 레이아웃: `[정지구간 추가 | 정지구간 삭제]` | `[재생바]` | `[확대/축소 슬라이더]`
            - **분석 탭**: 분석 콘텐츠 상단에 표시.
    - **재생바 구성**: 재생/일시정지, 시간 표시(00:00.0/03:05.3), 속도(×1), 진행 슬라이더, 반복 버튼. 너비 400px, 중앙 정렬.
    - **타임라인 탭 전용 UI** (타임라인 탭 안쪽):
        - **정지구간 추가/삭제 버튼**: 툴바 왼쪽.
        - **확대/축소 슬라이더**: 툴바 우측 상단.
- analysis는 2가지로 구분됨.
    - motion cri (로봇 모션 cri)
    - collaborative space cri (협동작업공간 별 cri)
    - anlaysis 영역에서는 table(표), graph(그래프) 형태의 정보가 보여지며, 표와 그래프 영역의 비율은 사용자가 늘리고 줄일 수 있음.
    - dock 메뉴를 눌러 bottom area영역에서 빼서 다른 곳에서 ui를 띄워놓다가 다시 dock in을 해서 bottom area에 넣을 수 있음.
- [중요] 분석 기능활성화 후 left_area에서 로봇 충돌안전분석 정보 자세히 보기를 클릭하면 해당 로봇에 맞는 분석정보가 bottom area에 노출됨. 즉, 로봇에 맞게 그때그때 정보가 달라짐.

### Safety AI에 대한 동작 및 콘텐츠
- 기능 리스트 및 역할
    - 위험 시나리오 생성
        - 위험성 평가 보고서에 ai가 판단한 위험시나리오를 sfd 위험성 평가 데이터 형식에 맞게 구성해서 위험성 평가 기능쪽에 생성, 이때 ai가 추천한 위험시나리오라는 것은 표현해야 하며, 위험성 평가 영역에서 ui로 ai가 추천한건 제외할 수 있는 필터링 ui가 필요함.
    - 안전 대책 추천 받기
        - 현재 설계된 공정에 대한 진단(분석) functioncall해서 진단결과를 받고, 진단 결과를 기반으로 안전대책 설계안을 추천해주는 기능
            - 설계안은 3d preview를 만들고 미리보기 후 적용할 수 있다.
        - 이때, 미리 cashing한 노하우 md 문서를 참고하고, html 형태나 사진 + 글로 구성된 노하우 참고 콘텐츠를 보여줌.
        - 이때 사용자는 현장의 제약 사항을 입력하여 이를 이해한 추천안을 받을 수 있다.
            - 제약사항에 대한 종류
                1. 사이클 타임 변경 불가 (즉, 모션 설계를 변경하기 어려울 수 잇음, 단 cycletime은 유지하고 궤적 변경할 수는 있음) 
                2. PFL 적용 의사가 있는 현장인지?
                3. 그리퍼 형상을 변경할 수 있는 상황인가요?
                4. 속도 조절이 가능한 현장인가요?
                5. 그리퍼 형상에 압력 값을 낮추기 위한 커버 등의 부착이 가능한 현장인가요? (식/음료 등 조리공정 등 특이 사항이 있는 현장은 커버 부착이 어렵습니다.)
                6. 로봇 움직이는 모션의 경로를 수정이 가능한 현장인가요? (이건 - 컨설턴트 도움을 좀 받긴해야 할듯)
    - 안전대책 검토안 문서 발급 받기
        - 안전 대책 진단 + 추천에 대한 내용을 ppt 혹은 pdf 문서로 받을 수 있다.
    - 위험성 평가 보고서 초안 만들기
        - 현재 설계된 3d공정을 기반으로 위험성 평가 보고서 초안을 만들어서 미리보기를 할 수 있다.
    - AI가 하는 모든 작업은 사용자가 승인을 하고 진행한다.