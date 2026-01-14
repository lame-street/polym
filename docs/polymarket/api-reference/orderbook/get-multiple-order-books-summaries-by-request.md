---
url: "https://docs.polymarket.com/api-reference/orderbook/get-multiple-order-books-summaries-by-request"
title: "Get multiple order books summaries by request - Polymarket Documentation"
---

# Get multiple order books summaries by request

Retrieves order book summaries for specified tokens via POST request

POST /books

cURL

```
curl --request POST \
  --url https://clob.polymarket.com/books \
  --header 'Content-Type: application/json' \
  --data '
[\
  {\
    "token_id": "1234567890"\
  },\
  {\
    "token_id": "0987654321"\
  }\
]
'
```

200

Example

```
[
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
]
```

#### Body
- token_id: string; required; example="1234567890" — The unique identifier for the token
- side: enum<string>; options=BUY|SELL; example="BUY" — Optional side parameter for certain operations
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
