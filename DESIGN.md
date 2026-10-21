# 오피스퀘스트 × 효성마을 — 디자인 시스템 스펙 (v1.1)

> 이 문서는 20초 소개 모션그래픽(`motion/officequest_intro.html`)과 레퍼런스 화면(`refs/01–10`)에 **실제로 사용한 값**을 그대로 옮겨 고정한 테마 명세입니다.
> Next.js(App Router) + Tailwind CSS 빌더가 이 문서와 `tokens.css`만으로 동일한 룩을 재현하는 것이 목표입니다.
> 표기: 영상의 가상 스테이지는 1920×1080 기준입니다. 실제 앱(1440px 데스크톱 기준)에서는 **§6 레이아웃의 앱 값**을 사용하고, 영상 전용 대형 수치(디스플레이 176px 등)는 랜딩/스플래시에만 씁니다.
>
> **앱 구현 시 우선순위**: 이 문서와 `PRD.md` §2 결정 테이블이 다르면 **PRD §2가 이깁니다**(특히 D2·D6·D28·D35·D36). v1.1에서 앱 값(사이드바 264px, 최대 폭 제한 없음, 스탯 타일 3개, 일일 링 1/4, 조직도 lg 모달, reduced-motion 1.8s)을 PRD·refs와 맞췄습니다(맨 끝 변경 이력).

---

## 0. 파일 구성

| 파일 | 용도 |
|---|---|
| `tokens.css` | 모든 CSS 변수(라이트 `:root`, 다크 `[data-theme="dark"]`/`.dark`), Paperlogy `@font-face`, reduced-motion 폴백 |
| `DESIGN.md` | 이 문서 — 원칙, 스케일, 컴포넌트 스펙, 모션, 스프라이트, 매핑표 |
| `refs/01–10_*.png` | 1920×1080 실제 앱 페이지 레퍼런스(정적 목업 캡처) |
| `motion/officequest_intro.html` | 살아있는 레퍼런스. `?t=초` 로 특정 순간 정지 가능 (예: `?t=4.6`) |

---

## 1. 디자인 원칙

1. **정제된 기본, 화려한 순간.** 평소 UI는 Apple/Linear처럼 조용하고 밀도 높게. 화려함(빛줄기·파티클·네온)은 **하이퍼 프레임 오버레이와 티어 진화**에만 집중시킨다.
2. **보라는 신호다.** 보라(`#6D28D9`/`#7C3AED`)는 "행동·내 것·진행"에만 쓴다. 화면의 보라 면적은 10% 이하.
3. **숫자가 주인공.** 포인트·EXP·D-Day·순위는 ExtraBold/Black + tabular-nums로 크게. 단위(P, EXP, 건)는 한 단계 작고 보라색.
4. **게임은 픽셀로만.** 게임 감성은 코드로 그린 16×16/24×24 도트 스프라이트로 표현한다. 일러스트·3D·이모지로 대체하지 않는다.
5. **상태는 언제나 보인다.** 모든 퀘스트/매물은 상태 배지를 가지고, 잠김·비활성은 이유를 텍스트로 말한다(예: "지정 예약자 외 구매 불가").

### Anti-AI-Slop Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| 단색 보라 + 미세한 2-stop 그라데이션(`#6D28D9→#8B5CF6`)만 프로그레스/슬라이더에 | 무지개·네온 그라데이션 배경, 그라데이션 텍스트 남발 (예외: LEVEL UP 타이틀 1곳) |
| 1px `#E4E4E7` 보더 + 아주 옅은 보라 그림자로 깊이 | 두꺼운 드롭섀도, 컬러 글로우 카드(다크 마스터 카드 1곳 예외) |
| Paperlogy 단일 패밀리, 굵기(400–900)로만 위계 | 시스템 폰트, 2개 이상 폰트 혼용, 이탤릭 |
| 헤드라인 자간 `-0.045em`, 본문 `-0.01em` | 기본 자간 그대로 둔 큰 제목 |
| 8의 배수 중심 여백(16/20/24/28), 카드 패딩 24–28px 고정 | 카드마다 다른 패딩, 어색하게 큰 빈 공간 |
| Lucide 라인 아이콘 stroke 2 | 이모지 아이콘(헤드리스/윈도우에서 깨짐), 채워진 아이콘 혼용 |
| 배경은 `#FAFAFC` + 32px 도트 그리드(마스크로 가장자리 페이드) | 보라 블롭을 진하게 깔기 (블롭 알파 ≤ .16) |
| 카피는 짧은 존댓말·명사형 ("퀘스트 등록하기") | "🚀 혁신적인 AI 기반 솔루션!" 같은 과장 문구 |

---

## 2. 타이포그래피

### 2.1 @font-face (tokens.css에 포함)
```css
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-5Medium.woff2') format('woff2');font-weight:500;font-display:swap}
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-6SemiBold.woff2') format('woff2');font-weight:600;font-display:swap}
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-8ExtraBold.woff2') format('woff2');font-weight:800;font-display:swap}
@font-face{font-family:'Paperlogy';src:url('https://fastly.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-9Black.woff2') format('woff2');font-weight:900;font-display:swap}
```
- 필수: 400 / 600 / 800. 권장 추가: 500, 700, 900(로고·D-Day·LEVEL UP).
- `<link rel="preconnect" href="https://fastly.jsdelivr.net" crossorigin>` 를 `<head>`에 둔다.
- 전역: `font-family:'Paperlogy',system-ui,sans-serif; -webkit-font-smoothing:antialiased; letter-spacing:-0.01em;`
- **숫자**: 포인트·타이머·순위·카운터에 `font-variant-numeric: tabular-nums` (`.num` 클래스). Paperlogy가 tnum을 완전히 지원하지 않으므로 **카운트다운 타이머는 글자별 `<span>`을 `width:.6em; text-align:center`로 고정폭** 처리한다(영상과 동일).

### 2.2 타입 스케일

| 토큰 | 영상(1920) | 앱(1440) | Weight | Line-height | Letter-spacing | 용도 |
|---|---|---|---|---|---|---|
| display | 176px | 96px | 900 | 1.0 | -0.045em | 로고 "OFFICE QUEST" (QUEST만 보라) |
| hero | 78px | 48px | 800 | 1.14 | -0.045em | 섹션 대형 헤드라인 |
| h1 | 58px | 36px | 800 | 1.1 | -0.045em | 페이지 제목 |
| h2 | 34px | 28px | 800 | 1.2 | -0.03em | 모달·폼 제목, 캐릭터 이름 |
| h3 | 22px | 20px | 800 | 1.3 | -0.02em | 카드 제목 |
| num-xl | 84px | 64px | 900 | 1.0 | -0.05em | D-Day |
| num-l | 30px | 26px | 800–900 | 1.1 | -0.02em | 보유 포인트, 현상금 값, 가격 |
| body-l | 23px | 18px | 500 | 1.65 | -0.01em | 리드 문단 |
| body | 18–19px | 16px | 600–700 | 1.5 | -0.01em | 리스트 제목, 버튼 |
| body-s | 16px | 15px | 600 | 1.5 | 0 | 라벨, 메타 |
| caption | 14px | 13px | 600–700 | 1.4 | 0 | 보조 메타, 배지(13–15px) |
| micro | 12px | 12px | 700 | 1.3 | 0 | 메시지 발신자, 작은 태그 |
| eyebrow | 14px | 12px | 800 | 1 | 0.24em, 대문자 | "BRONZE", "TIER 01" |

