---
url: "https://docs.polymarket.com/api-reference/core/get-top-holders-for-markets"
title: "Get top holders for markets - Polymarket Documentation"
---

# Get top holders for markets

GET /holders

cURL

```
curl --request GET \
  --url 'https://data-api.polymarket.com/holders?limit=20&minBalance=1'
```

Status codes: 200, 400, 401, 500
```
[
  {
    "token": "<string>",
    "holders": [
      {
        "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
        "bio": "<string>",
        "asset": "<string>",
        "pseudonym": "<string>",
        "amount": 123,
        "displayUsernamePublic": true,
        "outcomeIndex": 123,
        "name": "<string>",
        "profileImage": "<string>",
        "profileImageOptimized": "<string>"
      }
    ]
  }
]
```

#### Query Parameters
- limit: integer; default=20; constraints=`0 <= x <= 20` — Maximum number of holders to return per token. Capped at 20.
- market: string[]; required — Comma-separated list of condition IDs. 0x-prefixed 64-hex string
- minBalance: integer; default=1; constraints=`0 <= x <= 999999`
#### Response
200 application/json Success
- token: string
- holders: object[]
