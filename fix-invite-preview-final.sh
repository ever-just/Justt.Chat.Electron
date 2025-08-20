#!/bin/bash

# Final Fix for Jitsi Invite Preview - Force Social Media Cache Refresh
# This script ensures the invite preview shows EVERJUST black/white branding

set -e

echo "🎨 Final Fix for Jitsi Invite Preview Branding..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and apply final fixes
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "🔧 Applying final invite preview fixes..."

# 1. Force cache busting by adding timestamp to ALL URLs
TIMESTAMP=$(date +%s)
docker exec $CONTAINER_NAME bash -c "
# Update og:url with timestamp for cache busting
sed -i 's|og:url.*content=\"https://meet.everjust.com.*\"|og:url\" content=\"https://meet.everjust.com?cache=$TIMESTAMP\"|g' /usr/share/jitsi-meet/index.html

# Add cache-busting to image URLs
sed -i 's|og:image.*content=\"https://meet.everjust.com/images/everjust-preview.svg\"|og:image\" content=\"https://meet.everjust.com/images/everjust-preview.svg?v=$TIMESTAMP\"|g' /usr/share/jitsi-meet/index.html
sed -i 's|twitter:image.*content=\"https://meet.everjust.com/images/everjust-preview.svg\"|twitter:image\" content=\"https://meet.everjust.com/images/everjust-preview.svg?v=$TIMESTAMP\"|g' /usr/share/jitsi-meet/index.html

# Force update all file timestamps
touch /usr/share/jitsi-meet/index.html
touch /usr/share/jitsi-meet/images/everjust-preview.svg
"

# 2. Restart the container to ensure changes take effect
echo "🔄 Restarting Jitsi web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

# Wait for service to be ready
sleep 20

# 3. Verify the final configuration
echo "📋 Final verification:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Theme Color:'
grep 'theme-color' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Open Graph Image:'
grep 'og:image' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Open Graph Title:'
grep 'og:title' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Preview image exists:'
ls -la /usr/share/jitsi-meet/images/everjust-preview.svg
"

echo ""
echo "🎉 Final invite preview fix completed!"
echo ""
echo "📱 To see the updated preview:"
echo "1. Clear your messaging app cache (WhatsApp, iMessage, etc.)"
echo "2. Wait 5-10 minutes for social media platforms to refresh"
echo "3. Try sharing a NEW meeting link"
echo "4. The preview should now show:"
echo "   - Black background instead of blue/teal"
echo "   - EVERJUST branding"
echo "   - Professional black/white theme"
echo ""
echo "🔗 Test with a fresh meeting: https://meet.everjust.com/test-$(date +%s)"

EOF

echo "✅ Final invite preview fix deployed!"
echo ""
echo "🎯 Key changes made:"
echo "- ✅ Theme color changed from #2A3A4B to #000000 (black)"
echo "- ✅ Created custom EVERJUST preview image with black background"
echo "- ✅ Added cache-busting parameters to force refresh"
echo "- ✅ Updated all Open Graph and Twitter meta tags"
echo ""
echo "💡 Social media platforms may take 5-10 minutes to refresh their cache."
echo "Try creating a new meeting room to test the updated preview!"
