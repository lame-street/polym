---
url: "https://docs.polymarket.com/api-reference/tags/get-tag-by-id"
title: "Get tag by id - Polymarket Documentation"
---

# Get tag by id

GET /tags/{id}

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/tags/{id}
```

200

```
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
```

#### Path Parameters
- id: integer; required
#### Query Parameters
- include_template: boolean
#### Response
200 application/json Tag
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
