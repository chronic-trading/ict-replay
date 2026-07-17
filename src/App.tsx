import { useState, useRef, useEffect } from 'react'
import { Target, Zap, Check, X, GraduationCap, Moon, Sun, Star } from 'lucide-react'
import { scenarios, type Scenario, type Category, type Difficulty } from './data/scenarios'
import { ConceptDiagram } from './components/ConceptDiagram'
import { SuiteBar } from './components/SuiteBar'
import { TradeMode, type ChartFile, type TradeOutcomeInfo } from './components/TradeMode'
import { ExamMode } from './components/ExamMode'
import { GlossaryText } from './components/GlossaryText'
import { useProgress } from './hooks/useProgress'
import { useTheme } from './hooks/useTheme'
import './index.css'
import './brand.css'

// Vivid hue per category (used for decorative glows/tints — safe on both themes);
// `ink` is the theme-aware, contrast-safe version used for solid text/dots.
const CAT: Record<Category,{label:string;color:string;ink:string;bg:string;border:string}> = {
  'fvg':              {label:'Fair Value Gap',  color:'#f59e0b',ink:'var(--rp-amber)', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)' },
  'order-block':      {label:'Order Block',     color:'#60a5fa',ink:'var(--rp-blue)',  bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.3)' },
  'liquidity':        {label:'Liquidity',       color:'#34d399',ink:'var(--rp-green)', bg:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.3)' },
  'market-structure': {label:'Mkt Structure',   color:'#c084fc',ink:'var(--rp-violet)',bg:'rgba(192,132,252,0.1)',border:'rgba(192,132,252,0.3)'},
  'amd':              {label:'AMD Cycle',        color:'#fb923c',ink:'var(--rp-orange)',bg:'rgba(251,146,60,0.1)', border:'rgba(251,146,60,0.3)' },
  'kill-zone':        {label:'Kill Zone',        color:'#f472b6',ink:'var(--rp-pink)',  bg:'rgba(244,114,182,0.1)',border:'rgba(244,114,182,0.3)'},
  'judas-swing':      {label:'Judas Swing',     color:'#a78bfa',ink:'var(--rp-violet)',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.3)'},
  'full-model':       {label:'Full Model',      color:'#94a3b8',ink:'var(--rp-slate)', bg:'rgba(148,163,184,0.1)',border:'rgba(148,163,184,0.3)'},
}
const DIFF: Record<Difficulty,string> = {beginner:'var(--rp-green)',intermediate:'var(--rp-amber)',advanced:'var(--rp-red)'}
const QS = ['q1','q2','q3','q4'] as const

