// Firebase configuration - values come from .env
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let auth = null
let db = null
let firebaseReady = false

try {
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'undefined'
  ) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    firebaseReady = true
  }
} catch (err) {
  console.warn('Firebase init failed, falling back to local storage:', err)
  firebaseReady = false
}

export { auth, db, firebaseReady }

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured')
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function signOutUser() {
  if (!auth) return
  await signOut(auth)
}
