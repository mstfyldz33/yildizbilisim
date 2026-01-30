import React from 'react'
import Layout from '../components/Layout'

const CookiePolicyPage = () => {
  return (
    <Layout>
      <section className="legal-page">
        <div className="container">
          <div className="legal-content">
            <h1>Çerez Politikası (Cookie Policy)</h1>
            
            <div className="legal-section">
              <h2>1. Çerez Nedir?</h2>
              <p>
                Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. 
                Bu dosyalar, web sitemizin düzgün çalışması ve kullanıcı deneyiminin iyileştirilmesi için kullanılır.
              </p>
            </div>

            <div className="legal-section">
              <h2>2. Çerez Türleri</h2>
              <p>
                Web sitemizde aşağıdaki çerez türleri kullanılmaktadır:
              </p>
              
              <h3>2.1. Zorunlu Çerezler</h3>
              <p>
                Bu çerezler web sitemizin çalışması için mutlaka gereklidir. Bu çerezler olmadan sitemiz 
                düzgün çalışmaz. Örnek olarak:
              </p>
              <ul>
                <li>Oturum yönetimi çerezleri</li>
                <li>Güvenlik çerezleri</li>
                <li>Kullanıcı tercihleri çerezleri</li>
              </ul>

              <h3>2.2. İşlevsel Çerezler</h3>
              <p>
                Bu çerezler, web sitemizin geliştirilmiş işlevsellik ve kişiselleştirme sağlaması için kullanılır. 
                Örnek olarak:
              </p>
              <ul>
                <li>Dil tercihleri</li>
                <li>Kullanıcı ayarları</li>
                <li>Form verilerinin saklanması</li>
              </ul>

              <h3>2.3. Analitik Çerezler</h3>
              <p>
                Bu çerezler, web sitemizin nasıl kullanıldığını anlamak ve performansını iyileştirmek için kullanılır. 
                Örnek olarak:
              </p>
              <ul>
                <li>Sayfa görüntüleme istatistikleri</li>
                <li>Kullanıcı davranış analizi</li>
                <li>Site performans metrikleri</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>3. Kullandığımız Çerezler</h2>
              <p>
                Web sitemizde aşağıdaki çerezler kullanılmaktadır:
              </p>
              <ul>
                <li><strong>cookieConsent:</strong> Çerez onay tercihinizi saklar</li>
                <li><strong>sessionStorage:</strong> Oturum bilgilerini saklar</li>
                <li><strong>localStorage:</strong> Kullanıcı tercihlerini saklar</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>4. Çerezleri Yönetme</h2>
              <p>
                Çerezleri yönetmek ve kontrol etmek için tarayıcı ayarlarınızı kullanabilirsiniz. Çoğu tarayıcı 
                çerezleri otomatik olarak kabul eder, ancak çerezleri reddetmeyi veya yalnızca belirli çerezleri 
                kabul etmeyi seçebilirsiniz.
              </p>
              <p>
                Çerezleri devre dışı bırakmak, web sitemizin bazı özelliklerinin çalışmamasına neden olabilir.
              </p>
            </div>

            <div className="legal-section">
              <h2>5. Üçüncü Taraf Çerezler</h2>
              <p>
                Web sitemizde üçüncü taraf servislerden kaynaklanan çerezler kullanılabilir. Bu çerezler, 
                örneğin Google Analytics, sosyal medya entegrasyonları veya haritalar gibi hizmetler için kullanılır.
              </p>
              <p>
                Bu üçüncü taraf çerezler, ilgili üçüncü tarafın gizlilik politikasına tabidir.
              </p>
            </div>

            <div className="legal-section">
              <h2>6. Çerezlerin Saklanma Süresi</h2>
              <p>
                Çerezlerin saklanma süreleri çerez türüne göre değişir:
              </p>
              <ul>
                <li><strong>Oturum çerezleri:</strong> Tarayıcı kapatıldığında otomatik olarak silinir</li>
                <li><strong>Kalıcı çerezler:</strong> Belirli bir süre boyunca tarayıcınızda kalır (örneğin 30 gün)</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2>7. Çerez Onayı</h2>
              <p>
                Web sitemizi ilk ziyaret ettiğinizde, çerez kullanımı hakkında sizi bilgilendiren bir bildirim 
                görürsünüz. Bu bildirimi kabul ederek, çerezlerin kullanılmasına izin vermiş olursunuz.
              </p>
              <p>
                Çerez tercihlerinizi istediğiniz zaman değiştirebilirsiniz.
              </p>
            </div>

            <div className="legal-section">
              <h2>8. Değişiklikler</h2>
              <p>
                Bu çerez politikası zaman zaman güncellenebilir. Önemli değişiklikler web sitemizde yayınlanacak 
                ve mümkün olduğunca tarafınıza bildirilecektir.
              </p>
            </div>

            <div className="legal-section">
              <h2>9. İletişim</h2>
              <p>
                Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <p>
                <strong>Yıldız Global Teknoloji ve Güvenlik Sistemleri Ltd. Şti.</strong><br />
                <strong>Marka:</strong> Yıldız Bilişim İletişim<br />
                <strong>E-posta:</strong> info@yildizbilisim.com<br />
                <strong>Telefon:</strong> +90 XXX XXX XX XX
              </p>
            </div>

            <div className="legal-footer">
              <p><strong>Son Güncelleme:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default CookiePolicyPage

