---
url: "https://docs.polymarket.com/api-reference/core/get-total-value-of-a-users-positions"
title: "Get total value of a user's positions - Polymarket Documentation"
---

# Get total value of a user's positions

GET /value

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/value
```

Status codes: 200, 400, 500
```
[
  {
    "user": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "value": 123
  }
]
```

#### Query Parameters
- user: string; required; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- market: string[] — 0x-prefixed 64-hex string
#### Response
200 application/json Success
- user: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- value: number
