import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './AdminLogin.css'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const { signIn, resetPassword, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await signIn(email, password)
      
      if (signInError) {
        console.error('Login error:', signInError)
        let errorMessage = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
        
        if (signInError.code === 'auth/invalid-api-key' || signInError.message?.includes('api-key')) {
          errorMessage = 'Firebase API key hatası. Lütfen .env dosyasını kontrol edin ve development server\'ı yeniden başlatın.'
        } else if (signInError.code === 'auth/user-not-found') {
          errorMessage = 'Kullanıcı bulunamadı. Lütfen Firebase Console\'da kullanıcı oluşturduğunuzdan emin olun.'
        } else if (signInError.code === 'auth/wrong-password') {
          errorMessage = 'Şifre hatalı. Lütfen şifrenizi kontrol edin.'
        } else if (signInError.code === 'auth/invalid-credential') {
          errorMessage = 'E-posta veya şifre hatalı. Lütfen Firebase Console\'da kullanıcı oluşturduğunuzdan ve şifrenin doğru olduğundan emin olun.'
        } else if (signInError.code === 'auth/user-disabled') {
          errorMessage = 'Bu kullanıcı hesabı devre dışı bırakılmış. Lütfen Firebase Console\'dan kontrol edin.'
        } else if (signInError.message) {
          errorMessage = signInError.message
        }
        
        setError(errorMessage)
      } else {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      console.error('Login catch error:', err)
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setResetLoading(true)
    setResetSuccess(false)

    try {
      const { error: resetError } = await resetPassword(resetEmail)
      
      if (resetError) {
        let errorMessage = 'Şifre sıfırlama e-postası gönderilemedi.'
        
        if (resetError.code === 'auth/user-not-found') {
          errorMessage = 'Bu e-posta adresine kayıtlı kullanıcı bulunamadı.'
        } else if (resetError.code === 'auth/invalid-email') {
          errorMessage = 'Geçersiz e-posta adresi.'
        } else if (resetError.message) {
          errorMessage = resetError.message
        }
        
        setError(errorMessage)
      } else {
        setResetSuccess(true)
        setResetEmail('')
        setTimeout(() => {
          setShowResetPassword(false)
          setResetSuccess(false)
        }, 3000)
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <i className="fas fa-shield-halved"></i>
            <h1>Yıldız Bilişim</h1>
            <h2>Admin Paneli</h2>
          </div>
          <form onSubmit={handleSubmit} className="admin-login-form">
            {error && (
              <div className="admin-error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            <div className="admin-form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i> E-posta
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresinizi girin"
                required
                disabled={loading}
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin"
                required
                disabled={loading}
              />
            </div>
            <div className="admin-forgot-password">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(true)
                  setResetEmail(email)
                  setError('')
                }}
                className="admin-forgot-link"
                disabled={loading}
              >
                <i className="fas fa-key"></i> Şifremi Unuttum
              </button>
            </div>
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Giriş yapılıyor...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in"></i> Giriş Yap
                </>
              )}
            </button>
          </form>

          {showResetPassword && (
            <div className="admin-reset-password-modal">
              <div className="admin-reset-password-card">
                <div className="admin-reset-password-header">
                  <h3><i className="fas fa-key"></i> Şifre Sıfırlama</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetEmail('')
                      setError('')
                      setResetSuccess(false)
                    }}
                    className="admin-close-btn"
                  >
                    <i className="fas fa-xmark"></i>
                  </button>
                </div>
                {resetSuccess ? (
                  <div className="admin-reset-success">
                    <i className="fas fa-check-circle"></i>
                    <p>Şifre sıfırlama e-postası gönderildi!</p>
                    <p className="admin-reset-info">E-posta kutunuzu kontrol edin ve e-postadaki linke tıklayarak şifrenizi sıfırlayın.</p>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="admin-reset-form">
                    <p className="admin-reset-description">
                      Şifrenizi sıfırlamak için e-posta adresinizi girin. Size şifre sıfırlama linki göndereceğiz.
                    </p>
                    <div className="admin-form-group">
                      <label htmlFor="resetEmail">
                        <i className="fas fa-envelope"></i> E-posta
                      </label>
                      <input
                        type="email"
                        id="resetEmail"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="E-posta adresinizi girin"
                        required
                        disabled={resetLoading}
                      />
                    </div>
                    {error && (
                      <div className="admin-error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                      </div>
                    )}
                    <div className="admin-reset-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowResetPassword(false)
                          setResetEmail('')
                          setError('')
                        }}
                        className="admin-btn-secondary"
                        disabled={resetLoading}
                      >
                        İptal
                      </button>
                      <button type="submit" className="admin-login-btn" disabled={resetLoading}>
                        {resetLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i> Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane"></i> Gönder
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

