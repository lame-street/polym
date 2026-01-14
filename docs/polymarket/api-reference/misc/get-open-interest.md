---
url: "https://docs.polymarket.com/api-reference/misc/get-open-interest"
title: "Get open interest - Polymarket Documentation"
---

# Get open interest

GET /oi

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/oi
```

Status codes: 200, 400, 500
```
[
  {
    "market": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "value": 123
  }
]
```

#### Query Parameters
- market: string[] — 0x-prefixed 64-hex string
#### Response
200 application/json Success
- market: string; example="0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917" — 0x-prefixed 64-hex string
- value: number
