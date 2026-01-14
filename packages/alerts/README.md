# @polym/alerts

Unified alert broadcasting to multiple notification providers.

## Installation

```bash
bun add @polym/alerts
```

## Usage

### Broadcast to Multiple Providers

```typescript
import { AlertBroadcaster, DiscordProvider, TelegramProvider } from '@polym/alerts'

const broadcaster = new AlertBroadcaster([
  new DiscordProvider({ webhookUrl: process.env.DISCORD_WEBHOOK! }),
  new TelegramProvider({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    chatId: process.env.TELEGRAM_CHAT_ID!,
  }),
])

const result = await broadcaster.send({
  title: 'Order Filled',
  body: 'Your buy order for 100 shares was filled at $0.65',
  severity: 'success',
  fields: { market: 'Will X happen?', size: 100, price: 0.65 },
})

console.log(`${result.successCount}/${result.results.length} providers succeeded`)
```

### Single Provider

```typescript
import { DiscordProvider } from '@polym/alerts'

const discord = new DiscordProvider({ webhookUrl: process.env.DISCORD_WEBHOOK! })

await discord.send({
  title: 'Bot Started',
  body: 'Market making bot is now running',
  severity: 'info',
})
```

## Broadcaster Options

```typescript
const broadcaster = new AlertBroadcaster(providers, {
  parallel: true,       // Send to all providers simultaneously (default: true)
  continueOnError: true // Continue if one provider fails (default: true)
})

// Dynamic provider management
broadcaster.add(new SlackProvider({ ... }))
broadcaster.remove('Discord')

// Health check all providers
const health = await broadcaster.healthCheck()
// Map { 'Discord' => true, 'Telegram' => true }
```

## Providers

| Provider   | Config                                     |
| ---------- | ------------------------------------------ |
| `Discord`  | `webhookUrl`, optional `username`          |
| `Telegram` | `botToken`, `chatId`, optional `parseMode` |

## Custom Providers

Implement the `AlertProvider` interface to add new providers:

```typescript
import type { AlertProvider, AlertMessage, AlertResult } from '@polym/alerts'

class SlackProvider implements AlertProvider {
  readonly type = 'slack'
  readonly name = 'Slack'

  async send(message: AlertMessage): Promise<AlertResult> {
    // ... send to Slack
  }

  async isHealthy(): Promise<boolean> {
    return true
  }
}
```
