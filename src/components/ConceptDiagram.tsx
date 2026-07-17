// ICT concept diagrams — precise custom SVG
import { useMemo } from 'react'
import type { Scenario } from '../data/scenarios'

// ── Layout ────────────────────────────────────────────────────────────────────
const VW = 560; const VH = 280
const CT = 14; const CB = 258          // chart top/bottom y  (price 100 / price 0)
const CR = 488                          // chart right x; label area 488-560
const SP = 24; const BW = 9            // candle spacing; body half-width

const py = (p: number) => CB - p * (CB - CT) / 100   // price → SVG y
const cx = (i: number) => 14 + i * SP                 // index → SVG x center

// ── Types ─────────────────────────────────────────────────────────────────────
interface CD { o: number; h: number; l: number; c: number }

type Ann =
  | { k: 'zone';  p1: number; p2: number; xL?: number; col: string; op?: number }
  | { k: 'level'; p: number; col: string; lbl: string; dash?: boolean }
  | { k: 'mark';  i: number; pos: 'above'|'below'; txt: string; col: string; shape?: 'circle' }

interface DC { candles: CD[]; di: number; before: Ann[]; after: Ann[] }

// ── Helpers ───────────────────────────────────────────────────────────────────
const zone  = (p1: number, p2: number, col: string, op: number, xL?: number): Ann =>
  ({ k:'zone', p1, p2, col, op, xL })
const level = (p: number, col: string, lbl: string, dash = true): Ann =>
  ({ k:'level', p, col, lbl, dash })
const mark  = (i: number, pos: 'above'|'below', txt: string, col: string, shape?: 'circle'): Ann =>
  ({ k:'mark', i, pos, txt, col, shape })

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes cdIn  { from{opacity:0} to{opacity:1} }
  @keyframes revIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
  @keyframes pulse { 0%,100%{opacity:1;transform:none} 50%{opacity:.15;transform:translateY(-4px)} }
