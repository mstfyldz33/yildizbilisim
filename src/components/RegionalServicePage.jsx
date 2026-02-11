import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from './SEO'
import Breadcrumbs from './Breadcrumbs'

const RegionalServicePage = ({ 
  regionName, 
  regionSlug, 
  keywords = [],
  description,
  coordinates = { lat: 36.3775, lng: 33.9344 }
}) => {
  const baseUrl = 'https://yildizcloud.com'
  const pageUrl = `${baseUrl}/services/${regionSlug}`

  // LocalBusiness Schema for regional service
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: `Yıldız Bilişim - ${regionName} Güvenlik Kamera Sistemleri`,
      description: description,
      url: pageUrl,
      telephone: '+905415060404',
      address: {
        '@type': 'PostalAddress',
        addressLocality: regionName,
        addressRegion: 'Mersin',
        addressCountry: 'TR'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: coordinates.lat,
        longitude: coordinates.lng
      },
      areaServed: {
        '@type': 'City',
        name: regionName
      },
      serviceType: [
        'Güvenlik Kamera Sistemleri',
        'IP Kamera Kurulumu',
        'CCTV Kamera Sistemleri',
        'Hikvision Kamera Kurulumu',
        'Kamera Montajı',
        'Kamera Servisi',
        'DVR/NVR Kurulumu'
      ],
      priceRange: '$$',
      openingHours: 'Mo-Su 08:00-20:00'
    }

    let script = document.querySelector(`script[data-regional-schema="${regionSlug}"]`)
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute(`data-regional-schema`, regionSlug)
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector(`script[data-regional-schema="${regionSlug}"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [regionName, regionSlug, description, coordinates, pageUrl])

  const services = [
    {
      icon: 'fa-video',
      title: 'IP Kamera Kurulumu',
      description: `${regionName} bölgesinde profesyonel IP kamera kurulum hizmeti. Hikvision, Dahua, Axis markaları.`
    },
    {
      icon: 'fa-shield-halved',
      title: 'CCTV Kamera Sistemleri',
      description: `${regionName} için güvenlik kamera sistemleri kurulumu. İşyeri, ev, apartman ve site kamera sistemleri.`
    },
    {
      icon: 'fa-tools',
      title: 'Kamera Montajı',
      description: `${regionName} bölgesinde uzman ekibimizle kamera montaj hizmeti. Hızlı ve güvenilir kurulum.`
    },
    {
      icon: 'fa-mobile-screen-button',
      title: 'Mobil İzleme',
      description: `${regionName} bölgesindeki kameralarınızı telefonunuzdan izleyin. 7/24 erişim imkanı.`
    },
    {
      icon: 'fa-cloud',
      title: 'Bulut Kayıt',
      description: `${regionName} için güvenli bulut kayıt hizmeti. Kayıtlarınızı güvenle saklayın.`
    },
    {
      icon: 'fa-wrench',
      title: 'Hikvision Servis',
      description: `${regionName} bölgesinde Hikvision yetkili servis hizmeti. Arıza, bakım ve teknik destek.`
    }
  ]

  return (
    <>
      <SEO
        title={`${regionName} Güvenlik Kamera Sistemleri | Yıldız Bilişim | Kamera Kurulumu`}
        description={description}
        keywords={keywords.join(', ')}
        image="/logo.png"
      />
      <section className="regional-service-page">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Ana Sayfa', url: '/' },
            { label: 'Hizmetlerimiz', url: '/services' },
            { label: `${regionName} Güvenlik Kamera Sistemleri`, url: `/services/${regionSlug}`, isLast: true }
          ]} />

          <div className="regional-header">
            <h1>{regionName} Güvenlik Kamera Sistemleri</h1>
            <p className="regional-subtitle">
              {regionName} bölgesinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. 
              Hikvision yetkili bayisi olarak kaliteli ürünler ve uzman ekibimizle yanınızdayız.
            </p>
          </div>

          <div className="regional-services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>

          <div className="regional-cta">
            <h2>{regionName} İçin Ücretsiz Keşif ve Teklif</h2>
            <p>
              {regionName} bölgesinde güvenlik kamera sistemi kurulumu için ücretsiz keşif hizmetimizden yararlanın. 
              Uzman ekibimiz ihtiyaçlarınızı değerlendirip en uygun çözümü sunar.
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

          <div className="regional-features">
            <h2>Neden Yıldız Bilişim?</h2>
            <div className="features-grid">
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>Hikvision Yetkili Bayisi</h4>
                <p>Orijinal Hikvision ürünleri ve garantili hizmet</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>Uzman Ekip</h4>
                <p>10+ yıllık deneyimli teknik ekibimiz</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>7/24 Destek</h4>
                <p>Acil durumlarda hızlı müdahale</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>Ücretsiz Keşif</h4>
                <p>{regionName} bölgesinde ücretsiz keşif hizmeti</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>Garantili Hizmet</h4>
                <p>Tüm kurulumlarımız garantili</p>
              </div>
              <div className="feature-item">
                <i className="fas fa-check-circle"></i>
                <h4>Hızlı Kurulum</h4>
                <p>Aynı gün veya ertesi gün kurulum imkanı</p>
              </div>
            </div>
          </div>

          <div className="regional-contact-info">
            <h2>{regionName} İletişim</h2>
            <div className="contact-grid">
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <h4>Telefon</h4>
                  <a href="tel:+905415060404">0 541 506 04 04</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fab fa-whatsapp"></i>
                <div>
                  <h4>WhatsApp</h4>
                  <a href="https://wa.me/905415060404" target="_blank" rel="noopener noreferrer">Mesaj Gönder</a>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Hizmet Bölgesi</h4>
                  <p>{regionName}, Mersin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default RegionalServicePage
