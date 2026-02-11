import React, { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const Gallery = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [galleryItems, setGalleryItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGalleryImages()
  }, [])

  const fetchGalleryImages = async () => {
    try {
      const gallerySnapshot = await getDocs(collection(db, 'gallery'))

      if (!gallerySnapshot.empty) {
        const items = gallerySnapshot.docs.map((doc) => {
          const data = doc.data()
          const createdAt = data.created_at?.toMillis?.() ?? data.created_at ?? 0
          return {
            title: data.title || 'Galeri Öğesi',
            count: data.count ?? data.description ?? '',
            image: data.image_url,
            _sort: createdAt
          }
        })
        items.sort((a, b) => (b._sort || 0) - (a._sort || 0))
        setGalleryItems(items.map(({ _sort, ...item }) => item))
      } else {
        const projectSnapshot = await getDocs(collection(db, 'project_images'))
        const projectItems = projectSnapshot.docs
          .filter((d) => d.data().category === 'project')
          .map((doc, idx) => {
            const data = doc.data()
            const createdAt = data.created_at?.toMillis?.() ?? data.created_at ?? 0
            return {
              title: data.title || `Proje ${idx + 1}`,
              count: data.description ?? '',
              image: data.image_url,
              _sort: createdAt
            }
          })
        projectItems.sort((a, b) => (b._sort || 0) - (a._sort || 0))
        if (projectItems.length > 0) {
          setGalleryItems(projectItems.map(({ _sort, ...item }) => item))
        } else {
          setGalleryItems(getDefaultGalleryItems())
        }
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      setGalleryItems(getDefaultGalleryItems())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultGalleryItems = () => {
    return []
  }

  const openLightbox = (index) => {
    setCurrentImage(index)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % galleryItems.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  if (loading) {
    return (
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="gallery-header">
            <h2>Proje Galerisi</h2>
            <p>Tamamladığımız projelerden görüntüler</p>
          </div>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="gallery" className="gallery">
        <div className="container">
          <div className="gallery-header">
            <h2>Proje Galerisi</h2>
            <p>Tamamladığımız projelerden görüntüler</p>
          </div>
          {galleryItems.length === 0 ? (
            <div className="admin-empty">
              Henüz galeri görseli bulunmamaktadır.
            </div>
          ) : (
            <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
                <div className="gallery-image">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.title ? `${item.title} - Yıldız Bilişim Güvenlik Kamera Kurulum Projesi` : 'Güvenlik kamera kurulum projesi görseli'}
                      loading="lazy"
                      fetchPriority="low"
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="gallery-image-fallback" style={{ display: item.image ? 'none' : 'flex' }}>
                    <i className="fas fa-image"></i>
                  </div>
                </div>
                <div className="gallery-overlay">
                  <h4>{item.title}</h4>
                  <p>{item.count}</p>
                  <button className="gallery-btn" aria-label="Görüntüle">
                    <i className="fas fa-search-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>
      {lightboxOpen && (
        <div className="lightbox active" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Kapat">
              <i className="fas fa-times"></i>
            </button>
            <button className="lightbox-prev" onClick={prevImage} aria-label="Önceki">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="lightbox-next" onClick={nextImage} aria-label="Sonraki">
              <i className="fas fa-chevron-right"></i>
            </button>
            <div className="lightbox-image-container">
              {galleryItems[currentImage].image ? (
                <img 
                  src={galleryItems[currentImage].image} 
                  alt={galleryItems[currentImage].title ? `${galleryItems[currentImage].title} - Yıldız Bilişim Güvenlik Kamera Kurulum Projesi` : 'Güvenlik kamera kurulum projesi görseli'}
                  className="lightbox-image"
                  fetchPriority="high"
                />
              ) : (
                <div className="gallery-image">
                  <i className="fas fa-image"></i>
                </div>
              )}
              <div className="lightbox-info">
                <h3>{galleryItems[currentImage].title}</h3>
                <p>{galleryItems[currentImage].count}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Gallery

