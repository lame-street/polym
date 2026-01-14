# @polym/alerts

Unified alert broadcasting to multiple notification providers.

## Installation

```bash
bun add @polym/alerts
```

## Usage

```typescript
import { DiscordProvider, TelegramProvider, type AlertMessage } from '@polym/alerts'

// Create providers
const discord = new DiscordProvider({ webhookUrl: process.env.DISCORD_WEBHOOK! })
const telegram = new TelegramProvider({
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
})

// Send a unified alert
const alert: AlertMessage = {
  title: 'Order Filled',
  body: 'Your buy order for 100 shares was filled at $0.65',
  severity: 'success',
  fields: { market: 'Will X happen?', size: 100, price: 0.65 },
  url: 'https://polymarket.com/...',
}

await discord.send(alert)
await telegram.send(alert)
```

## Providers

| Provider   | Config                                  |
| ---------- | --------------------------------------- |
| `Discord`  | `webhookUrl`, optional `username`       |
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
