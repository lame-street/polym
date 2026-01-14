---
url: "https://docs.polymarket.com/developers/CLOB/websocket/market-channel-migration-guide"
title: "Price Change Message Migration Guide - Polymarket Documentation"
---

# Price Change Message Migration Guide

**🚨 Breaking Change:** This change goes live on **September 15, 2025 at 11PM UTC**. Please upgrade your implementation as soon as possible to avoid service disruption.

## Overview

- The `price_change` message schema in the Market Channel WebSocket has been updated to improve websocket performance and reliability.
- Messages now come in the form of objects as opposed to lists of fields.

## What’s Changed

**Before (Legacy Schema):**

```
{
  "asset_id": "71321045679252212594626385532706912750332728571942532289631379312455583992563",
  "changes": [
    {
      "price": "0.4",
      "side": "SELL",
      "size": "3300"
    }
  ],
  "event_type": "price_change",
  "market": "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1",
  "timestamp": "1729084877448",
  "hash": "3cd4d61e042c81560c9037ece0c61f3b1a8fbbdd"
}
```

**After (New Schema):**

```
{
    "market": "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1",
    "price_changes": [
        {
            "asset_id": "71321045679252212594626385532706912750332728571942532289631379312455583992563",
            "price": "0.5",
            "size": "200",
            "side": "BUY",
            "hash": "56621a121a47ed9333273e21c83b660cff37ae50",
            "best_bid": "0.5",
            "best_ask": "1"
        },
        {
            "asset_id": "52114319501245915516055106046884209969926127482827954674443846427813813222426",
            "price": "0.5",
            "size": "200",
            "side": "SELL",
            "hash": "1895759e4df7a796bf4f1c5a5950b748306923e2",
            "best_bid": "0",
            "best_ask": "0.5"
        }
    ],
    "timestamp": "1757908892351",
    "event_type": "price_change"
}
```

### Key Differences

| Aspect | Legacy Schema | New Schema |
| --- | --- | --- |
| **Root level asset_id** | Present | Removed |
| **Changes array** | `changes` | `price_changes` |
| **Asset ID location** | Root level | Inside each price change object |
| **Hash location** | Root level | Inside each price change object |
| **Best bid/ask** | Not included | Included in each change |
| **Side values** | ”SELL”, “BUY" | "SELL”, “BUY” (unchanged) |

## Handle New Fields

The new schema provides additional market data:

- **`best_bid`**: Current best bid price for the asset
- **`best_ask`**: Current best ask price for the asset
- **`hash`**: Now provided per price change rather than per message

## Benefits of the New Schema

- **Enhanced market data**: Best bid/ask prices are now included
- **Granular change tracking**: Hash values are provided per change rather than per message
- **Clearer structure**: The reorganized schema makes the relationship between market, assets, and changes more explicit

## Timeline

- **Go-live**: **September 15, 2025 at 11PM UTC**
- **Legacy support**: None, these changes are not backwards compatible

## Testing Your Migration

1. **Update your parsing logic** following the examples above
2. **Verify handling of new fields** like `best_bid` and `best_ask`
3. **Check error handling** for the new structure

## Support

If you encounter issues during migration or have questions about the new schema, please reach out to `Fleming` on the #dev channel of our Discord.
