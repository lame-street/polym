---
url: "https://docs.polymarket.com/developers/market-makers/introduction"
title: "Market Maker Introduction - Polymarket Documentation"
---

# Market Maker Introduction

Overview of market making on Polymarket and available tools for liquidity providers

## What is a Market Maker?

A Market Maker (MM) on Polymarket is a sophisticated trader who provides liquidity to prediction markets by continuously posting bid and ask orders. By “laying the spread,” market makers enable other users to trade efficiently while earning the spread as compensation for the risk they take. Market makers are essential to Polymarket’s ecosystem:

- **Provide liquidity** across all markets
- **Tighten spreads** for better user experience
- **Enable price discovery** through continuous quoting
- **Absorb trading flow** from retail and institutional users

**Not a Market Maker?** If you’re building an application that routes orders for your
users, see the [Builders Program](https://docs.polymarket.com/developers/builders/builder-intro) instead. Builders
get access to gasless transactions via the Relayer Client and can earn grants through order attribution.

## Getting Started

To become a market maker on Polymarket:

1. **Contact Polymarket** \- Email [support@polymarket.com](mailto:support@polymarket.com) to request acces to RFQ API
2. **Complete setup** \- Deploy wallets, fund with USDCe, set token approvals
3. **Connect to data feeds** \- WebSocket for orderbook, RTDS for low-latency data
4. **Start quoting** \- Post orders via CLOB REST API or respond to RFQ requests

## Available Tools

### By Action Type

[**Setup**
Deposits, token approvals, wallet deployment, API keys](https://docs.polymarket.com/developers/market-makers/setup) [**Trading**
CLOB order entry, order types, quoting best practices](https://docs.polymarket.com/developers/market-makers/trading) [**RFQ API**
Request for Quote system for responding to large orders](https://docs.polymarket.com/developers/market-makers/rfq/overview) [**Data Feeds**
WebSocket, RTDS, Gamma API, on-chain data](https://docs.polymarket.com/developers/market-makers/data-feeds) [**Inventory Management**
Split, merge, and redeem outcome tokens](https://docs.polymarket.com/developers/market-makers/inventory) [**Liquidity Rewards**
Earn rewards for providing liquidity](https://docs.polymarket.com/developers/market-makers/liquidity-rewards)

## Quick Reference

| Action | Tool | Documentation |
| --- | --- | --- |
| Deposit USDCe | Bridge API | [Bridge Overview](https://docs.polymarket.com/developers/misc-endpoints/bridge-overview) |
| Approve tokens | Relayer Client | [Setup Guide](https://docs.polymarket.com/developers/market-makers/setup) |
| Post limit orders | CLOB REST API | [CLOB Client](https://docs.polymarket.com/developers/CLOB/clients/methods-l2) |
| Respond to RFQ | RFQ API | [RFQ Overview](https://docs.polymarket.com/developers/market-makers/rfq/overview) |
| Monitor orderbook | WebSocket | [WebSocket Overview](https://docs.polymarket.com/developers/CLOB/websocket/wss-overview) |
| Low-latency data | RTDS | [Data Feeds](https://docs.polymarket.com/developers/market-makers/data-feeds) |
| Split USDCe to tokens | CTF / Relayer | [Inventory](https://docs.polymarket.com/developers/market-makers/inventory) |
| Merge tokens to USDCe | CTF / Relayer | [Inventory](https://docs.polymarket.com/developers/market-makers/inventory) |

## Support

For market maker onboarding and support, contact [support@polymarket.com](mailto:support@polymarket.com).

[Endpoints](https://docs.polymarket.com/quickstart/reference/endpoints) [Setup](https://docs.polymarket.com/developers/market-makers/setup)
