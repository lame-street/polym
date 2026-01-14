---
url: "https://docs.polymarket.com/api-reference/bridge/get-deposit-status"
title: "Get deposit status - Polymarket Documentation"
---

# Get deposit status

Get the transaction status for all deposits associated with a given deposit address.

**Usage:**

- Use the deposit address returned from the `/deposit` endpoint (EVM, SVM, or BTC address)
- Poll this endpoint to track the progress of your deposits

**Status Values:**

- `DEPOSIT_DETECTED`: Deposit detected but not yet processing
- `PROCESSING`: Transaction is being routed and swapped
- `ORIGIN_TX_CONFIRMED`: Origin transaction has been confirmed on source chain
- `SUBMITTED`: Transaction has been submitted to destination chain
- `COMPLETED`: Transaction completed successfully
- `FAILED`: Transaction encountered an error and did not complete

**Notes:**

- Transactions typically complete within a few minutes, but may take longer depending on network conditions
- An empty transactions array means no deposits have been made to this address yet

GET /status/{address}

cURL

```
curl --request GET \
  --url https://bridge.polymarket.com/status/{address}
```

Status codes: 200, 400, 500
```
{
  "transactions": [
    {
      "fromChainId": "1151111081099710",
      "fromTokenAddress": "11111111111111111111111111111111",
      "fromAmountBaseUnit": "13566635",
      "toChainId": "137",
      "toTokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "status": "DEPOSIT_DETECTED"
    },
    {
      "fromChainId": "1151111081099710",
      "fromTokenAddress": "11111111111111111111111111111111",
      "fromAmountBaseUnit": "13400000",
      "toChainId": "137",
      "toTokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "createdTimeMs": 1757646914535,
      "status": "PROCESSING"
    },
    {
      "fromChainId": "1151111081099710",
      "fromTokenAddress": "11111111111111111111111111111111",
      "fromAmountBaseUnit": "13500152",
      "toChainId": "137",
      "toTokenAddress": "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      "txHash": "3atr19NAiNCYt24RHM1WnzZp47RXskpTDzspJoCBBaMFwUB8fk37hFkxz35P5UEnnmWz21rb2t5wJ8pq3EE2XnxU",
      "createdTimeMs": 1757531217339,
      "status": "COMPLETED"
    }
  ]
}
```

#### Path Parameters
- address: string; required — The deposit address to query (EVM, SVM, or BTC address from the `/deposit` response)
#### Response
200 application/json Successfully retrieved transaction status
- transactions: object[] — List of transactions for the given address
