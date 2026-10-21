# DUAL_BRAIN_AUDIT — Office Quest

## 결과 요약
- 상태: **COMPLETE — P0 → P1 → P2 → P3 → P4a → P4b → P5 → P5b → P6**. 각 단계 게이트를 통과한 뒤 다음 단계로 진행.
- 최종 검증: **2026-10-21 17:51 KST**, macOS / Node26.7 / 설치된 Chrome155 채널. Playwright 번들 다운로드 실패 후 Harness B2 폴백 사용.
- 최종 source의 unfiltered E2E17파일69/69, Visual20/20(10DOM+10비교), 구도10/10 PASS. ENV-SKIP0, MISSING0, 미해결 MUST0.
- 리뷰 모드: subagents Right Brain / Left Brain. 필수 문서 전체와 refs01–10 확인.
- **TinyMCE5.10.2 고정 사유: PRD D39의 셀프호스팅 버전 계약.** 로컬postinstall 및 실제iframe 입력 검증, Tiny Cloud 요청0.

| 명령 / 검사 | 최종 결과 |
|---|---|
| `npm ci --prefer-online` | PASS exit0 · local TinyMCE postinstall |
| `npm run verify:tokens` | PASS · 루트 tokens.css 바이트 동일 |
| `npm run qa:forbidden` | PASS · 97 source files |
| `npm run typecheck` | PASS · tsc 오류0 |
| `npm run lint` | PASS · 경고0 |
| `npm run test:unit` | PASS · 207/207,14파일 |
| `npm run build` | PASS · 각 최종 브라우저 명령의 fresh production build |
| `PW_CHANNEL=chrome npm run test:e2e` | PASS · 필터 없이69/69,17파일 |
| `PW_CHANNEL=chrome npm run test:visual` | PASS · 필터 없이20/20,화면10+비교10 |
| 개발 서버 `npm run dev` | PASS · localhost3000,주요5라우트200·하이드레이션·에디터·console0 |
| `git diff --check` | PASS |

- PRD §11: kim1500→1200→0, lee300→700→1900, leeEXP750/Lv8/2/2,별점4.0/9 및 양측 거래원장 PASS.
- AC_MAP: MUST65개 전부 매핑, 빈칸0. 시드 퀘스트7·물품8·플래그4, 별점5종·반려2회·제재멱등/만료/해제 회귀 PASS.
- 전 브라우저 게이트 console/pageerror0, 외부 이미지0, Tiny Cloud0, Paperlogy실제로드10/10. `.github/copilot-instructions.md` 존재.
- SHOULD 실측: hydration53.6ms, persona2.4ms(native production별도표본), HyperFrame post1801ms/112rAF·clear1802ms/113rAF, Teams1206ms, Broadcast4/2ms·storage4/4ms. 근거 `officequest/qa/performance/*.json`.
- 사용자 요청 `Opinion.md`15개 항목 완료. 실행 안내 `RUN.md`, 원본 명세·refs 보존. 현재 개발서버 실행 중.

## P0 Bootstrap — PASS
- verify:tokens, qa:forbidden, typecheck, lint, unit 2/2, build, playwright --list 통과.
- `PW_CHANNEL=chrome npm run test:e2e -- --grep '@p0\b'`: 1/1 PASS (prod build). TinyMCE 셀프호스팅 파일 존재. Paperlogy 6/6 다운로드.
- 설치 캐시 ETARGET는 --prefer-online으로 해결(버전 변경 없음); 첫 ERESOLVE 후 legacy-peer-deps 재시도는 실패했고 최종 설치는 일반 peer 검증으로 성공.
- Playwright 번들 다운로드 시간 초과; B2에 따라 설치된 Chrome 채널 사용. 명령에 PW_CHANNEL=chrome 지정.
- Right Brain: App screen 해석 및 refs 구도 확인. Left Brain: Appendix A 설정 전체 일치 확인.
- 현재 Phase: P1 Domain & State / 다음 작업: 도메인 및 상태 엔진 구현과 단위 테스트.

