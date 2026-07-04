import { useState, useRef, useEffect } from 'react'
import { scenarios, type Scenario, type Category, type Difficulty } from './data/scenarios'
import { ConceptDiagram } from './components/ConceptDiagram'
import { SuiteBar } from './components/SuiteBar'
import { TradeMode, type ChartFile, type TradeOutcomeInfo } from './components/TradeMode'
import { ExamMode } from './components/ExamMode'
import { GlossaryText } from './components/GlossaryText'
import { useProgress } from './hooks/useProgress'
import './index.css'
import './brand.css'

const CAT: Record<Category,{label:string;color:string;bg:string;border:string}> = {
  'fvg':              {label:'Fair Value Gap',  color:'#f59e0b',bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)' },
  'order-block':      {label:'Order Block',     color:'#60a5fa',bg:'rgba(96,165,250,0.1)', border:'rgba(96,165,250,0.3)' },
  'liquidity':        {label:'Liquidity',       color:'#34d399',bg:'rgba(52,211,153,0.1)', border:'rgba(52,211,153,0.3)' },
  'market-structure': {label:'Mkt Structure',   color:'#c084fc',bg:'rgba(192,132,252,0.1)',border:'rgba(192,132,252,0.3)'},
  'amd':              {label:'AMD Cycle',        color:'#fb923c',bg:'rgba(251,146,60,0.1)', border:'rgba(251,146,60,0.3)' },
  'kill-zone':        {label:'Kill Zone',        color:'#f472b6',bg:'rgba(244,114,182,0.1)',border:'rgba(244,114,182,0.3)'},
  'judas-swing':      {label:'Judas Swing',     color:'#a78bfa',bg:'rgba(167,139,250,0.1)',border:'rgba(167,139,250,0.3)'},
  'full-model':       {label:'Full Model',      color:'#94a3b8',bg:'rgba(148,163,184,0.1)',border:'rgba(148,163,184,0.3)'},
}
const DIFF: Record<Difficulty,string> = {beginner:'#34d399',intermediate:'#f59e0b',advanced:'#f87171'}
const QS = ['q1','q2','q3','q4'] as const

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
    <div style={{ background:'#05050a', minHeight:'100vh' }}>
      <header style={{ background:'#07070e', borderBottom:'1px solid rgba(30,41,59,0.5)', position:'relative', overflow:'hidden' }}>
        {/* Amber accent line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(245,158,11,0.7),transparent)' }}/>
        {/* Subtle radial glow */}
        <div style={{ position:'absolute', top:'-60px', left:'50%', transform:'translateX(-50%)', width:500, height:200, background:'radial-gradient(ellipse,rgba(245,158,11,0.06),transparent 70%)', pointerEvents:'none' }}/>

        <div className="max-w-5xl mx-auto px-4 pt-5 pb-4" style={{ position:'relative' }}>
          {/* Top row */}
          <div className="flex items-start justify-between flex-wrap gap-6 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                     style={{ background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)', boxShadow:'0 0 18px rgba(245,158,11,0.1)' }}>🎯</div>
                <div>
                  <p className="font-black tracking-widest text-white m-0" style={{ fontSize:13, letterSpacing:'0.18em' }}>ICT REPLAY TRAINER</p>
                  <p className="text-slate-600 text-[9px] tracking-widest uppercase m-0">by Chronic Trading</p>
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed m-0" style={{ fontSize:11.5, maxWidth:300 }}>
                Study real ICT setups. Identify the concept, pick direction, name the draw, set your entry.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              {progress.signedIn && (
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:9, fontWeight:700, letterSpacing:'0.08em', color:'#34d399', background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.22)', borderRadius:7, padding:'3px 9px' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#34d399', boxShadow:'0 0 6px #34d399' }}/>
                  Progress synced across your Chronic Trading account
                </div>
              )}
              <div className="flex gap-6">
                {[
                  { l:'Done',    v:`${progress.completed}/${scenarios.length}`, c:'#f59e0b' },
                  { l:'Avg',     v: progress.avgScore === '—' ? '—' : `${progress.avgScore}/4`,  c: progress.avgScore === '—' ? '#475569' : parseFloat(progress.avgScore) >= 3 ? '#34d399' : parseFloat(progress.avgScore) >= 2 ? '#f59e0b' : '#f87171' },
                  { l:'Perfect', v:`${progress.perfect}`,                       c:'#f59e0b' },
                  { l:'Net R',   v: progress.tradedCount === 0 ? '—' : `${progress.netR >= 0 ? '+' : ''}${progress.netR}R`, c: progress.tradedCount === 0 ? '#475569' : progress.netR >= 0 ? '#34d399' : '#f87171' },
                  { l:'Streak',  v: progress.streak > 0 ? `${progress.streak}d` : '—', c: progress.streak > 0 ? '#fb923c' : '#475569' },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <p className="font-black text-white m-0" style={{ fontFamily:'monospace', fontSize:22, color:s.c, textShadow:`0 0 16px ${s.c}50` }}>{s.v}</p>
                    <p className="text-slate-600 uppercase tracking-widest m-0 mt-0.5" style={{ fontSize:8 }}>{s.l}</p>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              {progress.completed > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:120, height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                    <div style={{ width:`${donePct}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius:2, transition:'width 0.6s ease' }}/>
                  </div>
                  <span style={{ fontSize:9, fontWeight:700, color:'rgba(245,158,11,0.6)' }}>{donePct}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
            <button onClick={() => setFilter('all')}
              style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, border:`1px solid ${filter==='all'?'rgba(100,116,139,0.5)':'rgba(30,41,59,0.8)'}`, background:filter==='all'?'rgba(100,116,139,0.15)':'transparent', color:filter==='all'?'#e2e8f0':'#64748b', cursor:'pointer', transition:'all 0.15s' }}>
              All
            </button>
            {cats.map(c => {
              const m = CAT[c], active = filter === c
              return (
                <button key={c} onClick={() => setFilter(c)}
                  style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, border:`1px solid ${active?m.border:'rgba(30,41,59,0.8)'}`, background:active?m.bg:'transparent', color:active?m.color:'#64748b', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:m.color, opacity:active?1:0.4, display:'inline-block', boxShadow:active?`0 0 6px ${m.color}`:'none' }}/>
                  {m.label}
                </button>
              )
            })}
            <div style={{ width:1, height:18, background:'rgba(30,41,59,0.8)', margin:'0 2px' }}/>
            {(['all','beginner','intermediate','advanced'] as const).map(d => (
              <button key={d} onClick={() => setDiff(d)}
                style={{ fontSize:10, fontWeight:700, padding:'5px 13px', borderRadius:9, cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize',
                  border: diff===d
                    ? d==='all' ? '1px solid rgba(100,116,139,0.5)' : d==='beginner' ? '1px solid rgba(52,211,153,0.35)' : d==='intermediate' ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(248,113,113,0.35)'
                    : '1px solid rgba(30,41,59,0.8)',
                  background: diff===d
                    ? d==='all' ? 'rgba(100,116,139,0.15)' : d==='beginner' ? 'rgba(52,211,153,0.1)' : d==='intermediate' ? 'rgba(245,158,11,0.1)' : 'rgba(248,113,113,0.1)'
                    : 'transparent',
                  color: diff===d
                    ? d==='all' ? '#e2e8f0' : d==='beginner' ? '#34d399' : d==='intermediate' ? '#f59e0b' : '#f87171'
                    : '#64748b',
                }}>
                {d}
              </button>
            ))}
            <span style={{ marginLeft:'auto', fontSize:10, color:'rgba(100,116,139,0.45)', fontWeight:600 }}>
              {shown.length} scenario{shown.length !== 1 ? 's' : ''}
            </span>
            <button onClick={onExam}
              style={{ fontSize:10, fontWeight:900, letterSpacing:'0.08em', padding:'5px 14px', borderRadius:9, border:'1px solid rgba(245,158,11,0.35)', background:'rgba(245,158,11,0.1)', color:'#f59e0b', cursor:'pointer', transition:'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(245,158,11,0.18)')}
              onMouseLeave={e => (e.currentTarget.style.background='rgba(245,158,11,0.1)')}>
              🎓 EXAM
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
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
                  background: done ? `linear-gradient(160deg,${m.color}06,#0b0b14 50%)` : '#0b0b14',
                  borderColor: done ? m.border : 'rgba(30,41,59,0.8)',
                  position: 'relative', overflow: 'hidden',
                }}>
                {/* Category color left bar */}
                <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:m.color, opacity: done ? 0.7 : 0.3, borderRadius:'12px 0 0 12px' }}/>
                <div style={{ paddingLeft:8 }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize:9, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 9px', borderRadius:999, color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>{m.label}</span>
                    <div className="flex items-center gap-2">
                      {trade && (
                        <span style={{ fontSize:10, fontWeight:900, fontFamily:'monospace', color: trade.r >= 0 ? '#34d399' : '#f87171' }}>
                          {trade.r >= 0 ? '+' : ''}{trade.r}R
                        </span>
                      )}
                      <span style={{ fontSize:9, fontWeight:700, textTransform:'capitalize', color:DIFF[s.difficulty] }}>{s.difficulty}</span>
                      {done && (
                        <span style={{ fontSize:11, fontWeight:900, color:perfect?'#f59e0b':'#475569', textShadow:perfect?'0 0 12px rgba(245,158,11,0.5)':'none' }}>
                          {perfect ? '★' : `${res!.score}/4`}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.93)', lineHeight:1.35, marginBottom:10 }}>{s.title}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#475569' }}>
                    <span style={{ fontFamily:'monospace' }}>{s.instrument}</span>
                    <span>·</span><span>{s.timeframe}</span><span>·</span><span>{s.session}</span>
                    <span style={{ marginLeft:'auto', fontWeight:700, color: perfect?'#f59e0b' : done?'#475569' : `${m.color}90` }}>
                      {perfect ? 'Perfect ✓' : done ? 'Retry →' : 'Start →'}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {shown.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <p style={{ fontSize:14, color:'rgba(100,116,139,0.5)', fontWeight:600 }}>No scenarios match this filter.</p>
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
    <div style={{ background:'#05050a', minHeight:'100vh' }}>
      {/* Nav */}
      <div style={{ background:'#07070e', borderBottom:'1px solid rgba(30,41,59,0.5)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, position:'sticky', top:0, zIndex:40 }}>
        <button onClick={onBack} style={{ fontSize:11, fontWeight:700, color:'#64748b', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(30,41,59,0.8)', borderRadius:8, padding:'5px 12px', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:5 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#e2e8f0'; (e.currentTarget as HTMLElement).style.borderColor='rgba(100,116,139,0.4)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='#64748b'; (e.currentTarget as HTMLElement).style.borderColor='rgba(30,41,59,0.8)' }}>
          ← Back
        </button>
        <span style={{ width:1, height:14, background:'rgba(30,41,59,0.8)', display:'inline-block' }} />
        <span style={{ fontSize:10.5, color:'#475569', fontFamily:'monospace' }}>{scenario.instrument} · {scenario.timeframe} · {scenario.session}</span>
        <span style={{ marginLeft:'auto', fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.1em', padding:'3px 10px', borderRadius:999, color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>{m.label}</span>
      </div>

      {/* Trade mode */}
      {trading && chartData && (
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'white', margin:0, lineHeight:1.2 }}>{scenario.title}</h1>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#f59e0b' }}>
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
            <h1 style={{ fontSize:20, fontWeight:900, color:'white', margin:0, lineHeight:1.2 }}>{scenario.title}</h1>
            <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:DIFF[scenario.difficulty] }}>{scenario.difficulty}</span>
          </div>
          {submitted && (
            <div style={{ flexShrink:0, width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontWeight:900, fontSize:16,
              background: score===4?'rgba(245,158,11,0.12)':score>=3?'rgba(52,211,153,0.1)':'rgba(100,116,139,0.08)',
              border: `1px solid ${score===4?'rgba(245,158,11,0.35)':score>=3?'rgba(52,211,153,0.3)':'rgba(100,116,139,0.2)'}`,
              color: score===4?'#f59e0b':score>=3?'#34d399':'#94a3b8' }}>
              {score}/4
            </div>
          )}
        </div>

        {/* Context */}
        <div style={{ borderRadius:16, border:`1px solid ${m.border}`, padding:'12px 14px', background:`linear-gradient(160deg,${m.color}06,#0b0b14 60%)` }}>
          <p style={{ fontSize:9, fontWeight:900, textTransform:'uppercase', letterSpacing:'0.18em', color:m.color, opacity:0.7, margin:'0 0 8px' }}>Context</p>
          <p style={{ fontSize:11.5, color:'rgba(148,163,184,0.9)', lineHeight:1.65, margin:'0 0 6px' }}><span style={{ color:'rgba(226,232,240,0.85)', fontWeight:600 }}>HTF: </span>{scenario.htfContext}</p>
          <p style={{ fontSize:11.5, color:'rgba(148,163,184,0.9)', lineHeight:1.65, margin:0 }}><span style={{ color:'rgba(226,232,240,0.85)', fontWeight:600 }}>Session: </span>{scenario.sessionContext}</p>
        </div>

        {/* Chart */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{submitted?'What happened next':'Study the chart — make your decision'}</p>
          <ConceptDiagram
            mode={submitted?'after':'before'}
            scenario={scenario}
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <a href={`https://www.tradingview.com/chart/?symbol=${scenario.tvSymbol}&interval=${scenario.tvInterval}`}
             target="_blank" rel="noopener noreferrer"
             className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Verify on TradingView →
          </a>
          {chartData && (
            <button onClick={() => setTrading(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all border cursor-pointer"
              style={{ background:'rgba(245,158,11,0.1)', borderColor:'rgba(245,158,11,0.35)', color:'#f59e0b' }}>
              ⚡ Trade this setup — bar-by-bar replay
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
              <div key={qKey} className="rounded-2xl border border-slate-800/50 p-4 space-y-3 slide-up"
                   style={{ background:'#0b0b14', animationDelay:`${qi*60}ms` }}>
                <p className="text-sm font-bold text-white m-0">
                  <span className="text-slate-600 mr-2">Q{qi+1}.</span>{q.prompt}
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
                          background: isCorr?'rgba(52,211,153,0.1)':isWrong?'rgba(248,113,113,0.1)':isSel?'rgba(245,158,11,0.08)':'rgba(15,15,24,0.8)',
                          borderColor: isCorr?'rgba(52,211,153,0.4)':isWrong?'rgba(248,113,113,0.4)':isSel?'rgba(245,158,11,0.35)':'rgba(30,41,59,0.8)',
                          color: isCorr?'#34d399':isWrong?'#f87171':isSel?'#fde68a':'#94a3b8',
                          cursor: submitted?'default':'pointer',
                        }}>
                        <span className="opacity-40 mr-2 text-[10px]" style={{fontFamily:'monospace'}}>
                          {String.fromCharCode(65+oi)}.
                        </span>
                        {opt}{isCorr&&' ✓'}{isWrong&&' ✗'}
                      </button>
                    )
                  })}
                </div>
                {submitted && (
                  <div className="rounded-xl px-3 py-2.5 pop-in"
                       style={{ background:right?'rgba(52,211,153,0.06)':'rgba(248,113,113,0.06)', border:`1px solid ${right?'rgba(52,211,153,0.2)':'rgba(248,113,113,0.2)'}` }}>
                    <p className="text-[11px] leading-relaxed m-0" style={{ color:right?'#86efac':'#fca5a5' }}><GlossaryText text={q.explanation} /></p>
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
            style={{ background:allAnswered?'linear-gradient(135deg,#f59e0b,#d97706)':'rgba(30,41,59,0.5)', color:allAnswered?'#0a0800':'#475569', cursor:allAnswered?'pointer':'not-allowed' }}>
            Submit Answers →
          </button>
        )}

        {/* Result */}
        {submitted && (
          <div ref={resultRef} className="rounded-2xl border p-5 text-center space-y-4 pop-in"
               style={{ background:score===4?'rgba(245,158,11,0.05)':score>=3?'rgba(52,211,153,0.05)':'rgba(100,116,139,0.05)', borderColor:score===4?'rgba(245,158,11,0.3)':score>=3?'rgba(52,211,153,0.3)':'rgba(100,116,139,0.25)' }}>
            <p className="text-5xl font-black leading-none m-0"
               style={{ fontFamily:'monospace', color:score===4?'#f59e0b':score>=3?'#34d399':'#94a3b8' }}>{score}/4</p>
            <p className="text-sm font-bold m-0" style={{ color:score===4?'#fde68a':score>=3?'#6ee7b7':'#94a3b8' }}>
              {score===4?'🔥 Perfect — you read it correctly':score===3?'✓ Strong read — nearly there':score===2?'Decent — review the explanations':'Keep studying — this will click'}
            </p>
            <div className="rounded-xl px-4 py-3 text-left" style={{ background:'rgba(0,0,0,0.3)', border:'1px solid rgba(30,41,59,0.8)' }}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 m-0 mb-1">What actually happened</p>
              <p className="text-xs text-slate-300 leading-relaxed m-0"><GlossaryText text={scenario.explanation} /></p>
              {scenario.rAchieved && (
                <p className="text-xs font-bold mt-1.5 m-0"
                   style={{ fontFamily:'monospace', color:scenario.result==='worked'?'#34d399':'#f87171' }}>
                  {scenario.result==='worked'?`+${scenario.rAchieved}R`:`${scenario.rAchieved}R`} · {scenario.result.toUpperCase()}
                </p>
              )}
            </div>
            <button onClick={onBack}
              className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold hover:border-slate-500 hover:text-white transition-all cursor-pointer"
              style={{ background:'transparent' }}>
              ← Back to Scenarios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
