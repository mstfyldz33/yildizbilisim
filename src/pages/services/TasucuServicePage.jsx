import React from 'react'
import RegionalServicePage from '../../components/RegionalServicePage'

const TasucuServicePage = () => {
  return (
    <RegionalServicePage
      regionName="Taşucu"
      regionSlug="tasucu"
      keywords={[
        'taşucu güvenlik kamerası',
        'taşucu kamera kurulumu',
        'taşucu hikvision servis',
        'taşucu işyeri kamera sistemi',
        'taşucu kamera montajı',
        'taşucu güvenlik sistemleri',
        'taşucu ip kamera',
        'taşucu cctv kurulumu'
      ]}
      description="Taşucu bölgesinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. İşyeri kamera sistemleri, IP kamera kurulumu, Hikvision servis, kamera montajı. Taşucu merkez ve çevresinde hızlı kurulum. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04"
      coordinates={{ lat: 36.3167, lng: 33.8833 }}
    />
  )
}

export default TasucuServicePage
