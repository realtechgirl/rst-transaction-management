# RST Transaction Management

A beginner-friendly first MVP shaped by the **Master TC Planning Sheet**. It supports creating, viewing, and updating all currently identified transaction types without requiring a database account.

## What works

- Residential purchase, listing, new construction, vacant land, lease, and rental-listing files
- Core property, contract, status, price, and internal fields
- Repeatable people records instead of separate Buyer 1 / Buyer 2 columns
- Suggested milestone lists by transaction type
- Browser persistence using `localStorage`

## Run it locally

1. Install [Node.js LTS](https://nodejs.org/).
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

Your first records stay in that browser only. This is intentional for the first learning milestone. The next infrastructure step is replacing `lib/storage.ts` with Supabase.

## Starter architecture

- `app/page.tsx` — the complete working vertical slice
- `lib/types.ts` — the source-of-truth data shape
- `lib/storage.ts` — replaceable persistence layer
- `docs/data-model.md` — field decisions, duplicates, uncertainties, and next steps

## MVP boundary

This release does **not** calculate legal deadlines, send email or SMS, store documents, authenticate users, or claim compliance completeness. Those require reviewed state/form rules and persistent infrastructure.
