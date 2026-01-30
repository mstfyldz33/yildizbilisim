import React, { useState } from 'react'
import { db } from '../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { useToast } from './Toast'
import { trackFormSubmission } from '../utils/analytics'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { showToast } = useToast()

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validation
    if (!email.trim()) {
      setErrors({ email: 'Geçerli bir e-posta adresi giriniz' })
      return
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Geçerli bir e-posta adresi giriniz' })
      return
    }

    setLoading(true)

    try {
      // Check if email already exists
      const q = query(
        collection(db, 'newsletter_subscribers'),
        where('email', '==', email.toLowerCase().trim())
      )
      const existing = await getDocs(q)

      if (!existing.empty) {
        showToast('Bu e-posta adresi zaten kayıtlı!', 'warning')
        setLoading(false)
        return
      }

      // Add to newsletter
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.toLowerCase().trim(),
        subscribed: true,
        created_at: serverTimestamp(),
        source: 'website'
      })

      showToast('Başarıyla kayıt oldunuz! Teşekkürler.', 'success')
      setEmail('')
      trackFormSubmission('newsletter')
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      showToast('Bir hata oluştu. Lütfen tekrar deneyin.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="newsletter-content">
          <div className="newsletter-icon">
            <i className="fas fa-envelope-open-text"></i>
          </div>
          <div className="newsletter-text">
            <h3 id="newsletter-heading">Haberlerden Haberdar Olun</h3>
            <p>Yeni blog yazılarımızdan, kampanyalarımızdan ve güncellemelerimizden ilk siz haberdar olun.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <div className="newsletter-input-wrapper">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({})
                }}
                className={errors.email ? 'input-error' : ''}
                aria-label="E-posta adresi"
                required
              />
              <button
                type="submit"
                className="btn btn-primary newsletter-submit"
                disabled={loading}
                aria-label="Abone ol"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Abone Ol
                  </>
                )}
              </button>
            </div>
            {errors.email && (
              <span className="form-error">
                <i className="fas fa-exclamation-circle"></i> {errors.email}
              </span>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default Newsletter

