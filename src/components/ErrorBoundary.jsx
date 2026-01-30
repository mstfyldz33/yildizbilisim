import React from 'react'
import { Link } from 'react-router-dom'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    
    // Burada bir error tracking servisine gönderebilirsiniz (örn: Sentry)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Bir Hata Oluştu</h1>
            <p>Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.</p>
            <div className="error-boundary-actions">
              <button onClick={this.handleReset} className="btn btn-primary">
                <i className="fas fa-redo"></i> Tekrar Dene
              </button>
              <Link to="/" className="btn btn-secondary">
                <i className="fas fa-home"></i> Ana Sayfaya Dön
              </Link>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary-details">
                <summary>Hata Detayları (Sadece Geliştirme Modu)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

