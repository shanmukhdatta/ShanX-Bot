import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, signInWithGoogle, signOutUser, firebaseReady } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { clearLocalHistory } from '../services/dbService'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,           // Firebase user object (serializable subset)
      isDemo: false,        // Demo mode flag
      loading: true,        // Auth loading state
      dbConnected: false,   // Firestore connected flag
      authListenerSetup: false,

      // Set up Firebase auth listener
      initAuth: () => {
        if (get().authListenerSetup) return
        set({ authListenerSetup: true })

        if (!firebaseReady || !auth) {
          set({ loading: false, dbConnected: false })
          return
        }

        onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
              },
              isDemo: false,
              loading: false,
              dbConnected: firebaseReady,
            })
          } else {
            // Only clear if not in demo mode
            const { isDemo } = get()
            if (!isDemo) {
              set({ user: null, loading: false, dbConnected: false })
            } else {
              set({ loading: false })
            }
          }
        })
      },

      // Sign in with Google
      signIn: async () => {
        set({ loading: true })
        try {
          const user = await signInWithGoogle()
          set({
            user: {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            isDemo: false,
            loading: false,
            dbConnected: firebaseReady,
          })
          return { success: true }
        } catch (err) {
          set({ loading: false })
          return { success: false, error: err.message }
        }
      },

      // Enter demo mode
      enterDemoMode: () => {
        set({
          user: {
            uid: 'demo-user',
            email: 'demo@shanxbot.local',
            displayName: 'Demo User',
            photoURL: null,
          },
          isDemo: true,
          loading: false,
          dbConnected: false,
        })
      },

      // Sign out
      signOut: async () => {
        const { user, isDemo } = get()
        if (isDemo && user?.uid) {
          await clearLocalHistory(user.uid)
        }
        set({ user: null, isDemo: false, dbConnected: false, loading: false })
        await signOutUser().catch(console.error)
      },

      setDbConnected: (val) => set({ dbConnected: val }),
    }),
    {
      name: 'shanxbot_auth',
      partialize: (state) => ({
        user: state.user,
        isDemo: state.isDemo,
      }),
    }
  )
)
