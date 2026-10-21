# 🛡️ [AGENT HARNESS] 오피스퀘스트 (Office Quest) & 효성마을 Autopilot 실행 규약 · v2.4

이 문서는 GitHub Copilot Agent Mode(Autopilot)가 **오피스퀘스트 & 효성마을**을 사람의 개입 없이 끝까지 구현·검증하기 위한 **최상위 실행 제어 하네스(Execution Harness)**입니다. 에이전트는 모든 코드 생성, 상태 관리, UI 렌더링, 테스트 과정에서 이 문서의 규칙을 지켜야 합니다.

- **무엇을 만드는가**는 `PRD.md`(결정 테이블 §2 포함)가, **어떻게 보이는가**는 `DESIGN.md` · `tokens.css` · `refs/01–10`이, **어떻게 만들고 검증하는가**는 이 문서가 정합니다.
- 원본 하네스의 §1(기술 스택) · §2(인라인 스킬) · §3(Subagent) 구조를 유지하고, §0과 §4–§11, 부록 A(검증된 설정 파일)를 추가했습니다.
- v2.1: 검수봇·분석봇 검토 반영. 설정·명령은 스크래치 프로젝트에서 실제 실행으로 검증했습니다(§1.5 검증 기록, 맨 끝 **변경 이력**).
- v2.2: 팀원 피드백 3건(별점 품질 보상 · 반려 최대 2회 · 운영자 모니터링 & 제재, PRD D40–D53). 기존 게이트·명령은 그대로이며 Phase **P5b**와 E2E `14`·`15`가 추가됐습니다.
- 이 문서의 어떤 단계에서도 **사용자에게 질문하지 않습니다.** 모호하면 §8 "묻지 말고 이렇게 결정" 표를 따르고, 표에 없으면 PRD → DESIGN → refs 순으로 근거를 찾아 결정한 뒤 `DUAL_BRAIN_AUDIT.md`에 기록합니다.

---

## 0. 시작 절차 (Autopilot이 가장 먼저 할 일)

1. 저장소 루트에서 다음 순서로 **전부** 읽습니다: `PRD.md` → `Harness.md`(이 문서) → `DESIGN.md` → `tokens.css` → `refs/01–10_*.png`(이미지로 확인) → `skills/dual-brain/SKILL.md` → `skills/SOURCES.md`.
   - **MISSING 규칙**: 이 목록이나 이 문서가 가리키는 파일(예: `skills/dual-brain/references/memory.md`, `references/runtime.md`, `source/mock/*`)이 없으면 **건너뛰고** `DUAL_BRAIN_AUDIT.md`에 `MISSING: <경로> → 적용한 대체 규칙`을 한 줄 기록한 뒤 계속합니다(§7 B21). 없는 파일을 만들거나 내려받지 않습니다.
   - `skills/dual-brain/`의 최소 구성은 `SKILL.md` + `README.ko.md`입니다. 사용자 저장소 원본(dual-brain-main)이 통째로 있으면 그 안의 `references/*.md`도 사용합니다.
2. 루트에 `.github/copilot-instructions.md`를 만들고 아래 내용을 그대로 넣습니다(이후 모든 Copilot 세션이 같은 규칙을 로드하도록).
   ```md
   # Office Quest Autopilot
   - Spec: PRD.md (decisions §2 win). Process/verification: Harness.md. Visuals: DESIGN.md + tokens.css + refs/.
   - App lives in ./officequest (Next.js 15.5 App Router, TS strict, Tailwind 3.4). Never upgrade pinned versions.
   - Config files: copy Harness.md Appendix A verbatim (verified 2026-10-21).
   - Never ask the user. Use Harness.md §8 decision table; log every non-trivial decision in DUAL_BRAIN_AUDIT.md.
   - Done only when Harness.md §9 Definition of Done passes (or §9.3 conditional completion).
   ```
3. 루트에 `DUAL_BRAIN_AUDIT.md`(§10 템플릿)와 `.dual-brain/MEMORY.md`(§10.3)를 만듭니다.
4. §4 Phase 0부터 순서대로 진행합니다. **게이트 규칙**:
   - 각 Phase의 Exit Gate를 통과해야 다음 Phase로 넘어갑니다.
   - 같은 게이트 항목이 **5회 연속** 실패하면 §7의 해당 폴백을 적용합니다. 폴백 후에도 실패하면 그 항목을 Audit에 `unresolved`(게이트 항목 · 마지막 오류 3줄 · 재현 명령)로 기록하고 **다음 Phase 진입을 허용**합니다. 이 항목은 §9 DoD에서 다시 검사합니다.
   - 예외: P0의 `typecheck`·`build` 실패는 이후 모든 작업을 막으므로 넘어가지 않고 해결합니다(ENV-BLOCKED만 §9.3으로).
5. 컨텍스트가 길어져 세션이 바뀌면, 새 세션은 `DUAL_BRAIN_AUDIT.md`의 "현재 Phase / 다음 작업" 줄과 `.dual-brain/MEMORY.md` Hot 섹션부터 읽고 이어갑니다.

---

## 1. 기술 스택 및 아키텍처 제약 (Tech Stack Constraints)

에이전트는 임의로 기술 스택을 변경하거나 기능을 축소할 수 없으며, 아래 스펙을 100% 충족해야 합니다.

| 영역 | 기술 스택 및 구현 강제 사항 |
| :--- | :--- |
| **Core Framework** | **Next.js 15.5 (App Router)** + **TypeScript 5.9 (`strict: true`)** + **Tailwind CSS 3.4** + **lucide-react**. 앱 위치는 **`./officequest/`** (PRD D23). `src/` 디렉터리 사용 |
| **Real-time Mock DB** | 백엔드 없이 **React Context + 순수 리듀서 + `localStorage` + `BroadcastChannel`(폴백: `storage` 이벤트 + `CustomEvent('oq:db')`)**. 페르소나 전환·포인트 증감·상태 변경이 새로고침 없이 모든 컴포넌트에 즉시, 다른 탭에는 300ms 이내 반영 (PRD §10) |
| **Rich Text Editor** | **TinyMCE 5.10.2 셀프호스팅**(`tinymce@5.10.2` → `public/tinymce/` 복사, `@tinymce/tinymce-react@6.3.1`의 `tinymceScriptSrc`). Tiny Cloud·API Key 사용 금지 → 경고 배너 0. 실패 시 동일 툴바의 `FallbackEditor`로 자동 전환(§7 B3) |
| **2D Pixel & Motion** | 외부 이미지 URL 금지. **HTML5 `<canvas>` 픽셀 행렬 렌더러 + CSS `@keyframes` + 단일 파티클 캔버스**로 6티어 캐릭터·소품·하이퍼 프레임(정확히 1,800ms)을 코드로 렌더 |
| **Typography** | **Paperlogy** 단일 패밀리. `tokens.css`의 CDN `@font-face` + 앱 `fonts.css`에서 CDN→로컬 순서로 재선언(§7 B4). Tailwind `fontFamily.sans` 기본값 |
| **Design Tokens** | 루트 `tokens.css`를 **수정 없이** `officequest/src/styles/tokens.css`로 복사(바이트 동일, `npm run verify:tokens`로 검사). 앱 전용 치수는 `src/styles/app-layout.css`에서 재정의(PRD D6) |
| **Testing** | Vitest 3.2(순수 로직 단위 테스트) + Playwright 1.64(E2E·Visual QA, Chromium) |

### 1.1 고정 버전 (변경·업그레이드 금지, `--save-exact`)

| 패키지 | 버전 | 비고 |
|---|---|---|
| Node.js | **22.x LTS** 권장 (≥ 20.19 허용) | `.nvmrc` = `22` |
| npm | **10.x 권장**(11.x 동작 확인) | `.npmrc`: `save-exact=true` · npm 11 allowScripts 경고는 B22 |
| next | **15.5.28** | 16.x 금지(`next lint` 제거 등 호환성) |
| react / react-dom | **19.1.10** / **19.1.10** | |
| typescript | **5.9.3** | 7.x(Go 포트) 금지 |
| @types/react / @types/react-dom / @types/node | **19.1.17** / **19.1.11** / **22.20.5** | |
| tailwindcss / postcss / autoprefixer | **3.4.19** / **8.5.31** / **10.6.1** | Tailwind 4 금지(DESIGN §3.7이 v3 config 형식) |
| lucide-react | **1.60.0** | 다른 아이콘 라이브러리 금지 |
| tinymce | **5.10.2** | 원본 PRD 지정 버전(LGPL-2.1). 5.x 최신 패치 5.10.9가 있으나 올리지 않음(PRD D39, Audit에 사유 기록). `npm audit` 경고 무시 |
| @tinymce/tinymce-react | **6.3.1** | React 19 + TinyMCE 5 피어 지원 확인됨 |
| eslint / eslint-config-next / @eslint/eslintrc | **9.39.5** / **15.5.28** / **3.3.7** | Flat config + FlatCompat |
| @playwright/test | **1.64.1** | Chromium |
| vitest | **3.2.7** | |

### 1.2 폴더 구조 (저장소 루트 기준)

```
./PRD.md  ./Harness.md  ./DESIGN.md  ./tokens.css  ./DUAL_BRAIN_AUDIT.md
./.dual-brain/MEMORY.md
./.github/copilot-instructions.md
./refs/01…10_*.png   ./motion/officequest_intro.html   ./skills/…   (읽기 전용 · 수정 금지)
./officequest/
  package.json  package-lock.json  .nvmrc  .npmrc  .gitignore
  next.config.ts  tsconfig.json  tailwind.config.ts  postcss.config.mjs
  eslint.config.mjs  playwright.config.ts  vitest.config.ts
  scripts/
    copy-tinymce.mjs      # node_modules/tinymce → public/tinymce (postinstall)
    fetch-fonts.mjs       # tokens.css의 Paperlogy woff2 URL 6개 → public/fonts/paperlogy/ 같은 파일명 (실패해도 exit 0)
    verify-tokens.mjs     # src/styles/tokens.css === ../tokens.css (바이트 비교)
    check-forbidden.mjs   # §5.5 금지 패턴 검사
  public/
    tinymce/              # 복사본 (.gitignore)
    fonts/paperlogy/      # 있으면 커밋
  src/
    app/
      layout.tsx  globals.css  page.tsx                       # 대시보드
      quests/page.tsx (redirect)  quests/daily/page.tsx  quests/new/page.tsx
      quests/board/page.tsx  quests/[no]/page.tsx  quests/[no]/edit/page.tsx
      village/page.tsx  village/new/page.tsx  village/[id]/page.tsx  village/[id]/edit/page.tsx
      admin/page.tsx                                            # 운영자 콘솔 (PRD §8.16)
      not-found.tsx
    styles/  tokens.css(복사본)  fonts.css  app-layout.css
    lib/
      constants.ts  types.ts  clock.ts  format.ts  rng.ts  sharepoint.ts
      formulas.ts  guards.ts  quest-machine.ts  market-machine.ts  teams-replies.ts
      rating.ts  restrictions.ts  monitoring.ts  admin-machine.ts     # v2.2 (PRD §6.8–6.11)
      brand.ts                       # v2.4: BRAND 상수(캔버스용 효성 7색, tokens.css --hs-*와 동일, DESIGN §3.0)
      db/ seed.ts  scenarios.ts  reducer.ts  persistence.ts  sync.ts  DbProvider.tsx  selectors.ts  useDb.ts
      ui/ UiProvider.tsx  theme-script.ts
      test-hooks.ts
    components/
      ui/        Button Badge Chip Tooltip Modal ConfirmModal Toast Segmented Slider ProgressBar ProgressRing Avatar Skeleton
      shell/     AppShell Gnb NavTabs SessionTimer PointsChip AdminBadge PersonaSwitcher ThemeToggle DebugMenu QuestSidebar VillageSidebar RestrictionBanner
      dashboard/ CharacterCard RankingCard DailyCard FeedCard
      pixel/     sprites.ts PixelSprite.tsx TierAura.tsx ParticleCanvas.tsx particles.ts lightning.ts
      hyperframe/ HyperFrameHost.tsx HyperFramePost.tsx HyperFrameClear.tsx useHyperFrame.ts
      editor/    RichEditor.tsx TinyEditor.tsx FallbackEditor.tsx editor-api.ts
      quest/     QuestForm BountyPanel SharePointBadge AttachmentPicker QuestBoard QuestRow QuestDetail Stepper ApplicantList WorkerPanel SubmissionCard ReviewBar RejectModal RatingModal RatingStars RejectCounter
      modals/    SecurityPledgeModal InsufficientPointsModal
      village/   ItemCard ItemGrid ItemForm PhotoPicker ItemDetail BuyButton SellerPanel SettlementPanel TradeHistoryDrawer
      teams/     VirtualTeamsChat.tsx TeamsHost.tsx
      org/       OrgChartModal.tsx
      admin/     AdminConsole AdminSidebar FlagTable FlagEvidence RestrictModal DismissModal RestrictionTable LiftModal AdminLogTable AdminForbidden
  tests/
    unit/  formulas.test.ts quest-machine.test.ts market-machine.test.ts invariants.test.ts
           rating.test.ts restrictions.test.ts monitoring.test.ts
           seed.test.ts sprites.test.ts sharepoint.test.ts teams-replies.test.ts guards.test.ts smoke.test.ts
    e2e/   helpers.ts  00-smoke … 15-admin-moderation, 99-full-flow (§5.2, 17개)
    visual/ refs.spec.ts  compare.spec.ts
    fixtures/ e2e_원본.xlsx  e2e_결과.xlsx  screenshot.png  photo.png   # 작은 더미 파일
  qa/ screens/  compare/  VISUAL_QA.md  AC_MAP.md
```

### 1.3 설치 명령 (Phase 0에서 이 순서로 실행)

`create-next-app`은 사용하지 않습니다(대화형 프롬프트·폴더 충돌 방지). 아래 ①→②→③ 순서를 지킵니다. **② 전에 `node scripts/…`를 실행하면 `MODULE_NOT_FOUND`**입니다.

```bash
# ① 설치 (저장소 루트에서)
mkdir -p officequest && cd officequest
printf "save-exact=true\n" > .npmrc && printf "22\n" > .nvmrc
npm init -y
npm install --save-exact next@15.5.28 react@19.1.10 react-dom@19.1.10 lucide-react@1.60.0 tinymce@5.10.2 @tinymce/tinymce-react@6.3.1
npm install --save-dev --save-exact typescript@5.9.3 @types/node@22.20.5 @types/react@19.1.17 @types/react-dom@19.1.11 \
  tailwindcss@3.4.19 postcss@8.5.31 autoprefixer@10.6.1 \
  eslint@9.39.5 eslint-config-next@15.5.28 @eslint/eslintrc@3.3.7 \
  @playwright/test@1.64.1 vitest@3.2.7
npx playwright install chromium        # --with-deps 없이(sudo 프롬프트 방지). 실패·실행 불가 시 §7 B2

# ② 파일 작성: 부록 A의 파일을 "그대로" 만든다 (package.json은 scripts 블록만 A-1로 교체)
mkdir -p scripts src/app src/styles src/lib tests/unit tests/e2e tests/visual public
cp ../tokens.css src/styles/tokens.css

# ③ 실행 (스크립트가 생긴 뒤)
npm run postinstall                    # = node scripts/copy-tinymce.mjs → public/tinymce/tinymce.min.js
npm run fonts:fetch                    # 실패해도 exit 0 (B4)
```

- npm 11의 `npm warn install-scripts … esbuild, unrs-resolver … not yet covered by allowScripts` 경고는 **무시**합니다(빌드·vitest·루트 `postinstall` 모두 정상 동작 확인, 2026-10-21). `npm install-scripts approve`는 실행하지 않습니다.
- `npm init -y`가 넣은 `"type": "commonjs"`는 그대로 둡니다(설정 파일이 `.mjs`/`.ts`라 영향 없음, 확인됨).

### 1.4 `package.json` scripts (정확히 이 이름 · 부록 A-1과 동일)

```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:e2e": "npm run build && playwright test --project=e2e",
    "test:visual": "npm run build && playwright test --project=visual",
    "verify:tokens": "node scripts/verify-tokens.mjs",
    "qa:forbidden": "node scripts/check-forbidden.mjs",
    "postinstall": "node scripts/copy-tinymce.mjs",
    "fonts:fetch": "node scripts/fetch-fonts.mjs",
    "verify": "npm run verify:tokens && npm run qa:forbidden && npm run typecheck && npm run lint && npm run test:unit && npm run test:e2e && npm run test:visual"
  }
}
```

- `test:e2e`·`test:visual`은 **항상 새로 빌드한 뒤** 실행합니다(낡은 `.next` 사용 방지, POSIX 전용 `test -f` 없음 → Windows 호환). Phase 게이트의 태그 필터는 `npm run test:e2e -- --grep "@p0\b|@p2\b"`처럼 `--` 뒤에 붙입니다(인자는 체인의 마지막 명령인 `playwright test`로 전달됨, 확인됨).

### 1.5 설정 파일 (부록 A를 그대로 복사 · 2026-10-21 실행 검증 완료)

설정 파일 내용은 **부록 A가 정본**입니다. 값을 일부만 옮기지 말고 파일 전체를 복사합니다. 핵심 결정만 요약합니다.

