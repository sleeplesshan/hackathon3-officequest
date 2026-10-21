# Visual QA

The P6 unfiltered Chrome production run passed all 20 visual tests: ten reference DOM gates and ten comparison tests. All ten comparisons were refreshed after the current-run captures; the manifest records 10 PASS and 0 MISSING. Final Right Brain composition review passed all ten images. Ref07 was corrected once and re-reviewed after the final captures.

Capture contract: 1920×1080, device scale 1, Korean locale, Asia/Seoul, fixed 2026-10-21 14:02:48 KST, seeded state, fonts ready, hydrated application. Each screenshot has a `.styles.json` dump and a `.document.json` font/background/viewport record under `qa/screens/`.

| ref | Item | PASS/FAIL | Evidence |
|---|---|---|---|
| 01 | DOM: four cards, gold sprite, Lv12 / 1,500 P / 0/2 / 23 / D-14 / 1/4; 78%; ranking and 3+3 feeds | PASS (P6) | `refs.spec.ts` — `01 dashboard light: seeded information, four cards, ranking and feeds`; [capture](screens/01_dashboard_light.png) |
| 02 | DOM: four missions, enabled login reward and three navigation CTAs; six distinct nonempty tier canvases, gold current | PASS (P6) | `02 daily quests: four missions, enabled actions, all six distinct visible tier sprites`; [capture](screens/02_daily_quests_tiers.png) |
| 03 | DOM: seven rows, first7, type7/3/4, status3/2/1/2, revision badge, exact nine table headers | PASS (P6) | `03 quest board: seven rows, all filter counts and revision state`; [capture](screens/03_quest_board.png) |
| 04 | DOM: real editor toolbar, 1.8 MB SharePoint link, 1,500→1,200 escrow, 400 P+100 EXP, checklist3/4 | PASS (P6) | `04 quest create: real editor, SharePoint attachment and escrow/reward checklist preview`; [capture](screens/04_quest_create.png) |
| 05 | DOM: dialog, disabled→enabled confirmation after three checks, unchanged DB and correct escrow, 640±2 px width | PASS (P6) | `05 security pledge: accessible modal, three required checks and exact escrow summary`; [capture](screens/05_security_pledge_modal.png) |
| 06 | DOM: recruiting, edit/delete enabled, locked worker editor, three applicants and adoption buttons, 400 P | PASS (P6) | `06 recruiting quest: locked worker editor, three applicants/adoption buttons and escrow reward`; [capture](screens/06_quest_detail_recruiting.png) |
| 07 | DOM: locked edit/delete with reason, adopted worker, v1, review buttons, four Teams messages and typing, 420×560 chat, entire timeline above chat | PASS (P6) | `07 in-progress quest: pending submission, locked editing, worker and four-message Teams typing`; [capture](screens/07_quest_detail_inprogress_teams.png) |
| 08 | DOM: clear overlay, z9999, frozen1000 ms, LEVEL UP!, +100 P/+300 P/+100 EXP, three stars | PASS (P6) | `08 completion hyperframe: frozen1000ms scene,9999z-index,three rewards and level-up`; [capture](screens/08_hyperframe_complete.png) |
| 09 | DOM: dark theme, eight items, exact village counts, two reserved/one sold/two free, four grid columns | PASS (P6) | `09 dark village: eight items, all village counts, reserved/sold and free states`; [capture](screens/09_village_market_dark.png) |
| 10 | DOM: six sites, seven eligible employees, Jung selected without DB commit, Lee/Oh reserve/final disabled | PASS (P6) | `10 orgchart: six sites, eligible employees, selected jung and disabled low-point actions`; [capture](screens/10_village_detail_orgchart.png) |
| 01–10 | Common DOM: GNB64, three player tabs, timer/points/persona/theme; Paperlogy; light/dark tokens; no horizontal overflow, emoji, or console errors; sidebar264±2 where present | PASS (P6) | Shared `common()` and auto console fixture; per-capture `.document.json` / `.styles.json` |
| 01–10 | Final side-by-side composition review | PASS — 10/10 | Right Brain must inspect [01](compare/01.png), [02](compare/02.png), [03](compare/03.png), [04](compare/04.png), [05](compare/05.png), [06](compare/06.png), [07](compare/07.png), [08](compare/08.png), [09](compare/09.png), [10](compare/10.png) from the completed P6 capture run |

