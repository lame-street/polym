---
url: "https://docs.polymarket.com/developers/market-makers/liquidity-rewards"
title: "Liquidity Rewards - Polymarket Documentation"
---

# Liquidity Rewards

Polymarket provides incentives aimed at catalyzing the supply and demand side of the marketplace. Specifically there is a public liquidity rewards program as well as one-off public pnl/volume competitions.

## Overview

By posting resting limit orders, liquidity providers (makers) are automatically eligible for Polymarket’s incentive program. The overall goal of this program is to catalyze a healthy, liquid marketplace. We can further define this as creating incentives that:

- Catalyze liquidity across all markets
- Encourage liquidity throughout a market’s entire lifecycle
- Motivate passive, balanced quoting tight to a market’s mid-point
- Encourages trading activity
- Discourages blatantly exploitative behaviors

This program is heavily inspired by dYdX’s liquidity provider rewards which you can read more about [here](https://www.dydx.foundation/blog/liquidity-provider-rewards). In fact, the incentive methodology is essentially a copy of dYdX’s successful methodology but with some adjustments including specific adaptations for binary contract markets with distinct books, no staking mechanic a slightly modified order utility-relative depth function and reward amounts isolated per market. Rewards are distributed directly to the maker’s addresses daily at midnight UTC.

## Methodology

Polymarket liquidity providers will be rewarded based on a formula that rewards participation in markets (complementary consideration!), boosts two-sided depth (single-sided orders still score), and spread (vs. mid-market, adjusted for the size cutoff!). Each market still configure a max spread and min size cutoff within which orders are considered the average of rewards earned is determined by the relative share of each participant’s Qn in market m.

| Variable | Description |
| --- | --- |
| $ | order position scoring function |
| v | max spread from midpoint (in cents) |
| s | spread from size-cutoff-adjusted midpoint |
| b | in-game multiplier |
| m | market |
| m’ | market complement (i.e NO if m = YES) |
| n | trader index |
| u | sample index |
| c | scaling factor (currently 3.0 on all markets) |
| Qne | point total for book one for a sample |
| Qno | point total for book two for a sample |
| Spread% | distance from midpoint (bps or relative) for order n in market m |
| BidSize | share-denominated quantity of bid |
| AskSize | share-denominated quantity of ask |

## Equations

**Equation 1:**S(v,s)=(v−sv)2⋅bS(v,s)= (\\frac{v-s}{v})^2 \\cdot bS(v,s)=(vv−s​)2⋅b**Equation 2:**Qone=S(v,Spreadm1)⋅BidSizem1+S(v,Spreadm2)⋅BidSizem2+…Q_{one}= S(v,Spread_{m_1}) \\cdot BidSize_{m_1} + S(v,Spread_{m_2}) \\cdot BidSize_{m_2} + \\dots Qone​=S(v,Spreadm1​​)⋅BidSizem1​​+S(v,Spreadm2​​)⋅BidSizem2​​+…+S(v,Spreadm1′)⋅AskSizem1′+S(v,Spreadm2′)⋅AskSizem2′ \+ S(v, Spread_{m^\\prime_1}) \\cdot AskSize_{m^\\prime_1} + S(v, Spread_{m^\\prime_2}) \\cdot AskSize_{m^\\prime_2}+S(v,Spreadm1′​​)⋅AskSizem1′​​+S(v,Spreadm2′​​)⋅AskSizem2′​​**Equation 3:**Qtwo=S(v,Spreadm1)⋅AskSizem1+S(v,Spreadm2)⋅AskSizem2+…Q_{two}= S(v,Spread_{m_1}) \\cdot AskSize_{m_1} + S(v,Spread_{m_2}) \\cdot AskSize_{m_2} + \\dots Qtwo​=S(v,Spreadm1​​)⋅AskSizem1​​+S(v,Spreadm2​​)⋅AskSizem2​​+…+S(v,Spreadm1′)⋅BidSizem1′+S(v,Spreadm2′)⋅BidSizem2′ \+ S(v, Spread_{m^\\prime_1}) \\cdot BidSize_{m^\\prime_1} + S(v, Spread_{m^\\prime_2}) \\cdot BidSize_{m^\\prime_2}+S(v,Spreadm1′​​)⋅BidSizem1′​​+S(v,Spreadm2′​​)⋅BidSizem2′​​**Equation 4:****Equation 4a:**If midpoint is in range [0.10,0.90] allow single sided liq to score:Qmin⁡=max⁡(min⁡(Qone,Qtwo),max⁡(Qone/c,Qtwo/c))Q_{\\min} = \\max(\\min({Q_{one}, Q_{two}}), \\max(Q_{one}/c, Q_{two}/c))Qmin​=max(min(Qone​,Qtwo​),max(Qone​/c,Qtwo​/c))**Equation 4b:**If midpoint is in either range [0,0.10) or (.90,1.0] require liq to be double sided to score:Qmin⁡=min⁡(Qone,Qtwo)Q_{\\min} = \\min({Q_{one}, Q_{two}})Qmin​=min(Qone​,Qtwo​)**Equation 5:**Qnormal=Qmin∑n=1N(Qmin)nQ_{normal} = \\frac{Q_{min}}{\\sum_{n=1}^{N}{(Q_{min})_n}}Qnormal​=∑n=1N​(Qmin​)n​Qmin​​**Equation 6:**Qepoch=∑u=110,080(Qnormal)uQ_{epoch} = \\sum_{u=1}^{10,080}{(Q_{normal})_u}Qepoch​=∑u=110,080​(Qnormal​)u​**Equation 7:**Qfinal=Qepoch∑n=1N(Qepoch)nQ_{final}=\\frac{Q_{epoch}}{\\sum_{n=1}^{N}{(Q_{epoch})_n}}Qfinal​=∑n=1N​(Qepoch​)n​Qepoch​​

## Steps

1. Quadratic scoring rule for an order based on position between the adjusted midpoint and the minimum qualifying spread
2. Calculate first market side score. Assume a trader has the following open orders:

   - 100Q bid on m @0.49 (adjusted midpoint is 0.50 then spread of this order is 0.01 or 1c)
   - 200Q bid on m @0.48
   - 100Q ask on m’ @0.51

and assume an adjusted market midpoint of 0.50 and maxSpread config of 3c for both m and m’. Then the trader’s score is:Qne=((3−1)3)2⋅100+((3−2)3)2⋅200+((3−1)3)2⋅100Q_{ne} = \\left( \\frac{(3-1)}{3} \\right)^2 \\cdot 100 + \\left( \\frac{(3-2)}{3} \\right)^2 \\cdot 200 + \\left( \\frac{(3-1)}{3} \\right)^2 \\cdot 100Qne​=(3(3−1)​)2⋅100+(3(3−2)​)2⋅200+(3(3−1)​)2⋅100QneQ_{ne}Qne​ is calculated every minute using random sampling
3. Calculate second market side score. Assume a trader has the following open orders:

   - 100Q bid on m @0.485
   - 100Q bid on m’ @0.48
   - 200Q ask on m’ @0.505

and assume an adjusted market midpoint of 0.50 and maxSpread config of 3c for both m and m’. Then the trader’s score is:Qno=((3−1.5)3)2⋅100+((3−2)3)2⋅100+((3−.5)3)2⋅200Q_{no} = \\left( \\frac{(3-1.5)}{3} \\right)^2 \\cdot 100 + \\left( \\frac{(3-2)}{3} \\right)^2 \\cdot 100 + \\left( \\frac{(3-.5)}{3} \\right)^2 \\cdot 200Qno​=(3(3−1.5)​)2⋅100+(3(3−2)​)2⋅100+(3(3−.5)​)2⋅200QnoQ_{no}Qno​ is calculated every minute using random sampling
4. Boosts 2-sided liquidity by taking the minimum of QneQ_{ne}Qne​ and QnoQ_{no}Qno​, and rewards 1-side liquidity at a reduced rate (divided by c)Calculated every minute
5. QnormalQ_{normal}Qnormal​ is the QminQ_{min}Qmin​ of a market maker divided by the sum of all the QminQ_{min}Qmin​ of other market makers in a given sample
6. QepochQ_{epoch}Qepoch​ is the sum of all QnormalQ_{normal}Qnormal​ for a trader in a given epoch
7. QfinalQ_{final}Qfinal​ normalizes QepochQ_{epoch}Qepoch​ by dividing it by the sum of all other market maker’s QepochQ_{epoch}Qepoch​ in a given epoch this value is multiplied by the rewards available for the market to get a trader’s reward

Both min_incentive_size and max_incentive_spread can be fetched alongside full market objects via both the CLOB API and Markets API. Reward allocations for an epoch can be fetched via the Markets API.

[Trading](https://docs.polymarket.com/developers/market-makers/trading) [Maker Rebates Program](https://docs.polymarket.com/developers/market-makers/maker-rebates-program)
