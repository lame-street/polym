---
url: "https://docs.polymarket.com/developers/CLOB/clients/methods-l2"
title: "L2 Methods - Polymarket Documentation"
---

# L2 Methods

These methods require user API credentials (L2 headers). Use these for placing trades and managing user’s positions.

* * *

## Client Initialization

L2 methods require the client to initialize with the signer, signatureType, user API credentials, and funder.

- TypeScript

- Python

```
import { ClobClient } from "@polymarket/clob-client";
import { Wallet } from "ethers";

const signer = new Wallet(process.env.PRIVATE_KEY)

const apiCreds = {
  apiKey: process.env.API_KEY,
  secret: process.env.SECRET,
  passphrase: process.env.PASSPHRASE,
};

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  signer,
  apiCreds,
  2, // Deployed Safe proxy wallet
  process.env.FUNDER_ADDRESS // Address of deployed Safe proxy wallet
);

// Ready to send authenticated requests to the CLOB API!
const order = await client.postOrder(signedOrder);
```

```
from py_clob_client.client import ClobClient
from py_clob_client.clob_types import ApiCreds
import os

api_creds = ApiCreds(
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("SECRET"),
    api_passphrase=os.getenv("PASSPHRASE")
)

client = ClobClient(
    host="https://clob.polymarket.com",
    chain_id=137,
    key=os.getenv("PRIVATE_KEY"),
    creds=api_creds,
    signature_type=2, # Deployed Safe proxy wallet
    funder=os.getenv("FUNDER_ADDRESS") # Address of deployed Safe proxy wallet
)

# Ready to send authenticated requests to the CLOB API!
order = await client.post_order(signed_order)
```

* * *

## Order Creation and Management

* * *

### createAndPostOrder()

A convenience method that creates, prompts signature, and posts an order in a single call.
Use when you want to buy/sell at a specific price and can wait.

Signature

```
async createAndPostOrder(
  userOrder: UserOrder,
  options?: Partial<CreateOrderOptions>,
  orderType?: OrderType.GTC | OrderType.GTD, // Defaults to GTC
): Promise<OrderResponse>
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

type CreateOrderOptions = {
  tickSize: TickSize;
  negRisk?: boolean;
}

type TickSize = "0.1" | "0.01" | "0.001" | "0.0001";
```

Response

```
interface OrderResponse {
  success: boolean;
  errorMsg: string;
  orderID: string;
  transactionsHashes: string[];
  status: string;
  takingAmount: string;
  makingAmount: string;
}
```

* * *

### createAndPostMarketOrder()

A convenience method that creates, prompts signature, and posts an order in a single call.
Use when you want to buy/sell right now at whatever the market price is.

Signature

```
async createAndPostMarketOrder(
  userMarketOrder: UserMarketOrder,
  options?: Partial<CreateOrderOptions>,
  orderType?: OrderType.FOK | OrderType.FAK, // Defaults to FOK
): Promise<OrderResponse>
```

Params

```
interface UserMarketOrder {
  tokenID: string;
  amount: number;
  side: Side;
  price?: number;
  feeRateBps?: number;
  nonce?: number;
  taker?: string;
  orderType?: OrderType.FOK | OrderType.FAK;
}

type CreateOrderOptions = {
  tickSize: TickSize;
  negRisk?: boolean;
}

type TickSize = "0.1" | "0.01" | "0.001" | "0.0001";
```

Response

* * *

### postOrder()

Posts a pre-signed and created order to the CLOB.

Signature

```
async postOrder(
  order: SignedOrder,
  orderType?: OrderType, // Defaults to GTC
  postOnly?: boolean, // Defaults to false
): Promise<OrderResponse>
```

Params

```
order: SignedOrder  // Pre-signed order from createOrder() or createMarketOrder()
orderType?: OrderType  // Optional, defaults to GTC
postOnly?: boolean  // Optional, defaults to false
```

Response

* * *

### postOrders()

Posts up to 15 pre-signed and created orders in a single batch.

