---
url: "https://docs.polymarket.com/api-reference/comments/get-comments-by-user-address"
title: "Get comments by user address - Polymarket Documentation"
---

# Get comments by user address

GET /comments/user_address/{user_address}

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/comments/user_address/{user_address}
```

200

```
[
  {
    "id": "<string>",
    "body": "<string>",
    "parentEntityType": "<string>",
    "parentEntityID": 123,
    "parentCommentID": "<string>",
    "userAddress": "<string>",
    "replyAddress": "<string>",
    "createdAt": "2023-11-07T05:31:56Z",
    "updatedAt": "2023-11-07T05:31:56Z",
    "profile": {
      "name": "<string>",
      "pseudonym": "<string>",
      "displayUsernamePublic": true,
      "bio": "<string>",
      "isMod": true,
      "isCreator": true,
      "proxyWallet": "<string>",
      "baseAddress": "<string>",
      "profileImage": "<string>",
      "profileImageOptimized": {
        "id": "<string>",
        "imageUrlSource": "<string>",
        "imageUrlOptimized": "<string>",
        "imageSizeKbSource": 123,
        "imageSizeKbOptimized": 123,
        "imageOptimizedComplete": true,
        "imageOptimizedLastUpdated": "<string>",
        "relID": 123,
        "field": "<string>",
        "relname": "<string>"
      },
      "positions": [
        {
          "tokenId": "<string>",
          "positionSize": "<string>"
        }
      ]
    },
    "reactions": [
      {
        "id": "<string>",
        "commentID": 123,
        "reactionType": "<string>",
        "icon": "<string>",
        "userAddress": "<string>",
        "createdAt": "2023-11-07T05:31:56Z",
        "profile": {
          "name": "<string>",
          "pseudonym": "<string>",
          "displayUsernamePublic": true,
          "bio": "<string>",
          "isMod": true,
          "isCreator": true,
          "proxyWallet": "<string>",
          "baseAddress": "<string>",
          "profileImage": "<string>",
          "profileImageOptimized": {
            "id": "<string>",
            "imageUrlSource": "<string>",
            "imageUrlOptimized": "<string>",
            "imageSizeKbSource": 123,
            "imageSizeKbOptimized": 123,
            "imageOptimizedComplete": true,
            "imageOptimizedLastUpdated": "<string>",
            "relID": 123,
            "field": "<string>",
            "relname": "<string>"
          },
          "positions": [
            {
              "tokenId": "<string>",
              "positionSize": "<string>"
            }
          ]
        }
      }
    ],
    "reportCount": 123,
    "reactionCount": 123
  }
]
```

#### Path Parameters
- user_address: string; required
#### Query Parameters
- limit: integer; constraints=`x >= 0`
- offset: integer; constraints=`x >= 0`
- order: string — Comma-separated list of fields to order by
- ascending: boolean
#### Response
200 - application/json Comments
- id: string
- body: string | null
- parentEntityType: string | null
- parentEntityID: integer | null
- parentCommentID: string | null
- userAddress: string | null
- replyAddress: string | null
- createdAt: string<date-time> | null
- updatedAt: string<date-time> | null
- profile: object
- reactions: object[]
- reportCount: integer | null
- reactionCount: integer | null
