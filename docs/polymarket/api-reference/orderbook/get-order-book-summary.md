---
url: "https://docs.polymarket.com/api-reference/orderbook/get-order-book-summary"
title: "Get order book summary - Polymarket Documentation"
---

# Get order book summary

Retrieves the order book summary for a specific token

GET /book

cURL

```
curl --request GET \
  --url https://clob.polymarket.com/book
```

Status codes: 200, 400, 404, 500
```
{
  "market": "0x1b6f76e5b8587ee896c35847e12d11e75290a8c3934c5952e8a9d6e4c6f03cfa",
  "asset_id": "1234567890",
  "timestamp": "2023-10-01T12:00:00Z",
  "hash": "0xabc123def456...",
  "bids": [
    {
      "price": "1800.50",
      "size": "10.5"
    }
  ],
  "asks": [
    {
      "price": "1800.50",
      "size": "10.5"
    }
  ],
  "min_order_size": "0.001",
  "tick_size": "0.01",
  "neg_risk": false
}
```

#### Query Parameters
- token_id: string; required — The unique identifier for the token
#### Response
200 application/json Successful response
- market: string; required; example="0x1b6f76e5b8587ee896c35847e12d11e75290a8c3934c5952e8a9d6e4c6f03cfa" — Market identifier
- asset_id: string; required; example="1234567890" — Asset identifier
- timestamp: string<date-time>; required; example="2023-10-01T12:00:00Z" — Timestamp of the order book snapshot
- hash: string; required; example="0xabc123def456..." — Hash of the order book state
- bids: object[]; required — Array of bid levels
- asks: object[]; required — Array of ask levels
- min_order_size: string; required; example="0.001" — Minimum order size for this market
- tick_size: string; required; example="0.01" — Minimum price increment
- neg_risk: boolean; required; example=false — Whether negative risk is enabled
