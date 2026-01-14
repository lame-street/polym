---
url: "https://docs.polymarket.com/developers/CLOB/clients/methods-public"
title: "Public Methods - Polymarket Documentation"
---

# Public Methods

These methods can be called without a signer or user credentials. Use these for reading market data, prices, and order books.

## Client Initialization

Public methods require the client to initialize with the host URL and Polygon chain ID.

- TypeScript

- Python

```
import { ClobClient } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137
);

// Ready to call public methods
const markets = await client.getMarkets();
```

```
from py_clob_client.client import ClobClient

client = ClobClient(
    host="https://clob.polymarket.com",
    chain_id=137
)

# Ready to call public methods
markets = await client.get_markets()
```

* * *

## Health Check

* * *

### getOk()

Health check endpoint to verify the CLOB service is operational.

Signature

```
async getOk(): Promise<any>
```

* * *

## Markets

* * *

### getMarket()

Get details for a single market by condition ID.

Signature

```
async getMarket(conditionId: string): Promise<Market>
```

Response

```
interface MarketToken {
  outcome: string;
  price: number;
  token_id: string;
  winner: boolean;
}

interface Market {
  accepting_order_timestamp: string | null;
  accepting_orders: boolean;
  active: boolean;
  archived: boolean;
  closed: boolean;
  condition_id: string;
  description: string;
  enable_order_book: boolean;
  end_date_iso: string;
  fpmm: string;
  game_start_time: string;
  icon: string;
  image: string;
  is_50_50_outcome: boolean;
  maker_base_fee: number;
  market_slug: string;
  minimum_order_size: number;
  minimum_tick_size: number;
  neg_risk: boolean;
  neg_risk_market_id: string;
  neg_risk_request_id: string;
  notifications_enabled: boolean;
  question: string;
  question_id: string;
  rewards: {
    max_spread: number;
    min_size: number;
    rates: any | null;
  };
  seconds_delay: number;
  tags: string[];
  taker_base_fee: number;
  tokens: MarketToken[];
}
```

* * *

### getMarkets()

Get details for multiple markets paginated.

Signature

```
async getMarkets(): Promise<PaginationPayload>
```

Response

```
interface PaginationPayload {
  limit: number;
  count: number;
  data: Market[];
}

interface Market {
  accepting_order_timestamp: string | null;
  accepting_orders: boolean;
  active: boolean;
  archived: boolean;
  closed: boolean;
  condition_id: string;
  description: string;
  enable_order_book: boolean;
  end_date_iso: string;
  fpmm: string;
  game_start_time: string;
  icon: string;
  image: string;
  is_50_50_outcome: boolean;
  maker_base_fee: number;
  market_slug: string;
  minimum_order_size: number;
  minimum_tick_size: number;
  neg_risk: boolean;
  neg_risk_market_id: string;
  neg_risk_request_id: string;
  notifications_enabled: boolean;
  question: string;
  question_id: string;
  rewards: {
    max_spread: number;
    min_size: number;
    rates: any | null;
  };
  seconds_delay: number;
  tags: string[];
  taker_base_fee: number;
  tokens: MarketToken[];
}

interface MarketToken {
  outcome: string;
  price: number;
  token_id: string;
  winner: boolean;
}
```

* * *

### getSimplifiedMarkets()

Get simplified market data paginated for faster loading.

Signature

```
async getSimplifiedMarkets(): Promise<PaginationPayload>
```

Response

```
interface PaginationPayload {
  limit: number;
  count: number;
  data: SimplifiedMarket[];
}

interface SimplifiedMarket {
  accepting_orders: boolean;
  active: boolean;
  archived: boolean;
  closed: boolean;
  condition_id: string;
  rewards: {
    rates: any | null;
    min_size: number;
    max_spread: number;
  };
    tokens: SimplifiedToken[];
}

interface SimplifiedToken {
  outcome: string;
  price: number;
  token_id: string;
}
```

* * *

### getSamplingMarkets()

Signature

```
async getSamplingMarkets(): Promise<PaginationPayload>
```

Response

* * *

### getSamplingSimplifiedMarkets()

Signature

```
async getSamplingSimplifiedMarkets(): Promise<PaginationPayload>
```

Response

* * *

## Order Books and Prices

* * *

### calculateMarketPrice()

Signature

```
async calculateMarketPrice(
  tokenID: string,
  side: Side,
  amount: number,
  orderType: OrderType = OrderType.FOK
): Promise<number>
```

Params

```
enum OrderType {
  GTC = "GTC",  // Good Till Cancelled
  FOK = "FOK",  // Fill or Kill
  GTD = "GTD",  // Good Till Date
  FAK = "FAK",  // Fill and Kill
}

enum Side {
  BUY = "BUY",
  SELL = "SELL",
}
```

Response

```
number // calculated market price
```

* * *

### getOrderBook()

Get the order book for a specific token ID.

Signature

```
async getOrderBook(tokenID: string): Promise<OrderBookSummary>
```

Response

```
interface OrderBookSummary {
  market: string;
  asset_id: string;
  timestamp: string;
  bids: OrderSummary[];
  asks: OrderSummary[];
  min_order_size: string;
  tick_size: string;
  neg_risk: boolean;
  hash: string;
}

interface OrderSummary {
  price: string;
  size: string;
}
```

* * *

### getOrderBooks()

Get order books for multiple token IDs.

Signature

```
async getOrderBooks(params: BookParams[]): Promise<OrderBookSummary[]>
```

Params

```
interface BookParams {
  token_id: string;
  side: Side;  // Side.BUY or Side.SELL
}
```

