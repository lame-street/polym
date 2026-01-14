---
url: "https://docs.polymarket.com/api-reference/pricing/get-multiple-market-prices-by-request"
title: "Get multiple market prices by request - Polymarket Documentation"
---

# Get multiple market prices by request

Retrieves market prices for specified tokens and sides via POST request

POST /prices

cURL

```
curl --request POST \
  --url https://clob.polymarket.com/prices \
  --header 'Content-Type: application/json' \
  --data '
[\
  {\
    "token_id": "1234567890",\
    "side": "BUY"\
  },\
  {\
    "token_id": "0987654321",\
    "side": "SELL"\
  }\
]
'
```

200

Example

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

#### Body
- token_id: string; required; example="1234567890" — The unique identifier for the token
- side: enum<string>; required; options=BUY|SELL; example="BUY" — The side of the market (BUY or SELL)
#### Response
200 application/json Successful response Map of token_id to side to price {key} object
