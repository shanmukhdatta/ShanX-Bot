/**
 * DB Service — wraps Firestore with a full localStorage fallback.
 * All functions are async so callers don't need to care which backend is used.
 */
import { db, firebaseReady } from '../firebase'
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore'

const LOCAL_KEY_PREFIX = 'shanxbot_sessions_'

// ─── helpers ─────────────────────────────────────────────────────────────────

function localKey(uid) {
  return `${LOCAL_KEY_PREFIX}${uid}`
}

function readLocal(uid) {
  try {
    const raw = localStorage.getItem(localKey(uid))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocal(uid, sessions) {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(sessions))
  } catch (e) {
    console.warn('localStorage write failed:', e)
  }
}


// Strip heavy per-message data before Firestore writes to stay under 1MB doc limit
function stripHeavyData(session) {
  return {
    ...session,
    messages: session.messages.map(m => {
      const { superIntelData, ...rest } = m
      return rest
    }),
  }
}

// ─── public API ──────────────────────────────────────────────────────────────

/**
 * Load all sessions for a user.
 * Returns [] on any error.
 */
export async function loadSessions(uid) {
  if (!uid || uid === 'demo-user') {
    return readLocal(uid || 'demo-user')
  }

  if (firebaseReady && db) {
    try {
      const ref = collection(db, 'users', uid, 'sessions')
      const q = query(ref, orderBy('updatedAt', 'desc'))
      const snap = await getDocs(q)
      const sessions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return sessions
    } catch (err) {
      console.warn('Firestore load failed, using localStorage:', err)
      return readLocal(uid)
    }
  }

  return readLocal(uid)
}

/**
 * Save (upsert) a single session.
 */
export async function saveSession(uid, session) {
  if (!uid || uid === 'demo-user') {
    const sessions = readLocal(uid || 'demo-user')
    const idx = sessions.findIndex(s => s.id === session.id)
    if (idx >= 0) sessions[idx] = session
    else sessions.unshift(session)
    writeLocal(uid || 'demo-user', sessions)
    return
  }

  if (firebaseReady && db) {
    try {
      const ref = doc(db, 'users', uid, 'sessions', session.id)
      await setDoc(ref, stripHeavyData(session), { merge: true })
      return
    } catch (err) {
      console.warn('Firestore save failed, using localStorage:', err)
    }
  }

  // fallback
  const sessions = readLocal(uid)
  const idx = sessions.findIndex(s => s.id === session.id)
  if (idx >= 0) sessions[idx] = session
  else sessions.unshift(session)
  writeLocal(uid, sessions)
}

/**
 * Delete a session.
 */
export async function deleteSessionDb(uid, sessionId) {
  if (!uid || uid === 'demo-user') {
    const sessions = readLocal(uid || 'demo-user').filter(s => s.id !== sessionId)
    writeLocal(uid || 'demo-user', sessions)
    return
  }

  if (firebaseReady && db) {
    try {
      await deleteDoc(doc(db, 'users', uid, 'sessions', sessionId))
      return
    } catch (err) {
      console.warn('Firestore delete failed, using localStorage:', err)
    }
  }

  const sessions = readLocal(uid).filter(s => s.id !== sessionId)
  writeLocal(uid, sessions)
}

/**
 * Bulk save all sessions (used for migration / sync).
 */
export async function saveAllSessions(uid, sessions) {
  for (const session of sessions) {
    await saveSession(uid, session)
  }
}
/**
 * Wipe all local history for a user.
 */
export async function clearLocalHistory(uid) {
  if (!uid) return
  localStorage.removeItem(localKey(uid))
}
