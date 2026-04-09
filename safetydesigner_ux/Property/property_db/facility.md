# Facility 속성 db

설비(펜스, 라이트 커튼, 레이저 스캐너, 안전매트, 비상정지, 터널 가드, 부가축, 인터록 가드/스위치 등) 필드 정의. **섹션별 소표** — 열 구조 동일.

**열:** `필드키` · `한글명` · `구분` · `타입` · `단위` · `소수점` · `프로퍼티 노출` · `기호` · `설명` · `우선순위` · `프로퍼티 노출 여부` · `기본값 처리` · `필수 입력 여부` · `비고 / 표준 근거`

---

## facility · 공통

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| device_type | 유형 | 공통 | String | — | — | TRUE | — | 라이트커튼, 안전매트, 인터록 가드 | — | — | — | — | — |
| can_reach_over | 우회 가능 여부 | 공통 | Boolean | — | — | TRUE | — | — | — | — | FALSE | — | — |
| is_indirect_approach | 장애물 우회 접 | 공통 | Boolean | — | — | TRUE | — | 장애물로 인해 우회하여 접근하는 경우 | — | — | FALSE | — | — |

## 펜스

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| fence_id | 펜스 ID | 기본 | String | — | — | TRUE | — | ID | — | — | — | — | — |
| name | 펜스 이름 | 기본 | String | — | — | TRUE | — | — | — | — | — | — | — |
| position | 펜스 위치 및 방향 | 위치 | JSON | — | — | FALSE | — | {x, y, z, rx, ry, rz} | — | — | — | — | — |
| mesh_opening_size | 펜스 구멍 크기 | 스펙 | Numbers | mm | 1, 올림 | FALSE | — | — | — | — | — | — | — |
| Opening_position | 개구부 위치 | 스펙 | JSON | — | — | FALSE | — | {x, y, z} | — | — | — | — | — |
| Opening_offset_x | 개구부 너비 | 스펙 | Numbers | mm | 1, 올림 | FALSE | — | — | — | — | — | — | — |
| Opening_offset_y | 개구부 높이 | 스펙 | Numbers | mm | 1, 올림 | FALSE | — | — | — | — | — | — | — |
| panel_height | 패널 높이 | 스펙 | Numbers | mm | 1, 반올림 | FALSE | — | — | — | — | — | — | — |
| bottom_gap | 바닥 갭 | 스펙 | Numbers | mm | 1, 올림 | FALSE | — | — | — | — | — | — | — |
| protection_method | 개구부 방호조치 | 스펙 | Array[String] | — | — | TRUE | — | NONE, TUNNEL_GUARD, MUTING_SENSOR | — | — | — | — | — |
| fixation_type | 앵커 고정 여부 | 스펙 | Array[String] | — | — | TRUE | — | ANCHOR (볼트 고정), WEIGHT (무게추), CLAMP | — | — | — | — | ANCHOR (앙카): 바닥 콘크리트에 구멍을 뚫고 앙카 볼트를 박아서 영구 고정. 가장 튼튼하지만 이동이 어려움(가장 일반적).<br>WEIGHT (무게추): 바닥에 고정하지 않고 펜스 하단에 무거운 블록을 달아 쓰러지지 않게 함. 이동이 자유로우나 강한 충격에 밀릴 수 있음(임시 펜스 등).<br>CLAMP (클램프): 기존 설비(H빔, 기계 프레임)나 전용 레일에 집게로 물리듯 연결. 구멍 없이도 튼튼하게 고정 가능. 설비와 펜스를 일체화할 때 사용. |
| has_door | 출입문 여부 | 스펙 | Boolean | — | — | TRUE | — | TRUE: 도어 있음(인터록 필요), FALSE: 없음 | — | — | — | — | — |
| certifications | 인증 현황 | 안전 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "OSHA"] | — | — | — | — | — |
| linked_robot_ids | 연결된 로봇 | 관계 | Array[String] | — | — | TRUE | — | 펜스 내부에 있는 로봇 ID 목록 [UUID] | — | — | — | — | — |
| linked_interlock_id | 연결된 인터록 | 관계 | String | — | — | TRUE | — | (출입문 있을 시) 부착된 안전 스위치 ID | — | — | — | — | — |
| linked_cell | 연결된 셀 | 관계 | Array[String] | — | — | TRUE | — | 분석 로직으로 연결된 셀 ID 목록 | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 이 센서의 신호를 받는 안전제어기 ID | — | — | — | — | — |
| linked_guard_id | 연결된 가드 | 관계 | String | — | — | TRUE | — | 연결된 터널 가드 ID | — | — | — | — | — |