Allowed differences are grounded in the PRD/Harness:

- D53 permits rating text on ref01 and applicant/worker ratings, rejection counts, and stars on refs06–08. Rating/admin/restriction UI has no visual reference and is verified through DOM tests.
- Ref01 popular items follow live like-count ranking and exclude sold items. The third seeded item is the game pad; the reference monitor is illustrative (PRD §8.2).
- D6 uses the resolved app dimensions: GNB64, sidebar264, detail aside400. The reference design's conflicting legacy dimensions do not override these.
- Ref10 interest chips are MAY content and do not affect the result (Harness §6). The employee list scrolls within the modal while its footer remains visible.
- Screenshot capture finishes finite CSS entrance transitions; the org selection coin burst settles for750 ms, beyond its source-defined maximum700 ms. Hyperframe08 remains frozen at the required1000 ms.

Composition failures are recorded independently from the mandatory DOM gates. Harness §6 permits at most two repair/capture attempts before recording an unresolved composition variance with evidence; the final review reports 10/10 PASS with no unresolved composition failures.

Production gates: `PW_CHANNEL=chrome npm run test:e2e` → 69 passed; `PW_CHANNEL=chrome npm run test:visual` → 20 passed. Both scripts performed fresh builds. Font records report Paperlogy loaded; no ENV-SKIP, missing comparisons, or browser errors were reported.

Ref07 final re-verification: the active quest aside shows its timeline first. A DOM bounding-box gate now requires `timeline.bottom <= teams.top` before capture; the timeline bbox is also recorded in the styles JSON. The full 69-test E2E and 20-test visual production suites were rerun after this source correction. Composition re-review remains assigned to Right Brain.


## Final Right Brain composition review

All ten side-by-side images were inspected visually. Ref07 initially failed because an extra reward card pushed the timeline behind Teams; fix attempt1 removes that card in active/revision states, matching DESIGN ref07. The refreshed image was reviewed again: timeline bottom389px, Teams top496px, clear gap107px. Submission and review actions remain visible.

| ref | Item | PASS/FAIL | Evidence |
|---|---|---|---|
| 01 | Asymmetric three-column four-card dashboard; character, ranking, feeds | PASS | [comparison01](compare/01.png); rating/game-pad differences grounded in PRD |
| 02 | Four missions and character/six-tier two-column layout | PASS | [comparison02](compare/02.png) |
| 03 | Filters, seven rows, column order and pagination | PASS | [comparison03](compare/03.png); revision filter follows D9 |
| 04 | Main editor form and three aside cards, attachment and registration CTA | PASS | [comparison04](compare/04.png) |
| 05 | Centered640px pledge with dim/blur, required checks, escrow and actions | PASS | [comparison05](compare/05.png) |
| 06 | Request, locked editor, reward and three applicant rows | PASS | [comparison06](compare/06.png); stepper/ratings are additional requirements |
| 07 | Timeline above Teams without overlap; submission and approve/reject visible | PASS — fixed attempt1 | [comparison07](compare/07.png);107px clear gap and DOM regression |
| 08 | Centered character/slime/sword, coin rain and three reward cards | PASS | [comparison08](compare/08.png); stars/particle positions allowed |
| 09 | Dark market sidebar, four-by-two cards, pixel items and status badges | PASS | [comparison09](compare/09.png); purchase CTA follows DESIGN |
| 10 | Organization tree, employee rows, selection and footer actions | PASS | [comparison10](compare/10.png); internal list scroll and low-funds guards allowed |
