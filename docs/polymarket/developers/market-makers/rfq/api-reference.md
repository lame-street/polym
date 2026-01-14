---
url: "https://docs.polymarket.com/developers/market-makers/rfq/api-reference"
title: "RFQ API Reference - Polymarket Documentation"
---

# RFQ API Reference

Complete API documentation for the Request for Quote system

## Base URL

```
https://clob.polymarket.com
```

All endpoints require **L2 Authentication**. See [CLOB Authentication](https://docs.polymarket.com/developers/CLOB/authentication) for details.

* * *

## Request Endpoints

### Create Request

`POST /rfq/request`Creates an RFQ Request to buy or sell outcome tokens. This initiates the RFQ flow.**Request Body**

```
{
  "assetIn": "104173557214744537570424345347209544585775842950109756851652855913015295701992",
  "assetOut": "0",
  "amountIn": "50000000",
  "amountOut": "3000000",
  "userType": 1
}
```

| Field | Type | Description |
| --- | --- | --- |
| `assetIn` | string | Token ID the Requester wants to receive. `"0"` indicates USDC |
| `assetOut` | string | Token ID the Requester wants to give. `"0"` indicates USDC |
| `amountIn` | string | Amount of asset to receive (in base units) |
| `amountOut` | string | Amount of asset to give (in base units) |
| `userType` | number | `0` = EOA, `1` = POLY_PROXY, `2` = POLY_GNOSIS_SAFE |

**Response**

```
{
  "requestId": "0196464a-a1fa-75e6-821e-31aa0794f7ad",
  "expiry": 1744936318
}
```

* * *

### Cancel Request

`DELETE /rfq/request`Cancels a request. The Request must be in `STATE_ACCEPTING_QUOTES`.**Request Body**

```
{
  "requestId": "019689a4-0efa-77ca-8b31-c4505de38078"
}
```

**Response**

```
OK
```

* * *

### Get Requests

`GET /rfq/data/requests`Gets RFQ Requests. Requesters can only view their own requests.
Quoters can only see their own quotes and requests that they quoted.**Query Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `offset` | string | Pagination cursor (base64-encoded integer). Default `"MA=="` (0) |
| `limit` | number | Max requests to return. Default 50, max 100 |
| `state` | string | Optional: `active` or `inactive`. If omitted: no state filter. Invalid values return 400 |
| `requestIds` | string[] | Repeatable RFQ request IDs (UUIDs). Invalid UUIDs are dropped |
| `markets` | string[] | Repeatable condition IDs (must be `0x` \+ 64 hex chars) |
| `sizeMin` | number | Minimum size in tokens |
| `sizeMax` | number | Maximum size in tokens |
| `sizeUsdcMin` | number | Minimum size in USDC |
| `sizeUsdcMax` | number | Maximum size in USDC |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `sortBy` | string | `price`, `expiry`, `size`, or `created` (default `created`) |
| `sortDir` | string | `asc` (default) or `desc` |

**Response**

```
{
  "data": [
    {
      "requestId": "01968f1e-1182-71c4-9d40-172db9be82af",
      "userAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
      "proxyAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
      "condition": "0x37a6a2dd9f3469495d9ec2467b0a764c5905371a294ce544bc3b2c944eb3e84a",
      "token": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
      "complement": "32868290514114487320702931554221558599637733115139769311383916145370132125101",
      "side": "BUY",
      "sizeIn": 100,
      "sizeOut": 50,
      "price": 0.5,
      "state": "STATE_ACCEPTING_QUOTES",
      "expiry": 1746159634
    }
  ],
  "next_cursor": "LTE=",
  "limit": 100,
  "count": 1
}
```

* * *

## Quote Endpoints

### Create Quote

`POST /rfq/quote`Creates an RFQ Quote in response to a Request.**Request Body**

```
{
  "requestId": "01968f1e-1182-71c4-9d40-172db9be82af",
  "assetIn": "0",
  "assetOut": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  "amountIn": "50000000",
  "amountOut": "100000000",
  "userType": 0
}
```

| Field | Type | Description |
| --- | --- | --- |
| `requestId` | string | ID of the Request to quote |
| `assetIn` | string | Token ID the Quoter wants to receive. `"0"` indicates USDC |
| `assetOut` | string | Token ID the Quoter wants to give. `"0"` indicates USDC |
| `amountIn` | string | Amount of asset to receive (in base units) |
| `amountOut` | string | Amount of asset to give (in base units) |
| `userType` | number | `0` = EOA, `1` = POLY_PROXY, `2` = POLY_GNOSIS_SAFE |

**Response**

```
{
  "quoteId": "0196464a-a1fa-75e6-821e-31aa0794f7ad"
}
```

* * *

### Cancel Quote

`DELETE /rfq/quote`Cancels an RFQ Quote.**Request Body**

```
{
  "quoteId": "019689a4-0efa-77ca-8b31-c4505de38078"
}
```

**Response**

```
OK
```

* * *

### Get Quotes

RFQ quotes are exposed via separate endpoints depending on which “view” you need:

- Requester view: `GET /rfq/data/requester/quotes` (quotes on requests created by the authenticated user)
- Quoter view: `GET /rfq/data/quoter/quotes` (quotes created by the authenticated user)

Both endpoints support the same query parameters and return the same response shape.**Query Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `offset` | string | Pagination cursor (base64-encoded integer). Default `"MA=="` (0) |
| `limit` | number | Max quotes to return. Default 50, max 100 |
| `state` | string | Optional: `active` or `inactive`. If omitted: no state filter. Invalid values return 400 |
| `quoteIds` | string[] | Repeatable RFQ quote IDs (UUIDs). Invalid UUIDs are dropped |
| `requestIds` | string[] | Repeatable RFQ request IDs (UUIDs). Invalid UUIDs are dropped |
| `markets` | string[] | Repeatable condition IDs (must be `0x` \+ 64 hex chars) |
| `sizeMin` | number | Minimum size in tokens |
| `sizeMax` | number | Maximum size in tokens |
| `sizeUsdcMin` | number | Minimum size in USDC |
| `sizeUsdcMax` | number | Maximum size in USDC |
| `priceMin` | number | Minimum price |
| `priceMax` | number | Maximum price |
| `sortBy` | string | `price`, `expiry`, or `created` (default `created`) |
| `sortDir` | string | `asc` (default) or `desc` |

**Response**

```
{
  "data": [
    {
      "quoteId": "0196f484-9fbd-74c1-bfc1-75ac21c1cf84",
      "requestId": "01968f1e-1182-71c4-9d40-172db9be82af",
      "userAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
      "proxyAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
      "condition": "0x37a6a2dd9f3469495d9ec2467b0a764c5905371a294ce544bc3b2c944eb3e84a",
      "token": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
      "complement": "32868290514114487320702931554221558599637733115139769311383916145370132125101",
      "side": "BUY",
      "sizeIn": 100,
      "sizeOut": 50,
      "price": 0.5,
      "matchType": "COMPLEMENTARY",
      "state": "STATE_REQUEST_QUOTED"
    }
  ],
  "next_cursor": "LTE=",
  "limit": 100,
  "count": 1
}
```

* * *

### Get Best Quote

`GET /rfq/data/best-quote`Gets the best (most competitive) quote for a given RFQ request.**Query Parameters**

| Parameter | Type | Description |
| --- | --- | --- |
| `requestId` | string | The RFQ request ID |

**Response**

```
{
  "quoteId": "0196f484-9fbd-74c1-bfc1-75ac21c1cf84",
  "requestId": "01968f1e-1182-71c4-9d40-172db9be82af",
  "userAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
  "proxyAddress": "0x6e0c80c90ea6c15917308f820eac91ce2724b5b5",
  "condition": "0x37a6a2dd9f3469495d9ec2467b0a764c5905371a294ce544bc3b2c944eb3e84a",
  "token": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  "complement": "32868290514114487320702931554221558599637733115139769311383916145370132125101",
  "side": "SELL",
  "sizeIn": 50,
  "sizeOut": 100,
  "price": 0.5,
  "matchType": "COMPLEMENTARY",
  "state": "STATE_REQUEST_QUOTED"
}
```

* * *

## Execution Endpoints

### Accept Quote

`POST /rfq/request/accept`Requester accepts an RFQ Quote. This creates an Order that the Requester must sign.**Request Body**

```
{
  "requestId": "0196a1be-8970-7a86-9324-febf0ad6f687",
  "quoteId": "0196a1be-8970-7a86-9324-febf0ad6f687",
  "maker": "0x08bba123175624693bd2c6bea754e8f1211accec",
  "signer": "0xb2e5677625a2d9fc6be4667da890acfd98167bd3",
  "taker": "0x25d7777e23e64e583bdc3172fedc636c13b0a1ff",
  "expiration": 1749149567,
  "nonce": "1",
  "feeRateBps": "0",
  "side": "BUY",
  "tokenId": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  "makerAmount": "100000000",
  "takerAmount": "200000000",
  "signatureType": 0,
  "signature": "0x123123123123123123123123123123123123123123123123",
  "salt": 12312312312,
  "owner": "5d1c266a-ed39-b9bd-c1f5-f24ae3e14a7b"
}
```

| Field | Type | Description |
| --- | --- | --- |
| `requestId` | string | ID of the Request |
| `quoteId` | string | ID of the Quote being accepted |
| `makerAmount` | string | Maker’s amount in base units |
| `takerAmount` | string | Taker’s amount in base units |
| `tokenId` | string | Outcome token ID |
| `maker` | string | Maker’s address |
| `signer` | string | Signer’s address |
| `taker` | string | Taker’s address |
| `nonce` | string | Order nonce |
| `expiration` | number | Unix timestamp for order expiration |
| `side` | string | `BUY` or `SELL` |
| `feeRateBps` | string | Fee rate in basis points |
| `signature` | string | EIP-712 signature |
| `signatureType` | number | Signature type (`0` = EOA, `1` = POLY_PROXY, `2` = POLY_GNOSIS_SAFE) |
| `salt` | number | Random salt for order uniqueness |
| `owner` | string | Owner identifier |

**Response**

```
OK
```

* * *

### Approve Order

`POST /rfq/quote/approve`Quoter approves an RFQ order during the last look window. This queues the order for onchain execution.**Request Body**

```
{
  "requestId": "0196a1be-8970-7a86-9324-febf0ad6f687",
  "quoteId": "0196a1be-8970-7a86-9324-febf0ad6f687",
  "maker": "0x08bba123175624693bd2c6bea754e8f1211accec",
  "signer": "0xb2e5677625a2d9fc6be4667da890acfd98167bd3",
  "taker": "0x25d7777e23e64e583bdc3172fedc636c13b0a1ff",
  "expiration": 1749149567,
  "nonce": "1",
  "feeRateBps": "0",
  "side": "BUY",
  "tokenId": "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  "makerAmount": "100000000",
  "takerAmount": "200000000",
  "signatureType": 0,
  "signature": "0x123123123123123123123123123123123123",
  "salt": 1231312313,
  "owner": "5d1c266a-ed39-b9bd-c1f5-f24ae3e14a7b"
}
```

**Response**

```
{
  "tradeIds": ["019af0f7-eb77-764f-b40f-6de8a3562e12"]
}
```

* * *

## See Also

[**RFQ Overview**
Concepts, lifecycle, and state transitions](https://docs.polymarket.com/developers/market-makers/rfq/overview) [**CLOB Authentication**
Set up L2 API credentials](https://docs.polymarket.com/developers/CLOB/authentication)
