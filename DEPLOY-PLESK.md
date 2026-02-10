# Plesk Panel’de Kurulum (yildizcloud.com)

Bu proje **statik SPA** (Vite + React). Node.js’i sunucuda çalıştırmanıza gerek yok; sadece `dist/` çıktısını web kök dizinine atmanız yeterli.

---

## Site çalışmıyor – Git’e deploy yeter mi?

**Hayır.** Sadece GitHub’a push yapmak siteyi çalıştırmaz. Sunucuda **kaynak kod (src/, index.html’deki /src/main.jsx)** değil, **derlenmiş site (dist/)** sunulmalı.

| Yöntem | Ne yaparsınız | Sunucuda Node gerekir mi? |
|--------|----------------|---------------------------|
| **C) Plesk Git otomatik** | Repo’da `dist/` var → Plesk çeker → Document root = **dist** | Hayır |
| **A) deploy.sh** | Yerelde build → rsync ile dist/ httpdocs’a at | Hayır |
| **B) Manuel** | Yerelde build → File Manager ile dist/ içeriğini yükle | Hayır |
| **D) Plesk’te build** | Repo çek → sunucuda npm run build → dist’i httpdocs’a kopyala | Evet |

**Plesk otomatik Git çekiyorsa:** Aşağıdaki **Yöntem C** ile repo yapısı buna göre ayarlandı; `dist/` repoda tutulur, Plesk’te sadece **Document root = dist** yapmanız yeterli.

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

### Yöntem C: Plesk Git otomatik çekiyor (önerilen – repo yapısı buna göre)

Repo’da **dist/** klasörü commit’te; Plesk her çektiğinde güncel build gelir. Sunucuda Node yok.

1. **Plesk** → **Websites & Domains** → **yildizcloud.com** → **Git** (veya “Deploy from Git”).
2. Repository: `https://github.com/mstfyldz33/yildizbilisim.git`, branch: `main`.
3. **Önemli:** **Document root**’u repo kökü değil, **dist** alt klasörü yapın:
   - **Hosting & DNS** → **Document root** alanına: `dist` yazın (veya tam path: `.../httpdocs/dist` — Plesk repo’yu nereye çekiyorsa, o path + `/dist`).
   - Örnek: Repo çekim yeri `httpdocs` ise, document root = `httpdocs/dist`. Bazı Plesk sürümlerinde “Document root” açılır menüden “dist” seçilir veya metin kutusuna `dist` yazılır.
4. Her güncellemede: yerelde `npm run build` → `git add dist` → `git commit -m "Build"` → `git push`; Plesk’te **Pull** / “Update” yapın.

Bu şekilde Plesk otomatik çekince site **dist/** üzerinden sunulur; beyaz sayfa ve MIME hatası olmaz.

---

### Yöntem A: deploy.sh ile (SSH + rsync)

VPS’e SSH erişiminiz varsa en pratik yol:

1. Proje kökünde `.env` oluşturun; **Firebase** ve **Plesk path** değerlerini girin:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VPS_USER=root
   VPS_HOST=72.62.151.173
   VPS_PATH=/var/www/vhosts/yildizcloud.com/httpdocs
   ```
2. Terminalde:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   Script `npm run build` alır, `dist/` içeriğini `VPS_PATH`’e rsync ile atar, izinleri düzenler. Plesk’te Nginx kullanmıyorsanız son uyarıyı yok sayabilirsiniz.

### Yöntem B: Plesk File Manager ile manuel

- **File Manager** → domain’in **httpdocs** (veya document root) klasörüne girin.
- Eski içeriği silin veya yedekleyin.
- Yereldeki `dist/` **içeriğini** (index.html, tüm .js/.css, favicon.svg, site.webmanifest, robots.txt, yildizlogo.jpg vb.) bu klasöre yükleyin. `dist` adında klasör oluşturmayın; dosyalar doğrudan httpdocs içinde olsun.

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
