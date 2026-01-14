# Polymarket Data Platform (Design)

Goal: collect **as much Polymarket historical + future data as the public APIs allow**, with a system that is **simple, cheap, and easy to operate** (security is explicitly a lower priority).

This design is intentionally “boring”: **append-only raw logs** + a small **local state DB** + optional **Parquet compaction** so everything is queryable with **DuckDB**.

---

## 1) What we can (and cannot) collect

### 1.1 Data sources we should use (official + pragmatic)

- **Gamma API (`https://gamma-api.polymarket.com`)**
  - Markets & events metadata (rich, nested structures, tags, categories, etc.)
  - Best for discovery and “what exists / what changed”.
- **CLOB REST (`https://clob.polymarket.com`)**
  - L2 order book snapshots (`/book`, `/books`)
  - Spot quotes (`/price`, `/prices`, `/midpoint`, `/spread`)
  - Token price history (`/prices-history`)
  - CLOB market metadata (fees, tick size, neg risk flags, token list) via the official client’s `getMarket(s)` methods.
- **CLOB WebSocket (“market channel”, `wss://ws-subscriptions-clob.polymarket.com/ws/market`)**
  - Real-time `book` snapshots + `price_change` deltas + `tick_size_change` + `last_trade_price` (and more via `custom_feature_enabled`)
  - Best for **future order book history**.
- **Data API (`https://data-api.polymarket.com`)**
  - Global trade feed (`/trades`) and other analytics endpoints like open interest (`/oi`)
  - Very useful for trade history, but pagination limits may require per-market slicing.
- **RTDS (`wss://ws-live-data.polymarket.com`)** (optional but powerful)
  - The SDK already supports “unofficial” topics like `activity` (trades) + `clob_market` (agg orderbook / price change). Treat as best-effort.
- **Subgraphs (Goldsky GraphQL)** (optional for “best possible backfill”)
  - Most reliable way to get *deep historical on-chain activity*; also a potential escape hatch if Data API pagination is insufficient for high-volume markets.

### 1.2 Hard limitation: “historical order books”

There is **no public endpoint** that returns full historical order books prior to the moment you start collecting WebSocket messages.

What we *can* do:
- **Forward (from now on)**: near-complete order book history using WebSocket deltas + periodic `/books` snapshots.
- **Backward (before collection starts)**:
  - **Price history** from `/prices-history` (aggregated)
  - **Executed trades** from Data API and/or subgraphs
  - But **not** the full book dynamics (adds/cancels) with perfect fidelity.

This design maximizes “backward detail” with price history + trades, and maximizes “forward detail” with WS + snapshots.

---

## 2) Storage: cheap + queryable

### 2.1 Principle: raw-first + compact later

- **Raw zone**: append-only, compressed JSONL logs of every response / WS message.
- **Curated zone**: Parquet tables partitioned by date (and sometimes token/market) for fast SQL.
- **State**: one tiny SQLite file for cursors/checkpoints and operational metadata.

This keeps ingestion code dead-simple and makes schema changes survivable (reprocess from raw).

### 2.2 Recommended on-disk layout

Pick a single “data root”, e.g. `~/pm-data` (or an S3/R2 bucket with the same layout).

```
pm-data/
  raw/
    gamma/
      markets/         date=YYYY-MM-DD/part-0000.jsonl.gz
      events/          date=YYYY-MM-DD/part-0000.jsonl.gz
    clob/
      markets/         date=YYYY-MM-DD/part-0000.jsonl.gz
      prices_history/  token_id=.../year=YYYY/month=MM/part-0000.jsonl.gz
      books/           date=YYYY-MM-DD/part-0000.jsonl.gz
    data_api/
      trades/          date=YYYY-MM-DD/part-0000.jsonl.gz
      oi/              date=YYYY-MM-DD/part-0000.jsonl.gz
    ws/
      clob_market/     date=YYYY-MM-DD/shard=00/part-0000.jsonl.gz
  curated/
    parquet/
      dim_market/      snapshot_date=YYYY-MM-DD/part-0000.parquet
      dim_token/       snapshot_date=YYYY-MM-DD/part-0000.parquet
      trades/          date=YYYY-MM-DD/part-0000.parquet
      price_history/   token_id=.../year=YYYY/month=MM/part-0000.parquet
      ob_snapshots/    date=YYYY-MM-DD/part-0000.parquet
      ob_deltas/       date=YYYY-MM-DD/part-0000.parquet
  state/
    state.sqlite
  duckdb/
    polymarket.duckdb
```