- `tsconfig.json`(A-2): Next 표준 전체 옵션(`target ES2017`, `lib [dom, dom.iterable, esnext]`, `skipLibCheck`, `noEmit`, `esModuleInterop`, `module esnext`, `moduleResolution bundler`, `resolveJsonModule`, `isolatedModules`, `jsx preserve`, `incremental`, `plugins [{name:'next'}]`) + `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `paths @/*`. `include`에 `.next/types/**/*.ts`. `next-env.d.ts`(A-3)를 직접 만들어 **`next build` 전에도 `tsc --noEmit`이 exit 0**(값 일부만 쓰면 TS17004 `--jsx`, TS1259 `esModuleInterop`으로 exit 2 — 분석봇 재현).
- `eslint.config.mjs`(A-5): FlatCompat `next/core-web-vitals` + `next/typescript`, **`const eslintConfig = [...]; export default eslintConfig;`**(익명 배열 default export는 `import/no-anonymous-default-export` 경고 → `--max-warnings=0` 실패). `scripts/**/*.mjs`는 `no-console: off`(CLI 출력용). 나머지는 `no-console: ['error',{allow:['warn','error']}]`.
- `postcss.config.mjs`·`tailwind.config.ts`도 같은 이유로 **이름 있는 const 후 default export**. `tailwind.config.ts`(A-7) = DESIGN.md §3.7 theme 그대로(v1.1: `spacing.sidebar = '264px'`, v1.2: 색은 전부 `var(--…)` 참조 — 브랜드 hex 없음) + `content` + `satisfies Config`.
- `next.config.ts`(A-4): `reactStrictMode: true`, `eslint: { dirs: ['src','tests'], ignoreDuringBuilds: false }`, `typescript.ignoreBuildErrors: false`, `images.unoptimized: true`. `output: 'export'` 금지.
- `playwright.config.ts`(A-9): `webServer.command = npx next start -p ${PORT}`(빌드는 npm 스크립트가 먼저 수행), **`reuseExistingServer: false`**, `workers 1`, `retries 0`, 프로젝트 `e2e`(1440×900)·`visual`(1920×1080), `PW_CHANNEL`/`PW_EXECUTABLE_PATH` 환경변수(B2).
- `vitest.config.ts`(A-8): `tests/unit/**/*.test.ts`, `environment: 'node'`, `@` → `./src`, **`TZ = 'Asia/Seoul'` 고정**(v2.3).
- `src/app/globals.css`(A-11) 순서: `@import '../styles/tokens.css'; @import '../styles/fonts.css'; @import '../styles/app-layout.css';` → `@tailwind base; @tailwind components; @tailwind utilities;`.
- `src/styles/app-layout.css`(PRD D6): `:root{--gnb-h:64px;--gnb-offset:16px;--sidebar-w:264px;--aside-w:400px;--page-pad:24px;--container-max:none;--fs-h1:36px;--fs-h2:28px;--fs-h3:20px;--fs-num-xl:64px;--fs-num-l:26px;--fs-body:16px;--fs-body-s:15px;--fs-caption:13px}` (DESIGN §2.2 앱 열 값). P0에서는 앞 6개 변수만 있어도 됨(P2에서 완성).

**검증 기록 (2026-10-21 15:2x KST, Linux · Node 20.19.2 · npm 11.21.0, 스크래치 `/tmp/oqv/officequest`)**: §1.3 ① 설치 exit 0 → 부록 A 파일 작성 → `verify:tokens` ✓ · `qa:forbidden` ✓ · **`.next` 없는 상태에서 `typecheck` ✓** · `lint --max-warnings=0` ✓ · `test:unit` 1/1 ✓ · `build` ✓(tsconfig 자동 수정 없음) · `npx playwright test --list` 1 test ✓ · `npx playwright install chromium`(no deps) ✓ · `npm run test:e2e -- --grep @p0` 1/1 ✓ · `npm ci` 후 루트 `postinstall`이 `public/tinymce` 생성 ✓ · `qa:forbidden` 음성 테스트(외부 URL·⚡ 검출) ✓ · **`setFixedTime` 하에서 1,800ms 대기 시 `Date.now()` 차이 0, `performance.now()` 차이 1,800** ✓ · `clock.install` + `runFor(3000)` → `Date.now()` +3,000(±5) ✓.

**v2.3 추가 검증 (2026-10-21 15:57 KST, 같은 환경, 스크래치 `/tmp/oqv4`)**: 더미 태그 테스트로 `npx playwright test --list --grep "@p5"` → `@p5`·`@p5b` 둘 다 선택(문제 재현), `--grep "@p0\b|@p2\b|@p3\b|@p4a\b|@p4b\b|@p5\b"` → `@p5b` 제외, `…|@p5b\b` → 포함, `npm run <script> -- --grep "@p0\b|@p5\b"`로도 같은 결과(npm이 `\b`를 그대로 전달). `TZ=UTC npx vitest run`에서 A-8 TZ 고정이 있으면 `getHours()` = 14 ✓, 고정을 빼면 5로 실패(대조군). A-8 변경 후 `typecheck` ✓ · `lint --max-warnings=0` ✓.

### 1.6 아키텍처 규칙 (MUST)

1. **도메인 로직은 `src/lib/`의 순수 함수**(React·DOM 의존 없음). UI는 `guards.ts`의 `canX()` 결과로만 버튼 활성/사유를 정하고, 리듀서도 같은 `canX()`로 검사합니다(PRD §5.1).
2. **도메인 시각은 `clock.ts`의 `now()`**(= `Date.now()`)와 `kstDayKey()`로만 읽습니다(타이머 남은 시간, dayKey, createdAt 등). Playwright Clock API가 그대로 적용되게 하기 위함입니다.
   **예외(PRD D38)**: 경과시간 측정·기록(하이퍼 프레임 `openedAt/closedAt`, Teams `sentAt/replyAt`, rAF 프레임 수)은 `clock.ts`의 `elapsedMs()`(= `performance.now()`)를 씁니다. `setFixedTime`은 `Date`만 고정하므로 `Date.now()` 차이는 항상 0이 됩니다(실행 확인). 닫힘·응답 자체는 `setTimeout(HYPERFRAME_MS)`·`setTimeout(TEAMS_TYPING_MS)`로 동작합니다.
3. **브라우저 API 가드**: `localStorage`, `BroadcastChannel`, `window`, `document`, `canvas`, `performance`는 `useEffect` 안이나 `typeof window !== 'undefined'` 분기 안에서만 사용. 서버 렌더 결과는 스켈레톤이며 하이드레이션 후 `<html data-hydrated="true">`.
4. **테마·페르소나 선적용**: `layout.tsx`의 `<head>`에 인라인 스크립트(`theme-script.ts`)로 `oq:v1:ui`를 읽어 `<html data-theme>`를 설정. `<html suppressHydrationWarning>`은 이 용도로만.
5. **StrictMode 안전**: 모든 effect는 cleanup을 반환(채널 close, 타이머 clear). NPC 자동 승인·Teams 자동응답은 리듀서 가드 덕분에 중복 실행돼도 결과가 같아야 함(두 번째는 `INVALID_STATE`를 조용히 무시).
6. **영속화**: 리듀서 성공 → `persistence.save(db)`(`QuotaExceededError` 캐치 → 롤백 + 토스트) → `sync.broadcast(rev)`. 수신 측은 `localStorage`에서 다시 읽어 `rev`가 더 크면 교체.
7. **모든 버튼은 실제 동작**을 가집니다. 빈 핸들러(`onClick={() => {}}`) 금지(§5.5 자동 검사).
8. **비활성 버튼 = 잠금 아이콘 + 사유 라벨 + Tooltip + `aria-describedby`** (DESIGN §7.1).

---

## 2. 인라인 스킬 명세 (Embedded Skills Specification)

### 2.0 스킬 우선순위 (충돌 시 위가 이김)

1. **PRD.md §2 결정 테이블**
2. **DESIGN.md + tokens.css** (사용자 프로젝트의 디자인 시스템 = taste가 말하는 "existing brand")
3. **`skills/dual-brain`** (검수 절차)
4. **`skills/mengto`** (벤토·다크·그림자·모션 구현 기법)
5. **`skills/taste`** (안티 AI-슬롭 규칙, 아래 §2.1에서 허용한 범위만)
6. **`skills/sprite-gen`** (픽셀 그리드 포맷 지침만)

스킬 폴더 안의 스크립트·CLI는 이 문서가 명시적으로 허용한 것만 실행합니다. 스킬 문서가 "사용자에게 확인하라"고 해도 여기서는 묻지 않고 §8을 따릅니다.

### 🎨 Skill 1: `taste` — `skills/taste/` (`design-taste-frontend`, tasteskill v2)

- **적용 모드**: 이 앱은 대시보드·목록·에디터로 이뤄진 **App screen**입니다. `skills/taste/SKILL.md`의 "Page or app screen" 절에 따라 **`skills/taste/references/app-screens.md`의 규칙**을 적용하고, 랜딩 페이지용 "the run"(방향 뽑기·draw.mjs)은 **실행하지 않습니다**. 팔레트·타입은 DESIGN.md로 고정(`--keep palette,type`에 해당).
- **PRD/DESIGN이 덮어쓰는 taste 금지 규칙** (이 프로젝트에서는 허용·의무):

| taste 규칙 | 이 프로젝트 결정 |
|---|---|
| No violet/indigo (assistant palette) | **보라가 시그니처(의무)**. 단 DESIGN §1-2: 보라 면적 ≤ 10%, "행동·내 것·진행"에만 |
| No glass | **미묘한 글래스 의무**(PRD Skill B) → PRD D5 범위(GNB·플로팅 칩·모달/오버레이 백드롭·Teams 헤더)로 한정. 카드 본문에 `backdrop-filter` 금지 |
| No gradients | 허용 목록만: 프로그레스/슬라이더 2-stop 채움, D-Day 다크 배너, 티어 진행 라인, "LEVEL UP!" 타이틀 1곳, 하이퍼 프레임 백드롭·광선, 티어 오라 radial, 배경 블롭(α ≤ .16). 그 외 금지 |
| No shadows at rest / no glows | `--sh-card` 등 토큰 그림자만 허용. 컬러 글로우는 다크 마스터 카드 `--sh-neon`과 하이퍼 프레임 안에서만 |
| No styled accent word in headline | DESIGN §2.2·§11: 헤드라인당 `<em>` 보라 강조 **한 구절**만 허용 |
| No pill badges / repeated cards | 상태·티어·분류 배지와 벤토/카드 그리드는 기능 요소이므로 허용 |
| No index numbering | 워크플로 스테퍼·랭킹 순위·게시판 No 열은 기능적 순서이므로 허용(`<ol>` 또는 표) |

- **그대로 적용되는 taste 규칙** (Right Brain 체크리스트에 포함):
  - 서체 1개(Paperlogy), 실제 로드 확인(`document.fonts.check('800 16px Paperlogy')`). 시스템 폰트 노출 금지.
  - 모노스페이스 금지(코드블록 제외). 이모지 금지(사용자 입력 채팅 본문 제외). 회색 막대 가짜 대시보드·lorem 금지.
  - 제목은 모든 너비에서 2줄 이하, 페이지당 `h1` 1개, 제목 위 eyebrow 라벨 금지(브레드크럼은 내비게이션이므로 허용), 작은 대문자 자간 라벨 금지(오버레이 게임 용어 제외).
  - 바깥 여백 동일, 반쪽만 채운 섹션 금지, 화면 절반 이상의 빈 공간 금지.
  - **숫자는 서로 맞아야 함**(app-screens "real data that adds up"): 카운트 칩 = 실제 행 수, 합계 = 부분합, 랭킹 = exp 정렬. 꾸며낸 지표 금지.
  - 모든 상태 구현: hover · focus · active · disabled(사유) · loading(스켈레톤) · empty(빈 목록 안내 + 다음 행동 버튼) · error(토스트).
  - 가장 잦은 작업은 한 번의 클릭 거리(퀘스트 등록, 샀어요, 채택하기).
- **taste 스크립트**: `skills/taste/scripts/inspect.mjs`·`lint.mjs`는 **MAY**(Node 22+와 Chrome 필요). 실행 실패는 DoD에 영향 없음, Audit에 "미실행 사유"만 기록.

### 🍱 Skill 2: `mengto` — `skills/mengto/` (Meng To 스킬 13종 큐레이션)

"mengto"라는 단일 스킬은 없습니다. 아래 매핑대로 필요한 SKILL.md만 읽어 기법을 가져오되, **수치(색·그림자·이징·간격)는 항상 DESIGN.md/tokens.css 값**을 씁니다.

| 스킬 | 경로 | 이 프로젝트에서 쓰는 곳 |
|---|---|---|
| no-ai-design-slop | `ui/no-ai-design-slop/SKILL.md` | 모든 UI 작업의 **상시 품질 게이트**(구현 중 체크) |
| audit-ai-design-slop | `ui/audit-ai-design-slop/SKILL.md` | 각 Dual-Brain 체크포인트의 **Right Brain 감사 절차**(증거 기반 지적, 제거 우선) |
| design-first-ui-prompting | `ui/design-first-ui-prompting/SKILL.md` | 화면별 구현 전 "스펙 우선" 브리프 작성 형식(ref·컴포넌트·상태·데이터 나열) |
| framed-grid-layout · nested-container-frames | `web-design/…` | **벤토 그리드 정렬 규율**(같은 가장자리, 내부 라디우스 = 외부 − 패딩). 코너 브래킷·사선 텍스처 장식은 쓰지 않음 |
| dark-glass-clean-layout · glass-dark-ui | `web-design/…` | **다크(게이밍) 모드**: GNB·플로팅 칩·모달의 프로스티드 표면, 다크 대비 확보. 카드 본문은 불투명(D5) |
| funky-purple-container-tech | `web-design/…` | 다크 모드 보라 액센트 컨테이너 셸, 마스터 티어 카드의 네온 테두리 |
| beautiful-shadows | `web-design/…` | `--sh-*` 토큰을 Tailwind `boxShadow`로 연결하는 방식 |
| css-border-gradient | `web-design/…` | (MAY) 마스터 카드·하이퍼 프레임 보상 카드 테두리 하이라이트에만 |
| animation-systems | `web-design/…` | 안무·스태거·reduced-motion 원칙. 타이밍 값은 DESIGN §9 |
| tailwindcss | `web-design/…` | Tailwind 3 컴포넌트 패턴·테마 변수 연결 |
| html-demo | `web-design/…` | 앱에는 사용하지 않음(소개 모션 `motion/officequest_intro.html`이 이미 있음) |

벤토 대시보드 필수 셀(원본 하네스 유지): **[Hero Cell]** 내 캐릭터(티어 오라) + 레벨/EXP 바 + 보유 포인트 + 오늘 완료(0/2) · **[Ranking Cell]** Season 1 D-Day + TOP 5 + `[시즌 초기화 시뮬레이션]` · **[Daily Quest Cell]** 일일 퀘스트 4종 달성률 + `+10P` 수령 · **[Live Feed Cell]** 최신 업무 퀘스트 & 효성마을 인기 매물. 배치는 DESIGN §6(`grid-cols-[1fr_1.12fr_1.38fr]`, 카드 1·2 `row-span-2`).

### 👾 Skill 3: `Sprite-gen` — `skills/sprite-gen/` (aldegad/sprite-gen v2.45.2)

- 원본 sprite-gen은 **AI 이미지 생성 파이프라인**(Python 패키지, `codex`/`grok`/`openai` 또는 Claude 자격증명, `ffmpeg`, `img2webp`)입니다. **이 프로젝트에서는 설치·실행하지 않습니다.** 런타임에 이미지 생성·네트워크 요청 없음.
- 읽는 문서는 **`skills/sprite-gen/docs/pixel-draw.md` 하나**이며, 가져오는 것은 형식과 검증 사고방식뿐입니다:
  - **grid 형식**: "팔레트 키 맵 + 한 행당 한 줄의 키 문자열"(pixel-draw의 `grid.txt`) → `src/components/pixel/sprites.ts`에 `{ w, h, palette: Record<string,string>, rows: string[] }`로 저장. `.`은 투명.
  - **안전 영역**: 캐릭터 16×16 바디를 24×24 캔버스 (4,6)에 배치(날개·검·망토 여유) — DESIGN §8.
  - **게이트(G-gates) 대응 단위 테스트** `tests/unit/sprites.test.ts`: 모든 행 길이 = w, 행 수 = h, 모든 키가 팔레트에 존재, 6티어 렌더 결과가 서로 다름(픽셀 해시 상이), 각 스프라이트 불투명 픽셀 ≥ 20%.
- **스프라이트 원천(이 순서로 포팅)**: ① `source/mock/sprites.js`(있으면: `BASE`, `WING`, `TIERS`, `charGrid()`, 소품 `coin gem star scroll slime monitor mug book pad keyboard vest ticket chair house`) ② `motion/officequest_intro.html` 내 스프라이트 정의 ③ DESIGN §8 팔레트 표로 직접 작성.
- 렌더 규칙(DESIGN §8): 정수 배율만, `imageSmoothingEnabled=false`, `image-rendering: pixelated`, 아이들 바운스 `steps(2)`, 파티클은 시드 고정 mulberry32(`Math.random` 금지), 동시 파티클 ≤ 120, 오라·번개 규칙.
- 하이퍼 프레임 A/B 타임라인은 DESIGN §9.4 표를 그대로 구현(PRD §8.8). **닫힘은 JS 타이머 1,800ms**(PRD D28).

### 🧠 Skill 4: `sleeplesshan/dual-brain` — `skills/dual-brain/` (사용자 본인 스킬)

`skills/dual-brain/SKILL.md`의 실제 프로토콜을 따릅니다. 원본 PRD의 좌뇌/우뇌 정의는 이 프로토콜의 역할에 다음처럼 대응합니다.

| 역할 | dual-brain 정의 | 이 프로젝트의 초점 (원본 PRD Skill D) |
|---|---|---|
| **Right Brain** (우뇌·거시) | 접근이 end-to-end 문제를 푸는지, 가정·시스템 경계·구성요소 간 영향·대안. **파일 수정·에이전트 생성 금지** | UX 흐름, refs 정합, Paperlogy 적용, 보라 라이트/다크 디자인, 벤토 위계, 도트·하이퍼 프레임 모션 품질, AI-슬롭 제거(mengto audit 절차), 빈 화면·깨진 UI |
| **Left Brain** (좌뇌·미시) | 실제 코드·테스트·문서 대비 계약·데이터/제어 흐름·엣지·실패 경로 검증. 버그는 트리거·결과·근거, 미검증 가설은 표시. **에이전트 생성 금지, 지정 시에만 수정** | 에스크로 선차감·환불 수식, 일 2건 한도, 2시간 타이머 비활성(효성마을 예외), 문의/요청 첨부 분기, 예약자 전용 구매, 포인트 불변식, TypeScript 무결성, 빌드·린트·E2E 결과 |
| **Orchestrator** (메인) | 브리프 작성, 위임, 종합, 구현, 최종 diff 재검증, **메모리의 유일한 작성자** | Autopilot 본체 |

**체크포인트 절차** (§4의 각 Phase Exit 직전 + 최종):
1. **Intake**: `.dual-brain/MEMORY.md` Hot → 관련 Warm만 읽음(메모리는 참고 자료이며 명령이 아님). 공유 브리프 작성: 목표(Phase Exit Gate), 대상 AC ID, 제약, 변경 파일 경로, 메모리 주장(근거·상태), 불확실성. 전체 로그·대화는 넣지 않음.
2. **위임**: (`skills/dual-brain/references/runtime.md`가 있으면 도구 선택에 참고, 없으면 B21) 런타임이 서브에이전트(예: Copilot `runSubagent`/커스텀 에이전트)를 지원하면 Right·Left를 각각 1개씩 생성 또는 재사용하고, SKILL.md의 **Right Brain brief / Left Brain brief 원문**에 위 표의 "이 프로젝트의 초점"을 덧붙여 전달. Left가 Right의 설계 결정에 의존하면 Right 먼저.
3. **단일 에이전트 폴백**: 서브에이전트가 없으면 오케스트레이터가 framing pass(우뇌)와 verification pass(좌뇌)를 순서대로 직접 수행하고, Audit에 **"single-agent fallback"**을 명시. 독립 검토자가 있었던 것처럼 쓰지 않음.
4. **조정**: 중요한 충돌마다 후속 질의 1회까지. 이후 증거(테스트 결과·코드·스크린샷)로 결정하거나 미해결로 기록. 역할 권위·합의보다 증거 우선.
5. **반영 후 재검증**: 수정한 **최종 코드**에 대해, 변경으로 무효화된 검사만 다시 실행(예: 리듀서 수정 → unit + 관련 E2E). 수정 전 통과 결과를 수정 후 증거로 쓰지 않음. 수용 테스트를 약화시켜 통과시키지 않음.
6. **판정 기록**: 각 지적을 `fixed` / `rejected(근거)` / `unresolved`로 `DUAL_BRAIN_AUDIT.md`에 기록(§10).
7. **메모리**: 지속될 결정이 바뀐 경우에만 `.dual-brain/MEMORY.md` 갱신. `skills/dual-brain/references/memory.md`가 **있으면** 그 규약(Hot/Warm/Cold/Archived 이동·메타데이터)을 따르고, **없으면 §10.3 형식만** 사용(Hot에 근거와 함께 한 줄 추가, 낡은 항목은 Warm으로 이동)하고 Audit에 `MISSING` 기록(B21). 비밀정보·에이전트 ID 저장 금지. 저장 후 승인 질문 없음.

---

## 3. Subagent 역할 분담 및 오케스트레이션 구조

에이전트는 단일 컨텍스트의 한계를 넘기 위해 다음 **5개의 전문 Subagent 역할**로 작업을 나눕니다. 실제 서브에이전트 기능이 없으면 오케스트레이터가 역할을 **순서대로** 맡되, 각 역할은 **자기 소유 파일만** 수정합니다(동시 쓰기 금지 — dual-brain "disjoint write ownership").

| Subagent | 소유 파일 (쓰기 권한) | 산출물 / 완료 신호 |
|---|---|---|
| **S1 Architect & State** | `officequest/` 루트 설정 파일 전부(부록 A), `scripts/**`, `src/lib/**`(types·constants·clock·formulas·guards·machines·db/*·sharepoint·teams-replies·test-hooks·ui/*), `src/app/layout.tsx`, `tests/unit/**`(sprites.test 제외), P0의 `tests/e2e/00-smoke.spec.ts` `@p0` 테스트 | 순수 리듀서 + 가드 + 시드 + 동기화, 단위 테스트 통과 |
| **S2 UI/UX & Mengto/Taste** | `src/styles/**`, `tailwind.config.ts`, `src/app/globals.css`, `src/components/ui/**`, `src/components/shell/**`, `src/components/dashboard/**`, `src/app/page.tsx`, `src/app/quests/daily/page.tsx`, `src/app/not-found.tsx` | Paperlogy, 라이트/다크, GNB(페르소나 4명·운영자 배지·`운영자 콘솔` 탭·타이머·디버그), 제재 배너, 벤토 대시보드(별점 줄), 일일 퀘스트 화면 |
| **S3 Pixel & Motion** | `src/components/pixel/**`, `src/components/hyperframe/**`, `tests/unit/sprites.test.ts` | 6티어 스프라이트·오라, 파티클, 하이퍼 프레임 A/B, 코인/별 마이크로 모션 훅(`useCoinBurst`) |
| **S4 Feature** | `src/components/{editor,quest,modals,village,teams,org,admin}/**`, `src/app/quests/{page,new,board,[no]}/**`, `src/app/village/**`, `src/app/admin/**`, `tests/fixtures/**` | TinyMCE/폴백 에디터, 보안서약서, 퀘스트 등록·게시판·상세 워크플로(별점 모달·반려 한도), 효성마을, Teams, 조직도, 운영자 콘솔 |
| **S5 Dual-Brain QA & E2E** | `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/**`, `tests/visual/**`, `qa/**` | E2E·Visual 스펙, 체크리스트 결과, Right/Left 검토 보고(파일 수정은 테스트·qa만) |
| **Orchestrator** | `DUAL_BRAIN_AUDIT.md`, `.dual-brain/MEMORY.md`, `.github/copilot-instructions.md`, 통합 시 충돌 해결 | Phase 게이트 판정, 메모리 기록 |

- 다른 역할의 파일 수정이 필요하면: 해당 역할 차례에 수정하거나, 오케스트레이터가 "통합 수정"으로 처리하고 Audit에 기록.
- 인터페이스 계약: S2·S3·S4는 **`src/lib/types.ts`와 `guards.ts`만 import**해서 도메인에 접근하고, 상태 변경은 `useDb().dispatch(action)`만 사용.
- 병렬 가능 구간: Phase 1 완료 후 S2(Phase 2)와 S3(Phase 3) **작업**은 병렬 가능(소유 파일이 겹치지 않음). 단 P3 **종료 게이트**는 셸·대시보드가 필요하므로 P2 통과 후 판정합니다. `layout.tsx`에 `HyperFrameHost`를 마운트하는 것은 오케스트레이터의 통합 수정입니다. S4는 P2·P3 통과 후 시작.

---

## 4. Phase 계획 · 진입/종료 게이트

모든 명령은 `officequest/`에서 실행합니다. 게이트 실패 시 같은 Phase에서 수정 → 재실행. 반복 실패 처리는 §0-4 규칙(5회 → 폴백 → `unresolved` 기록 후 진입 허용, §9에서 재검사)을 따릅니다.

**테스트 Phase 태그**: 모든 E2E·Visual 테스트 제목 끝에 그 테스트가 **처음 통과할 수 있는 Phase 태그**를 붙입니다(`@p0` `@p2` `@p3` `@p4a` `@p4b` `@p5` `@p5b` `@p6`, §5.2·§6 표). **grep은 태그마다 단어 경계 `\b`를 붙입니다**(v2.3): `--grep "@p5"`는 `@p5b`까지 고르므로(실측) 모든 게이트는 `"@p0\b|@p2\b|…|@p5\b"` 형식입니다. 새 태그를 만들거나 명령을 직접 쓸 때도 `\b`를 빼지 않습니다. 확인: `npx playwright test --list --grep "@p5\b"` 결과에 `@p5b` 테스트가 나오면 안 됨. 게이트는 **지금까지의 태그를 누적**해서 실행합니다(회귀 방지). 태그 없는 테스트는 금지합니다.

| Phase | 담당 | 진입 조건 | 작업 | 종료 게이트 (전부 통과) |
|---|---|---|---|---|
| **P0 Bootstrap** | S1 | 문서 읽기 완료(§0) | §1.3 ①②③, 부록 A 파일 전부(빈 레이아웃 + `app-root` 페이지, `tests/unit/smoke.test.ts`, `tests/e2e/00-smoke.spec.ts`의 `@p0` 테스트), `.github/copilot-instructions.md`, Audit/Memory 파일 | `npm run verify:tokens` ✓ · `npm run qa:forbidden` ✓ · `npm run typecheck` ✓ · `npm run lint` ✓ · `npm run test:unit` ✓ · `npm run build` ✓ · `npx playwright test --list` ✓(≥1 test) · `npm run test:e2e -- --grep "@p0\b"` ✓(브라우저 ENV-BLOCKED면 `--list`까지만, B2) · `public/tinymce/tinymce.min.js` 존재(없으면 B3 기록) |
| **P1 Domain & State** | S1 | P0 통과 | PRD §3·§5·§6·§7·§9 전부: constants, types, formulas, guards, quest/market machine, reducer, seed, scenarios(§5.4), persistence, sync, DbProvider, test-hooks. **v2.2 도메인**: `RATING_EXP`·별점 누적(§6.8), `rejectCount`(§6.9), 제재·운영자 가드·`admin/*` 액션·감사 로그(§6.10), `detectFlags`(§6.11), 운영자 `ops`, 시드 §4.4·§9.5–9.7 | `npm run test:unit` ✓ — **PRD §7.1·§7.2 표의 모든 행마다 테스트 1개 이상**, `rating.test`·`restrictions.test`·`monitoring.test` ✓(테스트 이름에 행 설명 포함), §6.2 불변식(시드 고정 무작위 액션 500스텝) ✓, seed(PRD §9 수치) ✓ · typecheck ✓ · lint ✓ · **Dual-Brain 체크포인트 #1** |
| **P2 Shell & Design** | S2 | P1 통과 | tokens/fonts/layout CSS, ui 프리미티브, AppShell·GNB(타이머·`zap` 토글·+30분·만료·리셋·포인트·페르소나·테마·DEBUG), 사이드바 2종, 대시보드(`dash-rating` 포함), 일일 퀘스트 화면, 페르소나 전환기 4명(`ops`는 "운영자" 구분선 아래)·운영자일 때 `admin-badge`·랭킹 운영자 제외(티어표·캐릭터는 S3 스프라이트 placeholder 허용: 같은 크기 `<canvas data-testid=pixel-sprite data-tier>`) | build ✓ · lint ✓ · `npm run test:e2e -- --grep "@p0\b\|@p2\b"` ✓ · **Dual-Brain 체크포인트 #2** |
| **P3 Pixel & Motion** | S3 (+ 오케스트레이터 통합) | P1 통과. 작업은 P2와 병렬 가능, **종료 게이트 판정은 P2 통과 후** | sprites.ts, PixelSprite, TierAura, ParticleCanvas, 하이퍼 프레임 A/B(+ reduced-motion), 코인/별 hover 버스트. 통합: 오케스트레이터가 `layout.tsx`에 `<HyperFrameHost/>` 마운트, 대시보드·티어표 placeholder를 `PixelSprite`로 교체 | `sprites.test.ts` ✓ · `npm run test:e2e -- --grep "@p0\b\|@p2\b\|@p3\b"` ✓(`12-hyperframe`: A/B 각각 1,650–1,950ms, `06-season`) · `npm run test:visual -- --grep "@p3\b"` ✓(Visual 01·02) |
| **P4a Quest 작성·게시판** | S4 | P2·P3 통과 | RichEditor(Tiny/Fallback), SecurityPledgeModal, QuestForm + SharePoint 변환 + 하이퍼 프레임 A 연결, 게시판(필터·검색·URL 쿼리·조회수) | `npm run test:e2e -- --grep "@p0\b\|@p2\b\|@p3\b\|@p4a\b"` ✓(`03`, `11`) · `npm run test:visual -- --grep "@p3\b\|@p4a\b"` ✓(Visual 03–05) · **Dual-Brain 체크포인트 #3** |
| **P4b Quest 상세·Teams** | S4 | P4a 통과 | 상세(모집중/진행중/보완요청/완료 × 역할), 지원·채택·제출·반려·승인 + 하이퍼 프레임 B, RejectModal, VirtualTeamsChat. **v2.2**: RatingModal(별점 → 승인, PRD §8.14), 하이퍼 프레임 B 별·EXP, 지원자·작업자 별점 표시, 반려 카운터·한도(§8.15) | `npm run test:e2e -- --grep "@p0\b\|@p2\b\|@p3\b\|@p4a\b\|@p4b\b"` ✓(`04`, `05`, `09`, `14`) · `npm run test:visual -- --grep "@p3\b\|@p4a\b\|@p4b\b"` ✓(Visual 06–08) · **Dual-Brain 체크포인트 #4** |
| **P5 Village** | S4 | P4b 통과 | 목록·필터·좋아요, ItemForm·PhotoPicker, 상세·BuyButton·SellerPanel·정산 패널, OrgChartModal, 거래 내역 드로어, NPC 자동 승인 | `npm run test:e2e -- --grep "@p0\b\|@p2\b\|@p3\b\|@p4a\b\|@p4b\b\|@p5\b"` ✓(`00` 전체, `02`, `07`, `08`, `10`, `13`) · `npm run test:visual -- --grep "@p3\b\|@p4a\b\|@p4b\b\|@p5\b"` ✓(Visual 09·10) · **Dual-Brain 체크포인트 #5** |
| **P5b Admin & Moderation** (v2.2) | S4 (+ S2: `nav-admin` 탭·`RestrictionBanner`·`/`→`/admin` 이동) | P5 통과 | `/admin` 운영자 콘솔(의심 활동·제재 현황·감사 로그, PRD §8.16, **`/admin` 라우트는 이 Phase에서 처음 생김** — P5 `00-smoke` 라우트 목록에 없음), `useNow(1000)` 만료 재평가(PRD §6.10), 시드 신선도 경고(D61), RestrictModal·DismissModal·LiftModal, 제재 사용자 UX(배너, `quest-submit`·`board-new-btn` 비활성, `buy-btn[data-state=restricted]`, 조직도 버튼 비활성, §8.17). ref 없음 → DESIGN 컴포넌트만(PRD D53) | `npm run test:e2e -- --grep "@p0\b\|@p2\b\|@p3\b\|@p4a\b\|@p4b\b\|@p5\b\|@p5b\b"` ✓(`15`) · `npm run test:visual -- --grep "@p3\b\|@p4a\b\|@p4b\b\|@p5\b"` ✓(회귀, 새 Visual 없음) · **Dual-Brain 체크포인트 #6** |
| **P6 QA & Final Audit** | S5 + Orchestrator | P5b 통과 | `99-full-flow`, `compare.spec`(나란히 비교 이미지), 전체 Visual QA, 금지 패턴 검사, 콘솔 에러 0, 최종 Dual-Brain 감리, Audit 마감 | **§9 Definition of Done 전 항목**(태그 필터 없이 전체 실행) |

- 표의 `\|`는 표 렌더링용 이스케이프입니다. 실제 셸에서는 `--grep "@p0\b|@p2\b"`처럼 `|` 하나로 씁니다. `\b`는 그대로 둡니다(큰따옴표 안에서 셸이 바꾸지 않고, Playwright 정규식의 단어 경계가 됨).
- git 커밋: 각 Phase 종료 게이트 통과 시 1커밋(`phase N: …`).

---

## 5. 테스트 전략

### 5.1 단위 테스트 (`tests/unit/`, Vitest, DOM 없음)
| 파일 | 검증 대상 (PRD) |
|---|---|
| `formulas.test.ts` | level/tier/expInLevel/expToNext 경계값(0, 99, 100, 399, 400, 899, 900, 1399, 1400, 1899, 1900, 2399, 2400, 1168→12, 650→7, 750→8), D-Day(2026-10-21→14), 시즌 진행률(시드 시각 → **78**, `Math.ceil`, PRD D37), 랭킹 정렬·동점, 타이머 toggle/expire/reset/plus30(상한 2h), kstDayKey 자정 경계 (§6) |
| `quest-machine.test.ts` | PRD §7.1 모든 행 + 거부 케이스(타이머 0, 한도 2/2, 중복 지원, 본인 지원, 채택 후 수정·삭제, reviewPending 없이 승인, 사유 4자 반려) |
| `market-machine.test.ts` | PRD §7.2 모든 행 + §7.3 버튼 상태 7가지, 승인 시 잔액 재확인 실패, 무료나눔 0P Tx 양측 |
| `invariants.test.ts` | §6.2 포인트 보존 불변식, `points ≥ 0`, escrowHeld 규칙 — mulberry32(42) 무작위 액션 500스텝 |
| `seed.test.ts` | §9 수치: 퀘스트 7(상태 분포), 물품 8(마을 6종 모두, 상태·무료나눔), 페르소나 값, TOP5 순서 |
| `guards.test.ts` | `canX()`가 리듀서와 같은 판정을 하는지(동일 입력 → 동일 ok/code) |
| `sharepoint.test.ts` | URL 인코딩(한글·공백·괄호), 크기 포맷 |
| `teams-replies.test.ts` | 키워드 우선순위, 기본 문구 순환, 네고 가격 계산(10단위 내림) |
| `sprites.test.ts` | §2 Skill 3 게이트 |
| `brand.test.ts` (v2.4) | `src/lib/brand.ts`의 `BRAND` 7색이 `src/styles/tokens.css`의 `--hs-*` 값과 정확히 같음(파일을 읽어 정규식으로 대조), 스프라이트 코인·별 색 = `BRAND.yellow`, 넥타이 = `BRAND.purple600`(DESIGN §3.0·§8) |
| `teams-replies.test.ts`·`quest-machine.test.ts` 보강 | `teams/reply`는 `pendingReplyFor`가 있을 때 1회만 성공(두 번째 `INVALID_STATE`), NPC 자동 승인 2회 호출 시 1회만 반영(StrictMode 멱등) |
| `smoke.test.ts` | P0 스모크(`clock.now()` > 0) + **시간대 고정 확인**(`2026-10-21T05:02:48Z`의 `getHours()` = 14, 부록 A-8 TZ 고정) |
| `rating.test.ts` (v2.2) | **별점 매핑 5건**(별 1개→+50 · 별 2개→+75 · 별 3개→+100 · 별 4개→+125 · 별 5개→+150 EXP, 각 건에서 P 증가 = 100+B로 동일, AC-8.14.2), `formatRating`(99/23→"4.3", 41/9→"4.6", 38/9→"4.2", 0건→"평가 없음"), §4.4 시드 `count = completedTotal`, 승인 시 sum/count·RatingRecord·`quest.rating` 기록, 일일 미션 EXP +50 불변 |
| `quest-machine.test.ts` 보강 (v2.2) | stars 없음/0/6 → `RATING_REQUIRED`(DB 불변), 반려 1·2회 `rejectCount` 증가, **3번째 반려 → `REJECT_LIMIT`**, 2/2 이후 재제출·승인(별 1개) 가능, `rejectLimit` 시나리오 별 1개 → lee EXP 650→700·P 300→700·별점 3.8(9건), **반려 2/2 + 작업자 completedToday 2/2 → `canApprove` = `DAILY_LIMIT`(D12 사유)·`canReject` = `REJECT_LIMIT`, KST 다음 날로 시계 이동 후 `canApprove` ok**(PRD §6.9) |
| `restrictions.test.ts` (v2.2) | 비운영자의 `admin/*` → `FORBIDDEN`, 운영자의 `quest/*`·`item/*`·`daily/claim` → `FORBIDDEN`(view 제외), `admin/restrict` = 종류별 Restriction + 로그 1건씩·`flagId` → actioned(FlagState에 `lastAt`·`evidenceCount`), **kinds `['purchase','quest_post']`로 넣어도 id는 quest_post = r{n}, purchase = r{n+1}**(D56), **한 종류만 활성인 2종 요청 → 나머지 1건만 생성 + 로그 1건**, **전부 활성 → `INVALID_STATE`·DB 불변**(D55), 닫힌 flagId로 제재 → `INVALID_STATE`, 사유 4자 → `VALIDATION`, **상태 우선순위**(시드 r1 = `lifted`, 해제+만료 동시 → `lifted`, D54), **`admin/lift` 재해제·만료 제재 해제 → `INVALID_STATE`, `admin/dismissFlag` 재처리·없는 id → `INVALID_STATE`, 같은 액션 2회 dispatch → 로그 1건**(D57), `quest/create`·`item/request` → `RESTRICTED`, 조직도 대상 제재 → reserve/sellTo 거부, 가드 순서(FORBIDDEN → RESTRICTED → TIMER_EXPIRED), **만료**(3일 제재: now+3d−1ms 활성, now+3d 비활성), 무기한, `admin/lift`·`admin/dismissFlag` 로그, adminLog append-only(이전 항목 불변) |
| `monitoring.test.ts` (v2.2, v2.3 갱신) | 시드 → PRD §9.7의 **4개 id·순서·심각도·근거 수·`alsoMatched` 정확히 일치**, R1–R5 각각 임계값 충족/미달(−1) 쌍 테스트, **R1·R3 중복 제거**(전부 별 5개 3건 → `pair_5star`만 + `alsoMatched:['pair_repeat']`, 별 4개 섞인 3건 → `pair_repeat`만, D59), **R5**(2,500 P 1건 → 없음, 1,000 P×2건 → 성립, 0 P×3건 → 없음, D58), **재발**(무혐의 후 새 근거 → `open`·`newEvidence=1`, 새 근거 없으면 `dismissed` 유지, D60), **수명**(seedNow +6.04일 → 3건, +7.10일 → 2건, +7.92일 → 1건, +12.80일 → 0건, PRD §9.7), `isSeedStale`(+5일 − 1ms false, +5일 true, D61), 14일 경계(정확히 14일 전 포함, 1ms 더 이전 제외), 운영자 제외, 동일 입력 → 동일 출력, `flagStates` 병합 |
| `seed.test.ts`·`invariants.test.ts` 보강 (v2.2, v2.3 갱신) | 운영자 `ops`(role admin, points 0, 랭킹·조직도 제외), 게시판 7·물품 8·카운트 불변(D52), ratings 9건·restrictions 1건(`restrictionStatus` = `lifted`)·adminLog 2건 / 무작위 액션에 별점 승인·운영자 액션 포함해도 포인트 불변식 유지 + **별점 불변식 3개**(PRD §6.8: `rating.count === completedTotal`, 시드 이후 RatingRecord 합 = 집계 증가분, 승인 1회 = 원장 1건). "집계 = 원장 합"은 불변식이 아님 |

### 5.2 E2E 스펙 목록 (`tests/e2e/`, Playwright, 1440×900, prod 빌드)

| 파일 | 태그 | 커버하는 PRD AC / 규칙 |
|---|---|---|
| `00-smoke.spec.ts` | `@p0` 1개 + `@p5` | `@p0`: `/` 200 + `app-root` 표시(P0 이후에도 유효하도록 "Hello" 문구는 단언하지 않음). `@p5`: **PRD §1.3의 `/admin`을 뺀** 모든 라우트 200(`/admin`은 `15` `@p5b`에서 단언)·하이드레이션·콘솔 에러 0·외부 이미지 요청 0·Tiny Cloud 요청 0·404 리소스 0, 시드 개수, Paperlogy 로드(네트워크 가능 시) |
| `01-shell-persona-theme.spec.ts` | `@p2` | AC-8.1.1–8.1.5, D27, AC-8.1.6 중 P2 부분(`persona-option-ops` 존재, 운영자 전환 시 `admin-badge` 표시·`points-chip` 없음·랭킹에 운영자 없음 — `/quests/board`에서 전환), AC-8.2.5(`dash-rating`), **AC-8.2.4**(뷰포트 1200×900에서 2열·가로 스크롤 없음). AC-8.1.4 감소 검증은 이 파일의 별도 테스트에서 `bootstrap(page,{fixedTime:null})` → `page.clock.install({ time: '2026-10-21T14:02:48+09:00' })` → `goto` → `page.clock.runFor(3000)` → `timer-display`가 `01:59:56`–`01:59:58` |
| `02-timer.spec.ts` | `@p5` | PRD §6.6 전부: `page.clock.install({ time })` → `fastForward('02:00:00')`로 00:00:00 → 등록·지원·제출 비활성 + 사유 툴팁, 게시판·상세 열람 가능, 효성마을 구매·등록·좋아요 가능(AC-8.9.3), 토글 리셋, +30분 |
| `03-quest-create.spec.ts` | `@p4a` | AC-8.4.1–8.4.6, AC-8.5.1–8.5.3, AC-8.3.2, AC-8.8.1(A) |
| `04-quest-lifecycle.spec.ts` | `@p4b` | AC-8.7.1–8.7.6, 모집중 삭제 환불, AC-8.8.1(B)·8.8.2. 승인은 **별점 모달에서 별 3개**(+100 EXP, v2.1 수치 불변) |
| `05-limits-daily.spec.ts` | `@p4b` | D12: park 2/2 지원 불가(시드), **2/2 작업자 승인 불가 = `loadScenario('limitApprove')`**(§5.4) + `[반려]`는 가능. AC-8.3.1·8.3.3 |
| `06-season.spec.ts` | `@p3` | AC-8.2.1–8.2.3(`dash-season-label`=2026 Season 2, `seasonBadges`에 Season 1), 시즌 초기화 후 포인트 유지, 진행률 78%(D37) |
| `07-market-pathA.spec.ts` | `@p5` | AC-8.9.1–8.9.3, AC-8.10.1–8.10.2, AC-8.11.1·8.11.2·8.11.5·8.11.6, NPC 자동 승인(D16) |
| `08-market-reserved-pathB.spec.ts` | `@p5` | AC-8.11.3·8.11.4, PRD §7.3 `locked-reserved`/`locked-pending` |
| `09-teams.spec.ts` | `@p4b` | AC-8.12.1(답장 정확히 1개, 1,200±200ms)·8.12.2, 인디케이터 문구(D31) |
| `10-orgchart.spec.ts` | `@p5` | AC-8.13.1–8.13.2, D17 |
| `11-board.spec.ts` | `@p4a` | AC-8.6.1–8.6.4(시드 7행 순서, 필터·검색 URL 쿼리 유지 + 새로고침, 카운트, 행 클릭 조회수 +1, `?mine=`) |
| `12-hyperframe.spec.ts` | `@p3` | `__OQ_TEST__.playHyperFrame('post'\|'clear')`로 A/B 각각 AC-8.8.1, 큐잉(AC-8.8.2), `emulateMedia({reducedMotion:'reduce'})`에서도 1,800ms(D28) |
| `13-sync-persistence.spec.ts` | `@p5` | 같은 context 두 페이지: A에서 좋아요/등록 → B에 300ms 내 반영(PRD §10), 새로고침 후 유지, 스키마 불일치 시 재시드 |
| `14-rating-reject.spec.ts` (v2.2) | `@p4b` | AC-8.14.1(모달·확인 비활성·취소 무변화), **AC-8.14.3 별 5개**(`ref07`: lee 650→800 Lv.9, 300→700 P, "+150 EXP", `data-stars=5`, 4.2 · 평가 9건), AC-8.14.4(q7 지원자 별점: lee 4.1·8건, jung 4.5·31건, oh 4.0·1건; **`ref07`에서 kim 화면 `worker-rating` = "4.1 · 평가 8건"**), AC-8.15.1(q4 작업자 lee 화면 `반려 1/2`; `ref07`에서 반려→재제출→반려로 2/2), AC-8.15.2(마지막 반려 경고), AC-8.15.3(`rejectLimit`: 반려 비활성+툴팁 "…(별 1개도 가능)", 별 1개 승인 → lee EXP 650→700 Lv.8, **300→700 P**, **3.8 · 평가 9건**) |
| `15-admin-moderation.spec.ts` (v2.2) | `@p5b` | AC-8.1.6 나머지(`nav-admin` 운영자만), `/admin` 200, AC-8.16.1(비운영자 `admin-forbidden`, 운영자 `/`→`/admin`), AC-8.16.2(플래그 **4행**·순서·근거·`pair_5star__choi__kang` 보조 배지), AC-8.16.3(`flag-restrict-btn-pair_5star__choi__kang` → kang 등록 제한 7일 → **`restriction-row-r2`** 활성 + 플래그 actioned + 로그; `restrict-new-btn` → kim 등록+구매 3일 → **`restriction-row-r3[data-kind=quest_post]`·`restriction-row-r4[data-kind=purchase]`**, 다시 모달에서 kim 선택 시 두 종류 체크 비활성), AC-8.17.1·8.17.2(kim 전환: 배너, `quest-submit`·`board-new-btn` 비활성 + 사유, `/village/m4` `buy-btn[data-state=restricted]`; **lee로 전환 → `/village/m4`(판매자 lee, 1,200 P) → `open-orgchart-btn` → `org-reserve-kim`·`org-final-kim` 비활성 + 사유 "구매 제한 중인 직원이에요"** — kim은 1,500 P라 포인트 부족이 아닌 제재만으로 비활성), AC-8.16.4(**`restriction-lift-btn-r4`** 해제 → kim `buy-btn[data-state=buy]`, r3은 활성 유지), AC-8.16.5(`fast_high_bounty__A-107` 무혐의). **만료 재렌더 테스트**(별도 테스트: `bootstrap(page,{fixedTime:null})` → `page.clock.install({ time: '2026-10-21T14:02:48+09:00' })` → ops가 kim 구매 제한 1일 → kim으로 `/village/m4` `buy-btn[data-state=restricted]` → `page.clock.fastForward('24:00:00')` → 새로고침 없이 `buy-btn[data-state=buy]`·`restriction-banner` 없음, AC-8.16.6). AC-8.16.6 경계값·AC-8.16.7은 `restrictions.test`·`monitoring.test` |
| `99-full-flow.spec.ts` | `@p6` | **PRD §11 정식 시나리오 10단계, 기대 수치 그대로 단언**(5단계 `반려 1/2`, 7단계 별 3개 → lee 750 Lv.8 · 4.0 · 평가 9건) |

**MUST AC → 테스트 매핑 확인**: P6에서 S5가 PRD §8의 MUST AC 목록(**v2.2–v2.3: AC-8.1.6, 8.2.5, 8.14.1–8.14.4, 8.15.1–8.15.3, 8.16.1–8.16.7, 8.17.1–8.17.2 포함**)을 위 표·§5.1과 대조해 `qa/AC_MAP.md`(`| AC | 테스트 파일 · 테스트 이름 |`)를 만들고, 빈 칸이 0이어야 합니다. 단위 테스트로만 검증하는 AC(8.14.2 별점 매핑 5건, 8.16.6 경계값, 8.16.7 멱등·부분 제재·재발)는 단위 테스트 이름을 적습니다. SHOULD AC(8.1.2의 200ms, 8.8.3, §10 1초)는 측정값만 Audit에 기록합니다.

**E2E 공통 규칙** (`tests/e2e/helpers.ts`):
- `bootstrap(page, { persona='kim', theme='light', fixedTime='2026-10-21T14:02:48+09:00', fresh=true })`: `page.addInitScript`로 **`localStorage['oq:booted']`가 없을 때만** `localStorage.clear()` 후 `oq:booted='1'`, `oq:test='1'`, UI 상태(`oq:v1:ui`)를 설정합니다. 플래그가 `localStorage`에 있으므로 **같은 context의 두 번째 페이지(13-sync)나 페이지 이동·새로고침이 DB를 지우지 않습니다**(`sessionStorage`는 탭마다 달라 쓰지 않음). Playwright는 테스트마다 새 context라 테스트 간 격리는 유지됩니다. `fresh:false`면 초기화 스크립트를 건너뜁니다.
- `fixedTime`이 문자열이면 `page.clock.setFixedTime(fixedTime)`: **`Date`만 고정, `setTimeout`·`performance.now()`는 실제로 진행**(확인됨). `fixedTime:null`이면 아무 것도 하지 않고, 해당 테스트가 `page.clock.install()`을 직접 호출합니다(둘을 섞지 않음). 이후 `goto` → `html[data-hydrated="true"]` 대기.
- 페르소나 전환은 **UI로**(`persona-switcher` → `persona-option-{id}`), 결과는 `points-chip` 텍스트로 확인(운영자 `ops`는 `admin-badge`로 확인).
- 승인은 항상 `approveWithStars(page, stars)` = `approve-btn` → `rating-modal` → `rating-star-{stars}` → `rating-confirm` → `expectHyperFrame(page,'clear')`. 별점 없이 승인하는 경로는 없음.
- 에디터 입력: `fillEditor(page, testId, html)` = `window.__OQ_EDITORS__[testId].setContent(html)`. 별도 테스트 1개(`03`)는 실제 타이핑(TinyMCE iframe `frameLocator('[data-testid=quest-body-editor] iframe').locator('body')`, 폴백이면 contentEditable)으로 검증.
- 하이퍼 프레임 단언(`expectHyperFrame(page, variant)`): ① Node 쪽 `const t0 = Date.now()`(Node 시계는 가짜가 아님) ② `await expect(page.getByTestId('hyperframe')).toBeVisible()` ③ `await expect(...).toBeHidden({ timeout: 4000 })` ④ Node 경과 ≤ 2,400ms ⑤ `window.__OQ_TEST__.hyperframes.at(-1)`의 `closedAt − openedAt`(앱이 `performance.now()`로 기록, §1.6-2 예외)이 1,650–1,950. **`force: true` 클릭과 고정 `waitForTimeout`으로 오버레이를 우회하지 않음.** `page.clock.install()`을 쓰는 테스트(01의 타이머 테스트, 02)에서는 하이퍼 프레임 시간을 단언하지 않습니다(설치된 가짜 시계는 `performance.now()`도 멈춤).
- Teams 지연(AC-8.12.1)도 같은 방식: 앱 `__OQ_TEST__.teams.at(-1)`의 `replyAt − sentAt`(`performance.now()`) 1,000–1,400.
- 파일 첨부: `setInputFiles({ name: 'e2e_원본.xlsx', mimeType: '…', buffer })`.
- 콘솔: 모든 스펙에서 `page.on('console')`/`pageerror` 수집 → 테스트 끝에 error 0 단언.
- 각 스펙은 독립 실행 가능(앞 스펙 상태에 의존 금지). 모든 테스트 제목에 Phase 태그 1개.

### 5.3 필수 `data-testid` 목록 (정본 · 이름 변경 금지)

동적 접미사 `{no}` = 퀘스트 번호, `{id}` = 물품 id, `{u}` = UserId, `{k}` = key.

| 영역 | testid |
|---|---|
| 루트 | `app-root` · `skeleton` · `toast`(+`data-kind`) |
| GNB | `gnb` · `nav-dashboard` · `nav-quests` · `nav-village` · `timer-display` · `timer-ctl-toggle` · `timer-ctl-plus30` · `timer-ctl-expire` · `timer-ctl-reset` · `debug-menu` · `debug-reset-data` · `points-chip` · `persona-switcher` · `persona-option-{kim\|lee\|park\|ops}` · `theme-toggle` · `admin-badge` · `nav-admin` · `restriction-banner`(+`data-kinds`) |
| 공통 | `disabled-reason`(비활성 버튼 옆/툴팁 텍스트, `data-for`=버튼 testid) · `tooltip` · `confirm-modal` · `confirm-ok` · `confirm-cancel` |
| 대시보드 | `dash-character-card` · `pixel-sprite`(+`data-tier`, `data-name`) · `dash-level` · `dash-exp-bar` · `dash-points` · `dash-today-completed` · `dash-completed-total` · `dash-season-label` · `dash-season-dday` · `ranking-row-{1..5}`(+`data-user`) · `season-reset-btn` · `dash-daily-card` · `dash-daily-ring` · `dash-feed-quests` · `dash-feed-items` · `dash-rating` |
| 퀘스트 사이드바 | `side-quest-daily` · `side-quest-new` · `side-quest-board` · `side-mine-requested` · `side-mine-applied` · `side-mine-done` · `side-today-limit` |
| 일일 퀘스트 | `daily-card-{login\|post\|complete\|adopted}` · `daily-progress-{k}` · `daily-claim-{k}`(수령 버튼에만) · `daily-go-{k}`(미달성 이동 버튼, 활성) · `tier-table` · `tier-row-{bronze\|silver\|gold\|platinum\|diamond\|master}`(+`data-current`) |
| 퀘스트 등록 | `quest-form` · `quest-type-inquiry` · `quest-type-request` · `quest-title` · `quest-field` · `quest-due` · `quest-body-editor`(+`data-editor-kind`=`tinymce\|fallback`) · `quest-attach-input` · `quest-screenshot-input` · `sharepoint-badge`(+`data-url`) · `image-attachment` · `quest-bounty-slider` · `quest-bounty-input` · `quest-bounty-preset-{50\|100\|300\|500}` · `quest-escrow-preview` · `quest-reward-preview` · `quest-checklist` · `quest-submit` |
| 보안서약서 | `pledge-modal`(+`data-variant`=`create\|apply`) · `pledge-check-1` · `pledge-check-2` · `pledge-check-3` · `pledge-resolve-input` · `pledge-confirm` · `pledge-cancel` |
| 하이퍼 프레임 | `hyperframe`(+`data-variant`=`post\|clear`) · `hyperframe-title` · `hyperframe-reward-{base\|bounty\|exp}` · `hyperframe-stars`(+`data-stars`) |
| 게시판 | `board-new-btn` · `board-filter-type-{all\|inquiry\|request}` · `board-filter-status-{all\|recruiting\|in_progress\|revision\|done}` · `board-search` · `board-sort` · `board-row-{no}` · `board-row-status-{no}` · `board-row-views-{no}` · `board-row-applicants-{no}` · `board-pagination` |
| 퀘스트 상세 | `quest-detail` · `quest-status-badge`(+`data-status`) · `quest-views` · `quest-edit-btn` · `quest-delete-btn` · `quest-stepper` · `quest-apply-btn` · `applicant-row-{u}` · `adopt-btn-{u}` · `adopted-worker-strip` · `teams-open-btn` · `worker-editor`(+`data-locked`) · `worker-attach-input` · `submit-result-btn` · `submission-v{n}` · `review-pending-badge` · `reject-btn` · `reject-modal` · `reject-reason-input` · `reject-confirm` · `reject-reason-box` · `approve-btn` · `reward-summary` · `applicant-rating-{u}` · `worker-rating` · `reject-count`(+`data-count`) · `reject-last-warning` |
| 별점 모달 | `rating-modal` · `rating-star-{1..5}`(+`aria-checked`) · `rating-exp-preview` · `rating-confirm` · `rating-cancel` |
| Teams | `teams-chat`(+`data-context`) · `teams-header` · `teams-input` · `teams-send` · `teams-typing` · `teams-msg`(+`data-from`) · `teams-close` |
| 효성마을 목록 | `village-new-btn` · `village-tab-{all\|mapo\|hoehyeon\|banpo\|suseo\|changwon\|ulsan}`(+`data-count`) · `market-cat-{all\|digital\|living\|fashion\|books\|hobby}` · `market-search` · `market-sort` · `market-only-available` · `market-only-free` · `item-card-{id}` · `item-status-{id}`(+`data-status`) · `item-like-{id}` · `item-like-count-{id}` · `item-views-{id}` · `my-trades-btn` · `trade-history-drawer` · `trade-row`(+`data-type`) |
| 물품 폼 | `item-form` · `item-village-select` · `item-category-select` · `item-mode-sale` · `item-mode-free` · `item-price-input` · `item-title` · `item-body-editor` · `item-photo-preset-{monitor\|mug\|book\|pad\|keyboard\|vest\|ticket\|chair}` · `item-photo-input` · `item-photo-thumb` · `item-submit` |
| 물품 상세 | `item-detail` · `buy-btn`(+`data-state`, PRD §7.3) · `insufficient-modal` · `insufficient-close` · `item-teams-btn` · `seller-panel` · `seller-request-card` · `seller-approve-btn` · `seller-decline-btn` · `seller-status-menu` · `open-orgchart-btn` · `release-reservation-btn` · `item-edit-btn` · `item-delete-btn` · `settlement-panel` · `item-price` |
| 조직도 | `orgchart-modal` · `org-search` · `org-filter-affordable` · `org-site-{mapo\|hoehyeon\|banpo\|suseo\|changwon\|ulsan}` · `org-dept-{site}-{dept}` · `org-emp-{u}`(+`data-selected`) · `org-reserve-{u}` · `org-final-{u}` · `org-apply` · `org-cancel` |
| 운영자 콘솔 | `admin-page` · `admin-forbidden` · `admin-tab-{flags\|restrictions\|log}` · `admin-flag-count` · `admin-stale-seed` · `flag-row-{flagId}`(+`data-rule`, `data-severity`, `data-status`, `data-also`) · `flag-new-evidence-{flagId}` · `flag-evidence-{flagId}` · `flag-restrict-btn-{flagId}` · `flag-dismiss-btn-{flagId}` · `dismiss-modal` · `dismiss-reason-input` · `dismiss-confirm` · `restrict-new-btn` · `restrict-modal` · `restrict-user-select` · `restrict-kind-{quest_post\|purchase}` · `restrict-duration-{1d\|3d\|7d\|indefinite}` · `restrict-reason-input` · `restrict-confirm` · `restriction-row-{id}`(+`data-status`=`active\|expired\|lifted`, `data-kind`, `data-user`) · `restriction-lift-btn-{id}` · `lift-modal` · `lift-reason-input` · `lift-confirm` · `admin-log-row`(+`data-action`) |

### 5.4 테스트 모드 훅 (`src/lib/test-hooks.ts`)
`localStorage['oq:test']==='1'`일 때만 활성(런타임 플래그, 별도 빌드 없음). 프로덕션 동작은 동일.
- `window.__OQ_TEST__ = { getDB(), reset(), loadScenario(name: 'seed'|'ref07'|'timerExpired'|'limitApprove'|'rejectLimit'), playHyperFrame(variant, payload /* clear: { worker, bounty, fromLv, toLv, stars } */, opts?: { freezeAtMs?: number }), hyperframes: Array<{ variant, openedAt, closedAt, frames }>, teams: Array<{ threadKey, sentAt, replyAt }>, showTypingFor(threadKey) }`
- **시간 기록 규칙**: `hyperframes[].openedAt/closedAt`, `teams[].sentAt/replyAt`은 **`performance.now()`**로 기록합니다(§1.6-2 예외, PRD D38). `frames` = 오버레이가 열려 있는 동안의 rAF 콜백 수(AC-8.8.3 SHOULD 기록용).
- `window.__OQ_EDITORS__[testId] = { kind, setContent(html), getContent() }`
- `<html data-test-mode>` → 장식용 무한 애니메이션(배경 블롭 표류, 아이들 바운스, 오라)만 `animation-play-state: paused` (스크린샷 안정). 하이퍼 프레임·타이머·Teams 타이밍은 **변경하지 않음**.
- `ref07` 시나리오: q7을 lee 채택(10-21 10:40) → v1 제출(**10-21 13:40** — 고정 시각 14:02:48보다 과거, refs/07 본문·`Q3_원가분석_자동화_v1.xlsm` 2.4 MB) → Teams 스레드 4메시지(refs/07 대화, 모든 시각 14:02 이전).
- `limitApprove` 시나리오: q7을 **park** 채택(10-21 10:40) → park v1 제출(10-21 13:30, `reviewPending=true`). park은 시드상 `completedToday=2`. 요청자 kim 화면에서 `approve-btn` 비활성 + 사유 "작업자의 오늘 완료 한도(2/2) 도달 · 내일 승인할 수 있어요", `reject-btn` 활성(PRD §6.3).
- `timerExpired` 시나리오: `timer.endsAt = now`.
- `rejectLimit` 시나리오 (v2.2): q7을 lee 채택(10-21 10:40) → v1 제출 11:00 → 반려 11:30("표 서식 보완 부탁드려요") → v2 제출 12:00 → 반려 12:40("피벗 자동 생성이 빠졌어요") → v3 제출 13:30, `rejectCount=2`, `reviewPending=true`. kim 화면: `reject-count` "반려 2/2", `reject-btn` 비활성 + PRD D45 툴팁, `approve-btn` 활성.
- `ref07`·`limitApprove`·`rejectLimit` 모두 `rejectCount`를 명시하고(0·0·2), 승인 전이므로 RatingRecord를 추가하지 않습니다.

### 5.5 금지 패턴 자동 검사 (`npm run qa:forbidden` = 부록 A-13 `scripts/check-forbidden.mjs`)
검사 대상 `src/**`의 `.ts .tsx .css .mjs .js`(단 `src/styles/tokens.css` 복사본 제외). `tests/**`·`scripts/**`는 제외. 위반 시 exit 1. 검사 항목:
1. `tiny.cloud`, `apiKey=` 문자열
2. URL 호스트 허용 목록 외 `http(s)://` — **허용 호스트: `hyosung.sharepoint.com`, `fastly.jsdelivr.net`(Paperlogy CDN·DESIGN §2.1 preconnect), `www.w3.org`(인라인 SVG `xmlns`), `localhost`**
3. `onClick={() => {}}` (공백 변형 포함)
4. `#06B6D4`/`#06b6d4`(폐지된 시안, PRD D2 · DESIGN v1.2 §3.0)
5. `Math.random(` (파티클·시드는 mulberry32)
6. 유니코드 `Extended_Pictographic` 문자(⚡ ♥ 👁 ↔ © ™ 등 포함) — `teams-replies.ts`·`seed.ts` 포함 모든 소스. 아이콘은 Lucide(PRD D21)
7. `font-family` 선언의 1순위가 `Paperlogy`/`var(--font-sans)`/`inherit`가 아님
8. `console.log(`
9. `<img … src="http` (외부 이미지)
10. `localStorage`/`sessionStorage`/`new BroadcastChannel`을 모듈 최상위 `const`에서 접근
11. (v2.4) **효성 브랜드 hex 리터럴**(`#2E008B` `#3D00B8` `#6428E6` `#875FF0` `#C4C4E6` `#F1F1F9` `#FFBE19`, 대소문자 무관) — `src/styles/tokens.css`(검사 제외)와 `src/lib/brand.ts`(캔버스용 단일 출처) 밖에서 쓰면 위반. 컴포넌트는 `var(--hs-*)`·시맨틱 토큰·Tailwind `hs-*`/`accent-*`/`reward-*` 클래스로만 씁니다. 다른 hex(티어·스프라이트 고유색 등)는 이 규칙 대상이 아닙니다.

---

## 6. Visual QA 절차 (refs 대조)

목표: 픽셀 일치가 아니라 **ref와 같은 구도·정보·상태·토큰**. 자동 DOM 체크리스트 + 나란히 비교 이미지 + Right Brain 검토로 판정합니다.

> **색 기준 (v2.4, PRD D62)**: `refs/`는 효성 브랜드 팔레트 이전 이미지입니다. 화면 색은 DESIGN v1.2·`tokens.css`가 기준이며, ref와의 **보라 톤·노랑 차이는 FAIL이 아니라 허용 차이**로 기록합니다. 구도·정보·상태·라이트/다크 배경(`rgb(250, 250, 252)`·`rgb(9, 9, 11)`, 바뀌지 않음)은 그대로 판정합니다. Right Brain은 대신 DESIGN §3.0 노랑 사용 규칙(밝은 면 위 노랑 글자 없음)을 확인합니다.

> **v2.2 범위 (PRD D53)**: 별점 모달·운영자 콘솔·제재 배너·`admin-badge`에는 ref가 없으므로 **Visual QA(촬영·비교·구도 체크) 대상이 아닙니다**. DESIGN.md 컴포넌트(모달·표·배지·칩·버튼, 비활성 규칙 §7.1)로만 만들고, 검증은 E2E `14`·`15`의 DOM 단언이 맡습니다. 기존 ref 화면에 새로 붙는 요소(ref01 `dash-rating`, ref06 `applicant-rating-*`, ref07 `reject-count`·`worker-rating`, ref08 별 표시)는 구도 체크에서 **허용 차이**로 기록합니다. 촬영은 항상 비운영자 페르소나(kim/lee)이므로 GNB 탭은 3개 그대로입니다.

1. **촬영** `npm run test:visual` (`tests/visual/refs.spec.ts`, 테스트 1개 = ref 1장, 태그: 01·02 `@p3` · 03–05 `@p4a` · 06–08 `@p4b` · 09·10 `@p5`): 1920×1080, `deviceScaleFactor 1`, 고정 시각 `2026-10-21T14:02:48+09:00`, 시드 데이터, 테스트 모드, `document.fonts.ready` + `data-hydrated` 대기 → `qa/screens/0X_<ref이름>.png` 저장. 각 화면에서 아래 표의 **DOM 단언**을 함께 실행(실패 = 테스트 실패).
2. **비교 이미지** (`tests/visual/compare.spec.ts`, `@p6`, 해당 스크린샷이 없으면 그 ref는 건너뛰고 표에 `MISSING`): `page.setContent`로 왼쪽 `../refs/0X_*.png`, 오른쪽 `qa/screens/0X_*.png`를 각각 960px 폭으로 나란히 배치해 `qa/compare/0X.png` 생성(이미지는 base64 data URL로 로드).
3. **Right Brain 검토**: 비전 입력이 가능하면 `qa/compare/0X.png` 10장을 보고, 불가능하면 DOM 단언 결과 + 계산 스타일 덤프(`qa/screens/0X.styles.json`: 배경색·폰트·주요 요소 bbox)로 아래 "구도 체크"를 판정. 결과를 `qa/VISUAL_QA.md`에 `| ref | 항목 | PASS/FAIL | 근거 |`로 기록. **판정 규칙**: DOM 단언(1단계) = 게이트(FAIL이면 테스트 실패). 구도 체크(이 단계) = **기록용** — FAIL은 최대 2회 수정·재촬영하고, 그래도 FAIL이면 `unresolved`(근거·스크린샷 경로)로 남기고 진행(DoD를 막지 않음). PRD §8.13의 MAY 항목(ref10 "관심 표시" 칩 등)은 판정 대상 아님.
4. **공통 체크 (모든 화면)**: GNB 64px·탭 3개·타이머 칩·포인트 칩·페르소나·테마 토글 존재 / `getComputedStyle(body).fontFamily`가 Paperlogy로 시작하고 `document.fonts.check('800 16px Paperlogy')`가 true(네트워크·로컬 폰트 모두 없으면 `ENV-SKIP` 기록) / 라이트 배경 `rgb(250, 250, 252)`, 다크 `rgb(9, 9, 11)` / 가로 스크롤 없음 / 콘솔 에러 0 / 사이드바 폭 264±2px(사이드바 있는 화면) / 이모지 텍스트 없음.

| ref | 촬영 방법 | DOM 단언 (자동) | 구도 체크 (검토) |
|---|---|---|---|
| `01_dashboard_light` | kim, `/` | 카드 4개, `pixel-sprite[data-tier=gold]`, `dash-level`=Lv.12, `dash-points`=1,500, `dash-today-completed`=0/2, `dash-completed-total`=23, `dash-season-dday`=D-14, 진행률 78%, ranking 순서 park·choi·jung·kim·lee, `dash-daily-ring`=1/4, 피드 3+3 | 3열 비대칭(1fr·1.12fr·1.38fr), 카드1·2 세로 2칸, D-Day 다크 배너, 내 랭킹 행 강조 |
| `02_daily_quests_tiers` | kim, `/quests/daily` | 미션 카드 4, `daily-claim-login` 활성, `daily-go-post`·`daily-go-complete`·`daily-go-adopted` **활성** 이동 버튼(PRD §8.3), `tier-row-*` 6행, `tier-row-gold[data-current=true]` | 상단 4장 가로 배치, 하단 좌 캐릭터·우 티어표 |
| `03_quest_board` | kim, `/quests/board` | `board-row-*` 7개(첫 행 7), 분류 칩 카운트 7/3/4, 상태 칩 모집중 3·진행중 2·보완요청 1·완료 2, no.4 배지 "진행중 · 보완요청" | 필터 행 + 표 열 순서(No·분류·상태·제목·보상·요청자·지원자·조회·등록일) |
| `04_quest_create` | kim, `/quests/new`에서 요청·제목·본문(표)·현상금 300·`Q3_원가분석_원본.xlsx` 1.8MB 입력 | `sharepoint-badge[data-url]` 정확, `quest-escrow-preview` "1,500 → 1,200", `quest-reward-preview` "400 P + 100 EXP", `quest-checklist` 3/4, 에디터 툴바 표시·경고 배너 없음 | 본문 카드 + 우측 aside 3카드 |
| `05_security_pledge_modal` | 04 상태에서 등록 클릭 → 3개 체크 | `pledge-modal[role=dialog]`, 체크 전 `pledge-confirm` disabled → 체크 후 enabled, 에스크로 요약 | 딤 백드롭 위 중앙 640px 모달 |
| `06_quest_detail_recruiting` | kim, `/quests/7` | 상태 모집중, edit/delete enabled, `worker-editor[data-locked=true]`, 지원자 3행 + `adopt-btn-*` 3개, 보상 400 P | 본문 좌 + aside(보상·지원자) 우 |
| `07_quest_detail_inprogress_teams` | `loadScenario('ref07')`(제출 13:40), kim, `/quests/7`, Teams 열고 `showTypingFor` | edit/delete disabled + 사유, `adopted-worker-strip`, `submission-v1`, `reject-btn`·`approve-btn` 표시, `teams-chat` 4메시지 + `teams-typing` | 우하단 플로팅 Teams가 aside 아래 겹침 없이 배치 |
| `08_hyperframe_complete` | `ref07` → `playHyperFrame('clear', {worker:'lee', bounty:300, fromLv:7, toLv:8, stars:3}, {freezeAtMs:1000})` | `hyperframe[data-variant=clear]` z-index 9999, `hyperframe-reward-*` 3개 텍스트(+100 P / +300 P / +100 EXP), 타이틀 "LEVEL UP!" | 중앙 캐릭터·슬라임·검기 아크·코인 비 |
| `09_village_market_dark` | lee, dark, `/village` | `html[data-theme=dark]`, `item-card-*` 8개, 탭 카운트 8·2·1·1·1·1·2, m2·m3 예약중, m8 거래완료, m2·m6 무료나눔 | 좌 사이드바 + 4열×2행 카드 |
| `10_village_detail_orgchart` | kim, `/village/m1` → `open-orgchart-btn` → `org-reserve-jung` 선택 | `orgchart-modal`, 사업장 6개, 직원 행 ≥6(판매자 kim 제외), `org-emp-jung[data-selected=true]`, `org-reserve-lee`·`org-reserve-oh`·`org-final-lee`·`org-final-oh` disabled(PRD D17) | 좌 트리 + 우 목록 + 하단 안내 바 |

---

## 7. 알려진 막힘(Blocker)과 사전 결정된 폴백

| # | 증상 / 위험 | 사전 결정 (이 순서로 시도) |
|---|---|---|
| B1 | npm 레지스트리 접근 불가 | `npm install` 3회 재시도(`--prefer-offline`) → 기존 `node_modules` 사용 가능하면 계속 → 불가하면 Audit에 "ENV-BLOCKED: npm registry" 기록 후 **네트워크 불필요 작업(문서·코드 작성·tsc 가능한 범위)을 계속**하고 마지막 보고에 명시. 버전 변경으로 우회 금지 |
| B2 | `npx playwright install chromium` 실패, 또는 설치됐지만 실행 시 공유 라이브러리 오류 | ① 재시도 2회(`--with-deps` 없이) → ② Linux에서 라이브러리 오류면 `sudo -n true`가 성공할 때만 `npx playwright install-deps chromium`(비밀번호 프롬프트 금지) → ③ `PW_CHANNEL=chrome`(설치된 Google Chrome) → ④ `PW_CHANNEL=msedge` → ⑤ `PW_EXECUTABLE_PATH` = macOS `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` · Windows `C:\Program Files\Google\Chrome\Application\chrome.exe` · Linux `/usr/bin/google-chrome` 또는 `/usr/bin/chromium` → 모두 실패 시 "ENV-BLOCKED: browser" 기록, E2E·Visual 테스트는 **작성까지** 완료하고 §9.3 조건부 완료 |
| B3 | TinyMCE 문제(복사 실패, 스크립트 로드 실패, React 19 경고, iframe 입력 불가, 빌드 오류) | `RichEditor`가 `/tinymce/tinymce.min.js` 로드 8초 실패 또는 `onScriptsLoadError` 시 자동으로 `FallbackEditor`(contentEditable + `document.execCommand` 기반: 블록·B/I/U·글자색·정렬·리스트·링크·이미지(Base64)·표 삽입·코드블록, 동일 툴바 스킨, 우측 "TinyMCE 5.10.2" 태그 유지) 렌더. `public/tinymce/tinymce.min.js`가 없으면 먼저 `npm run postinstall`을 직접 실행. 같은 문제로 게이트 5회 실패 시 `.env.production`에 `NEXT_PUBLIC_EDITOR=fallback` 고정 + Audit 기록. TinyMCE 5 설정: `base_url:'/tinymce'`, `suffix:'.min'`, `plugins:'lists table link image code codesample paste autoresize'`, `toolbar:'undo redo \| formatselect fontselect \| bold italic underline forecolor \| alignleft aligncenter alignright \| bullist numlist \| link image table codesample'`, `menubar:'file edit view insert format table tools'`, `branding:false`, `paste_data_images:true`, `images_upload_handler`→Base64, `skin: theme==='dark'?'oxide-dark':'oxide'`, `content_css: theme==='dark'?'dark':'default'`, 테마 변경 시 `key={theme}`로 재마운트(내용 보존) |
| B4 | Paperlogy CDN 차단·오프라인 | `fonts.css`에서 같은 패밀리·굵기의 `@font-face`를 **CDN, 로컬** 순 `src`로 재선언(뒤 선언이 우선 적용됨). 로컬 파일은 `npm run fonts:fetch`(실패해도 exit 0). 둘 다 없으면 `'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',system-ui` 폴백 + Visual QA 폰트 항목 `ENV-SKIP` |
| B5 | `BroadcastChannel` 미지원 | `storage` 이벤트 + 같은 탭 `CustomEvent('oq:db')` 폴백(`sync.ts`) |
| B6 | 하이드레이션 경고 | 브라우저 값 읽기를 effect로 이동, 서버는 스켈레톤. 날짜 문자열은 클라이언트에서만 포맷. `suppressHydrationWarning`은 `<html>` 외 사용 금지 |
| B7 | 타이머 테스트 불안정 | `page.clock.install` + `fastForward`/`runFor`(02-timer, 01의 타이머 테스트), 나머지는 `setFixedTime`. 도메인 시각은 `clock.now()`, 경과시간은 `performance.now()`(§1.6-2). `waitForTimeout`으로 시간 맞추기 금지 |
| B8 | 1.8초 오버레이가 E2E 클릭을 가림 | `hyperframe` 보임 → 숨김 대기 후 다음 단계(§5.2 `expectHyperFrame`). 오버레이 시간 단축·우회 금지(PRD D3). 시간 측정은 `__OQ_TEST__.hyperframes`(`performance.now()`) + Node 경과 |
| B9 | 린트가 생성물 검사·설정 파일 경고 | ESLint `ignores`에 `public/**`, `.next/**`, `qa/**`, 리포트 폴더 포함. 설정 파일은 이름 있는 const export(부록 A-5·A-6·A-7), `scripts/**` `no-console: off` |
| B10 | `npm audit`가 tinymce 5 취약점 경고 | 무시. `npm audit fix --force` 금지(버전이 바뀜). Audit에 "알려진 경고, 시연용 로컬 앱" 기록 |
| B11 | `next build` 내장 린트가 flat config와 충돌 | ① FlatCompat 설정 확인 → ② 그래도 실패하면 `next.config.ts`의 `eslint.ignoreDuringBuilds: true`로 바꾸고 `npm run lint`를 DoD에서 별도 실행(이미 포함) + Audit 기록 |
| B12 | StrictMode 이중 effect로 중복 실행 | cleanup + 리듀서 가드로 멱등(§1.6-5) |
| B13 | 캔버스 SSR | `PixelSprite`는 서버에서 같은 크기의 빈 `<canvas>`/span을 렌더, effect에서 그림. `toDataURL` 캐시(키 = 스프라이트명+티어+배율) |
| B14 | `localStorage` 용량 초과(Base64 사진) | 업로드 이미지를 캔버스로 최대 800px 축소·JPEG .82 재인코딩, 장당 2MB·5장 제한, `QuotaExceededError` 시 롤백 + 토스트 "사진 용량이 커서 저장하지 못했어요" |
| B15 | 포트 3100 사용 중 | `PORT_E2E=3101 npm run test:e2e` |
| B16 | lucide-react 1.x 아이콘 이름 불일치 | 같은 의미의 다른 Lucide 아이콘으로 대체(예: `swords`→`sword`), 다른 아이콘 라이브러리 설치 금지 |
| B17 | Copilot 컨텍스트 한도·세션 단절 | Phase마다 Audit의 "현재 Phase / 다음 작업"과 Memory Hot 갱신. 새 세션은 §0-5 |
| B18 | 서브에이전트 기능 없음 | 역할 순차 수행 + dual-brain single-agent fallback 명시(§2 Skill 4-3) |
| B19 | `source/mock/` 없음 | 스프라이트는 `motion/officequest_intro.html`에서 포팅, 시드는 PRD §9만으로 작성 |
| B20 | View Transitions API 미지원 브라우저 | 다크 전환은 즉시 교체(DESIGN §9.6과 동일) |
| B21 | 문서가 가리키는 참조 파일이 없음(`skills/dual-brain/references/memory.md`·`runtime.md`, `source/mock/*` 등) | §0-1 MISSING 규칙: 건너뛰고 Audit에 `MISSING: <경로> → 대체 규칙` 기록 후 계속. memory.md 없으면 §10.3 형식만 사용, runtime.md 없으면 §2 Skill 4-2/4-3대로 |
| B22 | npm 11 `install-scripts … not yet covered by allowScripts` 경고 | 무시(빌드·vitest·루트 postinstall 정상, §1.3). `public/tinymce/tinymce.min.js`가 없으면 `npm run postinstall` 직접 실행 → 그래도 없으면 B3 |
| B23 | Phase 게이트 테스트가 아직 없는 기능에 의존 | 테스트의 Phase 태그가 틀린 것. §5.2·§6 표의 태그로 고치고(나중 Phase로 이동) Audit 기록. 단언 약화·skip 금지 |

---

## 8. "사용자에게 묻지 말고 이렇게 결정" 표

| 상황 | 결정 |
|---|---|
| 패키지 최신 버전이 있음 | §1.1 고정 버전 유지. 업그레이드 금지 |
| peer dependency 경고 | 설치가 성공하면 무시. `--legacy-peer-deps`는 설치 실패 시에만 사용하고 Audit 기록 |
| PRD와 DESIGN 수치가 다름 | 기능·규칙은 PRD, 시각 값은 DESIGN. PRD §2에 있으면 그것 |
| DESIGN과 ref가 다름 | 구도·카피는 ref, 수치는 DESIGN §12(앱 값) → D6 |
| 카피 문구가 정의되지 않음 | DESIGN §11 톤(짧은 해요체, 동사형 CTA)으로 작성 |
| 아이콘 선택 | DESIGN §10 목록 → 없으면 의미가 가장 가까운 Lucide |
| 반응형 범위 | 1280px 이상 최적, 1280 미만은 2열 접기·가로 스크롤 없음까지만 |
| 빈 상태(목록 0개) | 일러스트 없이 한 줄 안내 + 다음 행동 버튼(예: "조건에 맞는 퀘스트가 없어요" + `[필터 초기화]`) |
| 오류 처리 | `DomainError` → 토스트(danger) + 사유 그대로. 페이지 크래시 금지(`error.tsx` 경계) |
| 존재하지 않는 `/quests/[no]`·`/village/[id]` | `not-found.tsx`("요청한 항목을 찾을 수 없어요" + 목록으로) |
| 날짜·시간 포맷 | `MM.DD`(목록), `YYYY.MM.DD HH:mm`(상세), 상대시간("2시간 전")은 24시간 이내만 |
| 숫자 포맷 | `toLocaleString('en-US')` 콤마 + 단위(`P`, `EXP`) |
| 페이지네이션 | 게시판 10행/페이지, 효성마을 12장/페이지 |
| 정렬 기본값 | 최신순(createdAt desc) |
| ID 생성 | `counters` 증가값(`m9`, `t123`), `crypto.randomUUID` 사용 안 함(테스트 결정성) |
| 파일 업로드 실제 저장 | 하지 않음. 이름·크기·(이미지면 Base64)만 저장 |
| 퀘스트 수정 화면에서 유형·현상금 | 읽기 전용 표시(PRD D25) |
| 지원 취소 기능 | 만들지 않음(원본 범위 밖) |
| NPC가 요청자인 퀘스트 승인 | 불가 상태로 둠(PRD D16) |
| 테스트가 불안정(flaky) | 타이밍 하드코딩 대신 testid 상태 대기로 수정. 재시도(retries) 늘리기·테스트 삭제·단언 약화 금지 |
| 테스트와 PRD가 다름 | PRD가 정답. 테스트를 PRD에 맞게 고침 |
| 같은 오류 5회 반복 | §0-4 규칙: §7 폴백 → 그래도 실패면 Audit `unresolved`(오류·재현 명령) 기록 후 다음 작업·Phase 진행. §9에서 재검사 |
| 문서가 가리키는 파일이 없음 | §0-1 MISSING 규칙(B21) |
| 환경 때문에 명령 자체를 실행할 수 없음 | §7 폴백 후 §9.3 조건부 완료. 무한 재시도 금지 |
| 별점 모달·운영자 콘솔의 시각 기준이 없음 | PRD D53: DESIGN 컴포넌트 조합. 새 색·새 컴포넌트 만들지 않음. 표는 게시판 표(§8.6) 스타일 재사용 |
| 반려 2회 후 다른 해결 경로(운영자 중재 등)를 넣고 싶음 | 넣지 않음(PRD D45: 승인만, 별 1개 가능) |
| 의심 활동 임계값·기간 조정이 필요해 보임 | `MONITOR_RULES`·`MONITOR_WINDOW_DAYS` 상수 그대로(PRD §3). 바꾸면 §9.7 기대값이 깨짐 |
| 운영자가 퀘스트·거래 버튼을 눌러야 할 것 같음 | 하지 않음. 운영자는 열람만, 쓰기 액션은 `FORBIDDEN`(PRD D47) |
| 제재 기간 표시·만료 처리 방식 | PRD §6.10: `clock.now()` 비교로 자동 만료, 별도 만료 액션·로그 없음. 화면은 `useNow(1000)`으로 다시 평가 |
| 이미 해제·처리된 항목을 다시 처리 / 일부 종류만 활성인 제재 | PRD D57: `INVALID_STATE`, 로그 없음 / D55: 나머지 종류만 생성 |
| 같은 쌍의 R1·R3, 고가 1건 거래, 무혐의 후 재발 | PRD D59 / D58 / D60 그대로. 시드 기대 플래그는 4건 |
| taste 스킬이 보라·글래스·그라데이션을 지적 | §2 Skill 1 표에 따라 허용 범위인지 확인, 범위 안이면 무시 |
| sprite-gen 스킬이 Python/API 설치를 요구 | 하지 않음(§2 Skill 3) |
| dual-brain 서브에이전트 생성 불가 | single-agent fallback(§2 Skill 4-3) |
| git 커밋 | Phase 종료 게이트 통과 시 1커밋(`phase N: …`). push·force push·히스토리 재작성 금지 |
| 루트 문서(PRD·DESIGN·refs·skills·tokens.css) 수정 필요해 보임 | 수정하지 않음. 해석은 Audit에 기록 |

---

## 9. 최종 완료 조건 (Definition of Done — Autopilot 종료 조건)

### 9.1 명령 (전부 exit 0)
```bash
cd officequest
npm ci                       # 또는 최초 1회 npm install (postinstall이 public/tinymce 생성)
npm run verify:tokens        # tokens.css 바이트 동일
npm run qa:forbidden         # §5.5 금지 패턴 0
npm run typecheck            # tsc --noEmit, 에러 0
npm run lint                 # eslint --max-warnings=0
npm run test:unit            # §5.1 전부 통과
npm run build                # next build 성공
npm run test:e2e             # 새로 빌드 후 §5.2 17개 스펙(00–15, 99) 전부 통과, 태그 필터 없음
npm run test:visual          # 새로 빌드 후 §6 10장 DOM 단언 통과 + qa/screens, qa/compare 생성
# (= npm run verify 한 번으로 동일)
```

### 9.2 체크리스트
- [ ] PRD §9 시드: 퀘스트 7건(모집중 3·진행중 1·보완요청 1·완료 2), 물품 8건(6개 마을·거래가능·예약중·거래완료·무료나눔) — `seed.test.ts`·`00-smoke`로 증명
- [ ] PRD §11 전체 플로우 수치(kim 1,500→1,200→0 / lee 300→700→1,900 / lee Lv.7→8 / 2/2) — `99-full-flow` 통과
- [ ] `qa/AC_MAP.md`: PRD §8의 MUST AC 전부 테스트에 매핑(빈 칸 0, v2.2 AC-8.1.6·8.2.5·8.14–8.17 포함)
- [ ] v2.2–v2.3: `rating.test` 별점 매핑 5건, `monitoring.test` 시드 플래그 **4건**(PRD §9.7), `14-rating-reject`(별 5개 포함)·`15-admin-moderation` 통과
- [ ] `qa/VISUAL_QA.md`: ref 10장의 **DOM 단언 전부 PASS**(또는 근거 있는 `ENV-SKIP`). 구도 체크는 기록용(§6-3)
- [ ] `DUAL_BRAIN_AUDIT.md`: 체크포인트 #1–#6 + 최종 감리, 모든 지적이 fixed/rejected/unresolved로 판정, `unresolved` 중 MUST 요구사항 0건(ENV-BLOCKED 제외)
- [ ] 콘솔 에러 0, 외부 이미지 요청 0, Tiny Cloud 요청 0 (`00-smoke`)
- [ ] `.github/copilot-instructions.md` 존재
- [ ] Audit 맨 위 "결과 요약"에 위 명령 결과와 실행 시각(KST) 기록, TinyMCE 5.10.2 고정 사유 1줄(PRD D39)

### 9.3 조건부 완료 (ENV-BLOCKED일 때의 종료 규칙)
§7 B1(레지스트리)·B2(브라우저)처럼 **환경 때문에** 특정 명령을 실행할 수 없고 그 폴백까지 모두 실패했다면, 무한 재시도하지 말고 아래를 모두 만족할 때 **"조건부 완료(CONDITIONAL-DONE)"로 종료**합니다.
1. 차단되지 않은 §9.1 명령은 모두 exit 0 (예: 브라우저 차단이면 `verify:tokens`·`qa:forbidden`·`typecheck`·`lint`·`test:unit`·`build` 통과).
2. 브라우저 차단이면 `npx playwright test --list`가 성공하고, 목록에 §5.2의 17개 파일과 Visual 10개 테스트가 모두 있음(테스트는 작성 완료 상태).
3. Audit 맨 위에 `ENV-BLOCKED: <무엇> · 시도한 폴백 · 마지막 오류 3줄 · 사람이 실행할 재현 명령(예: npm run test:e2e && npm run test:visual)`을 기록.
4. ENV와 무관한 `unresolved` MUST 0건.
마지막 보고 첫 줄에 `CONDITIONAL-DONE (ENV-BLOCKED: …)`이라고 씁니다. 환경 문제가 아닌 실패(코드·테스트 실패)는 조건부 완료 사유가 될 수 없습니다.

---

### 9.4 시연 준비 (v2.3, PRD D61)
- 시연 당일 시작 직전에 GNB DEBUG → `[데이터 초기화]`(`debug-reset-data`) 1회. 아카이브 의심 사례가 `seedNow` 기준으로 다시 만들어져 운영자 콘솔이 4건으로 시작합니다(초기화하지 않으면 시드 적재 +6.04일부터 줄어듦, PRD §9.7 수명).
- 운영자 콘솔에 `admin-stale-seed` 경고가 보이면 같은 초기화를 합니다.
- 현상금 500 P 이상 퀘스트를 30분 안에 승인하면 R4 high 플래그가 새로 생깁니다(의도된 동작). 다른 데모 흐름에서 원치 않으면 30분 뒤에 승인합니다.

## 10. `DUAL_BRAIN_AUDIT.md` 형식

### 10.1 파일 맨 위 (항상 최신 유지)
```md
# DUAL_BRAIN_AUDIT — Office Quest
- 현재 Phase: P4b Quest 상세·Teams / 다음 작업: RejectModal + `npm run test:e2e -- --grep "@p0\b|@p2\b|@p3\b|@p4a\b|@p4b\b"` 재실행
- 리뷰 모드: subagents (Right=…, Left=…) | single-agent fallback
- 결과 요약 (최종): verify:tokens ✓ · qa:forbidden ✓ · typecheck ✓ · lint ✓ · unit 64/64 ✓ · build ✓ · e2e 17/17 ✓ · visual 10/10 ✓ — 2026-10-22 03:10 KST
- 상태: DONE | CONDITIONAL-DONE (ENV-BLOCKED: …)
- MISSING: (예) skills/dual-brain/references/memory.md → §10.3 형식 사용
- 환경 제약: (예) ENV-SKIP Paperlogy 로컬 폰트 없음, CDN 정상
```

### 10.2 체크포인트 블록 (Phase마다 1개 + 최종 1개)
```md
## Checkpoint #2 — P2 Shell & Design (2026-10-21 18:40 KST)
**Brief**: 목표=P2 Exit Gate / AC=8.1.1–8.1.5, 8.2.1–8.2.4 / 변경 파일=src/components/shell/**, dashboard/** / 메모리 주장=D6 사이드바 264px(Hot, 확인됨)
**Right Brain (거시·UX/디자인)**: 
| ID | 지적 | 근거(ref/스크린샷/파일:줄) | 제안 |
**Left Brain (미시·로직/빌드)**:
| ID | 지적 | 트리거 → 결과 | 근거(테스트/코드) | 상태: confirmed/contradicted/unverified |
**종합·조치**:
| ID | 판정 (fixed / rejected / unresolved) | 커밋·파일 | 재검증 (실행한 명령과 결과) |
**게이트 결과**: build ✓ lint ✓ e2e `@p0|@p2` ✓
**메모리 변경**: (없음 | Hot에 'X' 추가)
```
- 좌뇌 필수 확인 항목(매 체크포인트, 해당되는 것): 에스크로 선차감·환불, 일 2회 한도(지원·승인), 2시간 타이머 3개 버튼 비활성 + 효성마을 예외, 문의/요청 첨부 분기, 예약자 전용 구매, 포인트 불변식, TypeScript strict 무결성, 빌드·E2E 결과.
  - v2.4 추가: 브랜드 hex는 tokens.css·`brand.ts`에만(`qa:forbidden` 11), `brand.test` 대조, 다크 보라 텍스트는 `--accent-fg`.
  - v2.3 추가: 게이트 grep 단어 경계(`@p5\b`가 `@p5b`를 고르지 않음), 제재 상태 우선순위·멱등(`INVALID_STATE`)·부분 제재·id 정규 순서, 플래그 4건·재발·수명, 별점 집계↔원장 불변식, vitest TZ 고정.
  - v2.2 추가: **별점 → EXP 매핑 5종과 P 불변**(별 3개 = 기존 수치), 별점 평균 반올림·평가 수 누적, **반려 2회 한도**(3번째 `REJECT_LIMIT`, 이후 승인만), **운영자 권한 경계**(비운영자 `admin/*` 거부, 운영자 플레이어 액션 거부), **제재 가드**(등록·구매·조직도 대상, 가드 순서, 만료 시각 경계), 감사 로그 append-only, `detectFlags` 결정성·14일 경계·시드 5건, 운영자가 랭킹·조직도·불변식에서 제외됨.
- 우뇌 필수 확인 항목(v2.4 추가: 효성 브랜드 색이 DESIGN §3.0 매핑대로 쓰였는지, 노랑은 채움+`#2E008B` 글자로만·밝은 면 위 노랑 글자 없음, 다크 보라 텍스트 가독성 / v2.2 추가: 별점 모달이 승인 흐름을 끊지 않는지, 운영자 콘솔 표의 근거 가독성, 제재 배너·비활성 사유가 사용자에게 이해되는지, 새 UI가 DESIGN 컴포넌트만 쓰는지): Paperlogy 실제 로드, 보라 라이트/다크 대비(본문 AA), 벤토 위계·정렬, 도트 스프라이트 선명도(정수 배율), 하이퍼 프레임 임팩트·프레임 드랍, 빈 화면·깨진 UI, taste/mengto 슬롭 체크(§2), refs 구도 일치.

### 10.3 `.dual-brain/MEMORY.md` 초기 내용
```md
# Dual-Brain Memory — Office Quest
## Hot
- 스펙 우선순위: PRD §2 > PRD > DESIGN/tokens > refs > Harness > skills (근거: PRD §0.2)
- 앱 위치 ./officequest, 고정 버전 Harness §1.1 (근거: PRD D23, Harness §1.1)
- 하이퍼 프레임 1,800ms, JS 타이머 닫힘, 경과시간은 performance.now (근거: PRD D3, D28, D38)
- E2E 게이트는 Phase 태그 누적 grep, test:e2e는 항상 새 빌드 (근거: Harness §4, §1.4)
- 별점 EXP 50/75/100/125/150, 별 3개 = 기존 수치, 반려 최대 2회, 운영자 ops는 플레이어 아님 (근거: PRD D40, D45, D47)
## Warm
## Cold
## Archived
```

---

## 11. 금지 사항 요약 (위반 시 해당 게이트 실패)
- 고정 버전 변경, Next 16 / Tailwind 4 / TypeScript 7 도입
- 루트 `tokens.css`·`DESIGN.md`·`PRD.md`·`refs/`·`skills/` 수정
- 외부 이미지·Tiny Cloud·API Key·런타임 AI 생성(스프라이트 포함)
- 테스트 삭제·`test.skip`·단언 약화·retries 증가로 통과시키기
- 하이퍼 프레임 1,800ms 변경 또는 E2E에서 우회
- 빈 클릭 핸들러, 이유 없는 비활성 버튼, 이모지 UI, 시스템 폰트 노출
- 사용자에게 질문하고 대기하기
- 부록 A 설정 파일을 임의로 줄이거나 익명 default export로 바꾸기
- Phase 태그 없는 테스트, 아직 없는 기능을 앞 Phase 게이트에 넣기

---

## 부록 A. 검증된 설정·스크립트 파일 (그대로 복사 · `officequest/` 기준 경로)

아래 파일은 2026-10-21 Linux(Node 20.19.2, npm 11.21.0) 스크래치 프로젝트에서 §1.3 고정 버전으로 `typecheck`(빌드 전)·`lint --max-warnings=0`·`test:unit`·`build`·`playwright test --list`·`test:e2e -- --grep @p0`까지 **실제로 통과한 내용 그대로**입니다(§1.5 검증 기록). 수정이 필요하면 Audit에 사유를 기록합니다.

**A-1 package.json**: `npm init -y`로 생긴 파일의 `scripts`를 §1.4 블록으로 교체하고 `"private": true`를 추가합니다. 의존성 블록은 §1.3 ①이 만든 그대로 둡니다.

### A-2 tsconfig.json (전체)

`tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "*.ts", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "public", ".next", "playwright-report", "test-results"]
}
```

### A-3 next-env.d.ts (`next build`가 같은 내용으로 덮어써도 무방)

`next-env.d.ts`
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### A-4 next.config.ts

`next.config.ts`
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: { dirs: ['src', 'tests'], ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: { unoptimized: true },
};

export default nextConfig;
```

### A-5 eslint.config.mjs

`eslint.config.mjs`
```js
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'public/**', 'playwright-report/**', 'test-results/**', 'qa/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  { files: ['scripts/**/*.mjs'], rules: { 'no-console': 'off' } },
];

