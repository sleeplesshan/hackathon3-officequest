# PRD — 오피스퀘스트 (Office Quest) × 효성마을

> **이 문서는 GitHub Copilot Agent Mode(Autopilot)가 사람에게 묻지 않고 끝까지 구현하기 위한 제품 요구사항 정의서입니다.**
> 실행 절차·스택·검증 방법·막힘 대응은 `Harness.md`, 시각 규칙은 `DESIGN.md`와 `tokens.css`, 화면 구도는 `refs/01–10_*.png`가 담당합니다.
> 원본 PRD(`해커톤3조_PRD.md`)의 요구사항은 **하나도 빼지 않고** 이 문서로 옮겼습니다. 원본과 다른 부분은 모두 §2 결정 테이블에 근거와 함께 기록했습니다.

---

## 0. 문서 사용법

### 0.1 저장소 레이아웃 (저장소 루트 기준 상대경로)

```
./PRD.md                    ← 이 문서 (무엇을 만드는가)
./Harness.md                ← 어떻게 만들고 검증하는가 (Autopilot 실행 규약)
./DESIGN.md                 ← 디자인 시스템 명세 (폰트·컬러·컴포넌트·스프라이트·모션)
./tokens.css                ← CSS 변수 토큰 (수정 금지, 앱에 복사해서 사용)
./refs/01_dashboard_light.png … ./refs/10_village_detail_orgchart.png   ← 화면 레퍼런스 10장 (1920×1080)
./motion/officequest_intro.html   ← 20초 소개 모션 (살아있는 모션·스프라이트 레퍼런스, ?t=초 로 정지)
./reference/                ← 참조 구현 자료(읽기 전용): 캐릭터 PNG 24종(D76) · 검증된 스크립트 · 참조 화면 · 템플릿 (§0.4)
./Pilot_Test_Code_Review/   ← 공식 참조 구현(읽기 전용): 끝까지 빌드된 파일럿 앱 전체(officequest/ 앱·테스트·qa·scripts, Opinion.md 함정 목록, RUN.md, DUAL_BRAIN_AUDIT.md, 명세 사본). 빌드·import 금지 (§0.4, Harness §12.2)
./skills/{dual-brain,taste,mengto,sprite-gen}/ + ./skills/SOURCES.md   ← 스킬 원본 (Harness §2에서 사용 범위 지정)
                            dual-brain 최소 구성 = SKILL.md + README.ko.md. references/*.md는 있으면 사용, 없으면 Harness §0-1 MISSING 규칙
./source/mock/ ./source/motion/   ← 목업·영상 소스 (시드·스프라이트 포팅 원천, 읽기 전용)
./3조 Office Quest_Autopilot/  ← Autopilot 산출물 폴더(Autopilot이 생성). 앱은 이 폴더 안에만 만듦. 맨 위에는 아래 두 항목만 둠
    실행.command            ← macOS 더블클릭 실행기 (Harness §1.7)
    Office Quest/           ← 구현할 Next.js 앱 = 앱 루트 (Harness §1.2)
./DUAL_BRAIN_AUDIT.md       ← Autopilot이 작성하는 감리 기록
```
**앱 경로 규칙**: 이 문서와 Harness·DESIGN에서 앱 안을 가리키는 경로(`src/…`·`public/…`·`tests/…`·`scripts/…`·`docs/…`)는 모두 앱 루트 `3조 Office Quest_Autopilot/Office Quest/` 기준이고, `npm` 명령도 모두 앱 루트에서 실행합니다. 저장소 루트 파일(`PRD.md`·`tokens.css`·`refs/`·`reference/` 등)은 앱 루트에서 `../../`로 닿습니다. 폴더 이름에 공백이 있으므로 명령·스크립트의 경로는 항상 따옴표로 감쌉니다.

`source/mock/`(목업 HTML·`pages.js`·`sprites.js`)가 저장소에 있으면 시드 데이터와 스프라이트 행렬을 그대로 포팅합니다. 없으면 이 문서 §9와 `motion/officequest_intro.html`의 스프라이트 정의를 사용합니다.

### 0.2 문서 우선순위 (충돌 시 위가 이김)
1. **이 PRD의 §2 결정 테이블**
2. 이 PRD 본문 (기능·규칙·수치·시드·수용 기준)
3. `DESIGN.md` + `tokens.css` (시각 값: 색·크기·간격·모션 타이밍)
4. `refs/01–10` (구도·정보 배치·카피)
5. `Harness.md` (절차·도구·검증. 기능 규칙은 정의하지 않음)
6. `skills/*` (Harness §2가 허용한 범위 안에서만)
7. `reference/`(참조 구현 자료)와 `Pilot_Test_Code_Review/`(공식 참조 구현, 파일럿 앱). **예시일 뿐 규칙이 아님** — PRD·DESIGN·Harness와 다르면 그 문서가 이김. 파일럿 안의 `PRD.md`·`Harness.md`·`DESIGN.md`·`tokens.css` 사본과 `.github/copilot-instructions.md`는 명세가 아님(읽지 않음). 단 `reference/assets/character/*.png`는 D76에 따라 그대로 쓰는 제품 자산)
8. 원본 `해커톤3조_PRD.md` / 원본 `Harness.md` (입력 자료. 요구사항은 모두 이 문서에 포함됨)

### 0.3 표기 규칙
- **MUST** = 미충족 시 DoD 실패. **SHOULD** = 구현하되 시간 부족 시 `DUAL_BRAIN_AUDIT.md`에 사유 기록 후 생략 가능. **MAY** = 선택.
- `AC-x.y` = 수용 기준(Acceptance Criteria). **MUST AC는 각각 Harness §5.2 AC→테스트 매핑 표의 테스트 하나 이상에 매핑**됩니다. SHOULD AC는 측정 방법이 있으면 기록만 하고 게이트에 넣지 않습니다.
- 이 문서의 ⚡ ♥ 👁 같은 기호는 **아이콘을 가리키는 표기**입니다. 코드·UI 텍스트에는 넣지 않고 Lucide 아이콘을 씁니다(D21).
- **별(U+2605)·☆ 등 별 기호도 같은 규칙**: 코드·UI 문자열에 쓰지 않습니다(Extended_Pictographic → `qa:forbidden` 실패). 별 모양은 Lucide `star` 아이콘, 텍스트는 "별 N개"·"별점 N"·"만점". 이 문서 본문도 별점은 "별 N개"로 표기합니다.
- 모든 시간은 **Asia/Seoul (KST, UTC+9)** 기준. 날짜 경계는 KST 00:00.
- 금액 단위 `P`(포인트), 경험치 `EXP`. 표시 시 천 단위 콤마(`1,500 P`).

### 0.4 참조 구현
`./Pilot_Test_Code_Review/`에는 끝까지 빌드된 파일럿 앱(이하 **참조 구현** 또는 **파일럿**)과 빌드 중 실제로 부딪힌 함정 33건의 목록(`Opinion.md`)이 들어 있으며, `Pilot_Test_Code_Review/officequest/`가 **공식 참조 구현**입니다. 이 문서의 규칙은 그 함정을 모두 피하도록 정해져 있습니다. Autopilot은 구현 전·구현 중에 이 폴더를 **읽어야 합니다(SHOULD)**. 어디를 무엇 때문에 읽는지는 Harness §12.2, `Opinion.md`는 "실제로 걸려 넘어진 함정 목록"으로 읽습니다.
- **사용 규칙**(Harness §12.2): 읽기 전용 · 앱에서 import하지 않음 · 파일럿 안에서 `npm install`·빌드·테스트를 실행하지 않음 · 통째로 복사하지 않음. 파일 하나를 가져오는 것은 **그 파일이 이미 현재 PRD를 만족할 때만** 허용하고, 가져온 뒤 고쳐 맞추고 해당 Phase 게이트를 다시 돌립니다. 파일럿의 `node_modules`·`.next`·`public/tinymce`·테스트 결과·영상은 저장소에 없습니다.
- **없어도 끝까지 갑니다**: `Pilot_Test_Code_Review/`가 없으면 이 문서·Harness·DESIGN과 `./reference/`만으로 모든 Phase를 끝냅니다(Audit에 `MISSING: Pilot_Test_Code_Review` 한 줄).
- **파일럿은 이 문서와 일부 다릅니다.** 효성 브랜드 팔레트(D62)와 D63–D91의 일부가 없거나 다르게 구현돼 있습니다. 아래 표의 항목은 **복사하지 말고 이 문서대로** 만듭니다(파일럿 코드에서 직접 확인한 차이).

| 영역 | 파일럿에 있는 것 (위치) | 이 문서가 정한 것 |
|---|---|---|
| 색 | 보라 단일 + 다크 사이버 시안 `--accent-cyan`(`src/styles/tokens.css`, `mock-base.css`), `brand.ts` 없음 | 효성 브랜드 팔레트 `--hs-*`, 시안 없음(D2·D62), 루트 `tokens.css` 그대로 복사 |
| 마켓 잔재 | 흐름은 지정 → 수령 확인이지만 `item/request`·`approveRequest`·`pendingRequest`·`NPC_AUTO_APPROVE_MS`가 타입·상수에 남음(`types.ts`, `constants.ts`, `guards.ts`) | 요청·승인 타입과 상수 자체를 만들지 않음(D63, 타입 테스트) |
| 포인트 부족 | `buy-btn`을 비활성(`BuyButton.tsx`) | 버튼 활성, 클릭 시 경고 모달(D63) |
| 수령 대기 중 수정·삭제 | 허용(`guards.ts` `item/update`) | 수정·삭제는 잠금, 재지정·해제는 허용(§7.2) |
| 되돌리기 실패 | 버튼 비활성 + "판매자가 정산 포인트를 사용해…"(`guards.ts`) | 버튼 활성, 중립 문구 토스트만(D89) |
| 동료 잔액 | 거래 완료 패널에 상대방 거래 후 잔액 표시(`SettlementPanel.tsx`) | 본인 잔액만(D67). 조직도의 잔액 비표시는 파일럿도 같음 |
| 자동 답장 | NPC 판매자에게도 "최종 구매자로 등록해 드릴게요", 나눔 "그냥 가져가시면 돼요!", handover "SharePoint 링크로…"(`teams-replies.ts`) | D90 문구, handover 첨부 문구(§8.12) |
| 문의 | 답변이 달려도 삭제 가능, 마감 처리 없음(`guards.ts`) | 답변 ≥1이면 수정·삭제 잠금(D65), 마감 뒤 답변 마감·채택으로만 지급(D91) |
| 가드 순서 | 타이머 검사가 상태 검사보다 먼저(`guards.ts`) | §5 평가 순서(상태 → 주체 → 제재 → 시간 → 한도 → 입력) |
| 운영 지표 칩 | `admin-flag-count` = 전체 플래그 수(`AdminConsole.tsx`) | 열린 플래그만, 헤더 칩에만 testid(D85) |
| 저장값 | `schemaVersion: 1` + 이관 코드(`persistence.ts`) | 스키마 v2 재시드(D78) |
| 폰트 | PostCSS 플러그인 `scripts/local-fonts.cjs`로 `@font-face` 교체 | 루트 `tokens.css`의 로컬 → CDN, PostCSS 플러그인 없음(D72) |
| 정보 아이콘 | 생성 이미지 `public/assets/character/info-badge.png` | Lucide `info`(D76). 캐릭터 PNG 24장만 사용 |
| CSS 클래스 | `.grow`(`app-layout.css`)·`.ring`(`mock-base.css`) | Tailwind와 겹치는 이름 금지(Harness §1.6-9, 규칙 12) |
| testid·테스트 | 마켓 스크롤 영역 `village-products-scroll`(이 문서는 `market-scroll`), `@feedback`·`@scroll` 태그, 스펙 이름·개수 다름(`07-market-pathA` 등 21개), `doctor` 스크립트 없음, `check-forbidden`에 규칙 11–13 없음 | Harness §4 태그 8종, §5.2 스펙 23개, `reference/scripts/` |
| QA 기록 | `qa/AC_MAP.md` = 파일럿 당시 AC 기준("69/69 E2E") | **형식만** 참고, 내용은 현재 AC로 새로 작성(`reference/templates/AC_MAP.template.md`) |

확인 결과 차이가 없는 항목: 효성마을 목록 페이지네이션은 파일럿에도 없음(D73과 같음, 게시판만 10행/페이지), 비최종 구매자 코드 `NOT_RESERVED_BUYER`, 시연 첨부 URL 없음(D70), 조직도 잔액 비표시(D67), 자정 직후 새날 판정(§6.4).
- **그대로 따를 패턴**: 순수 리듀서 + 공유 가드(`canX`)로 UI 비활성과 리듀서 거부를 같은 함수로 판정, 시간 판정 공용 모듈(`quest-access.ts`), Web Audio 합성 효과음 모듈(`audio.ts`), 첨부 세대 토큰, 공유 에디터 로더, 캐릭터 외형 모듈(`character.ts`). 세부는 Harness §12.
- **참조 구현과 다르게 만들 것**(이 문서가 정답): 운영 지표는 "열린 high"(D85) · 답변이 달린 문의는 수정·삭제 잠금(D65) · 포인트 부족은 버튼 비활성이 아니라 모달(D63) · 저장값 이관 대신 스키마 v2 재시드(D78) · 폰트는 루트 `tokens.css` 로컬 우선(D72, PostCSS 플러그인 없음) · 생성형 정보 아이콘 대신 Lucide `info`(D76) · Tailwind와 이름이 겹치는 CSS 클래스(`.ring`·`.grow` 등) 금지(Harness §1.6-9) · 모든 테스트에 Phase 태그(`@feedback`·`@scroll`·태그 없음 금지, Harness §4).
- **참조 구현에서 발견된 문제와 대응**: 각 함정에 대한 규칙은 아래 §2 D63–D91에 있습니다.

---

## 1. 제품 개요

### 1.1 한 줄 정의
사내 마이크로 아웃소싱(**업무 퀘스트**)으로 포인트·EXP를 벌고, 그 포인트로 사내 중고거래(**효성마을**)를 하는 게이미피케이션 웹앱. 백엔드 없이 브라우저 안의 Mock DB로 완전히 동작하는 **시연용 프로덕트**.

### 1.2 범위
| 포함 (MUST) | 제외 |
|---|---|
| 대시보드(벤토), 업무 퀘스트(일일 퀘스트·등록·게시판·상세 워크플로), 효성마을(목록·등록·상세·거래), 가상 Teams 채팅, 그룹웨어 조직도, 3인 페르소나 + 운영자 전환, 2시간 타이머, **별점 기반 품질 보상(D40)**, **반려 최대 2회(D45)**, **운영자 콘솔: 의심 활동 모니터링·제재·감사 로그(D47–D51)**, 라이트/다크 테마, 6티어 픽셀 캐릭터, 하이퍼 프레임 오버레이, 시즌 초기화 시뮬레이션, **판매자 지정 → 구매자 수령 확인 거래와 되돌리기(D63·D64), 문의 답변·채택(D65), 캐릭터 꾸미기·티어 안내(D75), 보상 모션·효과음(D71), 참여 시간 만료 후 게시판 접근 제한(D74)** | 실제 서버/DB/인증, 실제 SharePoint·Teams·그룹웨어 연동, 실제 파일 업로드 저장·**실제 다운로드(D70)**, 서버 측 접근 제어, 답변 수정·삭제·채택 취소, 모바일 전용 레이아웃(1280px 미만은 깨지지 않을 정도만), 다국어 |

### 1.3 라우트 맵
| 라우트 | 화면 | 레퍼런스 |
|---|---|---|
| `/` | 대시보드 (로그인 직후 기본 화면, 로고 클릭 시 이동) | `refs/01_dashboard_light.png` |
| `/quests` | `/quests/board`로 리다이렉트 | — |
| `/quests/daily` | 업무 퀘스트 › 일일 퀘스트 (+ 티어 진화표) | `refs/02_daily_quests_tiers.png` |
| `/quests/new` | 퀘스트 등록 (+ 보안서약서 모달) | `refs/04_quest_create.png`, `refs/05_security_pledge_modal.png` |
| `/quests/board` | 업무 퀘스트 게시판 (`?type=&status=&q=&mine=`, 참여 시간 만료 시 D74) | `refs/03_quest_board.png` |
| `/quests/[no]` | 퀘스트 상세 (모집중 / 진행중 / 보완요청 / 완료, 문의는 답변형 §8.18) | `refs/06_quest_detail_recruiting.png`, `refs/07_quest_detail_inprogress_teams.png` |
| `/quests/[no]/edit` | 퀘스트 수정 (모집중 + 요청자 본인만) | `refs/04_quest_create.png` 재사용 |
| `/village` | 효성마을 목록 (`?v=all\|mapo\|hoehyeon\|banpo\|suseo\|changwon\|ulsan&cat=&q=`) | `refs/09_village_market_dark.png` |
| `/village/new` | 중고물품 글 등록 | `refs/04_quest_create.png` 폼 패턴 + DESIGN §7 |
| `/village/[id]` | 물품 상세 (+ 조직도 모달, 정산 패널) | `refs/10_village_detail_orgchart.png` |
| `/village/[id]/edit` | 물품 수정 (판매자 본인, 거래완료 전) | `/village/new` 재사용 |
| `/admin` | 운영자 콘솔 (`?tab=flags\|restrictions\|log`, 운영자 전용, D48) | 없음 — DESIGN 컴포넌트, Visual QA 제외(D53) |
| (오버레이) | 하이퍼 프레임 A(등록)/B(완료) | `refs/08_hyperframe_complete.png`, `motion/officequest_intro.html` |

---

## 2. 결정 테이블 (원본 PRD · 원본 Harness · DESIGN.md · refs 간 모순 해소)

Autopilot은 아래 결정을 **재논의하지 않고** 그대로 구현합니다.