`

// ── Primitives ────────────────────────────────────────────────────────────────
function Candle({ i, d, del }: { i: number; d: CD; del: number }) {
  const bull = d.c >= d.o
  const col  = bull ? '#34d399' : '#f87171'
  const bT   = py(Math.max(d.o, d.c)); const bB = py(Math.min(d.o, d.c))
  const bH   = Math.max(bB - bT, 1.5)
  return (
    <g style={{ animation: `cdIn .1s ${del.toFixed(2)}s both` }}>
      <line x1={cx(i)} y1={py(d.h)} x2={cx(i)} y2={py(d.l)}
        stroke={col} strokeWidth={1.5} strokeLinecap="round" />
      <rect x={cx(i)-BW} y={bT} width={BW*2} height={bH} fill={col} rx={.5} />
    </g>
  )
}

function ZoneEl({ a }: { a: Extract<Ann,{k:'zone'}> }) {
  const xL = a.xL ?? 2; const xR = CR - 2
  const yT = py(a.p2); const yB = py(a.p1)   // p2=higher price=lower y
  return (
    <g>
      <rect x={xL} y={yT} width={xR-xL} height={yB-yT}
        fill={a.col} opacity={a.op ?? .15} />
      {/* sharp zone boundaries */}
      <line x1={xL} y1={yT} x2={xR} y2={yT} stroke={a.col} strokeWidth={1.2} opacity={.8} />
      <line x1={xL} y1={yB} x2={xR} y2={yB} stroke={a.col} strokeWidth={1.2} opacity={.8} />
    </g>
  )
}

function LevelEl({ a, del = 0 }: { a: Extract<Ann,{k:'level'}>; del?: number }) {
  const y = py(a.p)
  return (
    <g style={del ? { animation:`revIn .3s ${del}s both` } : undefined}>
      <line x1={2} y1={y} x2={CR-2} y2={y} stroke={a.col} strokeWidth={.9}
        strokeDasharray={a.dash!==false ? '5 3' : undefined} />
      <text x={CR+4} y={y+4} fill={a.col} fontSize={10} fontFamily="monospace"
        fontWeight={700}>{a.lbl}</text>
    </g>
  )
}

function MarkEl({ a, cs, del = 0 }: { a: Extract<Ann,{k:'mark'}>; cs: CD[]; del?: number }) {
  const d = cs[a.i]; if (!d) return null
  const up = a.pos === 'above'
  const base = up ? py(d.h) - 16 : py(d.l) + 16
  const pts  = up
    ? `${cx(a.i)},${base+8} ${cx(a.i)-5},${base} ${cx(a.i)+5},${base}`
    : `${cx(a.i)},${base-8} ${cx(a.i)-5},${base} ${cx(a.i)+5},${base}`
  return (
    <g style={del ? { animation:`revIn .3s ${del}s both` } : undefined}>
      {a.shape === 'circle'
        ? <circle cx={cx(a.i)} cy={base} r={4.5} fill={a.col} opacity={.9} />
        : <polygon points={pts} fill={a.col} />
      }
      <text x={cx(a.i)} y={up ? base-4 : base+13} fill={a.col}
        fontSize={8} fontFamily="monospace" fontWeight={700} textAnchor="middle">{a.txt}</text>
    </g>
  )
}

function DecisionPulse({ di, cs }: { di: number; cs: CD[] }) {
  const d = cs[di]; if (!d) return null
  const y = py(d.h) - 22
  return (
    <g style={{ animation: 'pulse 1.4s ease-in-out infinite' }}>
      <polygon points={`${cx(di)},${y+9} ${cx(di)-6},${y} ${cx(di)+6},${y}`} fill="#f59e0b" />
      <text x={cx(di)} y={y-3} fill="#f59e0b" fontSize={8} fontFamily="monospace"
        fontWeight={700} textAnchor="middle">DECISION</text>
    </g>
  )
}

// ── DIAGRAM PATTERNS ──────────────────────────────────────────────────────────

// BULLISH FVG
// SSL sweep → uptrend → C1/C2(disp)/C3 gap → retrace into FVG → decision → bull run
function bullFVG(): DC {
  const SSL=28, C1H=58, C3L=74, BSL=95
  // C1 at idx 11, C2 at 12, C3 at 13
  const candles: CD[] = [
    // uptrend context
    {o:20,h:23,l:18,c:23}, {o:23,h:26,l:21,c:26}, {o:26,h:29,l:24,c:29}, {o:29,h:31,l:27,c:31},
    // 3 equal lows at SSL=28 (wick tips all at 28)
    {o:31,h:33,l:SSL,c:32}, {o:32,h:35,l:SSL,c:34}, {o:34,h:36,l:SSL,c:35},
    // SSL SWEEP — big wick to 18, body stays above SSL
    {o:35,h:36,l:18,c:34},
    // recovery
    {o:34,h:39,l:32,c:39}, {o:39,h:45,l:37,c:45}, {o:45,h:51,l:43,c:51},
    // C1: small bull, high wick = C1H (FVG bottom boundary)
    {o:51,h:C1H,l:49,c:55},
    // C2: MASSIVE displacement — body spans the entire FVG gap
    {o:55,h:84,l:54,c:83},
    // C3: small bull, LOW wick = C3L (FVG top boundary)  C3L > C1H ✓
    {o:83,h:86,l:C3L,c:85},
    // retracement back toward FVG
    {o:85,h:86,l:77,c:78}, {o:78,h:80,l:75,c:76},
    // DECISION: wick deep into FVG zone, closes inside
    {o:76,h:77,l:62,c:67},
    // after: strong bull continuation
    {o:67,h:76,l:65,c:76}, {o:76,h:86,l:74,c:86}, {o:86,h:BSL,l:84,c:BSL-1},
  ]
  const xL = cx(11) - BW   // zone starts at C1
  return {
    candles, di: 16,
    before: [
      level(SSL, '#f87171', 'SSL'),
      zone(C1H, C3L, '#f59e0b', .12, xL),
    ],
    after: [
      level(SSL, '#f87171', 'SSL'),
      level(C3L, '#f59e0b', 'FVG TOP'), level(C1H, '#f59e0b', 'FVG BOT'),
      level(BSL, '#34d399', 'BSL TARGET'),
      zone(C1H, C3L, '#f59e0b', .22, xL),
      mark(7,'below','SSL SWEEP','#f87171'), mark(11,'below','C1','#94a3b8','circle'),
      mark(12,'below','DISP','#f59e0b'), mark(13,'above','C3','#94a3b8','circle'),
      mark(16,'above','DECISION','#f59e0b'),
    ],
  }
}

// BEARISH FVG
// BSL sweep → downtrend → C1/C2(bear disp)/C3 gap → pullback to FVG → decision → bear run
function bearFVG(): DC {
  const BSL=74, C1L=44, C3H=58, SSL=8
  // C1 at idx 11, C2 at 12, C3 at 13
  const candles: CD[] = [
    // downtrend context
    {o:82,h:84,l:80,c:80}, {o:80,h:82,l:78,c:78}, {o:78,h:80,l:76,c:76}, {o:76,h:78,l:74,c:74},
    // 3 equal highs at BSL=74 (wick tips all at 74)
    {o:74,h:BSL,l:72,c:73}, {o:73,h:BSL,l:71,c:72}, {o:72,h:BSL,l:70,c:71},
    // BSL SWEEP — big wick to 84, body stays below BSL
    {o:71,h:84,l:69,c:71},
    // recovery down
    {o:71,h:73,l:67,c:67}, {o:67,h:69,l:63,c:63}, {o:63,h:65,l:59,c:59},
    // C1: small bear, LOW wick = C1L (FVG top boundary)
    {o:59,h:61,l:C1L,c:47},
    // C2: MASSIVE bear displacement
    {o:47,h:48,l:16,c:17},
    // C3: small bear, HIGH wick = C3H (FVG bottom boundary)  C3H < C1L ✓
    {o:17,h:C3H,l:14,c:16},
    // pullback toward FVG
    {o:16,h:22,l:14,c:22}, {o:22,h:29,l:20,c:29},
    // DECISION: wick into FVG zone
    {o:29,h:38,l:27,c:33},
    // after: bear continuation
    {o:33,h:35,l:22,c:22}, {o:22,h:24,l:12,c:12}, {o:12,h:14,l:SSL,c:SSL+2},
  ]
  const xL = cx(11) - BW
  return {
    candles, di: 16,
    before: [
      level(BSL, '#34d399', 'BSL'),
      zone(C1L, C3H, '#f59e0b', .12, xL),
    ],
    after: [
      level(BSL, '#34d399', 'BSL'),
      level(C1L, '#f59e0b', 'FVG BOT'), level(C3H, '#f59e0b', 'FVG TOP'),
      level(SSL, '#f87171', 'SSL TARGET'),
      zone(C1L, C3H, '#f59e0b', .22, xL),
      mark(7,'above','BSL SWEEP','#34d399'), mark(11,'above','C1','#94a3b8','circle'),
      mark(12,'above','DISP','#f59e0b'), mark(13,'below','C3','#94a3b8','circle'),
      mark(16,'below','DECISION','#f59e0b'),
    ],
  }
}

// BEARISH OB — Judas spike sweeps BSL, last bull candle = OB, bear displacement, retrace to OB
function bearOBJudas(): DC {
  const BSL=76, OB_TOP=72, OB_BOT=62, SSL=20
  // Judas spike at idx 7, OB at idx 8, displacement at idx 9
  const candles: CD[] = [
    // bearish context, downtrend
    {o:70,h:72,l:68,c:68}, {o:68,h:70,l:66,c:66}, {o:66,h:68,l:64,c:64},
    {o:64,h:66,l:62,c:62}, {o:62,h:64,l:60,c:60},
    // slow grind up toward BSL (setting up the sweep)
    {o:60,h:63,l:58,c:63}, {o:63,h:67,l:61,c:67},
    // JUDAS: spike above BSL, wick to 82, closes below BSL
    {o:67,h:82,l:65,c:68},
    // OB = last bull close before displacement
    {o:68,h:OB_TOP,l:66,c:OB_TOP-2},
    // DISPLACEMENT: massive bear — violates OB immediately
    {o:OB_TOP-2,h:OB_TOP,l:30,c:32},
    // drift lower
    {o:32,h:35,l:29,c:30}, {o:30,h:32,l:27,c:28},
    // rally back up to OB zone
    {o:28,h:33,l:26,c:33}, {o:33,h:40,l:31,c:40},
    {o:40,h:48,l:38,c:48}, {o:48,h:56,l:46,c:56},
    {o:56,h:63,l:54,c:62},
    // DECISION at OB midpoint
    {o:62,h:OB_TOP,l:60,c:(OB_TOP+OB_BOT)/2|0},
    // after: bear continuation
    {o:(OB_TOP+OB_BOT)/2|0,h:64,l:50,c:50}, {o:50,h:52,l:SSL,c:SSL+2},
  ]
  const xL = cx(8) - BW
  return {
    candles, di: 17,
    before: [
      level(BSL, '#34d399', 'BSL (Prior High)'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(BSL,    '#34d399', 'BSL (Prior High)'),
      level(OB_TOP, '#60a5fa', 'OB TOP'), level(OB_BOT, '#60a5fa', 'OB BOT'),
      level(SSL,    '#f87171', 'SSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .25, xL),
      mark(7,'above','JUDAS SPIKE','#a78bfa'), mark(8,'above','OB','#60a5fa','circle'),
      mark(9,'above','DISPLACEMENT','#f87171'), mark(17,'above','DECISION','#f59e0b'),
    ],
  }
}

// SSL SWEEP — 3 equal lows → sweep wick → reversal with FVG → decision
function sslSweep(): DC {
  const SSL=32, FVG_TOP=60, FVG_BOT=48, BSL=88
  // equal lows: idx 2,3,4 — sweep: idx 5 — FVG: 6/7/8 — di=12
  const candles: CD[] = [
    // context near SSL level
    {o:44,h:46,l:40,c:45}, {o:45,h:47,l:42,c:46},
    // 3 EXACT equal lows at SSL=32
    {o:46,h:48,l:SSL,c:47}, {o:47,h:49,l:SSL,c:48}, {o:48,h:50,l:SSL,c:49},
    // SSL SWEEP: huge wick to 18, body closes at 47 (well above SSL)
    {o:49,h:50,l:18,c:47},
    // reversal impulse: C1/C2/C3 creating bull FVG
    {o:47,h:FVG_BOT,l:45,c:FVG_BOT-2},
    {o:FVG_BOT-2,h:68,l:FVG_BOT-3,c:67},
    {o:67,h:70,l:FVG_TOP,c:69},
    // small pullback toward FVG
    {o:69,h:70,l:62,c:63}, {o:63,h:65,l:60,c:61},
    // DECISION: wick touches FVG, closes inside zone
    {o:61,h:63,l:52,c:56},
    // after: bull run to BSL
    {o:56,h:65,l:54,c:65}, {o:65,h:76,l:63,c:76}, {o:76,h:BSL,l:74,c:BSL-1},
  ]
  const xL = cx(6) - BW
  return {
    candles, di: 11,
    before: [
      level(SSL, '#f87171', 'SSL (Equal Lows)'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .12, xL),
    ],
    after: [
      level(SSL,     '#f87171', 'SSL (Equal Lows)'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(BSL,     '#34d399', 'BSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(5,'below','SSL SWEEP','#f87171'), mark(6,'below','C1','#94a3b8','circle'),
      mark(7,'below','DISP','#f59e0b'), mark(8,'above','C3','#94a3b8','circle'),
      mark(11,'above','DECISION','#f59e0b'),
    ],
  }
}

// BSL SWEEP — 3 equal highs → sweep wick → bearish FVG → decision
function bslSweep(): DC {
  const BSL=70, FVG_BOT=44, FVG_TOP=56, SSL=14
  const candles: CD[] = [
    {o:58,h:60,l:56,c:59}, {o:59,h:61,l:57,c:60},
    // 3 EXACT equal highs at BSL=70
    {o:60,h:BSL,l:58,c:61}, {o:61,h:BSL,l:59,c:62}, {o:62,h:BSL,l:60,c:63},
    // BSL SWEEP: big wick to 82, closes at 60 (below BSL)
    {o:63,h:82,l:61,c:60},
    // bearish impulse: C1/C2/C3 creating bear FVG
    {o:60,h:62,l:FVG_TOP,c:FVG_TOP+2},
    {o:FVG_TOP+2,h:FVG_TOP+3,l:34,c:35},
    {o:35,h:FVG_BOT,l:32,c:34},
    // pullback up toward FVG
    {o:34,h:41,l:32,c:40}, {o:40,h:47,l:38,c:46},
    // DECISION: wick up into FVG, closes inside
    {o:46,h:54,l:44,c:49},
    // after: bear run
    {o:49,h:51,l:37,c:37}, {o:37,h:39,l:SSL,c:SSL+2},
  ]
  const xL = cx(6) - BW
  return {
    candles, di: 11,
    before: [
      level(BSL, '#34d399', 'BSL (Equal Highs)'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .12, xL),
    ],
    after: [
      level(BSL,     '#34d399', 'BSL (Equal Highs)'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(SSL,     '#f87171', 'SSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(5,'above','BSL SWEEP','#34d399'), mark(6,'above','C1','#94a3b8','circle'),
      mark(7,'above','DISP','#f59e0b'), mark(8,'below','C3','#94a3b8','circle'),
      mark(11,'below','DECISION','#f59e0b'),
    ],
  }
}

// CHoCH BULLISH — bearish downtrend → SSL sweep → close above last LH = CHoCH → FVG → long
function chochBull(): DC {
  // Lower highs: LH1=72, LH2=65, LH3=58 (CHoCH level)
  // Lower lows:  LL1=48, LL2=40, SSL=32
  const CHOCH=58, SSL=32, FVG_BOT=62, FVG_TOP=72, BSL=90
  const candles: CD[] = [
    // bearish swing 1: LH1→LL1
    {o:74,h:76,l:72,c:72},  // near top
    {o:72,h:74,l:68,c:69},  // down
    {o:69,h:71,l:64,c:65},  // down
    {o:65,h:67,l:48,c:49},  // big bear: makes LL1=48
    // bearish swing 2: rallies to LH2=65 (lower than LH1)
    {o:49,h:65,l:47,c:64},  // rally to LH2
    // bearish swing 3: drops to LL2=40
    {o:64,h:65,l:56,c:57},
    {o:57,h:59,l:40,c:41},  // makes LL2=40
    // consolidate near SSL=32
    {o:41,h:43,l:36,c:42},
    {o:42,h:44,l:SSL,c:43}, {o:43,h:45,l:SSL,c:44},
    // SSL SWEEP: wick to 22, closes at 42
    {o:44,h:45,l:22,c:42},
    // rally: CHoCH bar closes ABOVE CHOCH=58
    {o:42,h:50,l:40,c:50}, {o:50,h:61,l:48,c:61},
    // CHoCH BREAK: closes at 63 — above CHOCH=58 ✓
    {o:61,h:66,l:59,c:65},
    // FVG from CHoCH impulse: C1/C2/C3
    {o:65,h:FVG_BOT,l:63,c:FVG_BOT-1},
    {o:FVG_BOT-1,h:80,l:FVG_BOT-2,c:79},
    {o:79,h:82,l:FVG_TOP,c:81},
    // retrace to FVG
    {o:81,h:82,l:74,c:75},
    // DECISION at FVG
    {o:75,h:76,l:66,c:70},
    // after: bull to BSL
    {o:70,h:80,l:68,c:80}, {o:80,h:BSL,l:78,c:BSL-1},
  ]
  const xL = cx(14) - BW
  return {
    candles, di: 18,
    before: [
      level(SSL,   '#f87171', 'SSL'),
      level(CHOCH, '#34d399', 'CHoCH Level'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .10, xL),
    ],
    after: [
      level(SSL,     '#f87171', 'SSL'),
      level(CHOCH,   '#34d399', 'CHoCH Level'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(BSL,     '#34d399', 'BSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(10,'below','SSL SWEEP','#f87171'),
      mark(13,'below','CHoCH BREAK','#34d399'),
      mark(18,'above','DECISION','#f59e0b'),
    ],
  }
}

// AMD BULLISH — Asia range (accumulation) → manipulation drop → distribution up
function amdBull(): DC {
  const AL=38, AH=58, FVG_BOT=65, FVG_TOP=76, BSL=94
  const candles: CD[] = [
    // ACCUMULATION: 8 bars tight in Asia range
    {o:46,h:AH,l:AL,c:48}, {o:48,h:AH,l:AL,c:50}, {o:50,h:AH,l:AL,c:48},
    {o:48,h:AH,l:AL,c:46}, {o:46,h:AH,l:AL,c:48}, {o:48,h:AH,l:AL,c:50},
    {o:50,h:AH,l:AL,c:52}, {o:52,h:AH,l:AL,c:50},
    // MANIPULATION: spike BELOW Asia low (SSL sweep)
    {o:50,h:51,l:24,c:48},
    // recovery back above Asia low
    {o:48,h:54,l:46,c:54}, {o:54,h:60,l:52,c:60},
    // DISTRIBUTION: bull FVG created
    {o:60,h:FVG_BOT,l:58,c:FVG_BOT-1},
    {o:FVG_BOT-1,h:82,l:FVG_BOT-2,c:81},
    {o:81,h:83,l:FVG_TOP,c:82},
    // retrace to FVG
    {o:82,h:83,l:77,c:78}, {o:78,h:80,l:76,c:77},
    // DECISION
    {o:77,h:78,l:69,c:73},
    // after: bull to BSL
    {o:73,h:82,l:71,c:82}, {o:82,h:BSL,l:80,c:BSL-1},
  ]
  const xL = cx(11) - BW
  return {
    candles, di: 16,
    before: [
      level(AL, '#f87171', 'Asia Low (SSL)', true),
      level(AH, '#34d399', 'Asia High (BSL)', true),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .10, xL),
    ],
    after: [
      level(AL,      '#f87171', 'Asia Low (SSL)'),
      level(AH,      '#34d399', 'Asia High'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(BSL,     '#34d399', 'BSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(0,'above','ACCUMULATION','#94a3b8','circle'),
      mark(8,'below','MANIPULATION','#a78bfa'),
      mark(10,'below','DISTRIBUTION','#34d399','circle'),
      mark(16,'above','DECISION','#f59e0b'),
    ],
  }
}

// AMD BEARISH — accumulation → judas spike UP → distribution down
function amdBear(): DC {
  const AL=44, AH=62, FVG_TOP=38, FVG_BOT=26, SSL=10
  const candles: CD[] = [
    {o:50,h:AH,l:AL,c:52}, {o:52,h:AH,l:AL,c:50}, {o:50,h:AH,l:AL,c:48},
    {o:48,h:AH,l:AL,c:50}, {o:50,h:AH,l:AL,c:52}, {o:52,h:AH,l:AL,c:54},
    {o:54,h:AH,l:AL,c:52}, {o:52,h:AH,l:AL,c:50},
    // MANIPULATION: spike ABOVE Asia high (BSL sweep)
    {o:50,h:78,l:48,c:50},
    // recovery down
    {o:50,h:52,l:44,c:44}, {o:44,h:46,l:38,c:38},
    // DISTRIBUTION: bear FVG
    {o:38,h:40,l:FVG_BOT,c:28},
    {o:28,h:30,l:18,c:19},
    {o:19,h:FVG_TOP,l:16,c:18},
    // pullback to FVG
    {o:18,h:25,l:16,c:25}, {o:25,h:32,l:23,c:31},
    // DECISION
    {o:31,h:36,l:29,c:33},
    // after
    {o:33,h:35,l:22,c:22}, {o:22,h:24,l:SSL,c:SSL+2},
  ]
  const xL = cx(11) - BW
  return {
    candles, di: 16,
    before: [
      level(AH, '#34d399', 'Asia High (BSL)', true),
      level(AL, '#f87171', 'Asia Low', true),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .10, xL),
    ],
    after: [
      level(AH,      '#34d399', 'Asia High (BSL)'),
      level(AL,      '#f87171', 'Asia Low'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(SSL,     '#f87171', 'SSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(0,'above','ACCUMULATION','#94a3b8','circle'),
      mark(8,'above','MANIPULATION','#a78bfa'),
      mark(10,'above','DISTRIBUTION','#f87171','circle'),
      mark(16,'below','DECISION','#f59e0b'),
    ],
  }
}

// JUDAS SHORT — NY open spike runs BSL → bearish OB/FVG → decision to short
function judasShort(): DC {
  const BSL=74, OB_TOP=70, OB_BOT=60, SSL=22
  const candles: CD[] = [
    // bearish context
    {o:66,h:68,l:64,c:64}, {o:64,h:66,l:62,c:62}, {o:62,h:64,l:60,c:60},
    // prior high visible
    {o:60,h:62,l:58,c:61}, {o:61,h:63,l:59,c:62},
    // JUDAS: open and spike straight to BSL (NY open)
    {o:62,h:BSL,l:60,c:68},
    // OB = last bull candle (high = OB_TOP)
    {o:68,h:OB_TOP,l:66,c:OB_TOP-2},
    // DISPLACEMENT: massive bear, blows through OB
    {o:OB_TOP-2,h:OB_TOP-1,l:30,c:32},
    // drift lower
    {o:32,h:35,l:28,c:30}, {o:30,h:32,l:26,c:28},
    // rally back to OB
    {o:28,h:34,l:26,c:34}, {o:34,h:42,l:32,c:42},
    {o:42,h:50,l:40,c:50}, {o:50,h:58,l:48,c:57},
    {o:57,h:63,l:55,c:62},
    // DECISION at OB midpoint
    {o:62,h:OB_TOP,l:60,c:(OB_TOP+OB_BOT)/2|0},
    // after: bear continuation
    {o:(OB_TOP+OB_BOT)/2|0,h:64,l:48,c:48}, {o:48,h:50,l:SSL,c:SSL+2},
  ]
  const xL = cx(6) - BW
  return {
    candles, di: 15,
    before: [
      level(BSL,    '#34d399', 'Prior Day High'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(BSL,    '#34d399', 'BSL (Prior High)'),
      level(OB_TOP, '#60a5fa', 'OB TOP'), level(OB_BOT, '#60a5fa', 'OB BOT'),
      level(SSL,    '#f87171', 'SSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .26, xL),
      mark(5,'above','JUDAS SPIKE','#a78bfa'), mark(6,'above','OB','#60a5fa','circle'),
      mark(7,'above','DISPLACEMENT','#f87171'), mark(15,'above','DECISION','#f59e0b'),
    ],
  }
}

// SILVER BULLET LONG — 10am window, SSL sweep → 1m FVG → long
function silverBulletLong(): DC {
  const SSL=40, FVG_TOP=62, FVG_BOT=50, BSL=82
  const candles: CD[] = [
    // choppy 1m context
    {o:54,h:56,l:52,c:55},{o:55,h:57,l:53,c:54},{o:54,h:55,l:51,c:52},
    {o:52,h:53,l:49,c:50},{o:50,h:52,l:SSL+2,c:51},{o:51,h:53,l:SSL,c:52},{o:52,h:54,l:SSL,c:53},
    // SSL SWEEP: huge wick, closes at 50
    {o:53,h:54,l:28,c:50},
    // 1m FVG: C1/C2/C3
    {o:50,h:FVG_BOT,l:48,c:FVG_BOT-1},
    {o:FVG_BOT-1,h:70,l:FVG_BOT-2,c:69},
    {o:69,h:71,l:FVG_TOP,c:70},
    // retrace
    {o:70,h:71,l:64,c:65}, {o:65,h:67,l:62,c:63},
    // DECISION
    {o:63,h:64,l:54,c:58},
    // after
    {o:58,h:68,l:56,c:68}, {o:68,h:BSL,l:66,c:BSL-1},
  ]
  const xL = cx(8) - BW
  return {
    candles, di: 13,
    before: [
      level(SSL, '#f87171', 'SSL'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .12, xL),
    ],
    after: [
      level(SSL,     '#f87171', 'SSL'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(BSL,     '#34d399', 'BSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(7,'below','SSL SWEEP','#f87171'), mark(8,'below','C1','#94a3b8','circle'),
      mark(9,'below','DISP','#f59e0b'), mark(10,'above','C3','#94a3b8','circle'),
      mark(13,'above','DECISION','#f59e0b'),
    ],
  }
}

// SILVER BULLET SHORT — 2pm window, BSL sweep → 1m bearish FVG → short
function silverBulletShort(): DC {
  const BSL=64, FVG_BOT=44, FVG_TOP=54, SSL=24
  const candles: CD[] = [
    {o:54,h:56,l:52,c:55},{o:55,h:57,l:53,c:56},{o:56,h:58,l:54,c:57},
    {o:57,h:59,l:55,c:58},{o:58,h:BSL,l:56,c:59},{o:59,h:BSL,l:57,c:60},{o:60,h:BSL,l:58,c:61},
    // BSL SWEEP: wick to 74, closes at 58
    {o:61,h:74,l:59,c:58},
    // 1m bearish FVG: C1/C2/C3
    {o:58,h:60,l:FVG_TOP,c:FVG_TOP+2},
    {o:FVG_TOP+2,h:FVG_TOP+3,l:34,c:35},
    {o:35,h:FVG_BOT,l:32,c:34},
    // pullback
    {o:34,h:41,l:32,c:40}, {o:40,h:47,l:38,c:46},
    // DECISION
    {o:46,h:52,l:44,c:48},
    // after
    {o:48,h:50,l:34,c:34}, {o:34,h:36,l:SSL,c:SSL+2},
  ]
  const xL = cx(8) - BW
  return {
    candles, di: 13,
    before: [
      level(BSL, '#34d399', 'BSL'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .12, xL),
    ],
    after: [
      level(BSL,     '#34d399', 'BSL'),
      level(FVG_TOP, '#f59e0b', 'FVG TOP'), level(FVG_BOT, '#f59e0b', 'FVG BOT'),
      level(SSL,     '#f87171', 'SSL TARGET'),
      zone(FVG_BOT, FVG_TOP, '#f59e0b', .22, xL),
      mark(7,'above','BSL SWEEP','#34d399'), mark(8,'above','C1','#94a3b8','circle'),
      mark(9,'above','DISP','#f59e0b'), mark(10,'below','C3','#94a3b8','circle'),
      mark(13,'below','DECISION','#f59e0b'),
    ],
  }
}

// BREAKER BEAR — bull OB holds → price closes below OB → rally retests OB (now bearish breaker)
function breakerBear(): DC {
  const OB_TOP=70, OB_BOT=60, SSL=20
  const candles: CD[] = [
    // OB works initially
    {o:54,h:57,l:52,c:57},{o:57,h:62,l:55,c:62},{o:62,h:OB_BOT,l:60,c:OB_TOP-2},
    // OB candle itself
    {o:OB_TOP-2,h:OB_TOP+2,l:OB_BOT,c:OB_TOP+1},
    // big rally after OB (price respected it)
    {o:OB_TOP+1,h:OB_TOP+8,l:OB_TOP-1,c:OB_TOP+7},
    // OB VIOLATION: big bear closes below OB_BOT
    {o:OB_TOP+7,h:OB_TOP+8,l:42,c:44},
    {o:44,h:47,l:38,c:40}, {o:40,h:43,l:34,c:36},
    // rally back toward the BREAKER (former OB)
    {o:36,h:41,l:34,c:41}, {o:41,h:48,l:39,c:48},
    {o:48,h:55,l:46,c:55}, {o:55,h:61,l:53,c:60},
    {o:60,h:65,l:58,c:64},
    // DECISION: price tests former OB zone (now resistance)
    {o:64,h:OB_TOP,l:62,c:(OB_TOP+OB_BOT)/2|0},
    // after: bear continuation from breaker
    {o:(OB_TOP+OB_BOT)/2|0,h:66,l:48,c:48}, {o:48,h:50,l:SSL,c:SSL+2},
  ]
  const xL = cx(3) - BW
  return {
    candles, di: 13,
    before: [
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(OB_TOP, '#60a5fa', 'BREAKER TOP'), level(OB_BOT, '#60a5fa', 'BREAKER BOT'),
      level(SSL,    '#f87171', 'SSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .26, xL),
      mark(3,'below','OB (was support)','#60a5fa','circle'),
      mark(5,'above','OB VIOLATED','#f87171'),
      mark(13,'above','DECISION','#f59e0b'),
    ],
  }
}

// BREAKER BULL — bear OB holds → price closes above OB → pullback retests OB (now bullish breaker)
function breakerBull(): DC {
  const OB_TOP=46, OB_BOT=36, BSL=84
  const candles: CD[] = [
    {o:54,h:56,l:52,c:52},{o:52,h:54,l:50,c:50},{o:50,h:52,l:OB_TOP,c:OB_TOP-2},
    // OB candle
    {o:OB_TOP-2,h:OB_TOP+2,l:OB_BOT,c:OB_BOT+1},
    // drop continues initially
    {o:OB_BOT+1,h:OB_TOP-2,l:28,c:30},
    // OB VIOLATION: big bull closes above OB_TOP
    {o:30,h:56,l:28,c:55},
    {o:55,h:62,l:53,c:62},{o:62,h:70,l:60,c:70},
    // pullback toward breaker zone
    {o:70,h:72,l:62,c:62},{o:62,h:64,l:54,c:54},
    {o:54,h:56,l:46,c:47},{o:47,h:50,l:42,c:43},
    // DECISION: tests former bear OB (now bullish breaker)
    {o:43,h:OB_TOP+1,l:41,c:(OB_TOP+OB_BOT)/2|0},
    // after: bull run
    {o:(OB_TOP+OB_BOT)/2|0,h:52,l:40,c:52},{o:52,h:62,l:50,c:62},
    {o:62,h:74,l:60,c:74},{o:74,h:BSL,l:72,c:BSL-1},
  ]
  const xL = cx(3) - BW
  return {
    candles, di: 12,
    before: [
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(OB_TOP, '#60a5fa', 'BREAKER TOP'), level(OB_BOT, '#60a5fa', 'BREAKER BOT'),
      level(BSL,    '#34d399', 'BSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .26, xL),
      mark(3,'above','OB (was resist)','#60a5fa','circle'),
      mark(5,'below','OB VIOLATED','#34d399'),
      mark(12,'below','DECISION','#f59e0b'),
    ],
  }
}

// OTE — swing low → swing high → 62-79% retracement zone → FVG inside → long
function oteZone(): DC {
  const SWL=20, SWH=80, OTE_T=55, OTE_B=43, EQUIL=50, BSL=92
  const candles: CD[] = [
    // swing low established
    {o:22,h:24,l:SWL,c:24},
    // impulse up (establishes swing)
    {o:24,h:32,l:22,c:32},{o:32,h:42,l:30,c:42},{o:42,h:54,l:40,c:54},
    {o:54,h:64,l:52,c:64},{o:64,h:74,l:62,c:74},{o:74,h:SWH,l:72,c:SWH-1},
    // retracement into OTE zone (62-79% of 60 range = pulls back 37-47 pts)
    {o:SWH-1,h:SWH,l:72,c:73},{o:73,h:75,l:69,c:70},{o:70,h:72,l:66,c:67},
    {o:67,h:69,l:63,c:64},{o:64,h:66,l:60,c:61},{o:61,h:63,l:57,c:58},
    {o:58,h:60,l:OTE_T+2,c:OTE_T},
    // in OTE zone
    {o:OTE_T,h:OTE_T+2,l:OTE_B+1,c:OTE_B+2},
    // DECISION at zone
    {o:OTE_B+2,h:OTE_T+2,l:OTE_B,c:OTE_B+4},
    // after: bull to BSL
    {o:OTE_B+4,h:60,l:OTE_B+2,c:60},{o:60,h:70,l:58,c:70},
    {o:70,h:80,l:68,c:80},{o:80,h:BSL,l:78,c:BSL-1},
  ]
  const xL = cx(13) - BW
  return {
    candles, di: 15,
    before: [
      level(SWH,  '#34d399', 'Swing High', false),
      level(EQUIL,'#64748b', 'Equilibrium (50%)'),
      level(OTE_T,'#a78bfa', 'OTE 62%'), level(OTE_B,'#a78bfa', 'OTE 79%'),
      zone(OTE_B, OTE_T, '#a78bfa', .14, xL),
    ],
    after: [
      level(SWH,  '#34d399', 'Swing High', false),
      level(EQUIL,'#64748b', 'Equilibrium'),
      level(OTE_T,'#a78bfa', 'OTE 62%'), level(OTE_B,'#a78bfa', 'OTE 79%'),
      level(BSL,  '#34d399', 'BSL TARGET'),
      zone(OTE_B, OTE_T, '#a78bfa', .22, xL),
      mark(6,'above','SWING HIGH','#34d399','circle'), mark(15,'below','DECISION','#f59e0b'),
    ],
  }
}

// BOS RETEST — prior swing low → BOS displacement → OB → rally to OB → short
function bosRetest(): DC {
  const BOS=56, OB_TOP=62, OB_BOT=50, SSL=20
  const candles: CD[] = [
    {o:74,h:76,l:72,c:72},{o:72,h:74,l:70,c:70},{o:70,h:72,l:68,c:68},{o:68,h:70,l:66,c:66},
    // equal lows forming at BOS=56
    {o:66,h:68,l:BOS,c:66},{o:66,h:68,l:BOS,c:67},
    // OB = last candle before BOS displacement
    {o:67,h:OB_TOP,l:OB_BOT,c:OB_BOT+2},
    // BOS: massive bear breaks below BOS level
    {o:OB_BOT+2,h:OB_BOT+4,l:32,c:34},
    // drift lower
    {o:34,h:37,l:30,c:32},{o:32,h:35,l:28,c:30},
    // rally back to OB/BOS
    {o:30,h:36,l:28,c:36},{o:36,h:44,l:34,c:44},{o:44,h:52,l:42,c:52},{o:52,h:58,l:50,c:57},
    // DECISION at OB
    {o:57,h:OB_TOP,l:55,c:(OB_TOP+OB_BOT)/2|0},
    // after: bear
    {o:(OB_TOP+OB_BOT)/2|0,h:58,l:42,c:42},{o:42,h:44,l:SSL,c:SSL+2},
  ]
  const xL = cx(6) - BW
  return {
    candles, di: 14,
    before: [
      level(BOS,    '#a78bfa', 'BOS Level'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(BOS,    '#a78bfa', 'BOS Level'),
      level(OB_TOP, '#60a5fa', 'OB TOP'), level(OB_BOT, '#60a5fa', 'OB BOT'),
      level(SSL,    '#f87171', 'SSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .26, xL),
      mark(6,'above','OB','#60a5fa','circle'), mark(7,'above','BOS','#a78bfa'),
      mark(14,'above','DECISION','#f59e0b'),
    ],
  }
}

// OB IN DISCOUNT — swing range with P/D zones; OB sits below 50% → long
function bullOBDiscount(): DC {
  const SWL=18, SWH=82, EQUIL=50, OB_TOP=44, OB_BOT=34, BSL=90
  const candles: CD[] = [
    // swing established
    {o:20,h:24,l:SWL,c:24},{o:24,h:34,l:22,c:34},{o:34,h:46,l:32,c:46},
    {o:46,h:58,l:44,c:58},{o:58,h:70,l:56,c:70},{o:70,h:SWH,l:68,c:SWH-1},
    // pullback from high into discount
    {o:SWH-1,h:SWH,l:74,c:74},{o:74,h:76,l:66,c:66},
    {o:66,h:68,l:58,c:58},{o:58,h:60,l:50,c:51},{o:51,h:53,l:44,c:44},
    // OB in discount (below equil=50)
    {o:44,h:OB_TOP+1,l:OB_BOT-1,c:OB_BOT+2},
    // settle near OB
    {o:OB_BOT+2,h:OB_BOT+5,l:OB_BOT,c:OB_BOT+3},
    // DECISION at OB
    {o:OB_BOT+3,h:OB_TOP,l:OB_BOT-1,c:(OB_TOP+OB_BOT)/2|0},
    // after: bull to premium/BSL
    {o:(OB_TOP+OB_BOT)/2|0,h:52,l:38,c:52},{o:52,h:64,l:50,c:64},
    {o:64,h:76,l:62,c:76},{o:76,h:BSL,l:74,c:BSL-1},
  ]
  const xL = cx(11) - BW
  return {
    candles, di: 13,
    before: [
      level(SWH,  '#34d399', 'Swing High', false),
      level(EQUIL,'#64748b', 'Equilibrium'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .14, xL),
    ],
    after: [
      level(SWH,   '#34d399', 'Swing High (BSL)', false),
      level(EQUIL, '#64748b', 'Equilibrium (50%)'),
      level(OB_TOP,'#60a5fa', 'OB TOP (Discount)'), level(OB_BOT,'#60a5fa', 'OB BOT'),
      level(BSL,   '#34d399', 'BSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .26, xL),
      mark(11,'above','OB in Discount','#60a5fa','circle'), mark(13,'below','DECISION','#f59e0b'),
    ],
  }
}

// NO SETUP — choppy, equal highs AND lows, FOMC-style
function noSetup(): DC {
  const EQH=70, EQL=52, MID=61
  let s=777
  const rng = () => { s=(s*1103515245+12345)>>>0; return s/0x100000000 }
  const candles: CD[] = Array.from({length:19}, () => {
    const o=MID+(rng()-.5)*10, c=MID+(rng()-.5)*10
    return { o, c, h:Math.min(Math.max(o,c)+rng()*5,EQH+3), l:Math.max(Math.min(o,c)-rng()*5,EQL-3) }
  })
  return {
    candles, di: 18,
    before: [
      level(EQH,'#34d399','Equal Highs (BSL)'), level(EQL,'#f87171','Equal Lows (SSL)'),
    ],
    after: [
      level(EQH,'#34d399','Equal Highs (BSL)'), level(EQL,'#f87171','Equal Lows (SSL)'),
      mark(18,'above','NO CLEAR SETUP','#64748b','circle'),
    ],
  }
}

// JUDAS LONG — overnight range → London SSL sweep wick → reversal → NY bullish
function judasLong(): DC {
  const RH=68, RL=44, SSL=36, BSL=88
  const candles: CD[] = [
    // overnight range (accumulation)
    {o:58,h:62,l:52,c:60},{o:60,h:64,l:55,c:56},{o:56,h:61,l:53,c:60},
    {o:60,h:RH,l:56,c:65},{o:65,h:66,l:60,c:62},{o:62,h:65,l:59,c:63},
    {o:63,h:67,l:58,c:61},{o:61,h:63,l:RL,c:62},
    // JUDAS — London wick BELOW range low (SSL sweep), body closes back ABOVE RL
    {o:62,h:63,l:SSL,c:RL+4},
    // recovery + displacement up
    {o:RL+4,h:RL+12,l:RL+2,c:RL+11},
    {o:RL+11,h:RL+22,l:RL+9,c:RL+21},
    // FVG from displacement
    {o:RL+21,h:RL+32,l:RL+19,c:RL+30},
    // small retracement into FVG
    {o:RL+30,h:RL+31,l:RL+20,c:RL+22},
    // DECISION: at FVG
    {o:RL+22,h:RL+26,l:RL+18,c:RL+24},
    // NY distribution to BSL
    {o:RL+24,h:RL+34,l:RL+22,c:RL+34},{o:RL+34,h:RL+44,l:RL+32,c:RL+44},
    {o:RL+44,h:BSL,l:RL+42,c:BSL-1},
  ]
  return {
    candles, di: 13,
    before: [
      level(RH, '#64748b', 'Asia High', false),
      level(RL, '#64748b', 'Asia Low', false),
      level(SSL,'#f87171','SSL'),
    ],
    after: [
      level(RH, '#64748b', 'Asia High', false),
      level(RL, '#64748b', 'Asia Low', false),
      level(SSL,'#f87171','SSL'),
      level(BSL,'#34d399','BSL TARGET'),
      mark(8, 'below','JUDAS SWEEP','#f87171'),
      mark(10,'below','DISPLACEMENT','#34d399'),
      mark(13,'above','DECISION (FVG)','#f59e0b'),
    ],
  }
}

// MITIGATION BLOCK LONG — OB forms → first touch holds → partial fill → second touch (decision) → bull
function mitigationBlockLong(): DC {
  const OB_TOP=52, OB_BOT=40, BSL=84
  const candles: CD[] = [
    // downtrend context
    {o:72,h:74,l:70,c:70},{o:70,h:71,l:67,c:67},
    // OB forms (last bull candle before bear displacement)
    {o:67,h:OB_TOP,l:OB_BOT,c:OB_TOP-1},
    // big bear displacement
    {o:OB_TOP-1,h:OB_TOP,l:28,c:30},
    {o:30,h:34,l:26,c:28},{o:28,h:30,l:24,c:26},
    // FIRST TOUCH: rally back to OB — partial fill, holds
    {o:26,h:31,l:24,c:31},{o:31,h:40,l:29,c:40},
    {o:40,h:OB_BOT+6,l:38,c:OB_BOT+4},
    // bounce 1R off OB
    {o:OB_BOT+4,h:OB_TOP-2,l:OB_BOT+2,c:OB_TOP-3},
    // pullback AGAIN toward OB (second touch / mitigation)
    {o:OB_TOP-3,h:OB_TOP-2,l:44,c:45},
    {o:45,h:48,l:OB_BOT+2,c:OB_BOT+3},
    // DECISION: at second touch
    {o:OB_BOT+3,h:OB_TOP+1,l:OB_BOT,c:(OB_TOP+OB_BOT)/2|0},
    // bull continuation
    {o:(OB_TOP+OB_BOT)/2|0,h:60,l:44,c:60},
    {o:60,h:70,l:58,c:70},{o:70,h:BSL,l:68,c:BSL-1},
  ]
  const xL = cx(2) - BW
  return {
    candles, di: 12,
    before: [
      zone(OB_BOT, OB_TOP, '#60a5fa', .12, xL),
    ],
    after: [
      level(OB_TOP,'#60a5fa','MITIGATION TOP'), level(OB_BOT,'#60a5fa','MITIGATION BOT'),
      level(BSL,'#34d399','BSL TARGET'),
      zone(OB_BOT, OB_TOP, '#60a5fa', .22, xL),
      mark(2, 'above','OB FORMS','#60a5fa','circle'),
      mark(8, 'below','1ST TOUCH','#94a3b8'),
      mark(11,'below','2ND TOUCH','#f59e0b'),
      mark(12,'above','DECISION','#f59e0b'),
    ],
  }
}

// IRL TO ERL — dealing range with equal lows (IRL) swept → delivers to major swing low (ERL)
function irlToErl(): DC {
  const RH=78, RL=30, IRL=42, ERL=18
  const candles: CD[] = [
    // at range top
    {o:74,h:RH,l:72,c:73},{o:73,h:74,l:68,c:69},
    // ranging / inside range
    {o:69,h:72,l:64,c:65},{o:65,h:68,l:60,c:62},
    {o:62,h:65,l:58,c:64},{o:64,h:66,l:60,c:61},
    // near IRL (equal lows)
    {o:61,h:62,l:IRL,c:IRL+2},{o:IRL+2,h:IRL+4,l:IRL,c:IRL+3},
    // IRL SWEEP — wick below IRL, body stays near
    {o:IRL+3,h:IRL+4,l:IRL-4,c:IRL+1},
    // brief consolidation near IRL
    {o:IRL+1,h:IRL+4,l:IRL-2,c:IRL+2},{o:IRL+2,h:IRL+3,l:IRL-1,c:IRL},
    // DECISION: new leg starts
    {o:IRL,h:IRL+2,l:IRL-3,c:IRL-2},
    // delivery to ERL
    {o:IRL-2,h:IRL,l:IRL-8,c:IRL-7},{o:IRL-7,h:IRL-5,l:IRL-14,c:IRL-13},
    {o:IRL-13,h:IRL-11,l:ERL+2,c:ERL+3},{o:ERL+3,h:ERL+5,l:ERL,c:ERL+1},
  ]
  return {
    candles, di: 11,
    before: [
      level(RH, '#64748b','Range High (ERL)', false),
      level(RL, '#64748b','Range Low', false),
      level(IRL,'#f59e0b','IRL — Equal Lows'),
      level(ERL,'#f87171','ERL — Major Low'),
    ],
    after: [
      level(RH, '#64748b','Range High', false),
      level(IRL,'#f59e0b','IRL SWEPT'),
      level(ERL,'#f87171','ERL — TARGET'),
      mark(8,  'below','IRL SWEEP','#f59e0b'),
      mark(11, 'above','DECISION','#f59e0b'),
      mark(15, 'below','ERL REACHED','#f87171','circle'),
    ],
  }
}

// ── Scenario map ──────────────────────────────────────────────────────────────
function getDiagram(s: Scenario): DC {
  switch (s.id) {
    case 's01': return bullFVG()
    case 's02': return bearFVG()
    case 's03': return bearOBJudas()
    case 's04': return sslSweep()
    case 's05': return chochBull()
    case 's06': return amdBull()
    case 's07': return judasShort()
    case 's08': return silverBulletLong()
    case 's09': return breakerBear()
    case 's10': return bullOBDiscount()
    case 's11': return noSetup()
    case 's12': return bearFVG()
    case 's13': return oteZone()
    case 's14': return bslSweep()
    case 's15': return silverBulletShort()
    case 's16': return bosRetest()
    case 's17': return bslSweep()
    case 's18': return amdBull()
    case 's19': return amdBear()
    case 's20': return silverBulletShort()
    case 's21': return bslSweep()
    case 's22': return bullFVG()
    case 's23': return sslSweep()
    case 's24': return breakerBull()
    case 's25': return chochBull()
    case 's26': return silverBulletLong()
    case 's27': return bullFVG()
    case 's28': return bullFVG()
    case 's29': return sslSweep()
    case 's30': return noSetup()
    case 's31': return amdBull()
    case 's32': return judasLong()
    case 's33': return mitigationBlockLong()
    case 's34': return breakerBear()
    case 's35': return irlToErl()
    case 's36': return bslSweep()
    case 's37': return oteZone()
    case 's38': return amdBear()
    case 's39': return judasLong()
    case 's40': return judasShort()
    case 's41': return bslSweep()
    case 's42': return sslSweep()
    case 's43': return amdBull()
    case 's44': return chochBull()
    case 's45': return breakerBear()
    case 's46': return bullOBDiscount()
    case 's47': return bullFVG()
    case 's48': return bearFVG()
    case 's49': return noSetup()
    case 's50': return bslSweep()
    case 's51': return amdBear()
    case 's52': return judasShort()
    case 's53': return bosRetest()
    case 's54': return chochBull()
    case 's55': return bullOBDiscount()
    case 's56': return silverBulletLong()
    case 's57': return irlToErl()
    case 's58': return noSetup()
    case 's59': return judasShort()
    case 's60': return bearOBJudas()
    default:    return bullFVG()
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ConceptDiagram({ mode, scenario }: { mode: 'before'|'after'; scenario: Scenario }) {
  const { candles, di, before, after } = useMemo(() => getDiagram(scenario), [scenario.id])
  const showN  = mode === 'before' ? di + 1 : candles.length
  const annots = mode === 'before' ? before : after

  return (
    <div className="rounded-2xl border border-slate-800/50 overflow-hidden relative"
         style={{ background:'#06060e', height:360 }}>

      <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-500" style={{fontFamily:'monospace'}}>
          {scenario.instrument}
        </span>
        <span className="text-[10px] text-slate-700">{scenario.timeframe}</span>
      </div>

      {mode === 'before' && (
        <div className="absolute bottom-3 right-4 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-wide">DECISION POINT</span>
          </div>
        </div>
      )}
      {mode === 'after' && (
        <div className="absolute bottom-3 right-4 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 tracking-wide">CONCEPT REVEALED</span>
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet"
           style={{width:'100%', height:'100%'}}>
        <defs><style>{CSS}</style></defs>
        <rect width={VW} height={VH} fill="#06060e" />

        {/* subtle grid */}
        {[25,50,75].map(p => (
          <line key={p} x1={2} y1={py(p)} x2={CR-2} y2={py(p)} stroke="#1e293b" strokeWidth={1} />
        ))}

        {/* zones (behind candles) */}
        {(annots.filter(a => a.k==='zone') as Extract<Ann,{k:'zone'}>[]).map((a,i) =>
          <ZoneEl key={i} a={a} />
        )}

        {/* candles */}
        {candles.slice(0,showN).map((d,i) => <Candle key={i} i={i} d={d} del={i*.018} />)}

        {/* decision pulse */}
        {mode === 'before' && <DecisionPulse di={di} cs={candles} />}

        {/* levels */}
        {(annots.filter(a => a.k==='level') as Extract<Ann,{k:'level'}>[]).map((a,i) =>
          <LevelEl key={i} a={a} del={mode==='after' ? i*.07 : 0} />
        )}

        {/* marks */}
        {(annots.filter(a => a.k==='mark') as Extract<Ann,{k:'mark'}>[]).map((a,i) =>
          <MarkEl key={i} a={a} cs={candles} del={mode==='after' ? .3+i*.07 : 0} />
        )}
      </svg>
    </div>
  )
}
