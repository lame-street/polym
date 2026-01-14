---
url: "https://docs.polymarket.com/api-reference/pricing/get-multiple-market-prices"
title: "Get multiple market prices - Polymarket Documentation"
---

# Get multiple market prices

Retrieves market prices for multiple tokens and sides

GET /prices

cURL

```
curl --request GET \
  --url https://clob.polymarket.com/prices
```

Status codes: 200, 400, 500
```
{
  "1234567890": {
    "BUY": "1800.50",
    "SELL": "1801.00"
  },
  "0987654321": {
    "BUY": "50.25",
    "SELL": "50.30"
  }
}
```

#### Response
200 application/json Successful response Map of token_id to side to price {key} object
