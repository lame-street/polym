# Bot Configuration

This folder contains the configuration for the Polym trading bot.

## Files

- `bot.config.json` - Your bot configuration (create from example)
- `bot.config.example.json` - Example configuration with all fields documented

## Setup

1. Copy the example config:

    ```bash
    cp config/bot.config.example.json config/bot.config.json
    ```

2. Edit `bot.config.json` with your markets and strategy parameters

3. Set up environment variables:
    ```bash
    cp .env.example .env
    # Edit .env with your private key and wallet address
    ```

## Configuration Reference

### Markets

Each market entry requires:

| Field         | Type    | Description                            |
| ------------- | ------- | -------------------------------------- |
| `conditionId` | string  | Polymarket condition ID                |
| `question`    | string  | Human-readable market question         |
| `token1`      | string  | Token ID for outcome 1 (usually YES)   |
| `token2`      | string  | Token ID for outcome 2 (usually NO)    |
| `answer1`     | string  | Label for outcome 1                    |
| `answer2`     | string  | Label for outcome 2                    |
| `tickSize`    | number  | Minimum price increment (e.g., 0.01)   |
| `negRisk`     | boolean | Whether this is a negative risk market |
| `maxSpread`   | number  | Maximum spread to trade within (%)     |
| `minSize`     | number  | Minimum order size                     |
| `tradeSize`   | number  | Default order size                     |
| `maxSize`     | number  | Maximum position size per outcome      |

### Strategy Parameters

| Field                 | Type   | Description                        |
| --------------------- | ------ | ---------------------------------- |
| `stopLossThreshold`   | number | Stop loss trigger (% from entry)   |
| `takeProfitThreshold` | number | Take profit target (% from entry)  |
| `spreadThreshold`     | number | Max spread for stop-loss execution |
| `volatilityThreshold` | number | Max volatility before pausing buys |
| `sleepPeriod`         | number | Hours to wait after stop-loss      |

### Strategy Overrides

You can define different strategy parameters for different market types.
Reference them in your market config to apply overrides.

## Finding Market Data

Use the CLI to fetch market data:

```bash
bun run polym markets snapshot
```

This will show available markets with their token IDs and condition IDs.

## Environment Variables

| Variable          | Required | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `PK`              | Yes      | Private key for signing transactions                      |
| `BROWSER_ADDRESS` | Yes      | Wallet address (must have done at least one trade via UI) |
