import React from 'react'
import RegionalServicePage from '../../components/RegionalServicePage'

const AnamurServicePage = () => {
  return (
    <RegionalServicePage
      regionName="Anamur"
      regionSlug="anamur"
      keywords={[
        'anamur güvenlik kamerası',
        'anamur kamera kurulumu',
        'anamur hikvision bayi',
        'anamur cctv sistemleri',
        'anamur kamera montajı',
        'anamur güvenlik sistemleri',
        'anamur ip kamera',
        'anamur hikvision servis'
      ]}
      description="Anamur bölgesinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. Hikvision bayi, CCTV sistemleri, kamera kurulumu, güvenlik kamerası montajı. Anamur merkez ve çevresinde hızlı kurulum. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04"
      coordinates={{ lat: 36.0833, lng: 32.8333 }}
    />
  )
}

export default AnamurServicePage
