# Office Quest 로컬 미리보기

PRD.md·Harness.md·DESIGN.md와 refs를 기준으로 만든 실행 가능한 시연 앱입니다. Next.js 앱은 `officequest/`에 있습니다.

## 실행

저장소 루트에서:

```bash
npm --prefix officequest ci
npm run dev
```

[로컬 미리보기](http://localhost:3000)

현재 Codex 작업 폴더에도 실행용 래퍼가 있어 그 위치에서 `npm run dev`를 실행할 수 있습니다. 앱 폴더에서는 일반적인 `npm run dev`가 동작합니다.

## 시연

- 상단 페르소나 메뉴에서 김효성·이퀘스트·박마스터·운영자를 전환합니다.
- 업무 퀘스트에서 등록, 보안서약, 지원, 채택, 결과물 제출, 반려·재제출, 별점 승인을 실행합니다.
- 효성마을에서 좋아요, 구매 요청, 판매자 승인, 조직도 예약·직접 정산을 실행합니다. NPC 판매자는 1.2초 뒤 자동 승인합니다.
- 운영자는 의심 활동 근거, 제재 적용·해제, 감사 로그를 확인합니다. 운영자 계정으로 대시보드에 접근하면 콘솔로 이동합니다.
- DEBUG 메뉴의 데이터 초기화로 시드 상태를 복원합니다. 시연 타이머와 테마도 상단에서 조작할 수 있습니다.

DB는 브라우저의 localStorage에 저장됩니다. 같은 주소의 두 탭은 변경을 공유합니다. Teams와 SharePoint 변환은 실제 외부 서비스 연결 없이 로컬에서 재현합니다.

## 검증과 보완 의견

앱 폴더에서:

```bash
PW_CHANNEL=chrome npm run verify
```

현재 환경은 Playwright 번들 다운로드 대신 설치된 Chrome을 사용했습니다. 번들 브라우저가 설치된 환경에서는 채널 환경변수를 생략할 수 있습니다.

- `DUAL_BRAIN_AUDIT.md`: 단계별 검증과 리뷰, 최종 결과
- `Opinion.md`: 구현 중 확인한 병목과 PRD·Harness 보완 제안
- `officequest/qa/AC_MAP.md`: 수용 기준과 테스트 연결
- `officequest/qa/VISUAL_QA.md`: refs 10장 대조 결과
- `officequest/qa/screens/`, `officequest/qa/compare/`: 실제 화면과 나란히 비교 이미지

원본 PRD.md·Harness.md·DESIGN.md·tokens.css·refs는 보존했습니다. 패키지 버전은 Harness의 고정값을 사용합니다.