// ── Theme toggle ──────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} title={theme === 'light' ? 'Switch to dark' : 'Switch to light'} aria-label="Toggle theme"
      style={{ display:'flex', alignItems:'center', justifyContent:'center', width:30, height:30, borderRadius:9, cursor:'pointer',
        background:'var(--rp-surface-2)', border:'1px solid var(--rp-border)', color:'var(--rp-text-dim)', transition:'all 0.15s' }}>
      {theme === 'light' ? <Moon size={15} strokeWidth={2} /> : <Sun size={15} strokeWidth={2} />}
    </button>
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const progress = useProgress()
  const [active, setActive] = useState<Scenario|null>(null)
  const [examOpen, setExamOpen] = useState(false)
  const handleComplete = (s: number) => { if (active) progress.saveResult(active.id, s) }
  const handleTrade = (t: TradeOutcomeInfo) => {
    if (!active || t.outcome === 'nofill') return
    progress.saveTrade({ scenarioId: active.id, direction: t.direction, outcome: t.outcome, r: t.r })
  }
  return (
    <>
      <SuiteBar current="replay" />
      {examOpen && <ExamMode onClose={() => setExamOpen(false)} onFinish={progress.markActivity} />}
      {active
        ? <Player scenario={active} onBack={() => setActive(null)} onComplete={handleComplete} onTrade={handleTrade} />
        : <Home onStart={setActive} progress={progress} onExam={() => setExamOpen(true)} />}
    </>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home({ onStart, progress, onExam }: { onStart:(s:Scenario)=>void; progress:ReturnType<typeof useProgress>; onExam:()=>void }) {
  const [filter, setFilter] = useState<Category|'all'>('all')
  const [diff,   setDiff]   = useState<Difficulty|'all'>('all')
  const cats = [...new Set(scenarios.map(s => s.category))] as Category[]
  const shown = scenarios.filter(s =>
    (filter === 'all' || s.category === filter) &&
    (diff === 'all' || s.difficulty === diff)
  )

  const donePct = Math.round((progress.completed / scenarios.length) * 100)

  return (
    <div style={{ background:'var(--rp-bg)', minHeight:'100vh' }}>
      <header style={{ background:'var(--rp-header)', borderBottom:'1px solid var(--rp-border)', position:'relative', overflow:'hidden' }}>
        {/* Amber accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.7),transparent)' }}/>
        {/* Subtle radial glow */}
        <div style={{ position:'absolute', top:'-60px', left:'50%', transform:'translateX(-50%)', width:500, height:200, background:'radial-gradient(ellipse,rgba(245,158,11,0.06),transparent 70%)', pointerEvents:'none' }}/>

        <div className="max-w-5xl mx-auto px-4 pt-5 pb-4" style={{ position:'relative' }}>
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-6 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', boxShadow:'0 0 18px rgba(245,158,11,0.1)', color:'var(--rp-amber)' }}>
                  <Target size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="font-black tracking-widest m-0" style={{ fontSize:13, letterSpacing:'0.18em', color:'var(--rp-text)' }}>ICT REPLAY TRAINER</p>
                  <p className="text-[10px] tracking-widest uppercase m-0" style={{ color:'var(--rp-text-faint)' }}>by Chronic Trading</p>
                </div>
              </div>
              <p className="leading-relaxed m-0" style={{ fontSize: 12, maxWidth:300, color:'var(--rp-text-dim)' }}>
                Study real ICT setups. Identify the concept, pick direction, name the draw, set your entry.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                {progress.signedIn && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:9, fontWeight:700, letterSpacing:'0.08em', color:'var(--rp-green)', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:7, padding:'3px 9px' }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--rp-green)' }}/>
                    Synced
                  </div>
                )}
                <ThemeToggle />
              </div>
              <div className="flex gap-6">
                {[
                  { l:'Done',    v:`${progress.completed}/${scenarios.length}`, c:'var(--rp-amber)' },
                  { l:'Avg',     v: progress.avgScore === '—' ? '—' : `${progress.avgScore}/4`,  c: progress.avgScore === '—' ? 'var(--rp-text-faint)' : parseFloat(progress.avgScore) >= 3 ? 'var(--rp-green)' : parseFloat(progress.avgScore) >= 2 ? 'var(--rp-amber)' : 'var(--rp-red)' },
                  { l:'Perfect', v:`${progress.perfect}`,                       c:'var(--rp-amber)' },
                  { l:'Net R',   v: progress.tradedCount === 0 ? '—' : `${progress.netR >= 0 ? '+' : ''}${progress.netR}R`, c: progress.tradedCount === 0 ? 'var(--rp-text-faint)' : progress.netR >= 0 ? 'var(--rp-green)' : 'var(--rp-red)' },
                  { l:'Streak',  v: progress.streak > 0 ? `${progress.streak}d` : '—', c: progress.streak > 0 ? 'var(--rp-orange)' : 'var(--rp-text-faint)' },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <p className="font-black m-0" style={{ fontFamily:'monospace', fontSize:22, color:s.c }}>{s.v}</p>
                    <p className="uppercase tracking-widest m-0 mt-0.5" style={{ fontSize:8, color:'var(--rp-text-faint)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              {progress.completed > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:120, height:3, borderRadius:2, background:'var(--rp-surface-2)', overflow:'hidden' }}>
                    <div style={{ width:`${donePct}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius:2, transition:'width 0.6s ease' }}/>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, color:'var(--rp-amber)' }}>{donePct}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
            <button onClick={() => setFilter('all')}
              style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, border:`1px solid ${filter==='all'?'var(--rp-border-strong)':'var(--rp-border)'}`, background:filter==='all'?'var(--rp-surface-2)':'transparent', color:filter==='all'?'var(--rp-text)':'var(--rp-text-faint)', cursor:'pointer', transition:'all 0.15s' }}>
              All
            </button>
            {cats.map(c => {
              const m = CAT[c], active = filter === c
              return (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, border:`1px solid ${active?m.border:'var(--rp-border)'}`, background:active?m.bg:'transparent', color:active?m.ink:'var(--rp-text-faint)', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:m.ink, opacity:active?1:0.4, display:'inline-block' }}/>
                  {m.label}
                </button>
              )
            })}
            <div style={{ width:1, height:18, background:'var(--rp-border)', margin:'0 2px' }}/>
            {(['all','beginner','intermediate','advanced'] as const).map(d => {
              const active = diff===d
              const dc = d==='all' ? 'var(--rp-slate)' : d==='beginner' ? 'var(--rp-green)' : d==='intermediate' ? 'var(--rp-amber)' : 'var(--rp-red)'
              const dbg = d==='all' ? 'rgba(100,116,139,0.15)' : d==='beginner' ? 'rgba(52,211,153,0.1)' : d==='intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(248,113,113,0.1)'
              return (
                <button key={d} onClick={() => setDiff(d)}
                  style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize',
                    border: `1px solid ${active ? dc : 'var(--rp-border)'}`,
                    background: active ? dbg : 'transparent',
                    color: active ? dc : 'var(--rp-text-faint)',
                  }}>
                  {d}
                </button>
              )
            })}
            <span style={{ marginLeft:'auto', fontSize:10, color:'var(--rp-text-faint)', fontWeight:600 }}>
              {shown.length} scenario{shown.length !== 1 ? 's' : ''}
            </span>
            <button onClick={onExam}
              style={{ fontSize:10, fontWeight:900, letterSpacing:'0.08em', padding:'5px 14px', borderRadius:9, border:'1px solid rgba(245,158,11,0.35)', background:'rgba(245,158,11,0.12)', color:'var(--rp-amber)', cursor:'pointer', transition:'all 0.15s', display:'inline-flex', alignItems:'center', gap:5 }}>
              <GraduationCap size={13} strokeWidth={2} /> EXAM
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {/* Today's Challenge — the same date-seeded scenario for everyone each day */}
        {(() => {
          const dayIndex = Math.floor(Date.now() / 86_400_000)
          const daily = scenarios[dayIndex % scenarios.length]
          const dm = CAT[daily.category]
          const dRes = progress.getResult(daily.id)
          const today = new Date().toLocaleDateString('en-CA')
          const doneToday = !!dRes && new Date(dRes.answeredAt).toLocaleDateString('en-CA') === today
          const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
          return (
            <button onClick={() => onStart(daily)}
              className="w-full text-left rounded-2xl border p-4 mb-4 transition-all cursor-pointer flex items-center gap-4 scenario-card"
              style={{ background: `linear-gradient(120deg,${dm.color}14,var(--rp-surface) 62%)`, borderColor: doneToday ? 'rgba(52,211,153,0.45)' : dm.border }}>
              <div style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: doneToday ? 'var(--rp-green)' : dm.color, background: doneToday ? 'rgba(52,211,153,0.14)' : `${dm.color}1c`, border: `1px solid ${doneToday ? 'rgba(52,211,153,0.4)' : dm.border}` }}>
                {doneToday ? <Check size={22} strokeWidth={2.5} /> : <Zap size={20} strokeWidth={2} />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--rp-amber)' }}>Today's Challenge</span>
                  <span style={{ fontSize: 9, color: 'var(--rp-text-faint)', fontWeight: 600 }}>{dateLabel}</span>
                </div>
                <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--rp-text)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{daily.title}</p>
                <p style={{ fontSize: 11, color: 'var(--rp-text-faint)', marginTop: 1 }}>{dm.label} · {daily.instrument} · {daily.timeframe} · <span style={{ textTransform: 'capitalize' }}>{daily.difficulty}</span></p>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                {doneToday
                  ? <span style={{ fontSize: 12, fontWeight: 900, fontFamily: 'monospace', color: 'var(--rp-green)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dRes!.score}/4 <Check size={12} strokeWidth={3} /></span>
                  : <span style={{ fontSize: 12, fontWeight: 800, color: dm.ink }}>Start →</span>}
              </div>
            </button>
          )
        })()}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {shown.map(s => {
            const m = CAT[s.category]
            const res = progress.getResult(s.id)
            const trade = progress.getTrade(s.id)
            const done = !!res, perfect = res?.score === 4
            return (
              <button key={s.id} onClick={() => onStart(s)}
                className="scenario-card text-left rounded-2xl border p-4 transition-all cursor-pointer"
                style={{
                  background: done ? `linear-gradient(160deg,${m.color}10,var(--rp-surface) 55%)` : 'var(--rp-surface)',
                  borderColor: done ? m.border : 'var(--rp-border)',
                  boxShadow: 'var(--rp-shadow-card, none)',
                  position: 'relative', overflow: 'hidden',
                }}>
                {/* Category color left bar */}
                <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:m.ink, opacity: done ? 0.8 : 0.35, borderRadius:'12px 0 0 12px' }}/>
                <div style={{ paddingLeft:8 }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize:9, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 9px', borderRadius:999, color:m.ink, background:m.bg, border:`1px solid ${m.border}` }}>{m.label}</span>
                    <div className="flex items-center gap-2">
                      {trade && (
                        <span style={{ fontSize:10, fontWeight:900, fontFamily:'monospace', color: trade.r >= 0 ? 'var(--rp-green)' : 'var(--rp-red)' }}>
                          {trade.r >= 0 ? '+' : ''}{trade.r}R
                        </span>
                      )}
                      <span style={{ fontSize:9, fontWeight:700, textTransform:'capitalize', color:DIFF[s.difficulty] }}>{s.difficulty}</span>
                      {done && (
                        <span style={{ fontSize:11, fontWeight:900, color:perfect?'var(--rp-amber)':'var(--rp-text-faint)', display:'inline-flex', alignItems:'center' }}>
                          {perfect ? <Star size={12} strokeWidth={2} fill="currentColor" /> : `${res!.score}/4`}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:'var(--rp-text)', lineHeight:1.35, marginBottom:10 }}>{s.title}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'var(--rp-text-faint)' }}>
                    <span style={{ fontFamily:'monospace' }}>{s.instrument}</span>
                    <span>·</span><span>{s.timeframe}</span><span>·</span><span>{s.session}</span>
                    <span style={{ marginLeft:'auto', fontWeight:700, color: perfect?'var(--rp-amber)' : done?'var(--rp-text-faint)' : m.ink }}>
                      {perfect ? 'Perfect' : done ? 'Retry →' : 'Start →'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {shown.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <p style={{ fontSize:14, color:'var(--rp-text-faint)', fontWeight:600 }}>No scenarios match this filter.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Player ────────────────────────────────────────────────────────────────────
function Player({ scenario, onBack, onComplete, onTrade }: {
  scenario:Scenario; onBack:()=>void; onComplete:(s:number)=>void; onTrade:(t:TradeOutcomeInfo)=>void
}) {
  const [answers,   setAnswers]   = useState<Record<string,number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score,     setScore]     = useState(0)
  const [trading,   setTrading]   = useState(false)
  const [chartData, setChartData] = useState<ChartFile | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const m = CAT[scenario.category]

  useEffect(() => {
    let alive = true
    setChartData(null); setTrading(false)
    fetch(`${import.meta.env.BASE_URL}chart-data/${scenario.id}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (!alive) return
        if (d && Array.isArray(d.bars) && d.decisionIndex > 0 && d.bars.length > d.decisionIndex) setChartData(d)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [scenario.id])

  const handleSubmit = () => {
    let s = 0
    QS.forEach(k => { if (answers[k] === scenario[k].correct) s++ })
    setScore(s); setSubmitted(true); onComplete(s)
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior:'smooth', block:'center' }), 80)
  }
  const allAnswered = QS.every(k => answers[k] !== undefined)

  return (
    <div style={{ background:'var(--rp-bg)', minHeight:'100vh' }}>
      {/* Nav */}
      <div style={{ background:'var(--rp-header)', borderBottom:'1px solid var(--rp-border)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={onBack} style={{ fontSize:11, fontWeight:700, color:'var(--rp-text-dim)', background:'var(--rp-surface-2)', border:'1px solid var(--rp-border)', borderRadius:8, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:5 }}>
          ← Back
        </button>
        <span style={{ width:1, height:14, background:'var(--rp-border)', display:'inline-block' }} />
        <span style={{ fontSize: 11, color:'var(--rp-text-faint)', fontFamily:'monospace' }}>{scenario.instrument} · {scenario.timeframe} · {scenario.session}</span>
        <span style={{ marginLeft:'auto', fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', padding:'3px 10px', borderRadius:999, color:m.ink, background:m.bg, border:`1px solid ${m.border}` }}>{m.label}</span>
        <ThemeToggle />
      </div>

      {/* Trade mode */}
      {trading && chartData && (
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'var(--rp-text)', margin:0, lineHeight:1.2 }}>{scenario.title}</h1>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--rp-amber)' }}>
              Trade mode — set your levels, then play the tape
            </span>
          </div>
          <TradeMode scenario={scenario} chart={chartData} onExit={() => setTrading(false)} onComplete={onTrade} />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3" style={{ display: trading ? 'none' : undefined }}>
        {/* Title */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'var(--rp-text)', margin:0, lineHeight:1.2 }}>{scenario.title}</h1>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:DIFF[scenario.difficulty] }}>{scenario.difficulty}</span>
          </div>
          {submitted && (
            <div style={{ flexShrink:0, width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:900, fontSize:16,
              background: score===4?'rgba(245,158,11,0.12)':score>=3?'rgba(52,211,153,0.1)':'var(--rp-surface-2)',
              border: `1px solid ${score===4?'rgba(245,158,11,0.35)':score>=3?'rgba(52,211,153,0.3)':'var(--rp-border)'}`,
              color: score===4?'var(--rp-amber)':score>=3?'var(--rp-green)':'var(--rp-text-dim)' }}>
              {score}/4
            </div>
          )}
        </div>

        {/* Context */}
        <div style={{ borderRadius:16, border:`1px solid ${m.border}`, padding:'12px 14px', background:`linear-gradient(160deg,${m.color}10,var(--rp-surface) 60%)` }}>
          <p style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.18em', color:m.ink, margin:'0 0 8px' }}>Context</p>
          <p style={{ fontSize: 12, color:'var(--rp-text-dim)', lineHeight:1.65, margin:'0 0 6px' }}><span style={{ color:'var(--rp-text)', fontWeight:600 }}>HTF: </span>{scenario.htfContext}</p>
          <p style={{ fontSize: 12, color:'var(--rp-text-dim)', lineHeight:1.65, margin:0 }}><span style={{ color:'var(--rp-text)', fontWeight:600 }}>Session: </span>{scenario.sessionContext}</p>
        </div>

        {/* Chart */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color:'var(--rp-text-faint)' }}>{submitted?'What happened next':'Study the chart — make your decision'}</p>
          <ConceptDiagram
            mode={submitted?'after':'before'}
            scenario={scenario}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href={`https://www.tradingview.com/chart/?symbol=${scenario.tvSymbol}&interval=${scenario.tvInterval}`}
             target="_blank" rel="noopener noreferrer"
             className="text-[11px] font-semibold transition-colors" style={{ color:'var(--rp-blue)' }}>
            Verify on TradingView →
          </a>
          {chartData && (
            <button onClick={() => setTrading(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all border cursor-pointer"
              style={{ background:'rgba(245,158,11,0.12)', borderColor:'rgba(245,158,11,0.35)', color:'var(--rp-amber)' }}>
              <Zap size={14} strokeWidth={2} /> Trade this setup — bar-by-bar replay
            </button>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {QS.map((qKey, qi) => {
            const q = scenario[qKey]
            const selected = answers[qKey]
            const right = submitted && selected === q.correct
            return (
              <div key={qKey} className="rounded-2xl border p-4 space-y-3 slide-up"
                   style={{ background:'var(--rp-surface)', borderColor:'var(--rp-border)', animationDelay:`${qi*60}ms` }}>
                <p className="text-sm font-bold m-0" style={{ color:'var(--rp-text)' }}>
                  <span className="mr-2" style={{ color:'var(--rp-text-faint)' }}>Q{qi+1}.</span>{q.prompt}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isSel  = selected === oi
                    const isCorr = submitted && oi === q.correct
                    const isWrong = submitted && isSel && oi !== q.correct
                    return (
                      <button key={oi}
                        onClick={() => { if (!submitted) setAnswers(p=>({...p,[qKey]:oi})) }}
                        disabled={submitted}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all"
                        style={{
                          background: isCorr?'rgba(52,211,153,0.12)':isWrong?'rgba(248,113,113,0.12)':isSel?'rgba(245,158,11,0.1)':'var(--rp-surface-2)',
                          borderColor: isCorr?'rgba(52,211,153,0.45)':isWrong?'rgba(248,113,113,0.45)':isSel?'rgba(245,158,11,0.4)':'var(--rp-border)',
                          color: isCorr?'var(--rp-green)':isWrong?'var(--rp-red)':isSel?'var(--rp-amber)':'var(--rp-text-dim)',
                          cursor: submitted?'default':'pointer',
                        }}>
                        <span className="mr-2 text-[10px]" style={{fontFamily:'monospace'}}>
                          {String.fromCharCode(65+oi)}.
                        </span>
                        {opt}{isCorr && <Check size={12} strokeWidth={3} style={{ display:'inline', verticalAlign:'-2px', marginLeft:4 }} />}{isWrong && <X size={12} strokeWidth={3} style={{ display:'inline', verticalAlign:'-2px', marginLeft:4 }} />}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <div className="rounded-xl px-3 py-2.5 pop-in"
                       style={{ background:right?'rgba(52,211,153,0.08)':'rgba(248,113,113,0.08)', border:`1px solid ${right?'rgba(52,211,153,0.25)':'rgba(248,113,113,0.25)'}` }}>
                    <p className="text-[11px] leading-relaxed m-0" style={{ color:right?'var(--rp-green)':'var(--rp-red)' }}><GlossaryText text={q.explanation} /></p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Submit */}
        {!submitted && (
          <button onClick={handleSubmit} disabled={!allAnswered}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-all border-0"
            style={{ background:allAnswered?'linear-gradient(135deg,#f59e0b,#d97706)':'var(--rp-surface-2)', color:allAnswered?'#0a0800':'var(--rp-text-faint)', cursor:allAnswered?'pointer':'not-allowed' }}>
            Submit Answers →
          </button>
        )}

        {/* Result */}
        {submitted && (
          <div ref={resultRef} className="rounded-2xl border p-5 text-center space-y-4 pop-in"
               style={{ background:score===4?'rgba(245,158,11,0.06)':score>=3?'rgba(52,211,153,0.06)':'var(--rp-surface)', borderColor:score===4?'rgba(245,158,11,0.3)':score>=3?'rgba(52,211,153,0.3)':'var(--rp-border)' }}>
            <p className="text-5xl font-black leading-none m-0"
               style={{ fontFamily:'monospace', color:score===4?'var(--rp-amber)':score>=3?'var(--rp-green)':'var(--rp-text-dim)' }}>{score}/4</p>
            <p className="text-sm font-bold m-0" style={{ color:score===4?'var(--rp-amber)':score>=3?'var(--rp-green)':'var(--rp-text-dim)' }}>
              {score===4?'Perfect — you read it correctly':score===3?'Strong read — nearly there':score===2?'Decent — review the explanations':'Keep studying — this will click'}
            </p>
            <div className="rounded-xl px-4 py-3 text-left" style={{ background:'var(--rp-surface-2)', border:'1px solid var(--rp-border)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest m-0 mb-1" style={{ color:'var(--rp-text-faint)' }}>What actually happened</p>
              <p className="text-xs leading-relaxed m-0" style={{ color:'var(--rp-text-dim)' }}><GlossaryText text={scenario.explanation} /></p>
              {scenario.rAchieved && (
                <p className="text-xs font-bold mt-1.5 m-0"
                   style={{ fontFamily:'monospace', color:scenario.result==='worked'?'var(--rp-green)':'var(--rp-red)' }}>
                  {scenario.result==='worked'?`+${scenario.rAchieved}R`:`${scenario.rAchieved}R`} · {scenario.result.toUpperCase()}
                </p>
              )}
            </div>
            <button onClick={onBack}
              className="w-full py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer"
              style={{ background:'transparent', borderColor:'var(--rp-border)', color:'var(--rp-text-dim)' }}>
              ← Back to Scenarios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
