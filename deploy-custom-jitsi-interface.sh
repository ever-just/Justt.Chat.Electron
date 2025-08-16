#!/bin/bash

# Deploy Custom Jitsi Interface Configuration to Remove Logo
# This script replaces the default interface_config.js with our custom EVERJUST version

set -e

echo "🎨 Deploying Custom Jitsi Interface Configuration..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy custom interface config to server
echo "📁 Copying custom interface_config.js to server..."
sshpass -p "$SERVER_PASSWORD" scp custom-interface-config.js $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and replace the interface config
echo "🔄 Replacing Jitsi interface configuration..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Stop Jitsi services
echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

# Backup original interface config
echo "💾 Backing up original interface config..."
cp jitsi-config/web/interface_config.js jitsi-config/web/interface_config.js.backup 2>/dev/null || echo "No existing config to backup"

# Replace with our custom interface config
echo "🔄 Installing custom EVERJUST interface configuration..."
cp custom-interface-config.js jitsi-config/web/interface_config.js

# Verify the replacement
echo "✅ Verifying custom configuration..."
grep -E "SHOW_JITSI_WATERMARK|APP_NAME|PROVIDER_NAME" jitsi-config/web/interface_config.js

# Start Jitsi services
echo "▶️  Starting Jitsi with custom interface configuration..."
docker-compose -f jitsi-docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for Jitsi services to start..."
sleep 45

# Check service status
echo "✅ Checking Jitsi service status..."
docker-compose -f jitsi-docker-compose.yml ps

echo "🎉 Custom Jitsi interface deployment complete!"
echo "📱 Jitsi logo should now be completely removed."
echo "🔗 Test at: https://meet.everjust.com"
EOF

echo "✅ Custom interface deployment completed successfully!"
echo ""
echo "Key changes applied:"
echo "- ❌ SHOW_JITSI_WATERMARK: false (was true)"
echo "- ❌ JITSI_WATERMARK_LINK: '' (was https://jitsi.org)"
echo "- ✅ APP_NAME: 'EVERJUST Video Call' (was Jitsi Meet)"
echo "- ✅ PROVIDER_NAME: 'EVERJUST' (was Jitsi)"
echo "- ❌ MOBILE_APP_PROMO: false (disable Jitsi app promotion)"
echo ""
echo "🧪 Test Instructions:"
echo "1. Wait 2-3 minutes for services to fully restart"
echo "2. Visit https://meet.everjust.com"
echo "3. Verify NO Jitsi logo appears anywhere"
echo "4. Check that EVERJUST branding is shown instead"
