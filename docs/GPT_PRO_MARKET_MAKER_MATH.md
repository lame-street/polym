I’m going to pull the exact on-paper Polymarket scoring math from your local docs, then cross-reference it with publicly available dYdX LP rewards history (distributions/addresses/amounts) so we can build a numerical “capital → score share → rewards → ROI” model and concrete examples.

[6 tools called]

I’m not yet seeing primary-source dYdX payout datasets in the results, so I’m going to broaden with more targeted queries (Merkle/CSV/GitHub) and also search your local Polymarket docs for any endpoint that exposes per-market reward pools so we can compute concrete ROI examples.

[6 tools called]

Next I’ll pull the missing Polymarket “user-facing liquidity rewards” doc from your workspace (it often includes concrete numbers and where to see reward pools), and I’ll directly target the canonical dYdX Foundation LP rewards page plus any public Merkle distribution artifacts so we can quantify payouts by address.

[5 tools called]

Now I’ll pull the missing Polymarket “Liquidity Rewards” and “Holding Rewards” docs from your workspace for any concrete numbers/endpoints, and I’ll keep tightening the dYdX search to find the exact Foundation post and any public epoch-by-epoch distribution artifacts.

[5 tools called]

To make the Polymarket side fully numerical (reward pool per market/day, required min size/spread), I’m going to locate the exact Markets/Gamma/CLOB API fields for incentives in your local docs. In parallel I’ll try one more targeted search for the dYdX Foundation post and any raw “claim/distribution” dataset so we can talk about who earned what beyond anecdotes.

[5 tools called]

I’ve found in your local Polymarket API docs the exact `rewardsMinSize`/`rewardsMaxSpread` fields we need to turn the Liquidity Rewards formula into a capital→score→USDC/day model. Next I’ll pull the relevant endpoint docs (`list-markets`, `check-scoring`) and then I’ll try to anchor the dYdX side with primary sources (Foundation/tokenomics/distributions) so the comparison is as numerical as possible.

[6 tools called]

Next I’ll pull the CLOB client “public methods” docs where `rewards` data is exposed, plus any Markets/Gamma endpoints that return the *actual reward pool amounts* (not just min size/spread). That’s the missing piece to turn the Polymarket math into concrete “deposit X → earn Y/day” examples.

[5 tools called]

We’ve confirmed the APIs expose the *eligibility parameters* (`rewardsMinSize`, `rewardsMaxSpread`) and the CLOB exposes a `rewards.rates` field, but I still haven’t surfaced a clearly documented endpoint that returns the *reward pool size per market/day*. I’m going to search the docs specifically for “rewards rates”, “epoch”, and any rewards-allocation endpoints so we can compute actual dollar returns rather than just relative shares.

[4 tools called]

### What you can *reliably* quantify from Polymarket docs (and what’s missing)
- **Polymarket Liquidity Rewards (LR)**: deterministic, formula-based scoring; **paid daily ~midnight UTC**; market-specific eligibility knobs (**`rewardsMinSize`**, **`rewardsMaxSpread`**) are exposed in public market data; the **$ reward pool per market** is visible in the UI (`polymarket.com/rewards` + orderbook tooltip), but I do **not** see a clearly documented public API field for the **pool size** in the docs you shared.
- **Polymarket Maker Rebates (MR)** (15‑minute crypto markets): **taker fees** fund a daily USDC rebate pool; docs include exact **fee curve table** + **rebate share schedule** (e.g., **100%** then **20%** in Jan 2026).
- **Polymarket Holding Rewards**: currently **4.00% annualized** on eligible markets, sampled hourly, paid daily.

Key primary-source excerpts:

```10:31:/Users/nilsl/Documents/PM/poly_docs_md_clean_v6_grouped/polymarket-learn/trading/holding-rewards.md
To keep long-term pricing accurate, we’re paying 4.00% annualized Holding Reward...
...randomly sampled once each hour, and the reward is distributed daily.
...
Total Position Value =→ `(30000 × 0.53) + (10000 × 0.45)`→ `$15,900 + $4,500 = $20,400`
Hourly Holding Reward Calculation... `$20400 × (0.04 / 365 / 24) ≈ $.09315068493`
```

