import { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, CandlestickSeries, LineStyle } from 'lightweight-charts'

interface Bar { time: number; open: number; high: number; low: number; close: number }

interface Annotation {
  type:      'line'
  price:     number
  color:     string
  title:     string
  style?:    'solid' | 'dashed'
  axisLabel?: boolean
}

interface AfterMarker {
  barIndex:  number
  position:  'above' | 'below'
  text:      string
  color:     string
  shape:     string
  size?:     number
}

interface ChartFile {
  id:                 string
  symbol:             string
  interval:           string
  decisionIndex:      number
  bars:               Bar[]
  beforeAnnotations?: Annotation[]
  afterAnnotations?:  Annotation[]
  afterMarkers?:      AfterMarker[]
}

interface Props {
  mode:       'before' | 'after'
  scenarioId: string
}

const LINE_STYLE: Record<string, number> = {
  solid:  LineStyle.Solid,
  dashed: LineStyle.Dashed,
}

export function ReplayChartLW({ mode, scenarioId }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const chartRef      = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef     = useRef<any>(null)
  const priceLinesRef = useRef<any[]>([])
  const [data,    setData]    = useState<ChartFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    fetch(`${import.meta.env.BASE_URL}chart-data/${scenarioId}.json`)
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [scenarioId])

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      layout:          { background: { type: ColorType.Solid, color: '#06060e' }, textColor: '#64748b' },
      grid:            { vertLines: { color: 'rgba(255,255,255,0.025)' }, horzLines: { color: 'rgba(255,255,255,0.025)' } },
      crosshair:       { mode: 1 },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale:       { borderColor: 'rgba(255,255,255,0.06)', timeVisible: true, secondsVisible: false },
      width:  containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#34d399', downColor: '#f87171',
      borderUpColor: '#34d399', borderDownColor: '#f87171',
      wickUpColor: '#34d399', wickDownColor: '#f87171',
    })
    chartRef.current = chart; seriesRef.current = series
    const ro = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current)
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight })
    })
    ro.observe(containerRef.current)
    return () => { ro.disconnect(); chart.remove(); chartRef.current = null; seriesRef.current = null }
  }, [])

  useEffect(() => {
    const series = seriesRef.current
    if (!series || !data) return

    const visible = mode === 'before'
      ? data.bars.slice(0, data.decisionIndex)
      : data.bars
    series.setData(visible)

    // Clear old price lines then render annotations for this mode
    priceLinesRef.current.forEach(pl => { try { series.removePriceLine(pl) } catch {} })
    priceLinesRef.current = []
    const annots = mode === 'before' ? (data.beforeAnnotations ?? []) : (data.afterAnnotations ?? [])
    annots.forEach((a: Annotation) => {
      const pl = series.createPriceLine({
        price:             a.price,
        color:             a.color,
        lineWidth:         1,
        lineStyle:         LINE_STYLE[a.style ?? 'dashed'] ?? LineStyle.Dashed,
        axisLabelVisible:  a.axisLabel !== false,
        title:             a.title ?? '',
      })
      priceLinesRef.current.push(pl)
    })

    // Markers (after mode only)
    if (mode === 'after' && data.afterMarkers?.length) {
      const markers = data.afterMarkers
        .filter((m: AfterMarker) => m.barIndex < data.bars.length)
        .map((m: AfterMarker) => ({
          time:     data.bars[m.barIndex].time,
          position: m.position === 'above' ? 'aboveBar' : 'belowBar',
          color:    m.color,
          shape:    (m.shape === 'arrowUp' ? 'arrowUp' : m.shape === 'arrowDown' ? 'arrowDown' : 'circle') as any,
          text:     m.text,
          size:     m.size ?? 1,
        }))
        .sort((a: any, b: any) => a.time - b.time)
      series.setMarkers(markers)
    }

    chartRef.current?.timeScale().fitContent()
  }, [data, mode])

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800/50 relative"
         style={{ background: '#06060e', height: 360 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[11px] text-slate-600 animate-pulse">Loading chart…</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[11px] text-red-400">Chart unavailable</div>
        </div>
      )}
      {!loading && !error && data && mode === 'before' && (
        <div className="absolute bottom-3 right-4 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 tracking-wide">DECISION POINT</span>
          </div>
        </div>
      )}
      {!loading && !error && data && mode === 'after' && (
        <div className="absolute bottom-3 right-4 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-400 tracking-wide">CONCEPT REVEALED</span>
          </div>
        </div>
      )}
      {!loading && !error && data && (
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{data.symbol}</span>
          <span className="text-[10px] text-slate-700">{data.interval}</span>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
