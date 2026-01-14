---
url: "https://docs.polymarket.com/api-reference/spreads/get-bid-ask-spreads"
title: "Get bid-ask spreads - Polymarket Documentation"
---

# Get bid-ask spreads

Retrieves bid-ask spreads for multiple tokens

POST /spreads

cURL

```
curl --request POST \
  --url https://clob.polymarket.com/spreads \
  --header 'Content-Type: application/json' \
  --data '
[\
  {\
    "token_id": "1234567890"\
  },\
  {\
    "token_id": "0987654321"\
  }\
]
'
```

200

Example

```
{
  "1234567890": "0.50",
  "0987654321": "0.05"
}
```

#### Body
- token_id: string; required; example="1234567890" — The unique identifier for the token
- side: enum<string>; options=BUY|SELL; example="BUY" — Optional side parameter for certain operations
#### Response
200 application/json Successful response Map of token_id to spread value {key} string
