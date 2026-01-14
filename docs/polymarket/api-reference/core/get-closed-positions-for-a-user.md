---
url: "https://docs.polymarket.com/api-reference/core/get-closed-positions-for-a-user"
title: "Get closed positions for a user - Polymarket Documentation"
---

# Get closed positions for a user

Fetches closed positions for a user(address)

GET /v1/closed-positions

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/v1/closed-positions
```

Status codes: 200, 400, 401, 500
```
[
  {
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "asset": "<string>",
    "conditionId": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "avgPrice": 123,
    "totalBought": 123,
    "realizedPnl": 123,
    "curPrice": 123,
    "timestamp": 123,
    "title": "<string>",
    "slug": "<string>",
    "icon": "<string>",
    "eventSlug": "<string>",
    "outcome": "<string>",
    "outcomeIndex": 123,
    "oppositeOutcome": "<string>",
    "oppositeAsset": "<string>",
    "endDate": "<string>"
  }
]
```

#### Query Parameters
- user: string; required; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — The address of the user in question User Profile Address (0x-prefixed, 40 hex chars)
- market: string[] — The conditionId of the market in question. Supports multiple csv separated values. Cannot be used with the eventId param. 0x-prefixed 64-hex string
- title: string; constraints=maxLen `100` — Filter by market title
- eventId: integer[]; constraints=`x >= 1` — The event id of the event in question. Supports multiple csv separated values. Returns positions for all markets for those event ids. Cannot be used with the market param.
- limit: integer; default=10; constraints=`0 <= x <= 50` — The max number of positions to return
- offset: integer; default=0; constraints=`0 <= x <= 100000` — The starting index for pagination
- sortBy: enum<string>; default=REALIZEDPNL; options=REALIZEDPNL|TITLE|PRICE|AVGPRICE|TIMESTAMP — The sort criteria
- sortDirection: enum<string>; default=DESC; options=ASC|DESC — The sort direction
#### Response
200 application/json Success
- proxyWallet: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- asset: string
- conditionId: string; example="0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917" — 0x-prefixed 64-hex string
- avgPrice: number
- totalBought: number
- realizedPnl: number
- curPrice: number
- timestamp: integer<int64>
- title: string
- slug: string
- icon: string
- eventSlug: string
- outcome: string
- outcomeIndex: integer
- oppositeOutcome: string
- oppositeAsset: string
- endDate: string
