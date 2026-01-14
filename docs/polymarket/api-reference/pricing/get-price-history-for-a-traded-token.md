---
url: "https://docs.polymarket.com/api-reference/pricing/get-price-history-for-a-traded-token"
title: "Get price history for a traded token - Polymarket Documentation"
---

# Get price history for a traded token

Fetches historical price data for a specified market token

GET /prices-history

cURL

```
curl --request GET \
  --url https://clob.polymarket.com/prices-history
```

Status codes: 200, 400, 404, 500
```
{
  "history": [
    {
      "t": 1697875200,
      "p": 1800.75
    }
  ]
}
```

#### Query Parameters
- market: string; required — The CLOB token ID for which to fetch price history
- startTs: number — The start time, a Unix timestamp in UTC
- endTs: number — The end time, a Unix timestamp in UTC
- interval: enum<string>; options=1m|1w|1d|6h|1h|max — A string representing a duration ending at the current time. Mutually exclusive with startTs and endTs
- fidelity: number — The resolution of the data, in minutes
#### Response
200 application/json A list of timestamp/price pairs
- history: object[]; required