## 라이트 커튼

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| lightcurtain_id | 라이트 커튼 ID | 기본 | String | — | — | FALSE | — | ID | — | — | — | — | — |
| manufacturer | 제조사 | 기본 | String | — | — | TRUE | — | SICK, Keyence 등 | — | — | — | — | — |
| model_name | 모델명 | 기본 | String | — | — | TRUE | — | microScan3 등 | — | — | — | — | — |
| position | 라이트 커튼 위치 및 방향 | 기본 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} | — | — | — | — | 설치 거리와 보호 높이로 이루어진 직사각형의 중심점 |
| detection_capability_d | 분해능(=검출폭) | 스펙 | Numbers | mm | 1, 올림 | TRUE | d | — | — | — | — | — | 소수점 1자리. 침입거리($C$) 계산의 핵심.(손가락/손/몸) |
| safeguard_response_time_t1 | 응답시간 | 스펙 | Numbers | sec | 3, 올림 | TRUE | t_11 | 방호설비가 구동되어 출력 신호가 OFF 될 때까지의 최대 시간 | — | — | — | — | 소수점 3자리 ($0.001$). 정지시간($T$) 계산용. |
| protective_length | 유효 감지 길이 | 스펙 | Numbers | mm | 1, 반올림 | FALSE | — | 센서의 맨 아래 빔부터 맨 위 빔까지의 전체 유효 길이 | — | — | — | — | 센서의 유효 감지 길이. |
| num_beams | 빔의 갯수 | 스펙 | Numbers | EA | — | FALSE | — | — | — | — | — | — | — |
| install_distance | 설치 거리 | 설치 | Numbers | mm | 1, 반올림 | FALSE | — | — | — | — | — | — | 소수점 1자리. 위험원(로봇)과의 실제 거리 ($D$). |
| install_direction | 설치 각도 | 설치 | Numbers | deg | 0, 반올림 | TRUE | — | 기준면으로부터 감지영역의 설치 각도 | — | — | — | 90º | — |
| protective_h | 설치 높이 | 설치 | Numbers | mm | 1, 버림 | — | — | 방호장비의 설치 높이. 위험요인영역에서 가장 멀리 떨어진 감지영역의 경계선 기준. | — | — | — | — | — |
| espe_type | ESPE 타입 | 기능 안전성 | Array[String] | — | — | TRUE | — | Electro-Sensitive Protective Equipment 타입, TYPE_2, TYPE_4 | — | — | — | — | espe_type: 센서 타입(Type 2 / 4). Type 2 선택 시: safety_pl은 최대 **'c'**까지만 선택 가능하도록 제한. Type 4 선택 시: safety_pl **'e'**까지 전체 선택 가능. |
| safety_pl | 안전 등급 (PL) | 기능 안전성 | Array[String] | — | — | TRUE | — | c, d, e | — | — | — | — | ISO 13849-1. 로봇 시스템 요구 등급(PLr)과 비교 검증용. |
| safety_sil | 안전 등급 (SIL) | 기능 안전성 | Numbers | — | — | TRUE | — | 2001, 2, 3 | — | — | — | — | IEC 62061 기준. |
| safety_category | 카테고리 | 기능 안전성 | — | — | — | TRUE | — | — | — | — | — | — | 내부 회로 구조(이중화 여부 등). |
| certifications | 인증 현황 | 안전 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "UL", "TUV"] | — | — | — | — | 국내 유통 시 KCs 필수 확인. |
| linked_robot_ids | 연결된 로봇 | 관계 | Array[String] | — | — | TRUE | — | 펜스 내부에 있는 로봇 ID 목록 [UUID] | — | — | — | — | — |
| linked_cell | 연결된 셀 | 관계 | Array[String] | — | — | TRUE | — | 분석 로직으로 연결된 셀 ID 목록 | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 이 센서의 신호를 받는 안전제어기 ID | — | — | — | — | — |

