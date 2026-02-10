import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image = 'https://yildizcloud.com/logo.png',
  type = 'website',
  noindex = false
}) => {
  const location = useLocation()
  const baseUrl = 'https://yildizcloud.com'
  const currentUrl = `${baseUrl}${location.pathname}`

  useEffect(() => {
    // Update title
    document.title = title || 'Yıldız Bilişim - Silifke Güvenlik Kamera Sistemleri'
    
    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let element = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    // Basic meta tags
    if (description) {
      updateMetaTag('description', description)
    }
    
    if (keywords) {
      updateMetaTag('keywords', keywords)
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', currentUrl)

    // Robots meta
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow')
    } else {
      updateMetaTag('robots', 'index, follow')
    }

    // Open Graph tags
    updateMetaTag('og:title', title || 'Yıldız Bilişim - Silifke Güvenlik Kamera Sistemleri', true)
    if (description) {
      updateMetaTag('og:description', description, true)
    }
    updateMetaTag('og:url', currentUrl, true)
    updateMetaTag('og:type', type, true)
    updateMetaTag('og:image', image, true)
    updateMetaTag('og:site_name', 'Yıldız Bilişim', true)
    updateMetaTag('og:locale', 'tr_TR', true)

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title || 'Yıldız Bilişim - Silifke Güvenlik Kamera Sistemleri')
    if (description) {
      updateMetaTag('twitter:description', description)
    }
    updateMetaTag('twitter:url', currentUrl)
    updateMetaTag('twitter:image', image)
  }, [title, description, keywords, image, type, noindex, currentUrl])

  return null
}

export default SEO

