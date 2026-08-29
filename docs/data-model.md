# MVP data model decisions

This model reconciles the **RST Source of Truth, Fields, Intake Info, Documents, CTC Tasks, Transaction Profile Sheet, and Airtable Fields** tabs.

## Smallest useful model

The first version uses one aggregate `Transaction` with two repeatable child lists:

1. **Transaction** — property, type, side, status, contract dates, price, financing, MLS, fee, and notes.
2. **Party** — a reusable shape for clients, agents, cooperating agents, title/escrow, and lenders.
3. **Milestone** — a label, due date, and completion status. This absorbs the many state- and contract-specific deadline columns without adding hundreds of mostly-empty database fields.

Documents and tasks are represented as future template-driven modules, not transaction columns. The planning tabs describe checklists: one document or task definition may apply to many transaction types.

## Why this supports all transaction types

`transactionType` identifies seven clear workflows: residential purchase, residential listing, residential new construction, vacant-land purchase, vacant-land listing, residential lease, and rental listing. `side` separately captures buyer, seller, landlord, tenant, or both. Optional fields allow each type to share the same core record while type-specific milestone templates change the workflow.

## Clear duplicates and corrections

| Planning-sheet field | Decision |
|---|---|
| Additional Deposit Amount | Duplicate of Additional Earnest Money Amount; do not create both |
| Additional Deposit Due | Duplicate of Additional Earnest Money Due; delete alias |
| Date of Contract / Contract Agreement / Effective Date | Keep `effectiveDate` for MVP; preserve other dates only after their exact legal meaning is defined |
| Closing / Estimated Closing Date | Keep `closingDate`; add `actualClosingDate` when closing workflow is built |
| Purchase Amount / Purchase Price | One `purchasePrice` field |
| Buyer, Seller, Agent, Title, Lender columns across tabs | Store as repeatable `Party` records with roles |
| Deposit 1 / Deposit 2 and repeated deadline columns | Use milestone records; add amount support in the next iteration |
| SPD Status listed twice in Airtable Fields | One disclosure-status concept; exact document status belongs in the document module |

## Uncertain or inconsistent fields to review

- **Listing Price** is typed as Date in Fields; it should almost certainly be Currency.
- **Preferred Closing Time** is typed as Date; likely Time or Date/Time.
- **Pet Deposit** mixes a currency type with status choices (none/refundable/non-refundable). Split into amount and terms.
- **Contract Type**, **Purchase Type**, **Transaction Type**, **Property Type**, and **Client Type** overlap but are not interchangeable. The MVP retains transaction type and side; controlled vocabularies need business review.
- **Closing with**, **Preferred Closing Type**, and title/escrow roles overlap.
- **Status**, **Contract Status**, **BO Status**, **Listing Status**, **MLS Status**, and **Loan Status** describe different systems. Only overall transaction status belongs in the core record.
- Many deadlines are jurisdiction- and contract-specific. The app must not calculate them until rule sources, calendar-day rules, holidays, time zones, and amendment behavior are documented and tested.
- The Documents tab is Florida/FR-BAR-heavy while Fields contains multi-state concepts. Document templates need state, transaction type, side, requirement condition, and version/effective date.
- CTC Tasks places list-side and buy-side steps in adjacent columns, but many rows are not true pairs. Convert each into an independent task template with applicability rules.

## Next database-ready structure

When browser storage becomes limiting, migrate to Supabase tables in this order:

1. `transactions`
2. `contacts`
3. `transaction_parties` (transaction + contact + role)
4. `milestones`
5. `task_templates` and `tasks`
6. `document_templates` and `documents`

Do not add Emails or Documents as giant groups of columns. They should be related records with timestamps, status, template/source, and provider identifiers.

## Definition of done for this slice

- A TC can create any supported type.
- The record survives refresh in the same browser.
- A TC can open and update it.
- People can be added without a fixed Buyer 1 / Buyer 2 limit.
- Type-specific suggested dates can be loaded and edited.
- No automation implies legal deadline accuracy.
