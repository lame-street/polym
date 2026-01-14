---
url: "https://docs.polymarket.com/api-reference/bridge/get-supported-assets"
title: "Get supported assets - Polymarket Documentation"
---

# Get supported assets

Retrieve all supported chains and tokens for deposits.

**USDC.e on Polygon:**
Polymarket uses USDC.e (Bridged USDC from Ethereum) on Polygon as the native collateral for all markets. When you deposit assets from other chains, they are automatically bridged and swapped to USDC.e on Polygon, which is then used as collateral for trading on Polymarket.

**Minimum Deposit Amounts:**
Each asset has a `minCheckoutUsd` field indicating the minimum deposit amount required in USD. Make sure your deposit meets this minimum to avoid transaction failures.

GET /supported-assets

cURL

```
curl --request GET \
  --url https://bridge.polymarket.com/supported-assets
```

Status codes: 200, 500
```
{
  "supportedAssets": [
    {
      "chainId": "1",
      "chainName": "Ethereum",
      "token": {
        "name": "USD Coin",
        "symbol": "USDC",
        "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "decimals": 6
      },
      "minCheckoutUsd": 45
    }
  ]
}
```

#### Response
200 application/json Successfully retrieved supported assets
- supportedAssets: object[] — List of supported assets with minimum deposit amounts
