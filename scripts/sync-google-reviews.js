/**
 * Google Places yorumlarını çekip Firestore google_reviews koleksiyonuna yazar.
 * Yerel veya VPS'te cron ile periyodik çalıştırılabilir.
 *
 * Gereksinimler:
 * - .env: GOOGLE_PLACES_API_KEY, GOOGLE_PLACE_ID, GOOGLE_APPLICATION_CREDENTIALS (Firebase service account JSON yolu)
 * - npm run sync-google-reviews
 */

import 'dotenv/config'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS

if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
  console.error('Hata: .env içinde GOOGLE_PLACES_API_KEY ve GOOGLE_PLACE_ID tanımlı olmalı.')
  process.exit(1)
}

// Firebase Admin: service account dosyası veya env'den
let app = admin.apps[0]
if (!app) {
  if (CREDENTIALS_PATH) {
    const resolved = path.isAbsolute(CREDENTIALS_PATH)
      ? CREDENTIALS_PATH
      : path.resolve(process.cwd(), CREDENTIALS_PATH)
    const key = require(resolved)
    admin.initializeApp({ credential: admin.credential.cert(key) })
  } else if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_CLIENT_EMAIL && process.env.GCLOUD_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.GCLOUD_PROJECT,
        clientEmail: process.env.GCLOUD_CLIENT_EMAIL,
        privateKey: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    })
  } else {
    console.error('Hata: Firebase Admin için GOOGLE_APPLICATION_CREDENTIALS (service account JSON yolu) veya GCLOUD_* env değişkenleri gerekli.')
    process.exit(1)
  }
  app = admin.app()
}

const db = admin.firestore()

function stableId (authorName, time, text) {
  const raw = `${authorName}|${time}|${(text || '').slice(0, 100)}`
  return createHash('sha256').update(raw).digest('hex').slice(0, 20)
}

async function fetchPlaceReviews () {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', GOOGLE_PLACE_ID)
  url.searchParams.set('fields', 'reviews')
  url.searchParams.set('key', GOOGLE_PLACES_API_KEY)

  const res = await fetch(url.toString())
  const data = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API: ${data.status}${data.error_message ? ' - ' + data.error_message : ''}`)
  }

  const reviews = (data.result && data.result.reviews) || []
  return reviews
}

async function sync () {
  console.log('Google yorumları çekiliyor...')
  const reviews = await fetchPlaceReviews()
  console.log(`${reviews.length} yorum bulundu.`)

  const col = db.collection('google_reviews')
  let written = 0

  for (const r of reviews) {
    const name = r.author_name || 'Anonim'
    const text = r.text || ''
    const rating = typeof r.rating === 'number' ? r.rating : 5
    const timeSec = r.time || Math.floor(Date.now() / 1000)
    const created_at = admin.firestore.Timestamp.fromMillis(timeSec * 1000)

    const docId = stableId(name, timeSec, text)
    const doc = {
      name,
      position: '', // Google yorumunda unvan yok
      text,
      rating,
      image_url: r.profile_photo_url || null,
      created_at,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    }

    await col.doc(docId).set(doc, { merge: true })
    written++
  }

  console.log(`${written} yorum Firestore google_reviews koleksiyonuna yazıldı.`)
}

sync().catch((err) => {
  console.error(err)
  process.exit(1)
})
