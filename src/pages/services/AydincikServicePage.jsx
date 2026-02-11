import React from 'react'
import RegionalServicePage from '../../components/RegionalServicePage'

const AydincikServicePage = () => {
  return (
    <RegionalServicePage
      regionName="Aydıncık"
      regionSlug="aydincik"
      keywords={[
        'aydıncık kamera sistemi',
        'aydıncık güvenlik kamerası kurulumu',
        'aydıncık hikvision servis',
        'aydıncık kamera montajı',
        'aydıncık güvenlik sistemleri',
        'aydıncık ip kamera',
        'aydıncık cctv kurulumu'
      ]}
      description="Aydıncık bölgesinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. Kamera sistemi kurulumu, Hikvision servis, güvenlik kamerası montajı. Aydıncık merkez ve çevresinde hızlı kurulum. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04"
      coordinates={{ lat: 36.1500, lng: 33.3167 }}
    />
  )
}

export default AydincikServicePage
