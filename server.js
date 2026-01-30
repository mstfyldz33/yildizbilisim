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

app.use(express.static(distPath, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true,
  lastModified: true
}))

// SPA fallback: only for non-file requests (don't send HTML for /assets/*)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/assets/') || req.path.startsWith('/yildizlogo') || req.path.startsWith('/favicon') || req.path.startsWith('/site.webmanifest') || req.path.startsWith('/robots') || req.path.startsWith('/sitemap')) {
    return res.status(404).end()
  }
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port} (NODE_ENV=${process.env.NODE_ENV || 'undefined'})`)
})
