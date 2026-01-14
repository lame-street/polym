---
url: "https://docs.polymarket.com/api-reference/pricing/get-market-price"
title: "Get market price - Polymarket Documentation"
---

# Get market price

Retrieves the market price for a specific token and side

GET /price

cURL

```
curl --request GET \
  --url https://clob.polymarket.com/price
```

200

Example

```
{
  "price": "1800.50"
}
```

#### Query Parameters
- token_id: string; required — The unique identifier for the token
- side: enum<string>; required; options=BUY|SELL — The side of the market (BUY or SELL)
#### Response
200 application/json Successful response
- price: string; required; example="1800.50" — The market price (as string to maintain precision)
