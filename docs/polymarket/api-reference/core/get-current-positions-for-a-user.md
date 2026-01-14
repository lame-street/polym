---
url: "https://docs.polymarket.com/api-reference/core/get-current-positions-for-a-user"
title: "Get current positions for a user - Polymarket Documentation"
---

# Get current positions for a user

Returns positions filtered by user and optional filters.

GET /positions

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/positions
```

Status codes: 200, 400, 401, 500
```
[
  {
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "asset": "<string>",
    "conditionId": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "size": 123,
    "avgPrice": 123,
    "initialValue": 123,
    "currentValue": 123,
    "cashPnl": 123,
    "percentPnl": 123,
    "totalBought": 123,
    "realizedPnl": 123,
    "percentRealizedPnl": 123,
    "curPrice": 123,
    "redeemable": true,
    "mergeable": true,
    "title": "<string>",
    "slug": "<string>",
    "icon": "<string>",
    "eventSlug": "<string>",
    "outcome": "<string>",
    "outcomeIndex": 123,
    "oppositeOutcome": "<string>",
    "oppositeAsset": "<string>",
    "endDate": "<string>",
    "negativeRisk": true
  }
]
```

#### Query Parameters
- user: string; required; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User address (required) User Profile Address (0x-prefixed, 40 hex chars)
- market: string[] — Comma-separated list of condition IDs. Mutually exclusive with eventId. 0x-prefixed 64-hex string
- eventId: integer[]; constraints=`x >= 1` — Comma-separated list of event IDs. Mutually exclusive with market.
- sizeThreshold: number; default=1; constraints=`x >= 0`
- redeemable: boolean; default=false
- mergeable: boolean; default=false
- limit: integer; default=100; constraints=`0 <= x <= 500`
- offset: integer; default=0; constraints=`0 <= x <= 10000`
- sortBy: enum<string>; default=TOKENS; options=CURRENT|INITIAL|TOKENS|CASHPNL|PERCENTPNL|TITLE|RESOLVING|PRICE|AVGPRICE
- sortDirection: enum<string>; default=DESC; options=ASC|DESC
- title: string; constraints=maxLen `100`
#### Response
200 application/json Success
- proxyWallet: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- asset: string
- conditionId: string; example="0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917" — 0x-prefixed 64-hex string
- size: number
- avgPrice: number
- initialValue: number
- currentValue: number
- cashPnl: number
- percentPnl: number
- totalBought: number
- realizedPnl: number
- percentRealizedPnl: number
- curPrice: number
- redeemable: boolean
- mergeable: boolean
- title: string
- slug: string
- icon: string
- eventSlug: string
- outcome: string
- outcomeIndex: integer
- oppositeOutcome: string
- oppositeAsset: string
- endDate: string
- negativeRisk: boolean
