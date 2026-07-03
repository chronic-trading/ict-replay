import { useState, useEffect } from 'react'

export interface ScenarioResult {
  scenarioId: string
  score: number       // 0-4 (one point per correct answer)
  answeredAt: string  // ISO
}

export interface TradeRecord {
  scenarioId: string
  direction: 'long' | 'short'
  outcome: 'target' | 'stopped' | 'expired'
  r: number           // realized R-multiple
  tradedAt: string    // ISO
}

const KEY  = 'ict-replay-progress'
const TKEY = 'ict-replay-trades'
const DKEY = 'ict-replay-days'

// Local-timezone YYYY-MM-DD
function todayStr(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString('en-CA')
}

// Parse YYYY-MM-DD as a LOCAL date (new Date(string) would parse it as UTC,
// shifting the day in negative-offset timezones)
function parseLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function computeStreaks(days: string[]): { current: number; best: number } {
  if (days.length === 0) return { current: 0, best: 0 }
  const set = new Set(days)
  // best: longest consecutive run anywhere
  let best = 0
  for (const d of set) {
    const prev = parseLocal(d); prev.setDate(prev.getDate() - 1)
    if (set.has(prev.toLocaleDateString('en-CA'))) continue // not a run start
    let len = 0
    const cur = parseLocal(d)
    while (set.has(cur.toLocaleDateString('en-CA'))) { len++; cur.setDate(cur.getDate() + 1) }
    if (len > best) best = len
  }
  // current: run ending today (or yesterday, if today has no activity yet)
  let current = 0
  const anchor = set.has(todayStr()) ? todayStr() : set.has(todayStr(-1)) ? todayStr(-1) : null
  if (anchor) {
    const cur = parseLocal(anchor)
    while (set.has(cur.toLocaleDateString('en-CA'))) { current++; cur.setDate(cur.getDate() - 1) }
  }
  return { current, best }
}

export function useProgress() {
  const [results, setResults] = useState<ScenarioResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
    catch { return [] }
  })
  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(TKEY) ?? '[]') }
    catch { return [] }
  })
  const [days, setDays] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(DKEY) ?? '[]') }
    catch { return [] }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(results)) }, [results])
  useEffect(() => { localStorage.setItem(TKEY, JSON.stringify(trades)) }, [trades])
  useEffect(() => { localStorage.setItem(DKEY, JSON.stringify(days)) }, [days])

  const markActivity = () => {
    const d = todayStr()
    setDays(p => (p.includes(d) ? p : [...p, d]))
  }

  const saveResult = (scenarioId: string, score: number) => {
    markActivity()
    setResults(p => {
      const existing = p.findIndex(r => r.scenarioId === scenarioId)
      const entry: ScenarioResult = { scenarioId, score, answeredAt: new Date().toISOString() }
      if (existing >= 0) {
        const next = [...p]
        next[existing] = entry
        return next
      }
      return [...p, entry]
    })
  }

  const saveTrade = (t: Omit<TradeRecord, 'tradedAt'>) => {
    markActivity()
    setTrades(p => {
      const entry: TradeRecord = { ...t, tradedAt: new Date().toISOString() }
      const existing = p.findIndex(x => x.scenarioId === t.scenarioId)
      if (existing >= 0) {
        const next = [...p]
        next[existing] = entry
        return next
      }
      return [...p, entry]
    })
  }

  const getResult = (scenarioId: string) => results.find(r => r.scenarioId === scenarioId)
  const getTrade  = (scenarioId: string) => trades.find(t => t.scenarioId === scenarioId)

  const totalScore    = results.reduce((s, r) => s + r.score, 0)
  const totalPossible = results.length * 4
  const avgScore      = results.length > 0 ? (totalScore / results.length).toFixed(1) : '—'
  const completed     = results.length
  const perfect       = results.filter(r => r.score === 4).length
  const tradedCount   = trades.length
  const netR          = Math.round(trades.reduce((s, t) => s + t.r, 0) * 100) / 100
  const streaks       = computeStreaks(days)

  return {
    results, saveResult, getResult, totalScore, totalPossible, avgScore, completed, perfect,
    trades, saveTrade, getTrade, tradedCount, netR,
    markActivity, streak: streaks.current, bestStreak: streaks.best,
  }
}
