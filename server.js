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
const distPath = path.join(__dirname, 'dist')
const port = Number(process.env.PORT) || 3000

if (!existsSync(distPath)) {
  console.error('FATAL: dist/ not found. Run "npm run build" before "npm start".')
  process.exit(1)
}

const app = express()

app.use(express.static(distPath, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  etag: true
}))

// SPA fallback: all non-file requests serve index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Server listening on port ${port} (NODE_ENV=${process.env.NODE_ENV || 'undefined'})`)
})
