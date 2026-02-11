import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation()
  const baseUrl = 'https://yildizcloud.com'

  // Auto-generate breadcrumbs from route if items not provided
  const getBreadcrumbs = () => {
    if (items.length > 0) return items

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [
      { label: 'Ana Sayfa', url: '/' }
    ]

    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const isLast = index === pathSegments.length - 1
      
      // Map common routes to Turkish labels
      const labels = {
        'about': 'Hakkımızda',
        'services': 'Hizmetlerimiz',
        'silifke': 'Silifke Güvenlik Kamera Sistemleri',
        'tasucu': 'Taşucu Güvenlik Kamera Sistemleri',
        'aydincik': 'Aydıncık Güvenlik Kamera Sistemleri',
        'anamur': 'Anamur Güvenlik Kamera Sistemleri',
        'kizkalesi': 'Kızkalesi Güvenlik Kamera Sistemleri',
        'kurumsal': 'Kurumsal Güvenlik Kamera Sistemleri',
        'acil-servis': 'Acil Kamera Servisi',
        'fiyatlar': 'Fiyatlar',
        'brands': 'Markalar',
        'projects': 'Projelerimiz',
        'gallery': 'Galeri',
        'testimonials': 'Referanslar',
        'blog': 'Blog',
        'faq': 'Sıkça Sorulan Sorular',
        'contact': 'İletişim',
        'map': 'Hizmet Bölgeleri',
        'kvkk': 'KVKK',
        'privacy': 'Gizlilik Politikası',
        'cookie-policy': 'Çerez Politikası',
        'terms': 'Kullanım Şartları',
        'search': 'Arama'
      }

      breadcrumbs.push({
        label: labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        url: currentPath,
        isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  useEffect(() => {
    // Add BreadcrumbList schema
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        item: `${baseUrl}${crumb.url}`
      }))
    }

    let script = document.querySelector('script[data-breadcrumb-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-breadcrumb-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-breadcrumb-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [location.pathname, breadcrumbs])

  if (breadcrumbs.length <= 1) return null

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol className="breadcrumb-list">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumb-item">
            {index < breadcrumbs.length - 1 ? (
              <Link to={crumb.url} className="breadcrumb-link">
                {crumb.label}
              </Link>
            ) : (
              <span className="breadcrumb-current" aria-current="page">
                {crumb.label}
              </span>
            )}
            {index < breadcrumbs.length - 1 && (
              <i className="fas fa-chevron-right breadcrumb-separator" aria-hidden="true"></i>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
