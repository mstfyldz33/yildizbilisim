import React from 'react'

const MapSection = () => {
  return (
    <section id="map-section" className="map-section">
      <div className="container">
        <h2>Hizmet Verdiğimiz Bölge</h2>
        <p>Mersin, Erdemli, Silifke, Taşucu, Anamur ve Aydıncık ilçelerinde aktif olarak hizmet veriyoruz.</p>

        <div className="service-areas-list">
          <div className="areas-header">
            <h3>Hizmet Verdiğimiz Bölgeler</h3>
            <p className="areas-subtitle">Aşağıdaki ilçelerde aktif olarak hizmet veriyoruz</p>
          </div>
          <div className="areas-grid">
            <div className="area-category active-areas">
              <h4><i className="fas fa-circle-check"></i> Aktif Hizmet Bölgeleri</h4>
              <ul>
                <li><i className="fas fa-location-dot"></i> Mersin</li>
                <li><i className="fas fa-location-dot"></i> Erdemli</li>
                <li><i className="fas fa-location-dot"></i> Silifke</li>
                <li><i className="fas fa-location-dot"></i> Taşucu</li>
                <li><i className="fas fa-location-dot"></i> Anamur</li>
                <li><i className="fas fa-location-dot"></i> Aydıncık</li>
              </ul>
            </div>
            <div className="area-category planned-areas">
              <h4><i className="fas fa-clock"></i> Planlanan Hizmet Bölgeleri</h4>
              <ul>
                <li><i className="fas fa-hourglass-half"></i> Mut</li>
                <li><i className="fas fa-hourglass-half"></i> Gülnar</li>
                <li><i className="fas fa-hourglass-half"></i> Karaman</li>
                <li><i className="fas fa-hourglass-half"></i> Gazipaşa</li>
              </ul>
              <p className="planned-note"><i className="fas fa-info-circle"></i> Bu bölgelerde yakında hizmet vermeye başlayacağız</p>
            </div>
          </div>
        </div>

        <div className="map-container">
          <div className="address-map">
            <iframe 
              src="https://www.google.com/maps/d/u/0/embed?mid=1OdEzqNT8JHj8cl1KUjIPwOgeZtXn-mg&ehbc=2E312F" 
              width="100%" 
              height="480" 
              style={{ border: 0, borderRadius: '12px' }} 
              allowFullScreen={true}
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Yıldız Bilişim - Hizmet Bölgeleri Haritası"
            />
          </div>
        </div>
        <div className="map-legend-wrapper">
          <div className="map-legend">
            <h4>Harita Gösterimi</h4>
            <div className="legend-item">
              <span className="legend-color active"></span>
              <span>Aktif Hizmet Bölgeleri</span>
            </div>
            <div className="legend-item">
              <span className="legend-color planned"></span>
              <span>Planlanan Hizmetler</span>
            </div>
            <div className="legend-item">
              <span className="legend-color area"></span>
              <span>Hizmet Alanı (100 km)</span>
            </div>
            <div className="legend-item">
              <span style={{ display: 'inline-block', width: '20px', height: '20px', background: 'linear-gradient(135deg, #EAB308 0%, #CA8A04 100%)', borderRadius: '4px', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></span>
              <span>Silifke Merkez Ofis — Göksu Mahallesi Celal Bayar Caddesi 98/A</span>
            </div>
            <p className="legend-note">
              <i className="fas fa-info-circle"></i> Haritada işaretli bölgelerde aktif olarak hizmet veriyoruz. Pinleri tıklayarak detaylı bilgi alabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MapSection
