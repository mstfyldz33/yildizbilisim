/**
 * Production static server for Vite SPA.
 * Serves dist/ and falls back to index.html for client-side routing.
 * Required for Hostinger / any Node.js PaaS (must bind to process.env.PORT).
 */
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let distPath = path.join(__dirname, 'dist')
if (!existsSync(distPath)) {
  distPath = path.join(process.cwd(), 'dist')
}
if (!existsSync(distPath)) {
  console.error('FATAL: dist/ not found. Tried:', path.join(__dirname, 'dist'), 'and', path.join(process.cwd(), 'dist'))
  process.exit(1)
}

const port = Number(process.env.PORT) || 3000
const host = process.env.HOST || '0.0.0.0'

const app = express()

// Security / proxy-friendly headers for all responses
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

// JS/CSS'i kendimiz sunuyoruz; Hostinger proxy Content-Type'ı ezebiliyor (text/plain → module çalışmıyor)
app.get(/\.(js|mjs|css)$/i, (req, res, next) => {
  const safePath = req.path.replace(/^\//, '').replace(/\.\./g, '')
  const filePath = path.resolve(distPath, safePath)
  const distAbs = path.resolve(distPath)
  if (!filePath.startsWith(distAbs) || !existsSync(filePath)) {
    return res.status(404).end()
  }
  const ext = path.extname(req.path).toLowerCase()
  if (ext === '.js' || ext === '.mjs') res.setHeader('Content-Type', 'application/javascript; charset=UTF-8')
  else if (ext === '.css') res.setHeader('Content-Type', 'text/css; charset=UTF-8')
  res.sendFile(filePath)
})

// MIME types for other static files (images, fonts, etc.)
const setMime = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.json') res.setHeader('Content-Type', 'application/json; charset=UTF-8')
  else if (ext === '.svg') res.setHeader('Content-Type', 'image/svg+xml')
  else if (ext === '.webmanifest') res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8')
}

app.use(express.static(distPath, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true,
  lastModified: true,
  setHeaders: setMime
}))

// SPA fallback: statik dosya gibi görünen yollara HTML gönderme (assetsDir: '' ile .js/.css kökte)
const staticExt = ['.js', '.mjs', '.css', '.ico', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.woff2', '.woff', '.ttf', '.json', '.xml', '.txt', '.webmanifest']
app.get('*', (req, res) => {
  const ext = path.extname(req.path).toLowerCase()
  if (staticExt.includes(ext)) return res.status(404).end()
  // index.html önbelleğe alınmasın; her zaman güncel asset linkleri yüklensin (503 workaround sonrası)
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port} (NODE_ENV=${process.env.NODE_ENV || 'undefined'})`)
})
