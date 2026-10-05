# University Consortium AI Data Center

Editable GPT Site with public read access for an investment committee review of a proposed 25 MW total-facility AI/HPC planning envelope. The 25 MW figure is not an approved build, IT load, utility commitment, or site selection. The university alliance is an intentionally fictional assignment case; member weights and demand records are explicit scenario assumptions.

## Where to edit

- `components/site-view.tsx`: the decision pages and assistant panel.
- `public/downloads/university-consortium-ic-memo-2-page.pdf`: the two-page IC Memo download shown on the homepage.
- `components/country-comparison.tsx`: US, China, and UK evidence cards and the Great Britain live indicator.
- `lib/sections.ts`: navigation and page order.
- `data/*.json` and `lib/planning-model.ts`: the existing illustrative demand, architecture, and economics model.
- `db/schema.ts`: D1 tables for users, scenarios, evidence, assumptions, and chat rate limits.
- `lib/research-evidence.ts`: curated initial records, sources, and narrowly scoped corrections for earlier placeholders.
- `app/api/research/route.ts`: D1 evidence read API.
- `app/api/research/refresh/route.ts`: server-side NESO carbon-intensity refresh.
- `app/api/research/admin/route.ts`: role-protected manual evidence and assumption updates.
- `app/api/chat/route.ts`: authenticated, registered-user, rate-limited assistant with D1 citations.

The parent ChatGPT project's `sources/` files are read-only reference material. Do not edit or move them. The country page reads D1; other research pages still use checked-in model JSON. Every new external fact should include a source, reporting period, retrieval date, and classification as fact, estimate, calculation, assumption, or unknown. National data-centre and carbon measures have different statistical boundaries, so avoid presenting them as a uniform ranking.

## Research data lifecycle

The first `/api/research` request imports curated records into D1. Subsequent reads use D1 values. Verified Great Britain carbon and China water/PUE policy records update only their original placeholder rows, preserving edited records. For future evidence updates, add an explicit idempotent correction or ingestion route; editing the seed array alone does not overwrite existing D1 rows.

Only a signed-in, registered D1 user with `role=admin` can refresh from the NESO API or edit research records. The server validates the half-hour record before writing it. A failed update preserves the last valid value and records the failure time. The live reading is a GB grid indicator, not annual data-centre emissions.

## AI Research Assistant

Set `OPENAI_API_KEY` only as a **secret** in this Site's production runtime settings; never place it in source code, D1, or `.openai/hosting.json`. `OPENAI_MODEL` is optional; the route defaults to the Responses-compatible `gpt-5.4-mini`. A signed-in visitor must register before chatting; the route limits each registered user to 20 questions per hour. User-owned saved scenario inputs are included only when a valid scenario ID is supplied. The server selects a bounded D1 evidence set and rejects answers whose citation IDs cannot be verified.

## Local checks

Use Node.js 22.13 or later. From this directory, run `npm run db:generate` after schema changes, then `npx tsc --noEmit --incremental false` and `npm run build`. Publish through the Sites workflow; production D1 migrations are applied during deployment. Keep applied `drizzle/*.sql` and matching `drizzle/meta` files immutable.
