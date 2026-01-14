---
url: "https://docs.polymarket.com/developers/misc-endpoints/data-api-value"
title: "Get Holdings Value (Data-API) - Polymarket Documentation"
---

# Get Holdings Value (Data-API)

Get the value of a users’ holdings across all markets.

GET

/

value

Get total value of a user's positions

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/value
```

200

400

500

```
[
  {
    "user": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "value": 123
  }
]
```

#### Query Parameters

user

string

required

User Profile Address (0x-prefixed, 40 hex chars)

Example:

`"0x56687bf447db6ffa42ffe2204a05edaa20f55839"`

market

string[]

0x-prefixed 64-hex string

#### Response

200

application/json

Success

user

string

User Profile Address (0x-prefixed, 40 hex chars)

Example:

`"0x56687bf447db6ffa42ffe2204a05edaa20f55839"`

value

number
