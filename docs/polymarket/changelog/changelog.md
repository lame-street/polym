---
url: "https://docs.polymarket.com/changelog/changelog"
title: "Polymarket Changelog - Polymarket Documentation"
---

# Polymarket Changelog

Welcome to the Polymarket Changelog. Here you will find any important changes to Polymarket, including but not limited to CLOB, API, UI and Mobile Applications.

Jan 6, 2026

New API Features

- **Releases**: Daily Releases timing
- **HeartBeats API**: HeartBeats endpoint for monitoring connection status and canceling orders
- **Post Only Orders**: Orders that are rejected if they would immediately match against an existing order

Jan 5, 2026

Taker Fees & Maker Rebates

- **Taker Fees**: Enabled on 15-minute crypto markets. Fees vary by price and peak at 1.56% at 50% probability.
- **Maker Rebates**: Daily USDC rebates paid to liquidity providers, funded by taker fees.

Sept 24, 2025

Polymarket Real-Time Data Socket (RTDS) official release

- **Crypto Price Feeds**: Access real-time cryptocurrency prices from two sources (Binance & Chainlink)
- **Comment Streaming**: Real-time updates for comment events including new comments, replies, and reactions
- **Dynamic Subscriptions**: Add, remove, and modify subscriptions without reconnecting
- **TypeScript Client**: Official TypeScript client available at [real-time-data-client](https://github.com/Polymarket/real-time-data-client)
For complete documentation, see [RTDS Overview](https://docs.polymarket.com/developers/RTDS/RTDS-overview).

September 15, 2025

WSS price_change event update

- There has been a significant change to the structure of the price change message. This update will be applied at 11PM UTC September 15, 2025. We apologize for the short notice
  - Please see the [migration guide](https://docs.polymarket.com/developers/CLOB/websocket/market-channel-migration-guide) for details.

August 26, 2025

Updated /trades and /activity endpoints

- Reduced maximum values for query parameters on Data-API /trades and /activity:
  - `limit`: 500
  - `offset`: 1,000

August 21, 2025

Batch Orders Increase

- The batch orders limit has been increased from from 5 -> 15. Read more about the batch orders functionality [here](https://docs.polymarket.com/developers/CLOB/orders/create-order-batch).

July 23, 2025

Get Book(s) update

- We’re adding new fields to the `get-book` and `get-books` CLOB endpoints to include key market metadata that previously required separate queries.

  - `min_order_size`
    - type: string
    - description: Minimum allowed order size.
  - `neg_risk`
    - type: boolean
    - description: Boolean indicating whether the market is neg_risk.
  - `tick_size`
    - type: string
    - description: Minimum allowed order size.

June 3, 2025

New Batch Orders Endpoint

- We’re excited to roll out a highly requested feature: **order batching**. With this new endpoint, users can now submit up to five trades in a single request. To help you get started, we’ve included sample code demonstrating how to use it. Please see [Place Multiple Orders (Batching)](https://docs.polymarket.com/developers/CLOB/orders/create-order-batch) for more details.

June 3, 2025

Change to /data/trades

- We’re adding a new `side` field to the `MakerOrder` portion of the trade object. This field will indicate whether the maker order is a `buy` or `sell`, helping to clarify trade events where the maker side was previously ambiguous. For more details, refer to the MakerOrder object on the [Get Trades](https://docs.polymarket.com/developers/CLOB/trades/trades) page.

May 28, 2025

Websocket Changes

- The 100 token subscription limit has been removed for the Markets channel. You can now subscribe to as many token IDs as needed for your use case.
- New Subscribe Field `initial_dump`
  - Optional field to indicate whether you want to receive the initial order book state when subscribing to a token or list of tokens.
  - `default: true`

May 28, 2025

New FAK Order Type

We’re excited to introduce a new order type soon to be available to all users: Fill and Kill (FAK). FAK orders behave similarly to the well-known Fill or Kil(FOK) orders, but with a key difference:

- FAK will fill as many shares as possible immediately at your specified price, and any remaining unfilled portion will be canceled.
- Unlike FOK, which requires the entire order to fill instantly or be canceled, FAK is more flexible and aims to capture partial fills if possible.

May 15, 2025

Increased API Rate Limits

All API users will enjoy increased rate limits for the CLOB endpoints.

- CLOB - /books (website) (300req - 10s / Throttle requests over the maximum configured rate)
- CLOB - /books (50 req - 10s / Throttle requests over the maximum configured rate)
- CLOB - /price (100req - 10s / Throttle requests over the maximum configured rate)
- CLOB markets/0x (50req / 10s - Throttle requests over the maximum configured rate)
- CLOB POST /order - 500 every 10s (50/s) - (BURST) - Throttle requests over the maximum configured rateed
- CLOB POST /order - 3000 every 10 minutes (5/s) - Throttle requests over the maximum configured rate
- CLOB DELETE /order - 500 every 10s (50/s) - (BURST) - Throttle requests over the maximum configured rate
- DELETE /order - 3000 every 10 minutes (5/s) - Throttle requests over the maximum configured rate
