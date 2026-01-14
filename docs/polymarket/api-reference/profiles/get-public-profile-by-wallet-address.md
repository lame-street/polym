---
url: "https://docs.polymarket.com/api-reference/profiles/get-public-profile-by-wallet-address"
title: "Get public profile by wallet address - Polymarket Documentation"
---

# Get public profile by wallet address

GET /public-profile

cURL

```
curl --request GET \
  --url https://gamma-api.polymarket.com/public-profile
```

Status codes: 200, 400, 404
```
{
  "createdAt": "2023-11-07T05:31:56Z",
  "proxyWallet": "<string>",
  "profileImage": "<string>",
  "displayUsernamePublic": true,
  "bio": "<string>",
  "pseudonym": "<string>",
  "name": "<string>",
  "users": [
    {
      "id": "<string>",
      "creator": true,
      "mod": true
    }
  ],
  "xUsername": "<string>",
  "verifiedBadge": true
}
```

#### Query Parameters
- address: string; required — The wallet address (proxy wallet or user address)
#### Response
200 application/json Public profile information
- createdAt: string<date-time> | null — ISO 8601 timestamp of when the profile was created
- proxyWallet: string | null — The proxy wallet address
- profileImage: string<uri> | null — URL to the profile image
- displayUsernamePublic: boolean | null — Whether the username is displayed publicly
- bio: string | null — Profile bio
- pseudonym: string | null — Auto-generated pseudonym
- name: string | null — User-chosen display name
- users: object[] | null — Array of associated user objects
- xUsername: string | null — X (Twitter) username
- verifiedBadge: boolean | null — Whether the profile has a verified badge
