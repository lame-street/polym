---
url: "https://docs.polymarket.com/api-reference/builders/get-aggregated-builder-leaderboard"
title: "Get aggregated builder leaderboard - Polymarket Documentation"
---

# Get aggregated builder leaderboard

Returns aggregated builder rankings with one entry per builder showing total for the specified time period. Supports pagination.

GET /v1/builders/leaderboard

cURL

```
curl --request GET \
  --url 'https://data-api.polymarket.com/v1/builders/leaderboard?timePeriod=DAY&limit=25'
```

Status codes: 200, 400, 500
```
[
  {
    "rank": "<string>",
    "builder": "<string>",
    "volume": 123,
    "activeUsers": 123,
    "verified": true,
    "builderLogo": "<string>"
  }
]
```

#### Query Parameters
- timePeriod: enum<string>; default=DAY; options=DAY|WEEK|MONTH|ALL — The time period to aggregate results over.
- limit: integer; default=25; constraints=`0 <= x <= 50` — Maximum number of builders to return
- offset: integer; default=0; constraints=`0 <= x <= 1000` — Starting index for pagination
#### Response
200 application/json Success
- rank: string — The rank position of the builder
- builder: string — The builder name or identifier
- volume: number — Total trading volume attributed to this builder
- activeUsers: integer — Number of active users for this builder
- verified: boolean — Whether the builder is verified
- builderLogo: string — URL to the builder's logo image
