# Deploy sonrası site güncellenmiyorsa

## 1. Sunucuda (VPS) pull yaptınız mı?
- **Bilgisayarınızda** pull yapmak sadece kendi kopyanızı günceller.
- **Canlı site** sunucuda (Plesk/VPS) çalışıyor; güncelleme **sunucuda** yapılmalı.
- Plesk → Git → **Pull** veya SSH ile: `cd reponun-klasörü && git pull origin main`

## 2. Document root doğru mu?
- Plesk’te domain için **Document root**, repodaki **dist** klasörü olmalı.
- Örnek: repo `/var/www/yildizcloud.com` ise document root: `/var/www/yildizcloud.com/dist`
- Root’u reponun kendisine (dist olmadan) verdiyseniz, pull sonrası site değişmez; root = **dist** olmalı.

## 3. Tarayıcı / Service Worker önbelleği
- Site PWA için Service Worker kullanıyor; eski sürüm önbellekte kalabilir.
- **Cache sürümü v2’ye çıkarıldı** – bir sonraki deploy’dan sonra yeni ziyarette güncel sürüm yüklenecek.
- Hemen test için:
  - **Chrome:** Site ayarları → “Site verilerini sil” veya Gizli pencere.
  - **Mobil:** Ayarlar → Tarayıcı → Önbelleği temizle veya site verilerini sil.

## 4. Hızlı kontrol
- Sunucuda: `ls -la reponun-yolu/dist/index.html` → tarih en son commit tarihine yakın mı?
- Tarayıcıda: `https://yildizcloud.com/` → Sağ tık → “Öğeyi İncele” → Network → “Disable cache” işaretleyip sayfayı yenileyin; yeni JS/CSS dosyaları (farklı hash) yükleniyor mu?
