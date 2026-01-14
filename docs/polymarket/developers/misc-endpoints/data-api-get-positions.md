---
url: "https://docs.polymarket.com/developers/misc-endpoints/data-api-get-positions"
title: "Get User Positions (Data-API) - Polymarket Documentation"
---

# Get User Positions (Data-API)

Fetches current positions for a given user address, optionally filtered by market or event and other parameters.

GET

/

positions

Get current positions for a user

cURL

```
curl --request GET \
  --url 'https://data-api.polymarket.com/positions?sizeThreshold=1&limit=100&sortBy=TOKENS&sortDirection=DESC'
```

200

400

401

500

```
[
  {
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "asset": "<string>",
    "conditionId": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "size": 123,
    "avgPrice": 123,
    "initialValue": 123,
    "currentValue": 123,
    "cashPnl": 123,
    "percentPnl": 123,
    "totalBought": 123,
    "realizedPnl": 123,
    "percentRealizedPnl": 123,
    "curPrice": 123,
    "redeemable": true,
    "mergeable": true,
    "title": "<string>",
    "slug": "<string>",
    "icon": "<string>",
    "eventSlug": "<string>",
    "outcome": "<string>",
    "outcomeIndex": 123,
    "oppositeOutcome": "<string>",
    "oppositeAsset": "<string>",
    "endDate": "<string>",
    "negativeRisk": true
  }
]
```

#### Query Parameters

user

string

required

User address (required)
User Profile Address (0x-prefixed, 40 hex chars)

Example:

`"0x56687bf447db6ffa42ffe2204a05edaa20f55839"`

market

string[]

Comma-separated list of condition IDs. Mutually exclusive with eventId.

0x-prefixed 64-hex string

eventId

integer[]

Comma-separated list of event IDs. Mutually exclusive with market.

Required range: `x >= 1`

sizeThreshold

number

default:1

Required range: `x >= 0`

redeemable

boolean

default:false

mergeable

boolean

default:false

limit

integer

default:100

Required range: `0 <= x <= 500`

offset

integer

default:0

Required range: `0 <= x <= 10000`

sortBy

enum<string>

default:TOKENS

Available options:

`CURRENT`,

`INITIAL`,

`TOKENS`,

`CASHPNL`,

`PERCENTPNL`,

`TITLE`,

`RESOLVING`,

`PRICE`,

`AVGPRICE`

sortDirection

enum<string>

default:DESC

Available options:

`ASC`,

`DESC`

title

string

Maximum string length: `100`

#### Response

200

application/json

Success

proxyWallet

string

User Profile Address (0x-prefixed, 40 hex chars)

Example:

`"0x56687bf447db6ffa42ffe2204a05edaa20f55839"`

asset

string

conditionId

string

0x-prefixed 64-hex string

Example:

`"0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917"`

size

number

avgPrice

number

initialValue

number

currentValue

number

cashPnl

number

percentPnl

number

totalBought

number

realizedPnl

number

percentRealizedPnl

number

curPrice

number

redeemable

boolean

mergeable

boolean

title

string

slug

string

icon

string

eventSlug

string

outcome

string

outcomeIndex

integer

oppositeOutcome

string

oppositeAsset

string

endDate

string

negativeRisk

boolean
