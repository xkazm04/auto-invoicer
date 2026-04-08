# auto-invoicer — harness learnings

Living reference for vibeman / autonomous-development runs against this project. New runs should read this **before** Phase 4.1 context-gathering so they don't re-discover the same structural facts from scratch.

## Structural facts

- **2026-04-09** — Project is a fresh Next.js 16 + React 19 + Tailwind 4 scaffold. Real source under `src/` is small: one page (`src/app/page.tsx`) wrapping a single 300+ LOC `InvoiceForm` component plus a 2-theme system (`paper-perfect`, `minimal-mono`). No tests, no API routes, no DB, no lib/types directories on first run.
- **2026-04-09** — `requirements/solution.md` describes a *huge* vision (Supabase + Groq OCR + RevenueCat + multi-country VAT). It is a **vision document, not the source of truth.** Treat it as roadmap, not spec — the actual codebase implements <5% of it.
- **2026-04-09** — `Invoice` data model lives in `src/types/invoice.ts`. Includes `Invoice`, `LineItem`, `Party`, `Currency`, `InvoiceStatus`, plus pure helpers `computeLineItemAmount` and `computeInvoiceTotals`. **VAT rate is stored on the invoice (`vatRate: number`), not derived from country.** The current default is `0.21` (Czech standard rate). When adding country-specific VAT logic later, this is the field to drive off.
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

## Open follow-ups (from Run #1, 2026-04-09)

- PDF theming parity (currently neutral default in PDF, regardless of selected Tailwind theme).
- Editable invoice number (currently read-only display; only the sample value).
- Editable status / status workflow (currently fixed at "draft").
- "Save Draft" / "Create Invoice" buttons are non-functional placeholders.
- No persistence (localStorage / DB).
- No form validation (zod / required fields / IBAN / VAT number format).
- 6 npm-audit findings inside `@react-pdf/renderer`'s subgraph; not auto-fixed because `--force` could break.
