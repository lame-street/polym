---
url: "https://docs.polymarket.com/developers/CLOB/clients/methods-l1"
title: "L1 Methods - Polymarket Documentation"
---

# L1 Methods

These methods require a wallet signer (private key) but do not require user API credentials. Use these for initial setup.

## Client Initialization

L1 methods require the client to initialize with a signer.

- TypeScript

- Python

```
import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

const signer = new Wallet(process.env.PRIVATE_KEY);

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  signer // Signer required for L1 methods
);

// Ready to create user API credentials
const apiKey = await client.createApiKey();
```

```
from py_clob_client.client import ClobClient
import os

private_key = os.getenv("PRIVATE_KEY")

client = ClobClient(
    host="https://clob.polymarket.com",
    chain_id=137,
    key=private_key  # Signer required for L1 methods
)

# Ready to create user API credentials
api_key = await client.create_api_key()
```

**Security:** Never commit private keys to version control. Always use environment variables or secure key management systems.

* * *

## API Key Management

* * *

### createApiKey()

Creates a new API key (L2 credentials) for the wallet signer. This generates a new set of credentials that can be used for L2 authenticated requests.
Each wallet can only have one active API key at a time. Creating a new key invalidates the previous one.

Signature

```
async createApiKey(nonce?: number): Promise<ApiKeyCreds>
```

Params

```
`nonce` (optional): Custom nonce for deterministic key generation. If not provided, a default derivation is used.
```

Response

```
interface ApiKeyCreds {
  apiKey: string;
  secret: string;
  passphrase: string;
}
```

* * *

### deriveApiKey()

Derives an existing API key (L2 credentials) using a specific nonce. If you’ve already created API credentials with a particular nonce, this method will return the same credentials again.

Signature

```
async deriveApiKey(nonce?: number): Promise<ApiKeyCreds>
```

Params

```
`nonce` (optional): Custom nonce for deterministic key generation. If not provided, a default derivation is used.
```

Response

```
interface ApiKeyCreds {
  apiKey: string;
  secret: string;
  passphrase: string;
}
```

* * *

### createOrDeriveApiKey()

Convenience method that attempts to derive an API key with the default nonce, or creates a new one if it doesn’t exist. This is the recommended method for initial setup if you’re unsure if credentials already exist.

Signature

```
async createOrDeriveApiKey(nonce?: number): Promise<ApiKeyCreds>
```

Params

```
`nonce` (optional): Custom nonce for deterministic key generation. If not provided, a default derivation is used.
```

Response

```
interface ApiKeyCreds {
  apiKey: string;
  secret: string;
  passphrase: string;
}
```

* * *

## Order Signing

### createOrder()

Create and sign a limit order locally without posting it to the CLOB.
Use this when you want to sign orders in advance or implement custom order submission logic.
Place order via L2 methods postOrder or postOrders.

Signature

```
async createOrder(
  userOrder: UserOrder,
  options?: Partial<CreateOrderOptions>
): Promise<SignedOrder>
```

Params

```
interface UserOrder {
  tokenID: string;
  price: number;
  size: number;
  side: Side;
  feeRateBps?: number;
  nonce?: number;
  expiration?: number;
  taker?: string;
}

interface CreateOrderOptions {
  tickSize: TickSize;
  negRisk?: boolean;
}
```

Response

```
interface SignedOrder {
  salt: string;
  maker: string;
  signer: string;
  taker: string;
  tokenId: string;
  makerAmount: string;
  takerAmount: string;
  side: number;  // 0 = BUY, 1 = SELL
  expiration: string;
  nonce: string;
  feeRateBps: string;
  signatureType: number;
  signature: string;
}
```

* * *

### createMarketOrder()

Create and sign a market order locally without posting it to the CLOB.
Use this when you want to sign orders in advance or implement custom order submission logic.
Place orders via L2 methods postOrder or postOrders.

Signature

```
async createMarketOrder(
  userMarketOrder: UserMarketOrder,
  options?: Partial<CreateOrderOptions>
): Promise<SignedOrder>
```

Params

```
interface UserMarketOrder {
  tokenID: string;
  amount: number;  // BUY: dollar amount, SELL: number of shares
  side: Side;
  price?: number;  // Optional price limit
  feeRateBps?: number;
  nonce?: number;
  taker?: string;
  orderType?: OrderType.FOK | OrderType.FAK;
}
```

Response

* * *

## Troubleshooting

Error: INVALID_SIGNATURE

Your wallet’s private key is incorrect or improperly formatted.**Solution:**

- Verify your private key is a valid hex string (starts with “0x”)
- Ensure you’re using the correct key for the intended address
- Check that the key has proper permissions

Error: NONCE_ALREADY_USED

The nonce you provided has already been used to create an API key.**Solution:**

- Use `deriveApiKey()` with the same nonce to retrieve existing credentials
- Or use a different nonce with `createApiKey()`

Error: Invalid Funder Address

Your funder address is incorrect or doesn’t match your wallet.**Solution:** Check your Polymarket profile address at [polymarket.com/settings](https://polymarket.com/settings).If it does not exist or user has never logged into Polymarket.com, deploy it first before creating L2 authentication.

Lost API credentials but have nonce

```
// Use deriveApiKey with the original nonce
const recovered = await client.deriveApiKey(originalNonce);
```

Lost both credentials and nonce

Unfortunately, there’s no way to recover lost API credentials without the nonce. You’ll need to create new credentials:

```
// Create fresh credentials with a new nonce
const newCreds = await client.createApiKey();
// Save the nonce this time!
```

* * *

## See Also

[**Understand CLOB Authentication**
Deep dive into L1 and L2 authentication](https://docs.polymarket.com/developers/CLOB/authentication) [**CLOB Quickstart Guide**
Initialize the CLOB quickly and place your first order.](https://docs.polymarket.com/developers/CLOB/quickstart) [**Public Methods**
Access market data, orderbooks, and prices.](https://docs.polymarket.com/developers/CLOB/clients/methods-l2) [**L2 Methods**
Manage and close orders. Creating orders requires signer.](https://docs.polymarket.com/developers/CLOB/clients/methods-l2)

[Public Methods](https://docs.polymarket.com/developers/CLOB/clients/methods-public) [L2 Methods](https://docs.polymarket.com/developers/CLOB/clients/methods-l2)
