# polym

A minimalist TypeScript rewrite of [poly-maker](https://github.com/warproxxx/poly-maker) — a market-making bot for Polymarket prediction markets.

## Overview

polym is a from-scratch implementation inspired by poly-maker's approach to automated market making on Polymarket. It provides:

- Real-time order book monitoring via WebSockets
- Inventory-aware quoting with configurable size/spread parameters
- Position tracking and order management
- A CLI for account info, market discovery, and bot control

## Project Structure

```
packages/
├── sdk/         # @polym/sdk – Typed REST + WebSocket clients for Polymarket
├── bot/         # @polym/bot – Trading engine and strategy logic
├── cli/         # @polym/cli – Command-line interface
├── config/      # @polym/config – Configuration loading
├── merger/      # @polym/merger – Position merging utilities
└── utils/       # @polym/utils – Shared utilities

config/          # Bot configuration files (JSON)
```

## Key Differences from poly-maker

| Aspect               | poly-maker                               | polym                                  |
| -------------------- | ---------------------------------------- | -------------------------------------- |
| **Language**         | Python 3.9+                              | TypeScript (Bun)                       |
| **Architecture**     | Single-process scripts with global state | Monorepo with isolated, typed packages |
| **Configuration**    | Google Sheets (live updates)             | Local JSON files                       |
| **State Management** | Global mutable dicts + pandas DataFrames | Typed Maps with functional updates     |
| **SDK**              | Official Polymarket Python SDK           | Custom `@polym/sdk` with Zod schemas   |
| **WebSockets**       | Raw `websockets` library                 | PartySocket with typed handlers        |
| **Concurrency**      | Threading + asyncio mix                  | Single-threaded async (Bun)            |

### What's Simplified

polym intentionally omits some of poly-maker's features in favor of a smaller, more hackable codebase:

- **No Google Sheets integration** — Config is static JSON; no live parameter updates
- **No volatility-based guards** — The `3_hour` volatility checks are not implemented
- **No position merging** — The merger module exists but isn't wired into the bot loop yet
- **No separate data updater** — No background process for collecting market info from different IPs

### What's Added

- **Type safety** — Full TypeScript with branded IDs (`TokenId`, `ConditionId`), Zod codecs for wire formats
- **Modular SDK** — REST clients and WebSocket handlers as separate, testable packages
- **CLI tooling** — `polym account`, `polym markets`, `polym bot` commands out of the box

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- A Polymarket account with at least one trade completed via the UI

### Installation

```bash
bun install
```

### Configuration

1. Set up environment variables:

    ```bash
    cp .env.example .env
    # Edit .env with your private key and wallet address
    ```

2. Create your bot config:

    ```bash
    cp config/bot.config.example.json config/bot.config.json
    # Edit config/bot.config.json with your markets and parameters
    ```

### Run the Bot

```bash
# Start in dry-run mode (no real orders)
bun run polym bot start --dry-run

# Start for real
bun run polym bot start
```

### Other Commands

```bash
# View account positions and balances
bun run polym account status

# List available markets
bun run polym markets snapshot
```

## Development

| Command         | Purpose                                |
| --------------- | -------------------------------------- |
| `bun run build` | Build all packages                     |
| `bun run check` | Type-check + lint + JSDoc verification |
| `bun run test`  | Run unit tests                         |

## License

MIT

## Acknowledgments

- [warproxxx/poly-maker](https://github.com/warproxxx/poly-maker) for the original implementation and strategy logic
- [Polymarket](https://polymarket.com) for the prediction market platform
