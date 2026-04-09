# 로봇 프로퍼티 DB

머니퓰레이터 기준 필드 정의. 아래는 **섹션별 소표** — 같은 열 구조로 반복됨.

**열:** `필드키` · `한글명` · `타입` · `단위` · `형식`(소수·올림 등) · `속성노출` · `기호` · `tab` · `설명`

---

## 기본 정보

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| robot_id | 로봇 ID | String | — | — | FALSE | — | — | 고유 식별자 |
| name | 로봇 이름 | String | — | — | TRUE | — | 로봇 상세 | 사용자 지정 이름 (예: Robot 1) |
| robot_type | 로봇 유형 | Array[String] | — | — | TRUE | — | 로봇 상세 | MANIPULATOR, MOBILE, MOBILE_MANIPULATOR, DUAL_ARM |
| manufacturer | 제조사 | String | — | — | TRUE | — | 로봇 상세 | Doosan, MiR, UR 등 |
| model_name | 모델명 | String | — | — | TRUE | — | 로봇 상세 | A0509, M250 등 |

## 안전 설정

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| coop_mode | 협동운전 여부 | Boolean | — | — | TRUE | — | 로봇 상세 | True/False |

## 위치 정보

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| position | 위치 및 방향 | JSON | — | — | TRUE | — | 로봇 상세 | {x, y, z, rx, ry, rz} |

## 물리 속성

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| payload | 가반하중 | Numbers | kg | 정수형 | TRUE | — | 로봇 상세 | — |
| max_reach | 최대 리치 | Numbers | mm | 1, 올림 | TRUE | — | 로봇 상세 | 로봇 팔 최대 도달 거리 |
| axis_count | 회전 관절 수 | Numbers | 축 | — | TRUE | — | 로봇 상세 | — |
| robot_weight | 로봇 무게 | Numbers | kg | 3, 올림 | TRUE | — | 로봇 상세 | — |
| dimensions | 로봇 크기 | JSON | — | — | TRUE | — | 로봇 상세 | {w, d, h} (*모바일 로봇용) |
| load_mass | 현재 부하 무게 | Numbers | kg | 3, 올림 | TRUE | — | 로봇 상세 | 현재 그리퍼+작업대상물 무게, 소수점 3자리까지 |

## 안전 속성 (인증 정보 tab)

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| safety_pl | 안전 등급 (PL) | Array[String] | — | — | TRUE | — | 인증 정보 | a, b, c, d, e (ISO 13849-1) |
| safety_category | 카테고리 | Array[String] | — | — | TRUE | — | 인증 정보 | Cat B, 1, 2, 3, 4 |
| safety_sil | 안전 등급 (SIL) | Numbers | — | 정수형 | TRUE | — | 인증 정보 | IEC 62061 |
| certifications | 인증 현황 | Array | — | — | TRUE | — | 인증 정보 | ["KCs", "ISO_10218_1", "CE", "UL"], 직접입력 값 포함 |
| machine_stop_time_t2 | 로봇 정지 시간 | Numbers | sec | 3, 올림 | TRUE | t_2 | 인증 정보 | 출력 신호 OFF 후 정지까지 최대 시간 |
| limit_speed | TCP 제한 속도 | Numbers | mm/s | 1, 올림 | TRUE | — | 인증 정보 | — |

## 안전 영역 (주로 비노출 · 계산/백엔드)

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| operating_space | 운전 영역 | JSON | — | — | FALSE | — | — | {points: [{x,y,z}, ...]} Polygon |
| Reachable_space | 최대운전영역 | JSON | — | — | FALSE | — | — | {points: [{x,y,z}, ...]} Polygon |
| restricted_space | 제한 영역 | JSON | — | — | FALSE | — | — | {points: [{x,y,z}, ...]} Polygon |
| interference_space | 간섭 영역 | JSON | — | — | FALSE | — | — | {points: [{x,y,z}, ...]} Polygon |
| operating_height | 위험요인영역의 높이 | Numbers | mm | 1, 올림 | FALSE | — | — | — |

## 모바일 전용

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| mobile_speed | 이동 속도 | Numbers | mm/s | 1, 올림 | FALSE | — | — | 주행 속도 |
| braking_distance | 제동 거리 | Numbers | mm | 1, 올림 | FALSE | — | — | 주행 중 정지 거리 |
| operating_zone | 운전구역 | JSON | — | — | FALSE | — | 인증 정보 | {points: [{x,y,z}, ...]} Polygon |

## 관계 (셀·장치 참조)

| 필드키 | 한글명 | 타입 | 단위 | 형식 | 속성노출 | 기호 | tab | 설명 |
|--------|--------|------|------|------|----------|------|-----|------|
| linked_controller_id | 연결된 제어기 | String | — | — | TRUE | — | 셀 참조 정보 | 제어기 ID 참조 |
| linked_axis_ids | 연결된 부가축 | Array[String] | — | — | TRUE | — | 셀 참조 정보 | 결합된 부가축 리스트 |
| linked_cell | 연결된 셀 | String | — | — | TRUE | — | 셀 참조 정보 | 분석 로직으로 연결된 셀 ID |
| linked_estop | 연결된 비상정지 스위치 | String | — | — | TRUE | — | 셀 참조 정보 | 연결된 비상정지 버튼 ID |
| linked_gripper | 연결된 그리퍼 | Array[String] | — | — | TRUE | — | 셀 참조 정보 | 연결된 그리퍼 리스트 ID |
| linked_workpiece | 연결된 작업대상물 | Array[String] | — | — | TRUE | — | 셀 참조 정보 | 연결된 작업대상물 리스트 ID |
| linked_collipoint | 연결된 충돌예상부위 | Array[String] | — | — | FALSE | — | — | 로봇에 연결된 충돌예상부위 목록 |
| linked_coworkspace | 연결된 협동작업공간 목록 | Array[String] | — | — | FALSE | — | — | 로봇에 연결된 협동작업공간 목록 |
