#!/bin/bash
set -e

# Configuration (varsayılanlar; .env varsa oradan okunur)
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_HOST:-72.62.151.173}"
VPS_PATH="${VPS_PATH:-/var/www/yildizcloud.com}"

if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

echo "🚀 Starting deployment..."

# Step 1: Build
echo "📦 Building project..."
npm run build

# Step 2: Transfer files
echo "📤 Transferring files to VPS..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  dist/ \
  ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

# Step 3: Set permissions (VPS_PATH Plesk'ta httpdocs olabilir)
echo "🔐 Setting permissions..."
ssh ${VPS_USER}@${VPS_HOST} "sudo chown -R www-data:www-data ${VPS_PATH} && sudo find ${VPS_PATH} -type d -exec chmod 755 {} \; && sudo find ${VPS_PATH} -type f -exec chmod 644 {} \;"

# Step 4: Nginx reload (Plesk + Apache kullanıyorsanız bu adım atlanır)
echo "🔄 Reloading Nginx (skip if using Plesk Apache only)..."
ssh ${VPS_USER}@${VPS_HOST} "sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true"

echo "✅ Deployment complete!"
echo "🌐 Site: https://yildizcloud.com"
