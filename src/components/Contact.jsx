import React, { useState } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { checkRateLimit } from '../utils/rateLimiter'
import { trackFormSubmission } from '../utils/analytics'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  const [errors, setErrors] = useState({})

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone) => {
    const re = /^[\d\s\+\-\(\)]+$/
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad gereklidir'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Ad Soyad en az 2 karakter olmalıdır'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gereklidir'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gereklidir'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj gereklidir'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Mesaj en az 10 karakter olmalıdır'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Lütfen formu eksiksiz doldurunuz.' })
      return
    }
    
    const rateLimitCheck = checkRateLimit('contact_form')
    if (!rateLimitCheck.allowed) {
      const resetMinutes = Math.ceil((rateLimitCheck.resetTime - Date.now()) / 60000)
      setMessage({ 
        type: 'error', 
        text: `Çok fazla istek gönderdiniz. Lütfen ${resetMinutes} dakika sonra tekrar deneyin.` 
      })
      return
    }

    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        read: false,
        created_at: serverTimestamp()
      })

      setMessage({ type: 'success', text: 'Mesajınız alındı! En kısa sürede size dönüş yapacağız.' })
      setFormData({ name: '', email: '', phone: '', message: '' })
      // Track form submission
      trackFormSubmission('contact_form')
    } catch (error) {
      console.error('Error submitting form:', error)
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="contact" aria-labelledby="contact-heading">
      <div className="container">
        <div className="contact-header">
          <h2 id="contact-heading">İletişim</h2>
          <p>Size en iyi hizmeti sunabilmemiz için bizimle iletişime geçin</p>
        </div>
        <div className="contact-content">
          <div className="contact-info-section" aria-label="İletişim bilgileri">
            <div className="contact-cards-grid">
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true"><i className="fas fa-phone"></i></div>
                <h4>Telefon</h4>
                <p className="contact-value"><a href="tel:05415060404" aria-label="Telefon numarası: 0 541 506 04 04"><i className="fas fa-phone" aria-hidden="true"></i> 0 541 506 04 04</a></p>
                <a href="https://wa.me/905415060404" target="_blank" rel="noopener noreferrer" className="whatsapp-btn" aria-label="WhatsApp ile iletişime geç"><i className="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp ile Yaz</a>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true"><i className="fas fa-envelope"></i></div>
                <h4>E-posta</h4>
                <p className="contact-value"><a href="mailto:info@yildizcloud.com" aria-label="E-posta gönder: info@yildizcloud.com"><i className="fas fa-envelope" aria-hidden="true"></i> info@yildizcloud.com</a></p>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true"><i className="fas fa-calendar-days"></i></div>
                <h4>Çalışma Saatleri</h4>
                <p className="contact-value"><i className="fas fa-calendar-days" aria-hidden="true"></i> Pazartesi - Cuma<br /><span className="hours">08:00 - 18:00</span></p>
              </div>
              <div className="contact-card">
                <div className="contact-card-icon" aria-hidden="true"><i className="fas fa-location-dot"></i></div>
                <h4>Adres</h4>
                <p className="contact-value"><i className="fas fa-location-dot" aria-hidden="true"></i> Göksu Mahallesi Celal Bayar Caddesi 98/A<br />Silifke/Mersin</p>
              </div>
            </div>
          </div>
          <div className="contact-map-section">
            <div className="contact-map-container">
              <h3><i className="fas fa-map-location-dot"></i> Konumumuz</h3>
              <div className="contact-map-wrapper">
                <iframe 
                  src="https://www.google.com/maps/d/embed?mid=1OdEzqNT8JHj8cl1KUjIPwOgeZtXn-mg&ehbc=2E312F&noprof=1" 
                  className="contact-map-iframe"
                  allowFullScreen={true}
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Yıldız Bilişim - Konum Haritası"
                  aria-label="Yıldız Bilişim konum haritası"
                />
              </div>
            </div>
          </div>
          <div className="contact-form-section">
            <form className="contact-form" onSubmit={handleSubmit} aria-label="İletişim formu" noValidate>
              <div className="form-header">
                <h3><i className="fas fa-paper-plane"></i> Teklif Talep Formu</h3>
                <p>Size özel teklif hazırlayabilmemiz için lütfen bilgilerinizi doldurun</p>
              </div>
              <div className="form-group">
                <label htmlFor="contactName"><i className="fas fa-user"></i> Adınız Soyadınız</label>
                <input 
                  type="text" 
                  name="name" 
                  id="contactName" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Adınız Soyadınız" 
                  className={errors.name ? 'input-error' : ''}
                  required 
                />
                {errors.name && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.name}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactEmail"><i className="fas fa-envelope"></i> E-posta Adresiniz</label>
                  <input 
                    type="email" 
                    name="email" 
                    id="contactEmail" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="ornek@email.com" 
                    className={errors.email ? 'input-error' : ''}
                    required 
                  />
                  {errors.email && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contactPhone"><i className="fas fa-phone"></i> Telefon Numaranız</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    id="contactPhone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="05XX XXX XX XX" 
                    className={errors.phone ? 'input-error' : ''}
                    required 
                  />
                  {errors.phone && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.phone}</span>}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage"><i className="fas fa-comment"></i> Proje Detayları</label>
                <textarea 
                  name="message" 
                  id="contactMessage" 
                  value={formData.message} 
                  onChange={handleChange} 
                  placeholder="Kurulum yapmak istediğiniz alan, kamera sayısı, özel istekleriniz vb. bilgileri paylaşabilirsiniz..." 
                  rows="6" 
                  className={errors.message ? 'input-error' : ''}
                  required
                ></textarea>
                {errors.message && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.message}</span>}
              </div>
              {message.text && (
                <div id="formMessage" className={`form-message form-message-${message.type}`}>{message.text}</div>
              )}
              <button type="submit" className="btn btn-primary btn-submit" disabled={loading} aria-label={loading ? 'Form gönderiliyor' : 'Formu gönder'}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Gönderiliyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" aria-hidden="true"></i> Teklif Talep Et
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact

