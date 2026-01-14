---
url: "https://docs.polymarket.com/api-reference/misc/get-total-markets-a-user-has-traded"
title: "Get total markets a user has traded - Polymarket Documentation"
---

# Get total markets a user has traded

GET /traded

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/traded
```

Status codes: 200, 400, 401, 500
```
{
  "user": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
  "traded": 123
}
```

#### Query Parameters
- user: string; required; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
#### Response
200 application/json Success
- user: string; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — User Profile Address (0x-prefixed, 40 hex chars)
- traded: integer