Notes:
- Partitioning is intentionally simple; we can refine if volumes demand it.
- For extremely high-volume datasets (order book deltas), add a `token_bucket=XX` partition (hash(token_id) % 256) to keep directories sane.

### 2.3 Raw record envelope (standardize everything)

Every raw JSONL line should be a single “envelope” so you can reprocess easily:

```json
{
  "ingested_at": "2026-01-14T12:34:56.000Z",
  "source": "ws|gamma|clob|data_api|rtds|subgraph",
  "dataset": "gamma_markets|clob_books|clob_prices_history|ws_clob_market|data_api_trades|...",
  "request": { "url": "...", "params": { "...": "..." } },
  "payload": { "... raw response or ws message ..." }
}
```

For WebSockets, keep `request` minimal and include channel/topic metadata.

### 2.4 State SQLite schema (minimal)

One SQLite file is enough:

- `checkpoints(dataset TEXT, key TEXT, cursor TEXT, updated_at TEXT, PRIMARY KEY(dataset, key))`
  - Example: dataset=`clob_prices_history`, key=`<token_id>`, cursor=`{"last_ts": 1730000000, "fidelity": 1}`
- `runs(run_id TEXT PRIMARY KEY, dataset TEXT, started_at TEXT, finished_at TEXT, status TEXT, meta JSON)`

This avoids “where did we leave off?” problems without running a real DB server.

---

## 3) Curated schemas (what you’ll actually query)

Curated tables are designed for **DuckDB SQL**. Store arrays where it keeps things simple (DuckDB supports LIST/STRUCT in Parquet).

### 3.1 Dimensions

- **`dim_market`** (one row per `condition_id` per snapshot date)
  - Keys: `condition_id`, `snapshot_date`
  - Useful columns (mix Gamma + CLOB):
    - `gamma_market_id`, `event_id`, `slug`, `question`, `description`
    - `active`, `closed`, `archived`, `enable_orderbook`, `neg_risk`
    - `start_date`, `end_date`, `closed_time`
    - `outcomes` (LIST<VARCHAR>)
    - `token_ids` (LIST<VARCHAR>)
    - `min_tick_size`, `min_order_size`, `maker_fee_bps`, `taker_fee_bps`, `rewards` (JSON/VARCHAR)

- **`dim_token`**
  - `token_id` (PK), `condition_id`, `outcome_index`, `outcome`, `winner` (when resolved)

### 3.2 Facts

- **`price_history`** (from `/prices-history`)
  - `token_id`, `ts` (INT64 seconds), `price` (DOUBLE)
  - `fidelity_min` (INT), `source`

- **`trades`** (from Data API and/or RTDS)
  - `ts` (INT64 ms), `condition_id`, `token_id`
  - `side`, `price`, `size`
  - `proxy_wallet`, `tx_hash`
  - `source` (data_api|rtds|subgraph)

- **`ob_snapshots`** (from WS `book`, RTDS `agg_orderbook`, and/or REST `/books`)
  - `ts` (INT64 ms), `condition_id`, `token_id`, `hash`
  - `bids` (LIST<STRUCT<p DOUBLE, s DOUBLE>>)
  - `asks` (LIST<STRUCT<p DOUBLE, s DOUBLE>>)
  - `source` (ws|rtds|rest)

- **`ob_deltas`** (from WS `price_change` / RTDS `price_change`)
  - `ts` (INT64 ms), `condition_id`, `token_id`, `side`, `price`, `size`
  - `best_bid`, `best_ask`
  - `order_hash` (or whatever the feed provides)
  - `source`

