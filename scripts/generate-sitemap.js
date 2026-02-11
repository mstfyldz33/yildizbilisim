import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Firebase config from env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const baseUrl = 'https://yildizcloud.com'
const sitemapPath = join(__dirname, '..', 'public', 'sitemap.xml')

// Static pages
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/services', priority: '0.9', changefreq: 'weekly' },
  { url: '/brands', priority: '0.7', changefreq: 'monthly' },
  { url: '/projects', priority: '0.8', changefreq: 'weekly' },
  { url: '/gallery', priority: '0.7', changefreq: 'weekly' },
  { url: '/testimonials', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/faq', priority: '0.6', changefreq: 'monthly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/map', priority: '0.6', changefreq: 'monthly' },
  { url: '/kvkk', priority: '0.5', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { url: '/cookie-policy', priority: '0.5', changefreq: 'yearly' },
  { url: '/terms', priority: '0.5', changefreq: 'yearly' },
  { url: '/search', priority: '0.6', changefreq: 'weekly' }
]

async function generateSitemap() {
  try {
    console.log('📝 Generating sitemap...')
    
    // Fetch blog posts from Firestore
    let blogPosts = []
    try {
      const blogQuery = query(collection(db, 'blog_posts'), orderBy('created_at', 'desc'))
      const blogSnapshot = await getDocs(blogQuery)
      blogPosts = blogSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      console.log(`✅ Found ${blogPosts.length} blog posts`)
    } catch (error) {
      console.warn('⚠️  Could not fetch blog posts:', error.message)
      console.log('   Continuing with static pages only...')
    }

    // Get current date for lastmod
    const today = new Date().toISOString().split('T')[0]

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`

    // Add static pages
    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    })

    // Add blog posts
    blogPosts.forEach(post => {
      const postDate = post.date 
        ? (post.date.toDate ? post.date.toDate().toISOString().split('T')[0] : new Date(post.date).toISOString().split('T')[0])
        : (post.created_at?.toDate ? post.created_at.toDate().toISOString().split('T')[0] : today)
      
      xml += `  <url>
    <loc>${baseUrl}/blog/${post.id}</loc>
    <lastmod>${postDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    xml += `</urlset>`

    // Write to file
    writeFileSync(sitemapPath, xml, 'utf8')
    console.log(`✅ Sitemap generated: ${sitemapPath}`)
    console.log(`   Total URLs: ${staticPages.length + blogPosts.length}`)
    
  } catch (error) {
    console.error('❌ Error generating sitemap:', error)
    process.exit(1)
  }
}

generateSitemap()
