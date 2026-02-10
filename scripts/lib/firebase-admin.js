/**
 * Firebase Admin SDK başlatma.
 * Service account: Firebase Console → Project settings → Service accounts → "Generate new private key"
 * Dosyayı proje köküne service-account-key.json olarak kaydedin (repo'ya eklemeyin, .gitignore'da).
 *
 * .env:
 *   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
 *
 * Kullanım (ES module):
 *   import { admin, db } from './lib/firebase-admin.js'
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

let app = admin.apps[0]
if (!app) {
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../service-account-key.json')
  const resolved = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath)
  try {
    const serviceAccount = require(resolved)
    app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
  } catch (e) {
    console.error('Firebase Admin: service account dosyası bulunamadı veya geçersiz:', resolved)
    console.error('Firebase Console → Project settings → Service accounts → Generate new private key')
    throw e
  }
}

export const db = admin.firestore()
export { admin }
