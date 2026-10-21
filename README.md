# 오피스퀘스트 × 효성마을 — 디자인 & 모션 패키지

| 경로 | 내용 |
|---|---|
| `PRD.md` · `Harness.md` | Autopilot 제출본 v2.1: 무엇을 만드는가(PRD) · 어떻게 만들고 검증하는가(Harness, 부록 A = 검증된 설정 파일) |
| `skills/` | taste · mengto · sprite-gen · dual-brain(SKILL.md, README.ko.md) · SOURCES.md |
| `DESIGN.md` | (v1.1) 테마 명세: 폰트, 컬러, 레이아웃, 컴포넌트, 스프라이트, 모션. §12에 레퍼런스와 컴포넌트 매핑 |
| `tokens.css` | CSS 변수 토큰: 라이트/다크, 티어 6색, Teams/SharePoint, z-index, 모션. 다크 `--accent-cyan #06B6D4` 포함 |
| `motion/officequest_intro.html` | 20초 소개 모션그래픽. 단일 HTML이며, R 키나 클릭으로 다시 재생 |
| `motion/officequest_intro.mp4` | 위 영상 렌더본: 1920×1080, 30fps, 20.6초 |
| `refs/01–10_*.png` | 실제 앱 페이지 레퍼런스 10장: 1920×1080 정적 목업을 Paperlogy 로드 후 캡처 |
| `refs/refs_contact.png` | 레퍼런스 10장 한눈에 보기 |
| `source/motion/` | 영상 소스: a.css, b.html, c.js. `build.sh`가 `motion/officequest_intro.html`을 생성. `shot.py`는 스틸, `rec.py`는 mp4 녹화용 (Playwright + ffmpeg) |
| `source/mock/` | 페이지 목업 소스: `index.html?p=01…10`. `shot.py`를 실행하면 `source/mock/out/`에 PNG를 렌더 |

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