export default eslintConfig;
```

### A-6 postcss.config.mjs

`postcss.config.mjs`
```js
const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;
```

### A-7 tailwind.config.ts (DESIGN.md v1.2 §3.7 theme 그대로)

`tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss';

// DESIGN.md §3.7 theme 그대로 + content. 익명 default export 금지.
const config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Paperlogy', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)', sunken: 'var(--surface-sunken)' },
        ink: { DEFAULT: 'var(--text)', sub: 'var(--text-sub)', muted: 'var(--text-muted)', faint: 'var(--text-faint)' },
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)', accent: 'var(--border-accent)' },
        accent: { DEFAULT: 'var(--accent)', hover: 'var(--accent-hover)', pressed: 'var(--accent-pressed)', 2: 'var(--accent-2)', fg: 'var(--accent-fg)', soft: 'var(--accent-soft)' },
        hs: { 'purple-900': 'var(--hs-purple-900)', 'purple-800': 'var(--hs-purple-800)', 'purple-600': 'var(--hs-purple-600)', 'purple-400': 'var(--hs-purple-400)', 'lavender-200': 'var(--hs-lavender-200)', 'lavender-50': 'var(--hs-lavender-50)', yellow: 'var(--hs-yellow)' },
        reward: { DEFAULT: 'var(--reward)', on: 'var(--on-reward)', soft: 'var(--reward-soft)' },
        purple: { 50:'var(--purple-50)',100:'var(--purple-100)',200:'var(--purple-200)',300:'var(--purple-300)',400:'var(--purple-400)',500:'var(--purple-500)',600:'var(--purple-600)',700:'var(--purple-700)',800:'var(--purple-800)',900:'var(--purple-900)' },
        neon: { DEFAULT: 'var(--neon)', soft: 'var(--neon-soft)', pale: 'var(--neon-pale)' },
        success: { bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
        warning: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
        danger:  { bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)' },
        info:    { bg: 'var(--info-bg)',    fg: 'var(--info-fg)' },
        revise:  { bg: 'var(--revise-bg)', line: 'var(--revise-border)', fg: 'var(--revise-fg)', strong: 'var(--revise-strong)' },
        tier: { bronze:'#CD7F32', silver:'#94A3B8', gold:'var(--tier-gold)', platinum:'#67E8F9', diamond:'#22D3EE', master:'#A855F7' },
        teams: { header:'#464775', brand:'#5B5FC7', logo:'#7B83EB' },
        sharepoint: '#036C70',
      },
      fontSize: {
        display: ['96px', { lineHeight: '1', letterSpacing: '-0.045em', fontWeight: '900' }],
        hero: ['48px', { lineHeight: '1.14', letterSpacing: '-0.045em', fontWeight: '800' }],
        h1: ['36px', { lineHeight: '1.1', letterSpacing: '-0.045em', fontWeight: '800' }],
        h2: ['28px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '800' }],
        h3: ['20px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '800' }],
        'num-xl': ['64px', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
        'num-l': ['26px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        body: ['16px', { lineHeight: '1.5' }], 'body-s': ['15px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.4' }], micro: ['12px', { lineHeight: '1.3' }],
      },
      borderRadius: { xs:'6px', sm:'10px', md:'14px', lg:'18px', xl:'22px', '2xl':'28px', pill:'999px' },
      boxShadow: {
        card: 'var(--sh-card)', float: 'var(--sh-float)', pop: 'var(--sh-pop)', btn: 'var(--sh-btn)',
        focus: 'var(--sh-focus)', seg: 'var(--sh-seg)', knob: 'var(--sh-knob)', neon: 'var(--sh-neon)',
      },
      zIndex: { gnb:'200', dropdown:'300', chat:'800', backdrop:'1000', modal:'1010', toast:'1100', hyper:'9999' },
      spacing: { 'gnb':'64px', 'sidebar':'264px', '4.5':'18px', '5.5':'22px', '7':'28px' },
      transitionTimingFunction: {
        out:'cubic-bezier(.33,1,.68,1)', expo:'cubic-bezier(.16,1,.3,1)', in:'cubic-bezier(.32,0,.67,0)',
        inout:'cubic-bezier(.65,0,.35,1)', back:'cubic-bezier(.34,1.56,.64,1)', spring:'cubic-bezier(.3,1.9,.5,1)',
      },
      transitionDuration: { fast:'150ms', base:'220ms', slow:'400ms', enter:'550ms', hyper:'1800ms' },
      keyframes: {
        'pop-in': { '0%': { opacity:'0', transform:'scale(.3) translateY(24px)' }, '100%': { opacity:'1', transform:'none' } },
        'rise-in': { '0%': { opacity:'0', transform:'translateY(24px)', filter:'blur(8px)' }, '100%': { opacity:'1', transform:'none', filter:'blur(0)' } },
        'px-bob': { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-4px)' } },
        'typing-dot': { '0%,60%,100%': { transform:'translateY(0)' }, '30%': { transform:'translateY(-5px)' } },
        'rays-spin': { to: { transform:'rotate(30deg)' } },
      },
      animation: {
        'pop-in':'pop-in 500ms cubic-bezier(.3,1.9,.5,1) both', 'rise-in':'rise-in 550ms cubic-bezier(.16,1,.3,1) both',
        'px-bob':'px-bob 1.4s steps(2) infinite', 'typing-dot':'typing-dot 1s ease-in-out infinite', 'rays':'rays-spin 1.8s linear',
      },
    },
  },
} satisfies Config;

export default config;
```

### A-8 vitest.config.ts

`vitest.config.ts`
```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// 단위 테스트 시간대 고정(PRD §0.3 KST). OS 시간대(UTC CI 등)와 무관하게 같은 결과. Windows에서도 동작(npm 스크립트의 TZ= 접두어 대신).
process.env.TZ = 'Asia/Seoul';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node', env: { TZ: 'Asia/Seoul' } },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
```

### A-9 playwright.config.ts

`playwright.config.ts`
```ts
import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.PORT_E2E ?? 3100);
const channel = process.env.PW_CHANNEL || undefined; // 'chrome' | 'msedge' (Harness §7 B2)
const executablePath = process.env.PW_EXECUTABLE_PATH || undefined;

