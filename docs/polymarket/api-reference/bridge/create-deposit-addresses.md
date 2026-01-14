---
url: "https://docs.polymarket.com/api-reference/bridge/create-deposit-addresses"
title: "Create deposit addresses - Polymarket Documentation"
---

# Create deposit addresses

Generate unique deposit addresses for bridging assets to Polymarket.

**How it works:**

1. Request deposit addresses for your Polymarket wallet
2. Receive deposit addresses for each blockchain type (EVM, Solana, Bitcoin)
3. Send assets to the appropriate deposit address for your source chain
4. Assets are automatically bridged and swapped to USDC.e on Polygon
5. USDC.e is credited to your Polymarket wallet for trading

POST /deposit

cURL

```
curl --request POST \
  --url https://bridge.polymarket.com/deposit \
  --header 'Content-Type: application/json' \
  --data '
{
  "address": "0x56687bf447db6ffa42ffe2204a05edaa20f55839"
}
'
```

Status codes: 201, 400, 500
```
{
  "address": {
    "evm": "0x23566f8b2E82aDfCf01846E54899d110e97AC053",
    "svm": "CrvTBvzryYxBHbWu2TiQpcqD5M7Le7iBKzVmEj3f36Jb",
    "btc": "bc1q8eau83qffxcj8ht4hsjdza3lha9r3egfqysj3g"
  },
  "note": "Only certain chains and tokens are supported. See /supported-assets for details."
}
```

#### Body
- address: string; required; example="0x56687bf447db6ffa42ffe2204a05edaa20f55839" — Your Polymarket wallet address
#### Response
201 application/json Deposit addresses created successfully
- address: object — Deposit addresses for different blockchain networks
- note: string; example="Only certain chains and tokens are supported. See /supported-assets for details." — Additional information about supported chains
