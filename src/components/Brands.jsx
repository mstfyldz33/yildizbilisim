import React from 'react'

const Brands = () => {
  const brands = ['Hikvision', 'Dahua', 'Axis', 'Uniview', 'Samsung', 'Bosch', 'Panasonic', 'Honeywell']

  const getImagePath = (brand) => `/images/brands/${brand.toLowerCase()}.png`
  const getFallbackSVG = (brand) => `data:image/svg+xml;base64,${btoa(`<svg width="120" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="60" fill="#1a1a1a"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#fff" text-anchor="middle" dy=".3em">${brand}</text></svg>`)}`

  return (
    <section id="brands" className="brands">
      <div className="container">
        <h2>Çalıştığımız Markalar</h2>
        <div className="brands-slider">
          <div className="brands-track">
            {brands.map((brand, index) => (
              <div key={index} className="brand-item">
                <div className="brand-image-wrapper">
                  <img 
                    src={getImagePath(brand)} 
                    alt={brand} 
                    loading="lazy"
                    fetchPriority="low"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = getFallbackSVG(brand)
                    }}
                  />
                </div>
                <span className="brand-name">{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Brands

