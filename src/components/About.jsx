import React, { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'

const About = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [teamImages, setTeamImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamImages()
  }, [])

  const fetchTeamImages = async () => {
    try {
      const q = query(
        collection(db, 'project_images'),
        where('category', '==', 'team'),
        orderBy('created_at', 'desc')
      )
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const images = querySnapshot.docs.map(doc => doc.data().image_url)
        setTeamImages(images)
      } else {
        setTeamImages(getDefaultTeamImages())
      }
    } catch (error) {
      console.error('Error fetching team images:', error)
      setTeamImages(getDefaultTeamImages())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTeamImages = () => {
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
    setCurrentImage((prev) => (prev + 1) % teamImages.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + teamImages.length) % teamImages.length)
  }

  return (
    <>
      <section id="about" className="about">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>Hakkımızda</h2>
              <p>Yıldız Bilişim, güvenlik kamera sistemleri alanında uzmanlaşmış bir teknoloji firmasıdır. Silifke ve 50 km çevresinde, kurumsal ve bireysel müşterilerimize uçtan uca çözümler sunuyoruz.</p>
              <ul className="about-highlights">
                <li><i className="fas fa-circle-check"></i> 10+ yıllık sektör tecrübesi</li>
                <li><i className="fas fa-circle-check"></i> Profesyonel keşif, kurulum ve bakım</li>
                <li><i className="fas fa-circle-check"></i> 7/24 teknik destek ve hızlı müdahale</li>
              </ul>
            </div>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Tamamlanan Proje</span>
              </div>
              <div className="stat">
                <span className="stat-number">120+</span>
                <span className="stat-label">Aktif Müşteri</span>
              </div>
              <div className="stat">
                <span className="stat-number">15+</span>
                <span className="stat-label">Marka İş Ortaklığı</span>
              </div>
            </div>
          </div>
          
          {!loading && teamImages.length > 0 && (
            <div className="team-photos-section">
              <h3>Bizden Kareler</h3>
              <p>Ekip çalışmalarımızdan ve projelerimizden kareler</p>
              <div className="team-photos-grid">
              {teamImages.map((image, index) => (
                <div 
                  key={index} 
                  className="team-photo-item" 
                  onClick={() => openLightbox(index)}
                >
                  <img 
                    src={image} 
                    alt={`Yıldız Bilişim Ekip Çalışması ve Proje Fotoğrafı ${index + 1} - Güvenlik Kamera Kurulum Ekibi`}
                    loading="lazy"
                    fetchPriority="low"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="team-photo-overlay">
                    <i className="fas fa-search-plus"></i>
                  </div>
                </div>
              ))}
              </div>
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
            <img 
              src={teamImages[currentImage]} 
              alt={`Yıldız Bilişim Ekip Çalışması ve Proje Fotoğrafı ${currentImage + 1} - Güvenlik Kamera Kurulum Ekibi`}
              className="lightbox-image"
              fetchPriority="high"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default About