export default defineConfig({
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 6_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'ko-KR',
    timezoneId: 'Asia/Seoul',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    channel,
    launchOptions: { executablePath },
  },
  // 빌드는 npm 스크립트(test:e2e / test:visual)가 항상 먼저 수행. 여기서는 서버만 띄움.
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'e2e', testDir: 'tests/e2e', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'visual', testDir: 'tests/visual', use: { viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } },
  ],
});
```

### A-10 .gitignore

`.gitignore`
```text
node_modules
.next
public/tinymce
playwright-report
test-results
*.tsbuildinfo
```

### A-11 P0 최소 앱 (P1·P2에서 확장)

`src/app/globals.css`
```css
@import '../styles/tokens.css';
@import '../styles/fonts.css';
@import '../styles/app-layout.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`src/styles/fonts.css`
```css
/* P0: 비워 둠. P2에서 S2가 B4 규칙(같은 @font-face의 src를 CDN → 로컬 순)으로 6개 굵기를 재선언한다. */
```

`src/styles/app-layout.css`
```css
:root{--gnb-h:64px;--gnb-offset:16px;--sidebar-w:264px;--aside-w:400px;--page-pad:24px;--container-max:none;}
```

`src/app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = { title: 'Office Quest' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`
```tsx
export default function Home() {
  return <main data-testid="app-root" className="p-6 font-sans">Hello Office Quest</main>;
}
```

