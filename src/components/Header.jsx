import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { trackLinkClick, trackButtonClick } from '../utils/analytics'
import Search from './Search'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [usdRate, setUsdRate] = useState(null)
  const [loadingRate, setLoadingRate] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [initialSearchQuery, setInitialSearchQuery] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const handleOpenSearch = (e) => {
      const query = e.detail?.query ?? ''
      setInitialSearchQuery(query)
      setShowSearch(true)
    }
    window.addEventListener('openSearch', handleOpenSearch)
    return () => window.removeEventListener('openSearch', handleOpenSearch)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const navMenu = document.querySelector('.nav-menu')
      const hamburger = document.querySelector('.hamburger')
      if (isMenuOpen && navMenu && !navMenu.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
        closeMenu()
      }
    }

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  useEffect(() => {
    closeMenu()
  }, [location])

  useEffect(() => {
    fetchUsdRate()
    // Her 30 dakikada bir güncelle
    const interval = setInterval(fetchUsdRate, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsdRate = async () => {
    try {
      setLoadingRate(true)
      // TCMB API'si kullanarak USD satış kuru
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const dateStr = `${month}${day}${year}`
      
      // TCMB XML API
      const response = await fetch(`https://www.tcmb.gov.tr/kurlar/${dateStr}.xml`, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml'
        }
      })

      if (response.ok) {
        const xmlText = await response.text()
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        // USD satış kuru (CurrencyCode="USD")
        const usdCurrency = xmlDoc.querySelector('Currency[CurrencyCode="USD"]')
        if (usdCurrency) {
          const banknoteSelling = usdCurrency.querySelector('BanknoteSelling')
          if (banknoteSelling) {
            const rate = parseFloat(banknoteSelling.textContent)
            setUsdRate(rate.toFixed(2))
          }
        }
      } else {
        // Fallback: Alternatif API
        const fallbackResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          const tryRate = data.rates?.TRY
          if (tryRate) {
            setUsdRate(tryRate.toFixed(2))
          }
        }
      }
    } catch (error) {
      console.error('Error fetching USD rate:', error)
      // Hata durumunda fallback değer göster
      setUsdRate(null)
    } finally {
      setLoadingRate(false)
    }
  }

  const handleNavClick = (path) => {
    closeMenu()
    trackLinkClick(`Nav: ${path}`, path)
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img 
              src="/yildizlogo.jpg" 
              alt="Yıldız Bilişim Logo" 
              className="logo-image"
              fetchPriority="high"
              loading="eager"
              width="120"
              height="40"
              decoding="sync"
              onError={(e) => {
                e.target.style.display = 'none'
                const fallback = e.target.parentElement.querySelector('.logo-fallback')
                if (fallback) fallback.style.display = 'flex'
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <i className="fas fa-shield-halved"></i>
              <span>Yıldız Bilişim</span>
            </div>
          </Link>
          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <div 
              className="mobile-menu-overlay" 
              onClick={closeMenu}
              aria-hidden="true"
            />
          )}
          
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`} role="navigation" aria-label="Ana navigasyon">
            <li><Link to="/" onClick={() => handleNavClick('/')} aria-label="Ana sayfaya git">Ana Sayfa</Link></li>
            <li><Link to="/about" onClick={() => handleNavClick('/about')} aria-label="Hakkımızda sayfasına git">Hakkımızda</Link></li>
            <li><Link to="/services" onClick={() => handleNavClick('/services')} aria-label="Hizmetlerimiz sayfasına git">Hizmetlerimiz</Link></li>
            <li><Link to="/projects" onClick={() => handleNavClick('/projects')} aria-label="Projeler sayfasına git">Proje</Link></li>
            <li><Link to="/gallery" onClick={() => handleNavClick('/gallery')} aria-label="Galeri sayfasına git">Galeri</Link></li>
            <li><Link to="/contact" onClick={() => handleNavClick('/contact')} aria-label="İletişim sayfasına git">İletişim</Link></li>
            <li className="mobile-social-section">
              <div className="mobile-social-label">Sosyal Medya</div>
              <div className="mobile-social-links">
                <a 
                  href="https://www.instagram.com/yildizbilisimiletisim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mobile-social-link instagram"
                  onClick={closeMenu}
                >
                  <i className="fab fa-instagram"></i>
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@yildizbilisim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mobile-social-link tiktok"
                  onClick={closeMenu}
                >
                  <i className="fab fa-tiktok"></i>
                  <span>TikTok</span>
                </a>
              </div>
            </li>
          </ul>
          <div className="header-right">
            <button
              className="header-search-btn"
              onClick={() => {
                setShowSearch(true)
                trackButtonClick('search', 'header')
              }}
              aria-label="Ara"
            >
              <i className="fas fa-search"></i>
            </button>
            {usdRate && (
              <div className="header-usd-rate">
                <span className="usd-rate">
                  <i className="fas fa-dollar-sign"></i>
                  <span className="usd-value">{usdRate} ₺</span>
                </span>
              </div>
            )}
            <button 
              className={`hamburger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              aria-label="Menüyü Aç/Kapat"
              aria-expanded={isMenuOpen}
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>
          </div>
          {showSearch && (
            <Search
              onClose={() => {
                setShowSearch(false)
                setInitialSearchQuery(null)
              }}
              initialQuery={initialSearchQuery}
              onQueryConsumed={() => setInitialSearchQuery(null)}
            />
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header

