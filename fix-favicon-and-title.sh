#!/bin/bash

# Fix Jitsi Favicon and Tab Title
# Update browser tab to show "MEET EVERJUST" with EVERJUST favicon

set -e

echo "🔧 Fixing Jitsi favicon and tab title..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy EVERJUST favicon assets to project
echo "📁 Copying EVERJUST favicon assets..."
cp "/Users/cloudaistudio/Documents/EVERJUST ASSETS/favicon.ico" ./everjust-favicon.ico
cp "/Users/cloudaistudio/Documents/EVERJUST ASSETS/favicon-16x16.png" ./everjust-favicon-16x16.png
cp "/Users/cloudaistudio/Documents/EVERJUST ASSETS/favicon-32x32.png" ./everjust-favicon-32x32.png

# Upload favicon assets to server
echo "📤 Uploading EVERJUST favicon assets to server..."
sshpass -p "$SERVER_PASSWORD" scp everjust-favicon.ico $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp everjust-favicon-16x16.png $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp everjust-favicon-32x32.png $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and update favicon and title
echo "🔄 Updating favicon and tab title on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "🎨 Installing EVERJUST favicon and updating title..."

# Copy favicon files into the container
docker cp everjust-favicon.ico $CONTAINER_NAME:/usr/share/jitsi-meet/favicon.ico
docker cp everjust-favicon-16x16.png $CONTAINER_NAME:/usr/share/jitsi-meet/images/favicon-16x16.png
docker cp everjust-favicon-32x32.png $CONTAINER_NAME:/usr/share/jitsi-meet/images/favicon-32x32.png

# Update the page title in index.html
docker exec $CONTAINER_NAME bash -c '
echo "📝 Updating page title to MEET EVERJUST..."

# Update the main title tag
sed -i "s/<title>.*<\/title>/<title>MEET EVERJUST<\/title>/g" /usr/share/jitsi-meet/index.html

# Update og:title meta tag
sed -i "s/og:title.*content=\".*\"/og:title\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html

# Update twitter:title meta tag
sed -i "s/twitter:title.*content=\".*\"/twitter:title\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html

# Update application-name meta tag
sed -i "s/application-name.*content=\".*\"/application-name\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html

echo "✅ Updated page title to MEET EVERJUST"
'

# Update favicon links in index.html
docker exec $CONTAINER_NAME bash -c '
echo "🔗 Updating favicon links..."

# Update favicon link tags to point to EVERJUST favicons
sed -i "s|favicon-16x16.png|favicon-16x16.png?v=$(date +%s)|g" /usr/share/jitsi-meet/index.html
sed -i "s|favicon-32x32.png|favicon-32x32.png?v=$(date +%s)|g" /usr/share/jitsi-meet/index.html

# Add main favicon link if not present
if ! grep -q "rel=\"icon\"" /usr/share/jitsi-meet/index.html; then
    sed -i "/<title>/a\\    <link rel=\"icon\" type=\"image/x-icon\" href=\"favicon.ico?v=$(date +%s)\">" /usr/share/jitsi-meet/index.html
fi

# Update apple-touch-icon
sed -i "s|apple-touch-icon.*href=\".*\"|apple-touch-icon\" href=\"images/favicon-32x32.png?v=$(date +%s)\"|g" /usr/share/jitsi-meet/index.html

echo "✅ Updated favicon links"
'

# Also update the interface config APP_NAME
docker exec $CONTAINER_NAME bash -c '
echo "⚙️  Updating interface config APP_NAME..."

# Update APP_NAME in interface_config.js
sed -i "s/APP_NAME: \".*\"/APP_NAME: \"MEET EVERJUST\"/g" /usr/share/jitsi-meet/interface_config.js

echo "✅ Updated interface config APP_NAME"
'

# Restart container to apply changes
echo "🔄 Restarting Jitsi web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

sleep 20

# Verify the changes
echo "📋 Verifying favicon and title updates:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Page title:'
grep '<title>' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Favicon files:'
ls -la /usr/share/jitsi-meet/favicon.ico
ls -la /usr/share/jitsi-meet/images/favicon-*.png

echo ''
echo '✅ Meta tags:'
grep -E '(og:title|twitter:title|application-name)' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Interface config:'
grep 'APP_NAME' /usr/share/jitsi-meet/interface_config.js
"

echo ""
echo "🎉 Favicon and title update completed!"
echo ""
echo "📱 Browser tab should now show:"
echo "- ✅ Title: 'MEET EVERJUST'"
echo "- ✅ EVERJUST favicon icon"
echo "- ✅ Updated meta tags for social sharing"
echo ""
echo "🔗 Test: https://meet.everjust.com/test-$(date +%s)"
echo "💡 You may need to hard refresh (Ctrl+F5) to see the new favicon"

EOF

echo "✅ Favicon and title fix completed!"
echo ""
echo "🎯 Changes applied:"
echo "- ✅ Updated page title to 'MEET EVERJUST'"
echo "- ✅ Replaced favicon with EVERJUST brand icon"
echo "- ✅ Updated all meta tags (og:title, twitter:title, etc.)"
echo "- ✅ Updated interface config APP_NAME"
echo "- ✅ Added cache busting to favicon links"
echo ""
echo "🔄 Hard refresh your browser to see the new favicon!"
