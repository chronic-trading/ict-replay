// Fetch chart data for scenarios s39–s60.
// Requires TWELVEDATA_KEY in the environment (no hardcoded keys):
//   PowerShell: $env:TWELVEDATA_KEY='...'; node scripts/fetchNewScenarioData.mjs
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = join(__dir, '../public/chart-data')
const KEY   = process.env.TWELVEDATA_KEY
const BASE  = 'https://api.twelvedata.com/time_series'

if (!KEY) {
  console.error('TWELVEDATA_KEY is not set. Export it and re-run.')
  process.exit(1)
}

// Weekday end-dates across Apr–Jun 2026 (within free-tier 1y history)
const SCENARIOS = [
  { id:'s39', symbol:'EUR/USD', interval:'15min', end:'2026-04-07 23:45:00', size:120, di:80  },
  { id:'s40', symbol:'GBP/USD', interval:'5min',  end:'2026-04-08 20:00:00', size:150, di:100 },
  { id:'s41', symbol:'EUR/USD', interval:'15min', end:'2026-04-09 23:45:00', size:120, di:80  },
  { id:'s42', symbol:'GBP/USD', interval:'5min',  end:'2026-04-14 12:00:00', size:150, di:100 },
  { id:'s43', symbol:'XAU/USD', interval:'15min', end:'2026-04-15 18:00:00', size:120, di:80  },
  { id:'s44', symbol:'EUR/USD', interval:'5min',  end:'2026-04-16 18:00:00', size:150, di:100 },
  { id:'s45', symbol:'GBP/USD', interval:'15min', end:'2026-04-21 23:45:00', size:120, di:80  },
  { id:'s46', symbol:'EUR/USD', interval:'15min', end:'2026-04-22 23:45:00', size:120, di:80  },
  { id:'s47', symbol:'GBP/USD', interval:'15min', end:'2026-04-23 16:00:00', size:120, di:80  },
  { id:'s48', symbol:'EUR/USD', interval:'15min', end:'2026-04-28 23:45:00', size:120, di:80  },
  { id:'s49', symbol:'GBP/USD', interval:'5min',  end:'2026-04-29 18:00:00', size:150, di:100 },
  { id:'s50', symbol:'EUR/USD', interval:'15min', end:'2026-04-30 23:45:00', size:120, di:80  },
  { id:'s51', symbol:'GBP/USD', interval:'5min',  end:'2026-05-05 18:00:00', size:150, di:100 },
  { id:'s52', symbol:'GBP/USD', interval:'5min',  end:'2026-05-06 12:00:00', size:150, di:100 },
  { id:'s53', symbol:'EUR/USD', interval:'5min',  end:'2026-05-07 20:00:00', size:150, di:100 },
  { id:'s54', symbol:'EUR/USD', interval:'15min', end:'2026-05-13 18:00:00', size:120, di:80  },
  { id:'s55', symbol:'XAU/USD', interval:'5min',  end:'2026-05-20 16:00:00', size:150, di:100 },
  { id:'s56', symbol:'GBP/USD', interval:'15min', end:'2026-05-27 18:00:00', size:120, di:80  },
  { id:'s57', symbol:'EUR/USD', interval:'1h',    end:'2026-06-03 23:00:00', size:80,  di:55  },
  { id:'s58', symbol:'EUR/USD', interval:'15min', end:'2026-06-10 20:00:00', size:120, di:80  },
  { id:'s59', symbol:'GBP/USD', interval:'15min', end:'2026-06-17 18:00:00', size:120, di:80  },
  { id:'s60', symbol:'GBP/USD', interval:'15min', end:'2026-06-24 23:45:00', size:120, di:80  },
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
      writeFileSync(join(OUT, `${s.id}.json`), JSON.stringify(data))
      console.log(`ok ${data.bars.length} bars`)
      ok++
    } catch (e) {
      console.log(`FAIL ${e.message}`)
      fail++
    }
    if (i < SCENARIOS.length - 1) await sleep(8500)
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`)
}

main()