| # | 모순 / 모호점 | 출처 | 결정 | 근거 |
|---|---|---|---|---|
| D1 | "메인 네비게이션 (2개 상단 메뉴)"라고 쓰고 3개를 나열 | 원본 PRD §3.1 | **탭 3개**: 대시보드 · 업무 퀘스트 · 효성마을 | 나열된 항목·refs 모두 3개 |
| D2 | 다크모드 "사이버 시안 포인트 `#06B6D4`" | 원본 Harness §2 vs 원본 PRD·DESIGN(보라 단일 액센트) · 효성 팔레트 | **시안을 쓰지 않음.** 효성 공식 팔레트에 시안이 없으므로 `--accent-cyan`은 만들지 않고, GNB 타이머 라이브 점은 `--live-dot`(라이트 `--accent` `#6428E6`, 다크 `--hs-yellow` `#FFBE19`)을 씁니다. 버튼·배지·링크·포커스 등 모든 액센트는 효성 보라(`--accent` `#6428E6`, 다크 보라 텍스트는 `--accent-fg` `#A692EB`, DESIGN §3.0). `#06B6D4`는 금지(Harness §5.5-4) | DESIGN §3.0, 브랜드 일관성 |
| D3 | 하이퍼 프레임 1.8초 | 원본 PRD vs 소개 영상(1.2초/1.6초로 단축) | 앱은 **정확히 1,800ms** 후 자동 닫힘. 영상은 스펙이 아님 | 원본 PRD MUST |
| D4 | 오버레이 배경 `bg-black/75 backdrop-blur-sm` | 원본 Harness vs DESIGN §9.4 | DESIGN §9.4 값 사용(어두운 radial + blur 6px + 스캔라인). `position:fixed; inset:0; z-index:9999` 유지 | 둘 다 "반투명 다크", DESIGN이 더 구체적 |
| D5 | 카드에 "미묘한 글래스모피즘" | 원본 PRD Skill B vs DESIGN §4(글래스는 GNB·플로팅만) vs taste(글래스 금지) | `backdrop-filter`는 **GNB·플로팅 칩·모달/오버레이 백드롭·Teams 헤더**에만. 벤토 카드는 불투명 `--surface` + 1px `--border` + `--sh-card` + 상단 1px 내부 하이라이트(`inset 0 1px 0 rgba(255,255,255,.6)`, 다크 `rgba(255,255,255,.04)`)로 "유리 가장자리" 표현 | 가독성(DESIGN) + PRD 의도 충족 |
| D6 | 레이아웃 치수: 사이드바 280px(DESIGN §6) vs 264px(DESIGN §12·refs) vs `--sidebar-w:316px`(tokens, 영상값) / GNB 64 vs 78 | DESIGN 내부, tokens | 앱 값 = **GNB 64px, 좌측 사이드바 264px, 상세 우측 aside 400px, 콘텐츠 패딩 24px, 최대폭 제한 없음(fr 단위)**. `tokens.css`는 수정하지 않고 `src/styles/app-layout.css`에서 변수 재정의. DESIGN §3.7·§6도 264px | refs가 실제 앱 화면 |
| D7 | TinyMCE 5.10.2 "Self-Hosted / Fallback" | 원본 PRD·Harness | **1순위**: npm `tinymce@5.10.2`를 `public/tinymce/`로 복사해 셀프호스팅(API Key 불필요, 경고 배너 없음). **폴백**: 동일 툴바의 `FallbackEditor`(contentEditable). 전환 조건은 Harness §7 | 원본이 둘 다 허용 |
| D8 | Paperlogy CDN 의존 | 원본 PRD | **D72를 따름**(로컬 먼저, CDN 두 번째 — 루트 `tokens.css`) | 오프라인 대비 |
| D9 | 게시판 상태 필터: 원본 3개(모집중/진행중/완료) vs ref03 4개(+보완요청) | 원본 PRD vs refs/03 | 칩 **전체 · 모집중 · 진행중 · 보완요청 · 완료**. `진행중` 필터는 `in_progress`와 `revision`을 **모두** 포함, `보완요청`은 `revision`만 | ref03 카운트(진행중 2)와 일치 |
| D10 | 업무 퀘스트 사이드바: 원본 3탭 vs ref "내 퀘스트" 그룹 추가 | refs/02–07 | 3탭(일일 퀘스트 · 퀘스트 등록 · 업무 퀘스트 게시판)은 MUST. "내가 요청한/내가 지원한/완료 내역"은 게시판 필터 링크(`?mine=requested\|applied\|done`)로 SHOULD | 원본 범위 유지 + ref 일치 |
| D11 | 타이머 컨트롤: 원본 "⚡아이콘 클릭 시 소진↔리셋 토글" vs ref "+30분 · 만료 테스트 · ↺" | 원본 PRD vs refs | Lucide `zap` 아이콘 + 텍스트 "시연 타이머" 칩(`timer-ctl-toggle`) = **토글**(남은 시간>0이면 00:00:00으로 소진, 0이면 02:00:00 리셋). 추가로 `+30분`, `만료 테스트`, 리셋(Lucide `rotate-ccw`) 버튼 제공 | 둘 다 충족 |
| D12 | 일일 완료 한도 2건: "추가 지원 불가 **또는** 완료 제한 안내" | 원본 PRD §3.2 | **둘 다**: 작업자의 `completedToday ≥ 2`이면 ① 그 사용자의 `[지원하기]` 비활성, ② 그 작업자가 채택된 퀘스트의 `[퀘스트 완료(승인)]` 비활성. 두 경우 모두 사유 라벨 + 툴팁 | 모호성 제거 |
| D13 | "진행중(보완요청)" 표현 | 원본 PRD | 내부 상태 `revision`, 배지 텍스트 **"진행중 · 보완요청"**(warning 색) | ref03 |
| D14 | 재제출 후 상태 | 원본 PRD(명시 없음) | 재제출하면 `revision → in_progress`, `reviewPending=true`, 제출 버전 +1(v2, v3…) | 검수 대기 표시(ref07 "검수 대기") |
| D15 | 현상금 범위 "예: 0P ~ 1,000P" | 원본 PRD | `0 ≤ bounty ≤ min(1000, 내 보유 P)`, **10P 단위**, 프리셋 50/100/300/500(보유 초과 시 비활성) | ref04 |
| D16 | 판매자/요청자가 페르소나가 아닌 NPC일 때 승인 주체 | 시드(NPC 판매 물품 존재) | **NPC 자동 승인 없음(D63).** NPC 판매 물품은 열람·좋아요·Teams 대화만(판매자가 지정하지 않으므로 수령 확인 불가). 구매 시연은 페르소나 판매 물품(m1 kim · m4 lee · m7 park)으로. NPC 요청자 퀘스트는 페르소나가 승인할 수 없으므로 진행 상태로 남음(시연용 표시) | 시연이 막히지 않도록 · 일어나지 않는 자동 행동을 두지 않음 |
| D17 | 조직도에서 포인트 부족 직원: ref10은 `최종 구매자 지정` 활성 / DESIGN §7.10은 버튼 비활성 | refs/10 vs DESIGN | **D67을 따름** — 동료 잔액을 보여주거나 추론하게 하지 않음. 포인트 부족은 구매자 본인이 `[샀어요]`를 누를 때 모달로 안내(D63), 잔액 음수는 리듀서 가드가 막음 | 개인정보 · 지정은 정산이 아님 |
| D18 | 시드 포인트와 시드 퀘스트 에스크로 관계 | 원본 PRD | 페르소나 초기 포인트(1,500 / 300 / 5,200)는 **시드 퀘스트 에스크로가 이미 차감된 최종값**. 시드 적재 시 다시 차감하지 않음 | 원본 수치 보존 |
| D19 | "시즌 EXP" vs "누적 EXP" | refs/01·02 | 단일 필드 `exp` = 이번 시즌 누적 EXP. 레벨·티어·랭킹 모두 `exp`에서 계산. 시즌 초기화 시 0 | 1,168 EXP = Lv.12 (refs 일치) |
| D20 | D-Day 계산 | refs/01 "D-14" | **KST 달력 날짜 차이**: `D = dateKST(seasonEndsAt) − dateKST(now)` (일). 2026-10-21 → 2026-11-04 = D-14 | ref 일치 |
| D21 | 버튼 라벨의 이모지(💬🛒🔄✅) | 원본 PRD vs DESIGN §10(이모지 금지) | 라벨 텍스트는 원본 그대로, **이모지 대신 Lucide 아이콘**(message-circle, shopping-cart, rotate-ccw, check). 문서 전체의 **⚡ → `zap`, ♥ → `heart`, 👁 → `eye`** 도 같은 규칙. 유니코드 `Extended_Pictographic` 문자(⚡ ♥ ↔ © ™ 등)는 UI 텍스트·소스에 쓰지 않음(Harness §5.5-6 자동 검사). ↺ ✕ ○ → 같은 비해당 기호도 아이콘으로 대체 권장 | 헤드리스 렌더 깨짐 방지, 금지 패턴 검사와 일치 |
| D22 | 문의/요청 첨부 분기 범위 | 원본 PRD | 퀘스트 `type`이 그 퀘스트의 **모든 첨부**(요청자 첨부 + 작업자 결과물 + 문의 답변)를 결정. **세부 행렬은 D69(요청 = 일반 파일 + 스크린샷, 문의 = 스크린샷만), 링크 없음은 D70** | 규칙 단일화 |
| D23 | 앱 위치 | 저장소 구조 | Next.js 앱은 **`./3조 Office Quest_Autopilot/Office Quest/`**(앱 루트). 산출물 폴더 `3조 Office Quest_Autopilot/`의 맨 위에는 `실행.command`와 `Office Quest/` 두 항목만 둠(Harness §1.2·§1.7). 루트의 `skills/`, `refs/`, `motion/`이 lint/tsc 대상에 들어가지 않게 함 | 빌드 무결성 |
| D24 | 하이퍼 프레임 중 상태 반영 시점 | 원본 PRD("즉시 지급") vs DESIGN §9.4("1500–1800ms 실제 반영") | **DB 상태는 클릭 즉시(t=0) 커밋**. 숫자 카운터 롤링 애니메이션만 오버레이 종료 후 재생 | 테스트·다중 탭 일관성 |
| D25 | 등록 후 수정 가능 범위 | 원본 PRD("수정") | 모집중일 때 수정 가능: 제목·업무 분야·마감일·본문·첨부. **유형(문의/요청)과 현상금은 등록 후 변경 불가** | 에스크로 재계산 제거 |
| D26 | 구매 요청 동시성 | 원본 PRD | **해당 없음** — 구매 요청 단계가 없음(D63). 수령 확인 권한은 물품당 최종 구매자 1명(`finalBuyerId`)뿐이라 동시성 문제가 없음 | 정산 모호성 제거 |
| D27 | 페르소나·테마의 탭 간 동기화 | 원본 Harness("모든 컴포넌트 실시간") | **DB(포인트·게시글·상태)는 탭 간 실시간 동기화**. 현재 페르소나·테마는 `localStorage`에 저장(새로고침 유지)하되 다른 탭에 방송하지 않음(탭마다 다른 페르소나로 시연 가능) | 두 탭 시연 지원 |
| D28 | `tokens.css`의 reduced-motion 전역 규칙(애니메이션 1ms) | tokens.css | 하이퍼 프레임 닫힘·Teams 1.2초·첨부 변환 600ms·다운로드 안내 1.4초 등 **모든 타이밍은 JS 타이머가 결정**. `animationend` 이벤트에 로직을 걸지 않음 | reduced-motion에서도 동작 동일 |
| D29 | 소개 영상의 "+30분" 등 영상 전용 수치·문구 | motion | 앱 스펙은 이 PRD 기준. 영상은 모션 감각 참고용 | — |
| D30 | 서브 타이틀 · 카피 | refs vs 원본 | refs의 카피를 기본값으로 사용(예: "포인트로 사고, 나누고, 순환하고."). 원본의 기능 라벨(`[지원하기]`, `[채택하기]`, `[샀어요]` 등)은 반드시 포함 | 원본 라벨은 테스트 접근명 |
| D31 | Teams 입력 인디케이터 문구 | 원본 PRD "상대방이 입력 중입니다..." vs ref07 | **"{상대 이름}님이 입력 중입니다..."** (이름이 없으면 원본 문구) | ref07 · DESIGN §7.9 |
| D32 | 완료 모션의 몬스터 "슬라임/드래곤" | 원본 PRD Skill C-2 vs ref08·영상 | **슬라임 보스 1종**(드래곤은 MAY) | ref08 · 프레임 예산 |
| D33 | 카드 패딩 원본 20–24px | 원본 PRD Skill B vs DESIGN §5 | **DESIGN 값(24–28px)** 사용 | refs가 DESIGN 값으로 렌더됨 |
| D34 | 스프라이트 "16×16/32×32 매트릭스" | 원본 PRD Skill C-0 vs DESIGN §8 | **16×16 바디를 24×24 캔버스**(날개·검 여유)에 배치. 소품 아이콘은 16×16 | DESIGN §8, ref01·02 |
| D35 | DESIGN.md와 PRD·refs의 수치 차이(사이드바 280, max-width 1440, 스탯 타일 2개, 링 3/4, 조직도 md 640, reduced-motion 1.2s, ref09 "전체 128" 등) | DESIGN vs PRD·refs | DESIGN은 PRD·refs 값을 따름. 차이가 보이면 **PRD → refs → DESIGN** 순으로 결정하고 Audit 기록 | 단일 기준 |
| D36 | DESIGN의 `refs/video_stills/` · 소개 모션 경로 | DESIGN §0·§12 | `video_stills`는 **동봉하지 않음(무시)**. 소개 모션 경로는 `motion/officequest_intro.html` | 실제 패키지 구조 |
| D37 | 시즌 진행률 표시 반올림(실값 77.48%) | refs/01 "78%" | **`Math.ceil(ratio×100)`** → 78%. `formulas.test`가 78을 기대 | ref 일치, 결정성 |
| D38 | 지속시간(하이퍼 프레임 1.8초·Teams 1.2초) 측정 시계 | Harness §1.6-2 vs Playwright `setFixedTime` | 도메인 시각(타이머·dayKey·createdAt)은 `clock.now()`(=`Date.now()`), **경과시간 기록(openedAt/closedAt 등)은 `performance.now()`**. `setFixedTime`은 `Date`만 고정하고 `performance.now()`는 진행함(2026-10-21 실행 확인) | 고정 시각에서도 경과시간 측정 가능 |
| D39 | TinyMCE 5.x 최신 패치(5.10.9) 존재 | npm registry | 원본 지정 **5.10.2 유지**(API·설정 동일). Audit에 "5.10.2 원본 고정" 사유 1줄 기록 | 원본 PRD MUST |
| D40 | 품질별 보상: 별점→EXP 매핑 | 제품 요구 | 승인 시 별점 **1–5 필수**(기본값 없음). EXP = `RATING_EXP[stars]` = 별 1개 50 · 별 2개 75 · **별 3개 100** · 별 4개 125 · 별 5개 150. 기본 100 P와 현상금 B는 별점과 무관. 일일 미션 EXP(+50)는 그대로 | 별 3개 = 100 EXP → §11 정식 수치와 일치 |
| D41 | 별점 평균 표시 | 제품 요구 | 사용자별 누적 `rating = { sum, count }`(시즌 초기화 영향 없음). 표시 = `count === 0 ? '평가 없음' : (Math.round(sum / count * 10) / 10).toFixed(1)` + " · 평가 {count}건". 별 모양은 **Lucide `star` 아이콘**(별 문자 U+2605는 Extended_Pictographic이라 텍스트 금지, §0.3·D21) | 결정적 반올림, 금지 패턴 검사와 일치 |
| D42 | 별점 표시 위치 | 제품 요구 | 지원자 행(`applicant-rating-{u}`), 채택된 작업자 스트립(`worker-rating`), 대시보드 캐릭터 카드(`dash-rating`). 랭킹·게시판에는 표시하지 않음 | 채택 판단에 필요한 곳만 |
| D43 | 별점 모달과 하이퍼 프레임 순서 | 제품 요구 | `[퀘스트 완료 (승인)]` → **별점 모달** → `[별점 주고 승인]` 클릭 시 `quest/approve{stars}` 커밋(D24처럼 즉시) → 하이퍼 프레임 B(보상 카드 EXP = 별점 EXP, 별 n개 표시). 모달 취소 = 변화 없음 | 하이퍼 프레임 1,800ms 규칙(D3) 유지 |
| D44 | 시드 별점 | 제품 요구 | `rating.count = completedTotal`(과거 완료는 모두 평가된 것으로 간주). 합계는 §4.4 표. 운영자는 평가 대상 아님 | 누적 완료 수와 일관 |
| D45 | 반려 횟수 한도 | 제품 요구 | 퀘스트당 `rejectCount` 최대 **2**. 2회 반려 후 `[반려 (보완 요청)]` 비활성 + 툴팁 "반려는 퀘스트당 최대 2회예요 · 별점과 함께 승인해 주세요(별 1개도 가능)". 최종 경로는 **승인(별 1개도 가능)만**. 작업자 일일 완료 한도(D12)와 겹치면 D12가 우선(§6.9). 운영자 중재 요청은 만들지 않음(단일 종료 경로 → 시연·테스트 결정성, 운영자는 §6.10 모니터링으로 사후 개입) | 무한 반려 루프 차단 |
| D46 | 반려 카운터 표시 | 제품 요구 | 상세의 검수 바와 제출 카드에 `반려 n/2`(`reject-count`, `data-count`). 두 번째 반려 모달에는 "이번이 마지막 반려예요" 경고. 게시판 배지는 그대로(D13) | 정보는 상세에서만 |
| D47 | 운영자 페르소나 | 제품 요구 | `ops` = **최운영 매니저 · 사내문화팀 · 마포 본사 · HS13001**, `role: 'admin'`, `isPersona: true`. 페르소나 전환기 맨 아래 "운영자" 구분선 뒤에 표시. **플레이어가 아님**: 랭킹·조직도·일일 퀘스트·별점·모니터링 대상에서 제외, 포인트 0 고정, GNB 포인트 칩 대신 `admin-badge`("운영자"). 퀘스트·효성마을 쓰기 액션은 모두 `FORBIDDEN`("운영자 계정은 업무 퀘스트·효성마을 거래에 참여하지 않아요"). 열람은 가능 | 기존 3인 페르소나 수치·조직도 검색 결과 불변 |
| D48 | 운영자 콘솔 접근 | 제품 요구 | `/admin`(`?tab=flags\|restrictions\|log`). GNB 탭 `운영자 콘솔`(`nav-admin`)은 운영자일 때만 4번째로 표시(다른 페르소나는 기존 3탭, D1 유지). 운영자가 `/`에 오면 `/admin`으로 클라이언트 이동. 운영자가 아니면 `/admin`은 200 + `admin-forbidden` 패널("운영자만 볼 수 있어요" + `[대시보드로]`) | 실제 인증 없음(시연), 테스트 결정성 |
| D49 | 의심 활동 규칙 | 제품 요구 | 순수 함수 `detectFlags(db, now)`(§6.11), 최근 **14일**, 규칙 5종(R1 같은 요청자→작업자 완료 ≥3 · R2 상호 승인 A↔B 각 ≥2 · R3 같은 쌍 평가 ≥3건 전부 별 5개 · R4 현상금 ≥500 & 등록→승인 ≤30분 · R5 같은 판매자↔구매자 0 P 초과 거래 ≥3건, 또는 ≥2건이면서 합계 ≥2,000 P — D58. 같은 쌍에 R3이 성립하면 R1은 따로 만들지 않음 — D59). 플래그 ID는 결정적. 판정 데이터는 별점 원장 `db.ratings` + 거래 내역 | 설명 가능한 근거, 재현 가능 |
| D50 | 제재 종류·기간 | 제품 요구 | 종류 `quest_post`(퀘스트 등록 제한) · `purchase`(구매 제한), 하나 또는 둘 다(일부가 이미 활성이면 D55). 기간 1일 · 3일 · 7일 · 무기한, 사유 5–100자 필수. 해제도 사유 5–100자. 만료는 `clock.now() ≥ endsAt`로 자동(별도 액션 없음). 같은 사용자·같은 종류의 활성 제재는 1건 | 단순·검증 가능 |
| D51 | 제재의 효과 범위 | 제품 요구 | `quest_post`: `quest/create`만 차단(지원·제출·승인·반려는 가능). `purchase`: **`item/confirmReceipt`(수령 확인) 차단** + 조직도에서 해당 직원 `[예약자 지정]`·`[최종 구매자 지정]` 비활성("구매 제한 중인 직원이에요"). 이미 지정된 예약·최종 구매자 지정은 유지(제재 중에는 `[샀어요]`만 막힘). 수령 되돌리기(D64)는 환불이므로 막지 않음. 가드 순서: 운영자 `FORBIDDEN` → `RESTRICTED` → `TIMER_EXPIRED` → 기존 가드 | 요구 범위 그대로 |
| D52 | 플래그 시드 데이터 위치 | 제품 요구 | 시드 의심 사례는 **아카이브 기록**(퀘스트 `A-101…A-107`, 매물 `A-m1…A-m3`)으로 `db.ratings`·`db.transactions`에만 존재하고 게시판·마켓 목록에는 나오지 않음 | 게시판 7건·물품 8건·카운트(AC-8.6.1, 8.9.1) 불변 |
| D53 | 새 UI의 디자인 근거 | 제품 요구 | 별점 모달·운영자 콘솔·제재 배너에는 ref가 없음. DESIGN.md 컴포넌트(모달 §7, 표·배지·칩·버튼, 비활성 규칙 §7.1)만으로 구성하고 **Visual QA 픽셀/구도 비교 대상에서 제외**(DOM 단언은 E2E가 담당). 기존 ref 화면에 추가된 별점 텍스트·반려 카운터는 구도 체크에서 허용 차이 | 근거 없는 시각 지어내기 방지 |
| D54 | 제재 상태 우선순위 | 엣지 케이스 | `restrictionStatus(r, now)` = `r.liftedAt != null ? 'lifted' : (r.endsAt != null && now >= Date.parse(r.endsAt) ? 'expired' : 'active')`. **해제가 만료보다 우선**(시드 r1 = 종료 시각이 지났지만 `lifted`) | 표시·testid `data-status` 결정성 |
| D55 | 일부 종류가 이미 활성인 제재 | 엣지 케이스 | `admin/restrict`는 요청 kinds 중 **활성이 아닌 종류만** 생성(각각 Restriction + 로그 1건). 요청 kinds가 **전부 이미 활성일 때만** `INVALID_STATE`(DB 불변). 기존 활성 제재는 연장·덮어쓰기 안 함(바꾸려면 해제 후 재제재). 모달에서 이미 활성인 종류 체크박스는 비활성 + 사유 "이미 제재 중이에요 ({MM.DD HH:mm}까지)" | 부분 성공을 명시, 오류 코드 1개로 단순화(`ALREADY_RESTRICTED` 코드 없음) |
| D56 | 제재 id 결정성 | 엣지 케이스 | 생성 전에 kinds를 **정규 순서 `['quest_post','purchase']`**로 정렬하고 그 순서로 `r{nextRestrictionNo}`를 부여. 입력 배열 순서와 무관. 시드 이후 E2E 기대값: kang 등록 제한 = `r2`, kim 등록 = `r3`, kim 구매 = `r4`. 제재 행에 `data-kind` | 테스트가 해제할 id를 고정 |
| D57 | 해제·무혐의 멱등성 | 엣지 케이스 | `admin/lift`: 대상 제재가 `active`가 아니면(이미 해제·만료·없음) `INVALID_STATE`. `admin/dismissFlag`: 현재 `detectFlags` 결과에 없는 id이거나 유효 상태가 `open`이 아니면 `INVALID_STATE`. `admin/restrict`의 `flagId`도 같은 조건(열린 플래그만). 중복 dispatch(StrictMode·두 탭)에도 로그는 1건 | Harness §1.6-5 멱등 원칙 |
| D58 | R5 오탐 축소 | 엣지 케이스 | 0 P(무료나눔) 거래 제외. 성립 = 건수 ≥ 3 **또는** (건수 ≥ 2 **그리고** 합계 ≥ 2,000 P). 고가 물품 1건 거래는 플래그 아님 | 시드 사례 C(800 P × 3건)는 그대로 성립 |
| D59 | R1·R3 중복 제거 | 엣지 케이스 | 같은 (a → b) 쌍에 R3(`pair_5star`)이 성립하면 R1(`pair_repeat`)은 만들지 않고 R3 플래그의 `alsoMatched = ['pair_repeat']`로 표시(행 1개 + 보조 규칙 배지 "반복 완료"). R3이 성립하지 않을 때만 R1 단독 플래그 | 같은 사례 2행 방지. 시드 플래그 **4건**(§9.7) |
| D60 | 처리된 플래그의 재발 | 엣지 케이스 | `FlagState`에 처리 시점의 `lastAt`·`evidenceCount` 저장. 현재 플래그의 `lastAt`이 저장값보다 늦으면(처리 후 새 근거) 유효 상태 = `open` + `newEvidence = 저장 시각 이후 근거 수`(배지 "새 근거 n건"). 다시 무혐의·제재 가능 | 무혐의 후 재발 누락 방지 |
| D61 | 시드 신선도·시연 당일 | 엣지 케이스 | 아카이브 기록은 `seedNow` 상대 시각이라 시드 적재 후 **약 6일**(+6.04일)부터 플래그가 14일 창 밖으로 빠짐(§9.7 수명 표). 운영자 콘솔은 `now − seededAt ≥ SEED_STALE_DAYS(5일)`이면 `admin-stale-seed` 경고("시드 적재 후 5일이 지나 의심 활동 사례가 줄어들 수 있어요 · 시연 전 [데이터 초기화]", 버튼은 기존 `debug-reset-data`와 같은 동작). 시연 당일 시작 전 `[데이터 초기화]` 1회(Harness §9.4) | 시연에서 표가 줄어드는 사고 방지 |
| D62 | 효성 브랜드 팔레트 | 효성 브랜드 가이드 | 색의 단일 출처는 `tokens.css`의 `--hs-*` 7색(`#2E008B` `#3D00B8` `#6428E6` `#875FF0` `#C4C4E6` `#F1F1F9` `#FFBE19`)과 그 위에 재매핑한 시맨틱 토큰(DESIGN §3.0). **효성 옐로 `--reward`는 보상 신호**: 별점 별(Lucide `star` 채움), 코인, 레벨업, 보상 카드, `[보상 받기]`·`[별점 주고 승인]` 버튼(Reward 버튼: 노랑 채움 + `#2E008B` 글자). 밝은 면 위 노랑 글자 금지. `refs/`는 팔레트 이전 이미지라 **색은 DESIGN·tokens가 우선**하고 Visual QA에서 색 차이는 허용 차이(Harness §6). 앱 코드에 브랜드 hex 직접 사용 금지(Harness §5.5-11, 캔버스는 `src/lib/brand.ts`) | 브랜드 일관성, WCAG AA(DESIGN §3.0 대비표) |
| D63 | 마켓 거래 흐름: 구매 요청·판매자 승인 vs 판매자 지정·구매자 수령 확인 | 제품 요구 | **구매 요청·판매자 승인·거절·NPC 자동 승인은 없음.** 흐름 = `거래가능 → (예약자 지정) 예약중 → 최종 구매자 지정(수령 대기, 정산 없음) → 최종 구매자가 상세에서 [샀어요] = 수령 확인 → 거래완료(양측 원장을 한 번에)`. 예약자·최종 구매자는 **판매자만** 조직도에서 지정. **`[샀어요]`(`buy-btn`)는 상세에서 `finalBuyerId === actor`인 사람에게만 렌더**(목록 카드에는 구매 CTA 없음, 다른 사람에게는 상태 안내 `buy-guidance`). 단순 예약자는 수령 권한 없음. 필드 분리: `reservedFor`(예약·지정 대상) · `finalBuyerId`(수령 확인 권한) · `buyerId`(완료 후 구매자). 포인트 부족은 버튼 비활성이 아니라 클릭 시 경고 모달(원본 문구 그대로, §7.3) | 지정만으로 상대 포인트가 빠지지 않도록 판매자·구매자 각자의 행동으로 분리 |
| D64 | 수령 확인 되돌리기 | 제품 요구 | 거래완료 후 **수령 확인한 구매자 본인**이 같은 버튼(`buy-btn[data-state=received]`)을 다시 누르면 `item/undoReceipt`: 상태 `reserved`(최종 구매자 유지 = 수령 대기)로 복귀, 원래 Tx 2건에 `reversedAt` 기록(삭제 안 함) + 역분개 Tx 2건(구매자 `market_purchase_refund +X`, 판매자 `market_sale_reversal −X`, `reversesTxId`). 기간 제한 없음. **판매자 보유 P < X면 거부**(D89: 코드 `UNDO_UNAVAILABLE`, 버튼은 **비활성하지 않고** 클릭 결과로 중립 문구 `UNDO_UNAVAILABLE_NOTICE`만 표시 — 판매자 잔액을 드러내지 않음) — 정산금 잠금·취소 가능 시간·운영자 환불은 도입하지 않음. 구매 제한(D51)·타이머와 무관하게 가능(환불이므로). 되돌린 뒤 다시 `[샀어요]` 가능(새 Tx). 되돌린 구매는 R5 집계에서 제외(§6.11). 영수증(`receipt`)이 없는 시드 m8은 되돌릴 수 없음. 중복 dispatch는 `receipt == null` 가드로 `INVALID_STATE` | 음수 잔액 없이 원장을 보존하는 가장 단순한 규칙 |
| D65 | 문의 워크플로 | 제품 요구 | 문의(`type:'inquiry'`)는 **지원·채택·결과물 검수를 쓰지 않음**. `recruiting` 동안 요청자 외 플레이어가 공개 답변을 바로 작성(`quest/answer` — 지원·보안서약 모달 없음, 에디터 사전 잠금 없음, 개인정보 마스킹 안내 문구 상시 표시, 첨부는 스크린샷만 D69) → 요청자가 답변 1개를 별점과 함께 채택(`quest/acceptAnswer`) → `done`. 채택 보상(100+B P · `RATING_EXP[stars]`)·별점 원장·일일 `complete`·`adopted`·하이퍼 프레임 B는 요청 승인과 동일. 내부 상태는 `recruiting` 그대로, 게시판 배지 "모집중"(ref03 불변), 상세 상태 칩 "답변 접수 중". 한 사람이 여러 답변 가능, 답변 수정·삭제·채택 취소 없음(범위 밖), 정렬은 작성순, 답변은 누구에게나 공개. **답변이 1개 이상이면 문의 수정·삭제 잠금**("답변이 달린 문의는 수정·삭제할 수 없어요" — 참조 구현은 삭제를 허용했으나 답변자의 기여가 사라지므로 잠금). 마감이 지난 뒤의 처리와 현상금은 D91. 문의에 `quest/apply`·`adopt`·`submit`·`reject`·`approve`는 `INVALID_STATE` | 간단한 질문에 채택 절차가 끼지 않도록 |
| D66 | 답변 작성 수 · 채택 수 · 보상 수 | 제품 요구 | **답변 작성 = 참여 시간(타이머 > 0)만 확인, 횟수·일일 완료 한도와 무관.** 채택할 때만 답변자의 `completedToday < 2`(D12) 확인 — 한도 도달 시 `accept-answer-btn-{answerId}` 비활성 + 사유 "답변자의 오늘 완료 한도(2/2) 도달 · 내일 채택할 수 있어요". 보상 이월·미지급 처리는 만들지 않음(다음 날 채택) | 지식 공유를 보상 카운터로 막지 않음 |
| D67 | 동료 정보 공개 범위 | 제품 요구 | 화면에 **본인 잔액만** 표시. 조직도 직원 행의 보유 P, `구매 가능` 필터, 포인트 부족에 따른 버튼 비활성·툴팁은 두지 않음(잔액 상·하한 추론 방지). 조직도 버튼 비활성 사유는 **구매 제한(D51)뿐**(판매자 본인·운영자는 목록에서 제외). 거래 금액·운영자 콘솔 근거는 기존대로. D17은 이 규칙을 따름. 수령 되돌리기의 판매자 잔액 검사도 버튼 상태·문구로 드러내지 않음(D89) | 개인정보 원칙 |
| D68 | P와 EXP 병렬 표시 | 제품 요구 | 더하기 기호는 **같은 단위(기본 P + 현상금 P) 사이에서만**. P와 EXP는 서로 다른 행(위 P, 아래 EXP) 또는 가운뎃점(` · `)으로 구분하고 "P + EXP" 표기는 쓰지 않음. `quest-reward-preview` = 1행 "{100+B} P", 2행 "{RATING_EXP[3]} EXP"(별점에 따라 50–150) — EXP 행의 위치가 P 행보다 아래(배치 검사) | 다른 차원의 값을 더하지 않음 |
| D69 | 첨부 행렬 · 비동기 안전 | 제품 요구 · 참조 구현 | 행렬: **요청** = 일반 파일(시연 SharePoint 배지, D70) + 스크린샷 이미지(Base64 미리보기) 두 버튼 / **문의** = 스크린샷 이미지 버튼만(일반 파일 버튼은 **렌더하지 않음** — 비활성이 아니라 없음), 안내 "문의는 스크린샷 이미지만 첨부할 수 있어요" 유지. 같은 행렬을 등록·수정·결과물 제출·문의 답변의 공통 `AttachmentPicker`와 리듀서 검증(`validateAttachments(type, list)` → `VALIDATION`)에 동시에 적용. 비동기: 600ms 변환 타이머·`FileReader` 결과는 **세대 토큰**으로 유형 전환·언마운트 시 폐기(전환 뒤 늦게 도착한 첨부 0건). 첨부 id = `a-{pickerId}-{seq}`(`pickerId` = React `useId`, `seq` = 모듈 범위 증가값) — 고정 시각에서도 고유. D22의 세부 규칙 | 업로드 의도별 동작 + 고정 시각 테스트 결정성 |
| D70 | 시연용 첨부 | 제품 요구 | 첨부는 **파일명·크기·id만 저장, URL을 만들지 않음**(`Attachment.url`·`SHAREPOINT_BASE` 없음, `hyosung.sharepoint.com`은 `qa:forbidden` 허용 목록에 없음). 일반 파일 배지 = SharePoint 스타일(`sharepoint-badge`, `data-demo="true"`), 문구 "SharePoint · {크기} · 시연용 첨부". 파일명은 `<a>`가 아닌 `<button>`(`demo-attachment-download`) → 클릭·Enter 시 작은 안내 "다운로드 중…"(`demo-download-toast`, 1,400ms 안에 페이드아웃, 연속 클릭은 같은 안내의 시간을 다시 시작, 화면에 1개만) — 네트워크 요청·새 탭·다운로드·라우트 변경·포커스 이동·DB 변경 없음. 스크린샷은 Base64 미리보기 유지 | 시연 중 앱 밖(인증·없는 파일)으로 벗어나는 사고 방지 |
| D71 | 피드백(모션·효과음) 정책 | 제품 요구 | **효과음·보상 모션은 dispatch 성공 직후에만**(클릭 자체·렌더·새로고침·탭 동기화 수신으로는 재생하지 않음). 이벤트 표 §8.20. 소리 = Web Audio 합성만(음원 파일·외부 요청 없음, `qa:forbidden` 13). 첫 클릭·키 입력에서 `AudioContext`를 열고 호버로는 열지 않음. 음소거 토글 `sound-toggle`(기본 소리 켬, `localStorage['oq:audio:muted']`, 탭 간 방송 안 함). `document.hidden`이면 재생 안 함. 동시 보이스 ≤ 16, 끝난 노드 해제. 호버음 = 마우스 포인터(`pointerType === 'mouse'`)·활성 버튼만, 120ms 간격, 보상음보다 작고 짧게. **같은 사용자 동작의 모든 진입점**(예: 퀘스트 등록 = 사이드바·게시판 버튼·폼 제출·서약 확인)에 같은 호버음. reduced-motion: 날아가는 코인은 숨기고 문구·보상 정보는 유지. Web Audio 미지원이면 시각 피드백만 | 잘못된 성공 신호 방지, 브라우저 자동 재생 정책 |
| D72 | 폰트 로딩 | 참조 구현 | 루트 `tokens.css`: 각 `@font-face`의 `src` = **로컬(`/fonts/paperlogy/*.woff2`) 먼저, CDN 두 번째**. `public/fonts/paperlogy/`에 6개 파일이 있으면 **실행 중 외부 폰트 요청 0**(AC-8.1.8). `preconnect` 없음. 앱에서 `@font-face`를 다시 선언하거나 PostCSS로 지우지 않음(`fonts.css`는 비워 둠). 폰트 파일은 SIL OFL 1.1이라 `OFL.txt`와 함께 **커밋**(로컬 파일이 없으면 브라우저가 404 콘솔 오류를 남기고 CDN으로 넘어감 — Harness B4). D8은 이 규칙을 따름 | 시연장 네트워크와 무관하게 콘솔 오류 0 |
| D73 | 스크롤 소유권 | 제품 요구 | 화면별 고정 영역·스크롤 영역은 DESIGN §6.2 표. **효성마을 목록만** 뷰포트 높이 프레임: GNB·마을 사이드바·제목·검색·필터는 고정, 상품 그리드(+빈 결과 안내, 페이지네이션 없음)만 `market-scroll` 영역에서 스크롤(`overscroll-behavior: contain`, `tabindex=0` 포커스 후 PageDown 가능). 문서 `scrollY`는 0 유지. 상세·등록·수정·그 외 화면은 일반 문서 스크롤 | 탐색 중 맥락(필터) 유지 |
| D74 | 참여 시간 만료 후 업무 퀘스트 접근 | 제품 요구 | 타이머 0이면 쓰기 가드(§6.6)에 더해 **공개 게시판 열람을 닫음**(행렬 §8.21). "참여" = 요청자 · 지원자 · 채택 작업자 · 문의 답변자. 본인 관련 목록·상세는 계속 열람, 그 외 상세는 안내 + `quest/view` 미실행(조회수 불변). `?mine=`은 **결과를 관계로 다시 걸러** 쿼리 문자열이 권한이 되지 않게 함. 본인 퀘스트의 채택·반려·승인·답변 채택, 효성마을은 계속 가능. 운영자는 예외(모두 열람). 타이머 리셋·+30분·KST 새 날이면 1초 틱 안에 다시 열림. 실제 서버 측 접근 제어는 범위 밖 | 쓰기 버튼 비활성만으로는 둘러보기가 막히지 않으므로 |
| D75 | 캐릭터 꾸미기 | 제품 요구 | **성장 티어(레벨·EXP)와 외형 선택을 분리.** `User.appearance = { gender: 'male' \| 'female', hair: 'classic' \| 'wave', outfit: 'auto' \| TierKey }`, 기본 `{ male, classic, auto }`(모든 사용자). 의상 6종 = 티어 6종 외형(장비·망토·날개 포함, 별도 파츠 없음), 해금 레벨 1·5·10·15·20·25(§6.1 경계). `auto` = 현재 티어 의상. 잠긴 의상은 미리보기만, 저장은 리듀서가 레벨을 다시 확인(`character/equip` → 잠긴 의상이면 `VALIDATION`). 저장 전 미리보기·취소. 표시 의상 = `equippedOutfit(user)` = 선택 의상이 해금돼 있으면 그것, 아니면 현재 티어(시즌 초기화 뒤 자동 폴백, 선택값은 보존 → 같은 레벨을 다시 달성하면 복귀). 티어 배지·오라·`data-tier`는 항상 성장 티어. 외형은 포인트·보상·랭킹에 영향 없음. 운영자는 대상 아님(`FORBIDDEN`) | 성장 신호와 개인 취향을 섞지 않음 |
| D76 | 캐릭터 자산 | 제품 요구 | 전신 캐릭터는 **동봉 PNG 24종**(`reference/assets/character/{male\|female}-{classic\|wave}-{tier}.png`, 24×24 네이티브, 알파 0/255, 원본 코드 아바타를 기준으로 생성·사용자 검수 완료, 생성 이력 `provenance/`)을 `officequest/public/assets/character/`로 **복사해서 사용**. Autopilot은 이미지를 생성·재생성·편집하지 않음(sprite-gen 실행 금지 유지, Harness §2 Skill 3). 그리기 = 24×24 캔버스에 `drawImage` 후 정수 배율 확대(`imageSmoothingEnabled=false`, `image-rendering: pixelated`). 소품·코인·슬라임·물품 프리셋·아바타 헤드·하이퍼 프레임 캐릭터는 기존 코드 픽셀 행렬(D34) 유지. 자산 파일이 없으면 그 조합을 코드 행렬 티어 스프라이트로 그리고 Audit `MISSING`(Harness B26). 정보 아이콘은 생성 이미지가 아니라 Lucide `info`. 자산을 추가할 때의 수용 기준 = DESIGN §8.1 | 헤어를 옷 위에 덧그리면 깨지는 조합 방지 + 재현성(생성 도구·계정 불필요) |
| D77 | 자동 응답 문구와 거래 상태 | 제품 요구 | 자동 응답·시드 메시지·안내 문구는 **실제로 일어나지 않는 승인·지정을 약속하지 않음**. market 기본 답장 두 번째 = `MARKET_BUYER_GUIDANCE`(지정은 조건부로만 말함, §3). NPC 판매자·나눔 답장은 D90. 거래 상태 전환(D63)을 바꿀 때는 버튼·안내·알림·Teams 답장·조직도 안내 바를 함께 점검(단위 테스트: 답장 표에 "승인할게요"·"구매 요청" 없음) | 거래 순서와 대화 문구 일치 |
| D78 | 저장 스키마 v2 | 저장 호환 | `DB.schemaVersion = 2`. 같은 `localhost:3000`에 다른 스키마의 저장값(예: 참조 구현의 `schemaVersion: 1` — URL 첨부·구매 요청·다른 자동 답장)이 있으면 **불일치 → 시드 재적재 + 토스트**(§10). 필드 단위 이관 코드는 만들지 않음(참조 구현의 URL 제거·답장 교체 이관은 따르지 않음) | 시연용 앱, 이관 코드 없이 결정성 확보 |
| D79 | 저잔액 현상금 슬라이더 | 참조 구현 | 슬라이더 범위 `0 … maxB`, `maxB = min(1000, floor(points / 10) × 10)`. 눈금 = `0, r(maxB/4), r(maxB/2), r(maxB×3/4), maxB`(`r` = 10단위 반올림, 중복 제거), 각 눈금은 실제 값 위치에 놓고 라벨 = 값. 보유 1,000 P 이상이면 0/250/500/750/1,000(ref04 불변). `maxB = 0`이면 슬라이더·프리셋 비활성 + 사유 "보유 포인트가 없어 현상금 0 P로 등록돼요". 예: 300 P → 0/80/150/230/300 | 낮은 잔액에서도 눈금 라벨과 실제 값 일치 |
| D80 | 원자 액션과 화면 후속 처리 | 참조 구현 | 리듀서 액션은 **원자적**: 실패하면 DB 불변(§5.1). 실패 뒤 정리(모달 닫기, 다른 행동 제안 등)가 필요하면 리듀서가 아니라 **UI 오케스트레이션**이 별도의 유효한 액션을 dispatch. 한 액션 안에서 "실패 + 부분 정리"를 섞지 않음. 테스트는 ① 실패 시 DB 동일(`toEqual(before)`) ② UI 후속 동작을 따로 검증 | 실패 불변성과 자동 취소가 충돌하지 않도록 |
| D81 | 역할별 공개 범위 | 참조 구현 | 공개 범위 행렬(§8.7.1)을 **본문·aside 타임라인·알림·대시보드 피드·Teams 시스템 메시지 등 모든 표시 위치에 똑같이** 적용. 결과물 본문·첨부·제출 버전·반려 사유는 요청자·작업자·운영자만. 제3자에게는 상태 배지와 "진행중인 퀘스트예요"만(제출 횟수·시각 없음). 문의 답변은 모두에게 공개(D65) | 본문 외 위치(타임라인 등)로 정보가 새지 않도록 |
| D82 | 단계별 정보 우선순위 | 참조 구현 | 상세는 상태마다 맨 위 정보가 다름(§8.7.2). 제출이 1건 이상이면 원래 요청 본문을 `quest-original-toggle`(기본 접힘)로 접고 검수 바·제출 결과물·반려 사유를 위로. 진행중·보완요청의 aside는 보상 카드보다 진행 타임라인(`quest-timeline`)이 먼저. 1920×1080에서 검수 바(`approve-btn`·`reject-btn`)가 스크롤 없이 보이고 타임라인과 Teams 패널이 겹치지 않음 | 단계마다 첫 화면에 필요한 정보 |
| D83 | 보조 행동 권한 | 참조 구현 | 권한 표(§8.7.3)에 핵심 CTA뿐 아니라 **보조 행동**(좋아요·Teams·수정·삭제·사진 추가·꾸미기·다운로드 안내)도 역할별로 정의. 권한이 없으면 **숨김**, 권한은 있으나 조건 미충족이면 **비활성 + 사유** | 보조 버튼 권한까지 빠짐없이 정의 |
| D84 | 토스트 우선순위 | 참조 구현 | 화면의 토스트는 1개. 우선순위 danger > success > info. danger 표시 중(`TOAST_DANGER_HOLD_MS` 4,000ms)에는 info가 덮지 않음(그 info는 버림), success는 info를 대체, 새 danger는 모두 대체. 알림 수신 토스트는 info. 업무 흐름의 마지막 결과 메시지가 남아야 함 | 중요한 오류가 묻히지 않도록 |
| D85 | 운영 지표 집계 범위 | 참조 구현 | 요약 칩 = "열린 플래그 n · 열린 high n · 활성 제재 n"(`admin-flag-count`·`admin-open-high-count`·`admin-active-restriction-count`). high는 **열린 플래그 중** high만(참조 구현의 "전체 high"는 따르지 않음 — 할 일을 보여주는 칩이므로). 조치·무혐의 직후 즉시 감소(시드 4·2·0 → `fast_high_bounty__A-107` 무혐의 후 3·1·0) | 라벨과 집계 대상 일치 |
| D86 | 핵심 조치의 첫 화면 가시성 | 참조 구현 | 자동 클릭 성공과 별개로 핵심 CTA는 **기준 뷰포트에서 스크롤 없이 보여야** 함: 1440×900에서 운영자 의심 활동 표의 행 조치 버튼(조치 열 우측 sticky), 1920×1080에서 검수 바. E2E `expectInViewport`(bbox가 뷰포트 안 + 중심점 `elementFromPoint`가 그 버튼) | 가로 스크롤 뒤에 버튼이 숨지 않도록 |
| D87 | 반응형 고정·축소 값 | 참조 구현 | DESIGN §6.1 표(1920 / 1440 / 1280 / 1279 이하 / 390). 고정: GNB 64, 사이드바 264·상세 aside 400(1280 이상). 축소 가능: 본문(최소 520), 표 제목 열(말줄임), 카드 그리드 열 수. 1279 이하: 사이드바 → 상단 가로 메뉴, aside → 본문 아래. 정보 텍스트는 숨기지 않고 장식만 줄임. 모바일 전용 레이아웃은 여전히 범위 밖(깨지지 않고 핵심 동작에 도달하는 수준) | 화면 폭별 겹침·잘림 |
| D88 | 리치 에디터 로더 계약 | 참조 구현 | 스크립트 파일이 있다 ≠ 사용 가능. `RichEditor`는 **공유 로더 Promise 1개**로 `/tinymce/tinymce.min.js`를 한 번만 로드하고 `window.tinymce`가 생긴 뒤에만 `@tinymce/tinymce-react` 에디터를 마운트(이미 로드된 전역 사용). 8초 타임아웃·로드 오류 → `FallbackEditor`. 콘솔 경고·오류를 숨기지 않음. 한국어 UI는 로컬 `public/editor-ko.js`(`language_url`, `reference/public/editor-ko.js` 복사) SHOULD | 여러 에디터 동시 마운트 시 중복 로드·경쟁 |
| D89 | 되돌리기 실패를 알리는 방식 | 엣지 케이스 | 수령 확인한 구매자의 `buy-btn[data-state=received]`는 **항상 활성**. 클릭 시 판매자 보유 P < X면 리듀서가 `UNDO_UNAVAILABLE`로 거부(DB 불변, D80)하고, UI는 info 토스트 `UNDO_UNAVAILABLE_NOTICE` "지금은 되돌릴 수 없어요 · 판매자와 Teams로 이야기해 보세요"만 보여줌. 판매자 잔액·"정산 포인트를 사용" 같은 이유는 어디에도 표시하지 않음. `UNDO_UNAVAILABLE`은 UI가 **사전에 비활성화하지 않는** 코드(가드는 리듀서·테스트용, `INSUFFICIENT_POINTS` 모달과 같은 예외). 판매자 화면 `seller-trade-status`도 바뀌지 않음 | D64 잔액 검사와 D67 잔액 비공개를 함께 지킴 |
| D90 | NPC 판매자·나눔 물품의 자동 답장과 안내 | 엣지 케이스(D16·D77) | 판매자가 **NPC**(페르소나 kim·lee·park가 아닌 플레이어)인 market 스레드: 네고·장소·시간 키워드 답장과 기본 두 번째 답장 = `MARKET_NPC_NOTICE` "시연용 물품이라 거래 지정은 하지 않아요. 좋아요로 관심을 남겨 주세요!" (기본 첫 번째 "관심 가져주셔서 감사해요! 상태 아주 좋아요."는 그대로). 페르소나 판매자의 나눔 물품 네고 답장 = `MARKET_FREE_REPLY` "나눔이라 포인트는 받지 않아요. 제가 최종 구매자로 지정하면 물품을 받으신 뒤 [샀어요]를 눌러 주세요." NPC 판매 물품 상세(거래완료 제외)는 예약 여부와 관계없이 `buy-guidance[data-state=npc]` `MARKET_NPC_GUIDANCE`(§7.3) — 시드 m2·m3도 "판매자가 지정하면" 안내를 보이지 않음 | 일어나지 않는 지정을 약속하지 않음 |
| D91 | 채택 없이 마감된 문의의 현상금 | 엣지 케이스 | 문의의 `dueAt`이 지나면(`now ≥ dueAt`) **답변 작성 마감**: `quest/answer` → `INVALID_STATE` "답변 마감이 지난 문의예요", `answer-editor` 대신 안내, 상세 상태 칩 "답변 마감 · 채택 대기"(게시판 배지는 "모집중" 그대로). **현상금은 채택으로만 지급**: 답변이 1개 이상이면 마감 뒤에도 요청자의 `quest/acceptAnswer`는 그대로 가능하고, 자동 환불·자동 채택·운영자 환불은 없음(에스크로는 요청자 본인의 채택으로만 풀림). 요청자에게 배너 `inquiry-due-banner` "답변 마감이 지났어요 · 답변 1개를 채택하면 현상금이 지급돼요". 답변이 0개면 기존대로 요청자가 삭제해 환불받을 수 있음(D65 잠금은 답변 ≥1일 때만). 요청(`type:'request'`)에는 적용하지 않음 | 답변자 기여를 지키면서 에스크로의 출구를 정의(요청자가 답변을 받고 환불만 받아 가는 경로 차단) |

