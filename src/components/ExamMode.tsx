import { useState, useEffect } from 'react'
import { scenarios, type Scenario } from '../data/scenarios'

const EXAM_SIZE = 10
const BEST_KEY  = 'ict-replay-exam-best'
const QKEYS = ['q1', 'q2', 'q3', 'q4'] as const

interface ExamQ {
  scenario: Scenario
  qKey: typeof QKEYS[number]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildExam(): ExamQ[] {
  return shuffle(scenarios).slice(0, EXAM_SIZE).map(scenario => ({
    scenario,
    qKey: QKEYS[Math.floor(Math.random() * QKEYS.length)],
  }))
}

export function ExamMode({ onClose, onFinish }: { onClose: () => void; onFinish: () => void }) {
  const [exam,     setExam]     = useState<ExamQ[]>(() => buildExam())
  const [qi,       setQi]       = useState(0)
  const [answers,  setAnswers]  = useState<number[]>([])
  const [finished, setFinished] = useState(false)
  const [best,     setBest]     = useState<number>(() => {
    try { return Number(localStorage.getItem(BEST_KEY) ?? 0) } catch { return 0 }
  })

  const current = exam[qi]
  const q = current ? current.scenario[current.qKey] : null
  const score = finished
    ? exam.reduce((s, e, i) => s + (answers[i] === e.scenario[e.qKey].correct ? 1 : 0), 0)
    : 0

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (!finished) return
    onFinish()
    if (score > best) {
      setBest(score)
      try { localStorage.setItem(BEST_KEY, String(score)) } catch { /* private mode */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished])

  const pick = (oi: number) => {
    const next = [...answers]
    next[qi] = oi
    setAnswers(next)
    // Exam style: no feedback, immediate advance
    if (qi + 1 >= exam.length) setFinished(true)
    else setQi(qi + 1)
  }

  const restart = () => {
    setExam(buildExam()); setQi(0); setAnswers([]); setFinished(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(3,3,8,0.97)', backdropFilter:'blur(10px)', overflowY:'auto' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize:11, fontWeight:900, letterSpacing:'0.2em', color:'#f59e0b' }}>🎓 EXAM MODE</span>
            {!finished && <span style={{ fontSize:10, color:'rgba(100,116,139,0.7)', fontWeight:700 }}>{qi + 1} / {exam.length}</span>}
            {best > 0 && <span style={{ fontSize:10, fontWeight:700, color:'rgba(245,158,11,0.55)' }}>Best {best}/{EXAM_SIZE}</span>}
          </div>
          <button onClick={onClose}
            className="text-[12px] font-bold px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            style={{ background:'rgba(255,255,255,0.04)' }}>
            ✕ Quit
          </button>
        </div>

        {/* Progress */}
        <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden', marginBottom:20 }}>
          <div style={{ width:`${(finished ? exam.length : qi) / exam.length * 100}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)', transition:'width 0.25s ease' }}/>
        </div>

        {!finished && current && q && (
          <div className="space-y-3">
            {/* No feedback in exam mode — answers reveal at the end */}
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize:9, fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', padding:'3px 9px', borderRadius:999, color:'#94a3b8', background:'rgba(148,163,184,0.08)', border:'1px solid rgba(148,163,184,0.2)' }}>
                {current.scenario.title}
              </span>
              <span style={{ fontSize:9, color:'rgba(100,116,139,0.6)', fontFamily:'monospace' }}>
                {current.scenario.instrument} · {current.scenario.timeframe} · {current.scenario.session}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800/60 p-4" style={{ background:'#0b0b14' }}>
              <p className="text-[10px] text-slate-600 leading-relaxed m-0 mb-2">
                <span className="font-bold text-slate-500">Context: </span>{current.scenario.sessionContext}
              </p>
              <p className="text-sm font-bold text-white m-0">{q.prompt}</p>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => pick(oi)}
                  className="w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer"
                  style={{ background:'rgba(15,15,24,0.8)', borderColor:'rgba(30,41,59,0.8)', color:'#94a3b8' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(245,158,11,0.4)'; (e.currentTarget as HTMLElement).style.color='#e2e8f0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(30,41,59,0.8)'; (e.currentTarget as HTMLElement).style.color='#94a3b8' }}>
                  <span className="opacity-40 mr-2 text-[10px]" style={{ fontFamily:'monospace' }}>{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>
            <p style={{ fontSize:10, color:'rgba(100,116,139,0.45)', textAlign:'center' }}>No feedback until the end — commit like it's live.</p>
          </div>
        )}

        {finished && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <p style={{ fontSize:60, fontWeight:900, lineHeight:1, fontFamily:'monospace', color: score >= 8 ? '#34d399' : score >= 5 ? '#f59e0b' : '#f87171', textShadow:'0 0 36px currentColor', margin:0 }}>
                {score}/{exam.length}
              </p>
              <p className="text-sm font-bold mt-3" style={{ color: score >= 8 ? '#6ee7b7' : score >= 5 ? '#fde68a' : '#fca5a5' }}>
                {score === exam.length ? '🔥 Flawless — funded-trader material' : score >= 8 ? 'Sharp — the concepts are sticking' : score >= 5 ? 'Passing — drill the misses below' : 'Back to the scenarios — repetition builds the read'}
              </p>
              {score >= best && score > 0 && <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.15em', color:'#f59e0b', textTransform:'uppercase', marginTop:8 }}>★ New best</p>}
            </div>

            {/* Review misses */}
            {exam.some((e, i) => answers[i] !== e.scenario[e.qKey].correct) && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400/80 m-0">Review your misses</p>
                {exam.map((e, i) => {
                  const eq = e.scenario[e.qKey]
                  if (answers[i] === eq.correct) return null
                  return (
                    <div key={i} className="rounded-xl border border-red-500/20 p-3.5" style={{ background:'rgba(248,113,113,0.04)' }}>
                      <p className="text-[11px] font-bold text-slate-200 m-0 mb-1.5">{eq.prompt}</p>
                      <p className="text-[10.5px] m-0 mb-1" style={{ color:'#f87171' }}>✗ You: {eq.options[answers[i]] ?? '—'}</p>
                      <p className="text-[10.5px] m-0 mb-1.5" style={{ color:'#34d399' }}>✓ {eq.options[eq.correct]}</p>
                      <p className="text-[10px] text-slate-500 leading-relaxed m-0">{eq.explanation}</p>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex gap-2.5 justify-center pb-6">
              <button onClick={restart}
                className="px-6 py-3 rounded-xl text-[13px] font-black cursor-pointer border-0"
                style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#0a0800' }}>
                ↺ New exam
              </button>
              <button onClick={onClose}
                className="px-5 py-3 rounded-xl text-[13px] font-bold border border-slate-700 text-slate-300 cursor-pointer"
                style={{ background:'transparent' }}>
                Back to scenarios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
