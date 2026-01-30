import React, { useEffect, useState, useRef, useCallback } from 'react'
import { db } from '../lib/firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [cardsPerView, setCardsPerView] = useState(1)
  const sliderRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchTestimonials()
    
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    
    // Calculate cards per view based on screen size
    const calculateCardsPerView = () => {
      if (window.innerWidth >= 1024) return 3
      if (window.innerWidth >= 768) return 2
      return 1
    }
    
    setCardsPerView(calculateCardsPerView())
    
    const handleResize = () => {
      setCardsPerView(calculateCardsPerView())
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', handleResize)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (loading || testimonials.length === 0 || prefersReducedMotion) return

    // Auto-slide every 5 seconds
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length)
      }, 5000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, isPaused, loading, testimonials.length, prefersReducedMotion])

  // Pause when slider is not visible (performance optimization)
  useEffect(() => {
    if (!sliderRef.current || prefersReducedMotion) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setIsPaused(true)
          } else {
            setIsPaused(false)
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(sliderRef.current)

    return () => observer.disconnect()
  }, [prefersReducedMotion])

  const fetchTestimonials = async () => {
    try {
      const q = query(
        collection(db, 'testimonials'),
        orderBy('created_at', 'desc'),
        limit(10)
      )
      const querySnapshot = await getDocs(q)
      const testimonialsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setTestimonials(testimonialsData)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      setTestimonials([])
    } finally {
      setLoading(false)
    }
  }

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const handleMouseEnter = () => {
    if (!prefersReducedMotion) {
      setIsPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (!prefersReducedMotion) {
      setIsPaused(false)
    }
  }

  if (loading) {
    return (
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="testimonials-header">
            <h2>Müşteri Yorumları</h2>
            <p>Bize güvenen müşterilerimizin görüşleri</p>
          </div>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  const defaultTestimonials = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      position: 'Silifke AVM Müdürü',
      text: 'Yıldız Bilişim ile çalışmak harika bir deneyimdi. Profesyonel kurulum ve mükemmel destek. Sistemlerimiz 7/24 çalışıyor ve hiç sorun yaşamıyoruz.',
      rating: 5
    },
    {
      id: '2',
      name: 'Mehmet Demir',
      position: 'Deniz Sitesi Yönetim Kurulu Başkanı',
      text: 'Konut sitemize kamera sistemi kurulumu yaptırdık. Ekip çok profesyoneldi, kurulum hızlı ve temizdi. Mobil uygulamadan izleyebilmek mükemmel bir özellik.',
      rating: 5
    },
    {
      id: '3',
      name: 'Ayşe Kaya',
      position: 'Retail Şirketi Genel Müdürü',
      text: 'Mağaza zincirimiz için 8 şubede kamera sistemi kurdurduk. Merkezi izleme ve raporlama sistemi sayesinde tüm şubelerimizi tek yerden kontrol edebiliyoruz. Çok memnunuz.',
      rating: 5
    }
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : defaultTestimonials

  // Calculate transform for smooth sliding
  const translateX = prefersReducedMotion 
    ? 0 
    : -(currentIndex * (100 / cardsPerView))

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h2>Müşteri Yorumları</h2>
          <p>Bize güvenen müşterilerimizin görüşleri</p>
        </div>
        
        <div 
          className="testimonials-carousel"
          ref={sliderRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="testimonials-track"
            style={{
              transform: `translateX(${translateX}%)`,
              transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            aria-live="polite"
            aria-label="Müşteri yorumları carousel"
          >
            {displayTestimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id || index} 
                className="testimonial-card"
                role="group"
                aria-label={`Yorum ${index + 1} / ${displayTestimonials.length}`}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating || 5)].map((_, i) => (
                    <i key={i} className="fas fa-star" aria-hidden="true"></i>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.image_url ? (
                      <img 
                        src={testimonial.image_url} 
                        alt={testimonial.name}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        width="56"
                        height="56"
                      />
                    ) : (
                      <i className="fas fa-user" aria-hidden="true"></i>
                    )}
                  </div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          {displayTestimonials.length > 1 && (
            <div className="testimonials-dots" role="tablist" aria-label="Yorum navigasyonu">
              {displayTestimonials.map((_, index) => (
                <button
                  key={index}
                  className={`testimonial-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Yorum ${index + 1}'e git`}
                  aria-selected={index === currentIndex}
                  role="tab"
                  type="button"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
