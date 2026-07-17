import { useState, useEffect } from 'react'
import { GraduationCap } from 'lucide-react'
import { scenarios, type Scenario } from '../data/scenarios'
import { GlossaryText } from './GlossaryText'

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
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'var(--rp-overlay)', backdropFilter:'blur(10px)', overflowY:'auto' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize:11, fontWeight:900, letterSpacing:'0.2em', color:'var(--rp-amber)', display:'inline-flex', alignItems:'center', gap:6 }}><GraduationCap size={14} strokeWidth={2} /> EXAM MODE</span>
            {!finished && <span style={{ fontSize:10, color:'var(--rp-text-faint)', fontWeight:700 }}>{qi + 1} / {exam.length}</span>}
            {best > 0 && <span style={{ fontSize:10, fontWeight:700, color:'var(--rp-amber)' }}>Best {best}/{EXAM_SIZE}</span>}
          </div>
          <button onClick={onClose}
            className="text-[12px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer"
            style={{ background:'var(--rp-surface-2)', borderColor:'var(--rp-border)', color:'var(--rp-text-dim)' }}>
            ✕ Quit
          </button>
        </div>

        {/* Progress */}
        <div style={{ height:3, borderRadius:2, background:'var(--rp-surface-2)', overflow:'hidden', marginBottom:20 }}>
          <div style={{ width:`${(finished ? exam.length : qi) / exam.length * 100}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#fbbf24)', transition:'width 0.25s ease' }}/>
        </div>

        {!finished && current && q && (
          <div className="space-y-3">
            {/* No feedback in exam mode — answers reveal at the end */}
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize:9, fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', padding:'3px 9px', borderRadius:999, color:'var(--rp-slate)', background:'rgba(148,163,184,0.1)', border:'1px solid rgba(148,163,184,0.25)' }}>
                {current.scenario.title}
              </span>
              <span style={{ fontSize:9, color:'var(--rp-text-faint)', fontFamily:'monospace' }}>
                {current.scenario.instrument} · {current.scenario.timeframe} · {current.scenario.session}
              </span>
            </div>

            <div className="rounded-2xl border p-4" style={{ background:'var(--rp-surface)', borderColor:'var(--rp-border)' }}>
              <p className="text-[10px] leading-relaxed m-0 mb-2" style={{ color:'var(--rp-text-faint)' }}>
                <span className="font-bold" style={{ color:'var(--rp-text-dim)' }}>Context: </span>{current.scenario.sessionContext}
              </p>
              <p className="text-sm font-bold m-0" style={{ color:'var(--rp-text)' }}>{q.prompt}</p>
            </div>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => pick(oi)}
                  className="w-full text-left px-4 py-3 rounded-xl border text-xs font-medium transition-all cursor-pointer"
                  style={{ background:'var(--rp-surface-2)', borderColor:'var(--rp-border)', color:'var(--rp-text-dim)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(245,158,11,0.5)'; (e.currentTarget as HTMLElement).style.color='var(--rp-text)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='var(--rp-border)'; (e.currentTarget as HTMLElement).style.color='var(--rp-text-dim)' }}>
                  <span className="opacity-50 mr-2 text-[10px]" style={{ fontFamily:'monospace' }}>{String.fromCharCode(65 + oi)}.</span>
                  {opt}
                </button>
              ))}
            </div>
            <p style={{ fontSize:10, color:'var(--rp-text-faint)', textAlign:'center' }}>No feedback until the end — commit like it's live.</p>
          </div>
        )}

        {finished && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <p style={{ fontSize:60, fontWeight:900, lineHeight:1, fontFamily:'monospace', color: score >= 8 ? 'var(--rp-green)' : score >= 5 ? 'var(--rp-amber)' : 'var(--rp-red)', margin:0 }}>
                {score}/{exam.length}
              </p>
              <p className="text-sm font-bold mt-3" style={{ color: score >= 8 ? 'var(--rp-green)' : score >= 5 ? 'var(--rp-amber)' : 'var(--rp-red)' }}>
                {score === exam.length ? 'Flawless — funded-trader material' : score >= 8 ? 'Sharp — the concepts are sticking' : score >= 5 ? 'Passing — drill the misses below' : 'Back to the scenarios — repetition builds the read'}
              </p>
              {score >= best && score > 0 && <p style={{ fontSize:10, fontWeight:900, letterSpacing:'0.15em', color:'var(--rp-amber)', textTransform:'uppercase', marginTop:8 }}>★ New best</p>}
            </div>

            {/* Review misses */}
            {exam.some((e, i) => answers[i] !== e.scenario[e.qKey].correct) && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest m-0" style={{ color:'var(--rp-red)' }}>Review your misses</p>
                {exam.map((e, i) => {
                  const eq = e.scenario[e.qKey]
                  if (answers[i] === eq.correct) return null
                  return (
                    <div key={i} className="rounded-xl border p-3.5" style={{ background:'rgba(248,113,113,0.06)', borderColor:'rgba(248,113,113,0.25)' }}>
                      <p className="text-[11px] font-bold m-0 mb-1.5" style={{ color:'var(--rp-text)' }}>{eq.prompt}</p>
                      <p className="text-[11px] m-0 mb-1" style={{ color:'var(--rp-red)' }}>✗ You: {eq.options[answers[i]] ?? '—'}</p>
                      <p className="text-[11px] m-0 mb-1.5" style={{ color:'var(--rp-green)' }}>✓ {eq.options[eq.correct]}</p>
                      <p className="text-[10px] leading-relaxed m-0" style={{ color:'var(--rp-text-dim)' }}><GlossaryText text={eq.explanation} /></p>
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
                className="px-5 py-3 rounded-xl text-[13px] font-bold border cursor-pointer"
                style={{ background:'transparent', borderColor:'var(--rp-border)', color:'var(--rp-text-dim)' }}>
                Back to scenarios
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
