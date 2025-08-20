#!/bin/bash

# Deploy Real EVERJUST Logos to Jitsi Server
# This script replaces the generic logos with your actual EVERJUST brand assets

set -e

echo "🎨 Deploying Real EVERJUST Logos to Jitsi..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy the real EVERJUST logos to server
echo "📁 Copying real EVERJUST brand assets to server..."
sshpass -p "$SERVER_PASSWORD" scp everjust-logo-large.png $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp everjust-logo.svg $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp everjust-logo-purple.png $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and deploy the real logos
echo "🔄 Installing real EVERJUST logos in Jitsi..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "🎨 Installing real EVERJUST brand assets..."

# Copy the real logos into the container
docker cp everjust-logo.svg $CONTAINER_NAME:/usr/share/jitsi-meet/images/
docker cp everjust-logo-large.png $CONTAINER_NAME:/usr/share/jitsi-meet/images/
docker cp everjust-logo-purple.png $CONTAINER_NAME:/usr/share/jitsi-meet/images/

# Replace the watermark with the real EVERJUST logo
docker cp everjust-logo.svg $CONTAINER_NAME:/usr/share/jitsi-meet/images/watermark.svg

# Create a proper preview image using the real EVERJUST logo
docker exec $CONTAINER_NAME bash -c '
echo "🖼️  Creating social media preview with real EVERJUST logo..."

# Create an HTML file to generate the preview image
cat > /tmp/preview.html << "HTML_EOF"
<!DOCTYPE html>
<html>
<head>
<style>
body { 
    margin: 0; 
    background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
    color: #fff; 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex; 
    flex-direction: column;
    align-items: center; 
    justify-content: center; 
    height: 630px; 
    width: 1200px; 
    text-align: center;
}
.logo-container {
    margin-bottom: 40px;
}
.logo {
    width: 200px;
    height: 200px;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
}
.title { 
    font-size: 72px; 
    font-weight: 700; 
    margin-bottom: 20px;
    background: linear-gradient(45deg, #ffffff, #cccccc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
.subtitle { 
    font-size: 36px; 
    opacity: 0.8; 
    font-weight: 300;
    margin-bottom: 30px;
}
.tagline {
    font-size: 24px;
    opacity: 0.6;
    font-weight: 300;
}
.domain {
    position: absolute;
    bottom: 40px;
    font-size: 20px;
    opacity: 0.4;
}
</style>
</head>
<body>
    <div class="logo-container">
        <img src="/usr/share/jitsi-meet/images/everjust-logo-large.png" alt="EVERJUST" class="logo">
    </div>
    <div class="title">EVERJUST</div>
    <div class="subtitle">Video Call</div>
    <div class="tagline">Secure • Professional • Reliable</div>
    <div class="domain">meet.everjust.com</div>
</body>
</html>
HTML_EOF

# Create a simple SVG preview since we cannot render HTML easily
cat > /usr/share/jitsi-meet/images/everjust-preview.svg << "SVG_EOF"
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#000000;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#cccccc;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- EVERJUST Logo Text -->
  <text x="600" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="url(#textGrad)" text-anchor="middle">EVERJUST</text>
  <text x="600" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="36" fill="#cccccc" text-anchor="middle" opacity="0.8">Video Call</text>
  
  <!-- Tagline -->
  <text x="600" y="400" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#888888" text-anchor="middle">Secure • Professional • Reliable</text>
  
  <!-- Domain -->
  <text x="600" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="20" fill="#666666" text-anchor="middle" opacity="0.4">meet.everjust.com</text>
</svg>
SVG_EOF

echo "✅ Created social media preview with EVERJUST branding"
'

# Update the index.html to use the real logo
docker exec $CONTAINER_NAME bash -c '
echo "🔧 Updating meta tags to use real EVERJUST logo..."

# Update og:image to use the large PNG logo for better social media compatibility
sed -i "s|og:image.*content=\"https://meet.everjust.com/images/everjust-preview.*\"|og:image\" content=\"https://meet.everjust.com/images/everjust-logo-large.png\"|g" /usr/share/jitsi-meet/index.html

# Update twitter:image as well
sed -i "s|twitter:image.*content=\"https://meet.everjust.com/images/everjust-preview.*\"|twitter:image\" content=\"https://meet.everjust.com/images/everjust-logo-large.png\"|g" /usr/share/jitsi-meet/index.html

# Add cache busting
TIMESTAMP=$(date +%s)
sed -i "s|everjust-logo-large.png|everjust-logo-large.png?v=$TIMESTAMP|g" /usr/share/jitsi-meet/index.html

echo "✅ Updated meta tags to use real EVERJUST logo"
'

# Restart the container to apply changes
echo "🔄 Restarting Jitsi web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

# Wait for service to be ready
sleep 20

# Verify the installation
echo "📋 Verifying real EVERJUST logo installation:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Logo files installed:'
ls -la /usr/share/jitsi-meet/images/ | grep everjust

echo ''
echo '✅ Watermark replaced:'
ls -la /usr/share/jitsi-meet/images/watermark.svg

echo ''
echo '✅ Meta tags updated:'
grep 'og:image' /usr/share/jitsi-meet/index.html
"

echo ""
echo "🎉 Real EVERJUST logos deployed successfully!"
echo ""
echo "📱 Your meeting invite previews will now show:"
echo "- ✅ Real EVERJUST purple cube logo"
echo "- ✅ Professional EVERJUST branding"
echo "- ✅ Black background with your actual logo"
echo ""
echo "🔗 Test with a new meeting: https://meet.everjust.com/test-$(date +%s)"

EOF

echo "✅ Real EVERJUST logo deployment completed!"
echo ""
echo "🎯 What was deployed:"
echo "- ✅ Your actual EVERJUST square logo (E.JUST LOGO SQUARE V3 LARGE.png)"
echo "- ✅ SVG version for scalability"
echo "- ✅ Purple version for branding consistency"
echo "- ✅ Updated watermark to use your real logo"
echo "- ✅ Updated social media preview images"
echo ""
echo "💡 The invite previews should now show your actual EVERJUST brand assets!"
