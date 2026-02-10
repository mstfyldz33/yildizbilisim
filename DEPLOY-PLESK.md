# Plesk Panel’de Kurulum (yildizcloud.com)

Bu proje **statik SPA** (Vite + React). Node.js’i sunucuda çalıştırmanıza gerek yok; sadece `dist/` çıktısını web kök dizinine atmanız yeterli.

---

## ⚠️ Önemli: Beyaz sayfa / MIME type hatası alıyorsanız

**Yanlış:** Repo kökünü (veya `src/`, `public/` içeren tüm projeyi) document root’a yüklemek.  
→ Tarayıcı `/src/main.jsx` ister, sunucu doğru sunmaz → **beyaz sayfa** ve *"Expected a JavaScript module but MIME type..."* hatası.

**Doğru:** Yerelde `npm run build` alıp, oluşan **`dist/` klasörünün içeriğini** (index.html, assets/, favicon.svg, site.webmanifest vb.) document root’a yüklemek.  
→ Build’deki index.html derlenmiş JS’e bağlanır, site çalışır.

## 1. Yerelde build

```bash
npm install
# .env dosyasında VITE_FIREBASE_* değerlerini doldurun
npm run build
```

`dist/` klasörü oluşur. Bu klasörün **içeriğini** (içindeki tüm dosyalar) Plesk’e yükleyeceksiniz.

## 2. Plesk’te domain ayarı

- **Websites & Domains** → ilgili domain (örn. yildizcloud.com) → **Hosting & DNS**.
- **Document root** genelde şöyledir:
  - `httpdocs` (veya `public_html`)
- Bu dizin = sitenin kökü. `dist/` içeriğini buraya atacaksınız (yani `index.html`, `assets/` vb. doğrudan document root’ta olacak).

## 3. Dosyaları yükleme

- **File Manager** ile `httpdocs` (veya sizin document root) içine:
  - Önce eski içeriği silin veya yedekleyin.
  - `dist/` içindeki **tüm dosya ve klasörleri** (index.html, assets/, favicon.svg, robots.txt, sitemap.xml vb.) yükleyin.
- Veya **Git** eklentisi varsa: repo’yu clone edip sunucuda `npm run build` çalıştırıp `dist/` içeriğini document root’a kopyalayın.

## 4. SPA yönlendirme (önemli)

React Router tek sayfa uygulama kullandığı için `/about`, `/services` gibi adresler doğrudan açıldığında sunucu `index.html` döndürmeli.

- **Apache** (Plesk’te sık kullanılır): Projedeki `public/.htaccess` build sırasında `dist/` içine kopyalanır. İçinde SPA fallback kuralı var; **AllowOverride** açıksa sorun yaşamazsınız. (Plesk genelde açıktır.)
- **Nginx** kullanıyorsanız: Plesk → Domain → **Apache & nginx Settings** → **Additional nginx directives** alanına şunu ekleyin:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Bunu eklemezseniz doğrudan `/about` vb. açıldığında 404 alırsınız; ekledikten sonra sorun kalkar.

## 5. SSL

- Plesk → **SSL/TLS Certificates** → **Let’s Encrypt** ile ücretsiz sertifika alın.
- “Secure the mail” vb. seçenekleri ihtiyaca göre bırakın; domain’in HTTPS ile açılması yeterli.

## 6. Özet kontrol

| Konu | Yapılacak |
|------|------------|
| Build | Yerelde `npm run build`, `dist/` içeriği Plesk document root’a |
| Node | Sunucuda Node çalıştırmaya gerek yok |
| SPA | Apache: `.htaccess` (projede var). Nginx: `try_files $uri $uri/ /index.html;` |
| SSL | Plesk Let’s Encrypt |
| Firebase | `.env` sadece build anında kullanılır; sunucuda .env tutmanız gerekmez |

Bu adımlarla Plesk’te kurulumda sorun yaşamamanız gerekir. Sorun olursa 404 alan URL’yi ve Apache mi Nginx mi kullandığınızı not edin.