`src/lib/clock.ts`
```ts
export const now = (): number => Date.now();
export const elapsedMs = (): number => performance.now();
```

### A-12 scripts: copy-tinymce · fetch-fonts · verify-tokens

`scripts/copy-tinymce.mjs`
```js
// node_modules/tinymce → public/tinymce (TinyMCE 5.10.2 셀프호스팅). 실패해도 설치를 막지 않음(exit 0).
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = join(process.cwd(), 'node_modules', 'tinymce');
const dest = join(process.cwd(), 'public', 'tinymce');
try {
  if (!existsSync(join(src, 'tinymce.min.js'))) throw new Error('node_modules/tinymce/tinymce.min.js not found');
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  for (const entry of ['tinymce.min.js', 'icons', 'plugins', 'skins', 'themes', 'license.txt']) {
    const from = join(src, entry);
    if (existsSync(from)) cpSync(from, join(dest, entry), { recursive: true });
  }
  console.log('[copy-tinymce] copied to public/tinymce');
} catch (err) {
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, '.missing'), String(err));
  console.warn('[copy-tinymce] FAILED, FallbackEditor will be used:', String(err));
}
```

`scripts/fetch-fonts.mjs`
```js
// tokens.css의 Paperlogy woff2 URL 6개를 public/fonts/paperlogy/에 같은 파일명으로 저장. 실패해도 exit 0.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const css = readFileSync(join(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8');
const urls = [...new Set([...css.matchAll(/url\('([^']+Paperlogy-[^']+\.woff2)'\)/g)].map((m) => m[1]))];
const dest = join(process.cwd(), 'public', 'fonts', 'paperlogy');
mkdirSync(dest, { recursive: true });
let ok = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(join(dest, basename(url)), Buffer.from(await res.arrayBuffer()));
    ok += 1;
  } catch (err) {
    console.warn(`[fetch-fonts] skip ${url}: ${String(err)}`);
  }
}
console.log(`[fetch-fonts] ${ok}/${urls.length} saved to public/fonts/paperlogy`);
```