```20:70:/Users/nilsl/Documents/PM/poly_docs_md_clean_v6_grouped/developers/market-makers/liquidity-rewards.md
This program is heavily inspired by dYdX’s liquidity provider rewards...
...Rewards are distributed directly to the maker’s addresses daily at midnight UTC.
...
c | scaling factor (currently 3.0 on all markets)
...
S(v,s)= ((v-s)/v)^2 ⋅ b
...
If midpoint is in range [0.10,0.90] allow single sided liq to score:
Qmin = max( min(Qone,Qtwo), max(Qone/c, Qtwo/c) )
If midpoint is in either range [0,0.10) or (.90,1.0] require liq to be double sided to score:
Qmin = min(Qone,Qtwo)
...
Both min_incentive_size and max_incentive_spread can be fetched alongside full market objects...
```

---

## 1) Polymarket Liquidity Rewards: the parts that determine your $/day

### 1.1 Scoring weight for a single order (this is the “tightness” engine)
Let:
- \(v\) = **max spread** from midpoint **in cents** (market param)
- \(s\) = your order’s distance from the (size-cutoff-adjusted) midpoint **in cents**
- \(b\) = multiplier (often 1 unless a market has boosts)

Then your per-order weight is:
\[
w(s)=\left(\frac{v-s}{v}\right)^2\cdot b
\]

**Numerical intuition (common case \(v=3\) cents, \(b=1\)):**
- At **1c** from mid: \(w=(2/3)^2=0.4444\)
- At **2c** from mid: \(w=(1/3)^2=0.1111\)
- So going from 1c → 2c is **4× worse** for rewards *at the same size*.

### 1.2 Two-sided vs one-sided (this is the “inventory discipline” engine)
For midpoints in \([0.10,0.90]\), one-sided liquidity still scores, but is penalized by **\(c=3\)** in the LR formula (effectively “up to ~3× worse” depending on your imbalance).

**Practical rule**:
- If you want to maximize LR, you generally want your quoting to be **as two-sided as possible** (balanced depth near mid), especially when midpoint is \(<0.10\) or \(>0.90\) where **one-sided may score ~0**.

### 1.3 Turning score share into dollars
For a given market \(m\) with daily reward pool \(R_m\) (USDC/day), your expected daily LR is:
\[
\text{LR}_m \approx R_m \cdot \frac{Q_m}{\sum_i Q_{m,i}}
\]
where \(Q_m\) is your (time-averaged) \(Q_{\min}\) for that market over the epoch/day.

**What you can observe/estimate in practice**
- \(R_m\): from the **Rewards UI / orderbook tooltip** (per docs).
- Your “is this order scoring?”: via **CLOB scoring endpoint** (`/order-scoring`, `/orders-scoring`) (useful for debugging eligibility, not for estimating \$).

---

## 2) Capital you must front on Polymarket (clean, numerical model)

### 2.1 Inventory mechanics that matter for capital
To market-make you often need:
- **USDCe cash** to post bids (buy YES/NO).
- **Outcome token inventory** to post asks (sell YES/NO).
- You can create inventory by **splitting**: splitting \(X\) USDCe yields **\(X\) YES + \(X\) NO** tokens (per market).

**Key capital efficiency fact (binary markets):**
If you want to be able to *sell* up to \(q_{\text{YES}}\) YES and \(q_{\text{NO}}\) NO, you do **not** need to split \(q_{\text{YES}}+q_{\text{NO}}\).
You need:
\[
X = \max(q_{\text{YES}}, q_{\text{NO}})
\]
because splitting \(X\) gives you \(X\) of each.

### 2.2 Minimal “steady quoting” capital for one market (back-of-envelope)
Assume midpoint \(p\) (in dollars), and you want to quote:
- Bid size \(q_b\) at price \(\approx p-\delta\)
- Ask size \(q_a\) (inventory) at price \(\approx p+\delta\)

