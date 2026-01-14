---
url: "https://docs.polymarket.com/api-reference/misc/get-live-volume-for-an-event"
title: "Get live volume for an event - Polymarket Documentation"
---

# Get live volume for an event

GET /live-volume

cURL

```
curl --request GET \
  --url https://data-api.polymarket.com/live-volume
```

Status codes: 200, 400, 500
```
[
  {
    "total": 123,
    "markets": [
      {
        "market": "0xdd22472e552920b8438158ea7238bfadfa4f736aa4cee91a6b86c39ead110917",
        "value": 123
      }
    ]
  }
]
```

#### Query Parameters
- id: integer; required; constraints=`x >= 1`
#### Response
200 application/json Success
- total: number
- markets: object[]