```
async postOrders(
  args: PostOrdersArgs[],
): Promise<OrderResponse[]>
```

Params

```
interface PostOrdersArgs {
  order: SignedOrder;
  orderType: OrderType;
  postOnly?: boolean; // Defaults to false
}
```

Response

```
OrderResponse[]  // Array of OrderResponse objects

interface OrderResponse {
  success: boolean;
  errorMsg: string;
  orderID: string;
  transactionsHashes: string[];
  status: string;
  takingAmount: string;
  makingAmount: string;
}
```

* * *

### cancelOrder()

Cancels a single open order.

Signature

```
async cancelOrder(orderID: string): Promise<CancelOrdersResponse>
```

Response

```
interface CancelOrdersResponse {
  canceled: string[];
  not_canceled: Record<string, any>;
}
```

* * *

### cancelOrders()

Cancels multiple orders in a single batch.

Signature

```
async cancelOrders(orderIDs: string[]): Promise<CancelOrdersResponse>
```

Params

```
orderIDs: string[];
```

Response

```
interface CancelOrdersResponse {
  canceled: string[];
  not_canceled: Record<string, any>;
}
```

* * *

### cancelAll()

Cancels all open orders.

Signature

```
async cancelAll(): Promise<CancelResponse>
```

Response

```
interface CancelOrdersResponse {
  canceled: string[];
  not_canceled: Record<string, any>;
}
```

* * *

### cancelMarketOrders()

Cancels all open orders for a specific market.

Signature

```
async cancelMarketOrders(
  payload: OrderMarketCancelParams
): Promise<CancelOrdersResponse>
```

Parameters

```
interface OrderMarketCancelParams {
  market?: string;
  asset_id?: string;
}
```

Response

```
interface CancelOrdersResponse {
  canceled: string[];
  not_canceled: Record<string, any>;
}
```

* * *

## Order and Trade Queries

* * *

### getOrder()

Get details for a specific order.

Signature

```
async getOrder(orderID: string): Promise<OpenOrder>
```

Response

```
interface OpenOrder {
  id: string;
  status: string;
  owner: string;
  maker_address: string;
  market: string;
  asset_id: string;
  side: string;
  original_size: string;
  size_matched: string;
  price: string;
  associate_trades: string[];
  outcome: string;
  created_at: number;
  expiration: string;
  order_type: string;
}
```

* * *

### getOpenOrders()

Get all your open orders.

Signature

```
async getOpenOrders(
  params?: OpenOrderParams,
  only_first_page?: boolean,
): Promise<OpenOrdersResponse>
```

Params

```
interface OpenOrderParams {
  id?: string; // Order ID
  market?: string; // Market condition ID
  asset_id?: string; // Token ID
}

only_first_page?: boolean  // Defaults to false
```

Response

```
type OpenOrdersResponse = OpenOrder[];

interface OpenOrder {
  id: string;
  status: string;
  owner: string;
  maker_address: string;
  market: string;
  asset_id: string;
  side: string;
  original_size: string;
  size_matched: string;
  price: string;
  associate_trades: string[];
  outcome: string;
  created_at: number;
  expiration: string;
  order_type: string;
}
```

* * *

### getTrades()

Get your trade history (filled orders).

Signature

```
async getTrades(
  params?: TradeParams,
  only_first_page?: boolean,
): Promise<Trade[]>
```

Params

```
interface TradeParams {
  id?: string;
  maker_address?: string;
  market?: string;
  asset_id?: string;
  before?: string;
  after?: string;
}

only_first_page?: boolean  // Defaults to false
```

Response

```
interface Trade {
  id: string;
  taker_order_id: string;
  market: string;
  asset_id: string;
  side: Side;
  size: string;
  fee_rate_bps: string;
  price: string;
  status: string;
  match_time: string;
  last_update: string;
  outcome: string;
  bucket_index: number;
  owner: string;
  maker_address: string;
  maker_orders: MakerOrder[];
  transaction_hash: string;
  trader_side: "TAKER" | "MAKER";
}

interface MakerOrder {
  order_id: string;
  owner: string;
  maker_address: string;
  matched_amount: string;
  price: string;
  fee_rate_bps: string;
  asset_id: string;
  outcome: string;
  side: Side;
}
```