---

## 3. 상수 (단일 출처: `src/lib/constants.ts`)

```ts
export const TZ = 'Asia/Seoul';
export const EXP_PER_LEVEL = 100;
export const QUEST_BASE_REWARD_P = 100;
export const QUEST_REWARD_EXP = 100;                     // = RATING_EXP[3] (기준값, 표시용)
export const RATING_EXP = { 1: 50, 2: 75, 3: 100, 4: 125, 5: 150 } as const;   // D40
export const REJECT_LIMIT = 2;                           // D45
export const MONITOR_WINDOW_DAYS = 14;                   // D49
export const MONITOR_RULES = { pairRepeatMin: 3, reciprocalMin: 2, pair5StarMin: 3, fastBountyMin: 500, fastMinutesMax: 30, marketPairCountMin: 3, marketPairSumCountMin: 2, marketPairSumMin: 2000 } as const;   // R5 = count ≥ 3 || (count ≥ 2 && sum ≥ 2000), 0 P 제외 (D58)
export const RESTRICTION_DURATIONS = { '1d': 1, '3d': 3, '7d': 7, indefinite: null } as const;   // 일 수, D50
export const ADMIN_ID = 'ops';
export const SEED_STALE_DAYS = 5;   // D61
export const DAILY_MISSION_REWARD_P = 10;
export const DAILY_MISSION_REWARD_EXP = 50;
export const DAILY_COMPLETE_LIMIT = 2;
export const SESSION_TIMER_MS = 2 * 60 * 60 * 1000;      // 02:00:00
export const TIMER_PLUS_MS = 30 * 60 * 1000;               // +30분
export const BOUNTY_MAX = 1000;
export const BOUNTY_STEP = 10;
export const BOUNTY_PRESETS = [50, 100, 300, 500] as const;
export const HYPERFRAME_MS = 1800;
export const TEAMS_TYPING_MS = 1200;
// NPC_AUTO_APPROVE_MS·SHAREPOINT_BASE 상수는 두지 않음 (D63, D70)
export const ATTACH_CONVERT_MS = 600;                      // 일반 파일 시연 변환 진행바 (D69)
export const DEMO_DOWNLOAD_NOTICE_MS = 1400;               // "다운로드 중…" 안내 (D70)
export const TOAST_DANGER_HOLD_MS = 4000;                  // D84
export const HOVER_SOUND_GAP_MS = 120;                     // D71
export const AUDIO_MAX_VOICES = 16;                        // D71
export const OUTFIT_UNLOCK_LEVEL = { bronze: 1, silver: 5, gold: 10, platinum: 15, diamond: 20, master: 25 } as const;   // D75 (= §6.1 티어 경계)
export const QUEST_TIME_NOTICE = '오늘 참여 가능한 시간이 모두 지났어요';                 // D74
export const MARKET_BUYER_GUIDANCE = '거래가 정해지면 제가 조직도에서 최종 구매자로 지정해요. 지정된 뒤 물품을 받으시면 [샀어요]를 눌러 주세요~';   // D77
export const MARKET_NPC_NOTICE = '시연용 물품이라 거래 지정은 하지 않아요. 좋아요로 관심을 남겨 주세요!';   // D90
export const MARKET_FREE_REPLY = '나눔이라 포인트는 받지 않아요. 제가 최종 구매자로 지정하면 물품을 받으신 뒤 [샀어요]를 눌러 주세요.';   // D90
export const MARKET_NPC_GUIDANCE = '시연용 NPC 물품이에요 · 둘러보기·좋아요·Teams 대화만 할 수 있어요';   // D90 (buy-guidance npc)
export const UNDO_UNAVAILABLE_NOTICE = '지금은 되돌릴 수 없어요 · 판매자와 Teams로 이야기해 보세요';   // D89 (이유 비공개)
export const INQUIRY_DUE_NOTICE = '답변 마감이 지난 문의예요';                       // D91
export const SCHEMA_VERSION = 2;                           // D78
export const SEASON1 = { id: 1, label: '2026 Season 1', startsAt: '2026-09-02T00:00:00+09:00', endsAt: '2026-11-04T23:59:59+09:00' };
export const NEXT_SEASON_DAYS = 28;
export const STORAGE_KEYS = { db: 'oq:v1:db', ui: 'oq:v1:ui', test: 'oq:test', audioMuted: 'oq:audio:muted' } as const;   // 키 이름은 그대로, 내용 버전은 schemaVersion(D78)
export const BROADCAST_CHANNEL = 'oq-sync';
export const VALIDATION = {
  questTitle: [2, 60], questBodyMinText: 20, resolveLine: [1, 60], resultBodyMinText: 10, rejectReasonMin: 5, answerBodyMinText: 10,
  itemTitle: [2, 40], itemPriceMin: 10, itemPriceMax: 100000, itemPriceStep: 10, itemPhotosMax: 5, photoMaxBytes: 2 * 1024 * 1024,
} as const;
```

---

## 4. 페르소나 · 직원 · 조직 시드

### 4.1 페르소나 (GNB 전환기에 노출되는 플레이어 3명 + 운영자 1명, MUST)
| id | 이름 | 마을 / 사업장 | 부서 | 사번 | EXP → 레벨·티어 | 보유 P | 오늘 완료 | 누적 완료 | 역할 |
|---|---|---|---|---|---|---|---|---|---|
| `kim` | 김효성 대리 | 마포마을 / 마포 본사 | 재무팀 | HS21034 | 1,168 → **Lv.12 골드** (68/100) | **1,500** | 0/2 | 23 | 기본 로그인 · 퀘스트 요청자 · 중고 구매자 |
| `lee` | 이퀘스트 사원 | 창원마을 / 창원공장 | 생산기술팀 | HS24017 | 650 → **Lv.7 실버** | **300** | 1/2 | 8 | 퀘스트 지원·수행자 · 중고 판매자 |
| `park` | 박마스터 과장 | 반포마을 / 반포 | AI혁신팀 | HS15002 | 2,740 → **Lv.28 마스터** | **5,200** | 2/2 (한도 도달) | 61 | 랭킹 1위 · 일일 한도 테스트 |
| `ops` | 최운영 매니저 | 마포마을 / 마포 본사 | 사내문화팀 | HS13001 | — (플레이어 아님, `exp 0`) | 0 | — | 0 | **운영자**(`role:'admin'`, D47): 모니터링·제재 전용, 랭킹·조직도 제외 |

### 4.2 NPC 직원 (조직도·랭킹·시드 게시글용)
| id | 이름 | 마을 / 사업장 | 부서 | 사번 | EXP → 레벨·티어 | 보유 P | 오늘 완료 | 누적 완료 |
|---|---|---|---|---|---|---|---|---|
| `choi` | 최다이아 차장 | 반포마을 / 반포 | IT혁신팀 | HS16011 | 2,360 → Lv.24 다이아 | 4,870 | 0 | 44 |
| `jung` | 정플래 대리 | 수서마을 / 수서 | 인사팀 | HS19044 | 1,850 → Lv.19 플래티넘 | 2,310 | 0 | 31 |
| `han` | 한울산 과장 | 울산마을 / 울산공장 | 생산기술팀 | HS17052 | 560 → Lv.6 실버 | 1,980 | 0 | 9 |
| `kang` | 강창원 대리 | 창원마을 / 창원공장 | 품질경영팀 | HS22031 | 430 → Lv.5 실버 | 960 | 0 | 6 |
| `oh` | 오신입 사원 | 회현마을 / 회현 | 총무팀 | HS26003 | 140 → Lv.2 브론즈 | 180 | 0 | 1 |

시즌 TOP 5(시드): 1 박마스터 2,740 · 2 최다이아 2,360 · 3 정플래 1,850 · 4 김효성 1,168 · 5 이퀘스트 650 (refs/01과 일치).

### 4.3 조직도 트리 (사업장 → 부서 → 직원). 인원수는 표시용 고정값
| 사업장 key | 표시명 | 표시 인원 | 부서 (표시 인원) → 시드 직원 |
|---|---|---|---|
| `mapo` | 마포 본사 | 128명 | 재무팀(24) → kim |
| `hoehyeon` | 회현 | 42명 | 총무팀(11) → oh |
| `banpo` | 반포 | 57명 | AI혁신팀(14) → park · IT혁신팀(18) → choi |
| `suseo` | 수서 | 64명 | 인사팀(16) → jung |
| `changwon` | 창원공장 | 212명 | 생산기술팀(36) → lee · 품질경영팀(27) → kang · 설비보전팀(31) → (없음) |
| `ulsan` | 울산공장 | 186명 | 생산기술팀(29) → han |

운영자 `ops`는 조직도 트리에 나오지 않습니다(D47). 마포 본사 표시 인원 128명은 그대로.

마을 key ↔ 표시명: `mapo` 마포마을 · `hoehyeon` 회현마을 · `banpo` 반포마을 · `suseo` 수서마을 · `changwon` 창원마을 · `ulsan` 울산마을.