## 레이저 스캐너

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| sensor_id | 센서 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 센서 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Scanner 01 | — | — | — | — | — |
| manufacturer | 제조사 | 기본 정보 | String | — | — | TRUE | — | SICK, Keyence 등 | — | — | — | — | — |
| model_name | 모델명 | 기본 정보 | String | — | — | TRUE | — | microScan3 등 | — | — | — | — | — |
| position | 위치 (좌표) | 설치 | JSON | — | — | TRUE | — | {x, y, z} | — | — | — | — | — |
| rotation | 회전 (각도) | 설치 | JSON | — | — | TRUE | — | {rx, ry, rz} | — | — | — | — | — |
| detection_plane | 감지 방향 | 설치 | Array[String] | — | — | TRUE | — | Parallel(수평), Orthogonal(수직), ANGLED(경사각) | — | — | — | — | — |
| install_height | 설치 높이 | 설치 | Numbers | mm | 1, 반올림 | FALSE | — | — | — | — | — | — | — |
| install_angle | 설치 각도 | 설치 | Numbers | deg | 3, 반올림 | FALSE | — | — | — | — | — | — | — |
| detection_capability_d | 분해능 | 스펙 (Spec) | Numbers | mm | 1, 올림 | TRUE | — | — | — | — | — | — | — |
| safeguard_response_time_t1 | 응답시간 | 스펙 (Spec) | Numbers | sec | 3, 올림 | TRUE | t_11 | 방호설비가 구동되어 출력 신호가 OFF 될 때까지의 최대 시간 | — | — | — | — | — |
| max_range | 최대 감지 반경 | 스펙 (Spec) | Numbers | mm | 1, 버림 | TRUE | — | 부채꼴 등 반지름 길이 | — | — | — | — | — |
| fov_angle | 최대 시야각 | 스펙 (Spec) | Numbers | deg | 3, 버림 | TRUE | — | 부채꼴 각도 | — | — | — | — | — |
| espe_type | ESPE 타입 | 기능 안전성 | Array[String] | — | — | TRUE | — | TYPE_3, TYPE_2 | — | — | — | — | — |
| safety_pl | 안전 등급 (PL) | 기능 안전성 | Array[String] | — | — | TRUE | — | b, c, d (보통), e | — | — | — | — | — |
| safety_sil | 안전 등급 (SIL) | 기능 안전성 | Numbers | — | — | TRUE | — | 1, 2 (보통), 3 | — | — | — | — | — |
| safety_category | 카테고리 | 기능 안전성 | Array[String] | — | — | TRUE | — | Cat 2, Cat 3 | — | — | — | — | — |
| certifications | 인증 현황 | 인증 정보 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "UL", "TUV"] | — | — | — | — | — |
| linked_robot_ids | 연결된 로봇 | 관계 | Array[String] | — | — | TRUE | — | 레이저 스캐너 안전로직으로 연결된 로봇 ID 목록 [UUID] | — | — | — | — | — |
| linked_cell | 연결된 셀 | 관계 | String | — | — | TRUE | — | 분석 로직으로 연결된 셀 ID | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 매트 컨트롤러 ID | — | — | — | — | 원문 기준 문구 유지 |

## 안전매트

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| sensor_id | 안전매트 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 안전매트 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Mat 01 | — | — | — | — | — |
| manufacturer | 제조사 | 기본 정보 | String | — | — | TRUE | — | (UI) Omron, Pinnacle 등 | — | — | — | — | — |
| model_name | 모델명 | 기본 정보 | String | — | — | TRUE | — | (UI) UMA Series 등 | — | — | — | — | — |
| position | 위치 (좌표) | 기본 정보 | JSON | — | — | TRUE | — | {x, y, z} | — | — | — | — | — |
| is_step_height | 바닥면과의 높이 차이 유무 | 기본 정보 | Boolean | — | — | FALSE | — | — | — | — | FALSE | — | — |
| width | 매트 크기 (폭) | 기본 정보 | Numbers | mm | 1, 버림 | TRUE | — | X축 | — | — | — | — | — |
| depth | 매트 크기 (깊이) | 기본 정보 | Numbers | mm | 1, 버림 | TRUE | — | Y축 | — | — | — | — | — |
| slope_angle | 경사각 | 기본 정보 | Numbers | deg | — | FALSE | — | ($^\circ$) | — | — | — | — | — |
| safeguard_response_time_t1 | 응답시간 | 스펙 | Numbers | sec | 3, 올림 | TRUE | t_11 | 방호설비가 구동되어 출력 신호가 OFF 될 때까지의 최대 시간 제어기를 포함할 경우 제어기의 지연시간을 0으로 넣어야함. | — | — | — | — | — |
| min_detect_weight | 최소 감지 무게 | 스펙 | Numbers | kg | — | FALSE | — | — | — | — | — | — | — |
| max_load | 최대 허용 하중 | 스펙 | Numbers | kg/cm² | — | FALSE | — | — | — | — | — | — | — |
| install_type | 설치 위치 | 설치 | Array[String] | — | — | TRUE | — | FLOOR(바닥), STEP(계단) | — | — | — | — | — |
| step_height | 바닥면과의 높이 차이 | 설치 | Numbers | mm | 1, 버림 | FALSE | h | — | — | — | — | — | — |
| protective_stop_cat | 보호정지 방식 | 설치 | — | — | — | TRUE | — | 0,1, 연결된 모든 센서(스캐너, 커튼 등)가 감지했을 때 적용되는 정지 방식. | — | — | — | — | — |
| safety_pl | 안전 등급 (PL) | 기능 안전 | Array[String] | — | — | TRUE | — | c, d, e | — | — | — | — | — |
| safety_sil | 안전 등급 (SIL) | 기능 안전 | Numbers | — | — | TRUE | — | 2001, 2, 3 | — | — | — | — | — |
| certifications | 인증 현황 | 기능 안전 | Array | — | — | TRUE | — | ["KCs", "CE", "UL"] | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | Array[String] | — | — | TRUE | — | 매트 컨트롤러 ID | — | — | — | — | — |
| linked_cell | 연결된 셀 | 관계 | String | — | — | TRUE | — | 분석 로직으로 연결된 셀 ID | — | — | — | — | — |

