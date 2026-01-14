---
url: "https://docs.polymarket.com/polymarket-learn/trading/how-are-prices-calculated"
title: "How Are Prices Calculated? - Polymarket Documentation"
---

# How Are Prices Calculated?

The prices probabilities displayed on Polymarket are the midpoint of the bid-ask spread in the orderbook.

## Initial Price

- When a market is created, there are initially zero shares and no pre-defined prices or odds.
- Market makers (a fancy term for traders placing limit orders) interested in buying YES or NO shares can place [Limit Orders](https://docs.polymarket.com/polymarket-learn/trading/limit-orders) at the price they’re willing to pay
- When offers for the YES and NO side equal $1.00, the order is “matched” and that $1.00 is converted into 1 YES and 1 NO share, each going to their respective buyers.

For example, if you place a limit order at $0.60 for YES, that order is matched when someone places a NO order at $0.40. _This becomes the initial market price._

## Future Price

The prices displayed on Polymarket are the midpoint of the bid-ask spread in the orderbook — unless that spread is over $0.10, in which case the last traded price is used. Like the stock market, prices on Polymarket are a function of realtime supply & demand.

### Prices = Probabilities

In the market below, the probability of 37% is the midpoint between the 34¢ bid and 40¢ ask. If the bid-ask spread is wider than 10¢, the probability is shown as the last traded price.

![](https://polymarket-upload.s3.us-east-2.amazonaws.com/how_are_prices_calculated.png)

You may not be able to buy shares at the displayed probability / price because there is a bid-ask spread. In the above example, a trader wanting to buy shares would pay 40¢ for up to 4,200 shares, after which the price would rise to 43¢.

[How Are Markets Created?](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-created) [How Are Prediction Markets Resolved?](https://docs.polymarket.com/polymarket-learn/markets/how-are-markets-resolved)