### 4.4 별점 시드 (D44: `rating.count = completedTotal`)
| id | rating.sum | rating.count | 표시 |
|---|---|---|---|
| `kim` | 99 | 23 | 4.3 · 평가 23건 |
| `lee` | 33 | 8 | 4.1 · 평가 8건 |
| `park` | 287 | 61 | 4.7 · 평가 61건 |
| `choi` | 190 | 44 | 4.3 · 평가 44건 |
| `jung` | 140 | 31 | 4.5 · 평가 31건 |
| `han` | 41 | 9 | 4.6 · 평가 9건 |
| `kang` | 29 | 6 | 4.8 · 평가 6건 |
| `oh` | 4 | 1 | 4.0 · 평가 1건 |
| `ops` | 0 | 0 | (표시 안 함) |

---

## 5. 데이터 모델 (단일 출처: `src/lib/types.ts`)

```ts
export type UserId = 'kim' | 'lee' | 'park' | 'choi' | 'jung' | 'han' | 'kang' | 'oh' | 'ops' | (string & {});
export type PersonaId = 'kim' | 'lee' | 'park' | 'ops';
export type Stars = 1 | 2 | 3 | 4 | 5;
export type VillageKey = 'mapo' | 'hoehyeon' | 'banpo' | 'suseo' | 'changwon' | 'ulsan';
export type SiteKey = VillageKey;                                  // 사업장 key = 마을 key
export type TierKey = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type ThemeMode = 'light' | 'dark';
export type ISODate = string;                                      // ISO 8601 with +09:00
export type DayKey = string;                                       // 'YYYY-MM-DD' (KST)

export interface User {
  id: UserId; name: string; employeeNo: string;
  village: VillageKey; site: SiteKey; dept: string;
  exp: number;               // 이번 시즌 누적 EXP (레벨·티어·랭킹의 유일한 원천)
  points: number;            // 보유 P (정수, 절대 음수 금지)
  completedToday: number;    // 오늘 작업자로 승인받은 건수 (0..2)
  completedTotal: number;    // 누적 완료 퀘스트 수 (시즌 초기화 영향 없음)
  isPersona: boolean;
  role: 'player' | 'admin';  // 'admin' = ops (D47)
  rating: { sum: number; count: number };   // 누적 별점 (D41, 시즌 초기화 영향 없음)
  seasonBadges: string[];    // 예: ['2026 Season 1']
  headSprite: string;        // 아바타 스프라이트 키
  appearance: CharacterAppearance;   // D75. 시드 기본 { gender:'male', hair:'classic', outfit:'auto' }
}
export type Gender = 'male' | 'female';
export type HairStyle = 'classic' | 'wave';          // 표시명: male classic "클래식 숏" · male wave "웨이브 펌" · female classic "클래식 보브" · female wave "롱 웨이브"
export type OutfitKey = 'auto' | TierKey;            // 의상 표시명: 오피스 루키 · 실버 서포터 · 골드 가디언 · 플래티넘 테크 · 크리스탈 윙 · 레전드 마스터
export interface CharacterAppearance { gender: Gender; hair: HairStyle; outfit: OutfitKey }

export type QuestType = 'inquiry' | 'request';                     // 문의 | 요청
export type QuestStatus = 'recruiting' | 'in_progress' | 'revision' | 'done';
export interface Attachment {
  id: string;                // `a-{pickerId}-{seq}` (D69)
  kind: 'sharepoint' | 'image';   // sharepoint = 일반 파일의 시연 배지(요청만), image = 스크린샷(요청·문의)
  fileName: string; sizeBytes: number;
  dataUrl?: string;          // kind==='image' → Base64 미리보기
  // url 필드 없음. 어떤 첨부도 주소를 만들지 않음 (D70)
}
export interface InquiryAnswer {          // D65
  id: string;                // 'ans{n}' (counters.nextId)
  authorId: UserId; bodyHtml: string; attachments: Attachment[];   // 이미지만 (D69)
  createdAt: ISODate;
}
export interface Application {
  userId: UserId; resolve: string; appliedAt: ISODate;
  pledgeAgreedAt: ISODate;   // 보안서약 동의 시각 (지원마다 새로 기록)
}
export interface Submission {
  version: number;           // 1부터
  bodyHtml: string; attachments: Attachment[]; submittedAt: ISODate;
  review?: { result: 'rejected' | 'approved'; reason?: string; reviewedAt: ISODate };
}
export interface Quest {
  no: number;                // 라우트 키 (/quests/[no]), 1부터 증가
  type: QuestType; status: QuestStatus;
  title: string; field: string; dueAt: ISODate; bodyHtml: string;
  attachments: Attachment[];
  requesterId: UserId;
  bounty: number;            // 현상금 (등록 시 에스크로)
  escrowHeld: number;        // 보관 중 금액: recruiting/in_progress/revision = bounty, done/삭제 = 0
  applications: Application[];
  workerId: UserId | null;   // 채택된 작업자
  adoptedAt: ISODate | null;
  submissions: Submission[];
  reviewPending: boolean;    // 마지막 제출이 검수 대기 중인지
  rejectCount: number;       // 0..REJECT_LIMIT(2), D45
  rating: { stars: Stars; ratedAt: ISODate } | null;   // 승인·답변 채택 시 별점 (done만 non-null)
  answers: InquiryAnswer[];  // 문의만 사용, 요청은 항상 [] (D65)
  acceptedAnswerId: string | null;   // 문의 done일 때 채택 답변 id
  views: number;
  createdAt: ISODate; completedAt: ISODate | null;
  pledgeAgreedAt: ISODate;   // 등록 시 보안서약 동의 시각
  deleted?: false;           // 삭제는 배열에서 제거 (soft delete 없음)
}

export type ItemCategory = 'digital' | 'living' | 'fashion' | 'books' | 'hobby';
// 표시명: digital 디지털/가전 · living 생활/주방 · fashion 의류/잡화 · books 도서/티켓/쿠폰 · hobby 취미/기타
export type ItemStatus = 'available' | 'reserved' | 'sold';        // 거래가능 | 예약중 | 거래완료
export interface MarketReceipt {           // D63·D64: 수령 확인 영수증
  buyerId: UserId; price: number; purchaseTxId: string; saleTxId: string; confirmedAt: ISODate;
}
export interface MarketItem {
  id: string;                // 'm1'…
  title: string; village: VillageKey; category: ItemCategory;
  mode: 'sale' | 'free'; price: number;                           // free → 0
  bodyHtml: string;
  photos: { id: string; source: 'preset' | 'upload'; spriteKey?: string; dataUrl?: string }[];
  sellerId: UserId; status: ItemStatus;
  reservedFor: UserId | null;                                      // status==='reserved'일 때만 non-null (예약자 또는 최종 구매자)
  finalBuyerId: UserId | null;                                     // D63: 판매자가 지정한 최종 구매자(수령 확인 권한). 지정 시 reservedFor와 같음, sold에서도 유지
  buyerId: UserId | null; soldAt: ISODate | null;                  // status==='sold'일 때만 non-null
  receipt: MarketReceipt | null;                                   // 수령 확인으로 완료된 거래만. 시드 m8은 null (D64)
  // pendingRequest·PurchaseRequest 타입은 두지 않음
  likeCount: number; likedBy: UserId[];                            // likedBy는 페르소나 토글용
  views: number; createdAt: ISODate;
}

export type TxType = 'bounty_escrow' | 'bounty_refund' | 'quest_reward' | 'daily_reward' | 'market_purchase' | 'market_sale'
  | 'market_purchase_refund' | 'market_sale_reversal';           // D64 역분개
export interface Transaction {
  id: string; type: TxType; userId: UserId; amount: number;        // 부호 포함 (차감 음수)
  balanceAfter: number; refType: 'quest' | 'item' | 'daily'; refId: string;
  counterpartyId?: UserId; memo: string; at: ISODate;
  reversedAt?: ISODate;      // D64: 되돌려진 원거래에만 기록 (삭제하지 않음)
  reversesTxId?: string;     // 역분개 Tx가 가리키는 원거래 id
}

export type DailyMissionKey = 'login' | 'post' | 'complete' | 'adopted';
export interface DailyProgress {
  dayKey: DayKey;
  achieved: Record<DailyMissionKey, boolean>;
  claimed: Record<DailyMissionKey, boolean>;
}

export interface TeamsMessage { id: string; from: 'me' | 'them' | 'system'; senderId?: UserId; text: string; at: ISODate }
export interface TeamsThread {
  key: string;               // `${context}:${refId}:${a}:${b}` (a,b 정렬)
  context: 'handover' | 'market'; refId: string;
  participants: [UserId, UserId]; messages: TeamsMessage[];
  pendingReplyFor: string | null;   // 자동응답을 기다리는 'me' 메시지 id. teams/send가 설정, teams/reply가 소비(StrictMode 중복 방지)
}

export interface AppNotification {
  id: string; userId: UserId; kind: 'final_buyer_designated' | 'receipt_confirmed' | 'receipt_undone' | 'answer_posted' | 'answer_accepted' | 'adopted' | 'rejected' | 'approved';
  refId: string; text: string; at: ISODate; read: boolean;
}

export interface Season { id: number; label: string; startsAt: ISODate; endsAt: ISODate }

export interface DB {
  schemaVersion: 2;                       // D78 (불일치 → 재시드)
  seededAt: ISODate;
  dayKey: DayKey;                         // 마지막 일일 초기화가 적용된 KST 날짜
  season: Season;
  timer: { endsAt: number };              // epoch ms. 남은 시간 = max(0, endsAt - now)
  users: Record<string, User>;
  quests: Quest[];
  items: MarketItem[];
  transactions: Transaction[];
  daily: Record<string, DailyProgress>;   // key = UserId
  teams: Record<string, TeamsThread>;
  notifications: AppNotification[];
  ratings: RatingRecord[];                // 별점 원장 (모니터링 근거, 아카이브 포함)
  restrictions: Restriction[];
  flagStates: Record<string, FlagState>;  // key = flagId (플래그 자체는 detectFlags로 계산)
  adminLog: AdminLogEntry[];              // append-only
  counters: { nextQuestNo: number; nextItemNo: number; nextTxNo: number; nextId: number; nextRestrictionNo: number; nextLogNo: number };
}

export interface RatingRecord {
  id: string; questRef: string;           // '7' 같은 퀘스트 번호 또는 아카이브 'A-101'
  archived: boolean;                      // true = 게시판에 없는 과거 기록(D52)
  requesterId: UserId; workerId: UserId; stars: Stars; bounty: number;
  postedAt: ISODate; approvedAt: ISODate;
}
export type RestrictionKind = 'quest_post' | 'purchase';
export type RestrictionDuration = '1d' | '3d' | '7d' | 'indefinite';
export interface Restriction {
  id: string;                             // 'r1'…
  userId: UserId; kind: RestrictionKind; reason: string;
  startsAt: ISODate; endsAt: ISODate | null;   // null = 무기한
  createdBy: UserId; flagId: string | null;
  liftedAt: ISODate | null; liftedBy: UserId | null; liftReason: string | null;
}
// 상태 = restrictionStatus(r, now): liftedAt 있으면 'lifted'(만료보다 우선) → endsAt ≤ now면 'expired' → 'active' (D54)
export type FlagRule = 'pair_repeat' | 'reciprocal' | 'pair_5star' | 'fast_high_bounty' | 'market_pair';
export interface Flag {                   // 계산 결과 (저장하지 않음)
  id: string;                             // `${rule}__${a}__${b}` (상호 규칙은 a,b 정렬) 또는 `fast_high_bounty__${questRef}`
  rule: FlagRule; severity: 'high' | 'medium';
  subjects: UserId[]; lastAt: ISODate;
  evidence: { kind: 'rating' | 'tx'; refId: string; text: string; at: ISODate }[];
  status: 'open' | 'actioned' | 'dismissed';   // flagStates에서 병합, 기본 open, 새 근거면 open (D60)
  alsoMatched: FlagRule[];                // R3이 R1을 흡수하면 ['pair_repeat'] (D59), 그 외 []
  newEvidence: number;                    // 처리 후 새로 생긴 근거 수 (D60), 처리 전 0
}
export interface FlagState { status: 'actioned' | 'dismissed'; by: UserId; at: ISODate; note: string; lastAt: ISODate; evidenceCount: number }   // lastAt·evidenceCount = 처리 시점 플래그 값 (D60)
export interface AdminLogEntry {
  id: string;                             // 'L1'…
  at: ISODate; actorId: UserId;
  action: 'restrict' | 'lift' | 'dismiss_flag';
  targetUserId: UserId | null; restrictionId: string | null; flagId: string | null;
  summary: string;                        // 예: "강창원 · 퀘스트 등록 제한 7일 · 사유: …"
}

export interface UIState { personaId: PersonaId; theme: ThemeMode }   // 키 'oq:v1:ui', 탭 간 방송 안 함

export interface QuestInput {
  type: QuestType; title: string; field: string; dueAt: ISODate; bodyHtml: string;
  attachments: Attachment[]; bounty: number;
}
export interface ItemInput {
  title: string; village: VillageKey; category: ItemCategory; mode: 'sale' | 'free'; price: number;
  bodyHtml: string; photos: MarketItem['photos'];
}

export type DomainErrorCode =
  | 'TIMER_EXPIRED' | 'DAILY_LIMIT' | 'INSUFFICIENT_POINTS' | 'NOT_RESERVED_BUYER' | 'FORBIDDEN'
  | 'INVALID_STATE' | 'PLEDGE_REQUIRED' | 'VALIDATION' | 'ALREADY_APPLIED'   // PENDING_REQUEST_EXISTS 코드는 두지 않음
  | 'RATING_REQUIRED' | 'REJECT_LIMIT' | 'RESTRICTED'   // 이미 활성·이미 해제·이미 처리 = INVALID_STATE (D55, D57)
  | 'UNDO_UNAVAILABLE';   // D89: 되돌리기 시 판매자 잔액 부족(사유 비공개)
export class DomainError extends Error { constructor(public code: DomainErrorCode, message: string) { super(message) } }
```

### 5.1 액션 (모든 변경은 순수 리듀서 `applyAction(db, action, actorId, now)`를 통과, MUST)
```ts
export type Action =
  | { type: 'quest/create'; input: QuestInput; pledge: true }
  | { type: 'quest/update'; no: number; patch: Partial<Pick<Quest,'title'|'field'|'dueAt'|'bodyHtml'|'attachments'>> }
  | { type: 'quest/delete'; no: number }
  | { type: 'quest/view'; no: number }
  | { type: 'quest/apply'; no: number; resolve: string; pledge: true }
  | { type: 'quest/adopt'; no: number; userId: UserId }
  | { type: 'quest/submit'; no: number; bodyHtml: string; attachments: Attachment[] }
  | { type: 'quest/reject'; no: number; reason: string }
  | { type: 'quest/approve'; no: number; stars: Stars }                     // D40: stars 없거나 1–5 밖이면 RATING_REQUIRED
  | { type: 'quest/answer'; no: number; bodyHtml: string; attachments: Attachment[] }   // 문의 답변 (D65)
  | { type: 'quest/acceptAnswer'; no: number; answerId: string; stars: Stars }         // 문의 채택 (D65)
  | { type: 'daily/claim'; mission: DailyMissionKey }
  | { type: 'character/equip'; appearance: CharacterAppearance }                       // (D75)
  | { type: 'season/reset' }
  | { type: 'timer/expire' } | { type: 'timer/reset' } | { type: 'timer/plus30' } | { type: 'timer/toggle' }
  | { type: 'item/create'; input: ItemInput } | { type: 'item/update'; id: string; patch: Partial<ItemInput> }
  | { type: 'item/delete'; id: string } | { type: 'item/view'; id: string } | { type: 'item/like'; id: string }
  | { type: 'item/reserve'; id: string; userId: UserId }    // 조직도 → 예약자 지정
  | { type: 'item/releaseReservation'; id: string }
  | { type: 'item/sellTo'; id: string; userId: UserId }     // 조직도 → 최종 구매자 지정 (정산 없음, 수령 대기)
  | { type: 'item/confirmReceipt'; id: string }             // 최종 구매자의 [샀어요] = 수령 확인 → 정산 (D63)
  | { type: 'item/undoReceipt'; id: string }                // 같은 버튼 재클릭 = 되돌리기 (D64)
  // item/request · item/approveRequest · item/declineRequest 액션은 두지 않음
  | { type: 'teams/send'; threadKey: string; text: string } | { type: 'teams/reply'; threadKey: string }
  | { type: 'admin/restrict'; userId: UserId; kinds: RestrictionKind[]; duration: RestrictionDuration; reason: string; flagId?: string }
  | { type: 'admin/lift'; restrictionId: string; reason: string }
  | { type: 'admin/dismissFlag'; flagId: string; reason: string }
  | { type: 'debug/resetData' };
```
`teams/reply`는 `thread.pendingReplyFor !== null`일 때만 성공하고(답장 1개 추가 후 `null`로), 아니면 `INVALID_STATE`(UI는 조용히 무시). 따라서 effect가 두 번 실행돼도 답장은 1개입니다. 같은 이유로 `item/confirmReceipt`는 `status === 'reserved'`일 때만, `item/undoReceipt`는 `receipt !== null`일 때만 성공합니다(두 번째는 `INVALID_STATE`).

`admin/*` 액션은 actor가 `role:'admin'`일 때만 성공(아니면 `FORBIDDEN`). 대상이 운영자면 `VALIDATION`. `admin/restrict`는 kinds를 정규 순서(`quest_post` → `purchase`)로 정렬하고(D56), **아직 활성이 아닌 종류마다** Restriction 1건 + AdminLogEntry 1건을 만들며, `flagId`가 있으면 `flagStates[flagId] = { status:'actioned', …, lastAt, evidenceCount }`. 요청 kinds가 전부 이미 활성이면 `INVALID_STATE`(D55). `flagId`가 열린 플래그가 아니면 `INVALID_STATE`. `admin/lift`는 대상이 `active`일 때만, `admin/dismissFlag`는 열린 플래그일 때만 성공하고 아니면 `INVALID_STATE`(D57). 운영자가 플레이어 액션(`quest/*`·`item/*`·`daily/claim`)을 하면 `FORBIDDEN`(`quest/view`·`item/view` 제외).

리듀서는 실패 시 `DomainError`를 던지고 **DB를 변경하지 않습니다**. UI는 같은 가드 함수(`canX(db, actor, ...)` → `{ ok: true } | { ok: false; code; reason }`)를 써서 버튼 비활성과 사유 라벨을 만듭니다. 가드와 리듀서가 같은 함수를 공유해야 합니다(MUST).

**가드 평가 순서**: 가드가 여러 개 동시에 실패하면 아래 순서로 평가해 **첫 번째 실패 code 하나**를 반환합니다(§7 표의 가드 열 나열 순서보다 이 규칙이 우선). ① 상태(표의 "현재" 열과 다름 → `INVALID_STATE`, 마감 지난 문의 답변 D91 포함) ② 주체(운영자·본인·대상 아님 → `FORBIDDEN`, 최종 구매자 아님 → `NOT_RESERVED_BUYER`) ③ 제재(`RESTRICTED`) ④ 시간(`TIMER_EXPIRED`) ⑤ 한도·잔액(`DAILY_LIMIT`·`REJECT_LIMIT`·`ALREADY_APPLIED`·`INSUFFICIENT_POINTS`·`UNDO_UNAVAILABLE`) ⑥ 입력(`PLEDGE_REQUIRED`·`VALIDATION`·`RATING_REQUIRED`). 예: 타이머 0에 이미 `done`인 문의에 `quest/answer` → `INVALID_STATE`, 구매 제한 + 잔액 부족 `confirmReceipt` → `RESTRICTED`. 타이머 0에 비관련 퀘스트 `quest/view` → `TIMER_EXPIRED`(D74).

**원자성(D80)**: 실패한 액션은 부분 정리도 하지 않습니다. 실패 뒤 화면 정리(모달 닫기·다른 행동 안내)는 UI가 맡고, 데이터 정리가 필요하면 UI가 **별도의 유효한 액션**을 dispatch합니다. **피드백(D71)**: 효과음·보상 모션은 `dispatch`가 성공을 반환한 뒤 UI가 한 번 재생합니다. 리듀서·DB 수신·렌더는 소리를 내지 않습니다.

---

## 6. 규칙 엔진 · 수식 (단일 출처: `src/lib/formulas.ts`)

### 6.1 레벨 · 티어
```
level(exp)        = floor(exp / 100) + 1
expInLevel(exp)   = exp mod 100            // EXP 바: expInLevel / 100
expToNext(exp)    = 100 − expInLevel(exp)
tier(level)       = bronze(1–4) | silver(5–9) | gold(10–14) | platinum(15–19) | diamond(20–24) | master(25+)
```
| 티어 | 레벨 | 누적 EXP | 외형(스프라이트) | 오라 |
|---|---|---|---|---|
| 브론즈 | 1–4 | 0–399 | 기본 사원복 + 브론즈 핀 | 없음 |
| 실버 | 5–9 | 400–899 | + 은빛 망토 | 은빛 먼지 |
| 골드 | 10–14 | 900–1,399 | 황금 갑옷 + 어깨판 + 레드 망토 + 왕관 | 황금 스파크 |
| 플래티넘 | 15–19 | 1,400–1,899 | 백금 갑옷 + 사이버 고글 + 오라 | 시안 픽셀 |
| 다이아 | 20–24 | 1,900–2,399 | 크리스탈 날개 | 크리스탈 조각 |
| 마스터 | 25+ | 2,400+ | 보라 갑옷 + 보라 날개 + 전설의 검 | 보랏빛 번개 |

예: 1,168 EXP → Lv.12 골드, 68/100, 다음 레벨까지 32 EXP / 플래티넘(Lv.15)까지 232 EXP. 650 EXP → Lv.7 실버. 750 → Lv.8.

### 6.2 포인트 흐름
| 이벤트 | 요청자 | 작업자 | 기타 | Tx 기록 |
|---|---|---|---|---|
| 퀘스트 등록 (현상금 B) | `points −= B` | — | `escrowHeld = B` | `bounty_escrow −B` (B=0이면 기록하지 않음) |
| 모집중 퀘스트 삭제 | `points += B` (100% 환불) | — | 퀘스트 제거 | `bounty_refund +B` (B>0일 때) |
| 퀘스트 완료(승인, 별점 s) | 변화 없음 | `points += 100 + B`, **`exp += RATING_EXP[s]`**(D40), `rating.sum += s`, `rating.count += 1`, `completedToday += 1`, `completedTotal += 1` | `escrowHeld = 0`, `db.ratings`에 RatingRecord 추가 | `quest_reward +(100+B)` |
| 일일 미션 보상 수령 | — | — | 수령자 `points += 10`, `exp += 50` | `daily_reward +10` |
| 문의 답변 채택 (별점 s, D65) | 변화 없음 | 답변자에게 퀘스트 완료(승인)와 같은 항목 | 같음 | `quest_reward +(100+B)` |
| 중고 거래 완료 = **최종 구매자의 수령 확인** (가격 X, D63) | — | — | 구매자 `points −= X`, 판매자 `points += X` | 구매자 `market_purchase −X`, 판매자 `market_sale +X` (**X=0도 0P로 양측 기록**). 최종 구매자 지정(`item/sellTo`) 자체는 Tx 없음 |
| 수령 되돌리기 (D64) | — | — | 구매자 `points += X`, 판매자 `points −= X`(판매자 잔액 ≥ X일 때만) | 원거래 2건에 `reversedAt`, 구매자 `market_purchase_refund +X`, 판매자 `market_sale_reversal −X`(`reversesTxId`) |

**불변식 (단위 테스트 MUST)**: (수령 확인·되돌리기는 사용자 간 이동이라 합계 불변) 모든 액션 전후로 `Σusers.points + Σquests.escrowHeld`의 변화량 = 그 액션에서 시스템이 발행한 금액(퀘스트 기본 보상 100, 일일 보상 10)의 합. 어떤 사용자도 `points < 0`이 될 수 없음.

### 6.3 일일 완료 한도 (D12)
- `completedToday ≥ 2`인 사용자: `[지원하기]` 비활성 — 사유 "오늘 완료 한도(2/2)에 도달했어요 · 내일 다시 지원할 수 있어요".
- 작업자의 `completedToday ≥ 2`인 퀘스트: 요청자의 `[퀘스트 완료(승인)]` 비활성 — 사유 "작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요". `[반려]`는 가능.
- 문의(D66): 답변 **작성**에는 한도를 적용하지 않음. **채택**할 때 답변자의 `completedToday ≥ 2`면 `accept-answer-btn-{answerId}` 비활성 — 사유 "답변자의 오늘 완료 한도(2/2) 도달 · 내일 채택할 수 있어요".
- GNB/대시보드/사이드박스에 "오늘 완료 보상 n / 2" 표시.

### 6.4 일일 초기화 (KST 00:00)
앱 로드 시와 1분마다 `kstDayKey(now) !== db.dayKey`이면 한 번에 적용: 모든 사용자 `completedToday = 0`, 모든 `daily[*]`를 새 dayKey로 초기화(achieved/claimed 모두 false), `timer.endsAt = now + 2h`, `db.dayKey` 갱신. **시드 적재 시 `dayKey = kstDayKey(now)`로 기록**(시드 값이 즉시 초기화되지 않도록). **자정 경계**: 1분 주기를 기다리는 동안에도 판정이 어제 기준이 되지 않도록, 가드·열람 셀렉터(D74)·일일 한도는 `kstDayKey(now) !== db.dayKey`이면 **초기화가 이미 적용된 값**(completedToday 0, 타이머 2시간 남음, 일일 미션 미달성)으로 판정하고, 앱은 `useNow(1000)` 틱에서 그 차이를 발견하면 즉시 초기화를 적용합니다(참조 구현 방식).