## 비상정지 스위치

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| estop_id | 스위치 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Main E-Stop | — | — | — | — | — |
| manufacturer | 제조사 | 기본 정보 | String | — | — | FALSE | — | IDEC, Rockwell 등 | — | — | — | — | — |
| model_name | 모델명 | 기본 정보 | String | — | — | FALSE | — | XW1E 등 | — | — | — | — | — |
| position | 위치 및 방향 | 설치 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} 3D 배치 좌표 | — | — | — | — | — |
| install_height | 설치 높이 | 설치 | Numbers | mm | — | TRUE | — | ISO 13850 권장: $0.6m \sim 1.7m$. 범위를 벗어나면 [Warning] 경고 필요. | — | — | — | — | — |
| mounting_type | 부착 형태 | 설치 | String | — | — | TRUE | — | PANEL(제어반), PENDANT(티칭기), POST(독립형), FENCE(펜스부착) 접근성 평가 시 사용.(티칭기는 이동 가능하므로 위치 가변적) | — | — | — | — | — |
| estop_cat_default | 비상정지 방식 | 스펙 | String | — | — | TRUE | — | 0, 1 이 버튼을 눌렀을 때의 정지 방식.(버튼마다 다를 수 있음) CAT 0: 즉시 전원 차단(급정거). CAT 1: 제어 정지 후 차단(감속). $T_{robot}$ 증가함. | — | — | — | — | — |
| reset_type | 리셋(해제) 방식 | 스펙 | String | — | — | TRUE | — | TWIST, PULL, KEY (참고용) 키 타입은 관리자만 해제 가능. | — | — | — | — | — |
| contact_type | 접점 구조 | 안전 | String | — | — | FALSE | — | 2NC(이중화), 1NC1NO. 2NC 필수.(하나가 융착되어도 다른 하나가 끊어줘야 함) | — | — | — | — | — |
| b10d_value | B10d 값 | 안전 | Numbers | times | — | FALSE | — | 사이클 횟수 (예: 100,000) ISO 13849-1. 기계적 수명 신뢰성 계산용.(PL 산출 근거) | — | — | — | — | — |
| safety_pl | 안전 등급 (PL) | 안전 | String | — | — | TRUE | — | c, d, e 스위치 자체의 달성 등급. | — | — | — | — | — |
| — | 재기동 방식 | 안전 | String | — | — | TRUE | — | 수동(), 자동(Auto) | — | — | — | — | 원문 필드명 비어 있음 |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 제어기 ID 신호를 받아 로봇을 세우는 주체. | — | — | — | — | — |
| span_of_control | 연결된 로봇과 설비 | 관계 | Array | — | — | TRUE | — | controlled_device_ids, 연결된 로봇과 설비 리스트 노출 | — | — | — | — | — |
| linked_cell | 연결된 셀 | 관계 | String | — | — | TRUE | — | 분석 로직으로 연결된 셀 ID | — | — | — | — | — |

