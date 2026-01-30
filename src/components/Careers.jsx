import React, { useState, useEffect, useRef } from 'react'
import { db, storage } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { checkRateLimit } from '../utils/rateLimiter'
import { trackFormSubmission } from '../utils/analytics'

const Careers = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    cv: null
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const testimonialIntervalRef = useRef(null)

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePhone = (phone) => {
    const re = /^[\d\s\+\-\(\)]+$/
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const validateFile = (file) => {
    if (!file) return { valid: true } // CV is optional
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (file.size > maxSize) {
      return { valid: false, error: 'CV dosyası 5MB\'dan küçük olmalıdır' }
    }
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'CV dosyası PDF veya Word formatında olmalıdır' }
    }
    return { valid: true }
  }

  // Employee testimonials data
  const employeeTestimonials = [
    {
      name: 'Mehmet Özkan',
      role: 'Teknik Uzman',
      text: 'Yıldız Bilişim\'de çalışmak, teknolojiye olan tutkumu profesyonel bir ortamda geliştirmeme olanak sağladı. Sürekli öğrenme ve gelişim fırsatları sunan bir ekip.',
      years: '3 yıl'
    },
    {
      name: 'Ayşe Yılmaz',
      role: 'Satış Temsilcisi',
      text: 'Müşteri odaklı yaklaşımımız ve kaliteli hizmet anlayışımız sayesinde her gün yeni projelerle büyüyoruz. Ekip ruhu ve destekleyici yönetim harika.',
      years: '2 yıl'
    },
    {
      name: 'Can Demir',
      role: 'Teknik Destek Uzmanı',
      text: 'Müşteri memnuniyeti odaklı çalışma kültürü ve teknik gelişim imkanları sayesinde kariyerimde hızlı ilerleme kaydediyorum.',
      years: '1.5 yıl'
    }
  ]

  // Auto-slide testimonials
  useEffect(() => {
    testimonialIntervalRef.current = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % employeeTestimonials.length)
    }, 5000)

    return () => {
      if (testimonialIntervalRef.current) {
        clearInterval(testimonialIntervalRef.current)
      }
    }
  }, [])

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
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
    } else if (step === 2) {
      if (!formData.position.trim()) {
        newErrors.position = 'Pozisyon gereklidir'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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

    if (!formData.position.trim()) {
      newErrors.position = 'Pozisyon gereklidir'
    }

    if (formData.cv) {
      const fileValidation = validateFile(formData.cv)
      if (!fileValidation.valid) {
        newErrors.cv = fileValidation.error
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Lütfen formu eksiksiz ve doğru doldurunuz.' })
      return
    }
    
    const rateLimitCheck = checkRateLimit('career_form')
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
      let cvUrl = null

      if (formData.cv) {
        const fileExt = formData.cv.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `job-applications/${fileName}`
        const storageRef = ref(storage, filePath)

        await uploadBytes(storageRef, formData.cv)
        cvUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'job_applications'), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        experience: formData.experience,
        cv_url: cvUrl,
        created_at: serverTimestamp()
      })

      setMessage({ type: 'success', text: 'Başvurunuz alındı! En kısa sürede size dönüş yapacağız.' })
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        experience: '',
        cv: null
      })
      setCurrentStep(1)
      const cvInput = document.getElementById('careerCV')
      if (cvInput) cvInput.value = ''
      // Track form submission
      trackFormSubmission('career_form')
    } catch (error) {
      console.error('Error submitting application:', error)
      setMessage({ type: 'error', text: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="careers" className="careers">
      <div className="container">
        <div className="careers-header">
          <h2>İş Başvurusu</h2>
          <p>Ekibimize katılmak ister misiniz?</p>
        </div>

        {/* Motivational Headline */}
        <div className="careers-motivation">
          <div className="careers-motivation-content">
            <h3>Kariyerinizde Yeni Bir Sayfa Açın</h3>
            <p>Yıldız Bilişim ailesine katılarak, güvenlik teknolojileri alanında kariyerinizi şekillendirin. Deneyimli ekibimizle birlikte büyüyün ve başarı hikayelerine ortak olun.</p>
          </div>
        </div>

        <div className="careers-content">
          {/* Employee Testimonials */}
          <div className="careers-testimonials">
            <h3>Ekibimizden</h3>
            <div className="careers-testimonials-carousel">
              <div 
                className="careers-testimonials-track"
                style={{
                  transform: `translateX(-${testimonialIndex * 100}%)`,
                  transition: 'transform 0.5s ease-in-out'
                }}
              >
                {employeeTestimonials.map((testimonial, index) => (
                  <div key={index} className="careers-testimonial-card">
                    <div className="careers-testimonial-quote">
                      <i className="fas fa-quote-left"></i>
                    </div>
                    <p className="careers-testimonial-text">"{testimonial.text}"</p>
                    <div className="careers-testimonial-author">
                      <div className="careers-testimonial-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="careers-testimonial-info">
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.role} · {testimonial.years}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="careers-testimonials-dots">
                {employeeTestimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`careers-testimonial-dot ${index === testimonialIndex ? 'active' : ''}`}
                    onClick={() => setTestimonialIndex(index)}
                    aria-label={`Yorum ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Step-based Form */}
          <div className="careers-form-wrapper">
            <form className="careers-form" onSubmit={handleSubmit} aria-label="İş başvuru formu" noValidate>
              {/* Step Indicator */}
              <div className="careers-form-steps">
                <div className={`careers-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                  <div className="careers-step-number">1</div>
                  <span className="careers-step-label">Kişisel Bilgiler</span>
                </div>
                <div className={`careers-step-line ${currentStep > 1 ? 'completed' : ''}`}></div>
                <div className={`careers-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                  <div className="careers-step-number">2</div>
                  <span className="careers-step-label">Pozisyon & Deneyim</span>
                </div>
                <div className={`careers-step-line ${currentStep > 2 ? 'completed' : ''}`}></div>
                <div className={`careers-step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="careers-step-number">3</div>
                  <span className="careers-step-label">Özet & Gönder</span>
                </div>
              </div>

              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="careers-form-step-content" style={{ minHeight: '500px' }}>
                  <h3>Kişisel Bilgileriniz</h3>
                  <p className="careers-step-description">Başvurunuzu başlatmak için temel bilgilerinizi girin.</p>
            <h3>Başvuru Formu</h3>
            <div className="form-group">
              <label htmlFor="careerName"><i className="fas fa-user"></i> Adınız Soyadınız</label>
              <input 
                type="text" 
                name="name" 
                id="careerName" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Adınız Soyadınız" 
                className={errors.name ? 'input-error' : ''}
                required 
              />
              {errors.name && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="careerEmail"><i className="fas fa-envelope"></i> E-posta Adresiniz</label>
              <input 
                type="email" 
                name="email" 
                id="careerEmail" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="ornek@email.com" 
                className={errors.email ? 'input-error' : ''}
                required 
              />
              {errors.email && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="careerPhone"><i className="fas fa-phone"></i> Telefon Numaranız</label>
              <input 
                type="tel" 
                name="phone" 
                id="careerPhone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="05XX XXX XX XX" 
                className={errors.phone ? 'input-error' : ''}
                required 
              />
              {errors.phone && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="careerPosition"><i className="fas fa-briefcase"></i> Başvurduğunuz Pozisyon</label>
              <select 
                name="position" 
                id="careerPosition" 
                value={formData.position} 
                onChange={handleChange} 
                className={errors.position ? 'input-error' : ''}
                required
              >
                <option value="">Pozisyon Seçiniz</option>
                <option value="technical">Teknik Uzman / Kurulum Uzmanı</option>
                <option value="sales">Satış Temsilcisi</option>
                <option value="support">Teknik Destek Uzmanı</option>
                <option value="other">Diğer</option>
              </select>
              {errors.position && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.position}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="careerExperience"><i className="fas fa-clock"></i> Deneyim</label>
              <textarea 
                name="experience" 
                id="careerExperience" 
                value={formData.experience} 
                onChange={handleChange} 
                placeholder="Deneyimleriniz ve becerileriniz hakkında bilgi veriniz..." 
                rows="4" 
                required
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="careerCV"><i className="fas fa-file-pdf"></i> CV Yükleyin (PDF veya Word, Max 5MB)</label>
              <input 
                type="file" 
                name="cv" 
                id="careerCV" 
                accept=".pdf,.doc,.docx" 
                onChange={handleChange}
                className={errors.cv ? 'input-error' : ''}
              />
              {errors.cv && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.cv}</span>}
              {formData.cv && !errors.cv && (
                <span className="form-success">
                  <i className="fas fa-check-circle"></i> {formData.cv.name} seçildi
                </span>
              )}
            </div>
                  <div className="form-group">
                    <label htmlFor="careerName"><i className="fas fa-user"></i> Adınız Soyadınız</label>
                    <input 
                      type="text" 
                      name="name" 
                      id="careerName" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Adınız Soyadınız" 
                      className={errors.name ? 'input-error' : ''}
                      required 
                    />
                    {errors.name && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careerEmail"><i className="fas fa-envelope"></i> E-posta Adresiniz</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="careerEmail" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="ornek@email.com" 
                      className={errors.email ? 'input-error' : ''}
                      required 
                    />
                    {errors.email && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careerPhone"><i className="fas fa-phone"></i> Telefon Numaranız</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      id="careerPhone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="05XX XXX XX XX" 
                      className={errors.phone ? 'input-error' : ''}
                      required 
                    />
                    {errors.phone && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.phone}</span>}
                  </div>
                  <div className="careers-form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handleNext}>
                      Devam Et <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Position & Experience */}
              {currentStep === 2 && (
                <div className="careers-form-step-content" style={{ minHeight: '500px' }}>
                  <h3>Pozisyon & Deneyim</h3>
                  <p className="careers-step-description">Başvurduğunuz pozisyon ve deneyimleriniz hakkında bilgi verin.</p>
                  <div className="form-group">
                    <label htmlFor="careerPosition"><i className="fas fa-briefcase"></i> Başvurduğunuz Pozisyon</label>
                    <select 
                      name="position" 
                      id="careerPosition" 
                      value={formData.position} 
                      onChange={handleChange} 
                      className={errors.position ? 'input-error' : ''}
                      required
                    >
                      <option value="">Pozisyon Seçiniz</option>
                      <option value="technical">Teknik Uzman / Kurulum Uzmanı</option>
                      <option value="sales">Satış Temsilcisi</option>
                      <option value="support">Teknik Destek Uzmanı</option>
                      <option value="other">Diğer</option>
                    </select>
                    {errors.position && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.position}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="careerExperience"><i className="fas fa-clock"></i> Deneyim</label>
                    <textarea 
                      name="experience" 
                      id="careerExperience" 
                      value={formData.experience} 
                      onChange={handleChange} 
                      placeholder="Deneyimleriniz ve becerileriniz hakkında bilgi veriniz..." 
                      rows="6" 
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="careerCV"><i className="fas fa-file-pdf"></i> CV Yükleyin (PDF veya Word, Max 5MB)</label>
                    <input 
                      type="file" 
                      name="cv" 
                      id="careerCV" 
                      accept=".pdf,.doc,.docx" 
                      onChange={handleChange}
                      className={errors.cv ? 'input-error' : ''}
                    />
                    {errors.cv && <span className="form-error"><i className="fas fa-exclamation-circle"></i> {errors.cv}</span>}
                    {formData.cv && !errors.cv && (
                      <span className="form-success">
                        <i className="fas fa-check-circle"></i> {formData.cv.name} seçildi
                      </span>
                    )}
                  </div>
                  <div className="careers-form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
                      <i className="fas fa-arrow-left"></i> Geri
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleNext}>
                      Devam Et <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {currentStep === 3 && (
                <div className="careers-form-step-content" style={{ minHeight: '500px' }}>
                  <h3>Özet & Onay</h3>
                  <p className="careers-step-description">Bilgilerinizi kontrol edip başvurunuzu gönderin.</p>
                  
                  <div className="careers-review">
                    <div className="careers-review-section">
                      <h4><i className="fas fa-user"></i> Kişisel Bilgiler</h4>
                      <div className="careers-review-item">
                        <span className="careers-review-label">Ad Soyad:</span>
                        <span className="careers-review-value">{formData.name}</span>
                      </div>
                      <div className="careers-review-item">
                        <span className="careers-review-label">E-posta:</span>
                        <span className="careers-review-value">{formData.email}</span>
                      </div>
                      <div className="careers-review-item">
                        <span className="careers-review-label">Telefon:</span>
                        <span className="careers-review-value">{formData.phone}</span>
                      </div>
                    </div>

                    <div className="careers-review-section">
                      <h4><i className="fas fa-briefcase"></i> Pozisyon & Deneyim</h4>
                      <div className="careers-review-item">
                        <span className="careers-review-label">Pozisyon:</span>
                        <span className="careers-review-value">
                          {formData.position === 'technical' && 'Teknik Uzman / Kurulum Uzmanı'}
                          {formData.position === 'sales' && 'Satış Temsilcisi'}
                          {formData.position === 'support' && 'Teknik Destek Uzmanı'}
                          {formData.position === 'other' && 'Diğer'}
                        </span>
                      </div>
                      <div className="careers-review-item">
                        <span className="careers-review-label">Deneyim:</span>
                        <span className="careers-review-value">{formData.experience || 'Belirtilmemiş'}</span>
                      </div>
                      {formData.cv && (
                        <div className="careers-review-item">
                          <span className="careers-review-label">CV:</span>
                          <span className="careers-review-value"><i className="fas fa-file-pdf"></i> {formData.cv.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {message.text && (
                    <div className={`form-message form-message-${message.type}`}>{message.text}</div>
                  )}

                  <div className="careers-form-actions">
                    <button type="button" className="btn btn-secondary" onClick={handlePrevious}>
                      <i className="fas fa-arrow-left"></i> Geri
                    </button>
                    <button type="submit" className="btn btn-primary btn-submit" disabled={loading} aria-label={loading ? 'Başvuru gönderiliyor' : 'Başvuruyu gönder'}>
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i> Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane" aria-hidden="true"></i> Başvuruyu Gönder
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Careers