`scripts/verify-tokens.mjs`
```js
// src/styles/tokens.css 가 저장소 루트 tokens.css 와 바이트 단위로 같은지 검사.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(process.cwd(), '..', 'tokens.css');
const copy = join(process.cwd(), 'src', 'styles', 'tokens.css');
if (!existsSync(root)) { console.warn('[verify-tokens] ../tokens.css not found (MISSING) - skipped'); process.exit(0); }
if (!existsSync(copy)) { console.error('[verify-tokens] src/styles/tokens.css missing. Run: cp ../tokens.css src/styles/tokens.css'); process.exit(1); }
if (!readFileSync(root).equals(readFileSync(copy))) { console.error('[verify-tokens] src/styles/tokens.css differs from ../tokens.css'); process.exit(1); }
console.log('[verify-tokens] OK');
```

### A-13 scripts/check-forbidden.mjs (§5.5)

`scripts/check-forbidden.mjs`
```js
// Harness §5.5 금지 패턴 검사. 대상: src/** (src/styles/tokens.css 제외). 위반 시 exit 1.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const SKIP = new Set([join('src', 'styles', 'tokens.css')]);
const BRAND_OK = new Set([join('src', 'lib', 'brand.ts')]); // 캔버스용 BRAND 상수 (DESIGN §3.0)
const BRAND_HEX = /#(?:2E008B|3D00B8|6428E6|875FF0|C4C4E6|F1F1F9|FFBE19)(?![0-9a-f])/i;
const URL_ALLOW = ['hyosung.sharepoint.com', 'fastly.jsdelivr.net', 'www.w3.org', 'localhost'];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|css|mjs|js)$/.test(name)) files.push(p);
  }
})(ROOT);

const rules = [
  { id: 1, name: 'Tiny Cloud / API key', re: /tiny\.cloud|apiKey\s*=/ },
  { id: 3, name: 'empty onClick handler', re: /onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}/ },
  { id: 4, name: 'retired cyan #06B6D4 (PRD D2)', re: /#06B6D4/i },
  { id: 5, name: 'Math.random (use mulberry32)', re: /Math\.random\(/ },
  { id: 6, name: 'emoji / pictographic symbol (use Lucide)', re: /\p{Extended_Pictographic}/u },
  { id: 8, name: 'console.log', re: /console\.log\(/ },
  { id: 9, name: 'external <img src="http', re: /<img[^>]+src=["']https?:/ },
  { id: 10, name: 'browser storage/channel at module top level', re: /^(?:export\s+)?const\s+\w+\s*=\s*(?:window\.)?(?:localStorage|sessionStorage|new BroadcastChannel)/m },
];

const violations = [];
for (const file of files) {
  const rel = relative(process.cwd(), file);
  if (SKIP.has(rel)) continue;
  const text = readFileSync(file, 'utf8');
  for (const r of rules) {
    const m = text.match(r.re);
    if (m) violations.push(`${rel}: [${r.id}] ${r.name} -> ${JSON.stringify(m[0].slice(0, 60))}`);
  }
  if (!BRAND_OK.has(rel)) {
    const b = text.match(BRAND_HEX);
    if (b) violations.push(`${rel}: [11] brand hex outside tokens (use var(--hs-*) or BRAND) -> ${b[0]}`);
  }
  for (const m of text.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
    if (!URL_ALLOW.includes(m[1])) violations.push(`${rel}: [2] URL host not allowed -> ${m[1]}`);
  }
  for (const m of text.matchAll(/font-family\s*:\s*([^;}{]+)/g)) {
    const first = m[1].trim().split(',')[0].replace(/['"]/g, '').trim();
    if (!/^(Paperlogy|var\(--font-sans\)|inherit)$/.test(first)) violations.push(`${rel}: [7] font-family first face is ${first}`);
  }
}
if (violations.length) { console.error(violations.join('\n')); console.error(`[qa:forbidden] ${violations.length} violation(s)`); process.exit(1); }
console.log(`[qa:forbidden] OK (${files.length} files)`);
```

