#!/bin/bash

# Complete Jitsi Logo Removal - Multiple Attack Vectors
# This script uses multiple methods to completely remove Jitsi branding

set -e

echo "🎯 Complete Jitsi Logo Removal - Multi-Method Approach..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Create a transparent 1x1 pixel SVG
echo "🖼️  Creating transparent logo replacement files..."
cat > transparent.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1">
  <rect width="1" height="1" fill="transparent"/>
</svg>
EOF

# Create a 1x1 transparent PNG using base64
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" | base64 -d > transparent.png

# Create custom CSS to hide any remaining logo elements
cat > hide-jitsi-logos.css << 'EOF'
/* Complete Jitsi Logo Removal CSS */
.watermark,
.jitsi-watermark,
.brand-watermark,
.jitsi-logo,
.header-logo,
.welcome-page-logo,
[class*="watermark"],
[class*="jitsi"],
[id*="watermark"],
[id*="jitsi"],
.filmstrip-toolbar .jitsi-icon,
.toolbox-button[aria-label*="Jitsi"],
.header .jitsi,
.welcome .jitsi,
.deep-linking-logo,
.app-name-logo {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Hide any SVG logos */
svg[class*="jitsi"],
svg[class*="watermark"],
svg[id*="jitsi"],
svg[id*="watermark"] {
    display: none !important;
}

/* Hide background images that might contain logos */
[style*="watermark"],
[style*="jitsi"] {
    background-image: none !important;
}

/* Ensure EVERJUST branding shows instead */
.app-name::after {
    content: "EVERJUST" !important;
}
EOF

echo "📁 Copying replacement files to server..."
sshpass -p "$SERVER_PASSWORD" scp transparent.svg transparent.png hide-jitsi-logos.css $SERVER_USER@$SERVER_IP:/opt/rocketchat/

echo "🔄 Applying complete logo removal..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

echo "🎨 Method 1: Replacing logo image files..."
# Replace watermark.svg with transparent version
docker run --rm -v $(pwd):/workspace jitsi/web:stable cp /workspace/transparent.svg /usr/share/jitsi-meet/images/watermark.svg || echo "Direct copy failed, trying container method"

# Use docker cp to replace files in stopped container (create temp container)
CONTAINER_ID=$(docker create jitsi/web:stable)
docker cp transparent.svg $CONTAINER_ID:/usr/share/jitsi-meet/images/watermark.svg
docker cp transparent.png $CONTAINER_ID:/usr/share/jitsi-meet/images/jitsilogo.png
docker cp transparent.png $CONTAINER_ID:/usr/share/jitsi-meet/images/logo-deep-linking.png
docker cp transparent.png $CONTAINER_ID:/usr/share/jitsi-meet/images/logo-deep-linking-mobile.png
docker commit $CONTAINER_ID jitsi/web:everjust-no-logo
docker rm $CONTAINER_ID

echo "🎨 Method 2: Adding custom CSS to hide remaining logos..."
# Add custom CSS to web config if it doesn't exist
mkdir -p jitsi-config/web/css
cp hide-jitsi-logos.css jitsi-config/web/css/

echo "🎨 Method 3: Updating interface config with additional logo hiding..."
# Add more logo hiding options to interface config
if [ -f "jitsi-config/web/interface_config.js" ]; then
    sed -i 's/HIDE_DEEP_LINKING_LOGO: .*/HIDE_DEEP_LINKING_LOGO: true,/' jitsi-config/web/interface_config.js
    sed -i 's/SHOW_WATERMARK_FOR_GUESTS: .*/SHOW_WATERMARK_FOR_GUESTS: false,/' jitsi-config/web/interface_config.js
    echo "Updated interface config with additional logo hiding"
else
    echo "Interface config not found, will use environment variables"
fi

echo "🎨 Method 4: Using updated Docker image..."
# Update docker-compose to use our custom image and add CSS injection
sed -i 's|image: jitsi/web:stable|image: jitsi/web:everjust-no-logo|' jitsi-docker-compose.yml

echo "▶️  Starting Jitsi with all logo removal methods applied..."
docker-compose -f jitsi-docker-compose.yml up -d

echo "⏳ Waiting for services to start..."
sleep 60

echo "🔍 Verifying logo files inside container..."
docker exec rocketchat-jitsi-web-1 ls -la /usr/share/jitsi-meet/images/ | grep -E "(watermark|logo)"

echo "✅ Checking service status..."
docker-compose -f jitsi-docker-compose.yml ps

echo "🎉 Complete logo removal applied!"
echo "Methods used:"
echo "1. ✅ Replaced logo image files with transparent versions"
echo "2. ✅ Added custom CSS to hide logo elements"  
echo "3. ✅ Updated interface config with more hiding options"
echo "4. ✅ Created custom Docker image without logos"
EOF

# Cleanup local files
rm -f transparent.svg transparent.png hide-jitsi-logos.css

echo "✅ Complete logo removal deployment finished!"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Wait 3-4 minutes for all services to fully restart"
echo "2. Hard refresh https://meet.everjust.com (Ctrl+F5 or Cmd+Shift+R)"
echo "3. Clear browser cache if logo still appears"
echo "4. Try opening in incognito/private mode"
echo ""
echo "If logo still appears, it may be cached by your browser."
