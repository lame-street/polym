---
url: "https://docs.polymarket.com/quickstart/reference/endpoints"
title: "Endpoints - Polymarket Documentation"
---

# Endpoints

All Polymarket API URLs and base endpoints

All base URLs for Polymarket APIs. See individual API documentation for available routes and parameters.

* * *

## REST APIs

| API | Base URL | Description |
| --- | --- | --- |
| **CLOB API** | `https://clob.polymarket.com` | Order management, prices, orderbooks |
| **Gamma API** | `https://gamma-api.polymarket.com` | Market discovery, metadata, events |
| **Data API** | `https://data-api.polymarket.com` | User positions, activity, history |

* * *

## WebSocket Endpoints

| Service | URL | Description |
| --- | --- | --- |
| **CLOB WebSocket** | `wss://ws-subscriptions-clob.polymarket.com/ws/` | Orderbook updates, order status |
| **RTDS** | `wss://ws-live-data.polymarket.com` | Low-latency crypto prices, comments |

* * *

## Quick Reference

### CLOB API

```
https://clob.polymarket.com
```

Common endpoints:

- `GET /price` — Get current price for a token
- `GET /book` — Get orderbook for a token
- `GET /midpoint` — Get midpoint price
- `POST /order` — Place an order (auth required)
- `DELETE /order` — Cancel an order (auth required)

[Full CLOB documentation →](https://docs.polymarket.com/developers/CLOB/introduction)

### Gamma API

```
https://gamma-api.polymarket.com
```

Common endpoints:

- `GET /events` — List events
- `GET /markets` — List markets
- `GET /events/{id}` — Get event details

[Full Gamma documentation →](https://docs.polymarket.com/developers/gamma-markets-api/overview)

### Data API

```
https://data-api.polymarket.com
```

Common endpoints:

- `GET /positions` — Get user positions
- `GET /activity` — Get user activity
- `GET /trades` — Get trade history

[Full Data API documentation →](https://docs.polymarket.com/developers/misc-endpoints/data-api-get-positions)

### CLOB WebSocket

```
wss://ws-subscriptions-clob.polymarket.com/ws/
```

Channels:

- `market` — Orderbook and price updates (public)
- `user` — Order status updates (authenticated)

[Full WebSocket documentation →](https://docs.polymarket.com/developers/CLOB/websocket/wss-overview)

### RTDS (Real-Time Data Stream)

```
wss://ws-live-data.polymarket.com
```

Channels:

- Crypto price feeds
- Comment streams

[Full RTDS documentation →](https://docs.polymarket.com/developers/RTDS/RTDS-overview)

[API Rate Limits](https://docs.polymarket.com/quickstart/introduction/rate-limits) [Market Maker Introduction](https://docs.polymarket.com/developers/market-makers/introduction)