- 위계는 **크기 + 굵기 + 색(`--text` / `--text-sub` / `--text-muted`)** 3가지로만 만든다.
- 헤드라인 강조어는 `<em>`(이탤릭 해제)로 보라색: `em{font-style:normal;color:var(--accent)}`.

---

## 3. 컬러 토큰

전체 값은 `tokens.css` 참조. 핵심 표:

### 3.1 기본 (라이트 / 다크)

| 토큰 | Light | Dark (Gaming) | 용도 |
|---|---|---|---|
| `--bg` | `#FAFAFC` | `#09090B` | 페이지 배경 |
| `--surface` | `#FFFFFF` | `#12121A` | 카드 |
| `--surface-muted` | `#F4F4F5` | `#1A1A24` | 세그먼트 트랙, 스탯 타일, 썸네일 배경 |
| `--glass` | `rgba(255,255,255,.72)` | `rgba(18,18,26,.72)` | GNB, 플로팅 칩 |
| `--text` | `#18181B` | `#FAFAFA` | 본문/제목 |
| `--text-sub` | `#52525B` | `#D4D4D8` | 2차 텍스트 |
| `--text-muted` | `#71717A` | `#A1A1AA` | 라벨/메타 |
| `--border` | `#E4E4E7` | `#27272A` | 모든 1px 보더 |
| `--accent` | `#6D28D9` | `#A855F7` | 주 버튼, 활성, 강조 |
| `--accent-2` | `#7C3AED` | `#A855F7` | 그라데이션 끝, 링 |
| `--accent-soft` | `#EDE9FE` | `rgba(168,85,247,.14)` | 소프트 배지, 선택 행 배경 |
| `--dot-grid` | `#DCDCE2` (32px 점) | `#17171F` (64px 라인 그리드) | 배경 패턴 |

### 3.2 퍼플 스케일
`50 #FAF5FF · 100 #EDE9FE · 200 #DDD6FE · 300 #C4B5FD · 400 #A78BFA · 500 #8B5CF6 · 600 #7C3AED · 700 #6D28D9 · 800 #5B21B6 · 900 #4C1D95` / 네온: `#A855F7`, `#C084FC`, `#E9D5FF`

### 3.3 시맨틱

| 의미 | Light bg / fg | Dark bg / fg |
|---|---|---|
| success | `#DCFCE7` / `#15803D` | `rgba(34,197,94,.14)` / `#4ADE80` |
| warning | `#FEF3C7` / `#B45309` | `rgba(245,158,11,.15)` / `#FBBF24` |
| danger | `#FEE2E2` / `#B91C1C` | `rgba(239,68,68,.15)` / `#F87171` |
| info | `#E0F2FE` / `#0369A1` | `rgba(14,165,233,.15)` / `#38BDF8` |
| revise(반려) | `#FFF7ED` + 보더 `#FED7AA` / `#9A3412`, 버튼 `#C2410C` | `rgba(249,115,22,.12)` / `#FDBA74` |

### 3.4 상태 배지

| 도메인 | 상태 | 토큰 | Light |
|---|---|---|---|
| 업무 퀘스트 | 모집중 | `--st-recruit-*` | success |
| | 진행중 | `--st-progress-*` | accent-soft / accent |
| | 진행중(보완요청) | `--st-revise-*` | warning |
| | 완료 | `--st-done-*` | `#E4E4E7` / `#52525B` (승인 직후 순간엔 solid 보라) |
| 효성마을 | 거래가능 | `--mk-avail-*` | success |
| | 예약중 | `--mk-reserved-*` | warning |
| | 거래완료 | `--mk-sold-*` | 회색 + 썸네일 opacity .35 |
| | 무료나눔(가격 자리) | `--mk-free-fg` | `#16A34A` / dark `#4ADE80`, 800 |
| 퀘스트 유형 | 문의 | `--qt-inquiry-*` | info |
| | 요청 | `--qt-request-*` | accent-soft / accent |

### 3.5 티어 6색

| 티어 | 메인 | 배지 bg / fg | 장비(스프라이트) | 레벨 |
|---|---|---|---|---|
| 브론즈 | `#CD7F32` | `#FFEDD5` / `#9A3412` | 남색 사원복 + 브론즈 핀 | Lv.1–4 |
| 실버 | `#94A3B8` | `#F1F5F9` / `#475569` | + 은빛 망토 | Lv.5–9 |
| 골드 | `#F5B301` | `#FEF3C7` / `#A16207` | 황금 갑옷 + 어깨판 + 레드 망토 + 왕관 픽셀 | Lv.10–14 |
| 플래티넘 | `#67E8F9` | `#E2E8F0` / `#334155` | 백금 갑옷 + 사이버 고글 + 오라 | Lv.15–19 |
| 다이아 | `#22D3EE` | `#CFFAFE` / `#0E7490` | 크리스탈 날개 | Lv.20–24 |
| 마스터 | `#A855F7` | `#F3E8FF` / `#7E22CE` | 보라 갑옷 + 보라 날개 + 전설의 검 + 번개 오라 | Lv.25+ |

티어 진행 라인: `linear-gradient(90deg,#CD7F32,#94A3B8,#F5B301,#CBD5E1,#22D3EE,#A855F7)`

### 3.6 연동 브랜드색
Teams 헤더 `#464775`, 브랜드/전송 `#5B5FC7`, 로고 타일 `#7B83EB`, 채팅 배경 `#F5F5F7`, 내 말풍선 `#E8EBFA`, 온라인 `#22C55E` · SharePoint `#036C70` + 보조 점 `#1A9BA1` · 코인 `#FBBF24`/`#D97706`

