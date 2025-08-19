#!/bin/bash

# Simple Fix for Jitsi Meta Tags - Use sed to modify specific lines
# This script uses sed to safely modify only the title and add meta tags

set -e

echo "🔧 Simple fix for Jitsi meta tags..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and modify meta tags with sed
echo "📝 Using sed to modify meta tags..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get the Jitsi web container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

# First, let's see what the current title looks like
echo "📋 Current title:"
docker exec $CONTAINER_NAME grep -n "<title>" /usr/share/jitsi-meet/index.html || echo "No title found"

# Change the title to EVERJUST Video Call
echo "🔄 Changing title..."
docker exec $CONTAINER_NAME sed -i 's/<title>.*<\/title>/<title>EVERJUST Video Call<\/title>/' /usr/share/jitsi-meet/index.html

# Add Open Graph meta tags after the viewport meta tag
echo "📝 Adding Open Graph meta tags..."
docker exec $CONTAINER_NAME sed -i '/<meta name="viewport"/a\
    <!-- EVERJUST Branding Meta Tags -->\
    <meta name="description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">\
    <meta name="application-name" content="EVERJUST Video Call">\
    <meta property="og:title" content="EVERJUST Video Call">\
    <meta property="og:description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">\
    <meta property="og:type" content="website">\
    <meta property="og:url" content="https://meet.everjust.com">\
    <meta property="og:image" content="https://meet.everjust.com/images/everjust-preview.png">\
    <meta property="og:site_name" content="EVERJUST">\
    <meta name="twitter:card" content="summary_large_image">\
    <meta name="twitter:title" content="EVERJUST Video Call">\
    <meta name="twitter:description" content="Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.">' /usr/share/jitsi-meet/index.html

# Verify the changes
echo "🔍 Verifying changes:"
docker exec $CONTAINER_NAME grep -A 3 -B 1 "EVERJUST" /usr/share/jitsi-meet/index.html | head -10

echo "✅ Meta tags updated successfully!"
echo "🔗 Test at: https://meet.everjust.com"

EOF

echo "✅ Simple meta tags fix completed!"
echo ""
echo "🎯 Changes made:"
echo "- ✅ Updated page title to 'EVERJUST Video Call'"
echo "- ✅ Added Open Graph meta tags for invite previews"
echo "- ✅ Preserved all Jitsi functionality"
echo ""
echo "🧪 Test the page now - it should work normally with custom invite previews!"
