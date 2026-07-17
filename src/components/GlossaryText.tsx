/**
 * GlossaryText — renders prose with ICT terms tappable: tap a term for an
 * inline definition popover with a deep link to the full glossary entry.
 * Duplicated across trading-lab and ict-replay (like brand.css). Keep in sync.
 * Term data comes from src/data/glossaryTerms.ts (generated — see its header).
 */
import { useMemo, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { GLOSSARY_TERMS, GLOSSARY_CATEGORY_COLORS, GLOSSARY_URL, type GlossaryTerm } from '../data/glossaryTerms'

// ── Term matcher, built once at module load ──────────────────────────────────

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const nameMap = new Map<string, GlossaryTerm>()
const abbrMap = new Map<string, GlossaryTerm>()
for (const t of GLOSSARY_TERMS) {
  nameMap.set(t.term.toLowerCase(), t)
  if (t.abbr) abbrMap.set(t.abbr, t)
}

// Longest names first so "Break of Structure" wins over "Structure";
// abbreviations matched case-sensitively at resolve time (FVG yes, "fvg" no).
const TERM_RE = new RegExp(
  `\\b(${[
    ...GLOSSARY_TERMS.map(t => t.term).sort((a, b) => b.length - a.length).map(escapeRe),
    ...GLOSSARY_TERMS.filter(t => t.abbr).map(t => escapeRe(t.abbr!)),
  ].join('|')})(?:s\\b|\\b)`,
  'gi',
)

function resolveTerm(core: string): GlossaryTerm | null {
  return abbrMap.get(core) ?? nameMap.get(core.toLowerCase()) ?? null
}

type Seg = string | { display: string; term: GlossaryTerm }

function segment(text: string): Seg[] {
  const out: Seg[] = []
  let last = 0
  TERM_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TERM_RE.exec(text))) {
    const term = resolveTerm(m[1])
    if (!term) continue
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push({ display: m[0], term })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Pop { term: GlossaryTerm; x: number; y: number; above: boolean }

export function GlossaryText({ text }: { text: string }) {
  const segs = useMemo(() => segment(text), [text])
  const [pop, setPop] = useState<Pop | null>(null)
  const popRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pop) return
    const close = (e: Event) => {
      if (popRef.current && e.target instanceof Node && popRef.current.contains(e.target)) return
      setPop(null)
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null) }
    document.addEventListener('pointerdown', close, true)
    window.addEventListener('scroll', close, true)
    window.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', close, true)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('keydown', esc)
    }
  }, [pop])

  const openPop = (term: GlossaryTerm) => (e: React.MouseEvent) => {
    e.stopPropagation()
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const vw = window.innerWidth
    const W = Math.min(330, vw - 24)
    const above = r.top > window.innerHeight * 0.55
    const x = Math.min(Math.max(r.left + r.width / 2, 12 + W / 2), vw - 12 - W / 2)
    setPop(p => (p && p.term.id === term.id ? null : { term, x, y: above ? r.top - 8 : r.bottom + 8, above }))
  }

  if (segs.length === 1 && typeof segs[0] === 'string') return <>{text}</>

  const color = pop ? (GLOSSARY_CATEGORY_COLORS[pop.term.category] ?? '#f59e0b') : ''
  const W = pop ? Math.min(330, window.innerWidth - 24) : 0

  return (
    <>
      {segs.map((s, i) =>
        typeof s === 'string' ? (
          s
        ) : (
          <button
            key={i}
            type="button"
            onClick={openPop(s.term)}
            title={`${s.term.term} — tap for definition`}
            style={{
              background: 'none', border: 'none', padding: 0, margin: 0,
              font: 'inherit', color: 'inherit', cursor: 'pointer',
              borderBottom: '1px dotted rgba(245,158,11,0.55)',
            }}
          >
            {s.display}
          </button>
        ),
      )}
      {/* Portaled: GlossaryText usually sits inside a <p>, where a nested <div> is invalid HTML */}
      {pop && createPortal(
        <div
          ref={popRef}
          style={{
            position: 'fixed', zIndex: 200, width: W,
            left: pop.x - W / 2,
            ...(pop.above ? { bottom: window.innerHeight - pop.y } : { top: pop.y }),
            background: 'rgba(8,8,16,0.98)',
            border: `1px solid ${color}44`, borderLeft: `3px solid ${color}`,
            borderRadius: 14, padding: '12px 14px',
            boxShadow: `0 12px 40px rgba(0,0,0,0.65), 0 0 24px ${color}18`,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.1px' }}>{pop.term.term}</span>
            {pop.term.abbr && (
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', padding: '2px 7px', borderRadius: 6, background: `${color}16`, color, border: `1px solid ${color}30` }}>
                {pop.term.abbr}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(148,163,184,0.9)', lineHeight: 1.6, margin: 0, maxHeight: 170, overflowY: 'auto' }}>
            {pop.term.definition}
          </p>
          <a
            href={`${GLOSSARY_URL}?t=${pop.term.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 9, fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color, textDecoration: 'none' }}
          >
            Full entry + diagram ↗
          </a>
        </div>,
        document.body,
      )}
    </>
  )
}
