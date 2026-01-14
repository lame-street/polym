---
url: "https://docs.polymarket.com/api-reference/tags/list-tags"
title: "List tags - Polymarket Documentation"
---

# List tags

GET /tags

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/tags
```

200

```
[
  {
    "id": "<string>",
    "label": "<string>",
    "slug": "<string>",
    "forceShow": true,
    "publishedAt": "<string>",
    "createdBy": 123,
    "updatedBy": 123,
    "createdAt": "2023-11-07T05:31:56Z",
    "updatedAt": "2023-11-07T05:31:56Z",
    "forceHide": true,
    "isCarousel": true
  }
]
```

#### Query Parameters
- limit: integer; constraints=`x >= 0`
- offset: integer; constraints=`x >= 0`
- order: string — Comma-separated list of fields to order by
- ascending: boolean
- include_template: boolean
- is_carousel: boolean
#### Response
200 - application/json List of tags
- id: string
- label: string | null
- slug: string | null
- forceShow: boolean | null
- publishedAt: string | null
- createdBy: integer | null
- updatedBy: integer | null
- createdAt: string<date-time> | null
- updatedAt: string<date-time> | null
- forceHide: boolean | null
- isCarousel: boolean | null
