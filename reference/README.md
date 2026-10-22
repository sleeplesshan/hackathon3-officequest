# reference/ — 참조 구현에서 고른 파일

이 폴더에는 참조 구현(`Pilot_Test_Code_Review/officequest/`, Harness §12.2)에서 고른 **다시 쓸 수 있는 작은 파일**만 들어 있습니다. 앱 소스 전체, `node_modules`, 동영상, 비밀정보는 들어 있지 않습니다.

- 규칙은 Harness §12, 참조 구현과 다르게 정한 항목은 PRD §0.4를 봅니다. **PRD·Harness가 이 폴더보다 우선합니다.**
- 이 폴더가 없어도 Autopilot은 끝까지 실행됩니다(스크립트는 Harness 부록 A 본문, 캐릭터 PNG는 Harness B26 폴백).
- 앱 코드에서 이 폴더를 import하거나 런타임에 읽지 않습니다. 아래 표에서 "복사"라고 한 파일만 복사합니다.
- 이 폴더의 파일은 수정하지 않습니다.

| 경로 | 내용 | Autopilot이 하는 일 |
|---|---|---|
| `scripts/check-forbidden.mjs` | 금지 패턴 검사(규칙 1–13: Tailwind 이름 충돌·음원 파일 포함, SharePoint 호스트는 허용하지 않음). 부록 A-13과 같음 | 앱 루트 `scripts/`로 복사 |
| `scripts/fetch-fonts.mjs` | Paperlogy 6개를 `public/fonts/paperlogy/`로 받음. 이미 있으면 건너뜀, 3회 재시도, `OFL.txt` 작성, 항상 exit 0. 부록 A-12와 같음 | 복사 |
| `scripts/doctor.mjs` | 사전 진단(Node·레지스트리·고정 버전·브라우저·TinyMCE·폰트·캐릭터 PNG·tokens). 항상 exit 0, `docs/doctor.json`. 부록 A-15와 같음 | 복사 |
| `assets/character/*.png` | 캐릭터 PNG 24종(`{male\|female}-{classic\|wave}-{tier}.png`, 24×24, 알파 0/255). PRD D76 | 앱 루트 `public/assets/character/`로 복사 |
| `assets/character/provenance/` | 생성 이력(`provenance.json`), 팔레트 잠금(`palette.lock.json`), 검수 메모(`qa-notes.md`), 원본 아바타, 프롬프트 | 읽기만(복사하지 않음) |
| `public/editor-ko.js` | TinyMCE 한국어 UI 문자열(외부 URL·이모지 없음). PRD D88 | 앱 루트 `public/editor-ko.js`로 복사 |
| `screens/*.png` | 참조 구현 화면 8장(1200px 폭, 색 줄임) | Right Brain 참고용. 판정 기준 아님 |
| `templates/AC_MAP.template.md` | `docs/AC_MAP.md` 형식 | 형식만 사용 |

## 출처와 라이선스 메모
- 캐릭터 PNG: 원본 앱의 코드 아바타를 기준으로 생성하고 사용자가 검수한 자산입니다(`provenance/`). 참조 구현의 정보 아이콘 이미지는 들어 있지 않습니다(PRD D76: Lucide `info` 사용).
- Paperlogy 폰트 파일은 이 폴더에 없습니다. `fetch-fonts`로 받으며 SIL OFL 1.1입니다(재배포 허용, 단독 판매 금지, 라이선스 안내 동봉).
- `editor-ko.js`는 TinyMCE UI 문자열 번역입니다.

## 참조 구현의 검증 결과 (2026-10-21 KST)
`npm ci` · `verify:tokens` · `qa:forbidden`(규칙 1–11) · `tsc` · vitest 224/224 · `next build` 통과, 13개 라우트 1440×900 촬영에서 콘솔 오류 0 · 외부 요청 0. E2E·Visual은 이 검증에 포함되지 않았습니다. 이 폴더의 `check-forbidden`(규칙 12 포함)을 참조 구현에 실행하면 `.grow`·`.ring`(Tailwind 이름 충돌)이 검출됩니다.