### 3.7 Tailwind `theme.extend`
```js
// tailwind.config.ts — 색은 모두 CSS 변수를 참조(라이트/다크 자동 전환). 실제 파일(content·타입 포함, 검증 완료)은 Harness.md 부록 A
const config = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Paperlogy', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)' },
        ink: { DEFAULT: 'var(--text)', sub: 'var(--text-sub)', muted: 'var(--text-muted)', faint: 'var(--text-faint)' },
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)', accent: 'var(--border-accent)' },
        accent: { DEFAULT: 'var(--accent)', 2: 'var(--accent-2)', soft: 'var(--accent-soft)' },
        purple: { 50:'#FAF5FF',100:'#EDE9FE',200:'#DDD6FE',300:'#C4B5FD',400:'#A78BFA',500:'#8B5CF6',600:'#7C3AED',700:'#6D28D9',800:'#5B21B6',900:'#4C1D95' },
        neon: { DEFAULT: '#A855F7', soft: '#C084FC', pale: '#E9D5FF' },
        success: { bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
        warning: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
        danger:  { bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)' },
        info:    { bg: 'var(--info-bg)',    fg: 'var(--info-fg)' },
        revise:  { bg: 'var(--revise-bg)', line: 'var(--revise-border)', fg: 'var(--revise-fg)', strong: 'var(--revise-strong)' },
        tier: { bronze:'#CD7F32', silver:'#94A3B8', gold:'#F5B301', platinum:'#67E8F9', diamond:'#22D3EE', master:'#A855F7' },
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
        focus: 'var(--sh-focus)', seg: 'var(--sh-seg)', knob: 'var(--sh-knob)', neon: '0 0 0 1px rgba(168,85,247,.5),0 0 60px -10px rgba(168,85,247,.6)',
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
};
export default config; // 익명 default export 금지(ESLint import/no-anonymous-default-export 경고 → lint --max-warnings=0 실패)
```

---

## 4. 스페이싱 · 라디우스 · 그림자 · 글래스 · Z-index

**Spacing (4px 베이스)**: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 64
- 카드 패딩: 기본 24px, 대형(벤토) 26×28px · 벤토 갭 20px · 패널 갭 28px · 리스트 행 간격 6–12px · 폼 섹션 간격 22–28px

**Radius**: 6(인라인 태그) · 10(작은 버튼·아이콘 타일) · 14(버튼·인풋·리스트 행) · 18(지원자 행·내부 박스) · 22(GNB·히어로 박스) · 28(카드) · 999(배지·칩·필)
- 규칙: **안쪽 요소의 라디우스 = 바깥 라디우스 − 패딩** 에 가깝게 (카드 28 → 내부 박스 18–22).

**Shadow** (`tokens.css` `--sh-*`)
- card: `0 1px 2px rgba(24,24,27,.04), 0 18px 48px -20px rgba(76,29,149,.16)` (다크: `0 0 0 1px rgba(168,85,247,.04), 0 24px 64px -24px rgba(0,0,0,.7)`)
- btn(primary): `0 10px 24px -10px rgba(109,40,217,.7), inset 0 1px 0 rgba(255,255,255,.18)`
- focus: `0 0 0 4px rgba(124,58,237,.12)` + 보더 `#A78BFA`
- neon(다크 마스터 카드 전용): `0 0 0 1px rgba(168,85,247,.5), 0 0 60px -10px rgba(168,85,247,.6)`

**Glass**: `background: var(--glass); backdrop-filter: blur(20px); border:1px solid var(--border);` — GNB, 플로팅 컨트롤에만. 카드 본문에는 쓰지 않는다(가독성).

**Z-index**: base 0 · raised 10 · sticky 100 · GNB 200 · dropdown 300 · Teams 채팅 800 · 모달 backdrop 1000 / 모달 1010 · toast 1100 · **하이퍼 프레임 9999**

---

## 5. 배경

- Light: `--bg` + 점 그리드 `radial-gradient(circle,#DCDCE2 1.3px,transparent 1.6px) 0 0/32px 32px`, `mask-image: radial-gradient(ellipse at 50% 45%, #000 25%, transparent 78%)`
- Dark: 라인 그리드 `linear-gradient(#17171F 1px,transparent 1px), linear-gradient(90deg,#17171F 1px,transparent 1px) 0 0/64px 64px` + 같은 마스크
- 블롭 2개: 1100px 원, `radial-gradient(circle, rgba(124,58,237,.13), transparent 62%)` (다크 `rgba(168,85,247,.16)`), 20–30초 주기로 ±120px 천천히 표류

---

## 6. 레이아웃

| 항목 | 영상(1920) | 앱 기준(1440) |
|---|---|---|
| GNB 높이 | 78px, 상단 24px 띄운 플로팅 글래스 바, radius 22 | 64px, top 16px 플로팅 (또는 sticky top 0) |
| 페이지 좌우 패딩 | 32px | 24px |
| 컨테이너 | 1856px | 최대 폭 제한 없음(fr 단위 풀폭, PRD D6) |
| 사이드바(업무 퀘스트·효성마을) | 316px | 264px (`--sidebar-w`는 앱 `app-layout.css`에서 264px로 재정의, PRD D6) |
| 본문 상단 | GNB 하단 + 22px | GNB 하단 + 20px |

**GNB 구성 (좌→우)**: 로고 타일(44px, 보라 배경 + 픽셀 별) + "OFFICE QUEST" 900/24px + "× 효성마을" 600/16px muted → 탭 세그먼트(대시보드/업무 퀘스트/효성마을, 패딩 5px, 탭 높이 44px, 활성 탭 = 흰 필 슬라이드) → 우측: DEBUG 칩(1px dashed `#C4B5FD`) · 시연 타이머(검정 `#18181B` 칩, 보라 라이브 점, `HH:MM:SS` 800/21px 고정폭) · 포인트 칩(코인 스프라이트 + 1,500 P) · 페르소나 전환기(아바타 34px + 이름 + 부서 + chevron) · 테마 토글 아이콘 버튼(48px)

### 벤토 대시보드 그리드
```
grid-template-columns: 1fr 1.12fr 1.38fr;   grid-template-rows: 1fr 1fr;   gap: 20px;
height: calc(100vh - GNB - 상하 여백)  (최소 760px)
```
| 카드 | 위치 | 내용 |
|---|---|---|
| 내 캐릭터 스테이터스 | col 1, row 1–2 (`row-span-2`) | 히어로 박스(캐릭터 ×13, 티어 색 radial 오라, 바닥 줄무늬), Lv 배지, 장비 배지, 이름 34/800, 부서·마을, EXP 바(68%), 스탯 타일 3개(보유 포인트 1,500 P · 오늘 완료 0/2회 · 완료 퀘스트 23건, ref01) |
| 시즌 D-Day + TOP 5 | col 2, row 1–2 (`row-span-2`) | D-Day 다크 배너(`linear-gradient(135deg,#18181B,#27203A)`), 시즌 진행 바, 랭킹 행 5개(76px, 내 행 = accent-soft + inset 보더 `#DDD6FE`) |
| 오늘의 일일 퀘스트 | col 3, row 1 | 진행 링 76px(1/4, ref01), 4개 행(접속/등록/완료/채택, +10P +50EXP) |
| 최신 업무 퀘스트 & 효성마을 인기 매물 | col 3, row 2 | 2열 피드(각 3개, 행 92px) |

Tailwind: `grid grid-cols-[1fr_1.12fr_1.38fr] grid-rows-2 gap-5` / 카드1·2 `row-span-2`. 1280px 미만에서는 `grid-cols-2`, 카드 1·2가 `row-span-1`, 3·4는 `col-span-2`로 접는다.

---

## 7. 컴포넌트 스펙

