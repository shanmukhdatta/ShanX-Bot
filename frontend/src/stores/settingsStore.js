import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SYSTEM_PROMPT = `You are ShanXBot, an advanced multi-model AI assistant built by Shanmukh Datta. You are helpful, thoughtful, and precise. You provide clear, well-structured responses and are capable of handling complex reasoning tasks. Always be honest, accurate, and genuinely helpful.`

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      apiKeys: {
        groq: '',
        gemini: '',
        openrouter: '',
      },
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      modelPreferences: {
        primary: 'llama-3.3-70b-versatile',
        backup1: 'gemini-1.5-flash',
        backup2: 'mistralai/mistral-7b-instruct',
        judge: 'llama-3.3-70b-versatile',
      },
      fontSize: 'md',
      theme: 'light',

      setApiKeys: (keys) => set(state => ({ apiKeys: { ...state.apiKeys, ...keys } })),
      setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
      setModelPreferences: (prefs) => set(state => ({ modelPreferences: { ...state.modelPreferences, ...prefs } })),
      setFontSize: (size) => set({ fontSize: size }),
      resetSystemPrompt: () => set({ systemPrompt: DEFAULT_SYSTEM_PROMPT }),

      getHeaders: () => {
        const { apiKeys } = get()
        return {
          'x-groq-key': apiKeys.groq,
          'x-gemini-key': apiKeys.gemini,
          'x-openrouter-key': apiKeys.openrouter,
          'Content-Type': 'application/json',
        }
      },
    }),
    {
      name: 'shanxbot_settings',
    }
  )
)
