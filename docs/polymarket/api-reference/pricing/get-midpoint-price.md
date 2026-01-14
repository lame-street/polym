---
url: "https://docs.polymarket.com/api-reference/pricing/get-midpoint-price"
title: "Get midpoint price - Polymarket Documentation"
---

# Get midpoint price

Retrieves the midpoint price for a specific token

GET /midpoint

cURL

```
curl --request GET \
  --url https://clob.polymarket.com/midpoint
```

Status codes: 200, 400, 404, 500
```
{
  "mid": "1800.75"
}
```

#### Query Parameters
- token_id: string; required — The unique identifier for the token
#### Response
200 application/json Successful response
- mid: string; required; example="1800.75" — The midpoint price (as string to maintain precision)