### 7.1 Button
| 종류 | 높이 | 패딩 | Radius | 폰트 | 스타일 |
|---|---|---|---|---|---|
| Primary | 56 (sm 42) | 0 26 (sm 0 16) | 14 (sm 11) | 700 / 19 (sm 16) | bg `--accent`, 흰 글자, `--sh-btn` |
| Secondary | 동일 | 동일 | 동일 | 동일 | bg `--surface`, 1px `--border`, `--text` |
| Reject(반려) | 58 | — | 14 | 700/18 | bg `--revise-bg`, 보더 `#FDBA74`, 글자 `#C2410C`, 아이콘 rotate-ccw |
| Icon | 48×48 | — | 13 | 아이콘 21px | 보더 버튼 |
- 아이콘+라벨 gap 10px. 버튼 안 코인 스프라이트 ×3(24px).
- Hover: `translateY(-2px)` + 그림자 한 단계 강화, 220ms `--ease-out`. 주요 CTA는 hover 시 픽셀 코인/별 파티클 3–5개(§9.4).
- Press: `scale(.93)` 80ms → 복귀 220ms `--ease-back`.
- **Disabled**: bg `--surface-muted`, 글자 `--text-muted`, 그림자/보더 없음, `cursor:not-allowed`, 앞에 lock 아이콘 + **이유 문구를 버튼 라벨로** ("지정 예약자 외 구매 불가", "거래가 완료된 상품이에요"). 추가로 **Tooltip**: hover 시 버튼 위 8px, bg `#18181B`(다크 `#FAFAFA`), 글자 반전, 13px/600, 패딩 8×12, radius 10, 꼬리 6px, 150ms fade+4px rise. 예: "판매자가 예약자를 지정한 상품이에요. 지정된 분만 구매할 수 있어요."

### 7.2 Badge / Chip
- Badge: 높이 30(소 24/22), 패딩 0 12(소 0 8–9), radius 999, 700/15(소 12–13), gap 6. 변형: soft(기본, accent-soft/accent), solid(accent/흰), gray, success, warning, done, 티어(`t-br`…`t-ms`).
- Pill(기능 태그): 높이 46, 패딩 0 18, 1px 보더, 700/17, 아이콘 accent.
- Chip(GNB): 높이 48, 패딩 0 16, radius 13.
- Category chip: 높이 42, 패딩 0 18, 활성 = `--text` 배경 + `--bg` 글자(반전).
- Caption pill(검정): 높이 48, 번호 원 34px `#7C3AED`.
- Chapter tag: 번호 타일 38px radius 11 accent + 700/19 accent 라벨.

### 7.3 Card
`bg --surface · border 1px --border · radius 28 · shadow --sh-card · padding 24–28`. 카드 헤더 = h3(22/800) 좌 + 배지/라벨 우, 간격 `justify-between`. 내부 서브 박스 radius 16–22, bg `--surface-muted`.

### 7.4 Input
높이 66(앱 52), 패딩 0 22, radius 15, 1px 보더, 600/23(앱 16). Focus: 보더 `#A78BFA` + `--sh-focus`. 캐럿 2px accent. 라벨: 700/16 muted, 하단 12px.
**Segmented(문의/요청)**: 트랙 `--surface-muted` 패딩 5 radius 15, 세그 170×54(앱 140×44), 활성 필 = surface + `--sh-seg`, 200ms `--ease-inout` 슬라이드. 오른쪽에 유형 설명 600/17 muted ("답변만 필요한 간단한 질문" ↔ "결과물 제출이 필요한 업무 요청").
**Search**: 높이 48–54, radius 15, search 아이콘 + placeholder muted.

### 7.5 Slider (현상금)
트랙 12px radius 999 bg `--accent-soft` · 채움 `linear-gradient(90deg,#6D28D9,#8B5CF6)` · 노브 34px 흰색 + 3px `#7C3AED` 보더 + `--sh-knob`, 드래그 중 `scale(1.18)` · 눈금 0/250/500/750/1,000 P (600/14 muted) · 값 표시 900/30 accent 우측 상단 · 10P 단위 스냅. 하단 **에스크로 박스**: bg accent-soft, `#4C1D95` 600/17, lock 아이콘, 우측 "보유 1,500 P → 1,200 P" 800.

### 7.6 Rich Editor 툴바 (TinyMCE 5.10.2 스킨 오버라이드)
툴바 높이 44, bg `--surface-muted`, 하단 1px 보더, 버튼 B/I/U/목록/표/링크/이미지 800/15 muted, gap 16, 우측 버전 태그(gray badge 24px). 본문 패딩 16, 컨테이너 radius 18 1px 보더. 잠김 상태(채택 전): 컨테이너 opacity .38 + 상단 lock 칩(danger) "채택 전 에디터 잠금" → 채택 후 success 칩 "결과물 에디터 열림".

### 7.7 SharePoint 링크 배지
높이 92(앱 72), radius 16. 업로드 중: 1px dashed `#C4B5FD`, upload 아이콘 + 파일명 + 8px 진행 바 + %. 완료: SP 로고 타일 52px radius 13 `#036C70` 흰 "S" 900 + 우하단 20px 원 `#1A9BA1`(3px surface 보더) · 파일명 700/19 · URL 600/15 accent `text-overflow:ellipsis` (`https://hyosung.sharepoint.com/sites/officequest/Shared%20Documents/…`) · 우측 success 배지 "링크 변환 완료". 라벨 우측 "SharePoint 링크로 자동 변환됨". 컴팩트형(결과물 파일): 로고 40px, bg accent-soft, radius 14.

### 7.8 Modal
backdrop `rgba(9,9,11,.55)` + `backdrop-filter: blur(6px)` (z 1000) · 패널 surface radius 28 `--sh-pop` 패딩 38×44 (z 1010) · 폭 sm 480 / md 640 / lg 1008 · 헤더 h2 + 우측 배지 · 푸터 우측 정렬 버튼(취소 secondary + primary), 좌측 메타 600/15 muted. 등장 300ms: opacity 0→1, `translateY(24px) scale(.96)`→none `--ease-expo`. 퇴장 180ms `--ease-in`.
**보안서약서**: 행 패딩 16×18 radius 16 1px 보더 · 체크박스 32px radius 9 2px `#D4D4D8` → 체크 시 `#6D28D9` 채움 + 흰 체크, `scale(1.25)` 팝 200ms · 제목 700/19 "(필수)" · 설명 600/14 muted · 우측 shield-check 26px accent. 미동의 시 primary 비활성.

