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

export function useProgress() {
  const [results, setResults] = useState<ScenarioResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') }
    catch { return [] }
  })
  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    try { return JSON.parse(localStorage.getItem(TKEY) ?? '[]') }
    catch { return [] }
  })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(results)) }, [results])
  useEffect(() => { localStorage.setItem(TKEY, JSON.stringify(trades)) }, [trades])

  const saveResult = (scenarioId: string, score: number) => {
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

  return {
    results, saveResult, getResult, totalScore, totalPossible, avgScore, completed, perfect,
    trades, saveTrade, getTrade, tradedCount, netR,
  }
}
