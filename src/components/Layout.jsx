import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import WhatsAppWidget from './WhatsAppWidget'
import CookieConsent from './CookieConsent'
import SEO from './SEO'
import SkipLink from './SkipLink'
import Breadcrumbs from './Breadcrumbs'

const Layout = ({ children, seo }) => {
  const location = useLocation()
  
  // Default SEO values based on route
  const defaultSEO = {
    '/': {
      title: 'Yıldız Bilişim - Silifke Güvenlik Kamera Sistemleri | IP Kamera Kurulum | Profesyonel Çözümler',
      description: 'Silifke ve çevresinde profesyonel güvenlik kamera sistemleri kurulum ve servis hizmetleri. IP kamera kurulum, mobil izleme, bulut kayıt, DVR/NVR sistemleri. Hikvision, Dahua, Axis yetkili bayisi. 7/24 teknik destek. Ücretsiz keşif ve teklif. Telefon: 0 541 506 04 04',
      keywords: 'güvenlik kamera Silifke, IP kamera kurulum, güvenlik kamera sistemleri, mobil izleme kamera, bulut kayıt sistemi, Hikvision Silifke, Dahua kamera, Axis güvenlik sistemleri, kamera montaj servisi, profesyonel güvenlik çözümleri, Silifke güvenlik kamera fiyatları'
    },
    '/about': {
      title: 'Hakkımızda - Yıldız Bilişim | Silifke Güvenlik Kamera Sistemleri | Deneyimli Ekip',
      description: 'Yıldız Bilişim olarak Silifke ve çevresinde 10+ yıllık deneyimle profesyonel güvenlik kamera sistemleri hizmeti sunuyoruz. Hikvision, Dahua, Axis yetkili bayisi. Deneyimli teknik ekibimiz, kaliteli ürünlerimiz ve 7/24 destek hizmetimizle yanınızdayız. Kurumsal ve bireysel müşterilerimize özel çözümler.',
      keywords: 'hakkımızda Yıldız Bilişim, Silifke güvenlik kamera firması, deneyimli kamera kurulum ekibi, profesyonel güvenlik hizmetleri, güvenilir kamera sistemleri, Silifke güvenlik kamera şirketi'
    },
    '/services': {
      title: 'Hizmetlerimiz - Yıldız Bilişim | Güvenlik Kamera Sistemleri | Silifke',
      description: 'Silifke ve çevresinde profesyonel güvenlik kamera sistemleri hizmetleri. IP kamera kurulum, mobil izleme, bulut kayıt, DVR/NVR sistemleri, alarm sistemleri, ağ altyapısı kurulumu. Hikvision, Dahua, Axis markaları. 7/24 teknik destek ve bakım hizmetleri. Ücretsiz keşif ve teklif.',
      keywords: 'güvenlik kamera hizmetleri, IP kamera kurulum Silifke, mobil izleme sistemleri, bulut kayıt hizmeti, kamera bakım onarım, DVR NVR kurulum, alarm sistemleri, ağ altyapısı kurulumu, güvenlik kamera servisi Silifke, profesyonel kamera kurulum'
    },
    '/projects': {
      title: 'Projelerimiz - Yıldız Bilişim | Tamamlanan Güvenlik Kamera Projeleri',
      description: 'Tamamladığımız başarılı güvenlik kamera projeleri. Kurumsal, konut ve ticari alanlar için profesyonel çözümler.',
      keywords: 'güvenlik kamera projeleri, tamamlanan projeler, kamera kurulum örnekleri'
    },
    '/contact': {
      title: 'İletişim - Yıldız Bilişim | Silifke Güvenlik Kamera Sistemleri',
      description: 'Yıldız Bilişim ile iletişime geçin. Silifke güvenlik kamera sistemleri için teklif alın. Telefon: 0 541 506 04 04',
      keywords: 'iletişim, Yıldız Bilişim telefon, Silifke güvenlik kamera, teklif al'
    },
    '/gallery': {
      title: 'Galeri - Yıldız Bilişim | Referanslarımız ve Uygulamalarımız',
      description: 'Yıldız Bilişim olarak gerçekleştirdiğimiz güvenlik kamera kurulumları, montaj örnekleri ve referans projelerimizden görseller.',
      keywords: 'güvenlik kamera montaj örnekleri, kamera kurulum fotoğrafları, referanslar, galeri'
    },
    '/brands': {
      title: 'Markalar - Yıldız Bilişim | Hikvision, Dahua, Axis Güvenlik Sistemleri',
      description: 'Yıldız Bilişim olarak Hikvision, Dahua, Axis ve diğer lider güvenlik kamera markalarının yetkili çözüm ortağıyız. Silifke ve çevresinde profesyonel hizmet.',
      keywords: 'Hikvision, Dahua, Axis, güvenlik kamera markaları, IP kamera markaları, Silifke'
    },
    '/testimonials': {
      title: 'Müşteri Yorumları - Yıldız Bilişim | Referanslar',
      description: 'Yıldız Bilişim müşteri yorumları ve referansları. Güvenlik kamera sistemleri hizmetimiz hakkında müşterilerimizin deneyimleri.',
      keywords: 'müşteri yorumları, referanslar, güvenlik kamera yorumları, Yıldız Bilişim'
    },
    '/blog': {
      title: 'Blog - Yıldız Bilişim | Güvenlik Kamera Sistemleri Rehberleri ve İpuçları',
      description: 'Güvenlik kamera sistemleri hakkında kapsamlı rehberler, teknolojik gelişmeler, kurulum ipuçları ve sektör haberleri. IP kamera seçimi, kurulum rehberleri, bakım önerileri ve güvenlik sistemleri hakkında bilgilendirici makaleler.',
      keywords: 'güvenlik kamera blog, IP kamera rehberleri, kamera kurulum ipuçları, güvenlik sistemleri makaleleri, teknoloji haberleri güvenlik, kamera bakım önerileri, güvenlik kamera seçimi rehberi'
    },
    '/faq': {
      title: 'Sıkça Sorulan Sorular - Yıldız Bilişim | Destek',
      description: 'Güvenlik kamera sistemleri hakkında merak edilenler, teknik destek, kurulum süreçleri ve garanti koşulları hakkında sıkça sorulan sorular.',
      keywords: 'sss, sıkça sorulan sorular, güvenlik kamera destek, teknik yardım'
    },
    '/map': {
      title: 'Hizmet Bölgeleri - Yıldız Bilişim | Silifke ve Çevresi',
      description: 'Silifke merkezli olmak üzere Mersin ve çevresinde hizmet verdiğimiz bölgeler. Güvenlik kamera sistemleri kurulum ve servis ağı.',
      keywords: 'hizmet bölgeleri, silifke güvenlik, mersin kamera sistemleri, servis ağı'
    },
    '/kvkk': {
      title: 'KVKK Aydınlatma Metni - Yıldız Bilişim',
      description: 'Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni ve veri işleme politikalarımız.',
      keywords: 'kvkk, kişisel verilerin korunması, aydınlatma metni, gizlilik'
    },
    '/privacy': {
      title: 'Gizlilik Politikası - Yıldız Bilişim',
      description: 'Yıldız Bilişim gizlilik politikası. Müşteri verilerinin güvenliği ve kullanımı hakkında bilgiler.',
      keywords: 'gizlilik politikası, veri güvenliği, gizlilik bildirimi'
    },
    '/cookie-policy': {
      title: 'Çerez Politikası - Yıldız Bilişim',
      description: 'Web sitemizde kullanılan çerezler ve kullanım amaçları hakkında bilgilendirme.',
      keywords: 'çerez politikası, cookie policy, çerez kullanımı'
    },
    '/terms': {
      title: 'Kullanım Şartları - Yıldız Bilişim',
      description: 'Yıldız Bilişim web sitesi kullanım şartları ve koşulları.',
      keywords: 'kullanım şartları, site kuralları, yasal uyarı'
    }
  }

  const currentSEO = seo || defaultSEO[location.pathname] || defaultSEO['/']

  return (
    <>
      <SEO {...currentSEO} />
      <SkipLink />
      {import.meta.env.DEV && (
        <div className="dev-firebase-hint" style={{
          background: '#1e293b',
          color: '#e2e8f0',
          padding: '6px 12px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          İçerikler Firebase Firestore’dan yüklenir. Boş bölümler = Firestore’da veri yok veya .env eksik. Geliştirme: veri /admin üzerinden yönetilir
        </div>
      )}
      <Header />
      <main id="main-content" role="main">
        {location.pathname !== '/' && <Breadcrumbs />}
        {children}
      </main>
      <Footer />
      <BackToTop />
      <WhatsAppWidget />
      <CookieConsent />
    </>
  )
}

export default Layout