A simple capital lower bound:
\[
C \gtrsim \underbrace{X}_{\text{split inventory}} + \underbrace{q_b\cdot(p-\delta)}_{\text{cash reserved for bids}} + \text{buffer}
\]
with \(X\approx q_a\) if you want to reliably post asks of that size.

**Typical at \(p\approx 0.50\)**:
- If you set \(q_a=q_b=q\), then \(C\) is roughly:
\[
C \approx q + 0.49q \approx 1.49q
\]
So **quoting 10,000 shares** both sides near 50c is roughly **\$15k** of tied-up capital (plus buffer).

---

## 3) Concrete Polymarket “deposit → reward → ROI” examples (formulas + numbers)

Below I’ll keep \(R_m\) and “competition” \(\sum Q\) explicit, because those are market- and day-dependent.

### Example A — How expensive is being 1c wide vs 2c wide?
Assume:
- \(v=3c\), \(b=1\)
- You quote symmetrically around mid (good two-sidedness)
- Your effective score in the market is roughly proportional to \(w\cdot q\)

Then:
- At **1c**, \(w=0.4444\)
- At **2c**, \(w=0.1111\)

To keep the same rewards at 2c vs 1c, you need:
\[
q_{2c}\approx 4\cdot q_{1c}
\]
So your required capital is also roughly **4×** higher (and your adverse-selection risk often rises because you’re less competitive / get picked off differently).

### Example B — Targeting a specific $/day from Liquidity Rewards
Assume a market has:
- daily pool \(R_m=\$1{,}000/\text{day}\)
- total competitive score \(\sum Q = 200{,}000\) (unknown; you infer from how hard it is to gain share)
- you quote at **1c** from mid with \(v=3c\), so \(w=0.4444\)

To earn \(\$100/\text{day}\) from LR in that market, you need score share \(=10\%\), i.e. \(Q\approx 20{,}000\).

If your score scales like \(Q \approx w\cdot q\), then required size:
\[
q \approx \frac{Q}{w} \approx \frac{20{,}000}{0.4444}\approx 45{,}000\ \text{shares}
\]

Approx capital at \(p\approx 0.50\):
- split inventory \(X\approx 45{,}000\) USDC
- bids cash \(\approx 45{,}000\cdot 0.49 \approx 22{,}000\) USDC
- total \(C\approx 67{,}000\) USDC (plus buffer)

**Implied ROI from LR alone**:
- \(\$100 / \$67{,}000 \approx 0.149\%\) per day
- \(\approx 4.5\%\) per 30-day month (ignoring compounding and inventory PnL)

This is the core takeaway: **LR is usually a “capital efficiency” game driven by (pool size) ÷ (competition) × (how tight you can quote).**

---

## 4) Maker Rebates on Polymarket (15‑minute crypto markets): the clean ROI math

From the fee table in `maker-rebates-program.md`, the *effective taker fee rate* peaks at **1.56%** at 50c.

Let:
- \(f(p)\) = taker fee rate at price \(p\) (e.g. \(f(0.50)=1.56\%\))
- \(\alpha\) = maker rebate share of fees (e.g. **20%** in Jan 12–18, 2026)
- \(V_{\text{taker}}\) = total taker volume in the market/day (USDC)
- \(s\) = your share of executed maker volume in that market/day

Then expected maker rebate:
\[
\text{MR} \approx \alpha \cdot f(p) \cdot V_{\text{taker}} \cdot s
\]

**Example (fully numerical):**
- Market trades \(V_{\text{taker}}=\$2{,}000{,}000/day\) around \(p\approx 0.50\)
- Fees collected \(\approx 1.56\%\cdot 2{,}000{,}000 = \$31{,}200/day\)
- Rebate share \(\alpha=20\%\Rightarrow\) rebate pool \(\approx \$6{,}240/day\)
- If you’re \(s=30\%\) of executed maker volume, you earn:
  \[
  \text{MR}\approx 0.30\cdot 6{,}240 = \$1{,}872/day
  \]

