import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import Breadcrumbs from '../../components/Breadcrumbs'

const CorporateServicePage = () => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Kurumsal Güvenlik Kamera Sistemleri',
      description: 'Fabrika, depo, market, otel, restoran ve ticari işletmeler için profesyonel güvenlik kamera sistemleri kurulumu.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Yıldız Bilişim',
        telephone: '+905415060404',
        url: 'https://yildizcloud.com'
      },
      areaServed: {
        '@type': 'City',
        name: 'Silifke'
      }
    }

    let script = document.querySelector('script[data-corporate-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-corporate-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-corporate-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const corporateServices = [
    {
      icon: 'fa-industry',
      title: 'Fabrika Kamera Sistemi',
      description: 'Büyük alanlar için özel tasarlanmış fabrika güvenlik kamera sistemleri. Yüksek çözünürlük, gece görüşü ve geniş açı kameralar.',
      keywords: 'fabrika kamera sistemi, endüstriyel güvenlik, fabrika güvenlik kamerası'
    },
    {
      icon: 'fa-warehouse',
      title: 'Depo Kamera Sistemi',
      description: 'Depo ve lojistik alanları için kapsamlı güvenlik kamera sistemleri. Hareket algılama ve anlık bildirimler.',
      keywords: 'depo kamera sistemi, lojistik güvenlik, depo güvenlik kamerası'
    },
    {
      icon: 'fa-store',
      title: 'Market Kamera Kurulumu',
      description: 'Market ve mağazalar için özel güvenlik kamera sistemleri. POS entegrasyonu ve kasa güvenliği.',
      keywords: 'market kamera kurulumu, mağaza güvenlik sistemi, market kamera sistemi'
    },
    {
      icon: 'fa-hotel',
      title: 'Otel Kamera Sistemi',
      description: 'Otel ve konaklama tesisleri için profesyonel güvenlik kamera sistemleri. Lobiler, koridorlar ve ortak alanlar.',
      keywords: 'otel kamera sistemi, konaklama güvenlik, otel güvenlik kamerası'
    },
    {
      icon: 'fa-bed',
      title: 'Pansiyon Kamera Kurulumu',
      description: 'Pansiyon ve küçük oteller için uygun fiyatlı güvenlik kamera sistemleri. Temel güvenlik ihtiyaçları.',
      keywords: 'pansiyon kamera kurulumu, küçük otel güvenlik, pansiyon kamera sistemi'
    },
    {
      icon: 'fa-utensils',
      title: 'Restoran Kamera Sistemi',
      description: 'Restoran ve kafeler için güvenlik kamera sistemleri. Mutfak ve servis alanları güvenliği.',
      keywords: 'restoran kamera sistemi, kafe güvenlik, restoran güvenlik kamerası'
    },
    {
      icon: 'fa-umbrella-beach',
      title: 'Yazlık Kamera Sistemi',
      description: 'Yazlık ve tatil evleri için güvenlik kamera sistemleri. Uzaktan izleme ve mobil erişim.',
      keywords: 'yazlık kamera sistemi, tatil evi güvenlik, yazlık güvenlik kamerası'
    },
    {
      icon: 'fa-home',
      title: 'Villa Kamera Kurulumu',
      description: 'Villa ve lüks konutlar için premium güvenlik kamera sistemleri. Yüksek kalite ve estetik tasarım.',
      keywords: 'villa kamera kurulumu, lüks konut güvenlik, villa güvenlik sistemi'
    }
  ]

  return (
    <>
      <SEO
        title="Kurumsal Güvenlik Kamera Sistemleri | Fabrika, Depo, Market, Otel Kamera Kurulumu"
        description="Fabrika, depo, market, otel, restoran ve ticari işletmeler için profesyonel güvenlik kamera sistemleri kurulumu. Hikvision yetkili bayisi. Kurumsal çözümler, özel tasarım ve 7/24 destek. Ücretsiz keşif ve teklif."
        keywords="fabrika kamera sistemi, depo kamera sistemi, market kamera kurulumu, otel kamera sistemi, pansiyon kamera kurulumu, restoran kamera sistemi, yazlık kamera sistemi, villa kamera kurulumu, kurumsal güvenlik sistemleri, ticari kamera kurulumu"
        image="/logo.png"
      />
      <section className="corporate-service-page">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Ana Sayfa', url: '/' },
            { label: 'Hizmetlerimiz', url: '/services' },
            { label: 'Kurumsal Güvenlik Kamera Sistemleri', url: '/services/kurumsal', isLast: true }
          ]} />

          <div className="page-header">
            <h1>Kurumsal Güvenlik Kamera Sistemleri</h1>
            <p className="page-subtitle">
              Fabrika, depo, market, otel, restoran ve ticari işletmeler için profesyonel güvenlik kamera sistemleri kurulumu. 
              İşletmenizin güvenliği için özel çözümler.
            </p>
          </div>

          <div className="services-grid">
            {corporateServices.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>

          <div className="cta-section">
            <h2>Kurumsal Çözümler İçin Teklif Alın</h2>
            <p>
              İşletmeniz için en uygun güvenlik kamera sistemini belirlemek üzere ücretsiz keşif hizmetimizden yararlanın. 
              Uzman ekibimiz ihtiyaçlarınızı analiz edip özel çözüm sunar.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-primary">
                <i className="fas fa-phone"></i> Hemen Teklif Al
              </Link>
              <a href="https://wa.me/905415060404" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i> WhatsApp ile İletişim
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default CorporateServicePage