### 6.5 일일 퀘스트 4종 (사용자별, MUST)
| key | 제목 | 달성 조건 (달성 시 `achieved=true`) |
|---|---|---|
| `login` | 오늘 오피스퀘스트 접속하기 | 해당 페르소나가 오늘 처음 활성화될 때(앱 로드 또는 페르소나 전환) 자동 |
| `post` | 업무 퀘스트 1회 등록하기 | 그 사용자가 오늘 `quest/create` 성공 |
| `complete` | 업무 퀘스트 1회 완료하기 | 그 사용자가 작업자로 오늘 `quest/approve` 받음 **또는 문의 답변이 오늘 채택됨**(`quest/acceptAnswer`) |
| `adopted` | 지원한 퀘스트 채택되기 1회 | 그 사용자가 오늘 `quest/adopt`의 대상이 됨 **또는 문의 답변이 오늘 채택됨** |
- 보상은 **자동 지급이 아니라** `[보상 받기 +10 P]` 클릭 시 +10P·+50EXP, 하루 미션당 1회. 성공 시 보상 패널(`reward-panel[data-kind=daily]`, 픽셀 코인 퍼짐) + 코인 효과음(§8.20, D71).
- 진행률 링 = 달성 수 / 4 (refs/01 "1/4").

### 6.6 세션 타이머 (전역 1개, D11)
- 표시 `HH:MM:SS` = `max(0, timer.endsAt − now)`; 250ms마다 갱신; 글자별 고정폭 span(DESIGN §2.1).
- 시드: `endsAt = now + 2h` → 02:00:00.
- `timer/toggle`: 남은 시간 > 0 → `endsAt = now`; 아니면 `endsAt = now + 2h`.
- `timer/expire`: `endsAt = now`. `timer/reset`: `endsAt = now + 2h`. `timer/plus30`: `endsAt = min(now + 2h, max(now, endsAt) + 30m)`.
- **남은 시간 0일 때 비활성 쓰기 동작 (정확히 4개)**: `[퀘스트 등록]`(사이드바 진입은 허용, 폼의 등록 버튼과 게시판의 등록 버튼 비활성), `[지원하기]`, `[결과물 제출하기]`(재제출 포함), **`[답변 등록]`(문의, D65)**. 사유 라벨/툴팁: "오늘 작업 가능 시간을 모두 사용했어요 (00:00:00)".
- **열람 제한(D74)**: 공개 게시판과 본인과 관련 없는 퀘스트 상세는 닫힘(행렬 §8.21). 본인 관련 목록·상세 **열람**, 채택·반려·승인·답변 채택, 효성마을 **모든 기능**은 타이머와 무관하게 동작(MUST). 운영자는 모두 열람.
- 라이브 점은 `--live-dot`(라이트 보라, 다크 효성 옐로, D2). 0이면 점이 `--danger-fg`로 바뀌고 깜빡임 멈춤.

### 6.7 시즌
- 대시보드: `{season.label} 종료까지 D-{n}` (D20), 진행률 = `Math.ceil((now − startsAt)/(endsAt − startsAt) × 100)`% (D37; 시드 시점 실값 77.48% → **78%**).
- 랭킹 TOP 5 = 전체 **플레이어**(`role:'player'`, 운영자 제외 D47) `exp` 내림차순, 동점이면 `name` 오름차순. 현재 페르소나 행 강조.
- `[시즌 초기화 시뮬레이션]` → 확인 모달 → `season/reset`: 모든 사용자 `exp = 0`(Lv.1 브론즈), 각 사용자 `seasonBadges`에 **종료된 시즌 라벨 `'2026 Season 1'`** 추가(획득 배지 = 지난 시즌), 대시보드 시즌 라벨 `dash-season-label` = **새 시즌 라벨 `'2026 Season 2'`**, `season = { id+1, label: '2026 Season {id+1}', startsAt: now, endsAt: KST 23:59:59 of (now + 28일) }`. **`points`, `completedTotal`, `appearance`(꾸미기 선택, D75), 퀘스트·물품·거래내역은 그대로**. 선택 의상이 다시 잠기면 화면은 현재 티어 의상으로 표시(선택값은 보존). 초기화 직후 토스트 "포인트는 100% 유지돼요 · 1,500 P"(현재 페르소나 값) — 포인트 유지를 시각적으로 증명.

### 6.8 별점 보상 (D40–D44)
- `ratingExp(s) = RATING_EXP[s]`: 1→50, 2→75, 3→100, 4→125, 5→150. `formatRating(r)` = D41.
- 레벨·티어는 기존 §6.1 수식 그대로(EXP만 달라짐). 예: lee 650 EXP에서 별 3개 → 750 Lv.8, 별 5개 → 800 Lv.9, 별 1개 → 700 Lv.8.
- 별점은 요청자만, 승인 시 1회. 수정·취소 없음. 운영자는 별점을 주거나 받지 않음.
- **집계와 원장은 별개**: `user.rating`은 과거분까지 포함한 누적 집계(§4.4 시드), `db.ratings` 원장은 최근 기록(시드 rt1–rt9 + 이후 승인)만 담고 **모니터링은 원장만** 사용. 따라서 "집계 = 원장 합"은 불변식이 아님(lee의 시드 8건은 원장에 없음). 대신 맞춰야 하는 불변식: ① 모든 플레이어 `rating.count === completedTotal` ② 시드 이후 추가된 RatingRecord(id ∉ rt1–rt9)의 작업자별 건수·별 합 = `rating`의 시드값 대비 증가분 ③ 승인 1회 = RatingRecord 정확히 1건 추가(Harness `invariants.test`).

### 6.9 반려 한도 (D45)
- `quest/reject` 성공 시 `rejectCount += 1`. 가드: `rejectCount < REJECT_LIMIT` 아니면 `REJECT_LIMIT`.
- `rejectCount === 2`이고 `reviewPending === true`면 요청자에게 남은 행동은 `[퀘스트 완료 (승인)]`(별점 1–5) 뿐. 작업자 재제출은 반려 횟수와 무관하게 가능(타이머 가드는 유지).
- **반려 2/2 + 작업자 오늘 완료 2/2(D12) 겹침**: D12가 우선. `approve-btn` 비활성 + D12 사유 "작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요", `reject-btn` 비활성 + D45 툴팁. 상태는 그대로 유지되고, KST 다음 날 `completedToday` 초기화 후 승인 가능(막다른 상태 아님, 데이터 변경 없음). 단위 테스트 1건 MUST(Harness §5.1).

### 6.10 운영자 · 제재 (D47, D50, D51)
- `restrictionStatus(r, now)` = `r.liftedAt != null ? 'lifted' : (r.endsAt != null && now >= Date.parse(r.endsAt) ? 'expired' : 'active')`(D54). `activeRestrictions(db, userId, now)` = 그 사용자의 `restrictionStatus === 'active'`인 제재.
- **만료 시 화면 갱신**: 제재·배너·버튼 가드는 DB가 바뀌지 않아도 시간이 흐르면 결과가 달라지므로, 공용 훅 `useNow(1000)`(1초 틱, GNB 타이머 틱과 같은 소스, `clock.now()` 사용)의 값을 `canX(db, actor, now)`에 넣어 다시 평가합니다. 새로고침 없이 만료 시각 1초 안에 배너가 사라지고 버튼이 다시 활성(Harness `15`의 clock 테스트).
- `endsAt = startsAt + days × 24h`(무기한은 null). 만료 시 자동으로 비활성(액션·로그 없음, 제재 표에서 "만료" 배지).
- 시각 표기(`{MM.DD HH:mm}`, evidence의 "10.14 16:20")는 `Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', … })`만 사용(OS 시간대 무관, Harness 부록 A-8 vitest TZ 고정).
- 사유 라벨(정확한 문구): 등록 제한 "운영자 제재로 퀘스트 등록이 제한됐어요 ({MM.DD HH:mm}까지 · 사유: {reason})", 무기한이면 "(해제 시까지 · 사유: …)". 구매 제한 "운영자 제재로 구매가 제한됐어요 ({…}까지 · 사유: {reason})".
- 제재받은 사용자의 모든 화면 상단에 `restriction-banner`(warning 색, Lucide `shield-alert`): "운영자 제재 중 · {종류 목록} · {기간} · 사유: {reason}". 운영자 화면에는 표시 안 함.

### 6.11 의심 활동 탐지 `detectFlags(db, now)` (단일 출처: `src/lib/monitoring.ts`, D49)
최근 14일(`now − 14일 ≤ at ≤ now`)의 `db.ratings`(approvedAt 기준)와 `db.transactions`(`market_purchase`, at 기준, **`reversedAt`이 있는 되돌린 구매는 제외**, D64)만 사용. 운영자는 대상 아님. 결과는 `severity`(high 먼저) → `lastAt` 내림차순 → `id` 오름차순으로 정렬.
| 규칙 | 조건 | id | 심각도 | 근거(evidence) |
|---|---|---|---|---|
| R1 `pair_repeat` | 같은 (요청자 a → 작업자 b) 완료 ≥ 3 **이고 같은 쌍에 R3이 성립하지 않음**(성립하면 R3의 `alsoMatched`로, D59) | `pair_repeat__a__b` | medium | 해당 RatingRecord 전부 |
| R2 `reciprocal` | a→b 완료 ≥ 2 **그리고** b→a 완료 ≥ 2 | `reciprocal__x__y`(정렬) | high | 양방향 RatingRecord 전부 |
| R3 `pair_5star` | 같은 (a → b) 평가 ≥ 3건이고 전부 별점 5(만점) | `pair_5star__a__b` | medium | 해당 RatingRecord |
| R4 `fast_high_bounty` | bounty ≥ 500 이고 approvedAt − postedAt ≤ 30분 | `fast_high_bounty__{questRef}` | high | 그 RatingRecord 1건 |
| R5 `market_pair` | 같은 두 사람(방향 무관) 사이 0 P 초과 `market_purchase`가 ≥ 3건, **또는** ≥ 2건이면서 합계 ≥ 2,000 P(D58) | `market_pair__x__y`(정렬) | medium | 해당 구매 Tx 전부(구매자·판매자·금액·시각) |
- `evidence[].text` 예: "A-101 · 최다이아 → 강창원 · 별점 5 · 현상금 200 P · 10.14 16:20", "Tx t31 · 정플래 → 최다이아 · 800 P · 10.15 12:10".
- `status`(D60): `st = flagStates[id]`가 없으면 `open`. 있으면 `Date.parse(flag.lastAt) > Date.parse(st.lastAt)`일 때 `open` + `newEvidence = (st.lastAt 이후 근거 수)`, 아니면 `st.status`. 같은 DB·같은 now → 같은 결과(결정성, 단위 테스트 MUST).
- 시연 메모: 시연 중 현상금 ≥ 500 퀘스트를 30분 안에 승인하면 R4 high가 바로 생깁니다(의도된 동작). 정식 시나리오 §11은 현상금 300이라 해당 없음.

---

## 7. 상태 머신

### 7.1 업무 퀘스트
| 현재 상태 | 이벤트 (주체) | 가드 | 다음 상태 | 부수 효과 |
|---|---|---|---|---|
| — | `quest/create` (플레이어) | **`quest_post` 활성 제재 없음**(아니면 `RESTRICTED`, D51), 타이머>0, 보안서약 3항목 동의, 제목 2–60자, 본문 텍스트 ≥20자, `0≤B≤min(1000,points)`, B%10==0 | `recruiting` | 요청자 −B, escrowHeld=B, Tx, 일일 `post` 달성, **하이퍼 프레임 A** → 1,800ms 후 `/quests/board` 이동 |
| `recruiting` | `quest/update` (요청자) | 요청자 본인, **문의면 `answers.length === 0`**(D65) | `recruiting` | 유형·현상금 변경 불가(D25) |
| `recruiting` | `quest/delete` (요청자) | 요청자 본인, 확인 모달, **문의면 `answers.length === 0`**(아니면 `INVALID_STATE` "답변이 달린 문의는 수정·삭제할 수 없어요") | (제거) | 요청자 +B 환불, Tx |
| `recruiting` (요청만) | `quest/apply` (요청자 외) | 타이머>0, `completedToday<2`, 미지원, 보안서약 동의, 각오 1–60자 | `recruiting` | applications에 추가 |
| `recruiting` | `quest/adopt` (요청자) | 지원자 ≥1, 대상이 지원자, 아직 workerId 없음 | `in_progress` | workerId·adoptedAt 설정, 작업자 일일 `adopted` 달성, 알림, **수정/삭제 즉시 잠금** |
| `in_progress` (reviewPending=false) | `quest/submit` (작업자) | 타이머>0, 본문 텍스트 ≥10자 | `in_progress` (reviewPending=true) | Submission v(n+1) |
| `in_progress` (reviewPending=true) | `quest/reject` (요청자) | 사유 ≥5자, **`rejectCount < 2`**(아니면 `REJECT_LIMIT`, D45) | `revision` (reviewPending=false) | 마지막 Submission.review=rejected+reason, **rejectCount+1**, 알림 |
| `revision` | `quest/submit` (작업자) | 타이머>0, 본문 텍스트 ≥10자 | `in_progress` (reviewPending=true) | Submission v(n+1) (D14) |
| `in_progress` (reviewPending=true) | `quest/approve` (요청자) | 작업자 `completedToday<2`, **stars ∈ 1–5**(아니면 `RATING_REQUIRED`) | `done` | 작업자 +100+B P, **+RATING_EXP[stars] EXP**, rating 누적, quest.rating 기록, RatingRecord 추가, completedToday+1, completedTotal+1, escrowHeld=0, Tx, 작업자 일일 `complete` 달성, **하이퍼 프레임 B** |
| `in_progress`/`revision`/`done` | `quest/update`/`delete` | — | 거부 (`INVALID_STATE`) | 버튼은 잠금 아이콘 + 툴팁 "진행중·완료 상태에서는 수정/삭제할 수 없어요" |
| `recruiting` (문의) | `quest/answer` (요청자 외 플레이어, D65) | (D91) `now < dueAt`(아니면 `INVALID_STATE` `INQUIRY_DUE_NOTICE`), 운영자 `FORBIDDEN`, 요청자 `FORBIDDEN`, 타이머>0(`TIMER_EXPIRED`), 본문 텍스트 ≥10자, 첨부는 이미지만(D69), **일일 한도·횟수 제한 없음**(D66), 보안서약 모달 없음 | `recruiting` | answers에 추가(작성순), 요청자 알림 `answer_posted`, 성공음(§8.20) |
| `recruiting` (문의, answers ≥1) | `quest/acceptAnswer` (요청자) | (`dueAt` 경과와 무관, D91) 요청자 본인, 대상 답변 존재, 답변자 ≠ 요청자 · 플레이어, 답변자 `completedToday<2`(`DAILY_LIMIT`, D66), stars ∈ 1–5(`RATING_REQUIRED`) | `done` | workerId = 답변자, acceptedAnswerId, completedAt, 보상·EXP·rating·RatingRecord·completedToday·completedTotal·escrowHeld=0·Tx·일일 `complete`·`adopted` 달성 = `quest/approve`와 동일, **하이퍼 프레임 B** |
| `done` (문의) | `quest/answer`·`quest/acceptAnswer` | — | 거부 (`INVALID_STATE`) | 답변 에디터 숨김 + "채택이 끝난 문의예요" |
| 모든 상태 (문의) | `quest/apply`·`adopt`·`submit`·`reject`·`approve` | — | 거부 (`INVALID_STATE`) | 해당 UI 없음 |
| 모든 상태 | `quest/view` (누구나) | **타이머 0이면 운영자·본인 관련(요청자·지원자·작업자·답변자)만**(D74, 아니면 `TIMER_EXPIRED`) | 동일 | views +1 (상세 진입마다, 막힌 열람은 증가 없음) |

추가 규칙: 지원자 결과물 에디터는 **채택 전 모든 사용자에게 잠김**(ref06 잠금 패널). 채택 후 **작업자 본인에게만** 열림. 작업자가 아닌 사용자는 제출 영역 대신 읽기 전용 제출 이력만 봄. 요청자는 자기 퀘스트에 지원 불가(`FORBIDDEN`). **위 규칙(지원자 에디터 잠금·채택·검수)은 요청에만 적용**되고, 문의는 §8.18의 답변형 화면을 씁니다(D65).

### 7.2 효성마을 물품 (D63·D64: 판매자 지정 → 구매자 수령 확인)
흐름: `거래가능 → (예약자 지정) 예약중 → 최종 구매자 지정(예약중 · 수령 대기, 정산 없음) → 최종 구매자 [샀어요] = 수령 확인 → 거래완료 → (같은 버튼 재클릭) 되돌리기 → 수령 대기`.

| 현재 | 이벤트 (주체) | 가드 | 다음 | 부수 효과 · 포인트 변경 시점 |
|---|---|---|---|---|
| — | `item/create` (플레이어) | 제목 2–40자, mode=sale이면 가격 10–100,000 & 10단위, free면 0, 사진 ≤5 | `available` | — (타이머 무관) |
| `available`/`reserved`(수령 대기 포함) | `item/reserve` (판매자, 조직도 `[예약자 지정]`) | actor = 판매자(아니면 `FORBIDDEN`), 대상 ≠ 판매자 · 플레이어(`VALIDATION`), 대상에 `purchase` 활성 제재 없음(`RESTRICTED`, D51). **대상 잔액은 보지 않음**(D67) | `reserved` (reservedFor=대상, **finalBuyerId=null**) | 대상 알림·토스트. 포인트 변화 없음. 수령 대기 중이면 최종 구매자 지정이 풀림(이전 최종 구매자 화면은 §7.3 안내로 바뀜, 알림 없음 — 참조 구현과 같음) |
| `available`/`reserved`(수령 대기 포함 = 다른 사람으로 재지정) | `item/sellTo` (판매자, 조직도 `[최종 구매자 지정]`) | 위와 같음 | `reserved` (reservedFor=finalBuyerId=대상) = **수령 대기** | 대상 알림 `final_buyer_designated` "{판매자}님이 {물품}의 최종 구매자로 지정했어요 · 물품을 받으면 [샀어요]를 눌러 주세요". **포인트 변화 없음, Tx 없음** |
| `reserved`(수령 대기 포함) | `item/releaseReservation` (판매자) | actor = 판매자(아니면 `FORBIDDEN`) | `available` | reservedFor=null, finalBuyerId=null |
| `reserved` (finalBuyerId=actor) | `item/confirmReceipt` (최종 구매자 `[샀어요]`) | 판매자 본인·운영자 `FORBIDDEN`, **actor === finalBuyerId**(아니면 `NOT_RESERVED_BUYER`, 비최종 구매자 코드 통일), `purchase` 활성 제재 없음(`RESTRICTED`), `points ≥ price`(아니면 `INSUFFICIENT_POINTS` — UI는 dispatch 전에 **경고 모달**, §7.3) | `sold` | **이 시점에 정산**(§6.2): 구매자 −X, 판매자 +X, Tx 양측, buyerId·soldAt·`receipt`, reservedFor=null(finalBuyerId 유지), 판매자 알림 `receipt_confirmed`, 거래 완료 패널 + 효과음(§8.20) |
| `sold` (receipt.buyerId=actor) | `item/undoReceipt` (같은 버튼 재클릭) | `receipt !== null`(아니면 `INVALID_STATE`), actor === receipt.buyerId(아니면 `FORBIDDEN`), **판매자 points ≥ price**(아니면 `UNDO_UNAVAILABLE`, UI는 중립 토스트만 — D89). 제재·타이머 무관 | `reserved` (reservedFor=finalBuyerId=구매자, 수령 대기) | 원거래 2건 `reversedAt`, 역분개 Tx 2건(§6.2), buyerId·soldAt·receipt = null, 판매자 알림 `receipt_undone`, 복원 안내 모션 + 효과음 |
| `available`/`reserved` (finalBuyerId=null) | `item/update`/`item/delete` (판매자) | — | 동일/제거 | — |
| `reserved` (finalBuyerId≠null) | `item/update`/`item/delete` | — | 거부 (`INVALID_STATE`) | 사유 "수령 대기 중에는 수정·삭제할 수 없어요 · 먼저 예약을 해제해 주세요" |
| `sold` | 판매자 액션(reserve·sellTo·release·update·delete) | — | 거부 (`INVALID_STATE`) | "거래가 완료된 상품이에요", 썸네일 opacity .35 |
| 모든 상태 | `item/like` (플레이어) | — | 동일 | likedBy 토글, likeCount ±1 |
| 모든 상태 | `item/view` | — | 동일 | views +1 |

판매자에게는 `[샀어요]` 대신 **판매자 패널**(상태 변경 메뉴: 조직도에서 예약자 지정 / 최종 구매자 지정 / 예약 해제 — 이 세 동작과 `seller-status-menu`·`open-orgchart-btn`·`release-reservation-btn`은 **수정 가드가 아니라 각 액션의 가드**로 활성 판정하므로 수령 대기 중에도 활성, 거래완료에서만 비활성, 상태 카드 `seller-trade-status`: "거래가능" · "예약중 · {이름}" · "수령 대기 · {이름}님이 [샀어요]를 누르면 거래가 완료돼요" · "거래완료 · {이름}", 수정·삭제)이 보입니다. NPC 판매자는 지정하지 않으므로 NPC 물품은 열람·좋아요·Teams만 가능(D16). **효성마을의 어떤 액션도 타이머의 영향을 받지 않습니다.**

### 7.3 `[샀어요]` 버튼과 구매자 안내 (구매자 관점)
`buy-btn`은 **최종 구매자에게만** 렌더하고, 그 외 사람에게는 같은 자리에 안내 `buy-guidance`(+`data-state`)를 보여줍니다. 목록 카드에는 어느 쪽도 없습니다(D63).

| 조건 (위에서부터 첫 일치) | 요소 · data-state | 라벨 / 안내 문구 | 활성 |
|---|---|---|---|
| actor가 판매자 | (없음, 판매자 패널) | — | — |
| actor가 운영자 | (없음) | — | — |
| status=sold & receipt.buyerId == actor | `buy-btn` · `received` (`aria-pressed=true`) | 거래 완료 · 다시 누르면 되돌려요 | ○ (항상 활성. 판매자 잔액 < 가격이면 클릭 결과로 info 토스트 `UNDO_UNAVAILABLE_NOTICE`만, 상태·포인트 불변 — D89) |
| status=sold | `buy-guidance` · `sold` | 거래가 완료된 상품이에요 | — |
| 판매자가 NPC | `buy-guidance` · `npc` | `MARKET_NPC_GUIDANCE` "시연용 NPC 물품이에요 · 둘러보기·좋아요·Teams 대화만 할 수 있어요" (예약 여부 무관, D90) | — |
| finalBuyerId == actor & `purchase` 활성 제재 (D51) | `buy-btn` · `restricted` | 운영자 제재로 구매가 제한됐어요 | ✕ (사유 툴팁 §6.10) |
| finalBuyerId == actor & mode=free | `buy-btn` · `free` | 샀어요 · 나눔 받았어요 | ○ |
| finalBuyerId == actor | `buy-btn` · `buy` | 샀어요 · 물품 수령 확인 | ○ (클릭 시 포인트 부족이면 경고 모달) |
| status=reserved & reservedFor == actor | `buy-guidance` · `reserved-me` | 예약자로 지정됐어요 · 판매자가 최종 구매자로 지정하면 [샀어요]가 열려요 | — |
| status=reserved | `buy-guidance` · `locked-reserved` | 예약중인 상품입니다 - 지정 예약자 외 구매 불가 | — |
| 그 외 (available) | `buy-guidance` · `available` | 판매자와 팀즈로 이야기해 보세요 · 판매자가 최종 구매자로 지정하면 [샀어요]가 열려요 | — |

포인트 부족은 **버튼을 비활성화하지 않고** 클릭 시 모달로 차단(원본 PRD 문구 그대로): "보유 포인트가 부족합니다! 업무 퀘스트를 수행해 포인트를 모아보세요." (참조 구현은 버튼을 비활성화했으나 원본 문구·D63에 따라 모달 유지)

---

## 8. 화면별 명세 · 수용 기준

> 각 화면은 지정된 ref와 **구도·정보 배치·카피·상태 표현**이 일치해야 합니다(Harness §6 Visual QA). 픽셀 단위 일치는 요구하지 않습니다. 시각 값은 DESIGN.md를 따릅니다. `data-testid`는 Harness §5.3 목록이 정본입니다.

### 8.1 앱 셸 · GNB (모든 화면, ref 01–10 상단)
**구성(좌→우, DESIGN §6)**: 로고 타일(픽셀 별) + "OFFICE QUEST" + "× 효성마을" → 탭 세그먼트 3개(D1, 활성 흰 필 280ms 슬라이드) → 타이머 칩(라벨 "시연 세션 남은 시간", `HH:MM:SS`, Lucide `zap` + "시연 타이머" 토글, +30분, 만료 테스트, 리셋(Lucide `rotate-ccw`)) → 포인트 칩(코인 스프라이트 + 현재 페르소나 P) → 페르소나 전환기(플레이어 3명 + 구분선 "운영자" 아래 `ops`, 아바타 + 이름·부서, 드롭다운; 운영자일 때는 포인트 칩 대신 `admin-badge`, 탭에 `운영자 콘솔` 추가 — D47·D48) → 테마 토글("라이트" ↔ "게이밍") → **효과음 토글 `sound-toggle`**(Lucide `volume-2`/`volume-x`, `aria-pressed`, D71). DEBUG 메뉴에 `[데이터 초기화]`(시드 재적재, 확인 모달) SHOULD.

