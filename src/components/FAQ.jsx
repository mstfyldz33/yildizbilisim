import React, { useState } from 'react'

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null)

  const faqs = [
    {
      question: 'IP kamera sistemi kurulumu ne kadar sürer?',
      answer: 'Kamera sayısına ve kurulum karmaşıklığına bağlı olarak değişmekle birlikte, ortalama olarak 2-4 kameralı bir sistem kurulumu 1-2 gün, 8-16 kameralı bir sistem ise 3-5 gün sürmektedir. Daha büyük projeler için detaylı bir zaman çizelgesi hazırlanmaktadır.'
    },
    {
      question: 'Fiyatlandırma nasıl yapılıyor?',
      answer: 'Fiyatlandırma, kamera sayısı, sistem özellikleri, kurulum karmaşıklığı ve ek hizmetler göz önünde bulundurularak yapılmaktadır. Her proje için ücretsiz keşif yapılmakta ve detaylı bir teklif hazırlanmaktadır. İletişim formundan teklif talep edebilirsiniz.'
    },
    {
      question: 'Hangi markaları kullanıyorsunuz?',
      answer: 'Hikvision, Dahua, Axis, Uniview, Samsung, Bosch, Panasonic ve Honeywell gibi dünya çapında bilinen güvenlik kamera markalarının yetkili bayisi olarak çalışmaktayız. Müşterilerimizin ihtiyaçlarına göre en uygun markayı öneriyoruz.'
    },
    {
      question: 'Mobil izleme ücretsiz mi?',
      answer: 'Evet, mobil izleme uygulaması tamamen ücretsizdir. iPhone ve Android cihazlar için ücretsiz mobil uygulamalar mevcuttur. Uygulama üzerinden kameralarınızı canlı izleyebilir, geçmiş kayıtlara erişebilir ve hareket algılama bildirimleri alabilirsiniz.'
    },
    {
      question: 'Bakım sözleşmesi var mı?',
      answer: 'Evet, sistem bakımı ve teknik destek için yıllık bakım sözleşmeleri sunmaktayız. Bakım sözleşmesi kapsamında düzenli sistem kontrolü, temizlik, güncellemeler ve 7/24 teknik destek hizmeti verilmektedir.'
    },
    {
      question: 'Garanti kapsamı nedir?',
      answer: 'Kurulum işçilik garantisi 2 yıl, ürün garantisi ise markaya göre 2-3 yıl arasında değişmektedir. Garanti süresi içinde ortaya çıkan donanım arızaları ücretsiz olarak giderilmektedir. Garanti şartları teklif belgesinde detaylı olarak belirtilmektedir.'
    },
    {
      question: 'Kurulum sonrası eğitim veriyor musunuz?',
      answer: 'Evet, kurulum tamamlandıktan sonra sistem kullanımı hakkında detaylı bir eğitim verilmektedir. Mobil uygulama kullanımı, kayıt erişimi, ayarlar ve sorun giderme konularında kapsamlı bir eğitim sunulmaktadır. İhtiyaç duyulduğunda ek destek sağlanabilmektedir.'
    }
  ]

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  return (
    <section id="faq" className="faq">
      <div className="container">
        <div className="faq-header">
          <h2>Sık Sorulan Sorular</h2>
          <p>Merak ettiğiniz soruların cevapları</p>
        </div>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{faq.question}</h3>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ

