import React from 'react'

const Certificates = () => {
  const certificates = [
    { icon: 'fa-certificate', title: 'Hikvision Yetkili Bayi', desc: 'Hikvision markası için yetkili bayilik sertifikası' },
    { icon: 'fa-certificate', title: 'Dahua Yetkili Bayi', desc: 'Dahua markası için yetkili bayilik sertifikası' },
    { icon: 'fa-certificate', title: 'Axis Yetkili Partner', desc: 'Axis markası için yetkili partner sertifikası' },
    { icon: 'fa-award', title: 'ISO Kalite Belgesi', desc: 'Kalite yönetim sistemi sertifikası' },
    { icon: 'fa-shield-halved', title: 'Sigorta Belgesi', desc: 'Kapsamlı sigorta güvencesi' },
    { icon: 'fa-file-contract', title: 'İş Lisansı', desc: 'Yasal iş ruhsatı ve lisans belgeleri' }
  ]

  return (
    <section id="certificates" className="certificates">
      <div className="container">
        <div className="certificates-header">
          <h2>Sertifikalar ve Belgeler</h2>
          <p>Profesyonel hizmet ve kalite belgelerimiz</p>
        </div>
        <div className="certificates-grid">
          {certificates.map((cert, index) => (
            <div key={index} className="certificate-item">
              <div className="certificate-icon">
                <i className={`fas ${cert.icon}`}></i>
              </div>
              <h3>{cert.title}</h3>
              <p>{cert.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Certificates

