import React from 'react'
import RegionalServicePage from '../../components/RegionalServicePage'

const KizkalesiServicePage = () => {
  return (
    <RegionalServicePage
      regionName="Kızkalesi"
      regionSlug="kizkalesi"
      keywords={[
        'kızkalesi güvenlik kamerası',
        'kızkalesi kamera montajı',
        'kızkalesi hikvision servis',
        'kızkalesi kamera kurulumu',
        'kızkalesi güvenlik sistemleri',
        'kızkalesi ip kamera',
        'kızkalesi cctv kurulumu'
      ]}
      description="Kızkalesi bölgesinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. Kamera montajı, Hikvision servis, güvenlik kamerası kurulumu. Kızkalesi merkez ve çevresinde hızlı kurulum. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04"
      coordinates={{ lat: 36.2667, lng: 33.8667 }}
    />
  )
}

export default KizkalesiServicePage
