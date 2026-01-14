---
url: "https://docs.polymarket.com/developers/CLOB/orders/get-active-order"
title: "Get Active Orders - Polymarket Documentation"
---

# Get Active Orders

This endpoint requires a L2 Header.

Get active order(s) for a specific market.**HTTP REQUEST**`GET /<clob-endpoint>/data/orders`

### Request Parameters

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| id | no | string | id of order to get information about |
| market | no | string | condition id of market |
| asset_id | no | string | id of the asset/token |

### Response Format

| Name | Type | Description |
| --- | --- | --- |
| null | OpenOrder[] | list of open orders filtered by the query parameters |

[Get Order](https://docs.polymarket.com/developers/CLOB/orders/get-order) [Check Order Reward Scoring](https://docs.polymarket.com/developers/CLOB/orders/check-scoring)