- AC-8.1.1 로고 클릭 → `/`.
- AC-8.1.2 페르소나 전환 시 새로고침 없이 포인트 칩·대시보드·버튼 권한·사이드박스가 즉시 바뀐다(E2E: 전환 후 기본 expect 타임아웃 안에 `points-chip` 값 변경, 페이지 navigation 이벤트 0). "200ms 이내 렌더"는 SHOULD(`performance.mark` 측정값을 Audit에 기록).
- AC-8.1.3 테마 토글 → `<html data-theme="dark">`, 새로고침 후 유지, 첫 페인트 깜빡임 없음(인라인 스크립트로 선적용). View Transition 원형 리빌 SHOULD.
- AC-8.1.4 타이머가 초 단위로 감소하고(E2E: `page.clock.install` → `runFor(3000)` 후 표시가 3±1초 감소), 시연 타이머 토글(`timer-ctl-toggle`) 1회 → `00:00:00`, 2회 → `02:00:00`.
- AC-8.1.6 전환기에 `persona-option-ops`가 있고, 운영자로 전환하면 `admin-badge`·`nav-admin`이 보이며 `points-chip`·랭킹 행에 운영자가 없다. 다른 페르소나에서는 `nav-admin`이 없다(탭 3개 유지).
- AC-8.1.5 하이드레이션 완료 후 `<html data-hydrated="true">`. 그 전에는 레이아웃이 같은 스켈레톤.
- AC-8.1.7 `sound-toggle`로 음소거하면 새로고침 뒤에도 유지되고(`oq:audio:muted`), 음소거 중에는 어떤 효과음도 재생 요청되지 않는다(§8.20).
- AC-8.1.8 (D72) `public/fonts/paperlogy/`에 6개 파일이 있을 때 앱 실행 중 `fastly.jsdelivr.net`으로 가는 요청이 0건이고 `document.fonts.check('800 16px Paperlogy')`가 true다(파일이 없으면 `ENV-SKIP`).

### 8.2 대시보드 `/` — `refs/01_dashboard_light.png`
비대칭 벤토: `grid-cols-[1fr_1.12fr_1.38fr] grid-rows-2 gap-5`, 카드1·2 `row-span-2` (DESIGN §6).
| 셀 | 필수 내용 |
|---|---|
| ① 내 캐릭터 스테이터스 | 카드 제목 옆 Lucide `info` 버튼(`char-info-btn` → 티어 안내 모달 §8.19), 티어 배지(예: GOLD 티어), 히어로 박스(캔버스 캐릭터 ×12–13 = 꾸미기 외형 D75·D76, 클릭하면 꾸미기 모달 §8.19, 티어 오라, 장비 배지 "황금 갑옷 장착" = 표시 의상 이름, `[꾸미기]` 버튼 `char-studio-btn`), Lv 배지, "오늘 완료 보상 n / 2", 이름·부서·마을·사번, EXP 바(`티어 Lv.n · 다음 레벨까지 x EXP`, `y / 100 EXP`), 스탯 타일 3개(보유 포인트 · 오늘 완료 n/2회 · 완료 퀘스트 n건), 별점 평균 줄(`dash-rating`, Lucide `star` + "4.3 · 평가 23건", D42 — ref01에 없는 추가 요소) |
| ② 시즌 랭킹 TOP 5 | 시즌 배지, D-Day 다크 배너(`D-14`, "시즌 종료까지 14일", 마감 일시, 진행률 바 78%), 랭킹 5행(순위·아바타·이름·부서·티어배지·시즌 EXP, 내 행 강조 + "나" 배지), `[시즌 초기화 시뮬레이션]` + 안내 "전원 Lv.1 브론즈 · 0 EXP로 초기화 · 보유 P 100% 유지" |
| ③ 오늘의 일일 퀘스트 | 진행 링(n/4), 4행(아이콘·제목·진행바·n/1·`보상 받기 가능` 또는 `+10P +50EXP`) |
| ④ 최신 소식 | 2열: 최신 업무 퀘스트 3개(분류·상태 배지, 제목, "100P + 현상금 nP · 부서") / 효성마을 인기 매물 3개(likeCount 내림차순: 상태 배지, Lucide `heart` + 좋아요 수, 제목, 마을·가격 또는 무료나눔). 클릭 시 상세 이동 <br>※ 인기 매물 규칙 = 거래완료 제외 · likeCount 내림차순 상위 3(시드 결과: 커피머신 41 · CGV 36 · 게임 패드 33). ref01의 세 번째 카드(27인치 모니터)는 예시이며 Visual QA는 개수(3+3)만 검사 |

- AC-8.2.1 김효성 시드 기준 값이 ref01과 같다: Lv.12, 68/100, 1,500 P, 0/2, 23건, D-14, TOP5 순서와 점수, 일일 1/4.
- AC-8.2.2 레벨/티어가 바뀌면(승인·보상 수령·시즌 초기화) 캐릭터 스프라이트와 오라가 즉시 바뀐다(`[data-testid=pixel-sprite][data-tier]` 값 변경).
- AC-8.2.3 시즌 초기화 후: 모든 사용자 Lv.1 브론즈 0 EXP, `dash-season-label` = "2026 Season 2", 현재 페르소나 `seasonBadges`에 "2026 Season 1" 포함, 현재 페르소나 포인트 값이 초기화 전과 동일.
- AC-8.2.5 김효성 시드 기준 `dash-rating` = "4.3 · 평가 23건"(D41).
- AC-8.2.4 1280px 미만에서 2열로 접히고 가로 스크롤이 없다(DESIGN §6.1 반응형 표, D87).
- AC-8.2.6 대시보드 캐릭터 `pixel-sprite`에 `data-tier`(성장 티어)와 별도로 `data-outfit`·`data-gender`·`data-hair`(표시 외형)가 있다. 시드 kim = `data-tier=gold` · `data-outfit=gold` · `data-gender=male` · `data-hair=classic`.

### 8.3 일일 퀘스트 `/quests/daily` — `refs/02_daily_quests_tiers.png`
좌측 사이드바(업무 퀘스트: 일일 퀘스트 n/4 · 퀘스트 등록 · 업무 퀘스트 게시판 n / 내 퀘스트 그룹 SHOULD / 하단 "오늘 완료 보상 n / 2" 박스). 본문: 헤더(초기화까지 남은 시간 칩, 오늘 받은 보상 칩), 미션 카드 4장(아이콘, 상태 배지 달성 완료/진행중, 설명, 진행바, n/1, +10P·+50EXP 칩, CTA: 달성&미수령 → primary `보상 받기 +10 P`; 미달성 → **활성** secondary 이동 버튼(`daily-go-{k}`) "퀘스트 등록하러 가기"/"진행중 퀘스트 n건"/"지원 중인 퀘스트 n건"(각각 `/quests/new`, `/quests/board?mine=requested`, `/quests/board?mine=applied`); 수령 완료 → 비활성 "오늘 보상 수령 완료". `daily-claim-{k}`는 **수령 버튼(달성&미수령·수령 완료)에만** 붙임. `login`은 자동 달성이므로 이동 버튼이 없음), 내 캐릭터 카드(누적 EXP, 다음 티어까지), **6단계 티어 진화표**(스프라이트 6종, 티어 배지, 레벨 구간, 누적 EXP, 외형·장비, 오라, 인원, 현재 티어 행 강조 + "현재" 배지).
- AC-8.3.1 김효성 첫 로드 시 `login` 달성(1/1), 클릭하면 +10 P(1,510)·+50 EXP(1,218, Lv.13) 반영되고 버튼이 수령 완료로 바뀐다. 같은 날 재수령 불가.
- AC-8.3.2 퀘스트 등록 성공 후 `post` 카드가 달성 상태가 된다.
- AC-8.3.3 티어 진화표 6행 모두 서로 다른 캔버스 스프라이트로 렌더된다(빈 캔버스 없음: 픽셀 알파 합 > 0).
- AC-8.3.4 보상 수령 성공 시 `reward-panel[data-kind=daily]`가 "일일 보상 획득! +10 P · +50 EXP"를 보이고 코인 효과음이 정확히 1회 요청된다. 새로고침·다른 탭 동기화로는 다시 재생되지 않는다(D71).

### 8.4 퀘스트 등록 `/quests/new` — `refs/04_quest_create.png`
본문 카드: 유형 세그먼트(문의/요청 + 설명 "답변만 필요한 간단한 질문" ↔ "결과물 제출이 필요한 업무 요청"), 제목(글자 수 n/60), 업무 분야 셀렉트(재무·엑셀 자동화 / 문서·PPT 디자인 / 데이터·BI / IT·시스템 / 인사·총무 / 생산·품질 / 기타), 마감일(datetime-local), **리치 에디터**(TinyMCE 5.10.2 스킨 오버라이드: 메뉴바 파일/편집/보기/삽입/서식/표/도구, 툴바 undo·블록·폰트·B·I·U·글자색·정렬·리스트·링크·이미지·표·코드블록, 상태바, 우측 "TinyMCE 5.10.2" 태그, 경고 배너 없음), 첨부(행렬 D69·D70: **요청** = `[파일 첨부]`(`quest-attach-input`) → 600ms 진행바 → SharePoint 스타일 시연 배지 "SharePoint · 1.8 MB · 시연용 첨부"(파일명 버튼, 클릭 시 "다운로드 중…" 안내) + `[스크린샷 이미지 첨부]`(`quest-screenshot-input`) → Base64 미리보기, 라벨 "시연용 첨부 · 실제 파일은 저장되지 않아요"; **문의** = `[스크린샷 이미지 첨부]`만 렌더(일반 파일 버튼 없음) + 안내 "문의는 스크린샷 이미지만 첨부할 수 있어요". 넓은 화면에서 두 버튼과 안내 문구가 겹치지 않음), 하단 `[미리보기]` `[취소]` `[퀘스트 등록하기 · {B} P]`(코인 스프라이트).
우측 aside: 현상금 카드(값 900/28 보라, 슬라이더 0–`maxB` 눈금 = D79(보유 1,000 P 이상이면 0/250/500/750/1,000), 프리셋 50/100/300/500, 에스크로 박스 "등록 즉시 에스크로 선차감 1,500 → 1,200 P", 안내 "모집중 상태에서 삭제하면 현상금이 전액 환불돼요. 채택 이후에는 수정·삭제가 잠겨요."), 작업자 보상 미리보기(기본 100 P · 현상금 B P · 경험치 100 EXP · 완료 승인 시 총 지급 = **두 줄**: "{100+B} P" / "100 EXP · 별점에 따라 50–150", D68), 등록 체크리스트(유형·제목 / 본문 20자 / 현상금 보유 P 이내 / 보안서약서 동의 — 실시간 체크, n/4).
- AC-8.4.1 `[퀘스트 등록하기]` 클릭 → 유효성 통과 시 **보안서약서 모달**(§8.5)이 매번 열린다. 모달 동의 전에는 아무 상태도 바뀌지 않는다.
- AC-8.4.2 동의 후 등록: 요청자 포인트가 정확히 B만큼 감소, 새 퀘스트 `no = max+1`, 상태 `모집중`, **하이퍼 프레임 A**가 1,800ms(±150ms) 표시 후 사라지고 `/quests/board`로 이동, 새 행이 맨 위.
- AC-8.4.3 문의 유형: `quest-attach-input`이 **DOM에 없고**(count 0) `quest-screenshot-input`(`accept="image/*"`)만 있으며, 첨부는 Base64 썸네일. 요청 유형: 두 input이 모두 있고, 일반 파일은 `sharepoint-badge[data-demo=true]`(파일명·크기, 1,024 기준 KB/MB 소수 1자리), 스크린샷은 `image-attachment` 미리보기. **어떤 첨부 요소에도 `href`·URL이 없다**(D70).
- AC-8.4.4 B > `maxB`(D79: `min(1000, floor(points/10)×10)`)면 슬라이더·입력이 `maxB`로 클램프되고 초과 프리셋 비활성.
- AC-8.4.5 타이머 0이면 등록 버튼 비활성 + 사유 툴팁(§6.6).
- AC-8.4.6 에디터에 Tiny Cloud API Key 경고("This domain is not registered…")가 뜨지 않고, 네트워크 요청이 `cdn.tiny.cloud`로 나가지 않는다.
- AC-8.4.7 (D79) lee(300 P)로 `/quests/new`: 슬라이더 `max=300`, 눈금 `quest-bounty-tick[data-value]` 0/80/150/230/300(각 눈금의 가로 위치 = 값/max 비율 ±2px), 프리셋 500 비활성. 0 P 사용자는 슬라이더·프리셋 비활성 + 사유.
- AC-8.4.8 (D69) 요청에서 파일을 고른 직후(600ms 전) 문의로 바꾸면 첨부가 0건이고 이후에도 늦게 나타나지 않는다. 같은 고정 시각에 파일 3개를 연달아 첨부해도 id가 모두 다르다.
- AC-8.4.9 (D70) 파일명 버튼 `demo-attachment-download` 클릭 → `demo-download-toast` "다운로드 중…"이 보였다가 1,400ms 안에 사라진다. URL·팝업·다운로드 이벤트·외부 요청 0, 현재 URL 그대로. 연속 클릭해도 안내는 1개.
- AC-8.4.10 (D68) `quest-reward-preview`에 "400 P"와 "100 EXP"가 서로 다른 줄로 있고 EXP 줄의 `top`이 P 줄보다 크며, "P + " 문자열이 없다.

### 8.5 보안서약서 모달 — `refs/05_security_pledge_modal.png`
md 모달(640px), 헤더 "사내 정보보안 서약서" + shield 아이콘, 조항 박스(제1조 목적 / 제2조 기밀 유지 / 제3조 개인정보), 체크 3개(모두 필수): ① "대외비·기밀문서를 업로드하지 않고 사내 보안 규정을 준수합니다." ② "개인정보·고객정보는 마스킹(비식별) 처리 후 첨부합니다." ③ "결과물의 권리는 회사에 귀속되며 업무 목적 외 사용하지 않습니다." 등록용: 에스크로 요약(현상금 B P 선차감, 보유 a → b). 지원용(variant=apply): 에스크로 요약 대신 **"한 줄 각오" 입력(1–60자)**. 푸터: 서약자 이름·부서·사번·날짜, `[취소]`, `[동의 후 등록]` / `[동의 후 지원]`.
- AC-8.5.1 체크 3개(+지원 시 각오) 전부 충족 전 확인 버튼 비활성.
- AC-8.5.2 모달은 **매번** 미체크 상태로 열린다(동의 기억 금지). 취소/ESC/백드롭 클릭 → 아무 변화 없음.
- AC-8.5.3 포커스 트랩, ESC 닫힘, 열릴 때 첫 체크박스 포커스.

### 8.6 업무 퀘스트 게시판 `/quests/board` — `refs/03_quest_board.png`
헤더(브레드크럼, "업무 퀘스트 게시판", 설명, `[+ 퀘스트 등록하기]`), 필터 행(분류 칩 전체/문의/요청 + 카운트, 상태 칩 D9 + 카운트, 검색창 "제목, 요청자, 부서 검색", 정렬 최신순/보상순/조회순), 테이블 열: No · 분류 배지 · 상태 배지 · 제목(+마감일, 요청 유형 첨부 있으면 "SharePoint 첨부") · 보상("100P + {B}P", 아래 "현상금 에스크로") · 요청자(아바타·이름·부서·티어) · **지원/답변**(요청 = 지원자 수, 문의 = 답변 수, D65) · 조회 · 등록일. 하단 합계 문구 + 페이지네이션(10행/페이지).
- AC-8.6.1 시드 7행이 ref03 순서·값과 같다.
- AC-8.6.2 필터·검색 조합이 URL 쿼리에 반영되고 새로고침 후 유지된다. 카운트 = 현재 다른 필터 적용 후의 개수.
- AC-8.6.3 행 클릭 → 상세 이동 + 조회수 +1(목록 복귀 시 반영).
- AC-8.6.4 `?mine=requested|applied|done`이 현재 페르소나 기준으로 필터한다(SHOULD). `applied`에는 내가 답변한 문의, `done`에는 내 답변이 채택된 문의도 포함.
- AC-8.6.5 (MUST) 참여 시간 만료 시 게시판 동작은 §8.21을 따른다.

### 8.7 퀘스트 상세 `/quests/[no]` — `refs/06_quest_detail_recruiting.png`, `refs/07_quest_detail_inprogress_teams.png`
공통 헤더: 브레드크럼, 분류·상태·마감 배지, 제목, 요청자 스트립(아바타·이름·부서·티어, 등록일, 조회, 지원 n명 — 문의는 "답변 n개"), 보상 배지 "보상 100P + 현상금 BP", 우상단 `[수정]` `[삭제]`(상태별 활성/잠금 + 툴팁), **워크플로 스테퍼 7단계**(모집중 → 지원 → 채택 → 진행중 → 결과물 제출 → 반려·재제출 → 승인·완료, DESIGN §7.12) SHOULD, 본문(표 포함 HTML), 첨부.

아래 표는 **요청**(`type:'request'`)입니다. 문의는 §8.18.

| 상태 / 보는 사람 | 화면 요소 (ref) |
|---|---|
| 모집중 · 요청자 | `[수정]` `[삭제]` 활성(삭제 툴팁 "삭제 시 현상금 BP가 전액 환불돼요"), 결과물 에디터 잠금 패널("결과물 제출 에디터가 잠겨 있어요", "채택 전 잠금" 배지), 진행 규칙 4칸, aside: 보상 카드(100+B P, "에스크로 보관중"), **지원자 리스트**(티어 배지·부서·마을·**별점 평균 + 평가 수**(`applicant-rating-{u}`, D42)·각오·보안서약 동의 시각·`[채택하기]`) — ref06 |
| 모집중 · 타인 | `[지원하기]`(타이머·한도·중복 가드 + 사유), 지원 완료 시 "지원 완료 · 채택 대기" 비활성, 잠금 패널 동일, 지원자 리스트(채택 버튼 없음) |
| 진행중/보완요청 · 요청자 | `[수정]` `[삭제]` 잠금(툴팁 "진행중·완료 상태에서는 수정/삭제할 수 없어요"), 채택된 작업자 스트립 + `[팀즈 대화하기 · 업무 인수인계]`, 제출 결과물 카드(최신 버전, "검수 대기" 배지, 본문·첨부), 작업자 별점(`worker-rating`), 반려 카운터 `반려 n/2`(`reject-count`), reviewPending이면 `[반려 (보완 요청)]`(2/2면 비활성 + D45 툴팁) `[퀘스트 완료 (승인)]`(→ 별점 모달 §8.14) + 안내 "승인 즉시 작업자에게 100 P + 현상금 B P, 별점에 따라 50–150 EXP가 지급돼요", aside: 진행 상태 타임라인 — ref07 |
| 진행중/보완요청 · 작업자 | 같은 스트립(상대 = 요청자) + 팀즈 버튼, 반려 카운터 `반려 n/2`(`reject-count`, D46 — 요청자가 NPC인 q4는 이 화면으로 검증), **결과물 에디터 열림**(success 배지 "결과물 에디터 열림") + 첨부(D22) + `[결과물 제출하기]`(reviewPending=true면 비활성 "검수 대기 중이에요"), 보완요청이면 반려 사유 박스(revise 색) 상단 표시 |
| 진행중/보완요청 · 제3자 | 읽기 전용(제출 이력·제출 횟수·시각 비공개, aside 타임라인도 "진행중인 퀘스트예요"만, D81) |
| 진행중/보완요청 · 운영자 | 읽기 전용, 제출 이력 열람 가능(모니터링 근거), 쓰기·Teams 버튼 없음 |
| 완료 · 누구나 | 상태 배지 완료, 최종 승인 버전, 보상 지급 내역("{작업자} · +{100+B} P · +{RATING_EXP[stars]} EXP · 별 {stars}개", 별은 Lucide `star` 아이콘 + 숫자. 시드: q2 = "+200 P · +125 EXP · 별 4개", q1 = "+300 P · +150 EXP · 별 5개"), 수정/삭제 잠금 |

반려 모달: 사유 textarea(≥5자), `[반려하기]`. 
- AC-8.7.1 채택 전 작업자 에디터는 모든 사용자에게 `data-locked="true"`이며 입력 불가.
- AC-8.7.2 채택은 1명만: 채택 즉시 다른 `[채택하기]` 버튼이 사라지고 상태가 `진행중`, 수정/삭제 잠금.
- AC-8.7.3 반려 → 상태 "진행중 · 보완요청", 작업자 화면에 사유 표시, 재제출 가능, 재제출 후 v2 표시.
- AC-8.7.4 승인 → **별점 모달**(§8.14)에서 별점 선택·확인 → **하이퍼 프레임 B** 1,800ms(±150ms) → 상태 완료, 작업자 +100+B P · +RATING_EXP[별점] EXP(별 3개 = +100), `completedToday +1`, 작업자 별점 평균 갱신.
- AC-8.7.5 일일 한도(D12)와 타이머(§6.6) 가드가 버튼 비활성 + 사유 라벨 + 툴팁으로 표현된다.
- AC-8.7.6 팀즈 버튼은 요청자·작업자에게만, 진행중·보완요청·완료 상태에서만 보인다.
- AC-8.7.7 (D81) `loadScenario('ref07')`에서 park(제3자)으로 `/quests/7`: `submission-v1`·`reject-reason-box`·제출 시각 텍스트가 본문·`quest-timeline`·알림 어디에도 없다. kim·lee·ops에게는 보인다.
- AC-8.7.8 (D82·D86) `ref07`에서 kim, 1920×1080: `approve-btn`·`reject-btn`이 스크롤 없이 뷰포트 안(`expectInViewport`), `quest-original-toggle`은 접힘(`aria-expanded=false`), `quest-timeline` 아래쪽이 Teams 패널 위쪽보다 위에 있다(겹침 없음).
- AC-8.7.9 (D83 검증 위치) ops로 `/village/m1`: `item-teams-btn`·`item-like-m1`·`seller-panel`·`buy-btn`·`buy-guidance`가 모두 없다. ops로 `/quests/7`: `teams-open-btn`·`quest-edit-btn`·`quest-delete-btn`이 없다.

#### 8.7.1 공개 범위 행렬 (D81 — 본문·aside·타임라인·알림·피드·Teams에 모두 적용)
| 정보 | 요청자 | 작업자 | 제3자(플레이어) | 운영자 |
|---|---|---|---|---|
| 원래 요청 본문·첨부 | 보임 | 보임 | 보임 | 보임 |
| 지원자 목록·각오·별점 | 보임 | 보임 | 보임(채택 버튼 없음) | 보임 |
| 제출 결과물 본문·첨부·버전 | 보임 | 보임 | **숨김** | 보임 |
| 반려 사유·`반려 n/2` | 보임 | 보임 | **숨김** | 보임 |
| 진행 타임라인 세부(제출·검수 시각) | 보임 | 보임 | **상태만**("진행중인 퀘스트예요") | 보임 |
| 최종 보상 내역(완료) | 보임 | 보임 | 보임 | 보임 |
| 문의 답변(D65) | 보임 | — | 보임 | 보임 |

#### 8.7.2 상태별 정보 우선순위 (D82 — 위에서 아래 순서)
| 상태 · 보는 사람 | 본문 영역 | aside |
|---|---|---|
| 모집중 · 요청자 | 요청 본문 → 잠금 패널 → 진행 규칙 | 보상 카드 → 지원자 리스트(ref06) |
| 모집중 · 타인 | 요청 본문 → `[지원하기]` → 잠금 패널 | 보상 카드 → 지원자 리스트 |
| 진행중/보완요청 · 요청자 | 작업자 스트립 → **검수 바**(반려·승인) → 최신 제출 결과물 → 원래 요청(`quest-original-toggle`, 접힘) | 진행 타임라인(`quest-timeline`) → 보상 요약 |
| 진행중/보완요청 · 작업자 | 반려 사유 박스(보완요청) → 결과물 에디터·제출 → 원래 요청(접힘) | 진행 타임라인 → 보상 요약 |
| 완료 | 보상 지급 내역 → 최종 승인 버전 → 원래 요청(접힘) | 타임라인(완료) |

#### 8.7.3 보조 행동 권한 (D83 — 숨김 = 권한 없음, 비활성 = 조건 미충족 + 사유)
| 행동 | 요청자/판매자 | 작업자/구매자 | 제3자 플레이어 | 운영자 |
|---|---|---|---|---|
| 퀘스트 수정·삭제 | 모집중(문의는 답변 0개)만 활성, 그 외 비활성+사유 | 숨김 | 숨김 | 숨김 |
| 퀘스트 Teams | 진행중·보완요청·완료 | 진행중·보완요청·완료 | 숨김 | 숨김 |
| 물품 좋아요 | 활성 | 활성 | 활성 | 숨김 |
| 물품 Teams(`item-teams-btn`) | 숨김(판매자) | 활성 | 활성 | 숨김 |
| 물품 수정·삭제 | 판매자만(수령 대기·거래완료는 비활성+사유) | 숨김 | 숨김 | 숨김 |
| 물품 상태 변경(예약자 지정·최종 구매자 지정/재지정·해제) | 판매자만(**거래완료만** 비활성+사유, 수령 대기 중에도 활성 — §7.2) | 숨김 | 숨김 | 숨김 |
| 첨부 파일명(다운로드 안내 D70) | 활성 | 활성 | 열람 가능한 첨부만 | 활성 |
| 캐릭터 꾸미기·티어 안내 | 본인만 | 본인만 | 본인만 | 꾸미기 숨김, 티어 안내만 |

### 8.8 하이퍼 프레임 오버레이 — `refs/08_hyperframe_complete.png`, `motion/officequest_intro.html`
`<HyperFrame variant="post|clear">`, React Portal, `position:fixed; inset:0; z-index:9999`, 백드롭 D4, 포인터 차단, **1,800ms 후 자동 닫힘**(fade-out 1,500–1,800ms), 닫힌 후 언마운트. 타임라인은 DESIGN §9.4 A/B 표를 따른다.
- **A (등록)**: 게시판 + 캐릭터(현재 페르소나 티어) + 양피지 스크롤 투척·핀 고정 + 빛 폭발 + 별/코인 파티클 + "QUEST POSTED!" + "퀘스트가 게시판에 등록되었습니다 · 현상금 B P 에스크로 보관".
- **B (완료)**: 슬라임 보스 + HP 바 + 작업자 캐릭터 대시 + 보라 검기 아크 + "CRITICAL!" → "-9,999" + 파편 + 코인·젬 분수 + 보상 카드 3장(`+100 P 기본 보상`, `+B P 현상금`, `+{RATING_EXP[s]} EXP 경험치` + 그 아래 별 s개(Lucide `star`, `hyperframe-stars[data-stars=s]`)) + 레벨이 올랐으면 "LEVEL UP!" + "{작업자} · {티어} Lv.a → Lv.b"(아니면 "QUEST CLEAR!") + 하단 "퀘스트 완료 승인 · 보상이 {작업자}에게 즉시 지급되었습니다 · 1.8초 후 자동 닫힘".
- 파티클: 단일 캔버스, 상한 120개, 시드 고정 난수(mulberry32), 정수 픽셀 스냅. reduced-motion: 정적 결과 카드(같은 1,800ms 유지 — D28).
- AC-8.8.1 열림부터 닫힘까지 1,650–1,950ms(테스트 허용 오차). 측정은 `performance.now()` 기반(D38): 앱의 `__OQ_TEST__.hyperframes[].openedAt/closedAt` 차이 **그리고** 테스트(Node) 쪽 visible→hidden 경과 ≤ 2,400ms. `data-testid="hyperframe"`, `data-variant`.
- AC-8.8.2 동시에 두 개가 열리지 않는다(큐잉). 오버레이 중 키보드 포커스는 오버레이에 갇히고 ESC로 닫히지 않는다(시연 임팩트 보장).
- AC-8.8.3 (SHOULD) 프레임 드랍 없음: 오버레이 1.8초 동안 rAF 콜백 수 ≥ 80(`__OQ_TEST__.hyperframes[].frames`)을 Audit에 기록. 게이트·DoD 대상 아님.

