#!/bin/bash

# Verify Jitsi Changes - Complete Check and Force Update
# This script verifies and forces all Jitsi customizations to take effect

set -e

echo "🔍 Verifying Jitsi EVERJUST Customizations..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and verify all changes
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "📋 Verification Report:"
echo "======================"

# 1. Check interface_config.js
echo "1. Interface Config:"
docker exec $CONTAINER_NAME grep "SHOW_JITSI_WATERMARK" /usr/share/jitsi-meet/interface_config.js
docker exec $CONTAINER_NAME grep "DEFAULT_BACKGROUND" /usr/share/jitsi-meet/interface_config.js
docker exec $CONTAINER_NAME grep "APP_NAME" /usr/share/jitsi-meet/interface_config.js

# 2. Check config.js exists
echo ""
echo "2. Config.js File:"
docker exec $CONTAINER_NAME ls -la /usr/share/jitsi-meet/config.js
docker exec $CONTAINER_NAME head -3 /usr/share/jitsi-meet/config.js

# 3. Check CSS customizations
echo ""
echo "3. CSS Customizations:"
docker exec $CONTAINER_NAME tail -5 /usr/share/jitsi-meet/css/all.css

# 4. Force refresh by updating file timestamps
echo ""
echo "4. 🔄 Force refresh by touching files..."
docker exec $CONTAINER_NAME touch /usr/share/jitsi-meet/index.html
docker exec $CONTAINER_NAME touch /usr/share/jitsi-meet/config.js
docker exec $CONTAINER_NAME touch /usr/share/jitsi-meet/interface_config.js
docker exec $CONTAINER_NAME touch /usr/share/jitsi-meet/css/all.css

# 5. Add cache-busting to index.html
echo "5. 🚫 Adding cache-busting to force reload..."
docker exec $CONTAINER_NAME sed -i 's/all\.css/all.css?v='$(date +%s)'/g' /usr/share/jitsi-meet/index.html
docker exec $CONTAINER_NAME sed -i 's/config\.js/config.js?v='$(date +%s)'/g' /usr/share/jitsi-meet/index.html
docker exec $CONTAINER_NAME sed -i 's/interface_config\.js/interface_config.js?v='$(date +%s)'/g' /usr/share/jitsi-meet/index.html

# 6. Test the page
echo ""
echo "6. 🧪 Testing page response:"
curl -s -I http://localhost:8000/ | head -3

echo ""
echo "✅ Verification complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Clear your browser cache completely (Ctrl+Shift+Delete)"
echo "2. Open an incognito/private browsing window"
echo "3. Visit https://meet.everjust.com"
echo "4. Hard refresh with Ctrl+F5 or Cmd+Shift+R"
echo ""
echo "If you still see the old design:"
echo "- Wait 2-3 minutes for CDN/proxy cache to clear"
echo "- Try a different browser"
echo "- Check browser developer tools for cached resources"

EOF

echo "✅ Verification script completed!"
echo ""
echo "🔗 Test URL: https://meet.everjust.com"
echo "💡 Remember to clear browser cache and try incognito mode!"
