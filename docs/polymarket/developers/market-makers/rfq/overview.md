---
url: "https://docs.polymarket.com/developers/market-makers/rfq/overview"
title: "RFQ Overview - Polymarket Documentation"
---

# RFQ Overview

Request for Quote (RFQ) system that enables market makers to respond to user-initiated quote requests

## Overview

The RFQ (Request for Quote) system enables quote-based trade execution by allowing users to request prices from market makers.

The RFQ system is currently in early alpha and requires onboarding. Contact [support@polymarket.com](mailto:support@polymarket.com) to request access.

## Roles

### Requesters

- Create **Requests**: unsigned intents to buy or sell outcome tokens
- Anyone may originate Requests from the Polymarket site or API

### Quoters (Market Makers)

- Respond to Requests with **Quotes**: unsigned intents to fill those Requests
- Must be onboarded into the RFQ system by address
- Compete to offer the best price

## High-Level Lifecycle

![RFQ Lifecycle](https://mintcdn.com/polymarket-292d1b1b/0G4fHewnXJ-4lGTN/images/rfq-overview.png?fit=max&auto=format&n=0G4fHewnXJ-4lGTN&q=85&s=7bbea7326967df8cb04b189758dcf6a5)

1. **Requester creates a Request** to BUY or SELL outcome tokens   - This initiates an auction to the community of Quoters
2. **Quoter A creates a Quote** responding to the Request
3. **Quoter B submits a better Quote** (e.g., cheaper price)
4. **Requester selects and accepts a Quote**   - An Order is automatically created, which the Requester signs
   - A timer begins: the Quoter must approve within the defined window
5. **Selected Quoter has last look**   - If approved: another Order is created, which the Quoter signs
   - If not approved within timeframe: RFQ is rejected
6. **If approved**: RFQ is executed onchain

## System Parameters

The RFQ API is served from the CLOB API host at `https://clob.polymarket.com` under the `/rfq` path (e.g. `GET /rfq/data/requests`).

| Parameter | Value | Description |
| --- | --- | --- |
| **Last Look** | Enabled | Quoters have a final decision window before committing |
| **RequestTTL** | 10 minutes | How long a Request is live before auto-expiration |
| **QuoteAcceptTTL** | 10 seconds | Time for Quoter to approve after Requester accepts |
| **MultiRequestEnabled** | false | Requester can only have 1 active Request at a time |
| **QuoteRestrictionMode** | OneQuotePerRequestPerMarket | Quoter can only have 1 active Quote per market |

These parameters may change as the system progresses out of alpha.

## State Transitions

### Request States

![Request State Transitions](https://mintcdn.com/polymarket-292d1b1b/0G4fHewnXJ-4lGTN/images/rfq-request-states.png?fit=max&auto=format&n=0G4fHewnXJ-4lGTN&q=85&s=cacf3fc16b590a18c0da80b6e69bb0ba)

| State | Description |
| --- | --- |
| `STATE_ACCEPTING_QUOTES` | Request is live, accepting quotes from market makers |
| `STATE_QUOTE_ACCEPTED` | Requester accepted a quote, waiting for Quoter approval |
| `STATE_MAKER_ORDER_APPROVED` | Quoter approved, pending onchain execution |
| `STATE_COMPLETED` | Successfully executed onchain |
| `STATE_USER_CANCELED` | Requester canceled the request |
| `STATE_INTERNAL_CANCELED` | System canceled the request |
| `STATE_REQUEST_EXPIRED` | Request TTL expired |
| `STATE_REQUEST_EXECUTION_FAILED` | Onchain execution failed |

### Quote States

![Quote State Transitions](https://mintcdn.com/polymarket-292d1b1b/0G4fHewnXJ-4lGTN/images/rfq-quote-states.png?fit=max&auto=format&n=0G4fHewnXJ-4lGTN&q=85&s=fe60137b22ea0a849f931d0fc35ee0d1)

| State | Description |
| --- | --- |
| `STATE_REQUEST_QUOTED` | Quote submitted, waiting for Requester decision |
| `STATE_REQUEST_ACCEPTED_QUOTE` | Requester accepted this quote, last look timer started |
| `STATE_MAKER_APPROVED` | Quoter approved, pending execution |
| `STATE_COMPLETED` | Successfully executed |
| `STATE_MAKER_CANCELED` | Quoter canceled their quote |
| `STATE_REQUEST_CANCELED` | Parent request was canceled |
| `STATE_REQUEST_EXPIRED` | Parent request expired |
| `STATE_EXECUTION_FAILED` | Onchain execution failed |
| `STATE_MAKER_REJECTED_CANCELED` | Quoter rejected during last look |
| `STATE_MAKER_REJECTED_EXPIRED` | Quoter did not respond during last look window |

## Authentication

All RFQ endpoints use **L2 Auth** from the Polymarket CLOB API. See [CLOB Authentication](https://docs.polymarket.com/developers/CLOB/authentication) for details on generating and using API credentials.

## Next Steps

[**RFQ API Reference**
Complete endpoint documentation](https://docs.polymarket.com/developers/market-makers/rfq/api-reference) [**CLOB Authentication**
Set up API credentials for RFQ access](https://docs.polymarket.com/developers/CLOB/authentication)