- **`tick_size_changes`** (optional, WS)
  - `ts`, `condition_id`, `token_id`, `old_tick_size`, `new_tick_size`

---

## 4) Ingestion architecture

### 4.1 A single mental model: “jobs”

Each job reads from a source and appends raw logs; some jobs also write curated rows.

- **Snapshot jobs** (slow-changing):
  - `gamma.events.snapshot` (e.g., hourly or daily)
  - `gamma.markets.snapshot`
  - `clob.markets.snapshot`
  - `data_api.oi.snapshot` (daily)
- **Backfill jobs** (catch up):
  - `clob.prices_history.backfill` (per token, chunked by time)
  - `data_api.trades.backfill` (per market; fall back to subgraph for huge markets)
- **Streaming jobs** (continuous):
  - `ws.clob_market.stream` (market channel)
  - optionally `rtds.activity.stream` (global trades) and/or `rtds.clob_market.stream`
- **Compaction jobs** (optional but recommended):
  - `compact.raw_to_parquet` (daily/hourly)
  - `duckdb.refresh_views` (when partitions change)

### 4.2 Discovery: keep the token universe up to date

Create a “discovery loop” that runs every 1–5 minutes:

- Pull newest Gamma events/markets (`closed=false`, ordered by `id` desc)
- Maintain a **watchlist** of CLOB-enabled tokens:
  - `enableOrderBook == true`
  - `closed == false`
  - plus any “recently closed” markets you still want to watch for late fills
- Update WebSocket subscriptions dynamically (subscribe/unsubscribe).

### 4.3 Order book capture strategy (forward detail, cost-controlled)

Use **two complementary streams**:

- **Deltas**: WS `price_change` (small messages, high frequency)
- **Checkpoints**: periodic snapshots via REST `POST /books` (or WS `book` / RTDS `agg_orderbook`)

Recommended defaults:
- Snapshot cadence: every **30–120 seconds** for active tokens (configurable)
- Depth: store full L2 if returned; optionally downsample to top N levels for storage
- Reconciliation: if the streamer reconnects or misses time, trigger an immediate `/books` snapshot.

### 4.4 Price history backfill (backward detail)

For each token:
- Start with `interval=max&fidelity=1` (or `fidelity=5` if volume is too high)
- If the response is too large or the endpoint has hidden limits, chunk by:
  - `startTs/endTs` monthly windows moving backwards until empty
- Store raw response + curated rows.
- For incremental updates, request `startTs = last_ts + 60*fidelity`.

### 4.5 Trades backfill (best possible)

Two-tier plan:

1. **Good-enough + simplest**: Data API `/trades?market=<conditionIds>`
   - Iterate per market; paginate with `limit/offset`
   - Stop when empty
   - If a market exceeds API pagination constraints, mark it for tier 2.

2. **Max completeness**: subgraph backfill for trades (and optionally positions/activity)
   - Page by block number / timestamp cursor (GraphQL makes this easy)
   - Store raw GraphQL responses + curated trade rows.

For future trades:
- Prefer streaming via RTDS `activity:trades` if stable in practice; otherwise poll Data API for “recent trades” windows.

---

## 5) Access patterns (easy)

### 5.1 “DuckDB-first” querying

DuckDB can:
- Query Parquet directly (fast, no server)
- Also query JSONL directly (slow but great for debugging)

Recommended:
- Maintain `duckdb/polymarket.duckdb` with views like:
  - `trades` → all partitions under `curated/parquet/trades/*`
  - `price_history` → all partitions under `curated/parquet/price_history/*`

### 5.2 Simple APIs (optional)

If you want programmatic access without teaching everyone DuckDB:

- A tiny local HTTP server (read-only) exposing:
  - `GET /markets`
  - `GET /trades?condition_id=...&start=...&end=...`
  - `GET /orderbook?token_id=...&ts=...` (best-effort using nearest snapshot)

But keep this optional; DuckDB is usually enough.

---

## 6) How this fits into `polym` (monorepo extension)

### 6.1 Proposed new package

Add **`packages/data`** (name suggestion: `@polym/data`) containing:

