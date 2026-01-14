---
url: "https://docs.polymarket.com/developers/CLOB/orders/check-scoring"
title: "Check Order Reward Scoring - Polymarket Documentation"
---

# Check Order Reward Scoring

Check if an order is eligble or scoring for Rewards purposes

This endpoint requires a L2 Header.

Returns a boolean value where it is indicated if an order is scoring or not.**HTTP REQUEST**`GET /<clob-endpoint>/order-scoring?order_id={...}`

### Request Parameters

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| orderId | yes | string | id of order to get information about |

### Response Format

| Name | Type | Description |
| --- | --- | --- |
| null | OrdersScoring | order scoring data |

An `OrdersScoring` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| scoring | boolean | indicates if the order is scoring or not |

# Check if some orders are scoring

> This endpoint requires a L2 Header.

Returns to a dictionary with boolean value where it is indicated if an order is scoring or not.**HTTP REQUEST**`POST /<clob-endpoint>/orders-scoring`

### Request Parameters

| Name | Required | Type | Description |
| --- | --- | --- | --- |
| orderIds | yes | string[] | ids of the orders to get information about |

### Response Format

| Name | Type | Description |
| --- | --- | --- |
| null | OrdersScoring | orders scoring data |

An `OrdersScoring` object is a dictionary that indicates the order by if it score.

[Get Active Orders](https://docs.polymarket.com/developers/CLOB/orders/get-active-order) [Cancel Orders(s)](https://docs.polymarket.com/developers/CLOB/orders/cancel-orders)