* * *

### getTradesPaginated()

Get trade history with pagination for large result sets.

Signature

```
async getTradesPaginated(
  params?: TradeParams,
): Promise<TradesPaginatedResponse>
```

Params

```
interface TradeParams {
  id?: string;
  maker_address?: string;
  market?: string;
  asset_id?: string;
  before?: string;
  after?: string;
}
```

Response

```
interface TradesPaginatedResponse {
  trades: Trade[];
  limit: number;
  count: number;
}
```

* * *

## Balance and Allowances

* * *

### getBalanceAllowance()

Get your balance and allowance for specific tokens.

Signature

```
async getBalanceAllowance(
  params?: BalanceAllowanceParams
): Promise<BalanceAllowanceResponse>
```

Params

```
interface BalanceAllowanceParams {
  asset_type: AssetType;
  token_id?: string;
}

enum AssetType {
  COLLATERAL = "COLLATERAL",
  CONDITIONAL = "CONDITIONAL",
}
```

Response

```
interface BalanceAllowanceResponse {
  balance: string;
  allowance: string;
}
```

* * *

### updateBalanceAllowance()

Updates the cached balance and allowance for specific tokens.

Signature

```
async updateBalanceAllowance(
  params?: BalanceAllowanceParams
): Promise<void>
```

Params

* * *

## API Key Management (L2)

### getApiKeys()

Get all API keys associated with your account.

Signature

```
async getApiKeys(): Promise<ApiKeysResponse>
```

Response

```
interface ApiKeysResponse {
  apiKeys: ApiKeyCreds[];
}

interface ApiKeyCreds {
  key: string;
  secret: string;
  passphrase: string;
}
```

* * *

### deleteApiKey()

Deletes (revokes) the currently authenticated API key.**TypeScript Signature:**

```
async deleteApiKey(): Promise<any>
```

* * *

## Notifications

* * *

### getNotifications()

Retrieves all event notifications for the L2 authenticated user.
Records are removed automatically after 48 hours or if manually removed via dropNotifications().

Signature

```
public async getNotifications(): Promise<Notification[]>
```

Response

```
interface Notification {
    id: number;           // Unique notification ID
    owner: string;        // User's L2 credential apiKey or empty string for global notifications
    payload: any;         // Type-specific payload data
    timestamp?: number;   // Unix timestamp
    type: number;         // Notification type (see type mapping below)
}
```

**Notification Type Mapping**

| Name | Value | Description |
| --- | --- | --- |
| Order Cancellation | 1 | User’s order was canceled |
| Order Fill | 2 | User’s order was filled (maker or taker) |
| Market Resolved | 4 | Market was resolved |

* * *

### dropNotifications()

Mark notifications as read/dismissed.

Signature

```
public async dropNotifications(params?: DropNotificationParams): Promise<void>
```

Params

```
interface DropNotificationParams {
    ids: string[];  // Array of notification IDs to mark as read
}
```

* * *

## See Also

[**Understand CLOB Authentication**
Deep dive into L1 and L2 authentication](https://docs.polymarket.com/developers/CLOB/authentication) [**Public Methods**
Access market data, orderbooks, and prices.](https://docs.polymarket.com/developers/CLOB/clients/methods-l2) [**L1 Methods**
Private key authentication to create or derive API keys (L2 headers)](https://docs.polymarket.com/developers/CLOB/clients/methods-l2) [**Web Socket API**
Real-time market data streaming](https://docs.polymarket.com/developers/CLOB/websocket/wss-overview)

[L1 Methods](https://docs.polymarket.com/developers/CLOB/clients/methods-l1) [Builder Methods](https://docs.polymarket.com/developers/CLOB/clients/methods-builder)
