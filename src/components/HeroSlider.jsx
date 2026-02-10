import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlides()
  }, [])

  const parseButtons = (buttons) => {
    if (Array.isArray(buttons)) return buttons
    if (typeof buttons === 'string') {
      try {
        return JSON.parse(buttons) || []
      } catch {
        return []
      }
    }
    return []
  }

  const fetchSlides = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hero_slides'))

      if (!querySnapshot.empty) {
        const formattedSlides = querySnapshot.docs.map((snap) => {
          const data = snap.data()
          const imageUrl = (data.image_url && String(data.image_url).trim()) || ''
          const mediaType = (data.media_type && String(data.media_type)) || 'icon'
          return {
            id: snap.id,
            ...data,
            image_url: imageUrl,
            media_type: mediaType,
            order_index: data.order_index ?? 999999,
            buttons: parseButtons(data.buttons)
          }
        })
        formattedSlides.sort((a, b) => (a.order_index ?? 999999) - (b.order_index ?? 999999))
        setSlides(formattedSlides)
      } else {
        setSlides(getDefaultSlides())
      }
    } catch (error) {
      console.error('Error fetching slides:', error)
      setSlides((prev) => (prev.length > 0 ? prev : getDefaultSlides()))
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSlides = () => {
    return [
      {
        title: 'Profesyonel Güvenlik Kamera Sistemleri',
        isH1: true,
        content: 'İş yerinizi, evinizi ve değerli varlıklarınızı 7/24 koruyun. Yıldız Bilişim olarak en kaliteli güvenlik kamera sistemlerini sunuyoruz.',
        buttons: [
          { text: 'Hizmetlerimiz', href: '/services', primary: true },
          { text: 'İletişime Geç', href: '/contact', primary: false }
        ],
        icon: 'fa-shield-halved',
        media_type: 'icon'
      },
      {
        title: '7/24 Güvenlik ve İzleme',
        isH1: false,
        content: 'Mobil uygulamalar ile dünyanın her yerinden kameralarınızı izleyin. Bulut kayıt sistemi ile verileriniz güvende.',
        buttons: [
          { text: 'Özellikler', href: '/services', primary: true },
          { text: 'Teklif Al', href: '/contact', primary: false }
        ],
        icon: 'fa-mobile-screen-button',
        media_type: 'icon'
      },
      {
        title: 'Uzman Ekip, Kaliteli Hizmet',
        isH1: false,
        content: '10+ yıllık deneyim, 500+ başarılı proje ve profesyonel kurulum ekibimizle güvenliğinizi sağlıyoruz.',
        buttons: [
          { text: 'Hakkımızda', href: '/about', primary: true },
          { text: 'Projelerimiz', href: '/projects', primary: false }
        ],
        icon: 'fa-users',
        media_type: 'icon'
      }
    ]
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return ''
    
    let videoId = ''
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (watchMatch) {
      videoId = watchMatch[1]
    }
    
    if (!videoId) return url
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&muted=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  useEffect(() => {
    if (isPaused || slides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide, isPaused, slides.length])

  if (loading) {
    return (
      <section id="home" className="hero-slider">
        <div className="admin-loading">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </section>
    )
  }

  return (
    <section id="home" className="hero-slider">
      <div className="hero-slides">
        {slides.map((slide, index) => {
          const imageUrl = (slide.image_url && String(slide.image_url).trim()) || ''
          const hasFullImage = imageUrl.length > 0 && (slide.media_type === 'image' || slide.media_type === 'icon' || !slide.media_type)
          const hasFullVideo = slide.media_type === 'video' && slide.video_url
          const hasFullYoutube = slide.media_type === 'youtube' && slide.youtube_url
          const hasFullMedia = hasFullImage || hasFullVideo || hasFullYoutube
          return (
          <div
            key={slide.id || index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''} ${hasFullImage ? 'hero-slide-full-image' : ''} ${hasFullVideo || hasFullYoutube ? 'hero-slide-full-video' : ''}`}
          >
            {hasFullImage && (
              <div className="hero-slide-bg" aria-hidden="true">
                <img
                  src={imageUrl}
                  alt=""
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  decoding={index === 0 ? 'sync' : 'async'}
                  onError={(e) => { e.target.style.background = 'rgba(0,0,0,0.3)'; console.warn('Slider image failed to load:', imageUrl) }}
                />
              </div>
            )}
            {hasFullVideo && (
              <div className="hero-slide-bg hero-slide-video-bg" aria-hidden="true">
                <video
                  src={slide.video_url}
                  autoPlay={slide.video_autoplay !== false}
                  muted={slide.video_muted !== false}
                  loop={slide.video_loop !== false}
                  playsInline
                  className="hero-video-full"
                />
              </div>
            )}
            {hasFullYoutube && (
              <div className="hero-slide-bg hero-slide-youtube-bg" aria-hidden="true">
                <iframe
                  src={getYouTubeEmbedUrl(slide.youtube_url)}
                  title={slide.title || 'Video'}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="hero-youtube-full"
                />
              </div>
            )}
            {!hasFullMedia && (
            <div className="container hero-slide-container">
              <div className="hero-content">
                {slide.isH1 ? (
                  <h1>{slide.title}</h1>
                ) : (
                  <h2>{slide.title}</h2>
                )}
                <p>{slide.content}</p>
                <div className="hero-buttons">
                  {slide.buttons && slide.buttons.map((btn, btnIndex) => (
                    <Link
                      key={btnIndex}
                      to={btn.href}
                      className={`btn ${btn.primary ? 'btn-primary' : 'btn-secondary'}`}
                      aria-label={btn.text}
                    >
                      {btn.text}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hero-media">
                {slide.media_type === 'icon' && (
                  <div className="hero-image" aria-hidden="true">
                    <i className={`fas ${slide.icon || 'fa-shield-halved'}`}></i>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
          )
        })}
      </div>
      <div className="slider-controls" role="group" aria-label="Slider kontrolleri">
        <button className="slider-btn prev" onClick={prevSlide} aria-label="Önceki slide" type="button">
          <i className="fas fa-chevron-left" aria-hidden="true"></i>
        </button>
        <button className="slider-btn next" onClick={nextSlide} aria-label="Sonraki slide" type="button">
          <i className="fas fa-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <div className="slider-dots" role="tablist" aria-label="Slide navigasyonu">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Slide ${index + 1}${index === currentSlide ? ', aktif' : ''}`}
            aria-selected={index === currentSlide}
            role="tab"
            type="button"
          ></button>
        ))}
      </div>
    </section>
  )
}

export default HeroSlider

