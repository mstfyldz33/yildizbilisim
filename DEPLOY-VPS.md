# VPS’e deploy (yildizcloud.com)

Hostinger Node yerine **normal VPS + Nginx** ile statik site. Node çalıştırmaya gerek yok.

## 1. VPS’te hazırlık

- Ubuntu/Debian örnek:

```bash
sudo apt update && sudo apt install -y nginx
sudo mkdir -p /var/www/yildizcloud.com
sudo chown -R $USER:www-data /var/www/yildizcloud.com
```

- Domain’i VPS IP’sine yönlendir (A kaydı: `yildizcloud.com`, `www.yildizcloud.com` → VPS IP).
- SSL (Let’s Encrypt):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yildizcloud.com -d www.yildizcloud.com
```

## 2. Nginx config

Projedeki `nginx-yildizcloud.com.conf` dosyasını VPS’e kopyala:

```bash
sudo cp nginx-yildizcloud.com.conf /etc/nginx/sites-available/yildizcloud.com
sudo ln -sf /etc/nginx/sites-available/yildizcloud.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

SSL sertifikaları farklı yerdeyse config içindeki `ssl_certificate` / `ssl_certificate_key` satırlarını düzenle.

## 3. Deploy (yerelde)

`deploy.sh` içindeki değişkenleri düzenle:

- `VPS_USER`: SSH kullanıcı adın (örn. `root` veya `ubuntu`)
- `VPS_HOST`: VPS IP veya domain (örn. `123.45.67.89` veya `yildizcloud.com`)
- `VPS_PATH`: `/var/www/yildizcloud.com` (zaten doğru)

Sonra:

```bash
chmod +x deploy.sh
./deploy.sh
```

Script: `npm run build` → `dist/` içeriğini VPS’e rsync → izinler → Nginx reload.

## 4. Sonraki deploy’lar

Kod değişince sadece:

```bash
./deploy.sh
```

---

**Not:** Firebase env değişkenleri build sırasında koda gömülüyor. Yerelde `.env` dosyasında `VITE_FIREBASE_*` değerleri doğru olsun; `npm run build` bu ortamda çalıştığı için VPS’te env tanımlamana gerek yok.
