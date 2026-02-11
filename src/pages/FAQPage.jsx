import React, { useEffect } from 'react'
import FAQ from '../components/FAQ'
import SEO from '../components/SEO'

const FAQPage = () => {
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

  useEffect(() => {
    // FAQPage Schema.org structured data
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }

    let script = document.querySelector('script[data-faq-schema]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-faq-schema', 'true')
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(schema)

    return () => {
      const existingScript = document.querySelector('script[data-faq-schema]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <>
      <SEO
        title="Sıkça Sorulan Sorular - Yıldız Bilişim | Güvenlik Kamera Sistemleri"
        description="Güvenlik kamera sistemleri hakkında merak edilenler, teknik destek, kurulum süreçleri ve garanti koşulları hakkında sıkça sorulan sorular."
        keywords="sss, sıkça sorulan sorular, güvenlik kamera destek, teknik yardım, IP kamera kurulum soruları"
      />
      <FAQ />
    </>
  )
}

export default FAQPage

