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
- **2026-04-09** — The `fillParty` handler in InvoiceForm sets all 4 Party fields at once (name, taxId, vatId, address) from a Contact. It also triggers revalidation if `hasAttemptedCreate` is true. Used by ContactPicker's onSelect callback.
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
- PDF theming parity (still neutral default in PDF, regardless of Tailwind theme).
- ~~No test infrastructure~~ **DONE Run #3** — vitest configured with 34 tests across 3 files.
- ~~"Create Invoice" shows alert()~~ **DONE Run #3** — replaced with themed success banner (auto-dismiss 4s).
- No confirmation dialog before deleting drafts or overwriting.
- DraftsPanel polls every 2s for same-tab sync — works but not optimal for battery/performance. Consider broadcasting via `BroadcastChannel` or a shared context.
- Line items have no drag-to-reorder (only add/remove).
- npm-audit findings in `@react-pdf/renderer` subgraph still present.
