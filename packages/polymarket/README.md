# @polym/sdk

TypeScript client for Polymarket's REST APIs and real-time WebSockets.

## Installation

```bash
bun add @polym/sdk
```

## Usage

### REST APIs

```typescript
import { ClobPublicClient, DataClient, GammaClient } from '@polym/sdk'

// Market discovery (no auth)
const gamma = new GammaClient()
const markets = await gamma.getMarkets({ limit: 10, order: 'volume' })

// Order books and prices (no auth)
const clob = new ClobPublicClient()
const book = await clob.getOrderBook(tokenId)

// Positions (no auth, just needs wallet address)
const data = new DataClient()
const positions = await data.getPositions(walletAddress)
```

### Authenticated Trading

```typescript
import { ClobPolymarketClient } from '@polym/sdk'

const client = new ClobPolymarketClient({
	privateKey: '0x...',
	walletAddress: '0x...',
})

await client.deriveCredentials()
await client.createOrder(tokenId, 'BUY', 0.65, 100)
```

### Real-Time Data (RTDS)

```typescript
import { activitySubscription, connectRtds, cryptoPricesSubscription } from '@polym/sdk'

const handle = connectRtds({
	subscriptions: [cryptoPricesSubscription('BTCUSDT'), activitySubscription()],
	onMessage: msg => console.log(msg),
})

// Cleanup
handle.close()
```

### WebSockets

```typescript
import { connectMarketWebSocket } from '@polym/sdk'

const handle = connectMarketWebSocket({
	tokenIds: [tokenId],
	onMessage: updates => console.log(updates),
})
```

## Structure

| Module      | Purpose                            |
| ----------- | ---------------------------------- |
| `lib/rest/` | REST clients (Gamma, CLOB, Data)   |
| `lib/ws/`   | Market and user WebSockets         |
| `lib/rtds/` | Real-Time Data Socket wrapper      |
| `types/`    | Domain types, wire schemas, codecs |
