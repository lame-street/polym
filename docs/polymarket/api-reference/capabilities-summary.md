## Polymarket API Reference — Capability Summary (by subfolder)

- **Base hosts**: `https://gamma-api.polymarket.com` (discovery + metadata), `https://data-api.polymarket.com` (user + analytics), `https://clob.polymarket.com` (order book + pricing), `https://bridge.polymarket.com` (deposits/bridging)

### `bridge/` — Deposits & bridging

- **Capabilities**: list supported deposit chains/tokens (+ minimums), create deposit addresses (EVM/Solana/Bitcoin), poll deposit/bridge status by deposit address
- **Data (live vs historical)**: live operational status (polling); not market data
- **Useful for**: wallets/onramps/exchanges/integrators that need “fund your Polymarket account” flows

### `builders/` — Builder attribution analytics

- **Capabilities**: builder leaderboard aggregated by time period; builder daily volume + active-user time series
- **Data (live vs historical)**: historical/analytics (daily time series) + aggregated totals (DAY/WEEK/MONTH/ALL)
- **Useful for**: builder partners/affiliates, growth/BD, attribution dashboards

### `comments/` — Comments (social layer)

- **Capabilities**: list comments (filter by event/series/market), fetch by comment id, fetch by user address (includes reactions + commenter profile; optional positions)
- **Data (live vs historical)**: content/history (not pricing/order book)
- **Useful for**: UIs showing discussions, community tooling, moderation pipelines

### `core/` — User portfolio, activity, and leaderboards

- **Capabilities**: current positions, closed positions (realized PnL), total value, trades feed, on-chain activity log (trade/split/merge/redeem/reward/etc), top holders by market, trader leaderboard
- **Data (live vs historical)**: mix of snapshot-like views (positions/value/holders/leaderboards) and historical records (trades/activity/closed positions); several endpoints list `401` responses (plan for auth/permissions)
- **Useful for**: portfolio trackers, trading frontends, analysts/research, leaderboard/ranking pages

### `data-api-status/` — Data API health

- **Capabilities**: health check for `data-api`
- **Data (live vs historical)**: live status
- **Useful for**: ops/monitoring, client startup checks

### `events/` — Event discovery

- **Capabilities**: list events (filters + pagination), fetch event by id/slug, list tags attached to an event
- **Data (live vs historical)**: primarily current metadata + rolling aggregates (e.g., volume windows / open interest fields), not trade-level history
- **Useful for**: browse pages, content discovery, indexing pipelines

### `gamma-status/` — Gamma API health

- **Capabilities**: health check for `gamma-api`
- **Data (live vs historical)**: live status
- **Useful for**: ops/monitoring, client startup checks

### `markets/` — Market discovery

- **Capabilities**: list markets (rich filtering), fetch market by id/slug, list tags attached to a market
- **Data (live vs historical)**: current market metadata with summary stats (e.g., volume windows, best bid/ask fields); not order-level history
- **Useful for**: market directories, browse/filter UIs, data ingestion

### `misc/` — Quick aggregate stats

- **Capabilities**: live volume by event, open interest by market, count of markets traded by a user
- **Data (live vs historical)**: live aggregates + historical-ish counts (e.g., “markets traded”)
- **Useful for**: lightweight analytics widgets, “event stats” views, user profile stats

### `orderbook/` — CLOB order book snapshots

- **Capabilities**: order book snapshot for a token; batch order book snapshots
- **Data (live vs historical)**: live L2 snapshots (bids/asks at a moment in time)
- **Useful for**: market makers, trading bots, order-book UIs

### `pricing/` — CLOB pricing (+ history)

- **Capabilities**: side-specific price, midpoint, bulk prices (GET all / POST requested set), historical price series (timestamp/price pairs)
- **Data (live vs historical)**: live price snapshots + historical time series (start/end/interval/fidelity)
- **Useful for**: trading UIs, analytics/backtesting, alerts

### `profiles/` — Public profile lookup

- **Capabilities**: fetch public profile by wallet address (proxy wallet or user address)
- **Data (live vs historical)**: current profile metadata
- **Useful for**: profile pages, attribution/identity mapping, social UX

### `search/` — Unified search

- **Capabilities**: search across events (and optionally tags/profiles) with pagination and filtering
- **Data (live vs historical)**: discovery index (current)
- **Useful for**: in-app search, autocomplete, quick navigation

### `series/` — Series discovery (groupings of events/markets)

- **Capabilities**: list series (filters + pagination), fetch series by id (includes nested events/markets metadata)
- **Data (live vs historical)**: current metadata + aggregates (volume/liquidity fields), not trade-level history
- **Useful for**: category/tournament pages, navigation, editorial groupings

### `sports/` — Sports reference data

- **Capabilities**: sports metadata/config, valid sports market-type enum values, list teams (filterable)
- **Data (live vs historical)**: reference metadata (slow-changing)
- **Useful for**: sports-specific UIs, filtering, mapping team IDs/metadata

### `spreads/` — Bid/ask spread snapshots

- **Capabilities**: get bid-ask spreads for multiple tokens (batch request)
- **Data (live vs historical)**: live spread snapshot(s)
- **Useful for**: market makers, liquidity analytics, routing/quality scoring

### `tags/` — Tag taxonomy & relationships

- **Capabilities**: list tags, fetch by id/slug, get related-tag relationships (by id/slug), resolve related tags
- **Data (live vs historical)**: taxonomy metadata (used for discovery/navigation)
- **Useful for**: browse/filter UX, recommendations, tag-based indexing