### 7.9 Teams 채팅 창 (`VirtualTeamsChat`)
우하단 플로팅 `right:24px; bottom:24px; width:420px; height:560px; z-index:800; radius 28; overflow hidden; --sh-pop`
- 헤더 86px bg `#464775`: Teams 타일 40px `#7B83EB` "T" · 아바타 46px 원 + 온라인 점 14px `#22C55E`(2px 헤더색 보더) · 이름 700/18 흰 · 부서·마을·상태 600/13 `#C7C9F0` · 우측 맥락 배지("업무 인수인계"/"중고거래", 흰 14% 배경) · 닫기.
- 본문 bg `#F5F5F7`(다크 `#14141C`), 패딩 18, gap 12: 시스템 메시지 중앙 pill 600/13 · 내 말풍선 우측 `#E8EBFA` radius 16 (우하 4) · 상대 좌측 흰색 + 미세 그림자 (좌하 4) · 발신자 700/12 muted · 본문 600/16 lh 1.5 · max-width 84%.
- 입력중: 점 3개 7px `#8B8CC7`, 14ms 위상차로 -5px 바운스 + "○○님이 입력 중입니다..." 600/14 → **1.2초 후** 자동응답 도착(말풍선 rise-in 180ms).
- 입력바 68px: 필드 42px radius 10 `#F4F4F5` · 전송 42px `#5B5FC7` send 아이콘.

### 7.10 조직도 모달 (`OrgChartModal`)
lg 모달(PRD §8.13, ref10). 상단 검색(이름/사번/부서 실시간 필터, 높이 48). 트리 노드 높이 44 radius 11 700/17 sub, chevron(펼침 down / 접힘 right), 우측 인원 700/13 muted. 들여쓰기 레벨당 26px (l1 38px, l2 64px). 사업장: 마포 본사 · 회현 · 반포 · 수서 · 창원공장 · 울산공장. 임직원 행 60px: 아바타 40px(픽셀 헤드 ×2) · 이름 17/700 · "사번 · 보유 1,240 P" 13 muted · 우측 sm primary "예약자 지정" / secondary "최종 구매자 지정". 검색 일치/선택 행: accent-soft + inset 1px `rgba(168,85,247,.45)`. 포인트가 가격보다 적은 직원은 버튼 비활성 + 툴팁 "보유 포인트 부족".

### 7.11 효성마을 상품 카드
radius 24, 패딩 0, overflow hidden. 썸네일 170px(앱 160) — 이미지 또는 픽셀 아이콘 ×9 중앙, 다크 톤 그라데이션 배경; 좌상 마을 배지, 우상 상태 배지(14px 인셋). 본문 패딩 16×18: 분류·판매자 700/14 muted → 제목 700/21 ellipsis → 가격 900/25(또는 무료나눔 success) + 우측 메타(heart `#F43F5E` + 수, eye + 조회수, 700/15) → 하단 CTA 46px radius 12 full-width.
- CTA 상태: `샀어요 · 구매 요청`(primary) → `구매 요청 완료 · 판매자 승인 대기` → `거래가 완료된 상품이에요`(disabled). 예약중 + 비지정자: disabled `지정 예약자 외 구매 불가`. 무료나눔: secondary `샀어요 · 나눔 요청`.
- 좋아요: 클릭 시 fill 토글 + `scale(1.5)` 팝 250ms + 카운트 +1. 거래완료 카드 썸네일 opacity .35.
- 포인트 부족: 경고 모달 "보유 포인트가 부족합니다! 업무 퀘스트를 수행해 포인트를 모아보세요."
- **포인트 정산 패널**: 구매자/판매자 카드(250px, radius 20, 아바타 54px, 값 900/34) 사이 점선 트랙, 코인 10개가 50ms 간격으로 450ms 포물선 이동(높이 110px), 카운터 500ms 롤링, 증감 표시 800/17 (− `#FB7185`, + `#4ADE80`). 하단 원장 행 50px "거래완료 · 품목 · 금액 · 양측 거래 내역 기록".

### 7.12 퀘스트 행 (리스트/피드)
높이 92(피드)·76(랭킹)·124(지원자). 구성: 썸네일/아바타 타일 56–66px radius 12–16 `--surface-muted` · 상태 배지(24px) · 제목 700/17–19 ellipsis · 메타 600/14 muted("현상금 300 P · 재무팀", 조회수) · 우측 액션. 지원자 행: 티어 배지 + 소속·마을 + 각오 인용 600/15 sub · "채택하기" sm 버튼. 채택된 행: 보더 `#A78BFA` + bg `#FAF7FF` + `0 0 0 4px rgba(124,58,237,.1)`, 나머지 opacity .45.
**워크플로 스테퍼**: 노드 58px radius 17, 대기 = surface + 보더 + muted 숫자, 완료 = accent 채움 흰 숫자 + `0 10px 24px -8px rgba(109,40,217,.6)`, 현재 = 추가 7px 링 `rgba(124,58,237,.16)`. 연결선 4px `--border`, 채움 `#6D28D9→#A855F7`, 노드 전환 시 노드 `scale(1.18)` 250ms. 단계: 모집중 → 지원 → 채택 → 진행중 → 결과물 제출 → 반려·재제출 → 승인·완료.

### 7.13 Progress Bar / Ring
- Bar: 높이 10(소 8, 시즌 6), radius 999, 트랙 `--surface-muted`, 채움 `linear-gradient(90deg,var(--accent),var(--accent-2))`. 값 변화 600–900ms `--ease-inout`. 100% 도달 시 아이콘 타일이 accent 채움으로 전환.
- Ring: 76px, r 31, stroke 9, 트랙 `--accent-soft`, 값 `#7C3AED` round cap, -90° 시작, 중앙 800/19 "1/4"(시드 기준, 달성 수/4). dasharray 194.8.
- EXP 라벨: "골드 **Lv.12** · 다음 레벨까지" / "**68** / 100 EXP" (1레벨 = 100 EXP).

---

## 8. 픽셀 스프라이트 규칙 (Sprite-gen)

- **렌더링**: 문자열 행렬 → `<canvas>` 1px=1셀 → `toDataURL()`로 `<img>` 또는 `drawImage`. 반드시 `image-rendering: pixelated` (+`crisp-edges`), canvas는 `imageSmoothingEnabled=false`. 외부 이미지 금지.
- **그리드**: 캐릭터 = 16×16 바디를 24×24 캔버스의 (4,6) 오프셋에 배치(날개·검·망토 여유). 헤드 아바타 = 캐릭터에서 (4,5) 16×13 크롭. 소품: 코인 8×8, 젬 7×7, 별 7×7, 스크롤 12×10, 슬라임 16×12, 상품 아이콘 12×12.
- **정수 배율만**: ×2(랭킹 52px 타일) · ×3(아바타/버튼 내 코인) · ×4(피드 썸네일) · ×9(티어 카드·상품) · ×12–13(히어로/오버레이) · ×14(보스 슬라임). 위치도 정수 px로 스냅.
- **아이들 모션**: 4px(1픽셀×배율) 단위 2-step 바운스 (`steps(2)`), 연속 보간 금지.
- **공통 팔레트**: 외곽선 `#1C1528` · 머리 `#3B2718`(마스터 `#2E1065`) · 피부 `#F6C7A0` / 음영 `#D99A73` · 눈 `#18181B` · 셔츠 `#F4F4F5` · 넥타이 `#7C3AED`(골드 `#B91C1C`) · 바지 `#2A2A35` · 신발 `#121216`