### A-14 P0 테스트 (스모크)

`tests/unit/smoke.test.ts`
```ts
import { describe, expect, it } from 'vitest';
import { now } from '@/lib/clock';

describe('P0 smoke', () => {
  it('clock.now returns epoch ms', () => {
    expect(now()).toBeGreaterThan(0);
  });
  it('unit tests run in Asia/Seoul', () => {
    expect(new Date('2026-10-21T05:02:48Z').getHours()).toBe(14);
  });
});
```

`tests/e2e/00-smoke.spec.ts`
```ts
import { expect, test } from '@playwright/test';

// P0 게이트용. P2 이후에도 계속 유효해야 하므로 "Hello" 문구가 아니라 app-root만 단언한다.
test('P0 root responds 200 and renders app-root @p0', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.getByTestId('app-root')).toBeVisible();
});
```

---

## 변경 이력

| 버전 | 날짜 (KST) | 변경 | 리뷰 항목 |
|---|---|---|---|
| v2.1 | 2026-10-21 | `skills/`를 패키지에 포함(taste·mengto·sprite-gen·SOURCES.md + `dual-brain/SKILL.md`·`README.ko.md`), §0-1 MISSING 규칙, B21, Skill 4-2·4-7의 `references/runtime.md`·`memory.md` 폴백 | 검수봇 차단-1 · 분석봇 차단 5 |
| v2.1 | 2026-10-21 | §1.6-2 예외: 경과시간은 `performance.now()`(`elapsedMs()`), §5.2 `expectHyperFrame`(앱 기록 + Node 경과), §5.4 시간 기록 규칙. `setFixedTime`에서 Date 차이 0·performance 차이 1,800 실행 확인 | 검수봇 차단-2 · 분석봇 차단 4 |
| v2.1 | 2026-10-21 | P0 스모크 스펙(`00-smoke` `@p0`)·`smoke.test.ts` 추가, P0 게이트에 `--list` ≥1 + `--grep @p0` | 분석봇 차단 1 |
| v2.1 | 2026-10-21 | Phase 태그(`@p0`…`@p6`) + 누적 `--grep` 게이트. `00` 전체·`02` → P5, `06`·`12-hyperframe` → P3, Visual 01·02 → P3(P2 이후 판정), 08 → P4b | 분석봇 차단 2·3 |
| v2.1 | 2026-10-21 | P4를 P4a(에디터·폼·서약·게시판)·P4b(상세·반려·Teams)로 분할, 체크포인트 #1–#5 | 분석봇 보통(P4 과대) |
| v2.1 | 2026-10-21 | AC-8.1.4: 01의 별도 테스트에서 `fixedTime:null` + `clock.install` + `runFor(3000)` | 검수봇 높음-1 · 분석봇 차단 4 |
| v2.1 | 2026-10-21 | `test:e2e`/`test:visual` = `npm run build && playwright test`, webServer는 `next start`만, `reuseExistingServer: false`, `test -f` 제거 | 검수봇 높음-2 · 분석봇 높음(낡은 빌드) |
| v2.1 | 2026-10-21 | §5.5 이모지 규칙 설명(⚡ ♥ 👁 ↔ © 포함) + PRD D21 정합 | 검수봇 높음-3 · 분석봇 높음(이모지) |
| v2.1 | 2026-10-21 | `11-board.spec.ts`(AC-8.6.1–8.6.4), AC-8.2.4를 01에, `qa/AC_MAP.md` 매핑 의무, E2E 12 → 15개 | 검수봇 높음-4 |
| v2.1 | 2026-10-21 | `limitApprove` 시나리오, `05`가 사용 | 검수봇 높음-5 |
| v2.1 | 2026-10-21 | §9.3 조건부 완료(CONDITIONAL-DONE), §8 행 추가 | 검수봇 높음-6 |
| v2.1 | 2026-10-21 | §0-4: 5회 실패 → 폴백 → `unresolved` 기록 후 진입 허용, §9에서 재검사(P0 typecheck·build 예외) | 분석봇 높음(5회 규칙 모순) |
| v2.1 | 2026-10-21 | `09-teams-orgchart` → `09-teams`(P4b) + `10-orgchart`(P5), `10-sync` → `13-sync-persistence` | 분석봇 높음(P4 게이트 실행 불가) |
| v2.1 | 2026-10-21 | bootstrap 플래그를 `localStorage['oq:booted']`로, `fresh` 옵션 | 분석봇 높음(두 번째 페이지가 DB 삭제) |
| v2.1 | 2026-10-21 | 완전한 `tsconfig.json` + `next-env.d.ts`(빌드 전 typecheck 통과), 부록 A 전체 파일 | 분석봇 높음(TS17004·TS1259) |
| v2.1 | 2026-10-21 | `eslint.config.mjs`·`postcss`·`tailwind` 이름 있는 export, `scripts/**` no-console off | 분석봇 높음(lint 경고·스크립트 console) |
| v2.1 | 2026-10-21 | tailwind `spacing.sidebar` 264px(DESIGN v1.1 정정과 일치) | 분석봇 높음(280 vs 264) |
| v2.1 | 2026-10-21 | 금지 URL 허용을 호스트 단위로(`fastly.jsdelivr.net`, `www.w3.org`, `localhost` 추가), `check-forbidden.mjs` 실물 제공 | 검수봇 보통-1 · 분석봇 높음(preconnect·SVG) |
| v2.1 | 2026-10-21 | Visual QA: DOM 단언 = 게이트, 구도 체크 = 기록(2회 수정 후 `unresolved` 허용) | 검수봇 보통-2 · 분석봇 보통(주관 판정) |
| v2.1 | 2026-10-21 | Visual 02 미달성 버튼 = 활성 `daily-go-{k}`, §5.3에 testid 추가 | 검수봇 보통-3 |
| v2.1 | 2026-10-21 | §5.3 testid 표 `\|` 이스케이프 | 검수봇 보통-9 |
| v2.1 | 2026-10-21 | `ref07` 제출 시각 15:40 → 13:40 | 검수봇 보통-10 |
| v2.1 | 2026-10-21 | Teams·NPC 멱등 단위 테스트(`pendingReplyFor`) | 검수봇 보통-11 |
| v2.1 | 2026-10-21 | §1.3을 ①설치 ②파일 작성 ③실행으로 분리(`MODULE_NOT_FOUND` 방지) | 분석봇 보통(실행 순서) |
| v2.1 | 2026-10-21 | `npx playwright install chromium`(no `--with-deps`) 우선, B2에 Linux `sudo -n` 조건부 install-deps·Windows/Linux Chrome 경로 | 분석봇 보통(OS 의존) · 사용자 요청(sudo 프롬프트 회피) |
| v2.1 | 2026-10-21 | npm 10.x 권장, npm 11 allowScripts 경고 무시(B22), B3에 `npm run postinstall` 직접 실행 | 분석봇 보통(npm 11) |
| v2.1 | 2026-10-21 | `fetch-fonts.mjs` = tokens.css의 6개 URL, 같은 파일명, 실패해도 exit 0 | 분석봇 보통(폰트 출처) |
| v2.1 | 2026-10-21 | TinyMCE 5.10.2 유지 + Audit 사유(PRD D39) | 분석봇 보통(5.10.9) |
| v2.1 | 2026-10-21 | 시즌 진행률 78%(`Math.ceil`) 단위 테스트 기대값 | 분석봇 보통(77 vs 78) |
| v2.2 | 2026-10-21 | 별점 품질 보상: P1 도메인(`rating.ts`), P4b `RatingModal`·하이퍼 프레임 별·별점 표시, `approveWithStars` 헬퍼, `rating.test`(매핑 5건), `14-rating-reject`(별 5개 E2E), `04`·`99`는 별 3개로 기존 수치 유지, Visual 08 payload `stars:3` | 팀원 피드백 1 |
| v2.2 | 2026-10-21 | 반려 최대 2회: `quest-machine.test` 보강, `rejectLimit` 시나리오, `14`에 카운터·마지막 경고·한도 테스트, testid `reject-count`·`reject-last-warning` | 팀원 피드백 2 |
| v2.2 | 2026-10-21 | 운영자 모니터링 & 제재: 폴더(`monitoring.ts`·`restrictions.ts`·`admin-machine.ts`, `components/admin/**`, `app/admin`), 소유권(S4 admin, S2 배너·탭), **P5b Phase + 체크포인트 #6**(P6 진입 = P5b 통과), `restrictions.test`·`monitoring.test`, `15-admin-moderation`, 운영자 testid, §8 결정 5행, 좌뇌/우뇌 체크 항목 | 팀원 피드백 3 |
| v2.2 | 2026-10-21 | 새 UI는 Visual QA 비교 제외(§6 머리말), AC_MAP에 v2.2 AC 포함, DoD E2E 15 → 17개, 체크포인트 #1–#6 | 팀원 피드백 1–3 |
| v2.3 | 2026-10-21 | 본문의 별 문자(U+2605) 표기를 "별 N개"로 통일(PRD §0.3, `qa:forbidden` 규칙 6과 일치) | 검수봇 v2.2 높음-1 |
| v2.3 | 2026-10-21 | `15-admin-moderation`: 조직도 단계를 lee → m4(판매자 lee) → `org-reserve-kim`·`org-final-kim` 비활성 + "구매 제한 중인 직원이에요"로 교체(m1은 판매자 kim이라 실행 불가) | 검수봇 v2.2 높음-2 |
| v2.3 | 2026-10-21 | `quest-machine.test`에 반려 2/2 + 완료 2/2 조합 1건 | 검수봇 v2.2 보통-2 |
| v2.3 | 2026-10-21 | `14-rating-reject`: `ref07` kim 화면 `worker-rating` = "4.1 · 평가 8건" | 검수봇 v2.2 보통-4 |
| v2.3 | 2026-10-21 | `14`·`quest-machine.test`의 `rejectLimit` 기대값에 P 300→700, 3.8 · 평가 9건 | 검수봇 v2.2 보통-5 |
| v2.3 | 2026-10-21 | 모든 게이트 `--grep`에 태그별 `\b`(단어 경계), 태그 규칙·셸 안내, Playwright `--list`로 실측(§1.5 v2.3 검증) | 분석봇 v2.2 차단-1 |
| v2.3 | 2026-10-21 | `15`의 조직도 단계 m1 → m4(검수봇 높음-2와 같은 수정), 제재 id r2/r3/r4·`data-kind`, `restriction-lift-btn-r4`, 플래그 4행·`pair_5star__choi__kang`로 제재 | 분석봇 v2.2 차단-2 · 높음(id 결정성) |
| v2.3 | 2026-10-21 | `00-smoke` `@p5` 라우트 목록에서 `/admin` 제외, `/admin` 200은 `15`(@p5b) | 분석봇 v2.2 높음(/admin 라우트) |
| v2.3 | 2026-10-21 | `restrictions.test`: 상태 우선순위(r1 = lifted), 재해제·재처리 `INVALID_STATE`, 부분 제재, kinds 순서 무관 id, 중복 dispatch 로그 1건 (`ALREADY_RESTRICTED` 삭제) | 분석봇 v2.2 높음(우선순위·멱등·부분 제재·id) |
| v2.3 | 2026-10-21 | `15`에 `clock.fastForward` 만료 재렌더 테스트, testid `admin-stale-seed`·`flag-new-evidence-*`·`data-also`·`data-user` | 분석봇 v2.2 보통(만료 재렌더 · 재발 · 시드 수명) |
| v2.3 | 2026-10-21 | vitest `TZ='Asia/Seoul'` 고정(A-8, Windows 호환) + `smoke.test` 시간대 단언 | 분석봇 v2.2 보통(시간대) |
| v2.3 | 2026-10-21 | `monitoring.test`: 시드 4건, R1/R3 중복 제거, R5 새 조건, 재발, 수명, `isSeedStale`; `invariants.test` 별점 불변식 3개; §9.4 시연 준비; §8 결정 행 2개 | 분석봇 v2.2 보통(오탐·중복 · 재발 · 시드 수명 · 집계↔원장) |
| v2.4 | 2026-10-21 | 효성 브랜드 팔레트(DESIGN v1.2): A-7 Tailwind 색을 변수 참조로(`accent.hover/pressed/fg`, `hs.*`, `reward.*`, `purple.*`, `neon.*`, `tier.gold`, `shadow.neon`), `src/lib/brand.ts` + `brand.test`, `qa:forbidden` 규칙 11(브랜드 hex는 tokens.css·brand.ts에만)·규칙 4 이름(폐지된 시안), §6 ref 색 차이 = 허용 차이, 좌뇌·우뇌 체크 항목 | 팀 요청(효성 공식 팔레트) |
| v2.0 | 2026-10-21 | 최초 Autopilot 제출본 | — |