## 터널 가드

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| guard_id | 가드 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Conveyor Tunnel 01 | — | — | — | — | — |
| tunnel_length | 터널 길이 (깊이) | 치수 | Numbers | mm | — | TRUE | — | [핵심] 터널이 펜스 밖으로 튀어나온 길이. 이 길이만큼 안전거리가 확보됨. | — | — | — | — | — |
| opening_width | 입구 너비 | 치수 | Numbers | mm | — | TRUE | — | 물체(박스)가 들어가는 입구 가로폭. | — | — | — | — | — |
| opening_height | 입구 높이 | 치수 | Numbers | mm | — | TRUE | — | 물체가 들어가는 입구 세로높이. | — | — | — | — | — |
| install_height | 설치 높이 | 설치 | Numbers | mm | — | FALSE | — | 바닥에서 터널 바닥면까지의 높이 컨베이어 높이와 일치해야 함. | — | — | — | — | — |
| position | 설치 위치 및 방향 | 설치 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} 펜스 개구부 위치에 스냅(Snap)되어야 함. | — | — | — | — | — |
| parent_fence_id | 연결된 펜스 ID | 관계 | String | — | — | TRUE | — | 펜스 ID | — | — | — | — | — |

## 부가축 (전, 레일 가이디드)

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| axis_id | 축 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Linear Track 01 | — | — | — | — | — |
| manufacturer | 제조사 | 기본 정보 | String | — | — | FALSE | — | Gudel, Festo, SMC 등 | — | — | — | — | — |
| axis_type | 구동 타입 | 기본 정보 | Array[String] | — | — | FALSE | — | LINEAR_TRACK(바닥 x,y이동), GANTRY(천장에서 x,y축으로 이동), VERTICAL_LIFT(z축 이동) | — | — | — | — | — |
| total_rail_length | 전체 레일 길이 | 물리 스펙 | Numbers | mm | — | TRUE | — | — | — | — | — | — | — |
| effective_stroke | 유효 스트로크 | 물리 스펙 | Numbers | mm | — | FALSE | — | — | — | — | — | — | — |
| carriage_dimensions | 캐리지 크기 | 물리 스펙 | JSON | — | — | FALSE | — | {w, d, h}, 로봇을 태우고 레일 위를 달리는 네모난 판(이동대/슬라이더)의 가로, 세로, 높이 | — | — | — | — | — |
| max_speed | 최대 속도 | 물리 스펙 | Numbers | mm/s | — | TRUE | — | — | — | — | — | — | — |
| payload | 가반하중 | 물리 스펙 | Numbers | kg | — | TRUE | — | — | — | — | — | — | — |
| stop_time | 정지 시간 | 물리 스펙 | Numbers | sec | — | TRUE | — | — | — | — | — | — | — |
| origin_position | 설치 위치 및 방향 | 설치 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} | — | — | — | — | — |
| limit_speed | 운전 제한 속도 | 설치 | Numbers | mm/s | — | TRUE | — | — | — | — | — | — | — |
| soft_limit_range | 소프트 리밋 | 설치 | JSON | — | — | FALSE | — | {min: 0, max: 2000} | — | — | — | — | — |
| safety_pl | 안전 등급 (PL) | 안전 | Array[String] | — | — | TRUE | — | d, e | — | — | — | — | — |
| certifications | 인증 현황 | 안전 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "UL"] | — | — | — | — | — |
| mounted_robot_id | 연결된 로봇 | 관계 | String | — | — | TRUE | — | 로봇 ID | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 제어기 ID | — | — | — | — | — |

## 인터록 가드

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| guard_id | 가드 ID | 기본 | String | — | — | FALSE | — | 고유 식별자 | — | — | — | — | — |
| name | 이름 | 문 속성 | String | — | — | TRUE | — | (UI) Door 01 | — | — | — | — | — |
| position | 설치 위치 및 방향 | 문 속성 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} 3D 월드 좌표 기준 위치 및 회전. | — | — | — | — | — |
| door_size | 문 크기 | 문 속성 | JSON | — | — | TRUE | — | {w, h, d} 문의 폭, 높이, 두께. | — | — | — | — | — |
| door_type | 도어 타입 | 문 속성 | Array[String] | — | — | FALSE | — | HINGE, SLIDING, FOLDING [3D 연출] 문이 열리는 궤적 애니메이션 결정. | — | — | — | — | — |
| safety_pl | 안전 등급 (PL) | 안전 | Array[String] | — | — | TRUE | — | d, e | — | — | — | — | — |
| certifications | 인증 현황 | 안전 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "UL"] | — | — | — | — | — |
| opening_direction | 열림 방향 | 관계 | Array[String] | — | — | FALSE | — | LEFT, RIGHT, UP (HINGE일 때) 경첩 위치 및 회전축 결정. | — | — | — | — | — |
| handle_position | 손잡이 위치 | 관계 | Array[String] | — | — | FALSE | — | LEFT, RIGHT, CENTER 작업자 접근성 및 스위치 부착 위치 참조용. | — | — | — | — | — |
| mounted_switch_ids | 부착된 스위치 | 관계 | Array[String] | — | — | TRUE | — | [switch_uuid_1, ...] [핵심] 이 문에 달려있는 스위치 ID 리스트.(문 열림 $\to$ 스위치 신호 발생) | — | — | — | — | — |
| linked_fence_id | 연결된 펜스 | 관계 | String | — | — | TRUE | — | 부모 펜스 그룹 ID. 펜스 구조물의 일부로 인식. | — | — | — | — | — |

