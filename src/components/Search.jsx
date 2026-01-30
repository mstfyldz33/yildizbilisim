import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, query, getDocs, where, or } from 'firebase/firestore'
import { trackEvent } from '../utils/analytics'
import { useToast } from './Toast'

const Search = ({ onClose, initialQuery = null, onQueryConsumed }) => {
  const [searchTerm, setSearchTerm] = useState(initialQuery || '')
  const initialQueryApplied = React.useRef(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // all, blog, projects, services
  const searchInputRef = useRef(null)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (initialQuery == null || initialQuery === '') {
      initialQueryApplied.current = false
      return
    }
    if (!initialQueryApplied.current) {
      setSearchTerm(initialQuery)
      initialQueryApplied.current = true
      if (onQueryConsumed) onQueryConsumed()
    }
  }, [initialQuery, onQueryConsumed])

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const delayDebounce = setTimeout(() => {
        performSearch()
      }, 300)

      return () => clearTimeout(delayDebounce)
    } else {
      setResults([])
    }
  }, [searchTerm, activeTab])

  const performSearch = async () => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const searchLower = searchTerm.toLowerCase()
      const allResults = []

      // Blog posts search
      if (activeTab === 'all' || activeTab === 'blog') {
        try {
          const blogQuery = query(collection(db, 'blog_posts'))
          const blogSnapshot = await getDocs(blogQuery)
          blogSnapshot.forEach((doc) => {
            const data = doc.data()
            const title = (data.title || '').toLowerCase()
            const excerpt = (data.excerpt || '').toLowerCase()
            const content = (data.content || '').toLowerCase()

            if (title.includes(searchLower) || excerpt.includes(searchLower) || content.includes(searchLower)) {
              allResults.push({
                id: doc.id,
                type: 'blog',
                title: data.title,
                excerpt: data.excerpt,
                date: data.date || data.created_at,
                url: `/blog/${doc.id}`
              })
            }
          })
        } catch (error) {
          console.error('Error searching blog:', error)
        }
      }

      // Projects search
      if (activeTab === 'all' || activeTab === 'projects') {
        try {
          const projectsQuery = query(collection(db, 'projects'))
          const projectsSnapshot = await getDocs(projectsQuery)
          projectsSnapshot.forEach((doc) => {
            const data = doc.data()
            const title = (data.title || '').toLowerCase()
            const description = (data.description || '').toLowerCase()

            if (title.includes(searchLower) || description.includes(searchLower)) {
              allResults.push({
                id: doc.id,
                type: 'project',
                title: data.title,
                excerpt: data.description,
                badge: data.badge,
                url: `/projects#${doc.id}`
              })
            }
          })
        } catch (error) {
          console.error('Error searching projects:', error)
        }
      }

      // Services search
      if (activeTab === 'all' || activeTab === 'services') {
        try {
          const servicesQuery = query(collection(db, 'services'))
          const servicesSnapshot = await getDocs(servicesQuery)
          servicesSnapshot.forEach((doc) => {
            const data = doc.data()
            const title = (data.title || '').toLowerCase()
            const description = (data.description || '').toLowerCase()

            if (title.includes(searchLower) || description.includes(searchLower)) {
              allResults.push({
                id: doc.id,
                type: 'service',
                title: data.title,
                excerpt: data.description,
                icon: data.icon,
                url: `/services#${doc.id}`
              })
            }
          })
        } catch (error) {
          console.error('Error searching services:', error)
        }
      }

      setResults(allResults)
      trackEvent('search', 'engagement', searchTerm, allResults.length)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result) => {
    trackEvent('search_result_click', 'engagement', result.type, undefined)
    navigate(result.url)
    if (onClose) onClose()
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'blog':
        return 'fa-blog'
      case 'project':
        return 'fa-project-diagram'
      case 'service':
        return 'fa-briefcase'
      default:
        return 'fa-file'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'blog':
        return 'Blog Yazısı'
      case 'project':
        return 'Proje'
      case 'service':
        return 'Hizmet'
      default:
        return 'Sonuç'
    }
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="Arama yapın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onClose()
                }
              }}
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="Temizle"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button className="search-close" onClick={onClose} aria-label="Kapat">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="search-tabs">
          <button
            className={activeTab === 'all' ? 'active' : ''}
            onClick={() => setActiveTab('all')}
          >
            Tümü
          </button>
          <button
            className={activeTab === 'blog' ? 'active' : ''}
            onClick={() => setActiveTab('blog')}
          >
            Blog
          </button>
          <button
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            Projeler
          </button>
          <button
            className={activeTab === 'services' ? 'active' : ''}
            onClick={() => setActiveTab('services')}
          >
            Hizmetler
          </button>
        </div>

        <div className="search-results">
          {loading && (
            <div className="search-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Aranıyor...</span>
            </div>
          )}

          {!loading && searchTerm.trim().length >= 2 && results.length === 0 && (
            <div className="search-empty">
              <i className="fas fa-search"></i>
              <p>Sonuç bulunamadı</p>
              <span>&quot;{searchTerm}&quot; için sonuç bulunamadı</span>
            </div>
          )}

          {!loading && searchTerm.trim().length < 2 && (
            <div className="search-empty">
              <i className="fas fa-keyboard"></i>
              <p>Arama yapmak için en az 2 karakter girin</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="search-results-header">
                <span>{results.length} sonuç bulundu</span>
              </div>
              <div className="search-results-list">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="search-result-icon">
                      <i className={`fas ${getTypeIcon(result.type)}`}></i>
                    </div>
                    <div className="search-result-content">
                      <div className="search-result-header">
                        <h4>{result.title}</h4>
                        <span className="search-result-type">{getTypeLabel(result.type)}</span>
                      </div>
                      {result.excerpt && (
                        <p className="search-result-excerpt">{result.excerpt.substring(0, 150)}...</p>
                      )}
                    </div>
                    <i className="fas fa-chevron-right search-result-arrow"></i>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search

