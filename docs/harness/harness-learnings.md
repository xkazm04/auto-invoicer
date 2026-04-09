# auto-invoicer — harness learnings

Living reference for vibeman / autonomous-development runs against this project. New runs should read this **before** Phase 4.1 context-gathering so they don't re-discover the same structural facts from scratch.

## Structural facts

- **2026-04-09** — Project is a fresh Next.js 16 + React 19 + Tailwind 4 scaffold. Real source under `src/` is small: one page (`src/app/page.tsx`) wrapping a single 300+ LOC `InvoiceForm` component plus a 2-theme system (`paper-perfect`, `minimal-mono`). No tests, no API routes, no DB, no lib/types directories on first run.
- **2026-04-09** — `requirements/solution.md` describes a *huge* vision (Supabase + Groq OCR + RevenueCat + multi-country VAT). It is a **vision document, not the source of truth.** Treat it as roadmap, not spec — the actual codebase implements <5% of it.
- **2026-04-09** — `Invoice` data model lives in `src/types/invoice.ts`. Includes `Invoice`, `LineItem`, `Party`, `Currency`, `InvoiceStatus`, plus pure helpers `computeLineItemAmount` and `computeInvoiceTotals`. **VAT rate is stored on the invoice (`vatRate: number`), not derived from country.** The current default is `0.21` (Czech standard rate). When adding country-specific VAT logic later, this is the field to drive off.
- **2026-04-09** — Invoice now has an `id: string` field (added Run #2) generated via `crypto.randomUUID()`. Used as localStorage key for drafts. Every `createSampleInvoice()` call generates a fresh ID.
- **2026-04-09** — Status cycling helper `nextStatus()` in `src/types/invoice.ts` advances `draft→sent→paid`. `overdue` is terminal (no forward transition from UI). The status badge in InvoiceForm is clickable.
- **2026-04-09** — Zod validation lives in `src/lib/invoice/validation.ts:validateInvoice()`. Returns `{ success, errors }` where errors is a flat `{ [path]: message }` map. Zod paths use dot notation (e.g. `supplier.name`, `lineItems.0.description`). Validation fires on "Create Invoice" click, then revalidates live after first attempt.
- **2026-04-09** — Drafts persistence is in `src/lib/invoice/drafts.ts`. Functions: `saveDraft`, `loadDraft`, `listDrafts`, `deleteDraft`. localStorage key format: `invoice-drafts:{id}`. Stored as JSON with a `_updatedAt` ISO timestamp. `listDrafts()` returns sorted by updatedAt descending.
- **2026-04-09** — `DraftsPanel.tsx` is a sidebar component rendered in `page.tsx` alongside `InvoiceForm`, not inside it. Polls localStorage every 2s for same-tab sync (localStorage doesn't fire `storage` events in the originating tab). Uses cross-tab `StorageEvent` for multi-tab sync.
- **2026-04-09** — `InvoiceForm` uses the React key-reset pattern for draft switching: `page.tsx` owns `currentInvoice` state and a `formKey` counter. Changing the key forces a full remount with new `initialInvoice`, which cleanly resets all internal state (validation errors, hasAttemptedCreate, etc.). This is intentional and should NOT be replaced with controlled state lifting unless the component's internal state grows significantly.
- **2026-04-09** — Test infrastructure: `vitest.config.ts` at project root, path aliases match tsconfig (`@/` → `./src/`), `node` environment (not jsdom — tests are for pure functions, not components). Test files live next to source in `__tests__/` dirs. 34 tests covering: invoice computations (13), validation schema (10), drafts persistence with mocked localStorage (11). Run via `npm test` or `npx vitest run`.
- **2026-04-09** — When testing `listDrafts` sort order, don't rely on `Date.now()` timestamps from near-simultaneous saves — they can be identical. Write test entries directly with controlled `_updatedAt` values.
- **2026-04-09** — Contact book lives in `src/types/contact.ts` (type) + `src/lib/contacts/store.ts` (CRUD). `Contact extends Party` with an `id` field. localStorage prefix `contacts:`. Pattern mirrors drafts store exactly. `ContactPicker.tsx` is a dropdown wired into InvoiceForm's supplier/customer section headers. "Save" button appears when party name is non-empty.
- **2026-04-09** — The `fillParty` handler in InvoiceForm sets all 4 Party fields at once (name, taxId, vatId, address) from a Contact. It also triggers revalidation if `hasAttemptedCreate` is true. Used by ContactPicker's onSelect callback and VAT lookup auto-fill.
- **2026-04-09** — `PaymentDetails` added to Invoice (Run #8): `{ iban, swift, bankName, reference }`. All strings, all on the Invoice object (not optional). Empty strings = not filled. Rendered in both InvoiceForm and InvoicePDF. IBAN/SWIFT/reference use `font-mono` for readability.
- **2026-04-09** — Auto-sequential numbering: `src/lib/invoice/numbering.ts:getNextInvoiceNumber()` reads/writes `invoice-last-number` in localStorage. Format: `YYYY-NNNN` (e.g. `2026-0001`). Resets sequence on new year. Called by `createSampleInvoice()` on the client only (`typeof window` guard).
- **2026-04-09** — **First API route**: `/api/vat/validate` (Run #8). POST `{ vatId, countryCode }` → `{ valid, name, address, countryCode, error? }`. Routes to ARES (`ares.gov.cz`) for Czech IČO (8-digit numbers with `CZ` country code) and EU VIES (`ec.europa.eu/taxation_customs/vies/rest-api`) for all other EU VAT numbers. Client-side wrapper: `src/lib/vat/lookup.ts:lookupVat()`. InvoiceForm has "Lookup" buttons next to VAT ID fields that call this and auto-fill name+address.
- **2026-04-09** — App shell architecture (Run #5): `ClientShell.tsx` in `src/components/layout/` is the "use client" wrapper owning ThemeContext + rendering AppHeader + ThemeSwitcher + children. `layout.tsx` imports it as server→client boundary. `AppHeader.tsx` uses `next/link` + `usePathname()` for active nav state. Routes: `/` redirects to `/invoices`, `/invoices/page.tsx` has the form+drafts, `/contacts/page.tsx` has standalone CRUD. Adding a new page = create `src/app/{name}/page.tsx` and add a NAV_ITEMS entry in AppHeader.
- **2026-04-09** — The ThemeSwitcher floats independently (fixed position) and is rendered by ClientShell, not by any page. Pages should NOT render their own ThemeSwitcher — it's already in the shell.
- **2026-04-09** — `src/lib/invoice/sample.ts:createSampleInvoice()` returns the canonical sample data the form starts with (number `2024-0042`, two line items: Consulting 10×1500 + Development 40×2000, currency CZK). Use this factory anywhere a "default invoice" is needed; do not duplicate the literals.
- **2026-04-09** — `InvoiceForm.tsx` is **fully controlled** as of commit `e9d1060`. Single `useState<Invoice>` at the component root drives every input. Helpers `updateField` / `updateParty` / `updateLineItem` / `addLineItem` are defined at the top. Adding a new field = extend `Invoice` type, extend `createSampleInvoice`, then bind one input to `invoice.X` + `updateField("X", ...)`. **Do not introduce a separate state library** unless the form grows materially.
- **2026-04-09** — Theme system (`src/components/invoice/theme.ts` + `ThemeContext.tsx` + `ThemeSwitcher.tsx`) is a **token-bag pattern**: each theme exports a `ThemeTokens` object with ~50 className strings. The form interpolates these via `useTheme()`. Two themes exist: `paper-perfect` (warm cards) and `minimal-mono` (terminal-grid). To add a new theme: extend `ThemeId` union, add an entry to `themes` map matching the existing token shape. **Theme classes are Tailwind-only — do not assume they apply to non-DOM render targets like react-pdf.**
- **2026-04-09** — PDF generation uses `@react-pdf/renderer@4.x`. Document component is `src/components/invoice/InvoicePDF.tsx`. **It does NOT share styling with the Tailwind theme system** — it has its own neutral `StyleSheet.create({...})` block. v1 deliberately did not implement theme parity in the PDF; that is a known follow-up.
- **2026-04-09** — PDF download is **client-side only** via `src/lib/pdf/download.ts:downloadInvoicePDF()`. There is no `/api/invoice/pdf` route. The `pdf()` function from `@react-pdf/renderer` requires a type cast to `ReactElement<DocumentProps>` when wrapped in a custom component — see the comment in `download.ts`. The runtime accepts the wrapped element but TS types are stricter.
- **2026-04-09** — `next build` works end-to-end with `@react-pdf/renderer` because all imports flow through `InvoiceForm.tsx` which has `"use client"` at the top. The fontkit/zlib transitives raise 6 npm-audit warnings (2 moderate, 3 high, 1 critical) — these are in `@react-pdf/renderer`'s subgraph, not direct dependencies. **Do not run `npm audit fix --force`** without checking; it could break the PDF generation.
- **2026-04-09** — Buttons "Save Draft" and "Create Invoice" are **purely visual** — they have no `onClick` handlers and no backing action. Don't rely on them doing anything; if a future goal needs persistence or submission, those buttons need to be wired explicitly.

## Conventions enforced

- **No `any` in new code.** All new types must be precise. The single existing escape hatch is the `ReactElement<DocumentProps>` cast in `download.ts` and it carries an inline comment explaining why.
- **Keep `InvoiceForm.tsx` declarative.** Side effects (PDF generation, future submission, future persistence) live in `src/lib/**` helpers; the form just calls them inside `useCallback` handlers.
- **Currency lives on the invoice, not on a side context.** The `Currency` field in state drives both the form display and the PDF.

## Anti-patterns to avoid

- **Do not put data inline in `InvoiceForm.tsx`.** The original commit had hardcoded `defaultValue` strings and a hardcoded line-items array. That cost the first vibeman run a major Phase 4.1 escalation. Always source defaults from `createSampleInvoice()` or similar factories.
- **Do not assume `pdf()` accepts any React element.** TS will complain about the variance even though runtime is fine. Always cast at the call site, not by widening the component signature.
- **Do not call `setState` directly in useEffect body (Next.js eslint catches this).** Use lazy state initialization `useState(() => ...)` for initial data loads. Subscription callbacks inside effects are fine. Discovered in `DraftsPanel.tsx` Run #2.

## Open follow-ups (from Run #2, 2026-04-09)

- ~~Editable invoice number~~ **DONE Run #2**
- ~~Editable status / status workflow~~ **DONE Run #2** (draft→sent→paid; overdue is terminal)
- ~~"Save Draft" / "Create Invoice" buttons~~ **DONE Run #2** (Save saves to localStorage, Create validates via zod)
- ~~No persistence~~ **DONE Run #2** (localStorage drafts with DraftsPanel sidebar)
- ~~No form validation~~ **DONE Run #2** (zod schema, inline errors, submit gate)
- ~~PDF theming parity~~ **DONE Run #7** — InvoicePDF now accepts `themeId` prop, uses `getPdfTheme()` from `src/lib/pdf/pdfTheme.ts`. Two PDF color configs: paper-perfect (warm #F8F7F4 background, #2C2825 text, rounded panels) and minimal-mono (white background, Courier font, no border radius). Theme flows through `downloadInvoicePDF(invoice, themeId)` from InvoiceForm.
- ~~No test infrastructure~~ **DONE Run #3** — vitest configured with 34 tests across 3 files.
- ~~"Create Invoice" shows alert()~~ **DONE Run #3** — replaced with themed success banner (auto-dismiss 4s).
- ~~No confirmation dialog before deleting drafts or overwriting.~~ **DONE Run #10** — ConfirmDialog component in `src/components/ui/ConfirmDialog.tsx`, wired into DraftsPanel + contacts page.
- ~~DraftsPanel polls every 2s for same-tab sync~~ **DONE Run #10** — BroadcastChannel `invoice-drafts-sync` for same-tab, StorageEvent for cross-tab, 10s fallback poll. Export `notifyDraftsChanged()` for callers.
- Line items have no drag-to-reorder (only add/remove).
- npm-audit findings in `@react-pdf/renderer` subgraph still present.

## Open follow-ups (from Run #10, 2026-04-09)

- **2026-04-09** — Invoice archive store (`src/lib/invoice/archive.ts`) uses `invoice-archive:` localStorage prefix. Pattern matches drafts and contacts stores. Archive stores the full Invoice + `_archivedAt` metadata.
- **2026-04-09** — Settings store (`src/lib/settings/store.ts`) key: `app-settings`. Uses `createDefaultSettings()` for missing-field merge on load. Company profile auto-fills supplier on new invoices via `createSampleInvoice()`.
- **2026-04-09** — Recurring templates store (`src/lib/recurring/store.ts`) uses `recurring-template:` prefix. Template captures line items, contact, payment details, interval. "Save as Template" inline form in InvoiceForm actions area.
- ~~**2026-04-09** — App now has 4 routes~~ **REPLACED Run #11** — App is now a SPA. Single route `/` with tab-based navigation. Modules in `src/modules/` are lazy-loaded via `React.lazy()` + `Suspense`. AppHeader uses `TabId` state instead of `next/link` + `usePathname()`. ClientShell owns `activeTab` state and renders the active module with FadeIn transition.
- **2026-04-09** — `formatMoney()` in `src/lib/currency/format.ts` is the single source of truth for currency formatting. Uses `Intl.NumberFormat` with locale per currency (cs-CZ, de-DE, en-US). Options: `{ decimals?: boolean, symbolOnly?: boolean }`.
- **2026-04-09** — Dashboard computes KPIs client-side from archive + drafts lists. Overdue detection uses `dueDate < now && status !== "paid"`. No server-side aggregation yet.
- **2026-04-09** — `createSampleInvoice()` now auto-fills from settings: supplier, payment details, currency, VAT rate. Issue date = today, due date = today + 14 days. Line items start with 1 empty item instead of 2 sample items.
- Recurring templates have no "Use Template" button yet — users can save templates but can't create invoices from them. Next run should add a template picker to the invoices page.
- Settings page has no "Use Template" quick-create action.
- Dashboard has no clickable invoice rows (no detail view / edit from dashboard).
- No email/share/export functionality beyond PDF download.
- No multi-language support (i18n).

## Open follow-ups (from Run #11, 2026-04-09)

- **2026-04-09** — SPA architecture: `ClientShell.tsx` owns `activeTab` state (type `TabId`). Modules are `React.lazy()` imports from `src/modules/`. Each tab switch increments `moduleKey` to trigger FadeIn re-animation.
- **2026-04-09** — Animation system: `FadeIn` (delay, duration, fadeInUp keyframe) and `StaggeredList` (incremental delay per child) in `src/components/ui/`. Applied to dashboard KPIs, contact list, settings sections.
- **2026-04-09** — React.memo applied to: `PartySection`, `ContactPicker`, `ConfirmDialog`, `InvoiceForm` (via MemoizedInvoiceForm in InvoicesModule). useMemo on: invoice totals, dashboard KPIs, unified invoice list, filtered list, KPI cards.
- **2026-04-09** — Old route pages deleted (`/dashboard`, `/invoices`, `/contacts`, `/settings`). Only `/` and `/api/vat/validate` remain as Next.js routes. Adding a new "tab" requires: create `src/modules/XModule.tsx`, add lazy import in `ClientShell.tsx`, add `TabId` union member, add case to `renderModule()`, add entry to `NAV_ITEMS` in `AppHeader.tsx`.
- DraftsPanel BroadcastChannel should be called from InvoicesModule after save (currently `notifyDraftsChanged()` is exported but not called from the save handler in InvoicesModule).
