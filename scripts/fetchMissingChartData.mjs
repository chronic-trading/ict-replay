// Backfill chart data for s31–s38 (added after the original 30 were fetched).
// Same approach as fetchChartData.mjs. Run: TWELVEDATA_KEY=<your key> node scripts/fetchMissingChartData.mjs
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '../public/chart-data')
const KEY   = process.env.TWELVEDATA_KEY
if (!KEY) {
  console.error('Missing TWELVEDATA_KEY environment variable. Get a key at https://twelvedata.com and run:\n  TWELVEDATA_KEY=<your key> node scripts/fetchMissingChartData.mjs')
  process.exit(1)
}
const BASE  = 'https://api.twelvedata.com/time_series'

const SCENARIOS = [
  { id:'s31', symbol:'EUR/USD', interval:'15min', end:'2026-01-07 23:45:00', size:120, di:80  },
  { id:'s32', symbol:'GBP/USD', interval:'5min',  end:'2026-01-14 12:00:00', size:150, di:100 },
  { id:'s33', symbol:'EUR/USD', interval:'15min', end:'2026-01-21 23:45:00', size:120, di:80  },
  { id:'s34', symbol:'GBP/USD', interval:'5min',  end:'2026-02-04 18:00:00', size:150, di:100 },
  { id:'s35', symbol:'XAU/USD', interval:'15min', end:'2026-02-18 18:00:00', size:120, di:80  },
  { id:'s36', symbol:'EUR/USD', interval:'5min',  end:'2026-03-04 18:00:00', size:150, di:100 },
  { id:'s37', symbol:'GBP/USD', interval:'15min', end:'2026-03-18 16:00:00', size:120, di:80  },
  { id:'s38', symbol:'EUR/USD', interval:'15min', end:'2026-04-01 23:45:00', size:120, di:80  },
]

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function fetchOne(s) {
  const url = `${BASE}?symbol=${encodeURIComponent(s.symbol)}&interval=${s.interval}` +
    `&end_date=${encodeURIComponent(s.end)}&outputsize=${s.size}` +
    `&apikey=${KEY}&timezone=UTC&format=JSON`

  const res  = await fetch(url)
  const data = await res.json()

  if (data.status === 'error') throw new Error(data.message)
  if (!Array.isArray(data.values) || data.values.length === 0) throw new Error('no data')

  const bars = data.values.reverse().map(v => ({
    time:  Math.floor(new Date(v.datetime.replace(' ', 'T') + 'Z').getTime() / 1000),
    open:  parseFloat(v.open),
    high:  parseFloat(v.high),
    low:   parseFloat(v.low),
    close: parseFloat(v.close),
  }))

  return { id: s.id, symbol: s.symbol, interval: s.interval, decisionIndex: s.di, bars }
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  let ok = 0, fail = 0

  for (let i = 0; i < SCENARIOS.length; i++) {
    const s = SCENARIOS[i]
    try {
      process.stdout.write(`[${i+1}/${SCENARIOS.length}] ${s.id} ${s.symbol} ${s.interval} ${s.end.slice(0,10)} ... `)
      const data = await fetchOne(s)
      const first = new Date(data.bars[0].time * 1000).toISOString().slice(0,16)
      const last  = new Date(data.bars[data.bars.length-1].time * 1000).toISOString().slice(0,16)
      writeFileSync(join(OUT, `${s.id}.json`), JSON.stringify(data))
      console.log(`✓ ${data.bars.length} bars  ${first} → ${last}`)
      ok++
    } catch (e) {
      console.log(`✗ ${e.message}`)
      fail++
    }
    if (i < SCENARIOS.length - 1) await sleep(8000)
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main()
