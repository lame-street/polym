# polym

TypeScript primitives for building on Polymarket.

## Overview

polym is a monorepo of composable packages for interacting with Polymarket prediction markets:

- **`@polym/sdk`**: Typed REST clients and WebSocket handlers
- **`@polym/bot`**: Trading engine with pluggable strategy logic
- **`@polym/cli`**: Command-line tools for account info, markets, and bot control
- **`@polym/config`**: Configuration loading and validation
- **`@polym/alerts`**: Unified alert broadcasting to Discord, Telegram, etc.
- **`@polym/merger`**: Position merging utilities (stub)
- **`@polym/utils`**: Shared helpers (terminal UI, formatting)

Each package is designed with clear boundaries—use them together or pick what you need.

The bot logic draws from [warproxxx/poly-maker](https://github.com/warproxxx/poly-maker), reimagined as typed, modular TypeScript.

## Project Structure

```
packages/
├── sdk/         # REST + WebSocket clients for Polymarket APIs
├── bot/         # Trading engine and strategy logic
├── cli/         # Command-line interface
├── config/      # Configuration loading
├── alerts/      # Alert broadcasting (Discord, Telegram)
├── merger/      # Position merging utilities
└── utils/       # Shared utilities

config/          # Bot configuration files (JSON)
```

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

### CLI Commands

```bash
# View account positions and balances
bun run polym account status

# List available markets
bun run polym markets snapshot
```

## Packages

| Package         | Description                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------- |
| `@polym/sdk`    | Typed clients for Gamma, CLOB, and Data APIs; market/user WebSockets; RTDS subscriptions      |
| `@polym/bot`    | Event-driven trading engine with order book state, position tracking, and strategy evaluation |
| `@polym/cli`    | `polym` binary with `account`, `markets`, and `bot` subcommands                               |
| `@polym/config` | Loads and validates `bot.config.json` via c12                                                 |
| `@polym/alerts` | Unified alert broadcasting to Discord, Telegram, and custom providers                         |
| `@polym/merger` | Utilities for merging opposing positions to free capital                                      |
| `@polym/utils`  | Terminal helpers (spinners, prompts), formatting utilities                                    |

## Development

| Command         | Purpose                                |
| --------------- | -------------------------------------- |
| `bun run build` | Build all packages                     |
| `bun run check` | Type-check + lint + JSDoc verification |
| `bun run test`  | Run unit tests                         |

## Design Principles

- **Composable primitives**: Small packages with single responsibilities
- **Type safety**: Branded IDs, Zod schemas for wire formats, strict TypeScript
- **Minimal dependencies**: Only what's necessary; no framework lock-in

## License

MIT
