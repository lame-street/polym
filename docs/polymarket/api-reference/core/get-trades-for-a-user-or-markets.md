---
url: "https://docs.polymarket.com/api-reference/core/get-trades-for-a-user-or-markets"
title: "Get trades for a user or markets - Polymarket Documentation"
---

# Get trades for a user or markets

GET /trades

cURL

```
curl --request GET \
  --url 'https://data-api.polymarket.com/trades?limit=100&takerOnly=true'
```

Status codes: 200, 400, 401, 500
```
[
  {
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "side": "BUY",
    "asset": "<string>",
    "conditionId": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "size": 123,
    "price": 123,
    "timestamp": 123,
    "title": "<string>",
    "slug": "<string>",
    "icon": "<string>",
    "eventSlug": "<string>",
    "outcome": "<string>",
    "outcomeIndex": 123,
    "name": "<string>",
    "pseudonym": "<string>",
    "bio": "<string>",
    "profileImage": "<string>",
    "profileImageOptimized": "<string>",
    "transactionHash": "<string>"
  }
]
```

#### Query Parameters
- limit: integer; default=100; constraints=`0 <= x <= 10000`
- offset: integer; default=0; constraints=`0 <= x <= 10000`
- takerOnly: boolean; default=true
- filterType: enum<string>; options=CASH|TOKENS — Must be provided together with filterAmount.
- filterAmount: number; constraints=`x >= 0` — Must be provided together with filterType.
- market: string[] — Comma-separated list of condition IDs. Mutually exclusive with eventId. 0x-prefixed 64-hex string
- eventId: integer[]; constraints=`x >= 1` — Comma-separated list of event IDs. Mutually exclusive with market.
- user: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- side: enum<string>; options=BUY|SELL
#### Response
200 application/json Success
- proxyWallet: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- side: enum<string>; options=BUY|SELL
- asset: string
- conditionId: string; example="0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917" — 0x-prefixed 64-hex string
- size: number
- price: number
- timestamp: integer<int64>
- title: string
- slug: string
- icon: string
- eventSlug: string
- outcome: string
- outcomeIndex: integer
- name: string
- pseudonym: string
- bio: string
- profileImage: string
- profileImageOptimized: string
- transactionHash: string
