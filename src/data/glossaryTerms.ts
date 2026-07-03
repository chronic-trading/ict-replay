/**
 * AUTO-GENERATED from ict-glossary/src/terms.ts — do not hand-edit.
 * Regenerate with: node scripts/export-terms.mjs (in the ict-glossary repo).
 * Powers inline glossary popups; kept in sync manually like brand.css.
 */

export interface GlossaryTerm {
  id: string
  term: string
  abbr?: string
  category: string
  definition: string
}

export const GLOSSARY_URL = 'https://chronic-trading.github.io/ict-glossary/'

export const GLOSSARY_CATEGORY_COLORS: Record<string, string> = {
  "Market Structure": "#34d399",
  "Liquidity": "#60a5fa",
  "Price Delivery": "#f59e0b",
  "Order Blocks": "#c084fc",
  "Sessions & Time": "#fb923c",
  "AMD & Bias": "#f472b6",
  "SMC & Models": "#14b8a6"
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    "id": "market-structure",
    "term": "Market Structure",
    "category": "Market Structure",
    "definition": "The framework of swing highs and swing lows that defines the directional bias of price. Bullish market structure consists of higher highs and higher lows. Bearish market structure consists of lower lows and lower highs. ICT reads market structure across multiple timeframes to determine institutional intent."
  },
  {
    "id": "break-of-structure",
    "term": "Break of Structure",
    "abbr": "BOS",
    "category": "Market Structure",
    "definition": "When price breaks a previous swing high (in an uptrend) or swing low (in a downtrend), confirming continuation of the current trend. A BOS is a structural continuation signal — price is expanding in the direction of the prevailing higher timeframe bias."
  },
  {
    "id": "change-of-character",
    "term": "Change of Character",
    "abbr": "ChoCH",
    "category": "Market Structure",
    "definition": "A break of the most recent swing low in a bullish trend (or swing high in a bearish trend) that signals a potential reversal. Unlike a BOS which confirms continuation, a ChoCH suggests the market may be shifting direction. Used to identify the beginning of a new phase."
  },
  {
    "id": "market-structure-shift",
    "term": "Market Structure Shift",
    "abbr": "MSS",
    "category": "Market Structure",
    "definition": "A decisive break of a significant swing point accompanied by displacement (a strong impulsive move), indicating that institutional players have stepped in and shifted market direction. More significant than a standard ChoCH because of the velocity and magnitude of the move."
  },
  {
    "id": "swing-high",
    "term": "Swing High",
    "category": "Market Structure",
    "definition": "A candle whose high is higher than the highs of the candles immediately to its left and right. Swing highs form the upper boundary of market structure and act as areas where buy side liquidity rests above. ICT uses the fractal definition: a confirmed swing high requires at least two lower highs on each side."
  },
  {
    "id": "swing-low",
    "term": "Swing Low",
    "category": "Market Structure",
    "definition": "A candle whose low is lower than the lows of the candles immediately to its left and right. Swing lows form the lower boundary of market structure and act as areas where sell side liquidity rests below. A confirmed swing low requires at least two higher lows on each side."
  },
  {
    "id": "equal-highs",
    "term": "Equal Highs",
    "abbr": "EQH",
    "category": "Market Structure",
    "definition": "Two or more swing highs at approximately the same price level. Equal highs are a strong liquidity magnet because retail traders place buy stops above them expecting a breakout. ICT expects price to sweep above EQH before reversing or continuing."
  },
  {
    "id": "equal-lows",
    "term": "Equal Lows",
    "abbr": "EQL",
    "category": "Market Structure",
    "definition": "Two or more swing lows at approximately the same price level. Equal lows pool sell side liquidity below them as retail traders place sell stops there. Price is expected to sweep below EQL to run those stops before moving higher."
  },
  {
    "id": "relative-equal-highs",
    "term": "Relative Equal Highs",
    "abbr": "REH",
    "category": "Market Structure",
    "definition": "Highs that are close to the same price but not perfectly aligned. They still attract stop orders from retail traders and function as a liquidity target, though less precisely than perfect equal highs. ICT treats REH as a softer draw on liquidity."
  },
  {
    "id": "relative-equal-lows",
    "term": "Relative Equal Lows",
    "abbr": "REL",
    "category": "Market Structure",
    "definition": "Lows that are close but not perfectly equal. They still represent a liquidity pool and act as a draw on price. ICT uses these as targets when seeking stop runs below recent structure, though they carry slightly less significance than exact equal lows."
  },
  {
    "id": "price-leg",
    "term": "Price Leg",
    "category": "Market Structure",
    "definition": "A single directional segment of price movement between two swing points. A bullish price leg moves from a swing low to the next swing high. Legs are used to measure the proportionality of price delivery and to apply Fibonacci tools. Institutional price legs tend to be clean, impulsive, and followed by measured retracements."
  },
  {
    "id": "anchor-point",
    "term": "Anchor Point",
    "category": "Market Structure",
    "definition": "A significant price level used as the starting reference for Fibonacci, premium/discount, and structural analysis. ICT anchors Fibonacci from the most recent significant swing high or low created by a displacement move. Choosing the correct anchor point is critical — wrong anchoring gives inaccurate OTE zones and misframes the trade."
  },
  {
    "id": "price-discovery",
    "term": "Price Discovery",
    "category": "Market Structure",
    "definition": "When price moves beyond all previous reference highs or lows into territory where no prior trading has occurred. Price discovery moves often accelerate quickly due to the absence of opposing orders — there is a low resistance liquidity run into new territory. ICT views price discovery as a signal of institutional directional conviction."
  },
  {
    "id": "failure-swing",
    "term": "Failure Swing",
    "category": "Market Structure",
    "definition": "When price fails to create a new swing high (in an uptrend) or new swing low (in a downtrend), signaling structural weakness before an official structure break occurs. A failure swing is an early warning — momentum is deteriorating before the official ChoCH or BOS forms. Often combined with SMT divergence for high-probability reversal signals."
  },
  {
    "id": "fractal",
    "term": "ICT Fractal",
    "category": "Market Structure",
    "definition": "A 5-candle pattern where the middle (third) candle has a higher high than the two candles on each side (bullish fractal high) or a lower low than the two candles on each side (bearish fractal low). Fractals are ICT's precise definition of swing highs and lows — a confirmed fractal defines the structural swing point used for market structure analysis."
  },
  {
    "id": "msb",
    "term": "Market Structure Break",
    "abbr": "MSB",
    "category": "Market Structure",
    "definition": "An aggressive, often gapped break of a significant structural level accompanied by a large displacement candle. Unlike a standard BOS which merely closes beyond a level, an MSB breaks with such force that it often creates a Fair Value Gap at the break point itself. MSBs signal institutional urgency and carry more weight than typical structure breaks."
  },
  {
    "id": "liquidity",
    "term": "Liquidity",
    "category": "Liquidity",
    "definition": "Orders resting in the market — specifically stop loss orders and limit orders that have not been triggered yet. ICT views price delivery as a process of seeking and collecting liquidity. Institutions need massive order flow to execute their positions, so price gravitates toward areas where many orders are clustered."
  },
  {
    "id": "buy-side-liquidity",
    "term": "Buy Side Liquidity",
    "abbr": "BSL",
    "category": "Liquidity",
    "definition": "Buy stop orders resting above swing highs, equal highs, and obvious resistance levels. When retail traders short at resistance, they place stops above the highs — this creates a pool of buy orders. Smart money drives price up to sweep these stops (triggering buy orders they can sell into) before reversing lower."
  },
  {
    "id": "sell-side-liquidity",
    "term": "Sell Side Liquidity",
    "abbr": "SSL",
    "category": "Liquidity",
    "definition": "Sell stop orders resting below swing lows, equal lows, and obvious support levels. Retail longs place stops below support — smart money drives price down to trigger those stops (creating sell orders they can buy against) before reversing higher."
  },
  {
    "id": "liquidity-pool",
    "term": "Liquidity Pool",
    "category": "Liquidity",
    "definition": "A concentration of resting orders at a specific price level or zone. The larger the pool (more stop orders clustered), the stronger the draw on price. Identified by obvious swing points, equal highs/lows, and areas where many retail traders would logically place stops."
  },
  {
    "id": "liquidity-sweep",
    "term": "Liquidity Sweep",
    "category": "Liquidity",
    "definition": "When price temporarily moves beyond a key level to trigger resting orders, then reverses. The sweep is often a single candle or wick that pierces the level. ICT looks for displacement after the sweep as confirmation that institutional orders have been filled and the real move is beginning."
  },
  {
    "id": "stop-hunt",
    "term": "Stop Hunt",
    "category": "Liquidity",
    "definition": "A deliberate engineered move by smart money to trigger retail stop loss orders clustered at predictable levels. Once stops are triggered, the engineered move reverses and the real directional move begins. Stop hunts are not random — they are a systematic feature of how smart money accumulates or distributes positions."
  },
  {
    "id": "draw-on-liquidity",
    "term": "Draw on Liquidity",
    "abbr": "DOL",
    "category": "Liquidity",
    "definition": "The target that price is being pulled toward — the next significant pool of liquidity above or below current price. Identifying the DOL gives a trader a directional bias and a logical profit target. Price is always delivering toward the nearest significant liquidity pool in the direction of the HTF bias."
  },
  {
    "id": "liquidity-void",
    "term": "Liquidity Void",
    "category": "Liquidity",
    "definition": "A price area that was traversed so quickly that very little trading occurred there — essentially a void of orders. Price tends to return to fill these voids as the market seeks to create two-sided trading at every level. Similar to a Fair Value Gap but used in a broader context."
  },
  {
    "id": "inducement",
    "term": "Inducement",
    "category": "Liquidity",
    "definition": "A minor liquidity pool deliberately engineered to pull retail traders into a trade in the wrong direction before the real move. Inducement is the bait — price sweeps a small high or low to induce retail entries, before reversing toward the actual target. Recognizing inducement prevents entering too early."
  },
  {
    "id": "irl-erl",
    "term": "Internal / External Range Liquidity",
    "abbr": "IRL / ERL",
    "category": "Liquidity",
    "definition": "Internal Range Liquidity (IRL) refers to liquidity pools within the current dealing range — equal highs, equal lows, and FVGs between the swing high and swing low. External Range Liquidity (ERL) refers to liquidity beyond the swing structure. Price delivers from IRL to ERL and vice versa."
  },
  {
    "id": "liquidity-run",
    "term": "Liquidity Run",
    "category": "Liquidity",
    "definition": "A sustained directional move that systematically sweeps multiple liquidity pools in sequence. Unlike a single liquidity sweep, a liquidity run is a multi-leg move where price takes one pool of stops, pauses briefly, then continues to the next. Used to identify when a trend has institutional backing."
  },
  {
    "id": "engineered-liquidity",
    "term": "Engineered Liquidity",
    "category": "Liquidity",
    "definition": "A deliberate institutional maneuver to create conditions where retail traders will place stops in a predictable location, which can then be swept. Engineered liquidity is the purposeful construction of a price pattern (equal highs, a false breakout, an obvious level) designed to attract retail orders that institutions can trade against."
  },
  {
    "id": "low-resistance-liquidity-run",
    "term": "Low Resistance Liquidity Run",
    "abbr": "LRLR",
    "category": "Liquidity",
    "definition": "A rapid, nearly uninterrupted price move through an area with very few opposing orders — like an area of imbalance or a void. Price moves through LRLR zones quickly with minimal pullback. Identifying LRLR zones helps traders understand why price sometimes accelerates through certain areas without pausing."
  },
  {
    "id": "trendline-liquidity",
    "term": "Trendline Liquidity",
    "category": "Liquidity",
    "definition": "Stop loss orders clustered along a visible trendline drawn by retail traders. As price approaches a well-known trendline, stops accumulate in a predictable pattern. ICT expects price to pierce the trendline to sweep these stops before reversing — trendlines are drawn for retail, broken for institutions."
  },
  {
    "id": "liquidity-grab",
    "term": "Liquidity Grab",
    "category": "Liquidity",
    "definition": "An ultra-fast spike to a liquidity level that is immediately reversed within the same candle or the very next candle. Unlike a sustained liquidity sweep, a grab is near-instantaneous — the wick grabs the stops and price snaps back violently, indicating institutional absorption of those orders."
  },
  {
    "id": "raid",
    "term": "Institutional Raid",
    "category": "Liquidity",
    "definition": "A deliberate, aggressive institutional move specifically designed to quickly breach a major liquidity level, collect the available stop orders, then reverse. Unlike a gradual stop hunt, a raid is swift and decisive — a large candle that pierces through multiple stop clusters before violently reversing direction."
  },
  {
    "id": "two-way-flow",
    "term": "Two-Way Liquidity Flow",
    "category": "Liquidity",
    "definition": "A session where price sweeps both buy-side liquidity (above swing highs) and sell-side liquidity (below swing lows) before establishing the true directional move. Two-way flow is characteristic of high-volatility days and FOMC sessions. ICT traders wait for the two-way sweep to complete before committing to a directional bias."
  },
  {
    "id": "fair-value-gap",
    "term": "Fair Value Gap",
    "abbr": "FVG",
    "category": "Price Delivery",
    "definition": "A three-candle formation where there is a gap between the wick of the first candle and the wick of the third candle, with no overlap. This represents an imbalance in price delivery — price moved so fast in one direction that both sides of the market were not represented. FVGs act as magnets for price to return and rebalance."
  },
  {
    "id": "sibi",
    "term": "Sell Side Imbalance / Buy Side Inefficiency",
    "abbr": "SIBI",
    "category": "Price Delivery",
    "definition": "A bearish Fair Value Gap — a downside imbalance where the high of the third candle does not reach the low of the first candle. Price left an inefficiency on the way down. These act as resistance when price returns to them from below and are used as entry areas in bearish scenarios."
  },
  {
    "id": "bisi",
    "term": "Buy Side Imbalance / Sell Side Inefficiency",
    "abbr": "BISI",
    "category": "Price Delivery",
    "definition": "A bullish Fair Value Gap — an upside imbalance where the low of the third candle does not reach the high of the first candle. Price left an inefficiency on the way up. These act as support when price returns from above and are entry areas in bullish scenarios."
  },
  {
    "id": "displacement",
    "term": "Displacement",
    "category": "Price Delivery",
    "definition": "A strong, impulsive one-directional price move that leaves behind Fair Value Gaps and breaks market structure with authority. Displacement is the signature of institutional order flow entering the market. It is the most important confirmation that real directional intent is present."
  },
  {
    "id": "imbalance",
    "term": "Imbalance",
    "category": "Price Delivery",
    "definition": "Any area where price moved so quickly that only one side of the market (buyers or sellers) participated. Imbalances represent inefficiencies that the market tends to revisit to allow the other side to trade. All Fair Value Gaps are imbalances, but not all imbalances are FVGs."
  },
  {
    "id": "rebalancing",
    "term": "Rebalancing",
    "category": "Price Delivery",
    "definition": "When price returns to fill an imbalance or FVG, allowing two-sided trading to occur at that level. Rebalancing is normal market behavior and is often where ICT traders look for entries — price returns to the imbalance, fills it, then continues in the original direction."
  },
  {
    "id": "premium-discount",
    "term": "Premium / Discount",
    "category": "Price Delivery",
    "definition": "The concept of price being expensive (premium) or cheap (discount) relative to a defined range. Above the 50% equilibrium of a swing range is premium — where sellers look to sell. Below 50% is discount — where buyers look to buy. ICT buys in discount and sells in premium."
  },
  {
    "id": "equilibrium",
    "term": "Equilibrium",
    "abbr": "EQ",
    "category": "Price Delivery",
    "definition": "The 50% midpoint of any defined price range (swing high to swing low). Equilibrium represents fair value. ICT looks to buy below EQ (in discount) and sell above EQ (in premium). Often used with the 50% level of a Fibonacci retracement."
  },
  {
    "id": "ote",
    "term": "Optimal Trade Entry",
    "abbr": "OTE",
    "category": "Price Delivery",
    "definition": "A Fibonacci-based entry zone between the 61.8% and 79% retracement levels of a displacement move. After a strong impulse (displacement), price often retraces into the OTE zone before continuing. This provides a high-probability entry with favorable risk-to-reward. ICT considers this the golden zone for entries."
  },
  {
    "id": "fibonacci",
    "term": "Fibonacci Retracement",
    "category": "Price Delivery",
    "definition": "ICT uses specific Fibonacci levels to identify premium/discount zones and optimal entries. Key levels: 50% (equilibrium), 61.8% (OTE entry), 70.5%, 79% (deep OTE), 88.6% (last level before invalidation). Applied from swing low to swing high in bullish moves, and swing high to swing low in bearish moves."
  },
  {
    "id": "pd-array",
    "term": "PD Array",
    "abbr": "PDA",
    "category": "Price Delivery",
    "definition": "Premium / Discount Array — the hierarchy of ICT tools used to determine where price is likely to react. From highest to lowest significance: Old Highs/Lows, Liquidity Voids, Fair Value Gaps, Volume Imbalances, Order Blocks, Breaker Blocks, Mitigation Blocks, Propulsion Blocks, Rejection Blocks."
  },
  {
    "id": "volume-imbalance",
    "term": "Volume Imbalance",
    "category": "Price Delivery",
    "definition": "Similar to a Fair Value Gap but occurs within a single candle — the close of one candle and the open of the next candle leave a gap. Volume imbalances are less significant than FVGs but still act as potential support/resistance levels where price may pause or react."
  },
  {
    "id": "balanced-price-range",
    "term": "Balanced Price Range",
    "abbr": "BPR",
    "category": "Price Delivery",
    "definition": "When a bullish FVG and a bearish FVG overlap, creating a zone where both sides of the market have been represented. The overlap area is the balanced price range — a high-probability reaction zone. Price often reacts sharply from BPRs."
  },
  {
    "id": "retracement",
    "term": "Retracement",
    "category": "Price Delivery",
    "definition": "A temporary price move counter to the prevailing trend direction, typically into a premium or discount zone, before continuation. ICT expects retracements into OTE (61.8–79% Fibonacci), Fair Value Gaps, or Order Blocks before the next impulsive leg. A retracement is not a reversal — it is a pullback that provides institutional entry."
  },
  {
    "id": "expansion",
    "term": "Expansion",
    "category": "Price Delivery",
    "definition": "The phase of price delivery characterized by impulsive, one-directional movement away from a consolidation or retracement. Expansion creates Fair Value Gaps, breaks structure, and represents the distribution phase of the AMD cycle. High momentum, low retracement, strong close. Opposite of consolidation."
  },
  {
    "id": "consolidation",
    "term": "Consolidation",
    "category": "Price Delivery",
    "definition": "A period of balanced, range-bound price action where neither buyers nor sellers dominate. Consolidation is the accumulation phase of the AMD cycle. ICT traders avoid trading inside consolidation — they wait for the expansion that follows. Consolidation creates the range that will be swept in the manipulation phase."
  },
  {
    "id": "consequent-encroachment",
    "term": "Consequent Encroachment",
    "abbr": "CE",
    "category": "Price Delivery",
    "definition": "The exact 50% midpoint of a Fair Value Gap. Rather than targeting the full FVG, ICT teaches entering at the CE for tighter stops and better positioning. Price commonly reaches the CE of an FVG before continuing — the CE is where orders are most concentrated within the gap."
  },
  {
    "id": "inversion-fvg",
    "term": "Inversion Fair Value Gap",
    "abbr": "iFVG",
    "category": "Price Delivery",
    "definition": "A Fair Value Gap that has been fully mitigated — price has traded through it. Once violated, the iFVG inverts its polarity: a formerly bullish FVG becomes bearish resistance, and vice versa. Price frequently returns to iFVGs for entries against the original direction, making them powerful reversal zones."
  },
  {
    "id": "convergence",
    "term": "Convergence Zone",
    "category": "Price Delivery",
    "definition": "An area where multiple PD array tools (FVG + Order Block + OTE Fibonacci + prior swing) all align at the same price level. The confluence of multiple tools at one zone dramatically increases the probability of a reaction. ICT's highest probability setups occur where the most tools converge at the right time."
  },
  {
    "id": "retest",
    "term": "Retest",
    "category": "Price Delivery",
    "definition": "When price returns to a previously broken structure level, order block, or FVG after initially moving away from it. A retest is both a confirmation and an entry opportunity. A successful retest of a bullish order block (price returns, holds, continues up) provides a secondary entry with high confidence."
  },
  {
    "id": "creep",
    "term": "Price Creep",
    "category": "Price Delivery",
    "definition": "A slow, methodical, almost imperceptible price delivery in one direction, characterized by small candles with minimal volatility. Price creep is the opposite of displacement — instead of a fast move, price edges incrementally in one direction. Creep often precedes a significant impulsive move and indicates quiet institutional accumulation."
  },
  {
    "id": "compression",
    "term": "Price Compression",
    "category": "Price Delivery",
    "definition": "A period of contracting range and reducing volatility that typically precedes an explosive directional move. Compression is similar to accumulation but specifically describes the tightening price action — candles becoming progressively smaller — immediately before a large move. ICT identifies compression zones as high-alert areas where a significant move is imminent."
  },
  {
    "id": "order-block",
    "term": "Order Block",
    "abbr": "OB",
    "category": "Order Blocks",
    "definition": "The last opposing candle before a significant move. A bullish order block is the last bearish candle before a bullish displacement — it represents where institutional buy orders were placed. A bearish order block is the last bullish candle before a bearish displacement. Price frequently returns to order blocks before continuing."
  },
  {
    "id": "breaker-block",
    "term": "Breaker Block",
    "category": "Order Blocks",
    "definition": "A former order block that has been violated — price has broken through it and the OB has failed. When a bullish OB fails (price falls through it), it becomes a bearish breaker. When a bearish OB fails (price rises through it), it becomes a bullish breaker. Breakers act as significant support/resistance levels."
  },
  {
    "id": "mitigation-block",
    "term": "Mitigation Block",
    "category": "Order Blocks",
    "definition": "An order block that has been partially mitigated — price has returned to it and absorbed some of the resting orders, but not fully broken through. After mitigation, the remaining orders at that level continue to act as support/resistance, often providing another entry opportunity."
  },
  {
    "id": "propulsion-block",
    "term": "Propulsion Block",
    "category": "Order Blocks",
    "definition": "A specific type of order block that forms within a strong trend, found in areas of rapid price movement. Propulsion blocks indicate continuation rather than reversal and are used to find entries in the direction of the prevailing trend after a pullback. They sit mid-leg within an expansion move."
  },
  {
    "id": "rejection-block",
    "term": "Rejection Block",
    "category": "Order Blocks",
    "definition": "A candle with a significant wick that shows strong rejection of a price level. The wick itself represents an area where orders were present. ICT uses rejection blocks as potential entry areas — when price returns to the upper portion of the wick, it may find support or resistance."
  },
  {
    "id": "institutional-candle",
    "term": "Institutional Candle",
    "category": "Order Blocks",
    "definition": "A large, decisive candle that represents significant institutional participation. These candles often form the basis of order blocks and displacements. Characterized by large bodies, minimal wicks, and occurring after liquidity has been swept. They signal directional conviction from smart money."
  },
  {
    "id": "void",
    "term": "Void",
    "category": "Order Blocks",
    "definition": "An area of price that was covered rapidly by an institutional candle or run of candles, leaving a void of resting orders. Voids represent one-sided markets and are targets for price to return to and fill with two-sided participation. The larger the void, the more likely price revisits it."
  },
  {
    "id": "point-of-origin",
    "term": "Point of Origin",
    "category": "Order Blocks",
    "definition": "The specific candle or zone where an impulsive institutional move began — the exact source of the directional order flow. The point of origin is often an order block or FVG at the start of a displacement. Price frequently returns to the point of origin to pick up remaining institutional orders before the next major move."
  },
  {
    "id": "reclaim",
    "term": "Level Reclaim",
    "category": "Order Blocks",
    "definition": "When price returns to and closes back above (or below) a level that was previously violated. A reclaim is the opposite of a clean break — if price breaks below support then closes back above it, the support level is reclaimed. ICT views level reclaims as potential reversal confirmations, especially when accompanied by displacement."
  },
  {
    "id": "kill-zones",
    "term": "Kill Zones",
    "category": "Sessions & Time",
    "definition": "Specific time windows during the trading day when institutional participation is highest and the highest probability ICT setups occur. The four kill zones are: Asian (7PM–11PM EST), London (2AM–5AM EST), New York AM (8:30AM–11AM EST), and New York PM (1:30PM–4PM EST)."
  },
  {
    "id": "asian-session",
    "term": "Asian Session",
    "category": "Sessions & Time",
    "definition": "The overnight trading window roughly 6PM–2AM EST (7PM–11PM kill zone). During Asia, price tends to consolidate and establish the high and low of the session (the Asia range). This range is a key reference for the London and New York sessions — London often sweeps one side of the Asia range."
  },
  {
    "id": "asia-range",
    "term": "Asia Range",
    "category": "Sessions & Time",
    "definition": "The high and low established during the Asian session. The Asia range high and low are key liquidity levels — buy stops sit above the high, sell stops sit below the low. London session frequently sweeps one side of the Asia range before reversing in the true direction of the day."
  },
  {
    "id": "london-kill-zone",
    "term": "London Kill Zone",
    "category": "Sessions & Time",
    "definition": "The 2AM–5AM EST window when London markets open. One of the highest probability windows for ICT setups. London frequently creates the Judas swing — sweeping one side of the Asia range to engineer liquidity before establishing the true directional move. Many daily high/low formations originate in London."
  },
  {
    "id": "ny-am-kill-zone",
    "term": "New York AM Kill Zone",
    "category": "Sessions & Time",
    "definition": "The 8:30AM–11AM EST window — the highest liquidity and most volatile session of the US trading day. Encompasses the NY open, economic data releases (8:30AM), and the first hour of full US participation. Many of the highest R-multiple ICT setups occur in this window."
  },
  {
    "id": "ny-pm-kill-zone",
    "term": "New York PM Kill Zone",
    "category": "Sessions & Time",
    "definition": "The 1:30PM–4PM EST window. After the NY lunch lull (12PM–1:30PM), the PM session often sees directional continuation or the day's second significant move. The 1:30PM macro and 3PM silver bullet are key windows within this kill zone."
  },
  {
    "id": "ny-lunch",
    "term": "NY Lunch",
    "category": "Sessions & Time",
    "definition": "The 12PM–1:30PM EST period when institutional participation drops significantly and retail/algorithmic trading dominates. Price action during lunch is choppy, unreliable, and often reverses the morning move. ICT strongly advises against trading during NY lunch."
  },
  {
    "id": "macro",
    "term": "Macro",
    "category": "Sessions & Time",
    "definition": "Specific 20-minute windows during the trading day when algorithmic price delivery is most predictable. Key macros: 8:50–9:10 AM, 9:50–10:10 AM, 10:50–11:10 AM, 1:10–1:30 PM, 2:10–2:30 PM, 3:15–4:00 PM EST. Within macros, ICT looks for the highest quality setups as algo behavior is most consistent."
  },
  {
    "id": "silver-bullet",
    "term": "Silver Bullet",
    "category": "Sessions & Time",
    "definition": "A specific ICT model that operates within defined time windows — 3–4AM, 10–11AM, or 2–3PM EST. The setup involves a liquidity sweep followed by an FVG entry in the direction of the bias. Named for its precision and high probability when the conditions align properly."
  },
  {
    "id": "fomc",
    "term": "FOMC",
    "category": "Sessions & Time",
    "definition": "Federal Open Market Committee announcements — the highest impact economic events in US markets. Released 8 times per year at 2PM EST. ICT advises staying out of the market around FOMC releases due to extreme volatility and unpredictable algorithmic behavior. FOMC sessions often see massive liquidity sweeps in both directions."
  },
  {
    "id": "true-day",
    "term": "True Day",
    "category": "Sessions & Time",
    "definition": "ICT's concept that the trading day begins at midnight (12:00 AM) rather than at the 6PM futures open. The true day high and low are measured from midnight, and reference points like Previous Day High/Low are calculated from this perspective."
  },
  {
    "id": "pdh-pdl",
    "term": "Previous Day High / Low",
    "abbr": "PDH / PDL",
    "category": "Sessions & Time",
    "definition": "The high and low of the previous trading day. These are key reference levels for the current day — buy stops rest above PDH, sell stops below PDL. ICT frequently uses PDH and PDL as liquidity targets and entry level references."
  },
  {
    "id": "pwh-pwl",
    "term": "Previous Week High / Low",
    "abbr": "PWH / PWL",
    "category": "Sessions & Time",
    "definition": "The high and low from the previous trading week. Significant liquidity pools — stops accumulate above and below these levels over the week. PWH and PWL are often weekly draw on liquidity targets and key reference levels for weekly bias analysis."
  },
  {
    "id": "pmh-pml",
    "term": "Previous Month High / Low",
    "abbr": "PMH / PML",
    "category": "Sessions & Time",
    "definition": "The high and low of the previous calendar month. Major liquidity levels that institutions reference. PMH and PML often serve as long-term draw on liquidity targets and help frame the monthly macro bias."
  },
  {
    "id": "ndog",
    "term": "New Day Opening Gap",
    "abbr": "NDOG",
    "category": "Sessions & Time",
    "definition": "The gap between the previous day's closing price (at midnight) and the opening price of the new day. NDOGs tend to be filled as the market seeks to rebalance the gap. ICT uses NDOGs as reference levels for intraday price delivery."
  },
  {
    "id": "nwog",
    "term": "New Week Opening Gap",
    "abbr": "NWOG",
    "category": "Sessions & Time",
    "definition": "The gap between Friday's closing price and Sunday's opening price in futures. NWOGs are significant reference levels that price often fills during the week. A bullish NWOG (gap up on open) suggests bullish bias; a bearish NWOG suggests bearish bias."
  },
  {
    "id": "opening-range-gap",
    "term": "Opening Range Gap",
    "abbr": "ORG",
    "category": "Sessions & Time",
    "definition": "A gap that forms at a session or market open between the previous close and new open. Opening range gaps create imbalances that the market typically seeks to fill. Used as reference levels and potential entry/target zones."
  },
  {
    "id": "cbdr",
    "term": "Central Bank Dealers Range",
    "abbr": "CBDR",
    "category": "Sessions & Time",
    "definition": "The price range established between 2:00 AM and 5:00 AM EST — the window before New York futures open. The CBDR high and low are key reference levels. A break above the CBDR high after 5AM is bullish; below the low is bearish. ICT uses the CBDR to frame the directional bias for the NY session."
  },
  {
    "id": "london-close",
    "term": "London Close",
    "category": "Sessions & Time",
    "definition": "The 11:00 AM–12:00 PM EST window when the London session officially closes. This often creates a brief counter-trend move as European institutions close positions before NY lunch. ICT warns against trading London close — it is a low-probability window characterized by choppy, reversing price action."
  },
  {
    "id": "midnight-open",
    "term": "Midnight Open",
    "category": "Sessions & Time",
    "definition": "The price level at exactly 12:00 AM (midnight) EST — the reference point ICT uses to define the true opening price of each trading day in futures. The midnight open acts as a magnet for price and a reference for determining whether the current day is trading premium or discount relative to where it opened."
  },
  {
    "id": "adr",
    "term": "Average Daily Range",
    "abbr": "ADR",
    "category": "Sessions & Time",
    "definition": "The average high-to-low range of a market over a defined period (typically 5–20 days). ICT uses the ADR to estimate how far price is likely to travel in a session and set realistic profit targets. If the ADR for ES is 30 points and price has already moved 25 points, the remaining expected range is limited."
  },
  {
    "id": "overnight-range",
    "term": "Overnight Range",
    "category": "Sessions & Time",
    "definition": "The high and low established during overnight hours (typically between NY close and London open, approximately 5PM–2AM EST). The overnight range creates reference levels for the London and NY sessions. Stops accumulate above and below the overnight range, making its extremes potential liquidity targets."
  },
  {
    "id": "optimal-time",
    "term": "Optimal Time to Trade",
    "abbr": "OTT",
    "category": "Sessions & Time",
    "definition": "ICT's time-based constraint that limits trade entries to specific windows of highest institutional participation. The optimal windows are: 7:00–8:00 AM (pre-market awareness), 8:30–11:00 AM (NY AM kill zone), and 1:30–4:00 PM (NY PM kill zone). Outside these windows, trade probability drops significantly."
  },
  {
    "id": "session-high-low",
    "term": "Session High / Low",
    "category": "Sessions & Time",
    "definition": "The highest and lowest prices traded during a specific market session (London, New York, Asian). Session highs and lows are dynamic reference levels that accumulate stop orders as the session progresses. The session high typically forms during the Judas swing and the session low during the true directional move (or vice versa in a bearish scenario)."
  },
  {
    "id": "amd",
    "term": "AMD Cycle",
    "category": "AMD & Bias",
    "definition": "Accumulation → Manipulation → Distribution. ICT's framework for understanding how smart money orchestrates price movement. Accumulation: institutions quietly build positions in a range. Manipulation: a false move (Judas swing) to trap retail traders and engineer liquidity. Distribution: the real directional move begins."
  },
  {
    "id": "accumulation",
    "term": "Accumulation",
    "category": "AMD & Bias",
    "definition": "The phase in the AMD cycle where institutions quietly build their position in a ranging market. Price appears choppy and directionless. Retail traders often lose money trying to trade the range. ICT identifies accumulation by the consolidating price action before a significant move."
  },
  {
    "id": "manipulation",
    "term": "Manipulation",
    "category": "AMD & Bias",
    "definition": "The engineered false move in the AMD cycle — designed to trap retail traders in the wrong direction and generate the liquidity needed for institutional distribution. The Judas swing and London sweep of the Asia range are classic manipulation phases. Manipulation is quickly reversed into the true direction."
  },
  {
    "id": "distribution",
    "term": "Distribution",
    "category": "AMD & Bias",
    "definition": "The true directional move in the AMD cycle — after accumulation and manipulation, institutions distribute their positions by driving price toward the draw on liquidity. Distribution is characterized by displacement and often forms the C leg of the Power of Three model."
  },
  {
    "id": "judas-swing",
    "term": "Judas Swing",
    "category": "AMD & Bias",
    "definition": "The deceptive opening move during London or NY sessions that traps retail traders in the wrong direction before the real move begins. Named for its betrayal of apparent direction. The Judas swing sweeps liquidity on one side before reversing aggressively in the opposite direction."
  },
  {
    "id": "power-of-three",
    "term": "Power of Three",
    "abbr": "Po3",
    "category": "AMD & Bias",
    "definition": "ICT's three-phase price delivery model: A (accumulation/consolidation) → B (manipulation/false move) → C (distribution/true move). Applied across all timeframes. On a daily chart: Asia consolidates (A), London manipulates (B), NY distributes (C). Understanding Po3 allows traders to identify which phase price is in."
  },
  {
    "id": "daily-bias",
    "term": "Daily Bias",
    "category": "AMD & Bias",
    "definition": "The expected directional tendency for the trading day, determined by analyzing HTF market structure, draw on liquidity, and the daily candle context. ICT determines daily bias before the session opens. A bullish daily bias means looking for buy setups during AM and PM kill zones; bearish means looking for shorts."
  },
  {
    "id": "weekly-profile",
    "term": "Weekly Profile",
    "category": "AMD & Bias",
    "definition": "The anticipated structure of the trading week based on HTF analysis. ICT identifies weekly profiles such as: Monday low for the week (bullish week — sell Monday, buy the rest), Monday high for the week (bearish week), or midweek reversal patterns. Weekly profiles help frame which days are likely to see highs and lows form."
  },
  {
    "id": "quarterly-shift",
    "term": "Quarterly Shift",
    "category": "AMD & Bias",
    "definition": "ICT's concept that markets shift macro direction every quarter (Q1–Q4). Each quarter has a specific seasonal tendency. Institutional money repositions at quarterly boundaries, often creating significant reversals at the beginning of new quarters. Part of ICT's broader seasonal tendencies framework."
  },
  {
    "id": "ipda",
    "term": "Interbank Price Delivery Algorithm",
    "abbr": "IPDA",
    "category": "AMD & Bias",
    "definition": "ICT's model for how price is algorithmically delivered between key reference points over time. The algorithm seeks liquidity pools in a defined look-back period (20, 40, or 60 trading days). IPDA looks back 20 days for short-term draws, 40 for intermediate, and 60 for longer-term institutional targets."
  },
  {
    "id": "dealing-range",
    "term": "Dealing Range",
    "category": "AMD & Bias",
    "definition": "A significant swing from a major swing low to a major swing high (or vice versa) that defines the current premium/discount context. ICT uses the dealing range to apply Fibonacci levels and identify where price is expensive or cheap relative to the institutional reference points."
  },
  {
    "id": "time-and-price",
    "term": "Time and Price",
    "category": "AMD & Bias",
    "definition": "ICT's two primary variables for anticipating market movement. Time refers to when setups should occur (kill zones, macros, session opens). Price refers to where price should trade (OTE, FVGs, order blocks). A valid ICT setup requires BOTH the right price level AND the right time window — either alone is insufficient."
  },
  {
    "id": "seasonal-tendencies",
    "term": "Seasonal Tendencies",
    "category": "AMD & Bias",
    "definition": "ICT's framework for anticipated directional bias based on calendar quarters and months. Historically, Q1 (Jan–Mar) tends to see significant directional moves, Q2 is often a reversal quarter, Q3 can be choppy, and Q4 sees year-end positioning. Monthly tendencies include typical turning points at the beginning and end of months."
  },
  {
    "id": "daily-profiles",
    "term": "Daily Profiles",
    "category": "AMD & Bias",
    "definition": "Specific repeating templates for how a trading day is structured based on the weekly bias. ICT identifies profiles such as: Classic (Monday low of week), Seek and Destroy (double stop hunt), Consolidation day (no directional bias), and Reversal day (prior trend ends). Recognizing which profile is developing helps traders avoid being on the wrong side."
  },
  {
    "id": "running-day",
    "term": "Running Day Profile",
    "category": "AMD & Bias",
    "definition": "A day where price establishes its high or low very early in the session, then trends in one direction for the rest of the day with minimal pullbacks. Running days are characterized by directional conviction, consistent new highs or lows throughout, and no significant reversal during the session. Identified by the absence of a Judas swing."
  },
  {
    "id": "propulsion-phase",
    "term": "Propulsion Phase",
    "category": "AMD & Bias",
    "definition": "The accelerating portion of an institutional move where momentum builds and price moves with increasing velocity. During the propulsion phase, candles grow in size, retracements become shallower, and FVGs form in quick succession. The propulsion phase signals full institutional commitment to the directional move."
  },
  {
    "id": "mtfa",
    "term": "Multiple Time Frame Analysis",
    "abbr": "MTFA",
    "category": "SMC & Models",
    "definition": "The practice of analyzing price across multiple timeframes to build a complete picture before executing a trade. ICT hierarchy: Monthly/Weekly for macro bias → Daily/4H for swing context → 1H for execution zones → 15m/5m for entry refinement. Higher timeframes always take precedence over lower timeframes."
  },
  {
    "id": "smt-divergence",
    "term": "SMT Divergence",
    "abbr": "SMT",
    "category": "SMC & Models",
    "definition": "Smart Money Technique Divergence — when two correlated markets (e.g., ES and NQ, or DXY and EUR/USD) fail to confirm each other's move. If ES makes a new high but NQ fails to — that divergence signals institutional non-participation and a potential reversal. SMT is a leading indicator of smart money positioning."
  },
  {
    "id": "unicorn-model",
    "term": "Unicorn Model",
    "category": "SMC & Models",
    "definition": "A specific ICT setup combining a market structure shift on a lower timeframe with a Fair Value Gap entry. A breaker block forms, price returns to the FVG within the breaker, and the trader enters with a tight stop. Considered one of ICT's highest probability patterns when all elements align."
  },
  {
    "id": "rally-base-drop",
    "term": "Rally Base Drop",
    "abbr": "RBD",
    "category": "SMC & Models",
    "definition": "A three-phase price pattern: Rally (price moves up) → Base (price consolidates, forming a bearish order block) → Drop (price falls sharply from the base). The base phase is where the bearish order block forms and is a key entry level on the return."
  },
  {
    "id": "rally-base-rally",
    "term": "Rally Base Rally",
    "abbr": "RBR",
    "category": "SMC & Models",
    "definition": "A bullish continuation pattern: Rally → Base (consolidation/pullback forming a bullish OB) → Rally (continuation). The base forms the bullish order block entry zone. ICT uses RBR structures to find continuation entries in trending markets."
  },
  {
    "id": "open-float",
    "term": "Opening Price (Float)",
    "category": "SMC & Models",
    "definition": "The opening price of a session, day, week, or month. ICT treats opening prices as significant reference levels — particularly midnight open, NY open (9:30 AM), and the weekly open. Price frequently references these levels as support/resistance throughout the session and seeks to rebalance gaps formed at these reference prices."
  },
  {
    "id": "implied-move",
    "term": "Implied Move",
    "category": "SMC & Models",
    "definition": "The expected range of price movement for a given session or timeframe based on historical volatility and institutional reference levels. ICT uses implied moves to set realistic profit targets and understand when a move is overextended."
  },
  {
    "id": "market-maker-buy",
    "term": "Market Maker Buy Model",
    "category": "SMC & Models",
    "definition": "ICT's bullish delivery sequence: 1) Consolidation phase (Asia range), 2) Judas swing downward to sweep sell-side liquidity (London manipulation), 3) Market structure shift bullish with displacement, 4) True rally targeting buy-side liquidity above (NY distribution). The entire setup is engineered to accumulate long positions at discounted prices."
  },
  {
    "id": "market-maker-sell",
    "term": "Market Maker Sell Model",
    "category": "SMC & Models",
    "definition": "ICT's bearish delivery sequence: 1) Consolidation phase, 2) Judas swing upward sweeping buy-side liquidity, 3) Market structure shift bearish with downside displacement, 4) True decline targeting sell-side liquidity below. Engineered to distribute short positions at premium prices after trapping retail longs."
  },
  {
    "id": "turtle-soup",
    "term": "Turtle Soup",
    "category": "SMC & Models",
    "definition": "A reversal setup that triggers when price briefly breaks a 20-period high or low (targeting trend-following stops), then immediately reverses in the opposite direction. Named after the Turtle Trading system's 20-day breakout rules. ICT uses this as a stop-hunt signal — when the breakout fails with displacement, it confirms the reversal."
  },
  {
    "id": "smart-money",
    "term": "Smart Money",
    "category": "SMC & Models",
    "definition": "ICT's term for institutional traders, central banks, hedge funds, and large banks who move markets with their order flow. Smart money has access to information, capital, and execution capabilities that retail traders do not. The entire ICT methodology is built on the premise of understanding and following smart money positioning rather than fighting it."
  },
  {
    "id": "dumb-money",
    "term": "Dumb Money (Retail)",
    "category": "SMC & Models",
    "definition": "ICT's term for retail traders who consistently lose because they trade at predictable, obvious levels — placing stops at swing highs/lows, buying breakouts, selling breakdowns. Their predictability is exploited by smart money. Understanding dumb money behavior helps ICT traders anticipate where stops are clustered."
  },
  {
    "id": "order-flow",
    "term": "Order Flow",
    "category": "SMC & Models",
    "definition": "The sequence, direction, and size of orders entering the market. ICT teaches that understanding order flow — specifically institutional order flow — reveals market intent before price moves. When institutional buy orders exceed retail sell orders at a level, price will move up regardless of what retail traders believe about support/resistance."
  },
  {
    "id": "flip",
    "term": "Support / Resistance Flip",
    "category": "SMC & Models",
    "definition": "When a previous support level, after being broken, becomes a resistance level — or vice versa. In ICT, a flip occurs when price violates an Order Block or key level, converting its polarity. A bullish OB that fails (is broken to the downside) becomes a Breaker Block that now acts as resistance."
  },
  {
    "id": "poi",
    "term": "Point of Interest",
    "abbr": "POI",
    "category": "Price Delivery",
    "definition": "A specific price level or narrow zone that warrants active attention because multiple PD array tools converge at the same price — an FVG overlapping an Order Block at the OTE Fibonacci retracement, for example. A POI is the strongest version of a confluence zone: price has a compelling institutional reason to react from multiple frameworks simultaneously. ICT traders pre-mark POIs before the session and wait for price to arrive at them during kill zones."
  },
  {
    "id": "cisd",
    "term": "Change in State of Delivery",
    "abbr": "CISD",
    "category": "Market Structure",
    "definition": "The moment the algorithm flips from one directional delivery to another, confirmed by a candle closing through the most recent swing point with momentum. On a 1-minute chart: a bullish CISD is a candle closing above the most recent 1m swing high immediately after sell-side liquidity is swept. A bearish CISD is a candle closing below the most recent swing low after buy-side liquidity is swept. CISD is the final trigger in top-down ICT models — every higher timeframe element must be in place before the CISD qualifies as an entry signal."
  },
  {
    "id": "htf-narrative",
    "term": "HTF Narrative",
    "category": "SMC & Models",
    "definition": "The overall directional story told by higher timeframe analysis (weekly, daily, 4-hour charts). The HTF narrative determines which direction to trade on lower timeframes. If the daily chart is bearish (making LH-LL), the HTF narrative is bearish — only look for short setups on the 15m and 5m. All trades should align with the HTF narrative."
  }
]
