import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../lib/firebase'
import { collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore'
import Newsletter from './Newsletter'

const Footer = () => {
  const [visitorCount, setVisitorCount] = useState(0)

  useEffect(() => {
    const fetchVisitorCount = async () => {
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = Timestamp.fromDate(today)
        
        const q = query(
          collection(db, 'visit_logs'),
          where('created_at', '>=', todayTimestamp)
        )
        const snapshot = await getCountFromServer(q)
        setVisitorCount(snapshot.data().count || 0)
      } catch (error) {
        setVisitorCount(0)
      }
    }

    fetchVisitorCount()
    
    const interval = setInterval(fetchVisitorCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Newsletter />
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <img 
                src="/logo.png" 
                alt="Yıldız Bilişim Logo" 
                className="logo-image"
                fetchPriority="low"
                loading="lazy"
                width="120"
                height="40"
                decoding="async"
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
            </div>
            <p>Güvenlik kamera sistemlerinde uzman ekibimizle hizmetinizdeyiz.</p>
          </div>
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><Link to="/">Ana Sayfa</Link></li>
              <li><Link to="/about">Hakkımızda</Link></li>
              <li><Link to="/services">Hizmetlerimiz</Link></li>
              <li><Link to="/projects">Proje</Link></li>
              <li><Link to="/gallery">Galeri</Link></li>
              <li><Link to="/contact">İletişim</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Yasal</h4>
            <ul>
              <li><Link to="/kvkk">KVKK</Link></li>
              <li><Link to="/privacy">Gizlilik Politikası</Link></li>
              <li><Link to="/cookie-policy">Çerez Politikası</Link></li>
              <li><Link to="/terms">Kullanım Şartları</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Sosyal Medya</h4>
            <div className="social-links">
              <a href="https://www.instagram.com/yildizbilisimletisim" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="https://www.facebook.com/yildizbilisimletisim" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-visitor-counter">
            <div className="visitor-counter-content">
              <i className="fas fa-users"></i>
              <div className="visitor-counter-text">
                <span className="visitor-count-label">Bugünden İtibaren</span>
                <span className="visitor-count-number">{visitorCount.toLocaleString('tr-TR')}</span>
                <span className="visitor-count-suffix">Ziyaretçi</span>
              </div>
            </div>
          </div>
          <p>&copy; 2025 Yıldız Bilişim. Tüm hakları saklıdır.</p>
          <p className="footer-brand-info">
            Yıldız Bilişim İletişim — Yıldız Global Teknoloji ve Güvenlik Sistemleri Ltd. Şti.'nin bir markasıdır.
          </p>
        </div>
      </div>
    </footer>
    </>
  )
}

export default Footer

