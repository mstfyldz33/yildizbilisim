import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { trackPageView } from '../utils/analytics'

const BlogDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [relatedPosts, setRelatedPosts] = useState([])

  useEffect(() => {
    if (id) {
      fetchPost()
      trackPageView(`/blog/${id}`)
    }
  }, [id])

  const fetchPost = async () => {
    try {
      const docRef = doc(db, 'blog_posts', id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const postData = {
          id: docSnap.id,
          ...docSnap.data()
        }
        setPost(postData)
        // Fetch related posts
        fetchRelatedPosts(postData)
      } else {
        setError('Blog yazısı bulunamadı')
      }
    } catch (error) {
      console.error('Error fetching blog post:', error)
      setError('Blog yazısı yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      let date
      if (dateString && typeof dateString === 'object' && dateString.toDate) {
        date = dateString.toDate()
      } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
        date = new Date(dateString.seconds * 1000)
      } else {
        date = new Date(dateString)
      }
      
      if (isNaN(date.getTime())) {
        return ''
      }
      
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (e) {
      return ''
    }
  }

  const fetchRelatedPosts = async (currentPost) => {
    try {
      let querySnapshot
      // Same category posts first
      try {
        let q
        if (currentPost.category) {
          q = query(
            collection(db, 'blog_posts'),
            where('category', '==', currentPost.category),
            orderBy('date', 'desc'),
            limit(4)
          )
        } else {
          q = query(
            collection(db, 'blog_posts'),
            orderBy('date', 'desc'),
            limit(4)
          )
        }
        querySnapshot = await getDocs(q)
      } catch (e) {
        // If date field doesn't exist, use created_at
        let q
        if (currentPost.category) {
          q = query(
            collection(db, 'blog_posts'),
            where('category', '==', currentPost.category),
            orderBy('created_at', 'desc'),
            limit(4)
          )
        } else {
          q = query(
            collection(db, 'blog_posts'),
            orderBy('created_at', 'desc'),
            limit(4)
          )
        }
        querySnapshot = await getDocs(q)
      }
      
      const related = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(p => p.id !== currentPost.id)
        .slice(0, 3) // Max 3 related posts
      
      setRelatedPosts(related)
    } catch (error) {
      console.error('Error fetching related posts:', error)
      setRelatedPosts([])
    }
  }

  const calculateReadingTime = (content) => {
    if (!content) return 1
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes || 1
  }

  if (loading) {
    return (
      <>
        <SEO 
          title="Yükleniyor... - Yıldız Bilişim"
          description="Blog yazısı yükleniyor"
        />
        <section className="blog-detail-page">
          <div className="container">
            <div className="admin-loading" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: 'var(--color-primary)' }}></i>
            </div>
          </div>
        </section>
      </>
    )
  }

  if (error || !post) {
    return (
      <>
        <SEO 
          title="Blog Yazısı Bulunamadı - Yıldız Bilişim"
          description="Aradığınız blog yazısı bulunamadı"
        />
        <section className="blog-detail-page">
          <div className="container">
            <div className="blog-detail-error">
              <div className="error-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h2>Blog Yazısı Bulunamadı</h2>
              <p>{error || 'Aradığınız blog yazısı mevcut değil veya silinmiş olabilir.'}</p>
              <Link to="/blog" className="btn btn-primary">
                <i className="fas fa-arrow-left"></i> Blog Sayfasına Dön
              </Link>
            </div>
          </div>
        </section>
      </>
    )
  }

  const readingTime = calculateReadingTime(post.content || post.excerpt || '')
  const postUrl = `${window.location.origin}/blog/${id}`
  const shareText = encodeURIComponent(`${post.title} - Yıldız Bilişim`)

  // Article schema for SEO
  useEffect(() => {
    if (!post) return

    const formatDateForSchema = (dateString) => {
      if (!dateString) return new Date().toISOString()
      try {
        let date
        if (dateString && typeof dateString === 'object' && dateString.toDate) {
          date = dateString.toDate()
        } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
          date = new Date(dateString.seconds * 1000)
        } else {
          date = new Date(dateString)
        }
        return date.toISOString()
      } catch {
        return new Date().toISOString()
      }
    }

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || post.title,
      image: post.image_url ? `https://yildizcloud.com${post.image_url.startsWith('http') ? '' : ''}${post.image_url}` : 'https://yildizcloud.com/logo.png',
      datePublished: formatDateForSchema(post.date || post.created_at),
      dateModified: formatDateForSchema(post.updated_at || post.date || post.created_at),
      author: {
        '@type': 'Organization',
        name: 'Yıldız Bilişim',
        url: 'https://yildizcloud.com'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Yıldız Bilişim',
        logo: {
          '@type': 'ImageObject',
          url: 'https://yildizcloud.com/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://yildizcloud.com/blog/${id}`
      },
      keywords: post.tags ? (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : '',
      articleSection: post.category || 'Güvenlik Kamera Sistemleri',
      wordCount: post.content ? post.content.split(/\s+/).length : 0
    }

    let script = document.querySelector('script[data-article-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-article-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-article-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [post, id])

  return (
    <>
      <SEO 
        title={`${post.title} - Yıldız Bilişim Blog`}
        description={post.excerpt || post.title}
        keywords={post.tags ? (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : ''}
        image={post.image_url || '/logo.png'}
        type="article"
      />
      <section className="blog-detail-page">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Ana Sayfa', url: '/' },
            { label: 'Blog', url: '/blog' },
            { label: post.title, url: `/blog/${id}`, isLast: true }
          ]} />

          <article className="blog-detail-article">
            <header className="blog-detail-header">
              {post.category && (
                <span className="blog-detail-category">
                  <i className="fas fa-tag"></i> {post.category}
                </span>
              )}
              <h1>{post.title}</h1>
              <div className="blog-detail-meta">
                <span className="blog-detail-date">
                  <i className="far fa-calendar"></i> {formatDate(post.date || post.created_at) || 'Tarih belirtilmemiş'}
                </span>
                <span className="blog-detail-reading-time">
                  <i className="fas fa-clock"></i> {readingTime} dakika okuma
                </span>
              </div>
            </header>

            {post.image_url && (
              <div className="blog-detail-image">
                <img 
                  src={post.image_url} 
                  alt={post.title ? `${post.title} - Yıldız Bilişim Güvenlik Kamera Sistemleri Blog` : 'Güvenlik kamera sistemleri blog görseli'}
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            )}

            <div className="blog-detail-content">
              {post.content ? (
                <div className="blog-full-content">
                  {post.content.split('\n').map((paragraph, pIndex) => 
                    paragraph.trim() ? (
                      <p key={pIndex}>{paragraph.trim()}</p>
                    ) : (
                      <br key={pIndex} />
                    )
                  )}
                </div>
              ) : (
                <div className="blog-full-content">
                  <p>{post.excerpt || 'Bu blog yazısının içeriği henüz eklenmemiş.'}</p>
                </div>
              )}
            </div>

            {post.tags && (
              <div className="blog-detail-tags">
                <h4>Etiketler:</h4>
                <div className="tags-list">
                  {Array.isArray(post.tags) ? (
                    post.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))
                  ) : (
                    <span className="tag">{post.tags}</span>
                  )}
                </div>
              </div>
            )}

            <div className="blog-detail-share">
              <h4>Paylaş:</h4>
              <div className="share-buttons">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-facebook"
                  aria-label="Facebook'ta paylaş"
                >
                  <i className="fab fa-facebook-f"></i>
                  <span>Facebook</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-twitter"
                  aria-label="Twitter'da paylaş"
                >
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-whatsapp"
                  aria-label="WhatsApp'ta paylaş"
                >
                  <i className="fab fa-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="share-btn share-linkedin"
                  aria-label="LinkedIn'de paylaş"
                >
                  <i className="fab fa-linkedin-in"></i>
                  <span>LinkedIn</span>
                </a>
                <button
                  className="share-btn share-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(postUrl)
                    // Toast notification will be handled by toast system
                    if (window.showToast) {
                      window.showToast('Link kopyalandı!', 'success')
                    } else {
                      alert('Link kopyalandı!')
                    }
                  }}
                  aria-label="Linki kopyala"
                >
                  <i className="fas fa-link"></i>
                  <span>Kopyala</span>
                </button>
              </div>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <div className="blog-related-posts">
              <h3>İlgili Yazılar</h3>
              <div className="related-posts-grid">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
                    className="related-post-card"
                  >
                    {relatedPost.image_url && (
                      <div className="related-post-image">
                        <img 
                          src={relatedPost.image_url} 
                          alt={relatedPost.title ? `${relatedPost.title} - Yıldız Bilişim Blog` : 'İlgili blog yazısı görseli'} 
                        />
                      </div>
                    )}
                    <div className="related-post-content">
                      {relatedPost.category && (
                        <span className="related-post-category">{relatedPost.category}</span>
                      )}
                      <h4>{relatedPost.title}</h4>
                      {relatedPost.excerpt && (
                        <p>{relatedPost.excerpt.substring(0, 100)}...</p>
                      )}
                      <span className="related-post-link">
                        Devamını Oku <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="blog-detail-navigation">
            <Link to="/blog" className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i> Tüm Blog Yazılarına Dön
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default BlogDetailPage

