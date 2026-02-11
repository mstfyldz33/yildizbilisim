import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import Breadcrumbs from '../../components/Breadcrumbs'

const EmergencyServicePage = () => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Acil Kamera Servisi',
      description: 'Aynı gün kamera kurulumu, acil kamera servisi, kamera arıza tamiri ve bakım hizmetleri.',
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

    let script = document.querySelector('script[data-emergency-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-emergency-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-emergency-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const emergencyServices = [
    {
      icon: 'fa-clock',
      title: 'Aynı Gün Kamera Kurulumu',
      description: 'Acil güvenlik ihtiyacınız için aynı gün kamera kurulum hizmeti. Hızlı ve profesyonel çözüm.',
      keywords: 'aynı gün kamera kurulumu, acil kamera kurulumu, hızlı kamera montajı'
    },
    {
      icon: 'fa-exclamation-triangle',
      title: 'Acil Kamera Servisi',
      description: '7/24 acil kamera servis hizmeti. Arıza durumunda hızlı müdahale ve çözüm.',
      keywords: 'acil kamera servisi, 7/24 kamera servisi, acil güvenlik servisi'
    },
    {
      icon: 'fa-wrench',
      title: 'Kamera Arıza Servisi',
      description: 'Kamera arızalarında profesyonel tamir hizmeti. Tüm markalar için teknik destek.',
      keywords: 'kamera arıza servisi, kamera tamiri, kamera arıza tamiri'
    },
    {
      icon: 'fa-tools',
      title: 'Kamera Tamiri',
      description: 'Kamera cihazlarında arıza tespiti ve tamir hizmeti. Hızlı ve güvenilir çözüm.',
      keywords: 'kamera tamiri, kamera onarım, kamera arıza tamiri'
    },
    {
      icon: 'fa-server',
      title: 'Kayıt Cihazı Tamiri',
      description: 'DVR ve NVR kayıt cihazlarında arıza tamiri. Veri kurtarma ve yedekleme hizmetleri.',
      keywords: 'kayıt cihazı tamiri, dvr tamiri, nvr tamiri, kayıt cihazı onarım'
    },
    {
      icon: 'fa-cog',
      title: 'DVR NVR Tamiri',
      description: 'DVR ve NVR cihazlarında profesyonel tamir hizmeti. Tüm markalar için destek.',
      keywords: 'dvr nvr tamiri, kayıt cihazı tamiri, dvr tamiri, nvr tamiri'
    },
    {
      icon: 'fa-calendar-check',
      title: 'Kamera Bakım Anlaşması',
      description: 'Düzenli bakım ve kontrol hizmeti ile kamera sistemlerinizin sorunsuz çalışmasını garanti edin.',
      keywords: 'kamera bakım anlaşması, kamera bakım hizmeti, düzenli kamera bakımı'
    }
  ]

  return (
    <>
      <SEO
        title="Acil Kamera Servisi | Aynı Gün Kurulum | Kamera Tamiri | 7/24 Destek"
        description="Aynı gün kamera kurulumu, acil kamera servisi, kamera arıza tamiri, DVR/NVR tamiri ve bakım hizmetleri. Silifke ve çevresinde 7/24 acil servis. Hızlı müdahale ve profesyonel çözümler. Telefon: 0 541 506 04 04"
        keywords="aynı gün kamera kurulumu, acil kamera servisi, kamera arıza servisi, kamera tamiri, kayıt cihazı tamiri, dvr nvr tamiri, kamera bakım anlaşması, 7/24 kamera servisi, acil güvenlik servisi"
        image="/logo.png"
      />
      <section className="emergency-service-page">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Ana Sayfa', url: '/' },
            { label: 'Hizmetlerimiz', url: '/services' },
            { label: 'Acil Kamera Servisi', url: '/services/acil-servis', isLast: true }
          ]} />

          <div className="page-header emergency-header">
            <h1>Acil Kamera Servisi</h1>
            <p className="page-subtitle">
              7/24 acil kamera servisi, aynı gün kurulum, kamera tamiri ve bakım hizmetleri. 
              Güvenlik ihtiyacınızda yanınızdayız.
            </p>
            <div className="emergency-contact">
              <a href="tel:+905415060404" className="btn btn-primary btn-large">
                <i className="fas fa-phone"></i> Acil Servis: 0 541 506 04 04
              </a>
            </div>
          </div>

          <div className="services-grid">
            {emergencyServices.map((service, index) => (
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
            <h2>Acil Durumlarda Hemen İletişime Geçin</h2>
            <p>
              Güvenlik kamera sisteminizde arıza veya acil kurulum ihtiyacınız varsa hemen bize ulaşın. 
              7/24 hizmet veren ekibimiz en kısa sürede yanınızda.
            </p>
            <div className="cta-buttons">
              <a href="tel:+905415060404" className="btn btn-primary">
                <i className="fas fa-phone"></i> Hemen Ara: 0 541 506 04 04
              </a>
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

export default EmergencyServicePage
