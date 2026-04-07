# Gripper 속성 (Property)

| 한글명 | 필드명 | 타입 | 필수 | 단위 | 비고 | 표시 |
|--------|--------|------|------|------|------|------|
| 제조사 | manufacturer | String | TRUE | | | TRUE |
| 모델명 | model_name | String | TRUE | | | TRUE |
| 자체 무게 | self_weight | Numbers | TRUE | kg | 3, 올림 | TRUE |
| 무게 중심 (CoM) | self_com | JSON | TRUE | | | TRUE |
| 그리퍼 치수 | dimensions | JSON | TRUE | | | TRUE |
| 그리퍼 가반하중 | payload | Numbers | TRUE | kg | 3. 올림 | TRUE |
| 위치 및 방향 | position | JSON | TRUE | | | TRUE |
| 전원 상실 시 동작 | power_loss_action | String | FALSE | | | TRUE |
| 연결된 로봇 | parent_robot_id | String | TRUE | | | TRUE |
| 연결된 작업물 | attached_workpiece_ids | Array[String] | TRUE | | | TRUE |
| 연결된 셀 | linked_cell | Array[String] | FALSE | | | TRUE |
| 연결된 충돌예상부위 | linked_collipoint | Array[String] | FALSE | | | TRUE |
