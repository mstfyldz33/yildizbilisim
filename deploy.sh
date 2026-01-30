#!/bin/bash
set -e

# Configuration - UPDATE THESE VALUES
VPS_USER="your-username"
VPS_HOST="your-vps-ip-or-domain"
VPS_PATH="/var/www/yildizcloud.com"

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

# Step 3: Set permissions
echo "🔐 Setting permissions..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  sudo chown -R www-data:www-data /var/www/yildizcloud.com
  sudo find /var/www/yildizcloud.com -type d -exec chmod 755 {} \;
  sudo find /var/www/yildizcloud.com -type f -exec chmod 644 {} \;
EOF

# Step 4: Test and reload Nginx
echo "🔄 Reloading Nginx..."
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  sudo nginx -t && sudo systemctl reload nginx
EOF

echo "✅ Deployment complete!"
echo "🌐 Site: https://yildizcloud.com"