| 티어 | 재킷/갑옷 J / 음영 j | 핀 | 망토 | 추가 레이어 |
|---|---|---|---|---|
| 브론즈 | `#3F4A6B` / `#2B3350` | `#CD7F32` | — | — |
| 실버 | `#3F4A6B` / `#2B3350` | `#E2E8F0` | `#CBD5E1` / `#64748B` (어깨 망토 + 측면 플레어) | — |
| 골드 | `#F5B301` / `#B7791F` | `#FFF7CC` | `#B91C1C` / `#7F1D1D` | 어깨판, 머리 위 왕관 점 `#FCD34D` |
| 플래티넘 | `#E5E7EB` / `#9CA3AF` | `#67E8F9` | `#64748B` / `#334155` | 어깨판, 고글 프레임 `#1F2937` 렌즈 `#22D3EE` + 하이라이트 `#FFF` |
| 다이아 | `#A5F3FC` / `#0891B2` | `#FFFFFF` | — | 어깨판, 고글(렌즈 `#67E8F9`), 크리스탈 날개 `#F0FDFF`/`#67E8F9`/`#0E9FBF` |
| 마스터 | `#7C3AED` / `#4C1D95` | `#F0ABFC` | `#581C87` / `#3B0764` | 어깨판, 고글(렌즈 `#F0ABFC`), 날개 `#FAF5FF`/`#C084FC`/`#7E22CE`, 전설의 검(날 `#F5F3FF`, 엣지 `#C084FC`, 가드 `#A855F7`, 손잡이 `#3B0764`), 핑크 크라운 점, 번개 오라 |

- 몬스터(업무 병목 슬라임): 외곽 `#14321F`, 몸 `#4ADE80`, 하이라이트 `#DCFCE7`, 입 `#166534`. 머리 위 이름+HP 바(14px, `#EF4444→#F97316`, 2px `#52525B` 보더).
- 코인 `#FBBF24`/`#D97706`/외곽 `#7C4A03`/하이라이트 `#FFF7CC` · 젬 `#A855F7`/`#6D28D9`/`#F5D0FE` · 별 `#FDE047`/`#FFF`.
- **오라**: 티어색 2–3개로 6/8/10px 정사각 픽셀이 0.9–1.8초 주기로 상승·사인 페이드(카드당 9개, 플래티넘↑ 16개). 히어로 박스 배경 = `radial-gradient(circle at 50% 62%, 티어색 22%α, transparent 55%)`.

---

## 9. 모션

### 9.1 토큰
| 토큰 | 값 | 사용처 |
|---|---|---|
| `--ease-out` | `cubic-bezier(.33,1,.68,1)` | 기본 hover·카운터 |
| `--ease-expo` | `cubic-bezier(.16,1,.3,1)` | 카드/텍스트 등장 (주력) |
| `--ease-in` | `cubic-bezier(.32,0,.67,0)` | 퇴장 |
| `--ease-inout` | `cubic-bezier(.65,0,.35,1)` | 탭 필·세그먼트·슬라이더·커서 이동·프로그레스 |
| `--ease-back` | `cubic-bezier(.34,1.56,.64,1)` | 배지 팝, 보드/보상 카드 |
| `--ease-spring` | `cubic-bezier(.3,1.9,.5,1)` | 캐릭터 팝인, LEVEL UP |
| duration | 80 instant · 150 fast · 220 base · 400 slow · 550 enter · 700 scene · 1800 hyper | |
| stagger | 40ms(글자·리스트) · 70ms(행·카드 그룹) · 140ms(벤토 카드) | |

### 9.2 등장 패턴
- **rise-in**: opacity 0→1, `translateY(24–90px)`→0, `blur(8–12px)`→0, `scale(.94–.96)`→1, 550–700ms expo. 벤토 카드 140ms 스태거, 내부 행은 카드 뒤 +0.45s부터 70ms 스태거.
- **로고 글자**: 글자별 `translateY(70px)+blur(14px)` → 0, 550ms expo, 40ms 스태거.
- **카운터 롤링**: 0→목표값 1.0s `--ease-out`, `toLocaleString`, tabular.
- **화면 전환**: 퇴장 300ms(`opacity→0, translateX(-160px) or scale(.97), blur 6–8px`, ease-in) + 진입 400ms(`translateX(160–200px)→0`, expo) — **150–250ms 겹치게** 해서 빈 화면이 생기지 않게.
- **다크 모드 전환**: 토글 지점에서 `clip-path: circle()` 0→2400px, 470ms `--ease-inout`. 원이 지나는 요소부터 순차적으로 다크 토큰 적용(View Transitions API 권장: `document.startViewTransition` + `::view-transition-new(root)`에 clip-path 애니메이션).

### 9.3 Hover / 마이크로 인터랙션
- 버튼: lift -2px 220ms, press scale .93. 카드(클릭형): lift -2px + 보더 `--border-accent`. 행: bg `--surface-muted` 150ms.
- 메뉴 탭 이동: 흰 필이 280ms `--ease-inout`으로 슬라이드.
- 체크/좋아요/상태 배지 변경: `scale(1.25–1.5)` 팝 200–250ms 후 복귀.
- **코인/별 파티클**: 주요 CTA hover·메뉴 이동 시 픽셀 코인/별 3–5개, 위쪽 ±40° 부채꼴로 180–320px/s, 중력 900px/s², 수명 500–700ms, 크기 ×3, 회전 대신 `scaleX(cos)` 코인 플립.

### 9.4 하이퍼 프레임 오버레이 (1.8s, z-index 9999)
전체 화면 고정, 반투명 다크 백드롭 `radial-gradient(ellipse, rgba(30,16,56,.97), rgba(6,6,9,.985) 70%)` + `blur(6px)` + 2px 스캔라인 `rgba(255,255,255,.025)`. 클릭 차단, 재생 후 자동 닫힘.

**A. 퀘스트 등록 (스크롤 핀)**
| ms | 이벤트 |
|---|---|
| 0–150 | 백드롭 fade-in |
| 0–300 | 게시판(600×420, `#9B6B3D`/테두리 14px `#5A3A1E`, 포스트잇 4장) back-ease 팝, 타이틀 "QUEST POSTED!" 112/900 (`POSTED!` `#C084FC`) scale 1.25→1 back |
| 0–250 | 캐릭터(×12) 좌측에서 expo 슬라이드인 |
| 350–550 | 캐릭터 점프(-46px, -6°) 하며 스크롤 투척 |
| 350–700 | 스크롤 ×12: `translate(-560,90) scale(.35) rotate(-220°)` → 보드 중앙 |
| 700–900 | 핀 고정 임팩트 `scale(1.14)`, **빛 폭발**: 흰 radial flash(1200px) 0→1→0 + 회전 광선(repeating-conic 5°/15°, 보라 26%α) |
| 700–1500 | 별/코인 파티클 34개 방사 |
| 800–1050 | 서브 카피 "퀘스트가 게시판에 등록되었습니다 · 현상금 300 P 에스크로 보관" |
| 1500–1800 | 전체 fade-out 후 언마운트 |

