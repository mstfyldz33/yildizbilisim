import React from 'react'

const WhatsAppWidget = () => {
  const message = encodeURIComponent('Merhaba, güvenlik kamera sistemi hakkında bilgi almak istiyorum.')
  const whatsappUrl = `https://wa.me/905415060404?text=${message}`

  return (
    <a 
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-widget"
      aria-label="WhatsApp ile iletişime geç"
      role="button"
      tabIndex={0}
    >
      <i className="fab fa-whatsapp" aria-hidden="true"></i>
      <span className="whatsapp-text">WhatsApp</span>
    </a>
  )
}

export default WhatsAppWidget