## Checkpoint #1 — P1 Domain & State (2026-10-21 16:28 KST)
**Brief**: P1 Exit Gate / PRD §3·5·6·7·9, AC-8.14.2·8.16.6·8.16.7 / src/lib/**, tests/unit/**.
**Right Brain**: 순수 가드·리듀서와 로컬 시연 구조 적합. 잔액 부족 NPC 승인 실패 토스트 누락 발견 → INVALID_STATE만 조용히 처리하도록 fixed.
**Left Brain**: 독립 실행으로 입력 불변성, 별 1개 정산(lee700P/700EXP), 플래그 4개 ID·근거·순서 확인. Provider 자정 직후 액션의 login 미션 초기화 누락 → activatePersona(applyAction(...))로 fixed. 타이머 초기화·중복 실행·캡처된 actor·revision 동일값 문제도 fixed.
**좌뇌 체크**: 에스크로/환불, 일2회, 타이머3액션 제한·마켓예외, 첨부유형, 예약자제한, 별점5종·2회반려, 제재우선순위·멱등·정규ID·부분적용, 플래그R1–R5·14일·재발·수명, 누적별점≠최근원장, KST 단위테스트 확인.
**판정**: malformed kinds 배열 런타임 가드 fixed. 나머지 중대 미해결 없음. DB 저장 후 방송/rollback 구현; 두 탭 300ms·타이머 실제 브라우저 통합은 해당 후속 게이트에서 검증.
**결정**: PRD §7.2 잔액부족 승인취소와 §5.1 실패불변 양립을 위해 reducer는 무변경 오류, Provider가 별도 declineRequest 액션으로 취소 후 오류 토스트.
**게이트 결과**: unit178/178 PASS(13파일, 상태머신 모든 행, RNG500스텝 불변식, 가드480조합), typecheck PASS, lint 경고0 PASS, qa:forbidden PASS.

## Checkpoint #2 — P2 Shell & Design (2026-10-21 KST)
**Brief**: P2 Exit Gate / AC-8.1.1–8.1.6,8.2.1–8.2.5,8.3 / AppShell,Dashboard,Daily,UI,app-layout/fonts.
**Right Brain**: 1440px3열·1200px2열 구도, 겹침·잘림 없음. 1440px 피드 글씨10–11px 지적 → 제목13–14px, 메타12px로 fixed. 인기게임패드33은 PRD명시로 refmonitor24 차이 rejected.
**Left Brain**: 페르소나4·운영자배지·랭킹제외·값·테마·타이머·시즌확인·수령 검토. 일일 헤더의 초기화카운트다운,누적EXP/다음티어232EXP 누락 → fixed. 코인효과는 P3에서 통합.
**통합 수정**: Tailwind `ring` utility와 커스텀 클래스 충돌로 파란사각형 → progress-ring으로 fixed. Tailwind preflight와 제목굵기 충돌 → scoped800으로 fixed. 아직 없는 후속라우트 Next 자동prefetch404 → 실제링크 유지,prefetch=false로 fixed.
**게이트**: 최초 기능9개 전부 통과했으나 미래라우트prefetch의 console404로 실패; 수정후 Chrome9/9PASS, console/pageerrors0. 리뷰수정후 최종 fresh build + P0/P2 누적9/9 PASS(일일카운트다운09:57:12·누적1168·다음티어232 포함). P2 PASS.
**단계 해석**: P2의 ops전환은 아직 없는 게시판 대신 이미 구현된 /quests/daily에서 검사(Harness B23). /admin접근검사는 원래 P5b에서 수행. P3는 Harness허용대로 P2와 병렬 작성하되 종료판정은 P2이후. P2 화면이 실제sprite를 사용하므로 PixelSprite+원본행렬data는 P2커밋에 포함,나머지모션은 P3커밋.

## P3 Pixel & Motion — PASS (2026-10-21 KST)
- 원본 source/mock/sprites.js 26종 픽셀을 팔레트+행렬로 보존. Sprite 게이트29/29 PASS; 누적 unit207/207 PASS. source 우선 포팅규칙에 따라 head crop16x14 보존(DESIGN16x13과 차이 기록).
- HyperFrameHost portal/queue/focus trap/ESC차단, JS1800ms, static reduced-motion 같은타이밍. 단일canvas cap120,seededparticles,6티어오라·마스터번개·코인효과·탭280ms슬라이드 통합.
- freshbuild 누적 E2E16/16 PASS, Visual01·02 2/2 PASS, Paperlogy실제로드true, console/pageerrors0, root토큰/타입/린트검사PASS.
- normal A1801ms/113rAF, B1802ms/112rAF, reduced A/B·queue·Tab/ShiftTab/ESC·focusrestore PASS. 근거: qa/performance/*.json, tests/e2e/12-hyperframe.spec.ts.
- Visual발견 favicon404 → 로컬픽셀favicon추가 fixed. 1920px 일일캐릭터요약하단잘림 → dashboard전용hero400 범위축소,compact240·mission간격조정 fixed; 재촬영에서6티어·누적/다음티어요약 모두1080안에표시.
- 화면01·02 스타일덤프,Paperlogy로드기록,PNG는 qa/screens에저장.

## Checkpoint #3 — P4a Quest 작성·게시판 — PASS
- 기능 누적28/28 PASS, Visual DOM5/5 PASS, console/pageerror0. 최초 대체에디터 테스트가 React 래퍼의 전역 미존재 콘솔 오류로 실패 → 로컬 스크립트 선검증 후 마운트하여 fixed.
- Left Brain: 고정 시각 반복 업로드의 첨부 ID 충돌과 유형 전환 중 600ms 작업 결과 누출 발견 → useId+일련번호, 세대 토큰 취소로 fixed. 두 회귀 E2E 추가·통과.
- Right Brain: 1440px 유형 설명 소실, 저잔액 슬라이더 눈금 불일치, 폴백의 실제 없는 자동 저장 문구 → fixed. aside400px 계약 유지.
- Visual04에서 footer·체크리스트 잘림 발견 → 본문 간격·에디터430px 상한·우측 카드 압축·업로드 버튼 인라인 배치로 수정, 최종 재촬영 대기.
- B23 의존성 적용: AC-8.6.3 상세 이동·조회수는 상세 라우트가 생기는 P4b에서 검사. P4a 필터·URL·등록 검사를 줄이지 않음.
- 사용자 추가 요청에 따라 Opinion.md를 작성하고 실제 병목·명세 빈틈·수정 제안 및 재현 근거를 계속 누적.

- 최종 fresh production build 누적E2E28/28 + Visual5/5 PASS. Visual04 등록버튼 y995.8–1039.8, 체크리스트 y669.4–878.1, 첨부 y889.8–961.8로 1080px 내 표시. 타입·린트·토큰·금지패턴·unit207PASS. P4a PASS.

## Checkpoint #4 — P4b Quest 상세·Teams — PASS
- 요청·지원 서약, 1명 채택, 작업자 결과물, 반려·v2/v3 재제출, 별점 모달·즉시 정산·하이퍼프레임B, 편집·삭제 환불 연결.
- 1차 누적E2E39/39 PASS, Teams 자동응답1205–1206ms, console0. 공개범위 회귀를 추가한40/40 PASS.
- Left Brain: 제3자에게 제출 카드만 숨기고 aside 타임라인에 이력이 노출되는 오류 → participant 또는 완료 상태만 제출·검수 타임라인 표시하도록 fixed. 제3자 비공개/완료 공개 브라우저 회귀 PASS.
- Right Brain: 진행중 원래 요청 본문이 검수 UI를 밀어내는 순서 문제 → 원문 펼치기(details)와 compact stepper 적용. ref07 검수 버튼 첫 화면 표시 확인.
- Visual06 잠금 패널·규칙이 밀림 → 한 차례 간격·표·잠금 프리뷰 압축. 최종 40E2E+8Visual 재검증 중. screenshot finite CSS animations disabled로 순간 진입 fade만 끝내고 JS1800ms/1200ms 검사는 유지.
- 추가된 계약 강화 의견은 Opinion.md 08(역할별 공개범위)·09(상태별 정보 우선순위)에 기록.

- 최종 fresh production build 누적E2E40/40 + Visual8/8 PASS, console0. 06 규칙4칸 y936.3–1006.8, 07 검수바 y820.9–930.1로1080내표시. Teams1206ms. unit207·타입·린트·금지패턴PASS. P4b PASS.

## Checkpoint #5 — P5 Village — PASS
- 마켓4열·8상품, URL필터·6마을카운트·좋아요, 사진프리셋8종·로컬 JPEG800px/.82·5장/2MB·취소, 등록·수정, 거래A/B/B', 무료0P, 정산·거래내역, 조직도검색·선택후적용 구현.
- Left Brain: ops의 거래Teams버튼이 openThread 예외를 노출 → 플레이어만표시·좋아요가드·공용대화API예외처리 fixed. 일반알림이 승인실패오류를 덮을 경로 → danger우선순위, 시나리오알림캐시초기화 fixed.
- Right Brain: ref09에없는 카드CTA는 DESIGN요구·즉시구매흐름의 허용차이. 조직도작은행동텍스트는 실제ref10검토예정.
- 최종기능누적58/58 E2E PASS, console0. 수동거래승인/거절, NPC1200ms, 무료양측0Tx, 구매잔액재검증·취소·구체오류, 운영자읽기전용회귀 PASS.
- 두탭동기화: Broadcast 좋아요3ms/등록4ms, storage폴백4ms/5ms(300ms기준이내). JSON qa/performance/sync-*.json. malformed/schema불일치DB재적재·페르소나/테마보존 PASS.
- unit207/207·타입·린트·금지패턴 PASS. 10Visual freshbuild진행중.

- 최종소스 freshbuild E2E58/58 + Visual10/10 PASS, console0. 조직도이름16px·행동12px·수평배치로가독성수정, 코인효과종료후750ms촬영해10화면안정. 09전체8카드1080내,10스크롤목록·하단컨트롤모달안포함. 최종sync Broadcast4/5ms·storage4/4ms. P5 PASS.

## Checkpoint #6 — P5b Admin & Moderation — PASS
- 운영자전용 /admin·루트리다이렉트·4플래그근거·등록/구매제재·해제·무혐의·읽기전용감사로그·5일경고·현재시각에따른만료·제재사용자배너통합.
- Left Brain: subjects한정/전체players선택,활성kind잠금·기간사유,기본3일,부분제재·정규ID,변경시sharedguard재평가,flag재발,만료250ms갱신검토;새중대오류없음.
- Right Brain: 1440px에서표min1140이본문inner1062초과해핵심조치일부숨음 → flags/restrictions의오른쪽조치열sticky로fixed. 자동click의스크롤이놓칠수있어초기가시성DOM검사추가.
- 단위207·타입·린트·금지패턴PASS. high요약범위의명세선택여지는전체high로결정,Opinion13에보완안기록. 접근/만료/교차탭제재해제포함누적65E2E+10Visual진행중.

- 최종sticky소스 freshbuild 누적E2E65/65 + Visual10/10 PASS, console0. canonicalr2/r3/r4·r4만해제/r3유지·양방향제재/해제동기화·허용지원/제출/Teams/좋아요·1일만료1초내·5일경고/reset·권한200/리다이렉트·1440초기조치bbox PASS. P5b PASS.


## P6 QA & Final Audit — PASS
- `npm ci --prefer-online` exit0, postinstall로 로컬 TinyMCE 생성. 버전·lockfile 변경 없음. 고정 의존성의 audit 경고15건(4moderate/9high/2critical)은 Harness B10에 따라 기록하고 유지.
- 최종 AC 대조: PRD §8 MUST65개, AC_MAP66행(SHOULD8.6.4 추가), 누락0·빈칸0. E2E17파일(00–15,99).
- 첫 전체 E2E의 새 측정 테스트 오류: 고정 clock에서 Navigation Timing 빈 배열, 보류script의 라우트 해제 경합, 무료나눔 색 토큰을 범용success와 혼동 → 네이티브 시계·unrouteAll wait·전용mk-free-fg로 fixed. 앱 회귀가 아닌 테스트 계측 오류. 이후69/69 PASS.
- unfiltered freshbuild E2E69/69, Visual20/20(10DOM+10비교), console/pageerror0. 비교10PASS/0MISSING, Paperlogy10/10실제로드true.
- Right Brain 최종10장 검토: 9PASS/1FAIL. ref07 타임라인 하단이 Teams(y496) 뒤로 밀림 → DESIGN ref07에 맞춰 진행중/보완요청의 중복 보상 카드를 제거하고 진행로그를 aside 맨 위에 배치(fix attempt1). 회귀 DOM timeline.bottom389≤Teams.top496(107px여백) PASS. 최종 fresh E2E69/69+Visual20/20 및 Right Brain 재검토PASS로 fixed 판정.
- Left Brain 최종 소스 감사: 에스크로·환불·별점·일일2회·반려2회·양측원장·무료0P·운영자권한의 새 MUST오류 없음. 엄격한 동시탭 충돌 직렬화는 명세/검증 범위 밖이며 일반교차탭동기화는 E2E로 확인.
- SHOULD 측정(수정 전 전체 게이트): hydration50.5ms, persona click→points DOM2.4ms(native performance, production); HyperFrame post1802ms/113rAF·clear1800ms/112rAF; Teams1207ms; Broadcast5/3ms·storage3/4ms. JSON qa/performance에 저장.
- 개발모드 실행: 작업폴더 `npm run dev` → localhost3000 Ready; /,/quests/board,/quests/new,/village,/admin200·하이드레이션·로컬TinyMCE·플레이어용 접근제한 화면·console0 확인. 최종구도수정 후 서버 재시작 및 같은 개발모드5라우트 재검사PASS.
- Opinion.md15개 항목에 관찰/현재해결/명세보완제안 누적. 원본PRD·Harness·DESIGN·tokens·refs 보존.

- 최종 판정: Right Brain 구도10/10PASS(ref07 fix1회), Left Brain 중대 MUST 미해결0. AC65개/원본시드/전체플로우/권한/별점·반려/만료/콘솔·네트워크/설치·빌드의 DoD 전항목 충족. 추가 코드 변경 없음.
