import React, { useState, useEffect } from 'react'
import './CookieConsent.css'

const CookieConsent = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="cookie-consent">
      <div className="cookie-consent-content">
        <div className="cookie-consent-icon">
          <i className="fas fa-cookie-bite"></i>
        </div>
        <div className="cookie-consent-text">
          <h4>Çerezler</h4>
          <p>
            Siteyi kullanmaya devam ederek çerez kullanımını kabul etmiş olursunuz.
          </p>
        </div>
        <div className="cookie-consent-actions">
          <button onClick={handleDecline} className="cookie-btn-decline">
            Reddet
          </button>
          <button onClick={handleAccept} className="cookie-btn-accept">
            Kabul Et
          </button>
        </div>
        <button 
          onClick={handleDecline} 
          className="cookie-consent-close"
          aria-label="Kapat"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  )
}

export default CookieConsent

