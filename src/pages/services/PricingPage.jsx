import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/SEO'
import Breadcrumbs from '../../components/Breadcrumbs'

const PricingPage = () => {
  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Güvenlik Kamera Sistemleri Fiyatları',
      description: 'Güvenlik kamera sistemleri fiyatları, kamera seti fiyatları ve kampanyalar. Hikvision kamera fiyatları.',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Yıldız Bilişim',
        telephone: '+905415060404',
        url: 'https://yildizcloud.com'
      }
    }

    let script = document.querySelector('script[data-pricing-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-pricing-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-pricing-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const pricingPackages = [
    {
      name: "4'lü Kamera Seti",
      cameras: 4,
      features: [
        '4 Adet IP Kamera (2MP)',
        '4 Kanal DVR Kayıt Cihazı',
        '1TB Hard Disk',
        'Mobil İzleme Uygulaması',
        'Kurulum Dahil',
        '1 Yıl Garanti'
      ],
      keywords: '4 lü kamera seti fiyat, 4 kamera sistemi, 4 lü kamera paketi'
    },
    {
      name: "8'li Kamera Sistemi",
      cameras: 8,
      features: [
        '8 Adet IP Kamera (4MP)',
        '8 Kanal NVR Kayıt Cihazı',
        '2TB Hard Disk',
        'Mobil İzleme Uygulaması',
        'Gece Görüşü',
        'Kurulum Dahil',
        '1 Yıl Garanti'
      ],
      keywords: '8 li kamera sistemi, 8 kamera paketi, 8 li kamera seti fiyat'
    },
    {
      name: "16'lı Kamera Sistemi",
      cameras: 16,
      features: [
        '16 Adet IP Kamera (4MP)',
        '16 Kanal NVR Kayıt Cihazı',
        '4TB Hard Disk',
        'Mobil İzleme Uygulaması',
        'Gece Görüşü',
        'Hareket Algılama',
        'Kurulum Dahil',
        '2 Yıl Garanti'
      ],
      keywords: '16 lı kamera sistemi, 16 kamera paketi, kurumsal kamera sistemi'
    }
  ]

  return (
    <>
      <SEO
        title="Güvenlik Kamerası Fiyatları | Kamera Sistemi Fiyatları | Hikvision Kamera Fiyat | Kampanya"
        description="Güvenlik kamerası fiyatları, kamera sistemi fiyatları, Hikvision kamera fiyat, 4'lü kamera seti fiyat, 8'li kamera sistemi. IP kamera seti ve kampanyalar. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04"
        keywords="güvenlik kamerası fiyatları, kamera sistemi fiyatları, hikvision kamera fiyat, 4 lü kamera seti fiyat, 8 li kamera sistemi, ip kamera seti, kamera sistemi kampanya, güvenlik kamera paketleri, kamera sistemi fiyat listesi"
        image="/logo.png"
      />
      <section className="pricing-page">
        <div className="container">
          <Breadcrumbs items={[
            { label: 'Ana Sayfa', url: '/' },
            { label: 'Hizmetlerimiz', url: '/services' },
            { label: 'Fiyatlar', url: '/services/fiyatlar', isLast: true }
          ]} />

          <div className="page-header">
            <h1>Güvenlik Kamerası Fiyatları</h1>
            <p className="page-subtitle">
              Güvenlik kamera sistemleri fiyatları ve paket seçenekleri. İhtiyacınıza uygun paketi seçin veya özel teklif alın.
            </p>
          </div>

          <div className="pricing-disclaimer">
            <p>
              <i className="fas fa-info-circle"></i>
              <strong>Not:</strong> Fiyatlar kurulum dahil olarak verilmiştir. Özel projeler için ücretsiz keşif sonrası özel teklif hazırlanır.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingPackages.map((pkg, index) => (
              <div key={index} className="pricing-card">
                <div className="pricing-header">
                  <h3>{pkg.name}</h3>
                  <div className="camera-count">
                    <i className="fas fa-video"></i>
                    <span>{pkg.cameras} Kamera</span>
                  </div>
                </div>
                <ul className="pricing-features">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pricing-footer">
                  <Link to="/contact" className="btn btn-primary btn-block">
                    <i className="fas fa-phone"></i> Teklif Al
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-info">
            <h2>Fiyat Bilgisi</h2>
            <div className="info-grid">
              <div className="info-item">
                <i className="fas fa-check-circle"></i>
                <h4>Ücretsiz Keşif</h4>
                <p>Tüm projeler için ücretsiz keşif ve ölçüm hizmeti</p>
              </div>
              <div className="info-item">
                <i className="fas fa-check-circle"></i>
                <h4>Özel Teklif</h4>
                <p>İhtiyacınıza özel detaylı teklif hazırlanır</p>
              </div>
              <div className="info-item">
                <i className="fas fa-check-circle"></i>
                <h4>Kurulum Dahil</h4>
                <p>Tüm paketlerde kurulum ve montaj dahildir</p>
              </div>
              <div className="info-item">
                <i className="fas fa-check-circle"></i>
                <h4>Garanti</h4>
                <p>Tüm ürünlerde garanti ve teknik destek</p>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h2>Size Özel Teklif İçin İletişime Geçin</h2>
            <p>
              İhtiyacınıza uygun en iyi çözümü belirlemek için ücretsiz keşif hizmetimizden yararlanın. 
              Uzman ekibimiz size özel teklif hazırlar.
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

export default PricingPage
