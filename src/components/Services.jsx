import React, { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

const Services = () => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  // Service schema for SEO
  useEffect(() => {
    if (services.length === 0) return

    const serviceSchemas = services.map((service) => ({
      '@type': 'Service',
      serviceType: service.title,
      description: service.description,
      provider: {
        '@type': 'LocalBusiness',
        name: 'Yıldız Bilişim',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Silifke',
          addressRegion: 'Mersin',
          addressCountry: 'TR'
        },
        telephone: '+905415060404',
        url: 'https://yildizcloud.com'
      },
      areaServed: {
        '@type': 'City',
        name: 'Silifke'
      }
    }))

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: serviceSchemas.map((serviceSchema, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: serviceSchema
      }))
    }

    let script = document.querySelector('script[data-services-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-services-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-services-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [services])

  const fetchServices = async () => {
    try {
      const q = query(collection(db, 'services'), orderBy('created_at', 'asc'))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setServices(servicesData)
      } else {
        setServices(getDefaultServices())
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices(getDefaultServices())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultServices = () => {
    return [
      {
        icon: 'fa-video',
        title: 'IP Kamera Sistemleri',
        description: 'Yüksek çözünürlüklü IP kameralar ile net görüntü kalitesi. 2MP, 4MP, 5MP ve 8MP çözünürlük seçenekleri.'
      },
      {
        icon: 'fa-mobile-screen-button',
        title: 'Mobil İzleme',
        description: 'Telefonunuzdan, tabletinizden veya bilgisayarınızdan her yerden kameralarınızı izleyin. iOS ve Android uygulamaları.'
      },
      {
        icon: 'fa-cloud',
        title: 'Bulut Kayıt',
        description: 'Güvenli bulut depolama ile kayıtlarınızı saklayın. 7/24 erişim imkanı ve yedekleme garantisi.'
      },
      {
        icon: 'fa-tools',
        title: 'Kurulum & Bakım',
        description: 'Profesyonel kurulum ve düzenli bakım hizmetleri. Yıllık bakım sözleşmeleri ve 7/24 teknik destek.'
      },
      {
        icon: 'fa-shield-halved',
        title: 'Güvenlik Sistemleri',
        description: 'Tüm bina ve alanlarınız için kapsamlı güvenlik çözümleri. Gece görüşü ve hareket algılama özellikli kameralar.'
      },
      {
        icon: 'fa-network-wired',
        title: 'Ağ Altyapısı',
        description: 'Kurumsal ağ altyapısı kurulumu ve yönetimi. Switch, router ve kablolama çözümleri.'
      },
      {
        icon: 'fa-server',
        title: 'DVR/NVR Sistemleri',
        description: 'Merkezi kayıt sistemleri. 4, 8, 16 ve 32 kanallı DVR/NVR cihazları.'
      },
      {
        icon: 'fa-bell',
        title: 'Alarm Sistemleri',
        description: 'Entegre alarm ve güvenlik sistemleri. Hareket algılama ve anlık bildirimler.'
      },
      {
        icon: 'fa-wifi',
        title: 'Kablosuz Sistemler',
        description: 'Kablosuz IP kamera kurulumları. Mesh network ve repeater çözümleri.'
      },
      {
        icon: 'fa-cog',
        title: 'Özel Çözümler',
        description: 'İşletmenize özel güvenlik çözümleri. Proje bazlı tasarım ve kurulum hizmetleri.'
      }
    ]
  }

  if (loading) {
    return (
      <section id="services" className="services">
        <div className="container">
          <h2>Hizmetlerimiz</h2>
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services" className="services">
      <div className="container">
        <h2>Hizmetlerimiz</h2>
        {services.length === 0 ? (
          <div className="admin-empty">
            Henüz hizmet bulunmamaktadır.
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={service.id || index} className="service-card">
                <div className="service-icon">
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default Services

