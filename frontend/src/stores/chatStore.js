import { create } from 'zustand'
import { loadSessions, saveSession, deleteSessionDb } from '../services/dbService'

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36)

const createDefaultSession = () => ({
  id: generateId(),
  title: 'New Chat',
  messages: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const useChatStore = create((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isStreaming: false,
  mode: 'standard',
  superIntelStep: 0,
  superIntelData: null,
  superIntelTiming: {
    step1Start: null, step1End: null,
    step2Start: null, step2End: null,
    step3Start: null, step3End: null,
  },
  ragStatus: { active: false, filename: '', chunkCount: 0 },
  modelStatus: { primary: 'active', backup1: 'standby', backup2: 'standby' },
  dbLoaded: false,

  initForUser: async (uid) => {
    try {
      const sessions = await loadSessions(uid)
      if (sessions.length === 0) {
        const session = createDefaultSession()
        set({ sessions: [session], currentSessionId: session.id, dbLoaded: true })
        await saveSession(uid, session)
      } else {
        set({ sessions, currentSessionId: sessions[0].id, dbLoaded: true })
      }
    } catch (err) {
      console.warn('initForUser error:', err)
      const session = createDefaultSession()
      set({ sessions: [session], currentSessionId: session.id, dbLoaded: true })
    }
  },

  clearForUser: () => set({ sessions: [], currentSessionId: null, dbLoaded: false }),

  createSession: (uid) => {
    const session = createDefaultSession()
    set(state => ({
      sessions: [session, ...state.sessions],
      currentSessionId: session.id,
      superIntelStep: 0,
      superIntelData: null,
    }))
    get().resetSuperIntelTiming()
    if (uid) saveSession(uid, session).catch(console.warn)
    return session.id
  },

  setCurrentSession: (id) => {
    set({ currentSessionId: id, superIntelStep: 0, superIntelData: null })
    get().resetSuperIntelTiming()
  },

  deleteSession: (id, uid) => {
    const { sessions, currentSessionId } = get()
    const remaining = sessions.filter(s => s.id !== id)
    if (remaining.length === 0) {
      const newSession = createDefaultSession()
      set({ sessions: [newSession], currentSessionId: newSession.id })
      if (uid) saveSession(uid, newSession).catch(console.warn)
    } else {
      set({ sessions: remaining, currentSessionId: currentSessionId === id ? remaining[0].id : currentSessionId })
    }
    if (uid) deleteSessionDb(uid, id).catch(console.warn)
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get()
    return sessions.find(s => s.id === currentSessionId) || null
  },

  addMessage: (message, uid) => {
    const { sessions, currentSessionId } = get()
    const msg = { id: generateId(), ...message, timestamp: new Date().toISOString() }
    let updatedSession = null
    set({
      sessions: sessions.map(s => {
        if (s.id !== currentSessionId) return s
        updatedSession = {
          ...s,
          messages: [...s.messages, msg],
          title: s.messages.length === 0 && message.role === 'user'
            ? message.content.slice(0, 28) + (message.content.length > 28 ? '...' : '')
            : s.title,
          updatedAt: new Date().toISOString(),
        }
        return updatedSession
      }),
    })
    if (uid && updatedSession) saveSession(uid, updatedSession).catch(console.warn)
    return msg.id
  },

  updateLastMessage: (content) => {
    const { sessions, currentSessionId } = get()
    set({
      sessions: sessions.map(s => {
        if (s.id !== currentSessionId) return s
        return { ...s, messages: s.messages.map((m, i) => i === s.messages.length - 1 ? { ...m, content } : m) }
      }),
    })
  },

  persistCurrentSession: (uid) => {
    if (!uid) return
    const session = get().getCurrentSession()
    if (session) saveSession(uid, session).catch(console.warn)
  },

  clearCurrentSession: (uid) => {
    const { sessions, currentSessionId } = get()
    let updated = null
    set({
      sessions: sessions.map(s => {
        if (s.id !== currentSessionId) return s
        updated = { ...s, messages: [], title: 'New Chat', updatedAt: new Date().toISOString() }
        return updated
      }),
    })
    if (uid && updated) saveSession(uid, updated).catch(console.warn)
  },

  setStreaming: (val) => set({ isStreaming: val }),
  setMode: (mode) => set({ mode }),
  setSuperIntelStep: (step) => set({ superIntelStep: step }),
  setSuperIntelData: (data) => set({ superIntelData: data }),
  setSuperIntelTiming: (timing) => set(state => ({ superIntelTiming: { ...state.superIntelTiming, ...timing } })),
  resetSuperIntelTiming: () => set({ superIntelTiming: { step1Start: null, step1End: null, step2Start: null, step2End: null, step3Start: null, step3End: null } }),

  attachSuperIntelData: (data, uid) => {
    const { sessions, currentSessionId } = get()
    let updated = null
    set({
      sessions: sessions.map(s => {
        if (s.id !== currentSessionId) return s
        updated = { ...s, messages: s.messages.map((m, idx) => idx === s.messages.length - 1 ? { ...m, superIntelData: data } : m) }
        return updated
      }),
    })
    if (uid && updated) saveSession(uid, updated).catch(console.warn)
  },

  setRagStatus: (status) => set({ ragStatus: status }),
  setModelStatus: (status) => set({ modelStatus: { ...get().modelStatus, ...status } }),
  init: () => {},
}))