### 8.9 효성마을 목록 `/village` — `refs/09_village_market_dark.png`
좌측 사이드바(효성마을 타이틀 + "사내 포인트 중고거래 마켓", `[+ 중고물품 글 등록]`, "사업장별 마을": **전체 마을 모아보기(기본)** + 6개 마을 각 카운트, 하단 "내 거래 현황" 박스: 판매중 n · 예약중 n · 거래완료 n / **수령 대기 n건**(내가 최종 구매자로 지정된 물품) · 보유 n P — 클릭 시 거래 내역 드로어, 역분개 행은 "되돌림" 배지). 본문: 헤더 "포인트로 사고, **나누고, 순환하고.**", 검색 "물품명, 마을, 판매자 검색", 정렬(최신순/인기순/낮은 가격순), 분류 칩(전체 + 5종 + 카운트), 토글 칩 `거래가능만`, `무료나눔`. 4열 카드 그리드(DESIGN §7.11: 썸네일 픽셀 아이콘, 마을 배지, 상태 배지, 사진 수 "1/3", 분류·판매 방식, 제목, 가격 또는 무료나눔, Lucide `heart` 좋아요 수(토글), Lucide `eye` 조회수, 판매자·부서 — **구매 CTA·"구매 요청" 문구 없음**, D63). D73: 제목·검색·필터는 고정, 카드 그리드만 `market-scroll` 영역에서 스크롤.
- AC-8.9.1 시드 8개가 ref09 순서·값으로 보인다. 6개 마을 각 탭이 해당 마을만 보여주고 카운트가 맞다(마포 2, 회현 1, 반포 1, 수서 1, 창원 1, 울산 2).
- AC-8.9.2 좋아요 클릭 → 페르소나별 토글, 카운트 ±1, 팝 애니메이션. 다른 탭에도 실시간 반영.
- AC-8.9.3 타이머 00:00:00에서도 목록·등록·거래(지정·수령 확인)·좋아요가 모두 동작한다.
- AC-8.9.4 (D73) `loadScenario('manyItems')`(물품 40개)에서 1440×720·1920×1080·390×844 각각: `market-scroll` 안에서 휠·PageDown으로 카드가 이동하고 `window.scrollY === 0`, GNB·마을 사이드바(390은 상단 마을 메뉴)·제목·필터의 `top`이 스크롤 전후 같다. `/village/m1`·`/village/new`는 일반 문서 스크롤.
- AC-8.9.5 (D63) 목록 카드 안에 `buy-btn`이 없고 "구매 요청" 텍스트가 페이지 어디에도 없다.

### 8.10 물품 등록·수정 `/village/new`, `/village/[id]/edit`
필드: 마을 셀렉트(6), 분류(5), 거래 방식 세그먼트(포인트 판매 + 가격 입력 / 무료 나눔 0 P), 제목, 리치 에디터(§8.4와 같은 컴포넌트), **사진 다중 등록**: 프리셋 8종 원클릭 추가(모니터·머그·도서·게임패드·키보드·조끼·티켓·의자 픽셀 스프라이트를 `toDataURL`로 생성, 외부 이미지 없음) + 로컬 이미지 업로드 Base64 미리보기(≤2MB, ≤5장, 썸네일 삭제 버튼). `[등록하기]` → 상세로 이동. 보안서약서는 요구하지 않음.
- AC-8.10.1 등록한 물품이 전체/해당 마을 탭 맨 앞에 나타난다(최신순).
- AC-8.10.2 무료 나눔 선택 시 가격 입력 비활성·0 고정, 카드에 "무료나눔"(success 색).

### 8.11 물품 상세 `/village/[id]` — `refs/10_village_detail_orgchart.png`(배경 화면)
좌: 대형 썸네일(마을 배지) + 사진 썸네일 스트립. 우: 브레드크럼(효성마을 › 마을 › 분류), 상태 배지, 제목, 가격(900/40), 좋아요(Lucide `heart`)·조회(Lucide `eye`)·등록 시각, 판매자 카드(아바타·티어·부서·마을), 본문, CTA(§7.3: 최종 구매자만 `buy-btn`, 그 외 `buy-guidance`), `[판매자와 팀즈 대화하기]`(판매자 외 플레이어), 판매자 패널(판매자만, `seller-trade-status`), 거래완료 시 **정산 패널**(구매자·판매자 카드, 증감 −/+ 표시, 원장 행 "거래완료 · 품목 · 금액 · 양측 거래 내역 기록"; 코인 이동 애니메이션 SHOULD). 수령 확인 성공 직후 `trade-complete-panel`("거래 완료! {물품} · −{X} P", 1,800ms 표시 후 사라짐), 되돌리기 직후 `reward-panel[data-kind=undo]`("거래를 되돌렸어요 · +{X} P 환불").
- AC-8.11.1 (D63) lee가 m4에서 `seller-status-menu` → `open-orgchart-btn` → `org-final-kim` → `org-apply` → m4 `예약중`, `seller-trade-status` "수령 대기 · 김효성 대리…", **lee·kim 포인트 변화 없음, Tx 0건**. kim 화면 m4에 `buy-btn[data-state=buy]` "샀어요 · 물품 수령 확인" → 클릭 → 거래완료, kim −1,200, lee +1,200, 양측 Tx 각 1건, `trade-complete-panel`.
- AC-8.11.2 포인트 부족 최종 구매자의 `[샀어요]` → 경고 모달(정확한 문구), 상태·포인트 변화 없음(D80: 실패 시 DB 불변).
- AC-8.11.3 예약자 지정(`org-reserve-{u}`) → `예약중`; 예약자에게는 `buy-guidance[data-state=reserved-me]`, 다른 플레이어에게는 `buy-guidance[data-state=locked-reserved]` 정확한 문구. 예약만으로는 아무도 `buy-btn`을 보지 못한다.
- AC-8.11.4 (D64) 수령 확인 직후 같은 버튼(`received`) 클릭 → `예약중 · 수령 대기`로 복귀, 양측 잔액 원상 복구, 원거래 2건 `reversedAt` + 역분개 Tx 2건(드로어 "되돌림" 배지). 빠르게 두 번 클릭해도 환불은 1회. (D89) 판매자가 그 포인트를 써서 잔액 < 가격이면 버튼은 **활성 그대로**, 클릭 → info 토스트 `UNDO_UNAVAILABLE_NOTICE`, 상태·잔액·Tx 불변, 화면 어디에도 판매자 잔액·"정산 포인트" 문구 없음. 구매 제한 중에도 되돌리기 가능.
- AC-8.11.5 무료나눔 거래완료 시 양측 Tx에 `0 P` 기록(페르소나가 만든 무료 물품으로 검증: kim이 무료 물품 등록 → lee를 최종 구매자로 지정 → lee `buy-btn[data-state=free]`).
- AC-8.11.6 상세 진입마다 조회수 +1.
- AC-8.11.7 (D90) NPC 판매 물품(m5 등, 예약중 m2·m3 포함)에는 어떤 페르소나에게도 `buy-btn`이 없고 `buy-guidance[data-state=npc]`(`MARKET_NPC_GUIDANCE`)가 보인다(D16). kim으로 m3(han 판매, kim 예약)에서도 `reserved-me`가 아니라 `npc`.

### 8.12 가상 Teams 채팅 `VirtualTeamsChat` — `refs/07_quest_detail_inprogress_teams.png` 우하단
우하단 플로팅 420×560, z 800, DESIGN §7.9. 헤더 `#464775`(Teams 타일 "T", 상대 아바타 + 초록 온라인 점, 이름, "부서 · 마을 · 대화 가능", 맥락 배지 "업무 인수인계"/"중고거래", 최소화·닫기). 첫 메시지 = 시스템 pill(예: "업무 인수인계 · 3분기 원가 분석 엑셀 매크로 요청"). 입력바(Enter 전송, 빈 문자열 전송 불가).
- **자동 응답**: 전송 직후 "{상대 이름}님이 입력 중입니다..." 인디케이터(점 3개) **1,200ms** → 맥락별 한국어 답장 1개. 키워드 규칙(첫 일치, 없으면 기본 문구를 대화 내 순번으로 순환):

| 맥락 | 키워드(정규식) | 답장 |
|---|---|---|
| handover | `파일\|자료\|링크\|첨부` | "자료는 퀘스트 첨부로 올려두었어요. 안 보이면 바로 말씀 주세요." (첨부 URL 없음 D70) |
| handover | `마감\|언제\|일정\|시간` | "마감 전까지 v1 먼저 드리고, 피드백 반영해서 마무리할게요." |
| handover | `수정\|반려\|보완\|피드백` | "확인했습니다! 말씀하신 부분 보완해서 다시 제출할게요." |
| handover | (기본) | "네, 확인했습니다. 진행 상황 바로 공유드릴게요." / "인수인계 감사합니다. 궁금한 점 생기면 여쭤볼게요." |
| market | `네고\|깎\|할인\|에누리` | "조금은 가능해요! {가격−10%(10단위 내림)} P 어떠세요?" (무료나눔이면 `MARKET_FREE_REPLY`, D90) · **NPC 판매자면 `MARKET_NPC_NOTICE`** |
| market | `어디\|장소\|직거래\|로비\|만나` | "{판매자 사업장} 1층 로비에서 점심시간 12:30 어떠세요?" · NPC 판매자면 `MARKET_NPC_NOTICE` |
| market | `언제\|시간\|오늘\|내일` | "오늘 퇴근 전이나 내일 점심 모두 괜찮아요." · NPC 판매자면 `MARKET_NPC_NOTICE` |
| market | (기본) | "관심 가져주셔서 감사해요! 상태 아주 좋아요." / `MARKET_BUYER_GUIDANCE`(D77) · **NPC 판매자면 두 번째 = `MARKET_NPC_NOTICE`**(D90) |

- AC-8.12.1 전송 → 인디케이터 표시 → 1,200ms(±200ms, `performance.now()` 기준 D38) 후 인디케이터 사라지고 답장 **정확히 1개** 도착(StrictMode에서도 — `pendingReplyFor` 가드).
- AC-8.12.2 대화는 스레드 키별로 DB에 저장되어 다시 열면 유지된다.
- AC-8.12.3 (D77) market 스레드에서 키워드 없는 메시지 2개 → 두 번째 답장 = `MARKET_BUYER_GUIDANCE`. 답장 표 어디에도 "승인할게요"·"구매 요청"이 없다(단위 테스트). (D90) NPC 판매자 스레드(m5 choi)의 모든 답장과 나눔 답장에 "등록해 드릴게요"·"그냥 가져가"가 없고, NPC 스레드 두 번째 기본 답장 = `MARKET_NPC_NOTICE`(단위 테스트).

### 8.13 그룹웨어 조직도 모달 `OrgChartModal` — `refs/10_village_detail_orgchart.png`
lg 모달. 헤더 "그룹웨어 조직도" + "예약자 / 최종 구매자 지정 · {물품명} · {가격} P". 좌측 사업장 트리(마포 본사·회현·반포·수서·창원공장·울산공장 + 표시 인원, 펼침/접힘, 부서 노드). 우측: 검색(이름·사번·부서 실시간 부분일치, 대소문자 무시), 직원 행(아바타, 이름, 티어 배지, 사번·사업장·부서, `[예약자 지정]` `[최종 구매자 지정]`; 판매자 본인·운영자 제외; **보유 P 표시·구매 가능 필터·포인트 부족 비활성 없음**(D67), 비활성은 구매 제한 직원뿐), 선택 행 강조("예약자 지정됨" / "최종 구매자 지정됨"). 두 버튼은 호버음 대상(D71). ※ ref10의 "관심 표시 · 팀즈 문의 직원" 필터 칩과 "…직원 6명" 안내 문구는 **MAY(미구현 허용)**이며 Visual QA 대상이 아님. 하단 안내 바(예약자: "{이름}을(를) 예약자로 지정 → 상태가 예약중으로 바뀌어요. 다른 직원은 구매할 수 없어요." / 최종 구매자: "{이름}을(를) 최종 구매자로 지정 → {이름}님이 물품을 받은 뒤 [샀어요]를 누르면 거래가 완료돼요. 지금은 포인트가 이동하지 않아요.", D77) + `[취소]` `[적용하기]`.
- AC-8.13.1 검색어 "HS2203" → 강창원 1명만 표시. "생산기술" → 이퀘스트·한울산.
- AC-8.13.2 선택만으로는 상태가 바뀌지 않고 `[적용하기]` 시 커밋.
- AC-8.13.3 (D67) 직원 행에 포인트 숫자(`/\d[\d,]* P/`)가 없고 `org-filter-affordable`이 없다. 잔액이 가격보다 적은 lee·oh의 `org-reserve-*`·`org-final-*`도 활성이다(kim m1 500 P 기준).

### 8.14 별점 모달 `RatingModal` (ref 없음 — DESIGN §7 모달, D53)
sm–md 모달. 헤더 "결과물 품질 평가" + 작업자 아바타·이름·현재 별점 평균. 별 5개 버튼(Lucide `star`, 44px 터치 영역, `role="radiogroup"`, 각 `role="radio"` `aria-checked`, ←/→ 키로 이동), 선택 전 안내 "별점을 선택해 주세요", 선택 후 미리보기 = 두 줄 `+{100+B} P` / `+{RATING_EXP[s]} EXP`(`rating-exp-preview`, D68)와 매핑 표("별 1개 50 · 별 2개 75 · 별 3개 100 · 별 4개 125 · 별 5개 150 EXP", 각 항목 앞 Lucide `star` 아이콘 가능). 푸터 `[취소]` `[별점 주고 승인]`(`rating-confirm`, 선택 전 비활성 + 사유 "별점을 선택해야 승인할 수 있어요").
- 문의 답변 채택(D65)에도 같은 모달을 `data-variant="accept"`로 씀: 헤더 "답변 품질 평가", 확인 버튼 `[별점 주고 채택]`(`rating-confirm`).
- AC-8.14.1 승인 버튼 클릭 시 모달이 열리고 별점 선택 전에는 확인 버튼이 비활성이다. 취소/ESC → 상태·포인트·EXP 변화 없음.
- AC-8.14.2 각 별점 s에 대해 작업자 EXP 증가 = RATING_EXP[s](단위 테스트 5건), 포인트 증가 = 100 + B(별점 무관).
- AC-8.14.3 별 5개 승인(E2E, `ref07`): lee 650 → **800 EXP(Lv.9)**, 300 → **700 P**, 하이퍼 프레임 B 보상 카드 "+150 EXP"·`data-stars=5`, "LEVEL UP!" "실버 Lv.7 → Lv.9", lee 별점 4.1·8건 → **4.2 · 평가 9건**.
- AC-8.14.4 지원자 행·작업자 스트립·대시보드에 D41 형식의 별점 평균이 보인다(시드: lee "4.1 · 평가 8건", jung "4.5 · 평가 31건", oh "4.0 · 평가 1건").

### 8.15 반려 한도 UI (D45, D46)
- AC-8.15.1 반려할 때마다 `reject-count`가 `반려 1/2` → `반려 2/2`로 바뀐다(시드 q4 = `반려 1/2`).
- AC-8.15.2 두 번째 반려 모달에 "이번이 마지막 반려예요" 경고가 보인다.
- AC-8.15.3 `rejectCount = 2`이고 검수 대기면 `reject-btn` 비활성 + 툴팁 "반려는 퀘스트당 최대 2회예요 · 별점과 함께 승인해 주세요(별 1개도 가능)", `approve-btn`은 활성. 별 1개 승인 시 작업자 +50 EXP, 포인트는 별점 무관 +100+B(`rejectLimit` 시나리오: lee EXP 650 → 700 Lv.8, **300 → 700 P**, 별점 (33+1)/9 = 3.78 → **3.8 · 평가 9건**).

### 8.16 운영자 콘솔 `/admin` (ref 없음 — DESIGN 컴포넌트, Visual QA 제외, D48·D53)
좌측 사이드바(264px, "운영자 콘솔": `의심 활동 n` · `제재 현황 n(활성)` · `감사 로그 n`), 본문 헤더 "운영 모니터링" + 요약 칩(**열린 플래그 n · 열린 high n · 활성 제재 n**, D85). 의심 활동 표의 조치 열은 우측 sticky(1440×900에서 가로 스크롤 없이 보임, D86). 탭 3개(`admin-tab-{flags|restrictions|log}`, URL `?tab=` 유지):
- **의심 활동**: 표(심각도 배지 · 규칙명 · 대상 직원(아바타·이름·부서) · 근거 요약(첫 근거 + "외 n건") · 최근 발생 · 상태 배지(열림/조치됨/무혐의, 재발이면 "새 근거 n건" 배지) · 보조 규칙 배지(`alsoMatched`, 예: "반복 완료") · 조치(열린 행만)). 행 펼침 → 근거 목록(`flag-evidence-{id}`, evidence 전부). 행 버튼 `[제재하기]`(제재 모달, 대상 = 플래그의 subjects 중 선택, 기본 첫 번째) · `[무혐의 처리]`(사유 5–100자 모달). 규칙명: R1 "동일 요청자→작업자 반복 완료", R2 "상호 승인", R3 "특정 쌍 만점 독점", R4 "고액 현상금 초고속 승인", R5 "동일 상대 반복 거래".
- **제재 현황**: `[직원 제재]`(`restrict-new-btn`, 플래그 없이 제재) + 표(직원 · 종류 배지 · 사유 · 시작 · 종료(무기한) · 상태(활성/만료/해제, D54) · `[해제]`(활성만, 사유 5–100자)). 행은 `restriction-row-{id}`(+`data-status`, `data-kind`, `data-user`). 시드 신선도 경고 `admin-stale-seed`(D61)는 본문 헤더 아래.
- **감사 로그**: 최신순 표(시각 · 운영자 · 행동(제재/해제/무혐의) · 대상 · 요약). 읽기 전용, 삭제·수정 UI 없음.
- **제재 모달**(`restrict-modal`, DESIGN §7 모달): 대상 직원 셀렉트(운영자 제외 전 직원), 종류 체크 2개(최소 1개, 이미 활성인 종류는 비활성 + D55 사유), 기간 세그먼트 1일·3일·7일·무기한(기본 3일), 사유 textarea(5–100자), 확인 `[제재 적용]`(조건 미충족 시 비활성 + 사유).
- AC-8.16.1 운영자가 아니면 `nav-admin`이 없고 `/admin`은 `admin-forbidden`만 보인다. 운영자는 `/` 접근 시 `/admin`으로 이동한다.
- AC-8.16.2 시드에서 의심 활동 표에 **정확히 4행**(§9.7 id·순서), high 2건이 위에 있고, 각 행 근거가 1건 이상이며, `pair_5star__choi__kang` 행에 보조 배지 "반복 완료"가 있다.
- AC-8.16.3 제재 적용 → 제재 현황에 활성 행, 감사 로그에 `restrict` 행, 플래그에서 시작했으면 그 플래그 상태 "조치됨".
- AC-8.16.4 해제 → 상태 "해제", 감사 로그 `lift` 행, 대상 사용자의 버튼이 즉시 다시 활성(다른 탭 포함).
- AC-8.16.5 무혐의 처리 → 상태 "무혐의", 감사 로그 `dismiss_flag` 행.
- AC-8.16.6 기간이 지나면(clock) 제재가 자동으로 "만료"가 되고 효과가 사라진다(단위 테스트). 열어 둔 화면도 새로고침 없이 1초 안에 갱신된다(E2E, `useNow`).
- AC-8.16.7 해제된 제재 재해제·처리된 플래그 재처리 → `INVALID_STATE`, 로그 추가 없음. 일부 종류가 활성인 2종 제재 → 나머지 종류만 생성. 무혐의 후 새 근거 → 다시 "열림" + "새 근거 n건"(단위 테스트).
- AC-8.16.8 (D85) 시드 요약 칩 `admin-flag-count`=4 · `admin-open-high-count`=2 · `admin-active-restriction-count`=0. `fast_high_bounty__A-107` 무혐의 직후 3 · 1 · 0, kang 제재 직후 활성 제재 1.
- AC-8.16.9 (D86) 1440×900에서 첫 행의 `flag-restrict-btn-*`·`flag-dismiss-btn-*`가 스크롤 없이 뷰포트 안에 있고 다른 요소에 가리지 않는다.

### 8.17 제재받은 사용자 화면 (D51, ref 없음)
- AC-8.17.1 `quest_post` 제재 중: `restriction-banner` 표시, `quest-submit`·`board-new-btn` 비활성 + §6.10 사유 툴팁(`disabled-reason`). 지원·제출은 가능.
- AC-8.17.2 `purchase` 제재 중: **최종 구매자로 이미 지정된 물품**(`loadScenario('finalBuyer')` = m4 최종 구매자 kim)에서 `buy-btn[data-state=restricted]` 비활성 + 사유, 조직도에서 그 직원의 두 버튼 비활성("구매 제한 중인 직원이에요"). 좋아요·Teams·수령 되돌리기는 가능.


### 8.18 문의 답변 · 채택 `/quests/[no]` (문의 유형, D65·D66, ref 없음 — ref06 레이아웃 재사용)
본문: 공통 헤더(상태 칩 "답변 접수 중" / (D91) 마감 후 "답변 마감 · 채택 대기" + 요청자에게 `inquiry-due-banner` / 완료 "답변 채택 완료") → 문의 본문·스크린샷 → **답변 목록** `answer-list`(작성순, 행 `answer-row-{answerId}`: 아바타·이름·부서·티어·작성 시각·본문·스크린샷 썸네일, 채택된 행에 `accepted-answer-badge` "채택된 답변") → 답변 작성 카드(요청자 외 플레이어, `recruiting`일 때만): 개인정보 마스킹 안내 상시 표시, `answer-editor`(RichEditor D88), `answer-screenshot-input`(스크린샷만, D69), `[답변 등록]` `answer-submit`(본문 텍스트 10자 미만이면 비활성 + 사유). 요청자에게는 각 답변 행에 `[채택하기]` `accept-answer-btn-{answerId}` → 별점 모달(`data-variant=accept`, §8.14) → 채택.
우측 aside: 보상 카드("채택 시 {100+B} P" / "{RATING_EXP[3]} EXP · 별점에 따라 50–150", D68) → 진행 단계 카드(① 답변 작성 ② 요청자가 1개 채택 ③ 보상 지급 — 지원·검수 단계 없음).
- AC-8.18.1 lee로 q6(문의, 요청자 lee): `quest-apply-btn`·`pledge-modal[data-variant=apply]`이 없고, 시드 답변 1개(kang)가 보이며 `accept-answer-btn-*`가 있다. kim으로 q6: `answer-editor`·`answer-submit`이 있고 `accept-answer-btn-*`는 없다.
- AC-8.18.2 kim이 답변 등록 → `answer-list` 맨 아래 새 행, 요청자 lee에게 `answer_posted` 알림, 게시판 "지원/답변" 열 +1. 서약 모달이 열리지 않는다.
- AC-8.18.3 lee가 kim 답변 채택(별 5개) → 상태 완료, kim +150 P(100+50) · +150 EXP, `accepted-answer-badge`가 kim 행에, kim 일일 `complete` 달성, 하이퍼 프레임 B. 에스크로 50 해제.
- AC-8.18.4 답변이 1개 이상인 문의의 `quest-edit-btn`·`quest-delete-btn`은 비활성 + 사유 "답변이 달린 문의는 수정·삭제할 수 없어요". 리듀서도 `INVALID_STATE`(단위 테스트).
- AC-8.18.5 (D66) 답변자의 `completedToday = 2`이면 그 행의 `accept-answer-btn-*` 비활성 + 사유, 답변 작성은 계속 가능(단위 + E2E).
- AC-8.18.6 문의에 `quest/apply`·`adopt`·`submit`·`reject`·`approve` dispatch → `INVALID_STATE`(단위 테스트).
- AC-8.18.7 (D91) 시계를 q6 `dueAt`(10-22 18:00) + 1ms로 옮기면 kim의 `quest/answer` → `INVALID_STATE`·DB 불변, 요청자 lee의 `quest/acceptAnswer`(kang 답변, 별 4개)는 성공해 kang +150 P·에스크로 50 해제, `quest/delete` → `INVALID_STATE`(답변 1개). 답변 0개 문의(q3)는 마감 뒤에도 요청자 삭제 → 환불 150(단위 테스트).