**B. 퀘스트 완료 승인 (몬스터 처치)**
| ms | 이벤트 |
|---|---|
| 0–150 | 백드롭, 점선 바닥 라인 |
| 0–300 | 슬라임 보스(×14) back 팝 + HP 바, 작업자 캐릭터 expo 진입 |
| 300–500 | 캐릭터 웜업(-36px) → 대시(+470px, -10°) expo |
| 450–720 | **보라 검기**: 반경 250px 호, 꼬리→머리로 굵기 6→52px, 글로우 `#A855F7` blur 30, 내부 흰 코어, 220ms에 3.6rad 스윕 후 페이드 |
| 550–700 | 흰 플래시, 슬라임 흔들림(±16px), HP 100→0, "CRITICAL!" → "-9,999" 84/900 |
| 700–800 | 슬라임 scale 1.18→0.2 폭발 → 초록 픽셀 파편 46개 |
| 720–1500 | 코인·젬·별 36개 분수 + 상단에서 46개 레인, 광선 회전 |
| 850–1150 | 보상 카드 3장 80ms 스태거 back 팝: "+100 P 기본 보상" "+300 P 현상금" "+100 EXP" |
| 1000–1250 | "LEVEL UP!" 120/900 (흰→`#D8B4FE` 그라데이션 텍스트 + 6px `#5B21B6` 드롭) + "실버 Lv.7 → Lv.8" 필 |
| 1500–1800 | fade-out, 실제 포인트·EXP 반영(카운터 롤링) |

### 9.5 파티클 규칙
- 모두 정수 배율 픽셀 스프라이트 또는 2px 그리드에 스냅된 정사각형. 원형 블러 파티클 금지.
- 시드 고정 난수(mulberry32)로 동일 이벤트는 항상 같은 패턴.
- 방사: 속도 300–1400px/s, drag 0.8–3, 중력 600–1900px/s², 수명 0.6–1.7s, 알파 `1-(t/life)^3`.
- 동시 파티클 상한 120개, canvas 1장(오버레이 최상단, `pointer-events:none`).
- 번개 오라(마스터): 16fps로 재생성되는 6마디 지그재그 3개, 스트로크 10px 보라 35%α / 4px `#C084FC` / 1.6px `#FAF5FF`.

### 9.6 Reduced motion 폴백 (`prefers-reduced-motion: reduce`)
- 하이퍼 프레임: 파티클·광선·검기·흔들림 제거 → 1.8s 정적 결과 카드(PRD D28: 닫힘 시각은 reduced-motion에서도 1,800ms)(타이틀 + 보상 3칩, 200ms fade in/out).
- 등장 애니메이션 → 150ms opacity만. 카운터 롤링 → 즉시 최종값. 픽셀 바운스·오라·번개 정지(정적 오라 radial 유지). 다크 전환 → 즉시 교체.
- 자동 닫힘 타이밍과 상태 변경 로직은 동일하게 유지.

---

## 10. 아이코노그래피 (Lucide)
- stroke-width **2**, `stroke-linecap/linejoin: round`, `fill:none`(좋아요 활성만 fill).
- 크기: 14(배지 안) · 16(메타) · 19–21(버튼·아이콘 타일) · 24(업로드) · 26(shield) — 텍스트와 1em로 맞춘다.
- 색: 기본 currentColor, 기능 강조는 accent, 하트 `#F43F5E`.
- 사용 아이콘: `log-in` 접속 · `scroll-text` 퀘스트 · `swords` 완료/티어 · `check` 채택/완료 · `house` 마을 · `lock`/`lock-open` 잠금 · `link` · `shield-check` 보안서약 · `upload` · `send` Teams · `rotate-ccw` 반려/다시보기 · `heart` · `eye` · `search` · `plus` 글 등록 · `users` 조직도 · `zap` DEBUG · `moon`/`sun` 테마 · `chevron-down/right` · `arrow-right` 흐름.
- 아이콘 타일: 38px radius 11 bg accent-soft 아이콘 accent (완료 시 accent 채움 + 흰 아이콘).
- 이모지는 UI에 사용하지 않는다(채팅 본문의 사용자 입력은 예외).

---

## 11. 카피 톤
- **짧은 해요체, 동사로 끝나는 CTA**: "퀘스트 등록하기", "채택하기", "샀어요 · 구매 요청", "예약자 지정".
- 헤드라인은 2줄, 한 단어만 보라 강조: "막힌 업무는 **퀘스트**로 던지세요." / "지원부터 승인까지, **한 흐름으로.**" / "성장할수록, **캐릭터가 진화**합니다." / "포인트로 사고, **나누고, 순환하고.**" / 슬로건 "일하고, 성장하고, **거래하세요.**"
- 숫자는 단위와 함께, 천 단위 콤마: `1,500 P`, `+100 EXP`, `D-14`, `Lv.12`.
- 구분자는 가운뎃점 ` · `, 흐름은 화살표 아이콘(→ 문자 대신 Lucide `arrow-right`).
- 상태/제약은 이유를 말한다: "채택 전 에디터 잠금", "지정 예약자 외 구매 불가", "등록 즉시 에스크로 선차감 · 미채택 삭제 시 환불".
- 게임 용어(QUEST POSTED!, LEVEL UP!, CRITICAL!)는 **오버레이 안에서만** 영문 대문자로.
- 금지: 과장 형용사("혁신적인", "놀라운"), 느낌표 남발(오버레이 제외), 이모지 접두.

---

## 12. 레퍼런스 화면 ↔ 컴포넌트 매핑

`refs/01–10`은 **실제 앱 페이지 목업**(정적 HTML → 1920×1080 PNG, Paperlogy 로드 후 캡처)입니다. 모든 화면은 풀 GNB(로고 · 대시보드/업무 퀘스트/효성마을 탭 · 02:00:00 타이머 + Lucide `zap` 아이콘 + "시연 타이머" 컨트롤(+30분, 만료 테스트, 리셋) · 포인트 칩 · 페르소나 전환(김효성 대리/이퀘스트 사원/박마스터 과장) · 테마 토글)를 포함합니다. 레이아웃 기준: GNB 64px, 좌측 사이드바 264px, 상세 화면 우측 aside 400px, 콘텐츠 패딩 24px, 1920 폭에서 풀폭 그리드(최대 폭 제한 없음, 1440에서도 깨지지 않도록 fr 단위).

