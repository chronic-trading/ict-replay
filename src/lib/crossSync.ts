/**
 * crossSync — shared cross-site progress via Supabase.
 * Duplicated across ict-replay and ict-glossary (like brand.css). Keep in sync.
 *
 * All three Chronic Trading sites share the chronic-trading.github.io origin and
 * the SAME Supabase project, so the auth session Trading Lab writes to
 * localStorage (key `sb-<ref>-auth-token`) is automatically visible here — no
 * second login. These apps read that session and sync their progress into
 * user_data.cross_site (a jsonb blob namespaced per app).
 *
 * Fully defensive: no session, missing column, or network error → the caller
 * keeps working from localStorage exactly as before. Never throws.
 */
import { createClient, type Session } from '@supabase/supabase-js'

// Public anon key — safe to embed (same one shipped in the Trading Lab bundle).
const SUPABASE_URL = 'https://hgvktmjqegywjrwbkipv.supabase.co'
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhndmt0bWpxZWd5d2pyd2JraXB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTE3MjMsImV4cCI6MjA5NDE2NzcyM30.OY5PMcTU6pBGHtr9mpEh31w6soH-191edr0DImREVFI'

// Default storageKey is `sb-<ref>-auth-token`; identical project ref across all
// three sites means this client reads the session the Lab already established.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
})

export async function getSession(): Promise<Session | null> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session ?? null
  } catch {
    return null
  }
}

export type SyncStatus =
  | 'signed-out'    // no Supabase session in this browser
  | 'ready'         // signed in AND the cross_site column is reachable
  | 'unavailable'   // signed in but the column/table isn't ready (pre-migration) or network error

/**
 * One round-trip that reports whether sync is actually usable, and returns the
 * whole cross_site blob so a namespace can be read without a second request.
 * The indicator should only claim "synced" when status === 'ready'.
 */
export async function probeSync(): Promise<{ status: SyncStatus; blob: Record<string, unknown> }> {
  try {
    const session = await getSession()
    if (!session) return { status: 'signed-out', blob: {} }
    const { data, error } = await supabase
      .from('user_data')
      .select('cross_site')
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (error) return { status: 'unavailable', blob: {} }
    return { status: 'ready', blob: (data?.cross_site ?? {}) as Record<string, unknown> }
  } catch {
    return { status: 'unavailable', blob: {} }
  }
}

/** Merge this app's namespace into user_data.cross_site (read-merge-write). No-op if signed out. */
export async function pushNamespace(namespace: string, value: unknown): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) return false
    const uid = session.user.id
    const { data, error: readErr } = await supabase
      .from('user_data')
      .select('cross_site')
      .eq('user_id', uid)
      .maybeSingle()
    if (readErr) return false
    const blob = (data?.cross_site ?? {}) as Record<string, unknown>
    blob[namespace] = value
    const { error: writeErr } = await supabase
      .from('user_data')
      .upsert({ user_id: uid, cross_site: blob }, { onConflict: 'user_id' })
    return !writeErr
  } catch {
    return false
  }
}

/** Subscribe to auth changes (login on another tab/site propagates here). */
export function onAuthChange(cb: (session: Session | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}
