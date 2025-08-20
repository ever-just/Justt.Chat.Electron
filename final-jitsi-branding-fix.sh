#!/bin/bash

# Final Jitsi Branding Fix - Complete EVERJUST MEET Setup
# This script properly configures everything to show "EVERJUST MEET" and removes all unwanted content

set -e

echo "🎯 Final Jitsi Branding Fix - EVERJUST MEET..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy updated configuration files
echo "📁 Copying updated configuration files..."
sshpass -p "$SERVER_PASSWORD" scp droplet-deployment/jitsi-docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp custom-interface-config.js $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Deploy the final configuration
echo "🔄 Deploying final EVERJUST MEET configuration..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

echo "🧹 Cleaning configuration to force regeneration..."
rm -rf jitsi-config/

echo "▶️  Starting Jitsi with updated EVERJUST MEET configuration..."
docker-compose -f jitsi-docker-compose.yml up -d

echo "⏳ Waiting for services to start..."
sleep 45

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

# Apply custom interface config
echo "⚙️  Applying custom interface configuration..."
cp custom-interface-config.js jitsi-config/web/interface_config.js

# Create custom title and head files
echo "📝 Creating custom title and head files..."
echo "<title>MEET EVERJUST</title>" > jitsi-config/web/title.html
echo "<title>MEET EVERJUST</title>" > jitsi-config/web/head.html

# Update the main index.html directly
docker exec $CONTAINER_NAME bash -c '
echo "📝 Updating index.html directly..."

# Add title tag if not present
if ! grep -q "<title>" /usr/share/jitsi-meet/index.html; then
    sed -i "/<meta charset=\"utf-8\">/a\\    <title>MEET EVERJUST</title>" /usr/share/jitsi-meet/index.html
fi

# Replace any existing title
sed -i "s/<title>.*<\/title>/<title>MEET EVERJUST<\/title>/g" /usr/share/jitsi-meet/index.html

# Update all meta tags
sed -i "s/og:title.*content=\".*\"/og:title\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html
sed -i "s/twitter:title.*content=\".*\"/twitter:title\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html
sed -i "s/application-name.*content=\".*\"/application-name\" content=\"MEET EVERJUST\"/g" /usr/share/jitsi-meet/index.html

echo "✅ Updated index.html"
'

# Add comprehensive CSS to hide footer content and update header
docker exec $CONTAINER_NAME bash -c '
echo "🎨 Adding comprehensive CSS for EVERJUST MEET branding..."

cat >> /usr/share/jitsi-meet/css/all.css << "CSS_EOF"

/* EVERJUST MEET - Final Branding Override */

/* Force welcome page title */
.welcome .header .title,
.welcome-page .header .title,
.welcome-page-title,
.app-title {
    font-family: inherit !important;
}

.welcome .header .title::before {
    content: "EVERJUST MEET" !important;
    font-size: inherit !important;
    color: inherit !important;
}

.welcome .header .title {
    font-size: 0 !important;
}

/* Hide subtitle completely */
.welcome .header .subtitle,
.welcome .header .description,
.welcome-page .subtitle,
.welcome-page .description,
.welcome-page-subtitle {
    display: none !important;
    visibility: hidden !important;
}

/* Hide footer content but keep container */
.welcome .footer,
.welcome-footer {
    background: #000000 !important;
    min-height: 60px !important;
    padding: 20px !important;
}

.welcome .footer *,
.welcome-footer * {
    display: none !important;
}

.welcome .footer {
    display: block !important;
}

/* Hide app store badges specifically */
img[src*="app-store"],
img[src*="google-play"],
img[src*="f-droid"],
.app-store-badge,
.google-play-badge,
.f-droid-badge,
.download-badge {
    display: none !important;
}

/* Hide footer text */
.footer-text,
.mobile-download-text {
    display: none !important;
}

CSS_EOF

echo "✅ Added comprehensive EVERJUST MEET CSS"
'

# Restart the web container one more time
echo "🔄 Final restart of web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

sleep 20

# Final verification
echo "📋 Final verification:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Page title:'
grep '<title>' /usr/share/jitsi-meet/index.html || echo 'No title tag found'

echo ''
echo '✅ Interface config:'
grep 'APP_NAME' /usr/share/jitsi-meet/interface_config.js

echo ''
echo '✅ Service status:'
"
docker-compose -f jitsi-docker-compose.yml ps | grep jitsi-web

echo ""
echo "🎉 Final EVERJUST MEET branding completed!"
echo "📱 Homepage should now show 'EVERJUST MEET' with no subtitle"
echo "🔗 Test: https://meet.everjust.com"

EOF

echo "✅ Final Jitsi branding fix completed!"
echo ""
echo "🎯 What should now be live:"
echo "- ✅ Browser tab: 'MEET EVERJUST'"
echo "- ✅ Homepage header: 'EVERJUST MEET'"
echo "- ❌ Subtitle removed"
echo "- ✅ Empty black footer (no buttons)"
echo ""
echo "🔄 Hard refresh https://meet.everjust.com to see all changes!"