Response

```
OrderBookSummary[]
```

* * *

### getPrice()

Get the current best price for buying or selling a token ID.

Signature

```
async getPrice(
  tokenID: string,
  side: "BUY" | "SELL"
): Promise<any>
```

Response

```
{
  price: string;
}
```

* * *

### getPrices()

Get the current best prices for multiple token IDs.

Signature

```
async getPrices(params: BookParams[]): Promise<PricesResponse>
```

Params

```
interface BookParams {
  token_id: string;
  side: Side;  // Side.BUY or Side.SELL
}
```

Response

```
interface TokenPrices {
  BUY?: string;
  SELL?: string;
}

type PricesResponse = {
  [tokenId: string]: TokenPrices;
}
```

* * *

### getMidpoint()

Get the midpoint price (average of best bid and best ask) for a token ID.

Signature

```
async getMidpoint(tokenID: string): Promise<any>
```

Response

```
{
  mid: string;
}
```

* * *

### getMidpoints()

Get the midpoint prices (average of best bid and best ask) for multiple token IDs.

Signature

```
async getMidpoints(params: BookParams[]): Promise<any>
```

Params

```
interface BookParams {
  token_id: string;
  side: Side;  // Side is ignored
}
```

Response

```
{
  [tokenId: string]: string;
}
```

* * *

### getSpread()

Get the spread (difference between best ask and best bid) for a token ID.

Signature

```
async getSpread(tokenID: string): Promise<SpreadResponse>
```

Response

```
interface SpreadResponse {
  spread: string;
}
```

* * *

### getSpreads()

Get the spreads (difference between best ask and best bid) for multiple token IDs.

Signature

```
async getSpreads(params: BookParams[]): Promise<SpreadsResponse>
```

Params

```
interface BookParams {
  token_id: string;
  side: Side;
}
```

Response

```
type SpreadsResponse = {
  [tokenId: string]: string;
}
```

* * *

### getPricesHistory()

Get historical price data for a token.

Signature

```
async getPricesHistory(params: PriceHistoryFilterParams): Promise<MarketPrice[]>
```

Params

```
interface PriceHistoryFilterParams {
  market: string; // tokenID
  startTs?: number;
  endTs?: number;
  fidelity?: number;
  interval: PriceHistoryInterval;
}

enum PriceHistoryInterval {
  MAX = "max",
  ONE_WEEK = "1w",
  ONE_DAY = "1d",
  SIX_HOURS = "6h",
  ONE_HOUR = "1h",
}
```

Response

```
interface MarketPrice {
  t: number;  // timestamp
  p: number;  // price
}
```

* * *

## Trades

* * *

### getLastTradePrice()

Get the price of the most recent trade for a token.

Signature

```
async getLastTradePrice(tokenID: string): Promise<LastTradePrice>
```

Response

```
interface LastTradePrice {
  price: string;
  side: string;
}
```

* * *

### getLastTradesPrices()

Get the price of the most recent trade for a token.

Signature

```
async getLastTradesPrices(params: BookParams[]): Promise<LastTradePriceWithToken[]>
```

Params

```
interface BookParams {
  token_id: string;
  side: Side;
}
```

Response

```
interface LastTradePriceWithToken {
  price: string;
  side: string;
  token_id: string;
}
```

* * *

### getMarketTradesEvents

Signature

```
async getMarketTradesEvents(conditionID: string): Promise<MarketTradeEvent[]>
```

Response

```
interface MarketTradeEvent {
  event_type: string;
  market: {
    condition_id: string;
    asset_id: string;
    question: string;
    icon: string;
    slug: string;
  };
  user: {
    address: string;
    username: string;
    profile_picture: string;
    optimized_profile_picture: string;
    pseudonym: string;
  };
  side: Side;
  size: string;
  fee_rate_bps: string;
  price: string;
  outcome: string;
  outcome_index: number;
  transaction_hash: string;
  timestamp: string;
}
```

## Market Parameters

* * *

### getFeeRateBps()

Get the fee rate in basis points for a token.

Signature

```
async getFeeRateBps(tokenID: string): Promise<number>
```

Response

```
number
```

* * *

### getTickSize()

Get the tick size (minimum price increment) for a market.

Signature

```
async getTickSize(tokenID: string): Promise<TickSize>
```

Response

```
type TickSize = "0.1" | "0.01" | "0.001" | "0.0001";
```

* * *

### getNegRisk()

Check if a market uses negative risk (binary complementary tokens).

Signature

```
async getNegRisk(tokenID: string): Promise<boolean>
```

Response

```
boolean
```

* * *

## Time & Server Info

### getServerTime()

Get the current server timestamp.

Signature

```
async getServerTime(): Promise<number>
```

Response

```
number // Unix timestamp in seconds
```

* * *

## See Also

[**L1 Methods**
Private key authentication to create or derive API keys (L2 headers).](https://docs.polymarket.com/developers/CLOB/clients/methods-l1) [**L2 Methods**
Manage and close orders. Creating orders requires signer.](https://docs.polymarket.com/developers/CLOB/clients/methods-l2) [**CLOB Rest API Reference**
Complete REST endpoint documentation](https://docs.polymarket.com/api-reference/orderbook/get-order-book-summary) [**Web Socket API**
Real-time market data streaming](https://docs.polymarket.com/developers/CLOB/websocket/wss-overview)

[Methods Overview](https://docs.polymarket.com/developers/CLOB/clients/methods-overview) [L1 Methods](https://docs.polymarket.com/developers/CLOB/clients/methods-l1)
