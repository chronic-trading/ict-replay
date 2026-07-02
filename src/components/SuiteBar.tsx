// Chronic Trading suite bar — duplicated across trading-lab, ict-replay,
// ict-glossary. Keep in sync.
const SITES = [
  { id: 'lab',      label: 'Lab',      url: 'https://chronic-trading.github.io/trading-lab/' },
  { id: 'replay',   label: 'Replay',   url: 'https://chronic-trading.github.io/ict-replay/' },
  { id: 'glossary', label: 'Glossary', url: 'https://chronic-trading.github.io/ict-glossary/' },
] as const

export type SiteId = typeof SITES[number]['id']

export function SuiteBar({ current }: { current: SiteId }) {
  return (
    <div className="suite-bar">
      <a className="suite-wordmark" href={SITES[0].url}>
        <span className="suite-dot" />
        CHRONIC TRADING
      </a>
      <nav className="suite-links" aria-label="Chronic Trading sites">
        {SITES.map(s => s.id === current
          ? <span key={s.id} className="suite-link active" aria-current="page">{s.label}</span>
          : <a key={s.id} className="suite-link" href={s.url}>{s.label}</a>
        )}
      </nav>
    </div>
  )
}
