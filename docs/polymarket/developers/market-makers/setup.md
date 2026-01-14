---
url: "https://docs.polymarket.com/developers/market-makers/setup"
title: "Setup - Polymarket Documentation"
---

# Setup

One-time setup for market making on Polymarket: deposits, approvals, wallets, and API keys

## Overview

Before you can start market making on Polymarket, you need to complete these one-time setup steps:

1. Deposit bridged USDCe to Polygon
2. Deploy a wallet (EOA or Safe)
3. Approve tokens for trading
4. Generate API credentials

## Deposit USDCe

Market makers need USDCe on Polygon to fund their trading operations.

### Options

| Method | Best For | Documentation |
| --- | --- | --- |
| Bridge API | Automated deposits from other chains | [Bridge Overview](https://docs.polymarket.com/developers/misc-endpoints/bridge-overview) |
| Direct Polygon transfer | Already have USDCe on Polygon | N/A |
| Cross-chain bridge | Large deposits from Ethereum | [Large Deposits](https://docs.polymarket.com/polymarket-learn/deposits/large-cross-chain-deposits) |

### Using the Bridge API

```
// Deposit USDCe from Ethereum to Polygon
const deposit = await fetch("https://clob.polymarket.com/deposit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chainId: "1",
    fromChain: "ethereum",
    toChain: "polygon",
    asset: "USDCe",
    amount: "100000000000" // $100,000 in USDCe (6 decimals)
  })
});
```

See [Bridge Deposit](https://docs.polymarket.com/api-reference/bridge/create-deposit-addresses) for full API details.

## Wallet Options

### EOA (Externally Owned Account)

Standard Ethereum wallet. You pay for all onchain transactions (approvals, splits, merges, trade exedcution).

### Safe Wallet (Recommended)

Gnosis Safe-based wallet deployed via Polymarket’s relayer. Benefits:

- **Gasless transactions** \- Polymarket pays gas fees for onchain operations
- **Contract wallet** \- Enables advanced features like batched transactions.

Deploy a Safe wallet using the [Relayer Client](https://docs.polymarket.com/developers/builders/relayer-client):

```
import { RelayClient, RelayerTxType } from "@polymarket/builder-relayer-client";

const client = new RelayClient(
  "https://relayer-v2.polymarket.com/",
  137, // Polygon mainnet
  signer,
  builderConfig,
  RelayerTxType.SAFE
);

// Deploy the Safe wallet
const response = await client.deploy();
const result = await response.wait();
console.log("Safe Address:", result?.proxyAddress);
```

## Token Approvals

Before trading, you must approve the exchange contracts to spend your tokens.

### Required Approvals

| Token | Spender | Purpose |
| --- | --- | --- |
| USDCe | CTF Contract | Split USDCe into outcome tokens |
| CTF (outcome tokens) | CTF Exchange | Trade outcome tokens |
| CTF (outcome tokens) | Neg Risk CTF Exchange | Trade neg-risk market tokens |

### Contract Addresses (Polygon Mainnet)

```
const ADDRESSES = {
  USDCe: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  CTF: "0x4d97dcd97ec945f40cf65f87097ace5ea0476045",
  CTF_EXCHANGE: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
  NEG_RISK_CTF_EXCHANGE: "0xC5d563A36AE78145C45a50134d48A1215220f80a",
  NEG_RISK_ADAPTER: "0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296"
};
```

### Approve via Relayer Client

```
import { ethers } from "ethers";
import { Interface } from "ethers/lib/utils";

const erc20Interface = new Interface([
  "function approve(address spender, uint256 amount) returns (bool)"
]);

// Approve USDCe for CTF contract
const approveTx = {
  to: ADDRESSES.USDCe,
  data: erc20Interface.encodeFunctionData("approve", [
    ADDRESSES.CTF,
    ethers.constants.MaxUint256
  ]),
  value: "0"
};

const response = await client.execute([approveTx], "Approve USDCe for CTF");
await response.wait();
```

See [Relayer Client](https://docs.polymarket.com/developers/builders/relayer-client) for complete examples.

## API Key Generation

To place orders and access authenticated endpoints, you need L2 API credentials.

### Generate API Key

```
import { ClobClient } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  signer
);

// Derive API credentials from your wallet
const credentials = await client.deriveApiKey();
console.log("API Key:", credentials.key);
console.log("Secret:", credentials.secret);
console.log("Passphrase:", credentials.passphrase);
```

### Using Credentials

Once you have credentials, initialize the client for authenticated operations:

```
const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  wallet,
  credentials
);
```

See [CLOB Authentication](https://docs.polymarket.com/developers/CLOB/authentication) for full details.

## Next Steps

Once setup is complete:

[**Start Trading**
Post limit orders and manage quotes](https://docs.polymarket.com/developers/market-makers/trading) [**Connect to RFQ**
Respond to Request for Quote requests](https://docs.polymarket.com/developers/market-makers/rfq/overview)

[Market Maker Introduction](https://docs.polymarket.com/developers/market-makers/introduction) [Trading](https://docs.polymarket.com/developers/market-makers/trading)
