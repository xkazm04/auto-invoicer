# auto-invoicer — goal judgments

Training data for autonomous goal selection. Read at Phase 2a start to inform future ranking.

---

## Run #4 — 2026-04-09

**Mode:** improve
**Health scan:** 0 TS errors, 0 lint, 34/34 tests, 0 TODOs, largest file 537 LOC
**Selected goal:** Client contact book with reuse across invoices
**Source:** web-research + vision-gap (Contacts/CRM section in solution.md)
**Confidence at selection:** medium
**Quality score:** 100/100
**User verdict:** REJECTED (feature is correct but premature)
**Reasoning:** The contact book feature is technically solid but *isolated* — it's buried inside InvoiceForm's party section headers with no standalone access. The app has no navigation, no header, no route structure. Without a base layout and multi-page architecture, new features are undiscoverable. The user correctly identified that **app shell + navigation infrastructure** should have been prioritized over any individual feature.

**Backlog presented:**
1. Client contact book (selected) — research + vision
2. PDF theming parity — follow-up
3. Multi-currency locale formatting — vision-gap
4. Recurring invoice templates — research
5. Confirmation dialogs bundle — follow-up

**What should have been #1 instead:**
App shell with header navigation + route structure (/invoices, /contacts, /settings). This is an *infrastructure* goal that enables every future feature to be discoverable. The backlog ranking missed it because:
- It's not in the open follow-ups (nobody flagged it yet)
- The vision doc assumes it exists but doesn't list it as a discrete feature
- The health scan checks code quality, not UX architecture
- Web research returns features, not infrastructure

**Lessons for future ranking:**
- **NEW RULE: Before ranking features, check if the app has navigational infrastructure to host them.** If the app is a single-page monolith with no routing/nav, the highest-priority goal is ALWAYS "add app shell + route structure" — regardless of what features the backlog contains. Features without navigation are features users can't find.
- **The Improve Engine's three sources (follow-ups, vision-gap, research) all return *features*, never *infrastructure*.** Infrastructure gaps are invisible to feature-oriented scanning. The health scan checks code quality but not UX architecture. A new check is needed: "does the app have navigational structure to host N modules?" If not, that's the goal.
- Medium-confidence web-research goals need an additional filter: "can the user actually access this feature given the current app structure?"

---

## Run #5 — 2026-04-09

**Mode:** improve (infra override triggered)
**Health scan:** 0 TS errors, 0 lint, 44/44 tests, 0 TODOs, largest file 572 LOC
**Infrastructure check:** FAIL on all 3 (single route, no nav, no layout shell)
**Selected goal:** App shell with header navigation + route structure
**Source:** infrastructure-readiness check (Run #4 lesson)
**Confidence at selection:** high
**Quality score:** 100/100
**User verdict:** pending

**Lessons for future ranking:**
- Infrastructure-readiness check fired exactly as designed and selected the correct goal. The Run #4 lesson is now validated: the check catches the missing navigation gap and overrides feature candidates.
- Adding a new route is now trivial: create `src/app/{name}/page.tsx` + add one line to `NAV_ITEMS` in AppHeader. The module hosting pattern is established.

---

## Run #7 — 2026-04-09

**Mode:** improve
**Health scan:** 0 TS errors, 0 lint, 44/44 tests, 0 TODOs, largest file 572 LOC
**Infrastructure check:** PASS (2 routes, AppHeader nav, ClientShell layout)
**Selected goal:** PDF theming parity — match selected Tailwind theme in PDF output
**Source:** follow-up (noted since Run #1, 5 runs ago)
**Confidence at selection:** high
**Quality score:** 100/100
**User verdict:** pending

**Backlog presented:**
1. PDF theming parity (selected) — follow-up, high confidence
2. Invoice list page with status filtering — product gap
3. Confirmation dialogs — follow-up, low impact
4. i18n foundation — vision-gap, high blast radius

**Lessons for future ranking:**
- First autonomous goal after the infra override. Infrastructure check passed, so the Improve Engine ran normally. Selected the highest-confidence follow-up item that has been on the list the longest (5 runs). The reasoning: follow-up items > vision gaps > research, and this item has the clearest scope + highest user-visible impact (PDF is what clients see).
