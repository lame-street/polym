---
url: "https://docs.polymarket.com/polymarket-learn/trading/maker-rebates-program"
title: "Maker Rebates Program - Polymarket Documentation"
---

# Maker Rebates Program

We’re rolling out **Maker Rebates** for **15-minute crypto markets**; a program designed to make these fast-moving markets deeper, tighter, and easier to trade. Market makers who provide **active liquidity** (orders that get filled) earn **daily USDC rebates**, proportional to the liquidity they provide.

## Why Maker Rebates?

15-minute markets move quickly. When liquidity is deeper:

- Spreads tend to be tighter
- Price impact is lower
- Fills are more reliable
- Markets are more resilient during volatility

Maker Rebates incentivize **consistent, competitive quoting** so everyone gets a better trading experience.

## How Maker Rebates Work

- **Paid daily in USDC:** Rebates are calculated and distributed every day.
- **Performance-based:** You earn based on the share of liquidity you provided that actually got taken.

### Funding

Maker Rebates are funded by **taker fees collected in 15-minute crypto markets**. A percentage of these fees are redistributed to makers who keep the markets liquid.

| Period | Maker Rebate |
| --- | --- |
| Jan 9 – Jan 11, 2026 (Until Sunday Midnight UTC) | 100% |
| Jan 12 – Jan 18, 2026 | 20% |

Polymarket collects taker fees **only** in 15-minute crypto markets. The rebate percentage is at the sole discretion of Polymarket and may change over time.

## Taker Fee Structure

Taker fees are calculated in USDC and vary based on the share price. Fees are **highest at 50%** probability and **lowest at the extremes** (near 0% or 100%).![Fee Curve](https://mintcdn.com/polymarket-292d1b1b/YUHnSq4JdekVofRY/polymarket-learn/media/fee_image.png?fit=max&auto=format&n=YUHnSq4JdekVofRY&q=85&s=5a4bdaf810ad1dafafd7c6f2be20719e)

### Fee Table (100 shares)

| Price | Trade Value | Fee (USDC) | Effective Rate |
| --- | --- | --- | --- |
| $0.01 | $1 | $0.00 | 0.00% |
| $0.05 | $5 | $0.003 | 0.06% |
| $0.10 | $10 | $0.02 | 0.20% |
| $0.15 | $15 | $0.06 | 0.41% |
| $0.20 | $20 | $0.13 | 0.64% |
| $0.25 | $25 | $0.22 | 0.88% |
| $0.30 | $30 | $0.33 | 1.10% |
| $0.35 | $35 | $0.45 | 1.29% |
| $0.40 | $40 | $0.58 | 1.44% |
| $0.45 | $45 | $0.69 | 1.53% |
| $0.50 | $50 | $0.78 | **1.56%** |
| $0.55 | $55 | $0.84 | 1.53% |
| $0.60 | $60 | $0.86 | 1.44% |
| $0.65 | $65 | $0.84 | 1.29% |
| $0.70 | $70 | $0.77 | 1.10% |
| $0.75 | $75 | $0.66 | 0.88% |
| $0.80 | $80 | $0.51 | 0.64% |
| $0.85 | $85 | $0.35 | 0.41% |
| $0.90 | $90 | $0.18 | 0.20% |
| $0.95 | $95 | $0.05 | 0.06% |
| $0.99 | $99 | $0.00 | 0.00% |

The maximum effective fee rate is **1.56%** at 50% probability. Fees decrease symmetrically toward both extremes.

### Fee Precision

Fees are rounded to 4 decimal places. The smallest fee charged is **0.0001 USDC**. Anything smaller rounds to zero, so very small trades near the extremes may incur no fee at all.

## FAQ

How do I qualify for maker rebates?

Place orders that add liquidity to the book and get filled (i.e., your liquidity is taken by another trader).

When are rebates paid?

Daily, in USDC.

How are rebates calculated?

Rebates are proportional to your share of executed maker liquidity in each eligible market.

Where does the rebate pool come from?

Taker fees collected in eligible markets are allocated to the maker rebate pool and distributed daily.

Which markets have fees enabled?

Currently, only 15-minute crypto markets have taker fees enabled.

Is Polymarket charging fees on all markets?

No. Polymarket is collecting taker fees **only** on 15-minute crypto markets. All other markets remain fee-free.

## For API Users

If you trade programmatically, you’ll need to update your client to handle fees correctly. [**Developer Guide: Maker Rebates**
Technical documentation for handling fees in your trading code](https://docs.polymarket.com/developers/market-makers/maker-rebates-program)

[Fees](https://docs.polymarket.com/polymarket-learn/trading/fees) [Does Polymarket Have Trading Limits?](https://docs.polymarket.com/polymarket-learn/trading/no-limits)
