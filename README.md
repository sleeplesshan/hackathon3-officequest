# 오피스퀘스트 × 효성마을 — Autopilot 제출 패키지 (v2.7)

GitHub Copilot Agent Mode(Autopilot)가 사람에게 묻지 않고 앱을 끝까지 만들고 검증하도록 준비한 문서·디자인·참조 자료 묶음입니다. 처음 보는 분은 `CHANGES.md`(비개발자용 변경 요약)부터 읽으면 됩니다.

| 경로 | 내용 |
|---|---|
| `PRD.md` | (v2.7) 무엇을 만드는가: 결정 테이블 D1–D91, 상태 머신, 화면별 수용 기준(AC), 시드 데이터 |
| `Harness.md` | (v2.7) 어떻게 만들고 검증하는가: 단계(P0–P6)·게이트, 단위·E2E·Visual 테스트 목록, 막힘 대응, 부록 A = 검증된 설정 파일 |
| `DESIGN.md` | (v1.4) 테마 명세: 폰트, 컬러, 레이아웃, 컴포넌트, 스프라이트, 모션. §12에 레퍼런스와 컴포넌트 매핑 |
| `tokens.css` | (v1.3) CSS 변수 토큰: 효성 브랜드 7색 `--hs-*`와 그 위의 라이트/다크 시맨틱 토큰, 티어 6색, Teams, z-index, 모션. Paperlogy는 로컬 → CDN 순 |
| `CHANGES.md` | v2.5–v2.7에서 무엇이 왜 바뀌었는지(의견·검토 항목별, 비개발자용) |
| `reference/` | (v2.5) 참조 구현에서 골라 온 작은 자료: 검사 스크립트(`check-forbidden`·`fetch-fonts`·`doctor`), 캐릭터 PNG 24장 + 출처, 참고 화면 8장, 에디터 한국어 파일, AC_MAP 양식. **예시일 뿐 규칙이 아니며**, 없어도 Autopilot은 끝까지 실행됩니다. node_modules·비밀값·영상은 넣지 않습니다 |
| `Pilot_Test_Code_Review/` | (v2.7) **공식 참조 구현**: v2.3 문서로 끝까지 만든 파일럿 빌드 전체(`officequest/` 앱 소스·테스트·qa·scripts·public 자산, 의견서 `Opinion.md`, `RUN.md`, 감리 기록, 당시 PRD·Harness·DESIGN·tokens 사본). Autopilot이 읽고 배우는 용도이며 **읽기 전용·빌드 금지**. 문서와 다른 점은 PRD §0.4 표, 읽을 곳은 Harness §12.2. `node_modules`·`.next`·`public/tinymce`·테스트 결과·영상은 빠져 있습니다. 없어도 Autopilot은 끝까지 실행됩니다 |
| `skills/` | taste · mengto · sprite-gen · dual-brain(SKILL.md, README.ko.md) · SOURCES.md |
| `motion/officequest_intro.html` | 20초 소개 모션그래픽. 단일 HTML이며, R 키나 클릭으로 다시 재생 |
| `motion/officequest_intro.mp4` | 위 영상 렌더본: 1920×1080, 30fps, 20.6초 |
| `refs/01–10_*.png` | 실제 앱 페이지 레퍼런스 10장: 1920×1080 정적 목업을 Paperlogy 로드 후 캡처(브랜드 팔레트 이전 색이므로 색은 tokens.css가 우선) |
| `refs/refs_contact.png` | 레퍼런스 10장 한눈에 보기 |
| `source/motion/` | 영상 소스: a.css, b.html, c.js. `build.sh`가 `motion/officequest_intro.html`을 생성. `shot.py`는 스틸, `rec.py`는 mp4 녹화용 (Playwright + ffmpeg) |
| `source/mock/` | 페이지 목업 소스: `index.html?p=01…10`. `shot.py`를 실행하면 `source/mock/out/`에 PNG를 렌더 |

## 색 (v2.4부터 효성 브랜드 팔레트)
- 색의 단일 출처는 `tokens.css`의 `--hs-*` 7색(보라 4단계 · 라벤더 2단계 · 효성 옐로)입니다. 실제 색 값은 `tokens.css`와 `DESIGN.md` §3.0에만 적습니다. 앱 코드에서는 `tokens.css`와 `src/lib/brand.ts` 밖에 브랜드 색 코드를 쓰지 않습니다(Harness `qa:forbidden` 규칙 11).
- 라이트: 밝은 회백 바탕 + 효성 보라 액센트, 보상 강조는 효성 옐로. 다크(게이밍): 거의 검정에 가까운 바탕 + 같은 효성 보라 버튼, 보라 텍스트는 밝은 보라(`--accent-fg`), 라이브 점·보상 강조는 효성 옐로.
- 예전 다크 시안 포인트 색은 v2.4에서 폐지했습니다(PRD D2).

## 레퍼런스 화면
01 대시보드(라이트) · 02 일일 퀘스트 + 티어표 · 03 퀘스트 게시판 · 04 퀘스트 등록 · 05 보안서약서 모달 · 06 상세(모집중) · 07 상세(진행중 + Teams) · 08 하이퍼 프레임(완료) · 09 효성마을(다크) · 10 매물 상세 + 조직도 모달

## 시드 기준
원본 PRD(해커톤3조_PRD.md) 값을 따릅니다.
- **페르소나**
  - 김효성 대리: 마포 · 재무팀 · 골드 Lv.12 · 1,500P · 0/2
  - 이퀘스트 사원: 창원 · 생산기술팀 · 실버 Lv.7 · 300P · 1/2
  - 박마스터 과장: 반포 · AI혁신팀 · 마스터 Lv.28 · 5,200P · 2/2
- **레벨**: 1레벨 = 100 EXP
- **티어**: 브론즈 1–4 · 실버 5–9 · 골드 10–14 · 플래티넘 15–19 · 다이아 20–24 · 마스터 25+