### 8.19 캐릭터 꾸미기 · 티어 안내 (D75·D76, ref 없음 — DESIGN §7.16)
- **티어 안내 모달** `tier-guide-modal`: 대시보드 `char-info-btn`(Lucide `info`)으로 열림. 6행(티어 이름·레벨 범위·의상 미리보기 = 24 PNG), 성별 탭 `tier-guide-gender-male` / `tier-guide-gender-female`(미리보기만 바꾸고 저장하지 않음). 현재 티어 행 강조.
- **꾸미기 모달** `char-studio-modal`: `char-studio-btn` 또는 히어로 캐릭터 클릭으로 열림. 왼쪽 큰 미리보기(`pixel-sprite`, 저장 전 즉시 반영), 오른쪽 선택: 성별 `char-gender-{male|female}`, 헤어 `char-hair-{classic|wave}`, 의상 `char-outfit-{auto|bronze|silver|gold|platinum|diamond|master}`(잠긴 의상 `data-locked="true"` + Lucide `lock` + "Lv.{n} 해금", 미리보기는 가능), `[저장]` `char-studio-save`(잠긴 의상 선택 중이면 비활성 + 사유) · `[취소]` `char-studio-cancel`(원래 외형 복귀).
- AC-8.19.1 kim(Lv.12 골드): `char-outfit-platinum`·`diamond`·`master`는 `data-locked=true`, `bronze`·`silver`·`gold`·`auto`는 false. 여성·웨이브·실버 저장 → 대시보드 `pixel-sprite[data-gender=female][data-hair=wave][data-outfit=silver]`, `data-tier=gold` 그대로, 포인트·EXP 변화 없음, 새로고침·다른 탭 유지.
- AC-8.19.2 미리보기 중 `char-studio-cancel` → 외형 변화 없음(DB 불변).
- AC-8.19.3 잠긴 의상으로 `character/equip` dispatch → `VALIDATION`(단위). 시즌 초기화로 레벨이 내려가면 표시 의상이 현재 티어로 폴백하고 선택값은 보존(단위).
- AC-8.19.4 24개 PNG가 모두 24×24, 알파 0/255이고(단위 `character-assets`), 파일이 없으면 코드 행렬로 그리며 콘솔 오류가 없다(Harness B26).

### 8.20 피드백 이벤트 표 (D71 — 성공 dispatch 직후에만)
| 이벤트(성공한 액션) | 효과음 키 | 시각 피드백 |
|---|---|---|
| `daily/claim` | `coin` | `reward-panel[data-kind=daily]` "일일 보상 획득! +{P} P · +{EXP} EXP" |
| `quest/create` · `quest/apply` · `quest/answer` | `quest` | 하이퍼 프레임 A(등록) / 토스트 |
| `quest/approve` · `quest/acceptAnswer` | `success` | 하이퍼 프레임 B |
| `item/confirmReceipt` | `trade` | `trade-complete-panel`, 코인 이동 SHOULD |
| `item/undoReceipt` | `undo` | `reward-panel[data-kind=undo]` |
| `quest/reject` · 경고 모달 열림(포인트 부족) | `warning` | 모달·토스트(danger) |
| Teams 메시지 전송·자동 답장 수신 | `message` | 말풍선 |
| `item/like`(켜질 때만) | `like` | 하트 채움 |
| 활성 버튼 마우스 호버(대상 목록 Harness §1.6) | `hover` | — |
- 효과음 키는 `src/lib/audio.ts`의 Web Audio 합성 레시피. 실패한 액션·비활성 버튼·새로고침·`BroadcastChannel` 수신으로는 아무 소리도 내지 않는다.
- 테스트: `window.__OQ_TEST__.sounds`(NODE_ENV≠production에서만 존재, 재생 요청된 키 배열)와 `__OQ_TEST__.audioSupported`. 실제 소리는 검증하지 않는다.
- AC-8.20.1 실패한 `[샀어요]`(포인트 부족)는 `warning`만 1회, `trade`는 0회. 일일 보상 수령 후 새로고침 → 추가 재생 0.
- AC-8.20.2 음소거 중 모든 이벤트 → `sounds` 길이 0. 호버음은 `pointerType=mouse`에서만, 120ms 안의 연속 호버는 1회.

### 8.21 참여 시간 만료 후 접근 (D74, 타이머 00:00:00)
| 화면 / 행동 | 관계 있음(요청자·지원자·작업자·답변자) | 관계 없음 | 운영자 |
|---|---|---|---|
| 사이드바 `side-quest-board` · GNB `nav-quests` | `side-quest-board`는 `aria-disabled=true` 모양(잠금 아이콘), 클릭·Enter 시 이동 없이 `quest-time-notice` 토스트(info). `nav-quests`는 `/quests/daily`로 이동(내 퀘스트 메뉴 접근 유지) | 같음 | 평소대로 |
| `/quests/board` 전체 목록(직접 URL) | 본인 관련 행만 + `quest-time-notice` | 행 0개 + `quest-time-notice` | 전체 |
| `/quests/board?mine=…` | 관계로 다시 거른 결과 | 0행 | 전체 |
| `/quests/[no]` 상세 | 열람(쓰기 가드는 §6.6) | `quest-time-notice`만, `quest/view` 미실행 | 열람 |
| 본인 퀘스트의 채택·반려·승인·답변 채택 | 가능 | — | — |
| 지원·제출·등록·답변 등록 | 비활성 + 사유(§6.6) | 비활성 | — |
| 효성마을 · 대시보드 · 일일 퀘스트 | 가능 | 가능 | — |
- `quest-time-notice` 문구 = `QUEST_TIME_NOTICE`("오늘 참여 가능한 시간이 모두 지났어요") + 보조 문구 "내가 참여한 퀘스트만 볼 수 있어요".
- AC-8.21.1 kim, 타이머 0(`loadScenario('timerExpired')`): 게시판에 kim 관련 행(q7·q2)만, 비관련 q5 상세 → 안내만, q5 조회수 불변. 리셋 → 1초 안에 전체 목록 복귀.
- AC-8.21.2 `?mine=applied`를 붙여도 비관련 행이 나오지 않는다.
- AC-8.21.3 타이머 0에서 `side-quest-board[aria-disabled=true]` 클릭 → URL 불변 + 안내 표시, `nav-quests` → `/quests/daily`. 게시판에 머물던 중 만료되면 1초 틱 안에 목록이 관계 행으로 줄어든다.

---

## 9. 시드 데이터 (단일 출처: `src/lib/db/seed.ts`, 첫 실행·스키마 불일치·`[데이터 초기화]` 시 적재)

### 9.1 업무 퀘스트 7건 (모집중 3 · 진행중 1 · 보완요청 1 · 완료 2)
| no | 유형 | 상태 | 제목 | 요청자 | 현상금 | 업무 분야 | 마감 | 등록 | 조회 | 첨부 | 지원자(각오) | 작업자 / 제출 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 요청 | 모집중 | 3분기 원가 분석 엑셀 매크로 요청 | kim | 300 | 재무·엑셀 자동화 | 2026-10-23 18:00 | 10-21 09:12 | 128 | SP `Q3_원가분석_원본.xlsx` 1.8 MB | lee "오늘 6시 전까지 끝내겠습니다!" · jung "매크로 엑셀 자신 있어요. VBA 경력 5년입니다." · oh "배우면서 꼼꼼히 해보겠습니다." | — |
| 6 | 문의 | 모집중 | 법인카드 해외결제 증빙 기준 문의 | lee | 50 | 재무·엑셀 자동화 | 10-22 18:00 | 10-21 08:40 | 57 | — | kang "규정 문서 위치랑 예시 바로 드릴게요." | — |
| 5 | 요청 | 진행중 | 신입사원 온보딩 교육 PPT 디자인 | jung | 500 | 문서·PPT 디자인 | 10-27 18:00 | 10-20 14:20 | 211 | SP `온보딩_교육자료_초안.pptx` 4.2 MB | park(채택) · choi · kang · oh | park / 제출 없음 (park 2/2 → 한도 시연) |
| 4 | 요청 | 보완요청 | 울산공장 설비 점검표 양식 자동화 | han | 400 | 생산·품질 | 10-24 18:00 | 10-19 10:05 | 143 | SP `설비점검표_양식.xlsx` 0.9 MB | lee(채택) · kang | lee / v1 반려 "점검 항목 12번이 누락됐어요. 체크박스 서식도 맞춰 주세요." |
| 3 | 문의 | 모집중 | Power BI 대시보드 공유 권한 설정 문의 | kang | 150 | 데이터·BI | 10-26 18:00 | 10-19 16:40 | 34 | — | (없음) | — |
| 2 | 문의 | 완료 | SAP 전표 역분개 오류 해결 방법 문의 | oh | 100 | 재무·엑셀 자동화 | 10-17 | 10-17 09:30 | 96 | — | kim(채택) · lee | kim 답변 채택 10-17 15:10 |
| 1 | 요청 | 완료 | 사내 뉴스레터 10월호 원고 교정 | park | 200 | 문서·PPT 디자인 | 10-15 | 10-15 10:00 | 302 | SP `뉴스레터_10월호.docx` 0.6 MB | jung(채택) · choi · kang · oh · han | jung / v1 승인 10-15 17:20 |
- **문의(D65)**: 문의 q6·q3·q2는 `applications = []`. 위 표의 문의 "지원자" 열은 **답변**(`answers`)으로 적재: q6 = kang 답변 1개("규정 문서 위치랑 예시 바로 드릴게요. 재무 포털 > 규정 > 해외결제 증빙 기준 3.2항을 보시면 됩니다.", 10-21 09:05), q2 = kim 답변(10-17 11:00, 채택 `acceptedAnswerId`) · lee 답변(10-17 11:40), q3 = 없음. q2의 `workerId` = kim(채택 답변자, 보상 원장과 일치), `submissions = []`.
- `rejectCount`: q4 = 1(v1 반려), 나머지 0. `rating`: q2 = 별 4개(10-17 15:10, oh→kim), q1 = 별 5개(10-15 17:20, park→jung), 나머지 null. (시드 EXP는 이미 반영된 값이므로 다시 더하지 않음, D18과 같은 원칙)
- q7 본문 = refs/06의 "요청 배경 + 요청 사항 표(원본 시트 정리/피벗 자동 생성/실행 버튼)" HTML.
- escrowHeld: 7=300, 6=50, 5=500, 4=400, 3=150, 2=0, 1=0. `counters.nextQuestNo = 8`.

### 9.2 효성마을 물품 8건 (6개 마을 · 거래가능 5 · 예약중 2 · 거래완료 1 · 무료나눔 2)
| id | 제목 | 마을 | 분류 | 가격 | 상태 | 판매자 | 예약자/구매자 | 좋아요 | 조회 | 스프라이트 |
|---|---|---|---|---|---|---|---|---|---|---|
| m1 | 27인치 QHD 모니터 | 마포 | 디지털/가전 | 500 | 거래가능 | kim | — | 24 | 132 | monitor |
| m2 | 캡슐 커피머신 (캡슐 20개 포함) | 회현 | 생활/주방 | 무료나눔 | 예약중 | oh | 예약자 lee | 41 | 208 | mug |
| m3 | 경영 전략 도서 5권 세트 | 울산 | 도서/티켓/쿠폰 | 300 | 예약중 | han | 예약자 kim | 12 | 87 | book |
| m4 | 게임 패드 2개 세트 | 창원 | 취미/기타 | 1,200 | 거래가능 | lee | — | 33 | 301 | pad |
| m5 | 무선 기계식 키보드 (적축) | 반포 | 디지털/가전 | 800 | 거래가능 | choi | — | 19 | 154 | keyboard |
| m6 | 겨울 패딩 조끼 L 사이즈 | 수서 | 의류/잡화 | 무료나눔 | 거래가능 | jung | — | 27 | 176 | vest |
| m7 | CGV 영화 예매권 2매 | 마포 | 도서/티켓/쿠폰 | 400 | 거래가능 | park | — | 36 | 245 | ticket |
| m8 | 캠핑 의자 2개 (접이식) | 울산 | 취미/기타 | 600 | 거래완료 | han | 구매자 kang (10-18 12:40) | 8 | 92 | chair |
- m1 본문: "재택 근무용으로 1년 사용한 27인치 QHD(2560×1440) IPS 모니터입니다. 데드픽셀 없고 HDMI·DP 케이블 포함이에요. 마포 본사 1층 로비에서 점심시간 직거래 선호합니다." 나머지 본문은 2–3문장으로 작성.
- 각 물품 사진 3장(프리셋 스프라이트 + 색 변형), 카드에 "1/3".
- 모든 물품 `finalBuyerId = null`, `receipt = null`(m8 포함 — 시드 거래완료는 되돌릴 수 없음, D64). 예약중 m2·m3는 예약만 된 상태(최종 구매자 없음).
- 생성 시각: m1 10-21 12:00, m2 10-21 09:00, m3 10-20, m4 10-20, m5 10-19, m6 10-19, m7 10-18, m8 10-16.

### 9.3 거래 내역 시드
`market_purchase` kang −600 / `market_sale` han +600 (m8, 10-18 12:40) · `quest_reward` kim +200 (q2, 10-17 15:10) · `quest_reward` jung +300 (q1, 10-15 17:20) · 시드 퀘스트 에스크로 Tx(`bounty_escrow`) 각 요청자 1건. balanceAfter는 시드 포인트와 모순되지 않게 역산.

- 아카이브 매물 거래(D52, 의심 사례 C): `market_purchase` jung −800 / `market_sale` choi +800 × 3건(`A-m1` 10-15 12:10, `A-m2` 10-17 12:20, `A-m3` 10-20 12:15, refType `item`, memo "아카이브 매물 (목록 비표시)"). 아카이브 퀘스트 보상 Tx는 만들지 않음(별점 원장만). balanceAfter는 사용자별 시간순 누적이 현재 포인트로 끝나도록 역산(음수 없음).

### 9.4 일일 진행 시드
모든 사용자 `daily = { dayKey: 오늘, achieved: all false, claimed: all false }`. 앱 로드 시 현재 페르소나의 `login`이 자동 달성(ref01 "1/4").

### 9.5 별점 원장 `db.ratings` 시드 (모두 14일 창 안, D52)
> 시각 규칙: rt1·rt2는 q1·q2와 같은 절대 시각. **아카이브 기록(rt3–rt9, `A-m*` Tx, §9.6 운영 시드)은 시드 적재 시각 `seedNow` 기준 상대 오프셋으로 생성**합니다(아래 표 = `seedNow` 2026-10-21 14:02:48 기준 값, 예: rt9 승인 = seedNow − 1일 4시간 50분 48초). 실제 날짜에 시연해도 플래그가 14일 창 밖으로 빠지지 않게 하기 위함입니다. E2E는 고정 시각이므로 표의 값과 정확히 같습니다.

| id | questRef | archived | 요청자 → 작업자 | 별점 | 현상금 | 등록 | 승인 |
|---|---|---|---|---|---|---|---|
| rt1 | 1 | false | park → jung | 5 | 200 | 10-15 10:00 | 10-15 17:20 |
| rt2 | 2 | false | oh → kim | 4 | 100 | 10-17 09:30 | 10-17 15:10 |
| rt3 | A-101 | true | choi → kang | 5 | 200 | 10-14 09:00 | 10-14 16:20 |
| rt4 | A-102 | true | choi → kang | 5 | 300 | 10-16 09:00 | 10-16 17:05 |
| rt5 | A-103 | true | choi → kang | 5 | 300 | 10-19 09:00 | 10-19 16:40 |
| rt6 | A-104 | true | han → jung | 4 | 150 | 10-12 10:00 | 10-13 15:00 |
| rt7 | A-105 | true | jung → han | 5 | 200 | 10-14 10:00 | 10-15 11:30 |
| rt8 | A-106 | true | han → jung | 5 | 150 | 10-17 10:00 | 10-18 14:00 |
| rt9 | A-107 | true | jung → han | 5 | 800 | 10-20 09:00 | **10-20 09:12** |

### 9.6 운영 시드 (D47–D52)
- `restrictions`: `r1` = kang · `quest_post` · 사유 "단기간 반복 등록 소명 요청" · 10-10 10:00 → 10-11 10:00 · 해제 10-10 17:30(ops, "소명 확인 완료") → 상태 **`lifted`**(종료 시각도 지났지만 D54로 해제 우선). 활성 제재 0건. `counters.nextRestrictionNo = 2`.
- `adminLog`: `L1` 10-10 10:00 restrict(kang, r1) · `L2` 10-10 17:30 lift(kang, r1). `counters.nextLogNo = 3`. `flagStates = {}`.

### 9.7 시드 기준 기대 플래그 (`detectFlags`, now = 2026-10-21 14:02:48, 정렬 §6.11) — 3개 사례 · 4건 (D58·D59 적용)
| 순서 | id | 규칙 | 심각도 | 대상 | 근거 |
|---|---|---|---|---|---|
| 1 | `fast_high_bounty__A-107` | R4 | high | jung, han | rt9 (800 P, 12분) |
| 2 | `reciprocal__han__jung` | R2 | high | han, jung | rt6·rt7·rt8·rt9 |
| 3 | `market_pair__choi__jung` | R5 | medium | choi, jung | 구매 Tx 3건, 합계 2,400 P |
| 4 | `pair_5star__choi__kang` | R3 (`alsoMatched` = R1) | medium | choi, kang | rt3·rt4·rt5 |
- 순서 근거: high 먼저 → `lastAt` 내림차순(rt9 10-20 09:12로 둘이 같음 → id 오름차순) → medium: market 10-20 12:15, 그 다음 `pair_5star__choi__kang`(rt5 10-19 16:40). `pair_repeat__choi__kang`은 D59로 생성되지 않음. 비대상: park→jung·oh→kim 각 1건, kang↔han 거래 1건 600 P(D58로도 미성립).
- 페르소나(kim·lee·park)와 관련된 플래그는 0건(시연 페르소나는 깨끗한 상태로 시작).
- **수명**(시드 적재 후 시간이 흐를 때, 스크립트로 계산, D61). 기준은 **이탈 시각 + 1ms**(14일 창의 하한이 포함 구간이라 이탈 시각 정각에는 아직 남음): `2026-10-27T15:00+09:00` + 1ms(rt6 이탈) → 3건(reciprocal 소멸) · `10-28T16:20` + 1ms(rt3 이탈) → 2건 · `10-29T12:10` + 1ms(A-m1 이탈 → 2건 1,600 P) → 1건 · `11-03T09:12` + 1ms → 0건. (일수 약 +6.04·+7.10·+7.92·+12.80일은 **표시용 근사**이며 테스트에 쓰지 않음 — +7.92일은 이탈 시각보다 앞서 2건이 나옴.) 그래서 시연 당일엔 `[데이터 초기화]` 후 시작합니다.

---

## 10. 비기능 요구사항
| 항목 | 요구 |
|---|---|
| 실시간 동기화 | 모든 DB 변경은 `localStorage['oq:v1:db']`에 저장 후 `BroadcastChannel('oq-sync')`로 `{ type:'db', rev }` 방송. 미지원 시 `storage` 이벤트 + `window.dispatchEvent(new CustomEvent('oq:db'))` 폴백. 같은 탭 컴포넌트는 Context로 즉시 반영. 두 번째 탭은 300ms 이내 반영 (MUST) |
| 영속성 | 새로고침 후 모든 상태 유지. `schemaVersion` 불일치(현재 = **2**, D78)·JSON 파싱 실패 시 시드 재적재 + 토스트. 이관 코드 없음 |
| SSR 안전 | `window`/`localStorage`/`BroadcastChannel`/`canvas` 접근은 `useEffect` 또는 `typeof window` 가드 안에서만. 하이드레이션 경고 0건 |
| 접근성 | 모든 아이콘 버튼 `aria-label`, 모달 `role="dialog" aria-modal`, 포커스 링(`--sh-focus`), 비활성 사유는 `aria-describedby`로 연결, 대비 WCAG AA(본문) |
| 모션 | DESIGN §9 토큰만 사용. `prefers-reduced-motion` 폴백(DESIGN §9.6) |
| 성능 | 콘솔 에러 0건, 404 리소스 0건 (MUST, `00-smoke`). 대시보드 첫 렌더(하이드레이션 후) 1초 이내는 **SHOULD**: `performance.getEntriesByType('navigation')[0]` → `data-hydrated` 시점 차이를 Audit에 기록 |
| 외부 의존 | 런타임 외부 요청은 **로컬 폰트 파일이 없을 때의** Paperlogy CDN 폴백뿐(D72). 로컬 폰트가 있으면 0건. 이미지·스크립트·음원·첨부 외부 URL 금지 |
| 소리 | Web Audio 합성만, 음원 파일 없음, 기본 켬 + `sound-toggle`, 성공 이벤트에만(D71, §8.20) |
| 브라우저 | 최신 Chrome/Edge(1순위), Safari/Firefox(깨지지 않을 것) |

---

## 11. 정식 E2E 시나리오 (원본 PRD DoD §4의 전체 플로우 · 기대 수치 포함)

전제: 시드 상태, 고정 시각 2026-10-21 14:02:48 KST(Playwright `clock.setFixedTime` — `Date`만 고정, 타이머·`performance.now()`는 진행), 라이트 모드, 페르소나 kim. 하이퍼 프레임 시간은 D38 방식으로 측정.

| 단계 | 행동 | 기대 결과 |
|---|---|---|
| 1 | kim: `/quests/new` → 요청, 제목 "E2E 원가 매크로 요청", 업무 분야 "재무·엑셀 자동화", 마감 2026-10-23 18:00, 본문 20자+, 현상금 300, 파일 `e2e_원본.xlsx` 첨부 → 등록 → 서약 3개 동의 → `[동의 후 등록]` | `sharepoint-badge[data-demo=true]` "SharePoint · … · 시연용 첨부", `href` 없음, kim 1,500 → **1,200 P**, 하이퍼 프레임 A 1.8초 후 닫힘, `/quests/board` 맨 위 no.8 모집중 |
| 2 | 페르소나 → lee, no.8 상세 → `[지원하기]` → 서약 3개 + 각오 "바로 처리하겠습니다" → `[동의 후 지원]` | 지원자 1명, 버튼 "지원 완료 · 채택 대기", 에디터 잠금 |
| 3 | 페르소나 → kim, no.8 → lee `[채택하기]` | 상태 진행중, 수정/삭제 잠금, 팀즈 버튼 표시 |
| 4 | 페르소나 → lee → 결과물 본문 입력 + `e2e_결과.xlsx` 첨부 → `[결과물 제출하기]` | v1 제출, "검수 대기" |
| 5 | 페르소나 → kim → `[반려 (보완 요청)]` → 사유 "표 서식 보완 부탁드려요" | 상태 "진행중 · 보완요청", `reject-count` **반려 1/2** |
| 6 | 페르소나 → lee → 사유 확인 → 재제출 | v2, 상태 진행중(검수 대기) |
| 7 | 페르소나 → kim → `[퀘스트 완료 (승인)]` → 별점 모달에서 **별 3개**(`rating-star-3`) → `[별점 주고 승인]` | 하이퍼 프레임 B(LEVEL UP!, 실버 Lv.7 → Lv.8, 보상 "+100 EXP", `data-stars=3`) 1.8초 후 닫힘, 상태 완료. lee: **300 → 700 P**, EXP 650 → 750(Lv.8), 오늘 완료 1/2 → **2/2**, 별점 4.1·8건 → **4.0 · 평가 9건** |
| 8 | kim → 효성마을 → m4 게임 패드(1,200 P) | `buy-btn` 없음, `buy-guidance[data-state=available]` 안내, kim 여전히 1,200 P |
| 9 | 페르소나 → lee → m4 → `seller-status-menu` → `open-orgchart-btn` → 김효성 `org-final-kim` → `org-apply` | m4 `예약중`, `seller-trade-status` 수령 대기 · 김효성, **lee 700 · kim 1,200 그대로**, Tx 추가 0 |
| 10 | 페르소나 → kim → m4 → `buy-btn[data-state=buy]` "샀어요 · 물품 수령 확인" | m4 거래완료, `trade-complete-panel`, lee **700 → 1,900 P**, kim **1,200 → 0 P**, 양측 거래 내역에 각 1행 |
| 11 | 콘솔 에러 수 확인 | 0건 |

---

## 12. 완료 조건 요약 (상세 명령은 Harness §9)
1. 시드: 퀘스트 7건(모집중·진행중·보완요청·완료 분포), 물품 8건(6개 마을 전부, 거래가능·예약중·거래완료·무료나눔 포함) — 첫 화면이 비어 있지 않음.
2. `DUAL_BRAIN_AUDIT.md`: Phase별 중간 감리 + 최종 감리(좌뇌: 포인트 차감/환불, 일 2회 한도, 2시간 타이머(쓰기 4개 비활성 + 열람 제한 D74), 최종 구매자 전용 수령 확인, 문의/요청 첨부 분기, 타입 무결성 / 우뇌: Paperlogy, 보라 라이트·다크, 벤토, 도트 하이퍼 프레임 품질, 빈 화면·깨진 UI).
3. `npm run build`, `npm run lint`, `npm run typecheck` 에러 0건(ESLint 경고도 0).
4. `npm run test:unit`, `npm run test:e2e`(§11 전체 플로우 포함) 전부 통과.
5. Visual QA(Harness §6) 10장 **DOM 단언** 전부 PASS(구도 체크는 기록, 최대 2회 수정 후 `unresolved` 허용).
6. 품질 보상·운영 기능: 별점 매핑 5종 단위 테스트, 반려 한도, 운영자 콘솔·제재(Harness `14`·`15` 스펙) 통과.
6-1. 거래·문의·꾸미기·피드백 기능: 판매자 지정·수령 확인·되돌리기(`07`·`08`), 문의 답변(`16`), 마켓 스크롤(`17`), 시간 만료 접근(`18`), 꾸미기(`19`), 피드백·효과음(`20`), 시연 첨부(`21`) 스펙 통과. `npm run doctor` 결과(`docs/doctor.json`)를 Audit에 첨부.
7. 산출물 구조와 실행기: `3조 Office Quest_Autopilot/` 맨 위에 `실행.command`와 `Office Quest/`만 있고, `실행.command`로 실제로 실행해 `http://localhost:3000`에서 앱이 뜨는 것을 확인한다(Harness §1.7·§9.1). 앱 `README.md`에 실행 방법·폴더 안내·데모 계정·첫 실행 Gatekeeper 안내가 있다.
8. 환경 차단(브라우저·레지스트리)으로 실행할 수 없는 명령은 Harness §9 "조건부 완료" 규칙을 따른다.
