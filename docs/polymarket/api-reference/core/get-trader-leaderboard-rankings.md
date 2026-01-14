---
url: "https://docs.polymarket.com/api-reference/core/get-trader-leaderboard-rankings"
title: "Get trader leaderboard rankings - Polymarket Documentation"
---

# Get trader leaderboard rankings

Returns trader leaderboard rankings filtered by category, time period, and ordering.

GET /v1/leaderboard

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/v1/leaderboard
```

Status codes: 200, 400, 500
```
[
  {
    "rank": "<string>",
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "userName": "<string>",
    "vol": 123,
    "pnl": 123,
    "profileImage": "<string>",
    "xUsername": "<string>",
    "verifiedBadge": true
  }
]
```

#### Query Parameters
- category: enum<string>; default=OVERALL; options=OVERALL|POLITICS|SPORTS|CRYPTO|CULTURE|MENTIONS|WEATHER|ECONOMICS|TECH|FINANCE — Market category for the leaderboard
- timePeriod: enum<string>; default=DAY; options=DAY|WEEK|MONTH|ALL — Time period for leaderboard results
- orderBy: enum<string>; default=PNL; options=PNL|VOL — Leaderboard ordering criteria
- limit: integer; default=25; constraints=`1 <= x <= 50` — Max number of leaderboard traders to return
- offset: integer; default=0; constraints=`0 <= x <= 1000` — Starting index for pagination
- user: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — Limit leaderboard to a single user by address User Profile Address (0x-prefixed, 40 hex chars)
- userName: string — Limit leaderboard to a single username
#### Response
200 application/json Success
- rank: string — The rank position of the trader
- proxyWallet: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- userName: string — The trader's username
- vol: number — Trading volume for this trader
- pnl: number — Profit and loss for this trader
- profileImage: string — URL to the trader's profile image
- xUsername: string — The trader's X (Twitter) username
- verifiedBadge: boolean — Whether the trader has a verified badge
