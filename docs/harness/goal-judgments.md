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
**User verdict:** ACCEPTED (feature works) but CRITIQUED (wrong priority)
**Reasoning:** "Feature is nice but we're missing core business features. How to correctly design and populate invoices from a legal perspective, what does it mean across multiple countries, how to really create an international invoice app, whether we can use official registries to get metadata per VAT ID. The skill should evaluate competition or how invoices are created so it understands what lacks and designs larger features. Goals are too small, leading to non-risky but no high value outcomes."

**What should have ranked higher:**
Country-specific invoice compliance — legal field requirements per jurisdiction (CZ: IČO/DIČ via ARES, EU: VAT validation via VIES), mandatory invoice fields, sequential numbering rules, tax calculation rules. This is the *core business value* of an international invoice app.

**Root cause of the ranking miss:**
The ranking criteria prioritize confidence (#1) over impact (#2). Follow-up items are always highest-confidence, so they always win. But confidence doesn't equal value — "we're sure this small polish is correct" beats "this large business feature would make the product viable." The skill optimizes for safety, not growth.

**Lessons for future ranking:**
- **CRITICAL: Flip the ranking. Impact (business value) must be #1, confidence #2.** A high-impact medium-confidence goal beats a low-impact high-confidence goal every time. The user has said this twice now (Run #2: "we need more ambitious iterations", Run #7: "goals are too small").
- **Follow-up items are polish, not product.** Open follow-ups (PDF theming, confirmation dialogs, polling optimization) are UX polish. They don't make the product *viable* for real users. The Improve Engine must distinguish between "polish the existing features" and "add the features that make this a real product."
- **The Improve Engine needs a Business Domain Scan.** Before checking follow-ups or vision gaps, research what the *business domain requires*. For an invoice app: legal compliance, mandatory fields, tax rules, registry validation. This is the highest-value source because it identifies what makes the product *actually usable* vs. just *technically complete*.
- **Goals should be larger.** The user wants 5-8 task ambitious goals that address a business capability, not 3-4 task polish goals that close a follow-up. "Country-specific invoice compliance" is a business capability; "PDF theming parity" is polish.

---

## Run #8 — 2026-04-09

**Mode:** improve (Business Domain Scan — first use of v2 Improve Engine)
**Health scan:** 0 TS errors, 0 lint, 44/44 tests, 0 TODOs, largest file 572 LOC
**Infrastructure check:** PASS
**Selected goal:** Invoice compliance: payment details, auto-numbering, VAT ID lookup
**Source:** business domain scan (EU Directive 2006/112/EC Article 226, ARES API, VIES API)
**Confidence at selection:** medium
**Quality score:** 100/100
**User verdict:** CRITIQUED (right goal, execution lacks strategic depth)
**Reasoning:** Three specific gaps: (1) Lookup buttons have no styling — bare text with no visual affordance, doesn't communicate the feature's value. (2) ARES returns IČO, DIČ, legal form, registration court, file number — but we only capture name+address, which may not be legally sufficient. (3) Contacts page (/contacts) has no VAT lookup, even though that's the primary place users manage contacts. Meta-issue: the skill executes tasks mechanically without stepping back to ask "is this feature complete from a user's perspective?" — missing design-level thinking about data completeness, surface coverage, and UI quality.

**What the skill should have done differently:**
- Before implementing: research what ARES *actually returns* (not just that it exists) and map those fields to legal invoice requirements
- Before coding the lookup: list every surface where a user enters a VAT ID and plan to wire lookup into ALL of them
- Before committing UI: ask "does this button's visual treatment match its importance as a feature?"

**Business Domain Scan findings:**
- EU invoices require: sequential numbering, payment details (IBAN), VAT breakdown, seller/buyer IDs
- Czech ARES REST API: free, no key, lookup by IČO at ares.gov.cz
- EU VIES REST API: free, no key, validate any EU VAT number
- The app had ZERO of these — no payment fields, no auto-numbering, no API routes

**What was implemented (8 tasks):**
1. PaymentDetails on Invoice type (IBAN, SWIFT, bank, reference) — form + PDF
2. Auto-sequential numbering (YYYY-NNNN, localStorage-persisted, year-reset)
3. First API route: /api/vat/validate (ARES for CZ IČO, VIES for EU VAT)
4. VAT lookup buttons on supplier/customer sections — auto-fill from registry

**Lessons for future ranking:**
- Business Domain Scan produced the first goal aligned with what the user explicitly asked for in Run #7 feedback. This validates the v2 Improve Engine design — domain requirements outrank follow-up items.
- 8 tasks is ambitious but executable — per-task tsc rhythm kept everything stable across the largest goal yet.
- The first API route is a significant infrastructure milestone — future runs can add more server-side capabilities.

---

## Run #10 — 2026-04-09

**Mode:** improve (user-directed mega-iteration — 5 goals combined)
**Health scan:** 0 TS errors, 0 lint, 44/44 tests, 0 TODOs, largest file 509 LOC
**Infrastructure check:** PASS
**Selected goal:** Mega-iteration: Dashboard + Settings + Multi-currency + Recurring templates + UX polish
**Source:** user-directed (user requested all 5 backlog items in one run)
**Confidence at selection:** high (user explicitly approved)
**Quality score:** 100/100
**User verdict:** pending

**What was implemented (9 tasks, 10 commits):**
1. Foundation stores: archive, settings, recurring — types + localStorage CRUD (5 new files)
2. Multi-currency formatMoney() utility with Intl.NumberFormat — applied to InvoiceForm, DraftsPanel, InvoicePDF
3. Wire Create Invoice → archive + auto-fill supplier from saved company profile
4. Dashboard page: KPI cards (invoiced/paid/outstanding/overdue), invoice list, status filter tabs, overdue tracking
5. Settings page: company profile (with VAT lookup), payment defaults, currency/VAT config
6. Recurring templates: Save as Template from invoice form + template management in settings
7. AppHeader nav updated (4 items: Dashboard, Invoices, Contacts, Settings), homepage → /dashboard
8. Confirmation dialogs (ConfirmDialog component, wired into draft + contact deletes), DraftsPanel BroadcastChannel
9. 32 new tests (archive, settings, recurring stores + currency formatting) — 76 total, all passing

**Scale:** 13 files created, 9 files modified, ~1458 lines added, 10 commits. Largest single run by far.

**Lessons for future ranking:**
- User-directed multi-goal iterations are viable if the goals are complementary. These 5 goals shared infrastructure (stores, formatting) that made bundling efficient.
- 9 tasks in one run works with per-task tsc + commit rhythm. The key is that each task is independently testable and committable.
- The mega-iteration pattern is best when the user explicitly wants velocity over granularity. Don't auto-select this pattern — it's a user choice.
- createSampleInvoice() now depends on loadSettings() which reads localStorage — this means it can't be called server-side without the `typeof window` guard. Keep the guard.

---

## Run #12 — 2026-04-09

**Mode:** improve (Autonomous — Business Domain Scan)
**Health scan:** 0 TS errors, 0 lint, 76/76 tests, 0 TODOs, largest file 594 LOC
**Infrastructure check:** PASS (SPA shell with 4 tabs)
**Selected goal:** QR payment codes (SPD) + invoice detail view from dashboard
**Source:** business domain scan (Czech Banking Association SPD standard) + open follow-up (dashboard click-through)
**Confidence at selection:** medium
**Quality score:** 100/100
**User verdict:** pending

**Backlog presented:**
1. QR payment codes + invoice detail (selected) — domain scan + follow-up
2. Use Template to pre-fill from recurring — follow-up
3. CSV/JSON export for tax filing — competitive
4. Email share via mailto: — competitive
5. Drag-to-reorder + DraftsPanel fix — follow-up bundle

**What was implemented (7 tasks, 8 commits):**
1. `qrcode` npm dependency + SPD string generator (`src/lib/payment/spd.ts`)
2. QrPayment React component — renders SPD QR from invoice data
3. QR code in InvoicePDF via pre-generated data URL passed as Image
4. QR wired into InvoiceForm below payment details
5. InvoiceDetail — read-only view with status actions (mark paid, advance, PDF download)
6. Dashboard clickable rows opening InvoiceDetail
7. 16 tests for SPD format compliance

**Lessons for future ranking:**
- Business domain scan correctly identified QR payments as highest impact. This is the first feature that makes the product distinctly Czech-market-ready.
- The `qrcode` npm package works cleanly with both React DOM (toDataURL) and @react-pdf/renderer (Image src). No issues with the dual-render approach.
- InvoiceDetail needs to reload the invoice after status changes to show updated state. The `handleDetailUpdated` pattern (refresh list + reload selected) works.
- SPD format is simple enough that a pure string generator covers it — no need for a dedicated library beyond QR rendering.