| 파일 | 화면 / 페르소나 · 테마 | 보여주는 컴포넌트 / 상태 |
|---|---|---|
| `refs/01_dashboard_light.png` | 대시보드 · 김효성 대리 · 라이트 | 벤토 3열: 캐릭터 스테이터스(골드 Lv.12 스프라이트 ×13, EXP 바, 1,500P, 오늘 완료 0/2, 완료 퀘스트 23건) · Season 1 D-14 배너 + TOP5 랭킹(내 행 강조) + [시즌 초기화 시뮬레이션] · 일일 퀘스트 진행 링 + 4개 미션 행 · 최신 퀘스트 피드 + 효성마을 인기매물 피드 |
| `refs/02_daily_quests_tiers.png` | 업무 퀘스트 › 일일 퀘스트 · 라이트 | 좌측 사이드바(일일 퀘스트/퀘스트 등록/업무 퀘스트 게시판/내 퀘스트) · 미션 카드 4장(진행률 바, 달성 완료 → [보상 받기 +10P], +10P +50EXP 칩, 비활성 사유 라벨) · 내 캐릭터 카드 · 6단계 티어 진화표(스프라이트, 레벨·EXP 구간, 장비, 오라, 인원, 현재 티어 강조) |
| `refs/03_quest_board.png` | 업무 퀘스트 게시판 · 라이트 | 분류(전체/문의/요청)·상태(모집중/진행중/보완요청/완료) 필터 칩 · 검색 · 정렬 · 7행 테이블(번호, 분류 배지, 상태 배지, 제목 + SharePoint 아이콘, 보상 100P + 현상금, 요청자 아바타/부서/티어, 지원자 수, 조회수, 등록일) · 페이지네이션 · [+ 퀘스트 등록] |
| `refs/04_quest_create.png` | 퀘스트 등록 · 라이트 | 문의/요청 세그먼트 + 유형 안내 · 제목 인풋(19/60 글자 수, focus) · 업무 분야 셀렉트 · 마감일 · TinyMCE 5.10 스타일 메뉴/툴바 + 본문(표 포함) + 상태바 · SharePoint 링크 배지(링크 변환 완료) · aside: 현상금 슬라이더(0–1,000) + 프리셋 50/100/300/500 + 에스크로 선차감 박스(1,500 → 1,200), 작업자 보상 미리보기(100P + 300P + 100EXP), 등록 체크리스트 3/4 · [퀘스트 등록하기 · 300 P] |
| `refs/05_security_pledge_modal.png` | 04 위 딤 + 보안서약서 모달 | 딤 백드롭(z modal 1010) · 체크박스 3개(전부 체크 전 [동의 후 등록] 비활성) · 차감 요약 · 취소/동의 후 등록 |
| `refs/06_quest_detail_recruiting.png` | 퀘스트 상세(모집중) · 요청자 김효성 | 7단계 스테퍼 · 본문 + 표 + SharePoint 첨부 · [수정]/[삭제] 활성 · 결과물 에디터 잠금 안내 · 진행 규칙 4칸 · aside: 보상 카드 400P, 지원자 리스트(티어/소속/각오) + [채택하기] |
| `refs/07_quest_detail_inprogress_teams.png` | 퀘스트 상세(진행중, 결과 제출) · 김효성 | 수정/삭제 잠금(툴팁 사유) · 채택된 작업자 스트립 + [팀즈 대화하기] · 제출 결과물 v1(표, SharePoint .xlsm) · [반려(보완 요청)]/[퀘스트 완료(승인)] · 진행 로그 aside · 플로팅 Teams 채팅(보라 헤더, 초록 온라인 점, 타이핑 인디케이터, 입력바) |
| `refs/08_hyperframe_complete.png` | 하이퍼 프레임 B(완료) · 딤 앱 위 | z 9999 오버레이 · 슬라임 몬스터 + HP 바 + 참격 아크 + -9,999 · 코인/젬 파티클 · 보상 카드 +100P / +300P 현상금 / +100EXP · LEVEL UP Lv.7 → Lv.8 · 1.8초 후 자동 닫힘 문구 |
| `refs/09_village_market_dark.png` | 효성마을 마켓 · 이퀘스트 사원 · 다크(게이밍 모드) | 사이드바(전체 8 + 6개 마을 카운트, [+ 중고물품 글 등록], 내 거래 현황) · 분류 칩 · 검색 · 정렬 · 8장 상품 카드(마을 배지, 거래가능/예약중/거래완료 배지, 분류, 포인트 가격 or 무료나눔, Lucide `heart` 좋아요, Lucide `eye` 조회수, 판매자) |
| `refs/10_village_detail_orgchart.png` | 매물 상세(판매자 김효성 뷰) + 그룹웨어 조직도 모달 · 라이트 | 사업장 트리(마포 본사/회현/반포/수서/창원공장/울산공장 + 인원) · 검색 · 직원 행(티어 배지, 사번·사업장·부서, 보유 P, [예약자 지정]/[최종 구매자 지정], 포인트 부족 비활성) · 적용 안내 바 |

---

## 13. 구현 체크리스트 (빌더용)
- [ ] `tokens.css`를 `app/globals.css` 최상단에 import, `<html data-theme>`로 테마 전환(localStorage 보존).
- [ ] 모든 숫자에 `.num`, 타이머는 글자별 고정폭.
- [ ] 스프라이트는 `<PixelSprite name tier scale>` 컴포넌트 1개로 통일(정수 scale만 허용).
- [ ] `<HyperFrame variant="post|clear">`: portal, z 9999, 1800ms 후 `onDone`, reduced-motion 분기.
- [ ] 비활성 버튼은 항상 이유 라벨 + Tooltip.
- [ ] 화면 전환 시 빈 프레임 없음(퇴장/진입 150ms 이상 겹침).
- [ ] 라이트/다크 각각에서 refs/01–10과 시각 비교.

---

## 변경 이력

| 버전 | 날짜 (KST) | 변경 | 근거 |
|---|---|---|---|
| v1.1 | 2026-10-21 | §0 경로 수정(`motion/officequest_intro.html`), 없는 `refs/video_stills/` 언급 삭제(§0·§12) | 검수봇 보통-8 · 분석봇 보통(DESIGN 낡은 경로) |
| v1.1 | 2026-10-21 | 사이드바 앱 값 280 → **264px**(§3.7 `spacing.sidebar`, §6 표), 컨테이너 최대 폭 제한 없음 | 분석봇 높음(사이드바 280 vs 264) · 검수봇 보통-7 · PRD D6 |
| v1.1 | 2026-10-21 | §3.7 예시를 `const config … export default config`로 변경 | 분석봇 높음(lint 익명 default export 경고) |
| v1.1 | 2026-10-21 | 스탯 타일 3개, 일일 링 1/4, 조직도 lg 모달, reduced-motion 결과 카드 1.8s, ref09 사이드바 "전체 8" | 검수봇 보통-7 · 분석봇 보통(ref09 "128") |
| v1.1 | 2026-10-21 | ⚡ ♥ 👁 기호를 Lucide `zap`·`heart`·`eye` 표기로 변경 | 검수봇 높음-3 · 분석봇 높음(이모지 금지 규칙과 충돌) |
| v1.0 | 2026-10-21 | 최초 작성 | — |
