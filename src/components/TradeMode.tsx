import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'
import { createChart, ColorType, CandlestickSeries, LineStyle, createSeriesMarkers } from 'lightweight-charts'
import type { Scenario } from '../data/scenarios'

export interface Bar { time: number; open: number; high: number; low: number; close: number }

export interface ChartFile {
  id: string
  symbol: string
  interval: string
  decisionIndex: number
  bars: Bar[]
}

export type TradeOutcome = 'target' | 'stopped' | 'expired' | 'nofill'

export interface TradeOutcomeInfo {
  direction: 'long' | 'short'
  outcome: TradeOutcome
  r: number
}

type Phase = 'setup' | 'playing' | 'paused' | 'done'
type Level = 'entry' | 'sl' | 'tp'

// `color` is the real hex the chart library draws price lines with; `ink` is the
// theme-aware, contrast-safe version used for UI text/borders on the panel.
const LEVEL_META: Record<Level, { label: string; color: string; ink: string }> = {
  entry: { label: 'Entry',  color: '#f59e0b', ink: 'var(--rp-amber)' },
  sl:    { label: 'Stop',   color: '#f87171', ink: 'var(--rp-red)' },
  tp:    { label: 'Target', color: '#34d399', ink: 'var(--rp-green)' },
}

const SPEEDS = [
  { label: '1×', ms: 400 },
  { label: '2×', ms: 200 },
  { label: '4×', ms: 100 },
]