## 인터록 스위치

| 필드키 | 한글명 | 구분 | 타입 | 단위 | 소수점 | 프로퍼티 노출 | 기호 | 설명 | 우선순위 | 프로퍼티 노출 여부 | 기본값 처리 | 필수 입력 여부 | 비고 / 표준 근거 |
|--------|--------|------|------|------|--------|---------------|------|------|----------|-------------------|-------------|----------------|------------------|
| device_id | 스위치 ID | 기본 정보 | String | — | — | FALSE | — | — | — | — | — | — | — |
| name | 이름 | 기본 정보 | String | — | — | TRUE | — | (UI) Switch 01 | — | — | — | — | — |
| model_info | 제조사/모델 | 기본 정보 | String | — | — | FALSE | — | SICK, Omron 등 | — | — | — | — | — |
| position | 설치 위치 및 방향 | 기본 정보 | JSON | — | — | TRUE | — | {x, y, z, rx, ry, rz} | — | — | — | — | 3D 월드 좌표 기준 위치 및 회전. |
| locking_type | 잠금 방식 | 스펙 | Array[String] | — | — | TRUE | — | NONE, SPRING, SOLENOID | — | — | — | — | NONE: 문 열면 급정지 ($S$ 필요). SOLENOID: 정지 후 문 열림 ($S \approx 0$). |
| holding_force | 잠금 유지력 | 스펙 | Numbers | N | — | FALSE | — | 사람이 억지로 당겨도 안 열리는지 확인. | — | — | — | — | — |
| aux_release | 보조 해제 | 스펙 | Array[String] | — | — | FALSE | — | NONE, KEY, BUTTON | — | — | — | — | [감금 방지] 갇혔을 때 안에서 열 수 있는가? |
| power_to_lock | 전원 차단 시 | 스펙 | Boolean | — | — | FALSE | — | True/False | — | — | — | — | False(Spring Lock) 권장. 정전 시 잠김 유지 여부. |
| safety_pl | 안전 등급 (PL) | 안전 | Array[String] | — | — | TRUE | — | c, d, e | — | — | — | — | 위험성 평가 결과($PL_r$) 만족 여부. |
| certifications | 인증 현황 | 안전 | Array[String] | — | — | TRUE | — | ["KCs", "CE", "UL", "CCC"] | — | — | — | — | 국내 설치 시 KCs 마크가 없으면 [Warning] 경고. 유럽 수출 시 CE 필수. |
| coding_level | 코딩 레벨 | 안전 | Array[String] | — | — | FALSE | — | LOW, HIGH | — | — | — | — | LOW: 자석으로 뚫림(오조작 위험 경고). HIGH: RFID(안전). |
| b10d_value | B10d 값 | 안전 | Numbers | times | — | FALSE | — | 사이클 횟수 | — | — | — | — | 기계적 수명 및 고장 확률 계산용. |
| direct_opening | 강제 개방 | 안전 | Boolean | — | — | FALSE | — | True/False | — | — | — | — | 접점 융착 시 강제 분리 기능 유무. |
| mounting_offset | 부착 오프셋 | 설치 | JSON | — | — | FALSE | — | {x, y, z} | — | — | — | — | 문(Parent)의 원점 기준 상대 위치. |
| parent_guard_id | 부모 가드 | 관계 | String | — | — | TRUE | — | 부착된 문 ID | — | — | — | — | — |
| linked_controller_id | 연결된 제어기 | 관계 | String | — | — | TRUE | — | 제어기 ID | — | — | — | — | 신호를 받는 대상. |
| linked_fence_id | 연결된 펜스 | 관계 | String | — | — | TRUE | — | 펜스 ID | — | — | — | — | — |
