# PRD — 오피스퀘스트 (Office Quest) × 효성마을 · v2.4 (Autopilot 제출본)

> **이 문서는 GitHub Copilot Agent Mode(Autopilot)가 사람에게 묻지 않고 끝까지 구현하기 위한 제품 요구사항 정의서입니다.**
> 실행 절차·스택·검증 방법·막힘 대응은 `Harness.md`, 시각 규칙은 `DESIGN.md`와 `tokens.css`, 화면 구도는 `refs/01–10_*.png`가 담당합니다.
> 원본 PRD(`해커톤3조_PRD.md`)의 요구사항은 **하나도 빼지 않고** 이 문서로 옮겼습니다. 원본과 다른 부분은 모두 §2 결정 테이블에 근거와 함께 기록했습니다.
> v2.1: 검수봇·분석봇 검토 반영. v2.2: 팀원 피드백 3건(품질별 별점 보상 · 반려 최대 2회 · 운영자 모니터링 & 제재) 반영(맨 끝 **변경 이력**, D40–D53). v2.3: 검수봇·분석봇 v2.2 재검토 반영(D54–D61). v2.4: 효성 브랜드 팔레트(DESIGN v1.2, D2 갱신·D62).

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
./skills/{dual-brain,taste,mengto,sprite-gen}/ + ./skills/SOURCES.md   ← 스킬 원본 (Harness §2에서 사용 범위 지정)
                            dual-brain 최소 구성 = SKILL.md + README.ko.md. references/*.md는 있으면 사용, 없으면 Harness §0-1 MISSING 규칙
./source/mock/ ./source/motion/   ← 목업·영상 소스 (시드·스프라이트 포팅 원천, 읽기 전용)
./officequest/              ← 구현할 Next.js 앱 (Autopilot이 생성)
./DUAL_BRAIN_AUDIT.md       ← Autopilot이 작성하는 감리 기록
```
`source/mock/`(목업 HTML·`pages.js`·`sprites.js`)가 저장소에 있으면 시드 데이터와 스프라이트 행렬을 그대로 포팅합니다. 없으면 이 문서 §9와 `motion/officequest_intro.html`의 스프라이트 정의를 사용합니다.

### 0.2 문서 우선순위 (충돌 시 위가 이김)
1. **이 PRD의 §2 결정 테이블**
2. 이 PRD 본문 (기능·규칙·수치·시드·수용 기준)
3. `DESIGN.md` + `tokens.css` (시각 값: 색·크기·간격·모션 타이밍)
4. `refs/01–10` (구도·정보 배치·카피)
5. `Harness.md` (절차·도구·검증. 기능 규칙은 정의하지 않음)
6. `skills/*` (Harness §2가 허용한 범위 안에서만)
7. 원본 `해커톤3조_PRD.md` / 원본 `Harness.md` (역사 기록. 이 문서에 반영 완료)

### 0.3 표기 규칙
- **MUST** = 미충족 시 DoD 실패. **SHOULD** = 구현하되 시간 부족 시 `DUAL_BRAIN_AUDIT.md`에 사유 기록 후 생략 가능. **MAY** = 선택.
- `AC-x.y` = 수용 기준(Acceptance Criteria). **MUST AC는 각각 Harness §5.2 AC→테스트 매핑 표의 테스트 하나 이상에 매핑**됩니다. SHOULD AC는 측정 방법이 있으면 기록만 하고 게이트에 넣지 않습니다.
- 이 문서의 ⚡ ♥ 👁 같은 기호는 **아이콘을 가리키는 표기**입니다. 코드·UI 텍스트에는 넣지 않고 Lucide 아이콘을 씁니다(D21).
- **별(U+2605)·☆ 등 별 기호도 같은 규칙**: 코드·UI 문자열에 쓰지 않습니다(Extended_Pictographic → `qa:forbidden` 실패). 별 모양은 Lucide `star` 아이콘, 텍스트는 "별 N개"·"별점 N"·"만점". 이 문서 본문도 별점은 "별 N개"로 표기합니다.
- 모든 시간은 **Asia/Seoul (KST, UTC+9)** 기준. 날짜 경계는 KST 00:00.
- 금액 단위 `P`(포인트), 경험치 `EXP`. 표시 시 천 단위 콤마(`1,500 P`).

---

## 1. 제품 개요

### 1.1 한 줄 정의
사내 마이크로 아웃소싱(**업무 퀘스트**)으로 포인트·EXP를 벌고, 그 포인트로 사내 중고거래(**효성마을**)를 하는 게이미피케이션 웹앱. 백엔드 없이 브라우저 안의 Mock DB로 완전히 동작하는 **시연용 프로덕트**.

### 1.2 범위
| 포함 (MUST) | 제외 |
|---|---|
| 대시보드(벤토), 업무 퀘스트(일일 퀘스트·등록·게시판·상세 워크플로), 효성마을(목록·등록·상세·거래), 가상 Teams 채팅, 그룹웨어 조직도, 3인 페르소나 + 운영자 전환, 2시간 타이머, **별점 기반 품질 보상(D40)**, **반려 최대 2회(D45)**, **운영자 콘솔: 의심 활동 모니터링·제재·감사 로그(D47–D51)**, 라이트/다크 테마, 6티어 픽셀 캐릭터, 하이퍼 프레임 오버레이, 시즌 초기화 시뮬레이션 | 실제 서버/DB/인증, 실제 SharePoint·Teams·그룹웨어 연동, 실제 파일 업로드 저장, 모바일 전용 레이아웃(1280px 미만은 깨지지 않을 정도만), 다국어 |

### 1.3 라우트 맵
| 라우트 | 화면 | 레퍼런스 |
|---|---|---|
| `/` | 대시보드 (로그인 직후 기본 화면, 로고 클릭 시 이동) | `refs/01_dashboard_light.png` |
| `/quests` | `/quests/board`로 리다이렉트 | — |
| `/quests/daily` | 업무 퀘스트 › 일일 퀘스트 (+ 티어 진화표) | `refs/02_daily_quests_tiers.png` |
| `/quests/new` | 퀘스트 등록 (+ 보안서약서 모달) | `refs/04_quest_create.png`, `refs/05_security_pledge_modal.png` |
| `/quests/board` | 업무 퀘스트 게시판 (`?type=&status=&q=&mine=`) | `refs/03_quest_board.png` |
| `/quests/[no]` | 퀘스트 상세 (모집중 / 진행중 / 보완요청 / 완료) | `refs/06_quest_detail_recruiting.png`, `refs/07_quest_detail_inprogress_teams.png` |
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
| D2 | 다크모드 "사이버 시안 포인트 `#06B6D4`" | 원본 Harness §2 vs 원본 PRD·DESIGN(보라 단일 액센트) · v2.4 효성 팔레트 | **v2.4: 시안 폐지.** 효성 공식 팔레트에 시안이 없으므로 `--accent-cyan`을 없애고, 시안을 쓰던 유일한 곳인 GNB 타이머 라이브 점은 `--live-dot`(라이트 `--accent` `#6428E6`, 다크 `--hs-yellow` `#FFBE19`)을 씁니다. 버튼·배지·링크·포커스 등 모든 액센트는 효성 보라(`--accent` `#6428E6`, 다크 보라 텍스트는 `--accent-fg` `#A692EB`, DESIGN §3.0). `#06B6D4`는 계속 금지(Harness §5.5-4) | DESIGN v1.2 §3.0, 브랜드 일관성 |
| D3 | 하이퍼 프레임 1.8초 | 원본 PRD vs 소개 영상(1.2초/1.6초로 단축) | 앱은 **정확히 1,800ms** 후 자동 닫힘. 영상은 스펙이 아님 | 원본 PRD MUST |
| D4 | 오버레이 배경 `bg-black/75 backdrop-blur-sm` | 원본 Harness vs DESIGN §9.4 | DESIGN §9.4 값 사용(어두운 radial + blur 6px + 스캔라인). `position:fixed; inset:0; z-index:9999` 유지 | 둘 다 "반투명 다크", DESIGN이 더 구체적 |
| D5 | 카드에 "미묘한 글래스모피즘" | 원본 PRD Skill B vs DESIGN §4(글래스는 GNB·플로팅만) vs taste(글래스 금지) | `backdrop-filter`는 **GNB·플로팅 칩·모달/오버레이 백드롭·Teams 헤더**에만. 벤토 카드는 불투명 `--surface` + 1px `--border` + `--sh-card` + 상단 1px 내부 하이라이트(`inset 0 1px 0 rgba(255,255,255,.6)`, 다크 `rgba(255,255,255,.04)`)로 "유리 가장자리" 표현 | 가독성(DESIGN) + PRD 의도 충족 |
| D6 | 레이아웃 치수: 사이드바 280px(DESIGN §6) vs 264px(DESIGN §12·refs) vs `--sidebar-w:316px`(tokens, 영상값) / GNB 64 vs 78 | DESIGN 내부, tokens | 앱 값 = **GNB 64px, 좌측 사이드바 264px, 상세 우측 aside 400px, 콘텐츠 패딩 24px, 최대폭 제한 없음(fr 단위)**. `tokens.css`는 수정하지 않고 `officequest/src/styles/app-layout.css`에서 변수 재정의. DESIGN v1.1 §3.7·§6도 264px로 정정됨 | refs가 실제 앱 화면 |
| D7 | TinyMCE 5.10.2 "Self-Hosted / Fallback" | 원본 PRD·Harness | **1순위**: npm `tinymce@5.10.2`를 `public/tinymce/`로 복사해 셀프호스팅(API Key 불필요, 경고 배너 없음). **폴백**: 동일 툴바의 `FallbackEditor`(contentEditable). 전환 조건은 Harness §7 | 원본이 둘 다 허용 |
| D8 | Paperlogy CDN 의존 | 원본 PRD | `@font-face src`에 **CDN 먼저, 로컬(`/fonts/paperlogy/*.woff2`) 두 번째**. 로컬 파일이 없으면 CDN만으로 동작 | 오프라인 대비 |
| D9 | 게시판 상태 필터: 원본 3개(모집중/진행중/완료) vs ref03 4개(+보완요청) | 원본 PRD vs refs/03 | 칩 **전체 · 모집중 · 진행중 · 보완요청 · 완료**. `진행중` 필터는 `in_progress`와 `revision`을 **모두** 포함, `보완요청`은 `revision`만 | ref03 카운트(진행중 2)와 일치 |
| D10 | 업무 퀘스트 사이드바: 원본 3탭 vs ref "내 퀘스트" 그룹 추가 | refs/02–07 | 3탭(일일 퀘스트 · 퀘스트 등록 · 업무 퀘스트 게시판)은 MUST. "내가 요청한/내가 지원한/완료 내역"은 게시판 필터 링크(`?mine=requested\|applied\|done`)로 SHOULD | 원본 범위 유지 + ref 일치 |
| D11 | 타이머 컨트롤: 원본 "⚡아이콘 클릭 시 소진↔리셋 토글" vs ref "+30분 · 만료 테스트 · ↺" | 원본 PRD vs refs | Lucide `zap` 아이콘 + 텍스트 "시연 타이머" 칩(`timer-ctl-toggle`) = **토글**(남은 시간>0이면 00:00:00으로 소진, 0이면 02:00:00 리셋). 추가로 `+30분`, `만료 테스트`, 리셋(Lucide `rotate-ccw`) 버튼 제공 | 둘 다 충족 |
| D12 | 일일 완료 한도 2건: "추가 지원 불가 **또는** 완료 제한 안내" | 원본 PRD §3.2 | **둘 다**: 작업자의 `completedToday ≥ 2`이면 ① 그 사용자의 `[지원하기]` 비활성, ② 그 작업자가 채택된 퀘스트의 `[퀘스트 완료(승인)]` 비활성. 두 경우 모두 사유 라벨 + 툴팁 | 모호성 제거 |
| D13 | "진행중(보완요청)" 표현 | 원본 PRD | 내부 상태 `revision`, 배지 텍스트 **"진행중 · 보완요청"**(warning 색) | ref03 |
| D14 | 재제출 후 상태 | 원본 PRD(명시 없음) | 재제출하면 `revision → in_progress`, `reviewPending=true`, 제출 버전 +1(v2, v3…) | 검수 대기 표시(ref07 "검수 대기") |
| D15 | 현상금 범위 "예: 0P ~ 1,000P" | 원본 PRD | `0 ≤ bounty ≤ min(1000, 내 보유 P)`, **10P 단위**, 프리셋 50/100/300/500(보유 초과 시 비활성) | ref04 |
| D16 | 판매자/요청자가 페르소나가 아닌 NPC일 때 승인 주체 | 시드(NPC 판매 물품 존재) | **NPC 판매자는 구매 요청 1,200ms 후 자동 `거래 승인`**. NPC 요청자 퀘스트는 페르소나가 승인할 수 없으므로 진행 상태로 남음(시연용 표시) | 시연이 막히지 않도록 |
| D17 | 조직도에서 포인트 부족 직원: ref10은 `최종 구매자 지정` 활성 / DESIGN §7.10은 버튼 비활성 | refs/10 vs DESIGN | **두 버튼 모두 비활성** + 툴팁 "보유 포인트 부족" (무료나눔 0P는 항상 활성) | 거래완료 시 잔액 음수 방지 |
| D18 | 시드 포인트와 시드 퀘스트 에스크로 관계 | 원본 PRD | 페르소나 초기 포인트(1,500 / 300 / 5,200)는 **시드 퀘스트 에스크로가 이미 차감된 최종값**. 시드 적재 시 다시 차감하지 않음 | 원본 수치 보존 |
| D19 | "시즌 EXP" vs "누적 EXP" | refs/01·02 | 단일 필드 `exp` = 이번 시즌 누적 EXP. 레벨·티어·랭킹 모두 `exp`에서 계산. 시즌 초기화 시 0 | 1,168 EXP = Lv.12 (refs 일치) |
| D20 | D-Day 계산 | refs/01 "D-14" | **KST 달력 날짜 차이**: `D = dateKST(seasonEndsAt) − dateKST(now)` (일). 2026-10-21 → 2026-11-04 = D-14 | ref 일치 |
| D21 | 버튼 라벨의 이모지(💬🛒🔄✅) | 원본 PRD vs DESIGN §10(이모지 금지) | 라벨 텍스트는 원본 그대로, **이모지 대신 Lucide 아이콘**(message-circle, shopping-cart, rotate-ccw, check). 문서 전체의 **⚡ → `zap`, ♥ → `heart`, 👁 → `eye`** 도 같은 규칙. 유니코드 `Extended_Pictographic` 문자(⚡ ♥ ↔ © ™ 등)는 UI 텍스트·소스에 쓰지 않음(Harness §5.5-6 자동 검사). ↺ ✕ ○ → 같은 비해당 기호도 아이콘으로 대체 권장 | 헤드리스 렌더 깨짐 방지, 금지 패턴 검사와 일치 |
| D22 | 문의/요청 첨부 분기 범위 | 원본 PRD | 퀘스트 `type`이 그 퀘스트의 **모든 첨부**(요청자 첨부 + 작업자 결과물 첨부)를 결정. 문의 = 이미지(`image/*`)만, Base64 썸네일, SharePoint 변환 없음. 요청 = 모든 파일, SharePoint 링크 배지로 변환 | 규칙 단일화 |
| D23 | 앱 위치 | 저장소 구조 | Next.js 앱은 **`./officequest/`** 하위 폴더. 루트의 `skills/`, `refs/`, `motion/`이 lint/tsc 대상에 들어가지 않게 함 | 빌드 무결성 |
| D24 | 하이퍼 프레임 중 상태 반영 시점 | 원본 PRD("즉시 지급") vs DESIGN §9.4("1500–1800ms 실제 반영") | **DB 상태는 클릭 즉시(t=0) 커밋**. 숫자 카운터 롤링 애니메이션만 오버레이 종료 후 재생 | 테스트·다중 탭 일관성 |
| D25 | 등록 후 수정 가능 범위 | 원본 PRD("수정") | 모집중일 때 수정 가능: 제목·업무 분야·마감일·본문·첨부. **유형(문의/요청)과 현상금은 등록 후 변경 불가** | 에스크로 재계산 제거 |
| D26 | 구매 요청 동시성 | 원본 PRD | 물품당 **대기 중 구매 요청은 1건**. 다른 사람에게는 `[샀어요]` 비활성 "다른 직원의 구매 요청이 진행 중이에요" | 정산 모호성 제거 |
| D27 | 페르소나·테마의 탭 간 동기화 | 원본 Harness("모든 컴포넌트 실시간") | **DB(포인트·게시글·상태)는 탭 간 실시간 동기화**. 현재 페르소나·테마는 `localStorage`에 저장(새로고침 유지)하되 다른 탭에 방송하지 않음(탭마다 다른 페르소나로 시연 가능) | 두 탭 시연 지원 |
| D28 | `tokens.css`의 reduced-motion 전역 규칙(애니메이션 1ms) | tokens.css | 하이퍼 프레임 닫힘·Teams 1.2초·NPC 승인 등 **모든 타이밍은 JS 타이머가 결정**. `animationend` 이벤트에 로직을 걸지 않음 | reduced-motion에서도 동작 동일 |
| D29 | 소개 영상의 "+30분" 등 영상 전용 수치·문구 | motion | 앱 스펙은 이 PRD 기준. 영상은 모션 감각 참고용 | — |
| D30 | 서브 타이틀 · 카피 | refs vs 원본 | refs의 카피를 기본값으로 사용(예: "포인트로 사고, 나누고, 순환하고."). 원본의 기능 라벨(`[지원하기]`, `[채택하기]`, `[샀어요]` 등)은 반드시 포함 | 원본 라벨은 테스트 접근명 |
| D31 | Teams 입력 인디케이터 문구 | 원본 PRD "상대방이 입력 중입니다..." vs ref07 | **"{상대 이름}님이 입력 중입니다..."** (이름이 없으면 원본 문구) | ref07 · DESIGN §7.9 |
| D32 | 완료 모션의 몬스터 "슬라임/드래곤" | 원본 PRD Skill C-2 vs ref08·영상 | **슬라임 보스 1종**(드래곤은 MAY) | ref08 · 프레임 예산 |
| D33 | 카드 패딩 원본 20–24px | 원본 PRD Skill B vs DESIGN §5 | **DESIGN 값(24–28px)** 사용 | refs가 DESIGN 값으로 렌더됨 |
| D34 | 스프라이트 "16×16/32×32 매트릭스" | 원본 PRD Skill C-0 vs DESIGN §8 | **16×16 바디를 24×24 캔버스**(날개·검 여유)에 배치. 소품 아이콘은 16×16 | DESIGN §8, ref01·02 |
| D35 | DESIGN.md의 낡은 수치(v1.0: 사이드바 280, max-width 1440, 스탯 타일 2개, 링 3/4, 조직도 md 640, reduced-motion 1.2s, ref09 "전체 128") | DESIGN v1.0 vs PRD·refs | DESIGN v1.1에서 PRD·refs 값으로 정정함. 그래도 남은 차이가 보이면 **PRD → refs → DESIGN** 순으로 결정하고 Audit 기록 | 검수봇 보통-7 |
| D36 | DESIGN의 `refs/video_stills/` · 소개 모션 경로 | DESIGN v1.0 §0·§12 | `video_stills`는 **동봉하지 않음(무시)**. 소개 모션 경로는 `motion/officequest_intro.html` | 실제 패키지 구조 |
| D37 | 시즌 진행률 표시 반올림(실값 77.48%) | refs/01 "78%" | **`Math.ceil(ratio×100)`** → 78%. `formulas.test`가 78을 기대 | ref 일치, 결정성 |
| D38 | 지속시간(하이퍼 프레임 1.8초·Teams 1.2초) 측정 시계 | Harness §1.6-2 vs Playwright `setFixedTime` | 도메인 시각(타이머·dayKey·createdAt)은 `clock.now()`(=`Date.now()`), **경과시간 기록(openedAt/closedAt 등)은 `performance.now()`**. `setFixedTime`은 `Date`만 고정하고 `performance.now()`는 진행함(2026-10-21 실행 확인) | 검수봇 차단-2 · 분석봇 차단 |
| D39 | TinyMCE 5.x 최신 패치(5.10.9) 존재 | npm registry | 원본 지정 **5.10.2 유지**(API·설정 동일). Audit에 "5.10.2 원본 고정" 사유 1줄 기록 | 원본 PRD MUST |
| D40 | 품질별 보상: 별점→EXP 매핑 | 팀원 피드백 v2.2 | 승인 시 별점 **1–5 필수**(기본값 없음). EXP = `RATING_EXP[stars]` = 별 1개 50 · 별 2개 75 · **별 3개 100** · 별 4개 125 · 별 5개 150. 기본 100 P와 현상금 B는 별점과 무관. 일일 미션 EXP(+50)는 그대로 | 별 3개 = 기존 100 EXP → §11 정식 수치 유지 |
| D41 | 별점 평균 표시 | 팀원 피드백 | 사용자별 누적 `rating = { sum, count }`(시즌 초기화 영향 없음). 표시 = `count === 0 ? '평가 없음' : (Math.round(sum / count * 10) / 10).toFixed(1)` + " · 평가 {count}건". 별 모양은 **Lucide `star` 아이콘**(별 문자 U+2605는 Extended_Pictographic이라 텍스트 금지, §0.3·D21) | 결정적 반올림, 금지 패턴 검사와 일치 |
| D42 | 별점 표시 위치 | 팀원 피드백 | 지원자 행(`applicant-rating-{u}`), 채택된 작업자 스트립(`worker-rating`), 대시보드 캐릭터 카드(`dash-rating`). 랭킹·게시판에는 표시하지 않음 | 채택 판단에 필요한 곳만 |
| D43 | 별점 모달과 하이퍼 프레임 순서 | 팀원 피드백 | `[퀘스트 완료 (승인)]` → **별점 모달** → `[별점 주고 승인]` 클릭 시 `quest/approve{stars}` 커밋(D24처럼 즉시) → 하이퍼 프레임 B(보상 카드 EXP = 별점 EXP, 별 n개 표시). 모달 취소 = 변화 없음 | 하이퍼 프레임 1,800ms 규칙(D3) 유지 |
| D44 | 시드 별점 | 팀원 피드백 | `rating.count = completedTotal`(과거 완료는 모두 평가된 것으로 간주). 합계는 §4.4 표. 운영자는 평가 대상 아님 | 누적 완료 수와 일관 |
| D45 | 반려 횟수 한도 | 팀원 피드백 | 퀘스트당 `rejectCount` 최대 **2**. 2회 반려 후 `[반려 (보완 요청)]` 비활성 + 툴팁 "반려는 퀘스트당 최대 2회예요 · 별점과 함께 승인해 주세요(별 1개도 가능)". 최종 경로는 **승인(별 1개도 가능)만**. 작업자 일일 완료 한도(D12)와 겹치면 D12가 우선(§6.9). 운영자 중재 요청은 만들지 않음(단일 종료 경로 → 시연·테스트 결정성, 운영자는 §6.10 모니터링으로 사후 개입) | 무한 반려 루프 차단 |
| D46 | 반려 카운터 표시 | 팀원 피드백 | 상세의 검수 바와 제출 카드에 `반려 n/2`(`reject-count`, `data-count`). 두 번째 반려 모달에는 "이번이 마지막 반려예요" 경고. 게시판 배지는 그대로(D13) | 정보는 상세에서만 |
| D47 | 운영자 페르소나 | 팀원 피드백 | `ops` = **최운영 매니저 · 사내문화팀 · 마포 본사 · HS13001**, `role: 'admin'`, `isPersona: true`. 페르소나 전환기 맨 아래 "운영자" 구분선 뒤에 표시. **플레이어가 아님**: 랭킹·조직도·일일 퀘스트·별점·모니터링 대상에서 제외, 포인트 0 고정, GNB 포인트 칩 대신 `admin-badge`("운영자"). 퀘스트·효성마을 쓰기 액션은 모두 `FORBIDDEN`("운영자 계정은 업무 퀘스트·효성마을 거래에 참여하지 않아요"). 열람은 가능 | 기존 3인 페르소나 수치·조직도 검색 결과 불변 |
| D48 | 운영자 콘솔 접근 | 팀원 피드백 | `/admin`(`?tab=flags\|restrictions\|log`). GNB 탭 `운영자 콘솔`(`nav-admin`)은 운영자일 때만 4번째로 표시(다른 페르소나는 기존 3탭, D1 유지). 운영자가 `/`에 오면 `/admin`으로 클라이언트 이동. 운영자가 아니면 `/admin`은 200 + `admin-forbidden` 패널("운영자만 볼 수 있어요" + `[대시보드로]`) | 실제 인증 없음(시연), 테스트 결정성 |
| D49 | 의심 활동 규칙 | 팀원 피드백 | 순수 함수 `detectFlags(db, now)`(§6.11), 최근 **14일**, 규칙 5종(R1 같은 요청자→작업자 완료 ≥3 · R2 상호 승인 A↔B 각 ≥2 · R3 같은 쌍 평가 ≥3건 전부 별 5개 · R4 현상금 ≥500 & 등록→승인 ≤30분 · R5 같은 판매자↔구매자 0 P 초과 거래 ≥3건, 또는 ≥2건이면서 합계 ≥2,000 P — v2.3 D58. 같은 쌍에 R3이 성립하면 R1은 따로 만들지 않음 — D59). 플래그 ID는 결정적. 판정 데이터는 별점 원장 `db.ratings` + 거래 내역 | 설명 가능한 근거, 재현 가능 |
| D50 | 제재 종류·기간 | 팀원 피드백 | 종류 `quest_post`(퀘스트 등록 제한) · `purchase`(구매 제한), 하나 또는 둘 다(일부가 이미 활성이면 D55). 기간 1일 · 3일 · 7일 · 무기한, 사유 5–100자 필수. 해제도 사유 5–100자. 만료는 `clock.now() ≥ endsAt`로 자동(별도 액션 없음). 같은 사용자·같은 종류의 활성 제재는 1건 | 단순·검증 가능 |
| D51 | 제재의 효과 범위 | 팀원 피드백 | `quest_post`: `quest/create`만 차단(지원·제출·승인·반려는 가능). `purchase`: `item/request` 차단 + 조직도에서 해당 직원 `[예약자 지정]`·`[최종 구매자 지정]` 비활성("구매 제한 중인 직원이에요"). 이미 들어간 구매 요청은 유지. 가드 순서: 운영자 `FORBIDDEN` → `RESTRICTED` → `TIMER_EXPIRED` → 기존 가드 | 요구 범위 그대로 |
| D52 | 플래그 시드 데이터 위치 | 팀원 피드백 | 시드 의심 사례는 **아카이브 기록**(퀘스트 `A-101…A-107`, 매물 `A-m1…A-m3`)으로 `db.ratings`·`db.transactions`에만 존재하고 게시판·마켓 목록에는 나오지 않음 | 게시판 7건·물품 8건·카운트(AC-8.6.1, 8.9.1) 불변 |
| D53 | 새 UI의 디자인 근거 | 팀원 피드백 | 별점 모달·운영자 콘솔·제재 배너에는 ref가 없음. DESIGN.md 컴포넌트(모달 §7, 표·배지·칩·버튼, 비활성 규칙 §7.1)만으로 구성하고 **Visual QA 픽셀/구도 비교 대상에서 제외**(DOM 단언은 E2E가 담당). 기존 ref 화면에 추가된 별점 텍스트·반려 카운터는 구도 체크에서 허용 차이 | 근거 없는 시각 지어내기 방지 |
| D54 | 제재 상태 우선순위 | 분석봇 v2.2 높음 | `restrictionStatus(r, now)` = `r.liftedAt != null ? 'lifted' : (r.endsAt != null && now >= Date.parse(r.endsAt) ? 'expired' : 'active')`. **해제가 만료보다 우선**(시드 r1 = 종료 시각이 지났지만 `lifted`) | 표시·testid `data-status` 결정성 |
| D55 | 일부 종류가 이미 활성인 제재 | 분석봇 v2.2 높음(사용자 지정 방식) | `admin/restrict`는 요청 kinds 중 **활성이 아닌 종류만** 생성(각각 Restriction + 로그 1건). 요청 kinds가 **전부 이미 활성일 때만** `INVALID_STATE`(DB 불변). 기존 활성 제재는 연장·덮어쓰기 안 함(바꾸려면 해제 후 재제재). 모달에서 이미 활성인 종류 체크박스는 비활성 + 사유 "이미 제재 중이에요 ({MM.DD HH:mm}까지)" | 부분 성공을 명시, 오류 코드 1개로 단순화(`ALREADY_RESTRICTED` 폐지) |
| D56 | 제재 id 결정성 | 분석봇 v2.2 높음 | 생성 전에 kinds를 **정규 순서 `['quest_post','purchase']`**로 정렬하고 그 순서로 `r{nextRestrictionNo}`를 부여. 입력 배열 순서와 무관. 시드 이후 E2E 기대값: kang 등록 제한 = `r2`, kim 등록 = `r3`, kim 구매 = `r4`. 제재 행에 `data-kind` | 테스트가 해제할 id를 고정 |
| D57 | 해제·무혐의 멱등성 | 분석봇 v2.2 높음 | `admin/lift`: 대상 제재가 `active`가 아니면(이미 해제·만료·없음) `INVALID_STATE`. `admin/dismissFlag`: 현재 `detectFlags` 결과에 없는 id이거나 유효 상태가 `open`이 아니면 `INVALID_STATE`. `admin/restrict`의 `flagId`도 같은 조건(열린 플래그만). 중복 dispatch(StrictMode·두 탭)에도 로그는 1건 | Harness §1.6-5 멱등 원칙 |
| D58 | R5 오탐 축소 | 분석봇 v2.2 보통 | 0 P(무료나눔) 거래 제외. 성립 = 건수 ≥ 3 **또는** (건수 ≥ 2 **그리고** 합계 ≥ 2,000 P). 고가 물품 1건 거래는 플래그 아님 | 시드 사례 C(800 P × 3건)는 그대로 성립 |
| D59 | R1·R3 중복 제거 | 분석봇 v2.2 보통 | 같은 (a → b) 쌍에 R3(`pair_5star`)이 성립하면 R1(`pair_repeat`)은 만들지 않고 R3 플래그의 `alsoMatched = ['pair_repeat']`로 표시(행 1개 + 보조 규칙 배지 "반복 완료"). R3이 성립하지 않을 때만 R1 단독 플래그 | 같은 사례 2행 방지. 시드 플래그 5 → **4건**(§9.7) |
| D60 | 처리된 플래그의 재발 | 분석봇 v2.2 보통 | `FlagState`에 처리 시점의 `lastAt`·`evidenceCount` 저장. 현재 플래그의 `lastAt`이 저장값보다 늦으면(처리 후 새 근거) 유효 상태 = `open` + `newEvidence = 저장 시각 이후 근거 수`(배지 "새 근거 n건"). 다시 무혐의·제재 가능 | 무혐의 후 재발 누락 방지 |
| D61 | 시드 신선도·시연 당일 | 분석봇 v2.2 보통 | 아카이브 기록은 `seedNow` 상대 시각이라 시드 적재 후 **약 6일**(+6.04일)부터 플래그가 14일 창 밖으로 빠짐(§9.7 수명 표). 운영자 콘솔은 `now − seededAt ≥ SEED_STALE_DAYS(5일)`이면 `admin-stale-seed` 경고("시드 적재 후 5일이 지나 의심 활동 사례가 줄어들 수 있어요 · 시연 전 [데이터 초기화]", 버튼은 기존 `debug-reset-data`와 같은 동작). 시연 당일 시작 전 `[데이터 초기화]` 1회(Harness §9.4) | 시연에서 표가 줄어드는 사고 방지 |
| D62 | 효성 브랜드 팔레트 | 팀 요청(v2.4) | 색의 단일 출처는 `tokens.css`의 `--hs-*` 7색(`#2E008B` `#3D00B8` `#6428E6` `#875FF0` `#C4C4E6` `#F1F1F9` `#FFBE19`)과 그 위에 재매핑한 시맨틱 토큰(DESIGN v1.2 §3.0). **효성 옐로 `--reward`는 보상 신호**: 별점 별(Lucide `star` 채움), 코인, 레벨업, 보상 카드, `[보상 받기]`·`[별점 주고 승인]` 버튼(Reward 버튼: 노랑 채움 + `#2E008B` 글자). 밝은 면 위 노랑 글자 금지. `refs/`는 팔레트 이전 이미지라 **색은 DESIGN·tokens가 우선**하고 Visual QA에서 색 차이는 허용 차이(Harness §6). 앱 코드에 브랜드 hex 직접 사용 금지(Harness §5.5-11, 캔버스는 `src/lib/brand.ts`) | 브랜드 일관성, WCAG AA(DESIGN §3.0 대비표) |

---

## 3. 상수 (단일 출처: `officequest/src/lib/constants.ts`)

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
export const NPC_AUTO_APPROVE_MS = 1200;
export const SHAREPOINT_BASE = 'https://hyosung.sharepoint.com/sites/officequest/Shared%20Documents/';
export const SEASON1 = { id: 1, label: '2026 Season 1', startsAt: '2026-09-02T00:00:00+09:00', endsAt: '2026-11-04T23:59:59+09:00' };
export const NEXT_SEASON_DAYS = 28;
export const STORAGE_KEYS = { db: 'oq:v1:db', ui: 'oq:v1:ui', test: 'oq:test' } as const;
export const BROADCAST_CHANNEL = 'oq-sync';
export const VALIDATION = {
  questTitle: [2, 60], questBodyMinText: 20, resolveLine: [1, 60], resultBodyMinText: 10, rejectReasonMin: 5,
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

## 5. 데이터 모델 (단일 출처: `officequest/src/lib/types.ts`)

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
}

export type QuestType = 'inquiry' | 'request';                     // 문의 | 요청
export type QuestStatus = 'recruiting' | 'in_progress' | 'revision' | 'done';
export interface Attachment {
  id: string; kind: 'sharepoint' | 'image';
  fileName: string; sizeBytes: number;
  url?: string;              // kind==='sharepoint' → SHAREPOINT_BASE + encodeURIComponent(fileName)
  dataUrl?: string;          // kind==='image' → Base64 미리보기
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
  rating: { stars: Stars; ratedAt: ISODate } | null;   // 승인 시 별점 (done만 non-null)
  views: number;
  createdAt: ISODate; completedAt: ISODate | null;
  pledgeAgreedAt: ISODate;   // 등록 시 보안서약 동의 시각
  deleted?: false;           // 삭제는 배열에서 제거 (soft delete 없음)
}

export type ItemCategory = 'digital' | 'living' | 'fashion' | 'books' | 'hobby';
// 표시명: digital 디지털/가전 · living 생활/주방 · fashion 의류/잡화 · books 도서/티켓/쿠폰 · hobby 취미/기타
export type ItemStatus = 'available' | 'reserved' | 'sold';        // 거래가능 | 예약중 | 거래완료
export interface PurchaseRequest { buyerId: UserId; requestedAt: ISODate }
export interface MarketItem {
  id: string;                // 'm1'…
  title: string; village: VillageKey; category: ItemCategory;
  mode: 'sale' | 'free'; price: number;                           // free → 0
  bodyHtml: string;
  photos: { id: string; source: 'preset' | 'upload'; spriteKey?: string; dataUrl?: string }[];
  sellerId: UserId; status: ItemStatus;
  reservedFor: UserId | null;                                      // status==='reserved'일 때만 non-null
  buyerId: UserId | null; soldAt: ISODate | null;                  // status==='sold'일 때만 non-null
  pendingRequest: PurchaseRequest | null;
  likeCount: number; likedBy: UserId[];                            // likedBy는 페르소나 토글용
  views: number; createdAt: ISODate;
}

export type TxType = 'bounty_escrow' | 'bounty_refund' | 'quest_reward' | 'daily_reward' | 'market_purchase' | 'market_sale';
export interface Transaction {
  id: string; type: TxType; userId: UserId; amount: number;        // 부호 포함 (차감 음수)
  balanceAfter: number; refType: 'quest' | 'item' | 'daily'; refId: string;
  counterpartyId?: UserId; memo: string; at: ISODate;
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
  id: string; userId: UserId; kind: 'purchase_request' | 'purchase_approved' | 'adopted' | 'rejected' | 'approved';
  refId: string; text: string; at: ISODate; read: boolean;
}

export interface Season { id: number; label: string; startsAt: ISODate; endsAt: ISODate }

export interface DB {
  schemaVersion: 1;
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
  | 'INVALID_STATE' | 'PLEDGE_REQUIRED' | 'VALIDATION' | 'ALREADY_APPLIED' | 'PENDING_REQUEST_EXISTS'
  | 'RATING_REQUIRED' | 'REJECT_LIMIT' | 'RESTRICTED';   // 이미 활성·이미 해제·이미 처리 = INVALID_STATE (D55, D57)
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
  | { type: 'daily/claim'; mission: DailyMissionKey }
  | { type: 'season/reset' }
  | { type: 'timer/expire' } | { type: 'timer/reset' } | { type: 'timer/plus30' } | { type: 'timer/toggle' }
  | { type: 'item/create'; input: ItemInput } | { type: 'item/update'; id: string; patch: Partial<ItemInput> }
  | { type: 'item/delete'; id: string } | { type: 'item/view'; id: string } | { type: 'item/like'; id: string }
  | { type: 'item/request'; id: string }                    // [샀어요]
  | { type: 'item/approveRequest'; id: string }             // 판매자 [거래 승인]
  | { type: 'item/declineRequest'; id: string }             // 판매자 [거절]
  | { type: 'item/reserve'; id: string; userId: UserId }    // 조직도 → 예약자 지정
  | { type: 'item/releaseReservation'; id: string }
  | { type: 'item/sellTo'; id: string; userId: UserId }     // 조직도 → 최종 구매자 지정
  | { type: 'teams/send'; threadKey: string; text: string } | { type: 'teams/reply'; threadKey: string }
  | { type: 'admin/restrict'; userId: UserId; kinds: RestrictionKind[]; duration: RestrictionDuration; reason: string; flagId?: string }
  | { type: 'admin/lift'; restrictionId: string; reason: string }
  | { type: 'admin/dismissFlag'; flagId: string; reason: string }
  | { type: 'debug/resetData' };
```
`teams/reply`는 `thread.pendingReplyFor !== null`일 때만 성공하고(답장 1개 추가 후 `null`로), 아니면 `INVALID_STATE`(UI는 조용히 무시). 따라서 effect가 두 번 실행돼도 답장은 1개입니다. 같은 이유로 NPC 자동 승인은 `pendingRequest`가 있을 때만 성공합니다.

`admin/*` 액션은 actor가 `role:'admin'`일 때만 성공(아니면 `FORBIDDEN`). 대상이 운영자면 `VALIDATION`. `admin/restrict`는 kinds를 정규 순서(`quest_post` → `purchase`)로 정렬하고(D56), **아직 활성이 아닌 종류마다** Restriction 1건 + AdminLogEntry 1건을 만들며, `flagId`가 있으면 `flagStates[flagId] = { status:'actioned', …, lastAt, evidenceCount }`. 요청 kinds가 전부 이미 활성이면 `INVALID_STATE`(D55). `flagId`가 열린 플래그가 아니면 `INVALID_STATE`. `admin/lift`는 대상이 `active`일 때만, `admin/dismissFlag`는 열린 플래그일 때만 성공하고 아니면 `INVALID_STATE`(D57). 운영자가 플레이어 액션(`quest/*`·`item/*`·`daily/claim`)을 하면 `FORBIDDEN`(`quest/view`·`item/view` 제외).

리듀서는 실패 시 `DomainError`를 던지고 **DB를 변경하지 않습니다**. UI는 같은 가드 함수(`canX(db, actor, ...)` → `{ ok: true } | { ok: false; code; reason }`)를 써서 버튼 비활성과 사유 라벨을 만듭니다. 가드와 리듀서가 같은 함수를 공유해야 합니다(MUST).

---

## 6. 규칙 엔진 · 수식 (단일 출처: `officequest/src/lib/formulas.ts`)

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
| 중고 거래 완료 (가격 X) | — | — | 구매자 `points −= X`, 판매자 `points += X` | 구매자 `market_purchase −X`, 판매자 `market_sale +X` (**X=0도 0P로 양측 기록**) |

**불변식 (단위 테스트 MUST)**: 모든 액션 전후로 `Σusers.points + Σquests.escrowHeld`의 변화량 = 그 액션에서 시스템이 발행한 금액(퀘스트 기본 보상 100, 일일 보상 10)의 합. 어떤 사용자도 `points < 0`이 될 수 없음.

### 6.3 일일 완료 한도 (D12)
- `completedToday ≥ 2`인 사용자: `[지원하기]` 비활성 — 사유 "오늘 완료 한도(2/2)에 도달했어요 · 내일 다시 지원할 수 있어요".
- 작업자의 `completedToday ≥ 2`인 퀘스트: 요청자의 `[퀘스트 완료(승인)]` 비활성 — 사유 "작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요". `[반려]`는 가능.
- GNB/대시보드/사이드박스에 "오늘 완료 보상 n / 2" 표시.

### 6.4 일일 초기화 (KST 00:00)
앱 로드 시와 1분마다 `kstDayKey(now) !== db.dayKey`이면 한 번에 적용: 모든 사용자 `completedToday = 0`, 모든 `daily[*]`를 새 dayKey로 초기화(achieved/claimed 모두 false), `timer.endsAt = now + 2h`, `db.dayKey` 갱신. **시드 적재 시 `dayKey = kstDayKey(now)`로 기록**(시드 값이 즉시 초기화되지 않도록).

### 6.5 일일 퀘스트 4종 (사용자별, MUST)
| key | 제목 | 달성 조건 (달성 시 `achieved=true`) |
|---|---|---|
| `login` | 오늘 오피스퀘스트 접속하기 | 해당 페르소나가 오늘 처음 활성화될 때(앱 로드 또는 페르소나 전환) 자동 |
| `post` | 업무 퀘스트 1회 등록하기 | 그 사용자가 오늘 `quest/create` 성공 |
| `complete` | 업무 퀘스트 1회 완료하기 | 그 사용자가 작업자로 오늘 `quest/approve` 받음 |
| `adopted` | 지원한 퀘스트 채택되기 1회 | 그 사용자가 오늘 `quest/adopt`의 대상이 됨 |
- 보상은 **자동 지급이 아니라** `[보상 받기 +10 P]` 클릭 시 +10P·+50EXP, 하루 미션당 1회. 클릭 시 픽셀 코인 파티클.
- 진행률 링 = 달성 수 / 4 (refs/01 "1/4").

### 6.6 세션 타이머 (전역 1개, D11)
- 표시 `HH:MM:SS` = `max(0, timer.endsAt − now)`; 250ms마다 갱신; 글자별 고정폭 span(DESIGN §2.1).
- 시드: `endsAt = now + 2h` → 02:00:00.
- `timer/toggle`: 남은 시간 > 0 → `endsAt = now`; 아니면 `endsAt = now + 2h`.
- `timer/expire`: `endsAt = now`. `timer/reset`: `endsAt = now + 2h`. `timer/plus30`: `endsAt = min(now + 2h, max(now, endsAt) + 30m)`.
- **남은 시간 0일 때 비활성 (정확히 3개)**: `[퀘스트 등록]`(사이드바 진입은 허용, 폼의 등록 버튼과 게시판의 등록 버튼 비활성), `[지원하기]`, `[결과물 제출하기]`(재제출 포함). 사유 라벨/툴팁: "오늘 작업 가능 시간을 모두 사용했어요 (00:00:00)".
- 게시판·상세 **열람**, 채택·반려·승인, 효성마을 **모든 기능**은 타이머와 무관하게 동작(MUST).
- 라이브 점은 `--live-dot`(라이트 보라, 다크 효성 옐로, D2). 0이면 점이 `--danger-fg`로 바뀌고 깜빡임 멈춤.

### 6.7 시즌
- 대시보드: `{season.label} 종료까지 D-{n}` (D20), 진행률 = `Math.ceil((now − startsAt)/(endsAt − startsAt) × 100)`% (D37; 시드 시점 실값 77.48% → **78%**).
- 랭킹 TOP 5 = 전체 **플레이어**(`role:'player'`, 운영자 제외 D47) `exp` 내림차순, 동점이면 `name` 오름차순. 현재 페르소나 행 강조.
- `[시즌 초기화 시뮬레이션]` → 확인 모달 → `season/reset`: 모든 사용자 `exp = 0`(Lv.1 브론즈), 각 사용자 `seasonBadges`에 **종료된 시즌 라벨 `'2026 Season 1'`** 추가(획득 배지 = 지난 시즌), 대시보드 시즌 라벨 `dash-season-label` = **새 시즌 라벨 `'2026 Season 2'`**, `season = { id+1, label: '2026 Season {id+1}', startsAt: now, endsAt: KST 23:59:59 of (now + 28일) }`. **`points`, `completedTotal`, 퀘스트·물품·거래내역은 그대로**. 초기화 직후 토스트 "포인트는 100% 유지돼요 · 1,500 P"(현재 페르소나 값) — 포인트 유지를 시각적으로 증명.

### 6.8 별점 보상 (D40–D44)
- `ratingExp(s) = RATING_EXP[s]`: 1→50, 2→75, 3→100, 4→125, 5→150. `formatRating(r)` = D41.
- 레벨·티어는 기존 §6.1 수식 그대로(EXP만 달라짐). 예: lee 650 EXP에서 별 3개 → 750 Lv.8, 별 5개 → 800 Lv.9, 별 1개 → 700 Lv.8.
- 별점은 요청자만, 승인 시 1회. 수정·취소 없음. 운영자는 별점을 주거나 받지 않음.
- **집계와 원장은 별개** (v2.3): `user.rating`은 과거분까지 포함한 누적 집계(§4.4 시드), `db.ratings` 원장은 최근 기록(시드 rt1–rt9 + 이후 승인)만 담고 **모니터링은 원장만** 사용. 따라서 "집계 = 원장 합"은 불변식이 아님(lee의 시드 8건은 원장에 없음). 대신 맞춰야 하는 불변식: ① 모든 플레이어 `rating.count === completedTotal` ② 시드 이후 추가된 RatingRecord(id ∉ rt1–rt9)의 작업자별 건수·별 합 = `rating`의 시드값 대비 증가분 ③ 승인 1회 = RatingRecord 정확히 1건 추가(Harness `invariants.test`).

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

### 6.11 의심 활동 탐지 `detectFlags(db, now)` (단일 출처: `officequest/src/lib/monitoring.ts`, D49)
최근 14일(`now − 14일 ≤ at ≤ now`)의 `db.ratings`(approvedAt 기준)와 `db.transactions`(`market_purchase`, at 기준)만 사용. 운영자는 대상 아님. 결과는 `severity`(high 먼저) → `lastAt` 내림차순 → `id` 오름차순으로 정렬.
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
| `recruiting` | `quest/update` (요청자) | 요청자 본인 | `recruiting` | 유형·현상금 변경 불가(D25) |
| `recruiting` | `quest/delete` (요청자) | 요청자 본인, 확인 모달 | (제거) | 요청자 +B 환불, Tx |
| `recruiting` | `quest/apply` (요청자 외) | 타이머>0, `completedToday<2`, 미지원, 보안서약 동의, 각오 1–60자 | `recruiting` | applications에 추가 |
| `recruiting` | `quest/adopt` (요청자) | 지원자 ≥1, 대상이 지원자, 아직 workerId 없음 | `in_progress` | workerId·adoptedAt 설정, 작업자 일일 `adopted` 달성, 알림, **수정/삭제 즉시 잠금** |
| `in_progress` (reviewPending=false) | `quest/submit` (작업자) | 타이머>0, 본문 텍스트 ≥10자 | `in_progress` (reviewPending=true) | Submission v(n+1) |
| `in_progress` (reviewPending=true) | `quest/reject` (요청자) | 사유 ≥5자, **`rejectCount < 2`**(아니면 `REJECT_LIMIT`, D45) | `revision` (reviewPending=false) | 마지막 Submission.review=rejected+reason, **rejectCount+1**, 알림 |
| `revision` | `quest/submit` (작업자) | 타이머>0, 본문 텍스트 ≥10자 | `in_progress` (reviewPending=true) | Submission v(n+1) (D14) |
| `in_progress` (reviewPending=true) | `quest/approve` (요청자) | 작업자 `completedToday<2`, **stars ∈ 1–5**(아니면 `RATING_REQUIRED`) | `done` | 작업자 +100+B P, **+RATING_EXP[stars] EXP**, rating 누적, quest.rating 기록, RatingRecord 추가, completedToday+1, completedTotal+1, escrowHeld=0, Tx, 작업자 일일 `complete` 달성, **하이퍼 프레임 B** |
| `in_progress`/`revision`/`done` | `quest/update`/`delete` | — | 거부 (`INVALID_STATE`) | 버튼은 잠금 아이콘 + 툴팁 "진행중·완료 상태에서는 수정/삭제할 수 없어요" |
| 모든 상태 | `quest/view` (누구나) | — | 동일 | views +1 (상세 진입마다) |

추가 규칙: 지원자 결과물 에디터는 **채택 전 모든 사용자에게 잠김**(ref06 잠금 패널). 채택 후 **작업자 본인에게만** 열림. 작업자가 아닌 사용자는 제출 영역 대신 읽기 전용 제출 이력만 봄. 요청자는 자기 퀘스트에 지원 불가(`FORBIDDEN`).

### 7.2 효성마을 물품
| 현재 | 이벤트 (주체) | 가드 | 다음 | 부수 효과 |
|---|---|---|---|---|
| — | `item/create` (누구나) | 제목 2–40자, mode=sale이면 가격 10–100,000 & 10단위, free면 0, 사진 ≤5 | `available` | — (타이머 무관) |
| `available` | `item/request` (판매자 외 플레이어) | **`purchase` 활성 제재 없음**(아니면 `RESTRICTED`, D51), `pendingRequest==null`, `points ≥ price` (부족 시 **경고 모달**, 상태 변화 없음) | `available` + pendingRequest | 판매자에게 알림·토스트 "구매 확인 요청", 판매자가 NPC면 1,200ms 후 자동 승인(D16) |
| `reserved` | `item/request` | **actor === reservedFor**, 위 가드 동일 | `reserved` + pendingRequest | 동일 |
| `reserved` | `item/request` (reservedFor 아닌 사용자) | — | 거부 (`NOT_RESERVED_BUYER`) | 버튼 비활성 "예약중인 상품입니다 - 지정 예약자 외 구매 불가" |
| `available`/`reserved` + pending | `item/approveRequest` (판매자) | 구매자 `points ≥ price` 재확인 (실패 시 요청 취소 + 오류 토스트) | `sold` | 정산(§6.2), buyerId·soldAt, Tx 양측, pendingRequest=null, reservedFor=null |
| `available`/`reserved` + pending | `item/declineRequest` (판매자) | — | 이전 상태 유지 | pendingRequest=null, 구매자 알림 |
| `available` | `item/reserve` (판매자, 조직도) | 대상에 `purchase` 활성 제재 없음, 대상≠판매자, `pendingRequest==null`, 대상 `points ≥ price` | `reserved` (reservedFor=대상) | 토스트 |
| `reserved` | `item/reserve` (다른 대상) | 동일 | `reserved` (교체) | — |
| `reserved` | `item/releaseReservation` (판매자) | pendingRequest==null | `available` | reservedFor=null |
| `available`/`reserved` | `item/sellTo` (판매자, 조직도) | 대상에 `purchase` 활성 제재 없음, 대상≠판매자, 대상 `points ≥ price`, pendingRequest==null | `sold` | 즉시 정산, Tx 양측 |
| `available`/`reserved` | `item/update`/`item/delete` (판매자) | pendingRequest==null | 동일/제거 | — |
| `sold` | 모든 거래 액션 | — | 거부 (`INVALID_STATE`) | CTA 비활성 "거래가 완료된 상품이에요", 썸네일 opacity .35 |
| 모든 상태 | `item/like` (페르소나) | — | 동일 | likedBy 토글, likeCount ±1 |
| 모든 상태 | `item/view` | — | 동일 | views +1 |

판매자에게는 `[샀어요]` 대신 **판매자 패널**(상태 변경 메뉴: 조직도에서 예약자 지정 / 최종 구매자 지정 / 예약 해제, 구매 요청 카드: `[거래 승인]` `[거절]`, 수정·삭제)이 보입니다. **효성마을의 어떤 액션도 타이머의 영향을 받지 않습니다.**

### 7.3 `[샀어요]` 버튼 상태 표 (구매자 관점, `data-state` 값)
| 조건 (위에서부터 첫 일치) | data-state | 라벨 | 활성 |
|---|---|---|---|
| actor가 판매자 | (버튼 없음, 판매자 패널) | — | — |
| status=sold | `sold` | 거래가 완료된 상품이에요 | ✕ |
| pendingRequest.buyerId == actor | `requested` | 구매 요청 완료 · 판매자 승인 대기 | ✕ |
| actor에게 `purchase` 활성 제재 (D51) | `restricted` | 운영자 제재로 구매가 제한됐어요 | ✕ (사유 툴팁 §6.10) |
| pendingRequest != null | `locked-pending` | 다른 직원의 구매 요청이 진행 중이에요 | ✕ |
| status=reserved & reservedFor≠actor | `locked-reserved` | 예약중인 상품입니다 - 지정 예약자 외 구매 불가 | ✕ |
| mode=free | `free` | 샀어요 · 나눔 요청 | ○ |
| 그 외 | `buy` | 샀어요 · 구매 요청 | ○ (클릭 시 포인트 부족이면 경고 모달) |

포인트 부족은 **버튼을 비활성화하지 않고** 클릭 시 모달로 차단(원본 PRD 문구 그대로): "보유 포인트가 부족합니다! 업무 퀘스트를 수행해 포인트를 모아보세요."

---

## 8. 화면별 명세 · 수용 기준

> 각 화면은 지정된 ref와 **구도·정보 배치·카피·상태 표현**이 일치해야 합니다(Harness §6 Visual QA). 픽셀 단위 일치는 요구하지 않습니다. 시각 값은 DESIGN.md를 따릅니다. `data-testid`는 Harness §5.3 목록이 정본입니다.

### 8.1 앱 셸 · GNB (모든 화면, ref 01–10 상단)
**구성(좌→우, DESIGN §6)**: 로고 타일(픽셀 별) + "OFFICE QUEST" + "× 효성마을" → 탭 세그먼트 3개(D1, 활성 흰 필 280ms 슬라이드) → 타이머 칩(라벨 "시연 세션 남은 시간", `HH:MM:SS`, Lucide `zap` + "시연 타이머" 토글, +30분, 만료 테스트, 리셋(Lucide `rotate-ccw`)) → 포인트 칩(코인 스프라이트 + 현재 페르소나 P) → 페르소나 전환기(플레이어 3명 + 구분선 "운영자" 아래 `ops`, 아바타 + 이름·부서, 드롭다운; 운영자일 때는 포인트 칩 대신 `admin-badge`, 탭에 `운영자 콘솔` 추가 — D47·D48) → 테마 토글("라이트" ↔ "게이밍"). DEBUG 메뉴에 `[데이터 초기화]`(시드 재적재, 확인 모달) SHOULD.

- AC-8.1.1 로고 클릭 → `/`.
- AC-8.1.2 페르소나 전환 시 새로고침 없이 포인트 칩·대시보드·버튼 권한·사이드박스가 즉시 바뀐다(E2E: 전환 후 기본 expect 타임아웃 안에 `points-chip` 값 변경, 페이지 navigation 이벤트 0). "200ms 이내 렌더"는 SHOULD(`performance.mark` 측정값을 Audit에 기록).
- AC-8.1.3 테마 토글 → `<html data-theme="dark">`, 새로고침 후 유지, 첫 페인트 깜빡임 없음(인라인 스크립트로 선적용). View Transition 원형 리빌 SHOULD.
- AC-8.1.4 타이머가 초 단위로 감소하고(E2E: `page.clock.install` → `runFor(3000)` 후 표시가 3±1초 감소), 시연 타이머 토글(`timer-ctl-toggle`) 1회 → `00:00:00`, 2회 → `02:00:00`.
- AC-8.1.6 전환기에 `persona-option-ops`가 있고, 운영자로 전환하면 `admin-badge`·`nav-admin`이 보이며 `points-chip`·랭킹 행에 운영자가 없다. 다른 페르소나에서는 `nav-admin`이 없다(탭 3개 유지).
- AC-8.1.5 하이드레이션 완료 후 `<html data-hydrated="true">`. 그 전에는 레이아웃이 같은 스켈레톤.

### 8.2 대시보드 `/` — `refs/01_dashboard_light.png`
비대칭 벤토: `grid-cols-[1fr_1.12fr_1.38fr] grid-rows-2 gap-5`, 카드1·2 `row-span-2` (DESIGN §6).
| 셀 | 필수 내용 |
|---|---|
| ① 내 캐릭터 스테이터스 | 티어 배지(예: GOLD 티어), 히어로 박스(캔버스 캐릭터 ×12–13, 티어 오라, 장비 배지 "황금 갑옷 장착"), Lv 배지, "오늘 완료 보상 n / 2", 이름·부서·마을·사번, EXP 바(`티어 Lv.n · 다음 레벨까지 x EXP`, `y / 100 EXP`), 스탯 타일 3개(보유 포인트 · 오늘 완료 n/2회 · 완료 퀘스트 n건), 별점 평균 줄(`dash-rating`, Lucide `star` + "4.3 · 평가 23건", D42 — ref01에 없는 추가 요소) |
| ② 시즌 랭킹 TOP 5 | 시즌 배지, D-Day 다크 배너(`D-14`, "시즌 종료까지 14일", 마감 일시, 진행률 바 78%), 랭킹 5행(순위·아바타·이름·부서·티어배지·시즌 EXP, 내 행 강조 + "나" 배지), `[시즌 초기화 시뮬레이션]` + 안내 "전원 Lv.1 브론즈 · 0 EXP로 초기화 · 보유 P 100% 유지" |
| ③ 오늘의 일일 퀘스트 | 진행 링(n/4), 4행(아이콘·제목·진행바·n/1·`보상 받기 가능` 또는 `+10P +50EXP`) |
| ④ 최신 소식 | 2열: 최신 업무 퀘스트 3개(분류·상태 배지, 제목, "100P + 현상금 nP · 부서") / 효성마을 인기 매물 3개(likeCount 내림차순: 상태 배지, Lucide `heart` + 좋아요 수, 제목, 마을·가격 또는 무료나눔). 클릭 시 상세 이동 <br>※ 인기 매물 규칙 = 거래완료 제외 · likeCount 내림차순 상위 3(시드 결과: 커피머신 41 · CGV 36 · 게임 패드 33). ref01의 세 번째 카드(27인치 모니터)는 예시이며 Visual QA는 개수(3+3)만 검사 |

- AC-8.2.1 김효성 시드 기준 값이 ref01과 같다: Lv.12, 68/100, 1,500 P, 0/2, 23건, D-14, TOP5 순서와 점수, 일일 1/4.
- AC-8.2.2 레벨/티어가 바뀌면(승인·보상 수령·시즌 초기화) 캐릭터 스프라이트와 오라가 즉시 바뀐다(`[data-testid=pixel-sprite][data-tier]` 값 변경).
- AC-8.2.3 시즌 초기화 후: 모든 사용자 Lv.1 브론즈 0 EXP, `dash-season-label` = "2026 Season 2", 현재 페르소나 `seasonBadges`에 "2026 Season 1" 포함, 현재 페르소나 포인트 값이 초기화 전과 동일.
- AC-8.2.5 김효성 시드 기준 `dash-rating` = "4.3 · 평가 23건"(D41).
- AC-8.2.4 1280px 미만에서 2열로 접히고 가로 스크롤이 없다.

### 8.3 일일 퀘스트 `/quests/daily` — `refs/02_daily_quests_tiers.png`
좌측 사이드바(업무 퀘스트: 일일 퀘스트 n/4 · 퀘스트 등록 · 업무 퀘스트 게시판 n / 내 퀘스트 그룹 SHOULD / 하단 "오늘 완료 보상 n / 2" 박스). 본문: 헤더(초기화까지 남은 시간 칩, 오늘 받은 보상 칩), 미션 카드 4장(아이콘, 상태 배지 달성 완료/진행중, 설명, 진행바, n/1, +10P·+50EXP 칩, CTA: 달성&미수령 → primary `보상 받기 +10 P`; 미달성 → **활성** secondary 이동 버튼(`daily-go-{k}`) "퀘스트 등록하러 가기"/"진행중 퀘스트 n건"/"지원 중인 퀘스트 n건"(각각 `/quests/new`, `/quests/board?mine=requested`, `/quests/board?mine=applied`); 수령 완료 → 비활성 "오늘 보상 수령 완료". `daily-claim-{k}`는 **수령 버튼(달성&미수령·수령 완료)에만** 붙임. `login`은 자동 달성이므로 이동 버튼이 없음), 내 캐릭터 카드(누적 EXP, 다음 티어까지), **6단계 티어 진화표**(스프라이트 6종, 티어 배지, 레벨 구간, 누적 EXP, 외형·장비, 오라, 인원, 현재 티어 행 강조 + "현재" 배지).
- AC-8.3.1 김효성 첫 로드 시 `login` 달성(1/1), 클릭하면 +10 P(1,510)·+50 EXP(1,218, Lv.13) 반영되고 버튼이 수령 완료로 바뀐다. 같은 날 재수령 불가.
- AC-8.3.2 퀘스트 등록 성공 후 `post` 카드가 달성 상태가 된다.
- AC-8.3.3 티어 진화표 6행 모두 서로 다른 캔버스 스프라이트로 렌더된다(빈 캔버스 없음: 픽셀 알파 합 > 0).

### 8.4 퀘스트 등록 `/quests/new` — `refs/04_quest_create.png`
본문 카드: 유형 세그먼트(문의/요청 + 설명 "답변만 필요한 간단한 질문" ↔ "결과물 제출이 필요한 업무 요청"), 제목(글자 수 n/60), 업무 분야 셀렉트(재무·엑셀 자동화 / 문서·PPT 디자인 / 데이터·BI / IT·시스템 / 인사·총무 / 생산·품질 / 기타), 마감일(datetime-local), **리치 에디터**(TinyMCE 5.10.2 스킨 오버라이드: 메뉴바 파일/편집/보기/삽입/서식/표/도구, 툴바 undo·블록·폰트·B·I·U·글자색·정렬·리스트·링크·이미지·표·코드블록, 상태바, 우측 "TinyMCE 5.10.2" 태그, 경고 배너 없음), 첨부(유형별 D22: 요청 = 파일 선택 → 600ms 진행바 → SharePoint 링크 배지 "링크 변환 완료", 라벨 "업로드 시 SharePoint 링크로 자동 변환"; 문의 = "스크린샷 이미지 첨부" 버튼만, 일반 파일 버튼은 비활성 + 사유 "문의는 스크린샷 이미지만 첨부할 수 있어요"), 하단 `[미리보기]` `[취소]` `[퀘스트 등록하기 · {B} P]`(코인 스프라이트).
우측 aside: 현상금 카드(값 900/28 보라, 슬라이더 0–1,000 눈금 0/250/500/750/1,000, 프리셋 50/100/300/500, 에스크로 박스 "등록 즉시 에스크로 선차감 1,500 → 1,200 P", 안내 "모집중 상태에서 삭제하면 현상금이 전액 환불돼요. 채택 이후에는 수정·삭제가 잠겨요."), 작업자 보상 미리보기(기본 100 P · 현상금 B P · 경험치 100 EXP · 완료 승인 시 총 지급 `100+B P + 100 EXP`), 등록 체크리스트(유형·제목 / 본문 20자 / 현상금 보유 P 이내 / 보안서약서 동의 — 실시간 체크, n/4).
- AC-8.4.1 `[퀘스트 등록하기]` 클릭 → 유효성 통과 시 **보안서약서 모달**(§8.5)이 매번 열린다. 모달 동의 전에는 아무 상태도 바뀌지 않는다.
- AC-8.4.2 동의 후 등록: 요청자 포인트가 정확히 B만큼 감소, 새 퀘스트 `no = max+1`, 상태 `모집중`, **하이퍼 프레임 A**가 1,800ms(±150ms) 표시 후 사라지고 `/quests/board`로 이동, 새 행이 맨 위.
- AC-8.4.3 문의 유형: 일반 파일 input 비활성, 이미지 input만 허용(`accept="image/*"`), 첨부는 Base64 썸네일. 요청 유형: 첨부 배지 URL = `https://hyosung.sharepoint.com/sites/officequest/Shared%20Documents/` + `encodeURIComponent(파일명)`, 파일 크기 표시(1,024 기준 KB/MB 소수 1자리).
- AC-8.4.4 B > 보유 P면 슬라이더·입력이 보유 P로 클램프되고 초과 프리셋 비활성.
- AC-8.4.5 타이머 0이면 등록 버튼 비활성 + 사유 툴팁(§6.6).
- AC-8.4.6 에디터에 Tiny Cloud API Key 경고("This domain is not registered…")가 뜨지 않고, 네트워크 요청이 `cdn.tiny.cloud`로 나가지 않는다.

### 8.5 보안서약서 모달 — `refs/05_security_pledge_modal.png`
md 모달(640px), 헤더 "사내 정보보안 서약서" + shield 아이콘, 조항 박스(제1조 목적 / 제2조 기밀 유지 / 제3조 개인정보), 체크 3개(모두 필수): ① "대외비·기밀문서를 업로드하지 않고 사내 보안 규정을 준수합니다." ② "개인정보·고객정보는 마스킹(비식별) 처리 후 첨부합니다." ③ "결과물의 권리는 회사에 귀속되며 업무 목적 외 사용하지 않습니다." 등록용: 에스크로 요약(현상금 B P 선차감, 보유 a → b). 지원용(variant=apply): 에스크로 요약 대신 **"한 줄 각오" 입력(1–60자)**. 푸터: 서약자 이름·부서·사번·날짜, `[취소]`, `[동의 후 등록]` / `[동의 후 지원]`.
- AC-8.5.1 체크 3개(+지원 시 각오) 전부 충족 전 확인 버튼 비활성.
- AC-8.5.2 모달은 **매번** 미체크 상태로 열린다(동의 기억 금지). 취소/ESC/백드롭 클릭 → 아무 변화 없음.
- AC-8.5.3 포커스 트랩, ESC 닫힘, 열릴 때 첫 체크박스 포커스.

### 8.6 업무 퀘스트 게시판 `/quests/board` — `refs/03_quest_board.png`
헤더(브레드크럼, "업무 퀘스트 게시판", 설명, `[+ 퀘스트 등록하기]`), 필터 행(분류 칩 전체/문의/요청 + 카운트, 상태 칩 D9 + 카운트, 검색창 "제목, 요청자, 부서 검색", 정렬 최신순/보상순/조회순), 테이블 열: No · 분류 배지 · 상태 배지 · 제목(+마감일, 요청 유형 첨부 있으면 "SharePoint 첨부") · 보상("100P + {B}P", 아래 "현상금 에스크로") · 요청자(아바타·이름·부서·티어) · 지원자 수 · 조회 · 등록일. 하단 합계 문구 + 페이지네이션(10행/페이지).
- AC-8.6.1 시드 7행이 ref03 순서·값과 같다.
- AC-8.6.2 필터·검색 조합이 URL 쿼리에 반영되고 새로고침 후 유지된다. 카운트 = 현재 다른 필터 적용 후의 개수.
- AC-8.6.3 행 클릭 → 상세 이동 + 조회수 +1(목록 복귀 시 반영).
- AC-8.6.4 `?mine=requested|applied|done`이 현재 페르소나 기준으로 필터한다(SHOULD).

### 8.7 퀘스트 상세 `/quests/[no]` — `refs/06_quest_detail_recruiting.png`, `refs/07_quest_detail_inprogress_teams.png`
공통 헤더: 브레드크럼, 분류·상태·마감 배지, 제목, 요청자 스트립(아바타·이름·부서·티어, 등록일, 조회, 지원 n명), 보상 배지 "보상 100P + 현상금 BP", 우상단 `[수정]` `[삭제]`(상태별 활성/잠금 + 툴팁), **워크플로 스테퍼 7단계**(모집중 → 지원 → 채택 → 진행중 → 결과물 제출 → 반려·재제출 → 승인·완료, DESIGN §7.12) SHOULD, 본문(표 포함 HTML), 첨부.

| 상태 / 보는 사람 | 화면 요소 (ref) |
|---|---|
| 모집중 · 요청자 | `[수정]` `[삭제]` 활성(삭제 툴팁 "삭제 시 현상금 BP가 전액 환불돼요"), 결과물 에디터 잠금 패널("결과물 제출 에디터가 잠겨 있어요", "채택 전 잠금" 배지), 진행 규칙 4칸, aside: 보상 카드(100+B P, "에스크로 보관중"), **지원자 리스트**(티어 배지·부서·마을·**별점 평균 + 평가 수**(`applicant-rating-{u}`, D42)·각오·보안서약 동의 시각·`[채택하기]`) — ref06 |
| 모집중 · 타인 | `[지원하기]`(타이머·한도·중복 가드 + 사유), 지원 완료 시 "지원 완료 · 채택 대기" 비활성, 잠금 패널 동일, 지원자 리스트(채택 버튼 없음) |
| 진행중/보완요청 · 요청자 | `[수정]` `[삭제]` 잠금(툴팁 "진행중·완료 상태에서는 수정/삭제할 수 없어요"), 채택된 작업자 스트립 + `[팀즈 대화하기 · 업무 인수인계]`, 제출 결과물 카드(최신 버전, "검수 대기" 배지, 본문·첨부), 작업자 별점(`worker-rating`), 반려 카운터 `반려 n/2`(`reject-count`), reviewPending이면 `[반려 (보완 요청)]`(2/2면 비활성 + D45 툴팁) `[퀘스트 완료 (승인)]`(→ 별점 모달 §8.14) + 안내 "승인 즉시 작업자에게 100 P + 현상금 B P, 별점에 따라 50–150 EXP가 지급돼요", aside: 진행 상태 타임라인 — ref07 |
| 진행중/보완요청 · 작업자 | 같은 스트립(상대 = 요청자) + 팀즈 버튼, 반려 카운터 `반려 n/2`(`reject-count`, D46 — 요청자가 NPC인 q4는 이 화면으로 검증), **결과물 에디터 열림**(success 배지 "결과물 에디터 열림") + 첨부(D22) + `[결과물 제출하기]`(reviewPending=true면 비활성 "검수 대기 중이에요"), 보완요청이면 반려 사유 박스(revise 색) 상단 표시 |
| 진행중/보완요청 · 제3자 | 읽기 전용(제출 이력 비공개, "진행중인 퀘스트예요") |
| 완료 · 누구나 | 상태 배지 완료, 최종 승인 버전, 보상 지급 내역("{작업자} · +{100+B} P · +{RATING_EXP[stars]} EXP · 별 {stars}개", 별은 Lucide `star` 아이콘 + 숫자. 시드: q2 = "+200 P · +125 EXP · 별 4개", q1 = "+300 P · +150 EXP · 별 5개"), 수정/삭제 잠금 |

반려 모달: 사유 textarea(≥5자), `[반려하기]`. 
- AC-8.7.1 채택 전 작업자 에디터는 모든 사용자에게 `data-locked="true"`이며 입력 불가.
- AC-8.7.2 채택은 1명만: 채택 즉시 다른 `[채택하기]` 버튼이 사라지고 상태가 `진행중`, 수정/삭제 잠금.
- AC-8.7.3 반려 → 상태 "진행중 · 보완요청", 작업자 화면에 사유 표시, 재제출 가능, 재제출 후 v2 표시.
- AC-8.7.4 승인 → **별점 모달**(§8.14)에서 별점 선택·확인 → **하이퍼 프레임 B** 1,800ms(±150ms) → 상태 완료, 작업자 +100+B P · +RATING_EXP[별점] EXP(별 3개 = +100), `completedToday +1`, 작업자 별점 평균 갱신.
- AC-8.7.5 일일 한도(D12)와 타이머(§6.6) 가드가 버튼 비활성 + 사유 라벨 + 툴팁으로 표현된다.
- AC-8.7.6 팀즈 버튼은 요청자·작업자에게만, 진행중·보완요청·완료 상태에서만 보인다.

### 8.8 하이퍼 프레임 오버레이 — `refs/08_hyperframe_complete.png`, `motion/officequest_intro.html`
`<HyperFrame variant="post|clear">`, React Portal, `position:fixed; inset:0; z-index:9999`, 백드롭 D4, 포인터 차단, **1,800ms 후 자동 닫힘**(fade-out 1,500–1,800ms), 닫힌 후 언마운트. 타임라인은 DESIGN §9.4 A/B 표를 따른다.
- **A (등록)**: 게시판 + 캐릭터(현재 페르소나 티어) + 양피지 스크롤 투척·핀 고정 + 빛 폭발 + 별/코인 파티클 + "QUEST POSTED!" + "퀘스트가 게시판에 등록되었습니다 · 현상금 B P 에스크로 보관".
- **B (완료)**: 슬라임 보스 + HP 바 + 작업자 캐릭터 대시 + 보라 검기 아크 + "CRITICAL!" → "-9,999" + 파편 + 코인·젬 분수 + 보상 카드 3장(`+100 P 기본 보상`, `+B P 현상금`, `+{RATING_EXP[s]} EXP 경험치` + 그 아래 별 s개(Lucide `star`, `hyperframe-stars[data-stars=s]`)) + 레벨이 올랐으면 "LEVEL UP!" + "{작업자} · {티어} Lv.a → Lv.b"(아니면 "QUEST CLEAR!") + 하단 "퀘스트 완료 승인 · 보상이 {작업자}에게 즉시 지급되었습니다 · 1.8초 후 자동 닫힘".
- 파티클: 단일 캔버스, 상한 120개, 시드 고정 난수(mulberry32), 정수 픽셀 스냅. reduced-motion: 정적 결과 카드(같은 1,800ms 유지 — D28).
- AC-8.8.1 열림부터 닫힘까지 1,650–1,950ms(테스트 허용 오차). 측정은 `performance.now()` 기반(D38): 앱의 `__OQ_TEST__.hyperframes[].openedAt/closedAt` 차이 **그리고** 테스트(Node) 쪽 visible→hidden 경과 ≤ 2,400ms. `data-testid="hyperframe"`, `data-variant`.
- AC-8.8.2 동시에 두 개가 열리지 않는다(큐잉). 오버레이 중 키보드 포커스는 오버레이에 갇히고 ESC로 닫히지 않는다(시연 임팩트 보장).
- AC-8.8.3 (SHOULD) 프레임 드랍 없음: 오버레이 1.8초 동안 rAF 콜백 수 ≥ 80(`__OQ_TEST__.hyperframes[].frames`)을 Audit에 기록. 게이트·DoD 대상 아님.

### 8.9 효성마을 목록 `/village` — `refs/09_village_market_dark.png`
좌측 사이드바(효성마을 타이틀 + "사내 포인트 중고거래 마켓", `[+ 중고물품 글 등록]`, "사업장별 마을": **전체 마을 모아보기(기본)** + 6개 마을 각 카운트, 하단 "내 거래 현황" 박스: 판매중 n · 예약중 n · 거래완료 n / 구매 요청 n건 · 보유 n P — 클릭 시 거래 내역 드로어). 본문: 헤더 "포인트로 사고, **나누고, 순환하고.**", 검색 "물품명, 마을, 판매자 검색", 정렬(최신순/인기순/낮은 가격순), 분류 칩(전체 + 5종 + 카운트), 토글 칩 `거래가능만`, `무료나눔`. 4열 카드 그리드(DESIGN §7.11: 썸네일 픽셀 아이콘, 마을 배지, 상태 배지, 사진 수 "1/3", 분류·판매 방식, 제목, 가격 또는 무료나눔, Lucide `heart` 좋아요 수(토글), Lucide `eye` 조회수, 판매자·부서).
- AC-8.9.1 시드 8개가 ref09 순서·값으로 보인다. 6개 마을 각 탭이 해당 마을만 보여주고 카운트가 맞다(마포 2, 회현 1, 반포 1, 수서 1, 창원 1, 울산 2).
- AC-8.9.2 좋아요 클릭 → 페르소나별 토글, 카운트 ±1, 팝 애니메이션. 다른 탭에도 실시간 반영.
- AC-8.9.3 타이머 00:00:00에서도 목록·등록·구매·좋아요가 모두 동작한다.

### 8.10 물품 등록·수정 `/village/new`, `/village/[id]/edit`
필드: 마을 셀렉트(6), 분류(5), 거래 방식 세그먼트(포인트 판매 + 가격 입력 / 무료 나눔 0 P), 제목, 리치 에디터(§8.4와 같은 컴포넌트), **사진 다중 등록**: 프리셋 8종 원클릭 추가(모니터·머그·도서·게임패드·키보드·조끼·티켓·의자 픽셀 스프라이트를 `toDataURL`로 생성, 외부 이미지 없음) + 로컬 이미지 업로드 Base64 미리보기(≤2MB, ≤5장, 썸네일 삭제 버튼). `[등록하기]` → 상세로 이동. 보안서약서는 요구하지 않음.
- AC-8.10.1 등록한 물품이 전체/해당 마을 탭 맨 앞에 나타난다(최신순).
- AC-8.10.2 무료 나눔 선택 시 가격 입력 비활성·0 고정, 카드에 "무료나눔"(success 색).

### 8.11 물품 상세 `/village/[id]` — `refs/10_village_detail_orgchart.png`(배경 화면)
좌: 대형 썸네일(마을 배지) + 사진 썸네일 스트립. 우: 브레드크럼(효성마을 › 마을 › 분류), 상태 배지, 제목, 가격(900/40), 좋아요(Lucide `heart`)·조회(Lucide `eye`)·등록 시각, 판매자 카드(아바타·티어·부서·마을), 본문, CTA(§7.3), `[판매자와 팀즈 대화하기]`(판매자 외), 판매자 패널(판매자만), 거래완료 시 **정산 패널**(구매자·판매자 카드, 증감 −/+ 표시, 원장 행 "거래완료 · 품목 · 금액 · 양측 거래 내역 기록"; 코인 이동 애니메이션 SHOULD).
- AC-8.11.1 경로 A: 구매자 `[샀어요]` → 판매자에게 토스트·알림·상세의 "구매 확인 요청" 카드 → 판매자 `[거래 승인]` → 거래완료, 구매자 −X, 판매자 +X, 양측 Tx.
- AC-8.11.2 포인트 부족 → 경고 모달(정확한 문구), 상태·포인트 변화 없음.
- AC-8.11.3 경로 B: 판매자 → 상태 변경 메뉴 → 조직도 → 예약자 지정 → 적용 → `예약중`; 지정자 외 페르소나에게 `[샀어요]` 비활성 + 정확한 문구; 지정자는 활성.
- AC-8.11.4 경로 B': 조직도 → 최종 구매자 지정 → 적용 → 즉시 거래완료 + 정산.
- AC-8.11.5 무료나눔 거래완료 시 양측 Tx에 `0 P` 기록.
- AC-8.11.6 상세 진입마다 조회수 +1.

### 8.12 가상 Teams 채팅 `VirtualTeamsChat` — `refs/07_quest_detail_inprogress_teams.png` 우하단
우하단 플로팅 420×560, z 800, DESIGN §7.9. 헤더 `#464775`(Teams 타일 "T", 상대 아바타 + 초록 온라인 점, 이름, "부서 · 마을 · 대화 가능", 맥락 배지 "업무 인수인계"/"중고거래", 최소화·닫기). 첫 메시지 = 시스템 pill(예: "업무 인수인계 · 3분기 원가 분석 엑셀 매크로 요청"). 입력바(Enter 전송, 빈 문자열 전송 불가).
- **자동 응답**: 전송 직후 "{상대 이름}님이 입력 중입니다..." 인디케이터(점 3개) **1,200ms** → 맥락별 한국어 답장 1개. 키워드 규칙(첫 일치, 없으면 기본 문구를 대화 내 순번으로 순환):

| 맥락 | 키워드(정규식) | 답장 |
|---|---|---|
| handover | `파일\|자료\|링크\|첨부` | "SharePoint 링크로 올려두었어요. 권한 문제 있으면 바로 말씀 주세요." |
| handover | `마감\|언제\|일정\|시간` | "마감 전까지 v1 먼저 드리고, 피드백 반영해서 마무리할게요." |
| handover | `수정\|반려\|보완\|피드백` | "확인했습니다! 말씀하신 부분 보완해서 다시 제출할게요." |
| handover | (기본) | "네, 확인했습니다. 진행 상황 바로 공유드릴게요." / "인수인계 감사합니다. 궁금한 점 생기면 여쭤볼게요." |
| market | `네고\|깎\|할인\|에누리` | "조금은 가능해요! {가격−10%(10단위 내림)} P 어떠세요?" (무료나눔이면 "나눔이라 그냥 가져가시면 돼요!") |
| market | `어디\|장소\|직거래\|로비\|만나` | "{판매자 사업장} 1층 로비에서 점심시간 12:30 어떠세요?" |
| market | `언제\|시간\|오늘\|내일` | "오늘 퇴근 전이나 내일 점심 모두 괜찮아요." |
| market | (기본) | "관심 가져주셔서 감사해요! 상태 아주 좋아요." / "[샀어요] 눌러주시면 바로 승인할게요." |

- AC-8.12.1 전송 → 인디케이터 표시 → 1,200ms(±200ms, `performance.now()` 기준 D38) 후 인디케이터 사라지고 답장 **정확히 1개** 도착(StrictMode에서도 — `pendingReplyFor` 가드).
- AC-8.12.2 대화는 스레드 키별로 DB에 저장되어 다시 열면 유지된다.

### 8.13 그룹웨어 조직도 모달 `OrgChartModal` — `refs/10_village_detail_orgchart.png`
lg 모달. 헤더 "그룹웨어 조직도" + "예약자 / 최종 구매자 지정 · {물품명} · {가격} P". 좌측 사업장 트리(마포 본사·회현·반포·수서·창원공장·울산공장 + 표시 인원, 펼침/접힘, 부서 노드). 우측: 검색(이름·사번·부서 실시간 부분일치, 대소문자 무시), 필터 칩 `구매 가능({가격} P 이상)만` SHOULD, 직원 행(아바타, 이름, 티어 배지, 사번·사업장·부서, 보유 P, `[예약자 지정]` `[최종 구매자 지정]`; 판매자 본인 제외; 포인트 부족 시 두 버튼 비활성 + 툴팁 D17), 선택 행 강조("예약자 지정됨"). ※ ref10의 "관심 표시 · 팀즈 문의 직원" 필터 칩과 "…직원 6명" 안내 문구는 **MAY(미구현 허용)**이며 Visual QA 대상이 아님. 하단 안내 바("{이름}을(를) 예약자로 지정 → 상태가 예약중으로 바뀌고, 다른 직원의 [샀어요] 버튼은 비활성화돼요.") + `[취소]` `[적용하기]`.
- AC-8.13.1 검색어 "HS2203" → 강창원 1명만 표시. "생산기술" → 이퀘스트·한울산.
- AC-8.13.2 선택만으로는 상태가 바뀌지 않고 `[적용하기]` 시 커밋.

### 8.14 별점 모달 `RatingModal` (ref 없음 — DESIGN §7 모달, D53)
sm–md 모달. 헤더 "결과물 품질 평가" + 작업자 아바타·이름·현재 별점 평균. 별 5개 버튼(Lucide `star`, 44px 터치 영역, `role="radiogroup"`, 각 `role="radio"` `aria-checked`, ←/→ 키로 이동), 선택 전 안내 "별점을 선택해 주세요", 선택 후 미리보기 `+{100+B} P · +{RATING_EXP[s]} EXP`(`rating-exp-preview`)와 매핑 표("별 1개 50 · 별 2개 75 · 별 3개 100 · 별 4개 125 · 별 5개 150 EXP", 각 항목 앞 Lucide `star` 아이콘 가능). 푸터 `[취소]` `[별점 주고 승인]`(`rating-confirm`, 선택 전 비활성 + 사유 "별점을 선택해야 승인할 수 있어요").
- AC-8.14.1 승인 버튼 클릭 시 모달이 열리고 별점 선택 전에는 확인 버튼이 비활성이다. 취소/ESC → 상태·포인트·EXP 변화 없음.
- AC-8.14.2 각 별점 s에 대해 작업자 EXP 증가 = RATING_EXP[s](단위 테스트 5건), 포인트 증가 = 100 + B(별점 무관).
- AC-8.14.3 별 5개 승인(E2E, `ref07`): lee 650 → **800 EXP(Lv.9)**, 300 → **700 P**, 하이퍼 프레임 B 보상 카드 "+150 EXP"·`data-stars=5`, "LEVEL UP!" "실버 Lv.7 → Lv.9", lee 별점 4.1·8건 → **4.2 · 평가 9건**.
- AC-8.14.4 지원자 행·작업자 스트립·대시보드에 D41 형식의 별점 평균이 보인다(시드: lee "4.1 · 평가 8건", jung "4.5 · 평가 31건", oh "4.0 · 평가 1건").

### 8.15 반려 한도 UI (D45, D46)
- AC-8.15.1 반려할 때마다 `reject-count`가 `반려 1/2` → `반려 2/2`로 바뀐다(시드 q4 = `반려 1/2`).
- AC-8.15.2 두 번째 반려 모달에 "이번이 마지막 반려예요" 경고가 보인다.
- AC-8.15.3 `rejectCount = 2`이고 검수 대기면 `reject-btn` 비활성 + 툴팁 "반려는 퀘스트당 최대 2회예요 · 별점과 함께 승인해 주세요(별 1개도 가능)", `approve-btn`은 활성. 별 1개 승인 시 작업자 +50 EXP, 포인트는 별점 무관 +100+B(`rejectLimit` 시나리오: lee EXP 650 → 700 Lv.8, **300 → 700 P**, 별점 (33+1)/9 = 3.78 → **3.8 · 평가 9건**).

### 8.16 운영자 콘솔 `/admin` (ref 없음 — DESIGN 컴포넌트, Visual QA 제외, D48·D53)
좌측 사이드바(264px, "운영자 콘솔": `의심 활동 n` · `제재 현황 n(활성)` · `감사 로그 n`), 본문 헤더 "운영 모니터링" + 요약 칩(열린 플래그 n · high n · 활성 제재 n). 탭 3개(`admin-tab-{flags|restrictions|log}`, URL `?tab=` 유지):
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
- AC-8.16.7 (v2.3) 해제된 제재 재해제·처리된 플래그 재처리 → `INVALID_STATE`, 로그 추가 없음. 일부 종류가 활성인 2종 제재 → 나머지 종류만 생성. 무혐의 후 새 근거 → 다시 "열림" + "새 근거 n건"(단위 테스트).

### 8.17 제재받은 사용자 화면 (D51, ref 없음)
- AC-8.17.1 `quest_post` 제재 중: `restriction-banner` 표시, `quest-submit`·`board-new-btn` 비활성 + §6.10 사유 툴팁(`disabled-reason`). 지원·제출은 가능.
- AC-8.17.2 `purchase` 제재 중: `buy-btn[data-state=restricted]` 비활성 + 사유, 조직도에서 그 직원의 두 버튼 비활성("구매 제한 중인 직원이에요"). 좋아요·Teams는 가능.

---

## 9. 시드 데이터 (단일 출처: `officequest/src/lib/db/seed.ts`, 첫 실행·스키마 불일치·`[데이터 초기화]` 시 적재)

### 9.1 업무 퀘스트 7건 (모집중 3 · 진행중 1 · 보완요청 1 · 완료 2)
| no | 유형 | 상태 | 제목 | 요청자 | 현상금 | 업무 분야 | 마감 | 등록 | 조회 | 첨부 | 지원자(각오) | 작업자 / 제출 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 7 | 요청 | 모집중 | 3분기 원가 분석 엑셀 매크로 요청 | kim | 300 | 재무·엑셀 자동화 | 2026-10-23 18:00 | 10-21 09:12 | 128 | SP `Q3_원가분석_원본.xlsx` 1.8 MB | lee "오늘 6시 전까지 끝내겠습니다!" · jung "매크로 엑셀 자신 있어요. VBA 경력 5년입니다." · oh "배우면서 꼼꼼히 해보겠습니다." | — |
| 6 | 문의 | 모집중 | 법인카드 해외결제 증빙 기준 문의 | lee | 50 | 재무·엑셀 자동화 | 10-22 18:00 | 10-21 08:40 | 57 | — | kang "규정 문서 위치랑 예시 바로 드릴게요." | — |
| 5 | 요청 | 진행중 | 신입사원 온보딩 교육 PPT 디자인 | jung | 500 | 문서·PPT 디자인 | 10-27 18:00 | 10-20 14:20 | 211 | SP `온보딩_교육자료_초안.pptx` 4.2 MB | park(채택) · choi · kang · oh | park / 제출 없음 (park 2/2 → 한도 시연) |
| 4 | 요청 | 보완요청 | 울산공장 설비 점검표 양식 자동화 | han | 400 | 생산·품질 | 10-24 18:00 | 10-19 10:05 | 143 | SP `설비점검표_양식.xlsx` 0.9 MB | lee(채택) · kang | lee / v1 반려 "점검 항목 12번이 누락됐어요. 체크박스 서식도 맞춰 주세요." |
| 3 | 문의 | 모집중 | Power BI 대시보드 공유 권한 설정 문의 | kang | 150 | 데이터·BI | 10-26 18:00 | 10-19 16:40 | 34 | — | (없음) | — |
| 2 | 문의 | 완료 | SAP 전표 역분개 오류 해결 방법 문의 | oh | 100 | 재무·엑셀 자동화 | 10-17 | 10-17 09:30 | 96 | — | kim(채택) · lee | kim / v1 승인 10-17 15:10 |
| 1 | 요청 | 완료 | 사내 뉴스레터 10월호 원고 교정 | park | 200 | 문서·PPT 디자인 | 10-15 | 10-15 10:00 | 302 | SP `뉴스레터_10월호.docx` 0.6 MB | jung(채택) · choi · kang · oh · han | jung / v1 승인 10-15 17:20 |
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

### 9.7 시드 기준 기대 플래그 (`detectFlags`, now = 2026-10-21 14:02:48, 정렬 §6.11) — 3개 사례 · 4건 (v2.3, D58·D59 적용 후 재계산)
| 순서 | id | 규칙 | 심각도 | 대상 | 근거 |
|---|---|---|---|---|---|
| 1 | `fast_high_bounty__A-107` | R4 | high | jung, han | rt9 (800 P, 12분) |
| 2 | `reciprocal__han__jung` | R2 | high | han, jung | rt6·rt7·rt8·rt9 |
| 3 | `market_pair__choi__jung` | R5 | medium | choi, jung | 구매 Tx 3건, 합계 2,400 P |
| 4 | `pair_5star__choi__kang` | R3 (`alsoMatched` = R1) | medium | choi, kang | rt3·rt4·rt5 |
- 순서 근거: high 먼저 → `lastAt` 내림차순(rt9 10-20 09:12로 둘이 같음 → id 오름차순) → medium: market 10-20 12:15, 그 다음 `pair_5star__choi__kang`(rt5 10-19 16:40). `pair_repeat__choi__kang`은 D59로 생성되지 않음. 비대상: park→jung·oh→kim 각 1건, kang↔han 거래 1건 600 P(D58로도 미성립).
- 페르소나(kim·lee·park)와 관련된 플래그는 0건(시연 페르소나는 깨끗한 상태로 시작).
- **수명**(시드 적재 후 시간이 흐를 때, 스크립트로 계산, D61): +6.04일(10-27 15:00, rt6 이탈) → 3건(reciprocal 소멸) · +7.10일(10-28 16:20, rt3 이탈) → 2건 · +7.92일(10-29 12:10, A-m1 이탈 → 2건 1,600 P) → 1건 · +12.80일(11-03 09:12) → 0건. 그래서 시연 당일엔 `[데이터 초기화]` 후 시작합니다.

---

## 10. 비기능 요구사항
| 항목 | 요구 |
|---|---|
| 실시간 동기화 | 모든 DB 변경은 `localStorage['oq:v1:db']`에 저장 후 `BroadcastChannel('oq-sync')`로 `{ type:'db', rev }` 방송. 미지원 시 `storage` 이벤트 + `window.dispatchEvent(new CustomEvent('oq:db'))` 폴백. 같은 탭 컴포넌트는 Context로 즉시 반영. 두 번째 탭은 300ms 이내 반영 (MUST) |
| 영속성 | 새로고침 후 모든 상태 유지. `schemaVersion` 불일치·JSON 파싱 실패 시 시드 재적재 + 토스트 |
| SSR 안전 | `window`/`localStorage`/`BroadcastChannel`/`canvas` 접근은 `useEffect` 또는 `typeof window` 가드 안에서만. 하이드레이션 경고 0건 |
| 접근성 | 모든 아이콘 버튼 `aria-label`, 모달 `role="dialog" aria-modal`, 포커스 링(`--sh-focus`), 비활성 사유는 `aria-describedby`로 연결, 대비 WCAG AA(본문) |
| 모션 | DESIGN §9 토큰만 사용. `prefers-reduced-motion` 폴백(DESIGN §9.6) |
| 성능 | 콘솔 에러 0건, 404 리소스 0건 (MUST, `00-smoke`). 대시보드 첫 렌더(하이드레이션 후) 1초 이내는 **SHOULD**: `performance.getEntriesByType('navigation')[0]` → `data-hydrated` 시점 차이를 Audit에 기록 |
| 외부 의존 | 런타임 네트워크 요청은 Paperlogy CDN(폰트)뿐. 이미지·스크립트 외부 URL 금지 |
| 브라우저 | 최신 Chrome/Edge(1순위), Safari/Firefox(깨지지 않을 것) |

---

## 11. 정식 E2E 시나리오 (원본 PRD DoD §4의 전체 플로우 · 기대 수치 포함)

전제: 시드 상태, 고정 시각 2026-10-21 14:02:48 KST(Playwright `clock.setFixedTime` — `Date`만 고정, 타이머·`performance.now()`는 진행), 라이트 모드, 페르소나 kim. 하이퍼 프레임 시간은 D38 방식으로 측정.

| 단계 | 행동 | 기대 결과 |
|---|---|---|
| 1 | kim: `/quests/new` → 요청, 제목 "E2E 원가 매크로 요청", 업무 분야 "재무·엑셀 자동화", 마감 2026-10-23 18:00, 본문 20자+, 현상금 300, 파일 `e2e_원본.xlsx` 첨부 → 등록 → 서약 3개 동의 → `[동의 후 등록]` | SharePoint 배지 URL 정확, kim 1,500 → **1,200 P**, 하이퍼 프레임 A 1.8초 후 닫힘, `/quests/board` 맨 위 no.8 모집중 |
| 2 | 페르소나 → lee, no.8 상세 → `[지원하기]` → 서약 3개 + 각오 "바로 처리하겠습니다" → `[동의 후 지원]` | 지원자 1명, 버튼 "지원 완료 · 채택 대기", 에디터 잠금 |
| 3 | 페르소나 → kim, no.8 → lee `[채택하기]` | 상태 진행중, 수정/삭제 잠금, 팀즈 버튼 표시 |
| 4 | 페르소나 → lee → 결과물 본문 입력 + `e2e_결과.xlsx` 첨부 → `[결과물 제출하기]` | v1 제출, "검수 대기" |
| 5 | 페르소나 → kim → `[반려 (보완 요청)]` → 사유 "표 서식 보완 부탁드려요" | 상태 "진행중 · 보완요청", `reject-count` **반려 1/2** |
| 6 | 페르소나 → lee → 사유 확인 → 재제출 | v2, 상태 진행중(검수 대기) |
| 7 | 페르소나 → kim → `[퀘스트 완료 (승인)]` → 별점 모달에서 **별 3개**(`rating-star-3`) → `[별점 주고 승인]` | 하이퍼 프레임 B(LEVEL UP!, 실버 Lv.7 → Lv.8, 보상 "+100 EXP", `data-stars=3`) 1.8초 후 닫힘, 상태 완료. lee: **300 → 700 P**, EXP 650 → 750(Lv.8), 오늘 완료 1/2 → **2/2**, 별점 4.1·8건 → **4.0 · 평가 9건** |
| 8 | kim → 효성마을 → m4 게임 패드(1,200 P) → `[샀어요 · 구매 요청]` | 버튼 "구매 요청 완료 · 판매자 승인 대기", kim 여전히 1,200 P |
| 9 | 페르소나 → lee → m4 → 구매 확인 요청 카드 `[거래 승인]` | m4 거래완료, lee **700 → 1,900 P**, kim **1,200 → 0 P**, 양측 거래 내역에 각 1행 |
| 10 | 콘솔 에러 수 확인 | 0건 |

---

## 12. 완료 조건 요약 (상세 명령은 Harness §9)
1. 시드: 퀘스트 7건(모집중·진행중·보완요청·완료 분포), 물품 8건(6개 마을 전부, 거래가능·예약중·거래완료·무료나눔 포함) — 첫 화면이 비어 있지 않음.
2. `DUAL_BRAIN_AUDIT.md`: Phase별 중간 감리 + 최종 감리(좌뇌: 포인트 차감/환불, 일 2회 한도, 2시간 타이머, 예약자 전용 구매, 문의/요청 첨부 분기, 타입 무결성 / 우뇌: Paperlogy, 보라 라이트·다크, 벤토, 도트 하이퍼 프레임 품질, 빈 화면·깨진 UI).
3. `npm run build`, `npm run lint`, `npm run typecheck` 에러 0건(ESLint 경고도 0).
4. `npm run test:unit`, `npm run test:e2e`(§11 전체 플로우 포함) 전부 통과.
5. Visual QA(Harness §6) 10장 **DOM 단언** 전부 PASS(구도 체크는 기록, 최대 2회 수정 후 `unresolved` 허용).
6. v2.2 기능: 별점 매핑 5종 단위 테스트, 반려 한도, 운영자 콘솔·제재(Harness `14`·`15` 스펙) 통과.
7. 환경 차단(브라우저·레지스트리)으로 실행할 수 없는 명령은 Harness §9 "조건부 완료" 규칙을 따른다.

---

## 변경 이력

| 버전 | 날짜 (KST) | 변경 | 리뷰 항목 |
|---|---|---|---|
| v2.1 | 2026-10-21 | §0.1에 `skills/SOURCES.md`, dual-brain 최소 구성(SKILL.md + README.ko.md), `source/` 추가 | 검수봇 차단-1 · 분석봇 차단(skills/dual-brain 없음) |
| v2.1 | 2026-10-21 | D38 신설: 경과시간은 `performance.now()`, 도메인 시각은 `clock.now()`. AC-8.8.1·8.12.1·§11 전제에 반영 | 검수봇 차단-2 · 분석봇 차단(고정 시각에서 0ms) |
| v2.1 | 2026-10-21 | AC-8.1.4 측정 방법(`clock.install` + `runFor(3000)`) 명시 | 검수봇 높음-1 · 분석봇 차단(AC-8.1.4 이동 제안) |
| v2.1 | 2026-10-21 | ⚡ ♥ 👁 → Lucide `zap`·`heart`·`eye`(D11·D21·§8.1·§8.2·§8.9·§8.11), §0.3에 기호 표기 규칙 | 검수봇 높음-3 · 분석봇 높음(이모지 규칙 충돌) |
| v2.1 | 2026-10-21 | §0.3 MUST AC ↔ Harness §5.2 매핑 표 규칙, SHOULD AC는 게이트 제외 | 검수봇 높음-4 |
| v2.1 | 2026-10-21 | AC-8.1.2(200ms)·AC-8.8.3(fps)·§10 성능(1초)을 SHOULD + 측정법으로 | 검수봇 보통-2 · 분석봇 보통(주관 판정이 MUST) |
| v2.1 | 2026-10-21 | §8.3 미달성 = 활성 `daily-go-{k}`, `daily-claim-{k}`는 수령 버튼만 | 검수봇 보통-3 |
| v2.1 | 2026-10-21 | §6.2 "B=0이면 기록하지 않음" | 검수봇 보통-4 |
| v2.1 | 2026-10-21 | §6.7·AC-8.2.3 시즌 라벨(Season 2)과 획득 배지(Season 1) 분리 | 검수봇 보통-5 |
| v2.1 | 2026-10-21 | D31–D34(Teams 문구·슬라임·카드 패딩·스프라이트 크기) | 검수봇 보통-6 |
| v2.1 | 2026-10-21 | D35(DESIGN 낡은 값 → DESIGN v1.1에서 정정), D36(video_stills 없음·모션 경로) | 검수봇 보통-7·8 · 분석봇 보통(DESIGN 낡은 수치) |
| v2.1 | 2026-10-21 | 표 안의 `\|` 이스케이프(§1.3, D10, §8.12 키워드 표) | 검수봇 보통-9 |
| v2.1 | 2026-10-21 | `TeamsThread.pendingReplyFor` + `teams/reply` 가드 | 검수봇 보통-11 |
| v2.1 | 2026-10-21 | §8.13 ref10 "관심 표시" 칩 = MAY, Visual QA 제외 | 검수봇 보통-12 |
| v2.1 | 2026-10-21 | D37 시즌 진행률 `Math.ceil` → 78% | 분석봇 보통(78 vs 77) |
| v2.1 | 2026-10-21 | D2에 tokens.css "포커스 보조" 주석 무시 | 분석봇 보통(시안 주석) |
| v2.1 | 2026-10-21 | §11 1단계에 업무 분야·마감 지정 | 분석봇 보통(필수 입력 누락) |
| v2.1 | 2026-10-21 | D39 TinyMCE 5.10.2 유지 + Audit 사유 기록 | 분석봇 보통(5.10.9 존재) |
| v2.1 | 2026-10-21 | D6에 DESIGN v1.1 264px 정정 반영 | 분석봇 높음(사이드바 280 vs 264) |
| v2.1 | 2026-10-21 | §12에 Visual QA 판정 범위·조건부 완료 추가 | 분석봇 보통 · 검수봇 높음-6 |
| v2.2 | 2026-10-21 | 품질별 보상: 승인 시 별점 1–5 필수, EXP 50/75/100/125/150, 기본 P·현상금 불변(D40·D43), 별점 평균 누적·표시(D41·D42, §4.4 시드 D44), 별점 모달 §8.14, 하이퍼 프레임 별 표시, §11 7단계 = 별 3개(수치 불변) | 팀원 피드백 1 |
| v2.2 | 2026-10-21 | 반려 퀘스트당 최대 2회, 이후 승인(별 1개도 가능)만, `반려 n/2` 카운터, 마지막 반려 경고(D45·D46, §6.9, §8.15, §7.1) | 팀원 피드백 2 |
| v2.2 | 2026-10-21 | 운영자 페르소나 `ops`(D47), `/admin` 콘솔(D48, §8.16), 의심 활동 규칙 5종(D49, §6.11), 제재 등록/구매 제한·기간·해제·감사 로그(D50·D51, §6.10, §8.17), 아카이브 시드 3사례 5플래그(D52, §9.5–9.7), 새 UI는 DESIGN 컴포넌트·Visual QA 제외(D53) | 팀원 피드백 3 |
| v2.3 | 2026-10-21 | 별 문자(U+2605)를 UI 문자열·예시에서 모두 제거: D45·AC-8.15.3 툴팁 "(별 1개도 가능)", §8.14 매핑 표 "별 1개 50 … 별 5개 150 EXP", §6.11 근거 예시 "별점 5", R3 규칙명 "특정 쌍 만점 독점", §0.3 기호 규칙에 별 추가, 본문 표기 "별 N개"로 통일 | 검수봇 v2.2 높음-1 |
| v2.3 | 2026-10-21 | §8.7 작업자 행에 반려 카운터 `반려 n/2`(`reject-count`) | 검수봇 v2.2 보통-1 |
| v2.3 | 2026-10-21 | §6.9·D45: 반려 2/2 + 작업자 완료 2/2 겹침 시 D12 우선, 다음 날 승인 가능 | 검수봇 v2.2 보통-2 |
| v2.3 | 2026-10-21 | §8.7 완료 화면 보상 문구 `+{RATING_EXP[stars]} EXP`(시드 q2 +125, q1 +150) | 검수봇 v2.2 보통-3 |
| v2.3 | 2026-10-21 | AC-8.15.3 별 1개 승인 기대값 추가: lee 300 → 700 P, 3.8 · 평가 9건 | 검수봇 v2.2 보통-5 |
| v2.3 | 2026-10-21 | 제재 상태 우선순위 `lifted` > `expired` > `active`(D54, §6.10, 시드 r1 = lifted) | 분석봇 v2.2 높음(상태 우선순위) |
| v2.3 | 2026-10-21 | `admin/lift`·`admin/dismissFlag`·flagId 제재의 멱등 가드 `INVALID_STATE`(D57, §5 액션 규칙, AC-8.16.7) | 분석봇 v2.2 높음(멱등성) |
| v2.3 | 2026-10-21 | 2종 제재 중 일부 활성 → 나머지 종류만 생성, 전부 활성일 때만 `INVALID_STATE`, `ALREADY_RESTRICTED` 폐지, 모달 비활성 사유(D55) | 분석봇 v2.2 높음(부분 제재) |
| v2.3 | 2026-10-21 | 제재 id = kinds 정규 순서로 부여(kim r3 = 등록, r4 = 구매), 행 `data-kind`·`data-user`(D56) | 분석봇 v2.2 높음(id 결정성) |
| v2.3 | 2026-10-21 | 만료 시 `useNow(1000)`로 재평가(§6.10), 시각 표기는 `Intl` + `Asia/Seoul` 고정 | 분석봇 v2.2 보통(만료 재렌더 · 시간대) |
| v2.3 | 2026-10-21 | 시드 신선도 경고 `admin-stale-seed`·`SEED_STALE_DAYS`, 시연 당일 초기화, §9.7 플래그 수명 표(D61) | 분석봇 v2.2 보통(시드 수명) |
| v2.3 | 2026-10-21 | 처리된 플래그 재발: FlagState `lastAt`·`evidenceCount`, `newEvidence`(D60) | 분석봇 v2.2 보통(재발 누락) |
| v2.3 | 2026-10-21 | R5 = 0 P 제외 + (≥3건 또는 ≥2건·합계 ≥2,000)(D58), R3이 R1 흡수(`alsoMatched`, D59) → 시드 플래그 **5 → 4건** 재계산(§9.7, AC-8.16.2), R4 시연 메모 | 분석봇 v2.2 보통(오탐·중복) |
| v2.3 | 2026-10-21 | 별점 집계 ↔ 원장 관계와 맞춰야 할 불변식 3개(§6.8) | 분석봇 v2.2 보통(집계·원장) |
| v2.4 | 2026-10-21 | 효성 브랜드 팔레트: D2 갱신(시안 폐지 → `--live-dot`), D62 신설(브랜드 토큰·보상 옐로 규칙·refs보다 토큰 색 우선), §6.6 라이브 점 문구 | 팀 요청(효성 공식 팔레트) |
| v2.0 | 2026-10-21 | 최초 Autopilot 제출본 | — |
