import React, { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'

const ServicesComparison = () => {
  const [packages, setPackages] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesSnapshot, featuresSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'service_packages'), orderBy('order_index', 'asc'))),
        getDocs(query(collection(db, 'package_features'), orderBy('order_index', 'asc')))
      ])

      const packagesData = packagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      const featuresData = featuresSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (packagesData.length > 0) {
        setPackages(packagesData)
      } else {
        setPackages(getDefaultPackages())
      }
      
      if (featuresData.length > 0) {
        setFeatures(featuresData)
      } else {
        setFeatures(getDefaultFeatures())
      }
    } catch (error) {
      console.error('Error fetching package data:', error)
      setPackages(getDefaultPackages())
      setFeatures(getDefaultFeatures())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPackages = () => [
    { package_type: 'basic', package_name: 'Temel Paket', camera_range: '2-4 Kamera', is_popular: false },
    { package_type: 'standard', package_name: 'Standart Paket', camera_range: '5-8 Kamera', is_popular: false },
    { package_type: 'premium', package_name: 'Premium Paket', camera_range: '9-16 Kamera', is_popular: true },
    { package_type: 'enterprise', package_name: 'Kurumsal Paket', camera_range: '16+ Kamera', is_popular: false }
  ]

  const getDefaultFeatures = () => {
    const allFeatures = [
      { feature_name: 'IP Kamera', feature_icon: 'fa-video' },
      { feature_name: 'Mobil İzleme', feature_icon: 'fa-mobile-screen-button' },
      { feature_name: 'Bulut Kayıt', feature_icon: 'fa-cloud' },
      { feature_name: 'Hareket Algılama', feature_icon: 'fa-bell' },
      { feature_name: '7/24 Teknik Destek', feature_icon: 'fa-headset' },
      { feature_name: 'Kurulum & Bakım', feature_icon: 'fa-tools' },
      { feature_name: 'Plaka Tanıma', feature_icon: 'fa-car' },
      { feature_name: 'Raporlama Sistemi', feature_icon: 'fa-chart-bar' },
      { feature_name: 'Merkezi Yönetim', feature_icon: 'fa-server' }
    ]
    
    const features = []
    
    // Her paket için özellikleri tanımla
    allFeatures.forEach(feature => {
      // Temel Paket
      features.push({
        ...feature,
        package_id: 'basic',
        is_included: ['IP Kamera', 'Mobil İzleme', 'Hareket Algılama', 'Kurulum & Bakım'].includes(feature.feature_name)
      })
      
      // Standart Paket
      features.push({
        ...feature,
        package_id: 'standard',
        is_included: ['IP Kamera', 'Mobil İzleme', 'Bulut Kayıt', 'Hareket Algılama', 'Kurulum & Bakım'].includes(feature.feature_name)
      })
      
      // Premium Paket
      features.push({
        ...feature,
        package_id: 'premium',
        is_included: ['IP Kamera', 'Mobil İzleme', 'Bulut Kayıt', 'Hareket Algılama', '7/24 Teknik Destek', 'Kurulum & Bakım', 'Plaka Tanıma'].includes(feature.feature_name)
      })
      
      // Kurumsal Paket
      features.push({
        ...feature,
        package_id: 'enterprise',
        is_included: true // Tüm özellikler dahil
      })
    })
    
    return features
  }

  const getUniqueFeatureNames = () => {
    const uniqueNames = [...new Set(features.map(f => f.feature_name))]
    return uniqueNames
  }

  const getFeatureForPackage = (pkg, featureName) => {
    // Önce package_id ile eşleştirmeyi dene (Firebase'den gelen veriler için)
    let feature = features.find(f => f.package_id === pkg.id && f.feature_name === featureName)
    
    // Eğer bulunamazsa, package_type ile dene (default paketler için)
    if (!feature && pkg.package_type) {
      feature = features.find(f => f.package_id === pkg.package_type && f.feature_name === featureName)
    }
    
    return feature
  }

  const getPackageClassName = (packageType) => {
    const classMap = {
      basic: 'package-basic',
      standard: 'package-standard',
      premium: 'package-premium',
      enterprise: 'package-enterprise'
    }
    return classMap[packageType] || ''
  }

  const getPackageIcon = (packageType) => {
    const iconMap = {
      basic: 'fa-home',
      standard: 'fa-building',
      premium: 'fa-star',
      enterprise: 'fa-briefcase'
    }
    return iconMap[packageType] || 'fa-check'
  }

  const handleNavClick = (e) => {
    e.preventDefault()
    const contact = document.getElementById('contact')
    if (contact) {
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <section id="services-comparison" className="services-comparison">
        <div className="container">
          <div className="admin-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="services-comparison" className="services-comparison">
      <div className="container">
        <div className="comparison-header">
          <h2>Hizmet Paketleri</h2>
          <p>Size en uygun paketi seçin</p>
        </div>
        {packages.length === 0 ? (
          <div className="admin-empty">
            Henüz paket bulunmamaktadır.
          </div>
        ) : (
          <div className="comparison-wrapper">
            {/* Desktop: Card-based layout */}
            <div className="comparison-cards">
              {packages.map((pkg) => {
                const isPopular = pkg.is_popular
                return (
                  <div 
                    key={pkg.id || pkg.package_type} 
                    className={`comparison-card ${getPackageClassName(pkg.package_type)} ${isPopular ? 'popular' : ''}`}
                  >
                    {isPopular && (
                      <div className="popular-badge">
                        <i className="fas fa-star"></i> En Popüler
                      </div>
                    )}
                    <div className="card-header">
                      <div className="package-icon">
                        <i className={`fas ${getPackageIcon(pkg.package_type)}`}></i>
                      </div>
                      <h3>{pkg.package_name}</h3>
                      <div className="package-range">{pkg.camera_range}</div>
                    </div>
                    <div className="card-features">
                      <ul className="features-list">
                        {getUniqueFeatureNames().map((featureName) => {
                          const feature = getFeatureForPackage(pkg, featureName)
                          const isIncluded = feature ? feature.is_included : false
                          const firstFeature = features.find(f => f.feature_name === featureName)
                          return (
                            <li key={featureName} className={isIncluded ? 'feature-item included' : 'feature-item excluded'}>
                              <div className="feature-icon">
                                {isIncluded ? (
                                  <i className="fas fa-circle-check"></i>
                                ) : (
                                  <i className="fas fa-xmark"></i>
                                )}
                              </div>
                              <div className="feature-content">
                                <i className={`fas ${firstFeature?.feature_icon || 'fa-check'}`}></i>
                                <span>{featureName}</span>
                              </div>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                    <div className="card-footer">
                      <a href="#contact" className="btn btn-primary btn-block" onClick={handleNavClick}>
                        Teklif Al
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile: Compact comparison table */}
            <div className="comparison-table-mobile">
              <div className="table-header-row">
                <div className="table-header-feature">Özellikler</div>
                {packages.map((pkg) => (
                  <div key={pkg.id || pkg.package_type} className={`table-header-package ${pkg.is_popular ? 'popular' : ''}`}>
                    {pkg.is_popular && <span className="mobile-badge">Popüler</span>}
                    <div className="mobile-package-name">{pkg.package_name}</div>
                  </div>
                ))}
              </div>
              {getUniqueFeatureNames().map((featureName) => {
                const firstFeature = features.find(f => f.feature_name === featureName)
                return (
                  <div key={featureName} className="table-feature-row">
                    <div className="table-feature-name">
                      <i className={`fas ${firstFeature?.feature_icon || 'fa-check'}`}></i>
                      <span>{featureName}</span>
                    </div>
                    {packages.map((pkg) => {
                      const feature = getFeatureForPackage(pkg, featureName)
                      const isIncluded = feature ? feature.is_included : false
                      return (
                        <div key={pkg.id || pkg.package_type} className={`table-feature-value ${isIncluded ? 'included' : 'excluded'}`}>
                          {isIncluded ? (
                            <i className="fas fa-circle-check"></i>
                          ) : (
                            <i className="fas fa-xmark"></i>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              <div className="table-footer-row">
                <div className="table-footer-feature"></div>
                {packages.map((pkg) => (
                  <div key={pkg.id || pkg.package_type} className="table-footer-package">
                    <a href="#contact" className="btn btn-primary btn-sm" onClick={handleNavClick}>
                      Teklif Al
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default ServicesComparison

