import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const Blog = ({ fullPage = false, category = null }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')

  useEffect(() => {
    fetchPosts()
    if (fullPage) {
      fetchCategories()
    }
  }, [fullPage, selectedCategory])

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, 'blog_posts'))
      const querySnapshot = await getDocs(q)
      const categorySet = new Set()
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        if (data.category) {
          categorySet.add(data.category)
        }
      })
      
      setCategories(Array.from(categorySet).sort())
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      // Önce date field'ına göre sıralamayı dene, yoksa created_at kullan
      let q
      try {
        q = query(
          collection(db, 'blog_posts'),
          orderBy('date', 'desc')
        )
        if (!fullPage) {
          q = query(q, limit(3))
        }
        const testSnapshot = await getDocs(q)
        if (testSnapshot.empty) {
          throw new Error('No date field')
        }
      } catch (e) {
        // date field yoksa created_at kullan
        q = query(
          collection(db, 'blog_posts'),
          orderBy('created_at', 'desc')
        )
        if (!fullPage) {
          q = query(q, limit(3))
        }
      }

      const querySnapshot = await getDocs(q)
      let postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Category filtreleme
      if (selectedCategory && selectedCategory !== 'all') {
        postsData = postsData.filter(post => post.category === selectedCategory)
      }
      
      setPosts(postsData)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      let date
      // Eğer Timestamp ise
      if (dateString && typeof dateString === 'object' && dateString.toDate) {
        date = dateString.toDate()
      } else if (dateString && typeof dateString === 'object' && dateString.seconds) {
        // Firestore Timestamp formatı
        date = new Date(dateString.seconds * 1000)
      } else {
        date = new Date(dateString)
      }
      
      // Geçerli tarih kontrolü
      if (isNaN(date.getTime())) {
        return ''
      }
      
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (e) {
      console.error('Date formatting error:', e, dateString)
      return ''
    }
  }

  if (loading) {
    return (
      <section id="blog" className="blog">
        <div className="container">
          <div className="blog-header">
            <h2>Blog & Haberler</h2>
            <p>Güvenlik kamera sistemleri hakkında güncel bilgiler</p>
          </div>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  const displayPosts = posts

  return (
    <section id="blog" className="blog">
      <div className="container">
        <div className="blog-header">
          <h2>Blog & Haberler</h2>
          <p>Güvenlik kamera sistemleri hakkında güncel bilgiler</p>
        </div>
        {fullPage && categories.length > 0 && (
          <div className="blog-categories">
            <button
              className={`blog-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <i className="fas fa-list"></i> Tümü
            </button>
            {categories.map((cat, index) => (
              <button
                key={index}
                className={`blog-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <i className="fas fa-tag"></i> {cat}
              </button>
            ))}
          </div>
        )}
        {displayPosts.length > 0 ? (
          <div className={fullPage ? "blog-grid" : "blog-grid-home"}>
            {displayPosts.map((post, index) => (
              <article key={post.id || index} id={fullPage ? `post-${post.id || index}` : undefined} className="blog-card">
                <div className="blog-image">
                  <i className={`fas ${post.icon || 'fa-video'}`}></i>
                </div>
                <div className="blog-content">
                  <span className="blog-date">
                    <i className="far fa-calendar"></i> {formatDate(post.date || post.created_at) || 'Tarih belirtilmemiş'}
                  </span>
                  <h3>{post.title}</h3>
                  {fullPage ? (
                    post.content ? (
                      <div className="blog-full-content">
                        {post.content.split('\n').map((paragraph, pIndex) => 
                          paragraph.trim() ? (
                            <p key={pIndex}>{paragraph.trim()}</p>
                          ) : null
                        )}
                      </div>
                    ) : (
                      <div className="blog-full-content">
                        <p>{post.excerpt || 'Bu blog yazısının içeriği henüz eklenmemiş.'}</p>
                      </div>
                    )
                  ) : (
                    <>
                      <p>{post.excerpt}</p>
                      <Link to={`/blog/${post.id}`} className="blog-link">
                        Devamını Oku <i className="fas fa-arrow-right"></i>
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty">
            <i className="fas fa-newspaper"></i>
            <p>Henüz blog yazısı bulunmamaktadır.</p>
          </div>
        )}
        {!fullPage && (
          <div className="blog-footer">
            <Link to="/blog" className="blog-view-all">
              Tüm Blog Yazıları <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default Blog
