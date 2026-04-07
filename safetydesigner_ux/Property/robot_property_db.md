# 로봇 프로퍼티 DB (robot property fields)

로봇 상세·인증 정보에 사용되는 필드 정의입니다.

| 한글명 | 필드키 | 타입 | 단위 | 형식/제약 | 필수 | 코드 | tab 이름 | 설명 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 로봇 이름 | name | String | | | TRUE | | 로봇 상세 | 사용자 지정 이름 (예: Robot 1) |
| 로봇 유형 | robot_type | Array[String] | | | TRUE | | 로봇 상세 | MANIPULATOR, MOBILE, MOBILE_MANIPULATOR, DUAL_ARM |
| 제조사 | manufacturer | String | | | TRUE | | 로봇 상세 | Doosan, MiR, UR 등 |
| 모델명 | model_name | String | | | TRUE | | 로봇 상세 | A0509, M250 등 |
| 협동운전 여부 | coop_mode | Boolean | | | TRUE | | 로봇 상세 | True/False |
| 위치 및 방향 | position | JSON | | | TRUE | | 로봇 상세 | {x, y, z, rx, ry, rz} |
| 가반하중 | payload | Numbers | kg | 정수형 | TRUE | | 로봇 상세 | |
| 최대 리치 | max_reach | Numbers | mm | 1, 올림 | TRUE | | 로봇 상세 | 로봇 팔 최대 도달 거리 |
| 축 수 | axis_count | Numbers | 축 | | TRUE | | 로봇 상세 | |
| 로봇 무게 | robot_weight | Numbers | kg | 3, 올림 | TRUE | | 로봇 상세 | |
| 로봇 크기 | dimensions | JSON | | | TRUE | | 로봇 상세 | {w, d, h} (*모바일 로봇용) |
| 현재 부하 무게 | load_mass | Numbers | kg | 3, 올림 | TRUE | | 로봇 상세 | 현재 그리퍼+작업대상물 무게, 소수점 3자리까지 |
| 안전 등급 (PL) | safety_pl | Array[String] | | | TRUE | | 인증 정보 | a, b, c, d, e (ISO 13849-1) |
| 카테고리 | safety_category | Array[String] | | | TRUE | | 인증 정보 | Cat B, 1, 2, 3, 4 |
| 안전 등급 (SIL) | safety_sil | Numbers | | 정수형 | TRUE | | 인증 정보 | IEC 62061 |
| 인증 현황 | certifications | Array | | | TRUE | | 인증 정보 | ["KCs", "ISO_10218_1", "CE", "UL"] - 직접입력 값도 포함 |
| 로봇 정지 시간 | machine_stop_time_t2 | Numbers | sec | 3, 올림 | TRUE | t_2 | 인증 정보 | 출력 신호가 OFF 된 후 로봇이 정지될 때까지의 최대 시간 |
| TCP 제한 속도 | limit_speed | Numbers | mm/s | 1, 올림 | TRUE | | 인증 정보 | |
