import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const NotFoundPage = () => {
  return (
    <Layout>
      <section className="not-found">
        <div className="container">
          <div className="not-found-content">
            <div className="not-found-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h1>404</h1>
            <h2>Sayfa Bulunamadı</h2>
            <p>Aradığınız sayfa mevcut değil veya taşınmış olabilir.</p>
            <div className="not-found-actions">
              <Link to="/" className="btn btn-primary">
                <i className="fas fa-home"></i> Ana Sayfaya Dön
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                <i className="fas fa-envelope"></i> İletişim
              </Link>
            </div>
            <div className="not-found-links">
              <h3>Popüler Sayfalar</h3>
              <ul>
                <li><Link to="/">Ana Sayfa</Link></li>
                <li><Link to="/services">Hizmetlerimiz</Link></li>
                <li><Link to="/projects">Projeler</Link></li>
                <li><Link to="/gallery">Galeri</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/contact">İletişim</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default NotFoundPage