**Capital requirement depends on turnover**
Define turnover \(T = \frac{\text{executed maker volume}}{\text{capital}}\).
Then:
\[
\text{MR ROI/day} \approx \frac{\alpha f(p) \cdot V_{\text{taker}}\cdot s}{C} \approx \alpha f(p)\cdot T \cdot s_{\text{(vs other makers)}}
\]
So MR can be extremely profitable **if** you can safely sustain high turnover without getting adversely selected.

---

## 5) dYdX LP rewards vs Polymarket LR/MR: what “made money” historically (and what I can’t credibly name)

### 5.1 What’s clearly true about the *structure*
- **dYdX LP rewards**: token-denominated incentives (DYDX), historically epoch-based; similar objectives (tight spreads, depth, two-sided quoting). This token-based design adds **token price risk** (you can be “profitable in DYDX, unprofitable in USD” depending on sell timing).
- **Polymarket LR/MR**: **USDC** payouts (stable), daily cadence; this removes token price risk but makes ROI more directly a function of **pool sizes and competition**.

### 5.2 “Who made money, how much?” — the honest constraint
I can’t, from the sources returned here, produce a defensible table of **top dYdX LP-reward-earning addresses** with exact amounts/epochs (i.e., “Address X earned Y DYDX in Epoch Z”) without pulling:
- the official **Merkle distributions** (or claim contract events) per epoch, and
- DYDX spot prices at claim/sale times to turn that into USD PnL.

If you want, I can outline the exact dataset you’d need (and how to compute it), but I don’t have enough primary distribution data in the retrieved results to name “who” and “how much” with the standard you’re asking for.

### 5.3 How to compute “did anyone make real money?” for *Polymarket* today (auditable)
Polymarket exposes reward-related on-chain activity types via the Data API:
- `GET https://data-api.polymarket.com/activity?user=0x...&type=REWARD`
- `GET https://data-api.polymarket.com/activity?user=0x...&type=MAKER_REBATE`

(See `type` enum including `REWARD` and `MAKER_REBATE` in `get-user-activity.md`.)

This lets you build a factual leaderboard by:
1) collecting wallets of interest, 2) summing `usdcSize` for `REWARD` and `MAKER_REBATE`, 3) comparing to their deployed capital (which you approximate from balances + inventory).

---

## 6) How to maximize returns as a Polymarket market maker (high-signal checklist)

- **Maximize \(w(s)\)**: be as tight as possible within `rewardsMaxSpread`; 1c vs 2c is often a **4×** reward swing at equal size.
- **Be two-sided** (especially when mid \(<0.10\) or \(>0.90\)): otherwise your score can collapse due to the \(c=3\) penalty or the strict min() rule near extremes.
- **Exploit “competition pockets”**: ROI is driven by \(\frac{R_m}{\sum Q}\). A smaller pool with *far smaller competition* can dominate a huge pool with crowded makers.
- **Engineer capital efficiency**:
  - split only what you need: \(X=\max(q_{\text{YES}},q_{\text{NO}})\)
  - keep enough unsplit USDC for bids; avoid over-splitting.
- **Avoid adverse selection**: LR/MR can look great on paper but be dominated by getting picked off during information events (debates, court rulings, macro prints, etc.).
- **Use the scoring check endpoints** to confirm your orders are actually scoring (eligibility bugs are common early).

---

### If you want me to go “all the way” on the dYdX historical who/how-much question
Tell me which dYdX era you mean:
- **dYdX v3 (StarkEx, DYDX token incentives)** vs
- **dYdX Chain (v4) incentives / Surge seasons**,

and I’ll produce a *numerical pipeline* (contracts, event signatures, tables) to compute:
- DYDX earned per address per epoch,
- USD value under different sell assumptions (sell-on-claim, VWAP over \(N\) days, hold-to-date),
- net vs estimated MM trading PnL (fees/funding/slippage).

Right now, with the sources returned here, I can’t responsibly fabricate the “who earned exactly \$X” table you asked for.