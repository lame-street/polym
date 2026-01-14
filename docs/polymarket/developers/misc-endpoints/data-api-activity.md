---
url: "https://docs.polymarket.com/developers/misc-endpoints/data-api-activity"
title: "Get User On-Chain Activity (Data-API) - Polymarket Documentation"
---

# Get User On-Chain Activity (Data-API)

Returns trades and activity history for a specified wallet, optionally filtered by market, type, time, and side.

GET

/

activity

Get user activity

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/activity
```

200

400

401

500

```
[
  {
    "proxyWallet": "0x56687bf447db6ffa42ffe2204a05edaa20f55839",
    "timestamp": 123,
    "conditionId": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
    "type": "TRADE",
    "size": 123,
    "usdcSize": 123,
    "transactionHash": "<string>",
    "price": 123,
    "asset": "<string>",
    "side": "BUY",
    "outcomeIndex": 123,
    "title": "<string>",
    "slug": "<string>",
    "icon": "<string>",
    "eventSlug": "<string>",
    "outcome": "<string>",
    "name": "<string>",
    "pseudonym": "<string>",
    "bio": "<string>",
    "profileImage": "<string>",
    "profileImageOptimized": "<string>"
  }
]
```

#### Query Parameters

limit

integer

default:100

Required range: `0 <= x <= 500`

offset

integer

default:0

Required range: `0 <= x <= 10000`

user

string

required

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

type

enum<string>[]

Available options:

`TRADE`,

`SPLIT`,

`MERGE`,

`REDEEM`,

`REWARD`,

`CONVERSION`,

`MAKER_REBATE`

start

integer

Required range: `x >= 0`

end

integer

Required range: `x >= 0`

sortBy

enum<string>

default:TIMESTAMP

Available options:

`TIMESTAMP`,

`TOKENS`,

`CASH`

sortDirection

enum<string>

default:DESC

Available options:

`ASC`,

`DESC`

side

enum<string>

Available options:

`BUY`,

`SELL`

#### Response

200

application/json

Success

proxyWallet

string

User Profile Address (0x-prefixed, 40 hex chars)

Example:

`"0x56687bf447db6ffa42ffe2204a05edaa20f55839"`

timestamp

integer<int64>

conditionId

string

0x-prefixed 64-hex string

Example:

`"0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917"`

type

enum<string>

Available options:

`TRADE`,

`SPLIT`,

`MERGE`,

`REDEEM`,

`REWARD`,

`CONVERSION`,

`MAKER_REBATE`

size

number

usdcSize

number

transactionHash

string

price

number

asset

string

side

enum<string>

Available options:

`BUY`,

`SELL`

outcomeIndex

integer

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

name

string

pseudonym

string

bio

string

profileImage

string

profileImageOptimized

string
