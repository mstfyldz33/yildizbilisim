import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Debug: Environment variables kontrolü (sadece development'ta)
if (import.meta.env.DEV) {
  console.log('🔍 Firebase Config Check:')
  console.log('API Key:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 20)}...` : 'YOK')
  console.log('Project ID:', firebaseConfig.projectId || 'YOK')
  console.log('Auth Domain:', firebaseConfig.authDomain || 'YOK')
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  if (import.meta.env.DEV) {
    console.error('❌ Firebase environment variables eksik!')
    console.error('Lütfen .env dosyasında Firebase yapılandırma bilgilerini ayarlayın.')
    console.error('Mevcut API Key:', firebaseConfig.apiKey ? 'Var' : 'YOK')
    console.error('Mevcut Project ID:', firebaseConfig.projectId ? 'Var' : 'YOK')
  }
}

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined' || !firebaseConfig.projectId || firebaseConfig.projectId === 'undefined') {
  console.error('❌ Firebase yapılandırması eksik! Lütfen .env dosyasını kontrol edin.')
  throw new Error('Firebase yapılandırması eksik! Lütfen .env dosyasını kontrol edin.')
}

let app
try {
  app = initializeApp(firebaseConfig)
  if (import.meta.env.DEV) {
    console.log('✅ Firebase başarıyla başlatıldı')
  }
} catch (error) {
  console.error('❌ Firebase başlatma hatası:', error)
  throw error
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

