/**
 * Injects schema.org structured data describing the ICT Replay Trainer into the
 * document head. Marks the app up as an interactive LearningResource and lists
 * the scenarios so search engines understand the practice content.
 */
import { scenarios } from './data/scenarios'

const SITE = 'https://chronic-trading.github.io/ict-replay/'

const CATEGORY_LABELS: Record<string, string> = {
  'fvg': 'Fair Value Gap',
  'order-block': 'Order Block',
  'liquidity': 'Liquidity',
  'market-structure': 'Market Structure',
  'amd': 'AMD Cycle',
  'kill-zone': 'Kill Zone',
  'judas-swing': 'Judas Swing',
  'full-model': 'Full Model',
}

export function injectReplayJsonLd() {
  if (typeof document === 'undefined') return
  if (document.getElementById('ld-replay')) return

  const teaches = [...new Set(scenarios.map(s => CATEGORY_LABELS[s.category] ?? s.category))]

  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': SITE,
    name: 'ICT Replay Trainer',
    description:
      'Practice reading real ICT setups: identify the concept, pick the direction, name the draw on liquidity, and set your entry. Scored scenarios with bar-by-bar trade replay.',
    url: SITE,
    inLanguage: 'en',
    learningResourceType: 'Interactive practice',
    interactivityType: 'active',
    educationalLevel: 'Beginner to Advanced',
    teaches,
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: 'Chronic Trading' },
  }

  const scenarioList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'ICT practice scenarios',
    numberOfItems: scenarios.length,
    itemListElement: scenarios.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: s.title,
    })),
  }

  const el = document.createElement('script')
  el.id = 'ld-replay'
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify([learningResource, scenarioList])
  document.head.appendChild(el)
}
