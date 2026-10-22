# AC_MAP — PRD MUST AC ↔ 테스트

규칙(Harness §5.2): PRD §8의 MUST AC마다 한 줄. 빈 칸 0. 단위 테스트로만 검증하는 AC는 단위 테스트 이름을 적습니다. SHOULD AC는 아래 별도 표에 측정값만.

| AC | Phase 태그 | 테스트 파일 | 테스트 이름 | 결과 |
|---|---|---|---|---|
| AC-8.1.1 | @p2 | tests/e2e/01-shell-persona-theme.spec.ts | (테스트 제목 그대로, 끝에 @p2) | PASS / FAIL / ENV-SKIP |
| AC-8.11.1 | @p5 | tests/e2e/07-market-receipt.spec.ts | ... @p5 | |
| AC-8.14.2 | 단위 | tests/unit/rating.test.ts | ... | |

## SHOULD AC (측정값만)
| AC | 측정 방법 | 값 |
|---|---|---|
| AC-8.1.2 | ... | ... ms |

## 확인
- [ ] `npx playwright test --list`의 모든 테스트 제목에 `@p0 @p2 @p3 @p4a @p4b @p5 @p5b @p6` 중 하나(기능 태그·무태그 0)
- [ ] 위 표의 AC 수 = PRD §8 MUST AC 수
