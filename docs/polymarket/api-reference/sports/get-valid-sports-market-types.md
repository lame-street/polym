---
url: "https://docs.polymarket.com/api-reference/sports/get-valid-sports-market-types"
title: "Get valid sports market types - Polymarket Documentation"
---

# Get valid sports market types

Get a list of all valid sports market types available on the platform. Use these values when filtering markets by the sportsMarketTypes parameter.

GET /sports/market-types

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/sports/market-types
```

200

```
{
  "marketTypes": [\
    "<string>"\
  ]
}
```

#### Response
200 - application/json List of valid sports market types
- marketTypes: string[] — List of all valid sports market types
