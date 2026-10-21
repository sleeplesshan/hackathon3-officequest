# Dual-Brain Memory — Office Quest
## Hot
- 스펙 우선순위: PRD §2 > PRD > DESIGN/tokens > refs > Harness > skills (근거: PRD §0.2)
- 앱 위치 ./officequest, 고정 버전 Harness §1.1 (근거: PRD D23, Harness §1.1)
- 하이퍼 프레임 1,800ms, JS 타이머 닫힘, 경과시간은 performance.now (근거: PRD D3, D28, D38)
- E2E 게이트는 Phase 태그 누적 grep, test:e2e는 항상 새 빌드 (근거: Harness §4, §1.4)
- 별점 EXP 50/75/100/125/150, 별 3개 = 기존 수치, 반려 최대 2회, 운영자 ops는 플레이어 아님 (근거: PRD D40, D45, D47)
- [verified][refs:1][last_referenced:2026-10-21][last_verified:2026-10-21] P1 공용 API: getSeed(now), applyAction(db,action,actor,now), canAction(), activatePersona()/ensureDay()/ensureThread(). Provider는 dispatch 결과에 현재 persona login 활성화를 적용. 근거: src/lib/db 및 단위178개.
## Warm
- [verified][last_verified:2026-10-21] P4a 에디터는 로컬 script/global 선검증 뒤 React 래퍼 마운트; 실패시 fallback. 파일 ID 고유성/유형변경 중 비동기 결과 취소 회귀 PASS. 근거:03-quest-create.
- [verified][last_verified:2026-10-21] P4b 진행중 제3자에게 결과 본문뿐 아니라 제출·검수 타임라인도 비공개. 원래 요청은 접기 보존, 최신 작업물 우선. 40E2E/8Visual PASS.
- [verified][last_verified:2026-10-21] P5 danger 토스트를 자동info가 덮지 않음; 운영자는 거래Teams/좋아요불가. 조직도 선택은 localstate, 적용시sharedguard/dispatch. 58E2E/10Visual PASS, sync최대5ms.
- [verified][last_verified:2026-10-21] P5b canonical Harness15: kang 등록제한r2; Kim 두종류를 한 action에서 적용→정규순서r3quest_post/r4purchase; 해제는r4만. flag연결모달대상=subjects부분집합, 일반모달=전체players. 근거:PRD D56/8.16,Harness5.2.

- [verified][last_verified:2026-10-21] P6최종: unit207/E2E69/Visual20,65MUST매핑0누락,구도10PASS. 진행중/revision aside는 진행로그가 먼저이며 보상카드는 모집중/완료만; Teams와107px여백 회귀. 근거:qa/AC_MAP.md,qa/VISUAL_QA.md,DUAL_BRAIN_AUDIT.md.

## Cold
## Archived