- **Collectors** (REST + WS)
- **Writers** (JSONL.gz rotation, Parquet compaction helpers)
- **State store** (SQLite checkpoints)
- **Schemas** (Zod + TypeScript types)

It should depend on:
- `@polym/sdk` for Gamma/CLOB/Data/WS/RTDS primitives
- `@polym/utils` for logging/spinners

### 6.2 CLI integration

Extend `@polym/cli` with a `data` namespace:

- `polym data init --dir ~/pm-data`
- `polym data snapshot gamma --closed both`
- `polym data backfill price-history --fidelity 1`
- `polym data stream orderbooks --active-only`
- `polym data compact --since 2026-01-01`
- `polym data query "select count(*) from trades"`

### 6.3 Minimal config (keep it easy)

Prefer one JSON config:

`config/data.config.json`

- `dataDir`
- `watch`:
  - `mode`: `active` | `all_open` | `top_volume`
  - `maxTokens` (optional)
- `orderbooks`:
  - `snapshotEverySeconds`
  - `maxDepthLevels` (optional)
- `priceHistory`:
  - `fidelityMinutes`
- `storage`:
  - `compression`: `gzip` | `zstd`

---

## 7) Operational notes (the stuff that keeps it running)

### 7.1 Where the jobs run (and where the “DB layers” live)

There are two recommended deployment modes depending on how “always-on” you need this to be.

**Mode A (simplest): one always-on machine**

- **Where jobs run**: your laptop/desktop if it’s usually on, or a small always-on box (Mac mini / NUC / cheap home server).
  - **Streaming jobs** (WebSocket collectors): run as long-lived processes (e.g., `polym data stream ...`) managed by `systemd`, `pm2`, or `docker compose`.
  - **Snapshot/backfill/compaction jobs**: run on a schedule via `cron`/`systemd timers` (or `launchd` on macOS).
- **Where data + DB files live**: on that machine’s disk under the configured `dataDir`:
  - `raw/` + `curated/`: filesystem directories
  - `state/state.sqlite`: local SQLite file (checkpoints/cursors)
  - `duckdb/polymarket.duckdb`: local DuckDB file (views, convenience tables)

**Mode B (still cheap, much more reliable): one small “collector VM” + object storage**

- **Where jobs run**: a $5–$20/month VM (Hetzner/DigitalOcean/Linode, etc.) that stays on 24/7.
  - Same split: streaming jobs are long-lived; batch jobs are cron/timers.
- **Where data lives**:
  - `raw/` + `curated/` live in object storage (S3-compatible like Cloudflare R2 is typically cheapest).
  - `state/state.sqlite` lives on the VM’s local disk (SQLite and object storage don’t mix well).
  - `duckdb/polymarket.duckdb` can live either:
    - **on your laptop** (recommended): query Parquet directly in the bucket with DuckDB.
    - **on the VM**: if you want the VM to serve a tiny read-only query API.
  - Optionally, snapshot `state.sqlite` to the bucket once per day for backup.

Rule of thumb:
- **If you’re solo** and OK running queries locally: Mode B gives the best “cheap + low-ops” setup.
- **If you want everything on one box**: Mode A is fastest to start.

- **Rate limits**: Polymarket throttles (delays) rather than hard failing; still implement concurrency caps and backoff.
- **Idempotency**: raw logs are append-only; curated compaction should dedupe by a natural key where possible.
- **Crash safety**: rotate files frequently and use atomic renames.
- **Schema drift**: always store raw; curated can be regenerated.
- **Time**: store both `ts_ms` (event time) and `ingested_at` (collection time).

---

## 8) Recommended “Phase 1” rollout (fastest path to value)

1. **Daily Gamma + CLOB market snapshots** (raw + curated dims)
2. **Backfill all token price history** (curated `price_history`)
3. **Start WS order book stream + periodic `/books` snapshots** (curated `ob_deltas` + `ob_snapshots`)
4. **Trades**: stream RTDS `activity:trades` if stable; otherwise do per-market Data API backfill + incremental polling

This gets you a practical “research lake” quickly, without over-engineering.

