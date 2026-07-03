// Refetch all 30 scenarios using end_date so we get real historical data.
// Free tier ignores start_date — end_date works and gives data ending at that point.
// Run: TWELVEDATA_KEY=<your key> node scripts/fetchChartData.mjs
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '../public/chart-data')
const KEY   = process.env.TWELVEDATA_KEY
if (!KEY) {
  console.error('Missing TWELVEDATA_KEY environment variable. Get a key at https://twelvedata.com and run:\n  TWELVEDATA_KEY=<your key> node scripts/fetchChartData.mjs')
  process.exit(1)
}
const BASE  = 'https://api.twelvedata.com/time_series'

// end_date = the LAST bar in the window; di = decisionIndex (bars before the reveal)
// For 15m NY AM: end_date is late evening UTC so the NY session bars + aftermath are all captured
// For 5m NY AM: end_date is late afternoon UTC
// Dates spread across Jun–Dec 2025 (within the 1-year free tier history)
const SCENARIOS = [
  { id:'s01', symbol:'EUR/USD', interval:'15min', end:'2025-06-10 23:45:00', size:120, di:80 },
  { id:'s02', symbol:'GBP/USD', interval:'5min',  end:'2025-06-18 18:00:00', size:150, di:100 },
  { id:'s03', symbol:'EUR/USD', interval:'15min', end:'2025-06-26 23:45:00', size:120, di:80 },
  { id:'s04', symbol:'USD/JPY', interval:'15min', end:'2025-07-03 23:45:00', size:120, di:80 },
  { id:'s05', symbol:'EUR/USD', interval:'5min',  end:'2025-07-10 18:00:00', size:150, di:100 },
  { id:'s06', symbol:'GBP/JPY', interval:'15min', end:'2025-07-16 23:45:00', size:120, di:80 },
  { id:'s07', symbol:'EUR/USD', interval:'5min',  end:'2025-07-23 18:00:00', size:150, di:100 },
  { id:'s08', symbol:'GBP/USD', interval:'1min',  end:'2025-07-30 15:00:00', size:200, di:150 },
  { id:'s09', symbol:'EUR/USD', interval:'15min', end:'2025-08-05 23:45:00', size:120, di:80 },
  { id:'s10', symbol:'XAU/USD', interval:'1h',    end:'2025-08-12 23:00:00', size:80,  di:55 },
  { id:'s11', symbol:'EUR/USD', interval:'15min', end:'2025-08-20 23:45:00', size:120, di:80 },
  { id:'s12', symbol:'GBP/USD', interval:'5min',  end:'2025-08-27 18:00:00', size:150, di:100 },
  { id:'s13', symbol:'EUR/USD', interval:'15min', end:'2025-09-03 18:00:00', size:120, di:80 },
  { id:'s14', symbol:'XAU/USD', interval:'15min', end:'2025-09-10 18:00:00', size:120, di:80 },
  { id:'s15', symbol:'GBP/USD', interval:'1min',  end:'2025-09-17 19:30:00', size:200, di:150 },
  { id:'s16', symbol:'EUR/USD', interval:'5min',  end:'2025-09-24 18:00:00', size:150, di:100 },
  { id:'s17', symbol:'GBP/USD', interval:'15min', end:'2025-10-01 23:45:00', size:120, di:80 },
  { id:'s18', symbol:'EUR/USD', interval:'15min', end:'2025-10-08 23:45:00', size:120, di:80 },
  { id:'s19', symbol:'GBP/JPY', interval:'15min', end:'2025-10-15 23:45:00', size:120, di:80 },
  { id:'s20', symbol:'EUR/USD', interval:'1min',  end:'2025-10-22 15:00:00', size:200, di:150 },
  { id:'s21', symbol:'GBP/USD', interval:'5min',  end:'2025-10-29 18:00:00', size:150, di:100 },
  { id:'s22', symbol:'EUR/USD', interval:'15min', end:'2025-11-05 23:45:00', size:120, di:80 },
  { id:'s23', symbol:'XAU/USD', interval:'15min', end:'2025-11-12 18:00:00', size:120, di:80 },
  { id:'s24', symbol:'GBP/USD', interval:'15min', end:'2025-11-19 23:45:00', size:120, di:80 },
  { id:'s25', symbol:'EUR/USD', interval:'1h',    end:'2025-11-26 23:00:00', size:80,  di:55 },
  { id:'s26', symbol:'XAU/USD', interval:'1min',  end:'2025-12-03 09:00:00', size:200, di:150 },
  { id:'s27', symbol:'EUR/USD', interval:'15min', end:'2025-12-10 23:45:00', size:120, di:80 },
  { id:'s28', symbol:'GBP/USD', interval:'5min',  end:'2025-12-17 18:00:00', size:150, di:100 },
  { id:'s29', symbol:'EUR/USD', interval:'15min', end:'2025-12-23 23:45:00', size:120, di:80 },
  { id:'s30', symbol:'GBP/USD', interval:'15min', end:'2025-12-30 23:45:00', size:120, di:80 },
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
      process.stdout.write(`[${i+1}/30] ${s.id} ${s.symbol} ${s.interval} ${s.end.slice(0,10)} ... `)
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