function decimalsFor(price: number) {
  if (price >= 500) return 2
  if (price >= 10)  return 2
  return 5
}
export function TradeMode({ scenario, chart: file, onExit, onComplete }: {
  scenario: Scenario
  chart: ChartFile
  onExit: () => void
  onComplete: (t: TradeOutcomeInfo) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef     = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef    = useRef<any>(null)
  const markersRef   = useRef<any>(null)
  const linesRef     = useRef<Partial<Record<Level, any>>>({})
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  const lastClose = file.bars[file.decisionIndex - 1].close

  const [direction, setDirection] = useState<'long' | 'short'>('long')
  const [levels, setLevels]       = useState<Record<Level, number>>(() => prefill('long'))
  const [armed, setArmed]         = useState<Level | null>('entry')
  const [phase, setPhase]         = useState<Phase>('setup')
  const [speedIdx, setSpeedIdx]   = useState(1)
  const [result, setResult]       = useState<TradeOutcomeInfo | null>(null)

  // Mutable playback state (avoids stale closures in the interval)
  const playRef = useRef({ barIndex: 0, filled: false, fillIndex: -1 })
  const armedRef = useRef(armed)
  armedRef.current = armed

  function prefill(dir: 'long' | 'short'): Record<Level, number> {
    const recent = file.bars.slice(Math.max(0, file.decisionIndex - 12), file.decisionIndex)
    const entry  = lastClose
    if (dir === 'long') {
      const sl = Math.min(...recent.map(b => b.low))
      return { entry, sl, tp: entry + 2 * (entry - sl) }
    }
    const sl = Math.max(...recent.map(b => b.high))
    return { entry, sl, tp: entry - 2 * (sl - entry) }
  }

  const validation = ((): string | null => {
    const { entry, sl, tp } = levels
    if ([entry, sl, tp].some(v => !Number.isFinite(v) || v <= 0)) return 'Set all three levels'
    if (direction === 'long'  && !(sl < entry && entry < tp)) return 'Long needs Stop < Entry < Target'
    if (direction === 'short' && !(tp < entry && entry < sl)) return 'Short needs Target < Entry < Stop'
    return null
  })()

  // ── Chart lifecycle ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout:          { background: { type: ColorType.Solid, color: '#06060e' }, textColor: '#64748b' },
      grid:            { vertLines: { color: 'rgba(255,255,255,0.025)' }, horzLines: { color: 'rgba(255,255,255,0.025)' } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale:       { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false, rightOffset: 4 },
      width:  containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#34d399', downColor: '#f87171',
      borderUpColor: '#34d399', borderDownColor: '#f87171',
      wickUpColor: '#34d399', wickDownColor: '#f87171',
    })
    series.setData(file.bars.slice(0, file.decisionIndex) as any)
    chart.timeScale().fitContent()

    chart.subscribeClick(param => {
      const lvl = armedRef.current
      if (!lvl || !param.point) return
      const price = series.coordinateToPrice(param.point.y)
      if (price == null) return
      const p = Number(Number(price).toFixed(decimalsFor(lastClose)))
      setLevels(prev => ({ ...prev, [lvl]: p }))
    })

    chartRef.current  = chart
    seriesRef.current = series
    markersRef.current = createSeriesMarkers(series, [])

    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
    })
    ro.observe(containerRef.current)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      ro.disconnect(); chart.remove()
      chartRef.current = null; seriesRef.current = null; markersRef.current = null; linesRef.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Level price lines ───────────────────────────────────────────────────────
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return
    ;(Object.keys(LEVEL_META) as Level[]).forEach(lvl => {
      const existing = linesRef.current[lvl]
      if (existing) { try { series.removePriceLine(existing) } catch { /* removed with chart */ } }
      if (!Number.isFinite(levels[lvl]) || levels[lvl] <= 0) return
      linesRef.current[lvl] = series.createPriceLine({
        price: levels[lvl],
        color: LEVEL_META[lvl].color,
        lineWidth: 1,
        lineStyle: lvl === 'entry' ? LineStyle.Solid : LineStyle.Dashed,
        axisLabelVisible: true,
        title: LEVEL_META[lvl].label,
      })
    })
  }, [levels])

  const riskR = ((): number | null => {
    const risk = Math.abs(levels.entry - levels.sl)
    if (!risk) return null
    return Math.abs(levels.tp - levels.entry) / risk
  })()

  // ── Playback ────────────────────────────────────────────────────────────────
  const finish = useCallback((outcome: TradeOutcome, exitPrice: number | null, exitBar: number) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    const { entry, sl } = levels
    const risk = Math.abs(entry - sl)
    let r = 0
    if (outcome !== 'nofill' && exitPrice != null && risk > 0) {
      r = direction === 'long' ? (exitPrice - entry) / risk : (entry - exitPrice) / risk
      r = Math.round(r * 100) / 100
    }
    if (outcome !== 'nofill' && exitBar >= 0 && markersRef.current) {
      const pl = playRef.current
      const marks: any[] = []
      if (pl.fillIndex >= 0) marks.push({
        time: file.bars[pl.fillIndex].time, position: direction === 'long' ? 'belowBar' : 'aboveBar',
        color: '#f59e0b', shape: direction === 'long' ? 'arrowUp' : 'arrowDown', text: 'FILL',
      })
      marks.push({
        time: file.bars[exitBar].time, position: direction === 'long' ? 'aboveBar' : 'belowBar',
        color: outcome === 'target' ? '#34d399' : outcome === 'stopped' ? '#f87171' : '#94a3b8',
        shape: 'circle', text: outcome === 'target' ? 'TP' : outcome === 'stopped' ? 'SL' : 'EOD',
      })
      markersRef.current.setMarkers(marks)
    }
    const res: TradeOutcomeInfo = { direction, outcome, r }
    setResult(res)
    setPhase('done')
    if (outcome !== 'nofill') onComplete(res)
  }, [levels, direction, file.bars, onComplete])

  const stepBar = useCallback(() => {
    const pl = playRef.current
    const i  = pl.barIndex
    if (i >= file.bars.length) {
      // Data exhausted
      if (!pl.filled) { finish('nofill', null, -1); return }
      finish('expired', file.bars[file.bars.length - 1].close, file.bars.length - 1)
      return
    }
    const bar = file.bars[i]
    seriesRef.current?.update(bar)
    chartRef.current?.timeScale().scrollToRealTime()

    const { entry, sl, tp } = levels
    if (!pl.filled) {
      if (bar.low <= entry && entry <= bar.high) { pl.filled = true; pl.fillIndex = i }
    }
    if (pl.filled) {
      // Conservative: assume the stop is hit first when both fall inside one bar
      if (direction === 'long') {
        if (bar.low  <= sl) { finish('stopped', sl, i); return }
        if (bar.high >= tp) { finish('target',  tp, i); return }
      } else {
        if (bar.high >= sl) { finish('stopped', sl, i); return }
        if (bar.low  <= tp) { finish('target',  tp, i); return }
      }
    }
    pl.barIndex = i + 1
  }, [levels, direction, file.bars, finish])

  const start = () => {
    if (validation) return
    setArmed(null)
    playRef.current = { barIndex: file.decisionIndex, filled: false, fillIndex: -1 }
    setPhase('playing')
    timerRef.current = setInterval(stepBar, SPEEDS[speedIdx].ms)
  }
  const pause = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setPhase('paused')
  }
  const resume = () => {
    setPhase('playing')
    timerRef.current = setInterval(stepBar, SPEEDS[speedIdx].ms)
  }
  const reset = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    playRef.current = { barIndex: file.decisionIndex, filled: false, fillIndex: -1 }
    markersRef.current?.setMarkers([])
    seriesRef.current?.setData(file.bars.slice(0, file.decisionIndex) as any)
    chartRef.current?.timeScale().fitContent()
    setResult(null)
    setPhase('setup')
    setArmed('entry')
  }
  const changeSpeed = (idx: number) => {
    setSpeedIdx(idx)
    if (phase === 'playing' && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = setInterval(stepBar, SPEEDS[idx].ms)
    }
  }
  const switchDirection = (dir: 'long' | 'short') => {
    setDirection(dir)
    setLevels(prefill(dir))
  }

  const inSetup = phase === 'setup'

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="rounded-2xl overflow-hidden border border-slate-800/50 relative"
           style={{ background: '#06060e', height: 380 }}>
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{file.symbol}</span>
          <span className="text-[10px] text-slate-400">{file.interval}</span>
        </div>
        {inSetup && armed && (
          <div className="absolute bottom-3 left-4 z-10 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60">
            <span className="text-[10px] font-semibold" style={{ color: LEVEL_META[armed].color }}>
              Tap the chart to set {LEVEL_META[armed].label}
            </span>
          </div>
        )}
        {phase === 'playing' && (
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 border border-amber-600">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'#3a2600' }} />
            <span className="text-[10px] font-bold tracking-wide" style={{ color:'#3a2600' }}>REPLAYING</span>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Setup / controls */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: 'var(--rp-surface)', borderColor: 'var(--rp-border)' }}>
        {/* Direction + levels */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--rp-text-faint)' }}>Direction</p>
            <div className="flex gap-1.5">
              {(['long', 'short'] as const).map(d => (
                <button key={d} onClick={() => inSetup && switchDirection(d)} disabled={!inSetup}
                  className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border"
                  style={{
                    background: direction === d ? (d === 'long' ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)') : 'transparent',
                    borderColor: direction === d ? (d === 'long' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)') : 'var(--rp-border)',
                    color: direction === d ? (d === 'long' ? 'var(--rp-green)' : 'var(--rp-red)') : 'var(--rp-text-faint)',
                    cursor: inSetup ? 'pointer' : 'default',
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {(Object.keys(LEVEL_META) as Level[]).map(lvl => (
            <div key={lvl}>
              <button onClick={() => inSetup && setArmed(armed === lvl ? null : lvl)} disabled={!inSetup}
                className="text-[10px] font-black uppercase tracking-widest mb-1.5 block transition-all"
                style={{ color: armed === lvl && inSetup ? LEVEL_META[lvl].ink : 'var(--rp-text-faint)', cursor: inSetup ? 'pointer' : 'default' }}>
                {LEVEL_META[lvl].label} {armed === lvl && inSetup ? '◉' : ''}
              </button>
              <input
                type="number" step="any" inputMode="decimal"
                value={Number.isFinite(levels[lvl]) ? levels[lvl] : ''}
                disabled={!inSetup}
                onFocus={() => inSetup && setArmed(lvl)}
                onChange={e => setLevels(p => ({ ...p, [lvl]: parseFloat(e.target.value) }))}
                className="w-28 px-3 py-2 rounded-xl text-[12px] font-semibold border outline-none transition-all"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'var(--rp-surface-2)',
                  borderColor: armed === lvl && inSetup ? LEVEL_META[lvl].color + '80' : 'var(--rp-border)',
                  color: LEVEL_META[lvl].ink,
                }}
              />
            </div>
          ))}

          <div className="ml-auto text-right">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--rp-text-faint)' }}>Planned</p>
            <p className="text-[16px] font-black" style={{ fontFamily: "'JetBrains Mono', monospace", color: riskR ? 'var(--rp-text)' : 'var(--rp-text-faint)' }}>
              {riskR ? `${riskR.toFixed(1)}R` : '—'}
            </p>
          </div>
        </div>

        {validation && inSetup && (
          <p className="text-[11px] font-semibold" style={{ color: 'var(--rp-amber)' }}>⚠ {validation}</p>
        )}

        {/* Transport */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--rp-border)' }}>
          {inSetup && (
            <button onClick={start} disabled={!!validation}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black tracking-wide transition-all border-0"
              style={{
                background: validation ? 'rgba(30,41,59,0.5)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: validation ? '#475569' : '#0a0800',
                cursor: validation ? 'not-allowed' : 'pointer',
              }}>
              <Play size={13} strokeWidth={2.5} fill="currentColor" /> Play the tape
            </button>
          )}
          {phase === 'playing' && (
            <button onClick={pause} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold border cursor-pointer" style={{ background: 'transparent', borderColor: 'var(--rp-border)', color: 'var(--rp-text-dim)' }}>
              <Pause size={13} strokeWidth={2.5} fill="currentColor" /> Pause
            </button>
          )}
          {phase === 'paused' && (
            <button onClick={resume} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold border cursor-pointer" style={{ background: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.4)', color: 'var(--rp-amber)' }}>
              <Play size={13} strokeWidth={2.5} fill="currentColor" /> Resume
            </button>
          )}
          {(phase === 'done' || phase === 'paused') && (
            <button onClick={reset} className="px-4 py-2.5 rounded-xl text-[12px] font-bold border cursor-pointer" style={{ background: 'transparent', borderColor: 'var(--rp-border)', color: 'var(--rp-text-dim)' }}>
              ↺ Try again
            </button>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] font-black uppercase tracking-widest mr-1" style={{ color: 'var(--rp-text-faint)' }}>Speed</span>
            {SPEEDS.map((s, i) => (
              <button key={s.label} onClick={() => changeSpeed(i)}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer"
                style={{
                  background: speedIdx === i ? 'rgba(245,158,11,0.12)' : 'transparent',
                  borderColor: speedIdx === i ? 'rgba(245,158,11,0.35)' : 'var(--rp-border)',
                  color: speedIdx === i ? 'var(--rp-amber)' : 'var(--rp-text-faint)',
                }}>
                {s.label}
              </button>
            ))}
          </div>

          <button onClick={onExit} className="px-4 py-2.5 rounded-xl text-[12px] font-bold border transition-all cursor-pointer" style={{ background: 'transparent', borderColor: 'var(--rp-border)', color: 'var(--rp-text-dim)' }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-2xl border p-5 text-center space-y-3 pop-in"
             style={{
               background: result.outcome === 'target' ? 'rgba(52,211,153,0.06)' : result.outcome === 'stopped' ? 'rgba(248,113,113,0.06)' : 'var(--rp-surface)',
               borderColor: result.outcome === 'target' ? 'rgba(52,211,153,0.3)' : result.outcome === 'stopped' ? 'rgba(248,113,113,0.3)' : 'var(--rp-border)',
             }}>
          <p className="text-5xl font-black leading-none m-0"
             style={{ fontFamily: "'JetBrains Mono', monospace", color: result.outcome === 'target' ? 'var(--rp-green)' : result.outcome === 'stopped' ? 'var(--rp-red)' : 'var(--rp-text-dim)' }}>
            {result.outcome === 'nofill' ? 'NO FILL' : `${result.r >= 0 ? '+' : ''}${result.r}R`}
          </p>
          <p className="text-sm font-bold m-0" style={{ color: result.outcome === 'target' ? 'var(--rp-green)' : result.outcome === 'stopped' ? 'var(--rp-red)' : 'var(--rp-text-dim)' }}>
            {result.outcome === 'target'  && 'Target hit — clean execution'}
            {result.outcome === 'stopped' && 'Stopped out — review your level placement'}
            {result.outcome === 'expired' && 'Marked to market at the end of the data'}
            {result.outcome === 'nofill'  && 'Your limit order was never touched — entry too far from price'}
          </p>
          {scenario.rAchieved != null && result.outcome !== 'nofill' && (
            <p className="text-[11px] m-0" style={{ color: 'var(--rp-text-dim)' }}>
              The scenario's documented outcome was <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: scenario.result === 'worked' ? 'var(--rp-green)' : 'var(--rp-red)' }}>
                {scenario.result === 'worked' ? '+' : ''}{scenario.rAchieved}R
              </span> — {scenario.result}.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
