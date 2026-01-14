---
url: "https://docs.polymarket.com/api-reference/tags/get-related-tags-relationships-by-tag-id"
title: "Get related tags (relationships) by tag id - Polymarket Documentation"
---

# Get related tags (relationships) by tag id

GET /tags/{id}/related-tags

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/tags/{id}/related-tags
```

200

```
[
  {
    "id": "<string>",
    "tagID": 123,
    "relatedTagID": 123,
    "rank": 123
  }
]
```

#### Path Parameters
- id: integer; required
#### Query Parameters
- omit_empty: boolean
- status: enum<string>; options=active|closed|all
#### Response
200 - application/json Related tag relationships
- id: string
- tagID: integer | null
- relatedTagID: integer | null
- rank: integer | null
