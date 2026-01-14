---
url: "https://docs.polymarket.com/api-reference/builders/get-daily-builder-volume-time-series"
title: "Get daily builder volume time-series - Polymarket Documentation"
---

# Get daily builder volume time-series

Returns daily time-series volume data with multiple entries per builder (one per day), each including a `dt` timestamp. No pagination.

GET /v1/builders/volume

cURL

```
curl --request GET \
  --url 'https://data-api.polymarket.com/v1/builders/volume?timePeriod=DAY'
```

Status codes: 200, 400, 500
```
[
  {
    "dt": "2025-11-15T00:00:00Z",
    "builder": "<string>",
    "builderLogo": "<string>",
    "verified": true,
    "volume": 123,
    "activeUsers": 123,
    "rank": "<string>"
  }
]
```

#### Query Parameters
- timePeriod: enum<string>; default=DAY; options=DAY|WEEK|MONTH|ALL — The time period to fetch daily records for.
#### Response
200 application/json Success - Returns array of daily volume records
- dt: string<date-time>; example="2025-11-15T00:00:00Z" — The timestamp for this volume entry in ISO 8601 format
- builder: string — The builder name or identifier
- builderLogo: string — URL to the builder's logo image
- verified: boolean — Whether the builder is verified
- volume: number — Trading volume for this builder on this date
- activeUsers: integer — Number of active users for this builder on this date
- rank: string — The rank position of the builder on this date
