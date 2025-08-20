#!/bin/bash

# Simplify Jitsi Homepage - Change Header and Remove Subtitle
# Update header from "Jitsi Meet" to "EVERJUST MEET" and remove secure meetings text

set -e

echo "🎨 Simplifying Jitsi homepage..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and update homepage
echo "🔄 Updating homepage header and removing subtitle..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "📝 Updating homepage header and content..."

# Update the welcome page content
docker exec $CONTAINER_NAME bash -c '
# First, let me check what files contain the welcome page content
echo "🔍 Looking for welcome page files..."

# Check for welcome page HTML files
find /usr/share/jitsi-meet -name "*.html" -exec grep -l "Jitsi Meet" {} \; 2>/dev/null || echo "No HTML files with Jitsi Meet found"

# Check for JavaScript files that might contain the welcome page text
find /usr/share/jitsi-meet -name "*.js" -exec grep -l "Jitsi Meet" {} \; 2>/dev/null | head -5

# Look for any config files
find /usr/share/jitsi-meet -name "*config*" -type f
'

# Update the main index.html title and any welcome text
docker exec $CONTAINER_NAME bash -c '
echo "📝 Updating main page title..."

# Update page title
sed -i "s/<title>.*<\/title>/<title>EVERJUST MEET<\/title>/g" /usr/share/jitsi-meet/index.html

# Update any Jitsi Meet references in the HTML
sed -i "s/Jitsi Meet/EVERJUST MEET/g" /usr/share/jitsi-meet/index.html

echo "✅ Updated main page title"
'

# Update interface config to change app name
docker exec $CONTAINER_NAME bash -c '
echo "⚙️  Updating interface configuration..."

# Update APP_NAME in interface_config.js
sed -i "s/APP_NAME: \".*\"/APP_NAME: \"EVERJUST MEET\"/g" /usr/share/jitsi-meet/interface_config.js

# Update NATIVE_APP_NAME
sed -i "s/NATIVE_APP_NAME: \".*\"/NATIVE_APP_NAME: \"EVERJUST MEET\"/g" /usr/share/jitsi-meet/interface_config.js

echo "✅ Updated interface configuration"
'

# Update config.js if it exists
docker exec $CONTAINER_NAME bash -c '
if [ -f "/usr/share/jitsi-meet/config.js" ]; then
    echo "⚙️  Updating config.js..."
    
    # Update any app name references in config.js
    sed -i "s/\"Jitsi Meet\"/\"EVERJUST MEET\"/g" /usr/share/jitsi-meet/config.js
    sed -i "s/Jitsi Meet/EVERJUST MEET/g" /usr/share/jitsi-meet/config.js
    
    echo "✅ Updated config.js"
else
    echo "ℹ️  No config.js found"
fi
'

# Add custom CSS to hide/modify welcome page elements
docker exec $CONTAINER_NAME bash -c '
echo "🎨 Adding custom CSS to simplify homepage..."

# Add custom CSS to hide subtitle and update header
cat >> /usr/share/jitsi-meet/css/all.css << "CSS_EOF"

/* EVERJUST Homepage Simplification */
.welcome .header .title {
    font-size: inherit !important;
}

/* Hide subtitle about secure meetings */
.welcome .header .subtitle,
.welcome .header .description,
.welcome-page-content .subtitle,
.welcome-page-content .description {
    display: none !important;
}

/* Ensure header shows EVERJUST MEET */
.welcome .header .title::after {
    content: "" !important;
}

/* Hide any promotional text */
.welcome .footer,
.welcome-footer,
.promotional-text {
    display: none !important;
}

/* Clean up spacing after removing subtitle */
.welcome .header {
    margin-bottom: 30px !important;
}

CSS_EOF

echo "✅ Added custom CSS for homepage simplification"
'

# Update meta tags
docker exec $CONTAINER_NAME bash -c '
echo "🏷️  Updating meta tags..."

# Update og:title
sed -i "s/og:title.*content=\".*\"/og:title\" content=\"EVERJUST MEET\"/g" /usr/share/jitsi-meet/index.html

# Update twitter:title
sed -i "s/twitter:title.*content=\".*\"/twitter:title\" content=\"EVERJUST MEET\"/g" /usr/share/jitsi-meet/index.html

# Update application-name
sed -i "s/application-name.*content=\".*\"/application-name\" content=\"EVERJUST MEET\"/g" /usr/share/jitsi-meet/index.html

# Update description to be simpler
sed -i "s/content=\"Join secure, high-quality video meetings with EVERJUST.*\"/content=\"Professional video meetings with EVERJUST.\"/g" /usr/share/jitsi-meet/index.html

# Update og:description
sed -i "s/og:description.*content=\".*EVERJUST.*\"/og:description\" content=\"Professional video meetings with EVERJUST.\"/g" /usr/share/jitsi-meet/index.html

echo "✅ Updated meta tags"
'

# Restart container to apply changes
echo "🔄 Restarting Jitsi web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

sleep 20

# Verify the changes
echo "📋 Verifying homepage simplification:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Page title:'
grep '<title>' /usr/share/jitsi-meet/index.html

echo ''
echo '✅ Interface config APP_NAME:'
grep 'APP_NAME' /usr/share/jitsi-meet/interface_config.js

echo ''
echo '✅ Meta tags:'
grep -E '(og:title|og:description)' /usr/share/jitsi-meet/index.html | head -2

echo ''
echo '✅ Custom CSS added:'
tail -10 /usr/share/jitsi-meet/css/all.css
"

echo ""
echo "🎉 Homepage simplification completed!"
echo ""
echo "📱 Homepage should now show:"
echo "- ✅ Header: 'EVERJUST MEET' (same size as before)"
echo "- ❌ Removed: 'Secure and high-quality meetings' subtitle"
echo "- ✅ Clean, simplified design"
echo "- ✅ Updated browser tab title"
echo ""
echo "🔗 Test: https://meet.everjust.com"
echo "💡 Hard refresh (Ctrl+F5) to see changes immediately"

EOF

echo "✅ Homepage simplification completed!"
echo ""
echo "🎯 Changes applied:"
echo "- ✅ Changed header from 'Jitsi Meet' to 'EVERJUST MEET'"
echo "- ❌ Removed subtitle about secure meetings"
echo "- ✅ Updated all meta tags and config files"
echo "- ✅ Added custom CSS to hide promotional text"
echo "- ✅ Simplified description in meta tags"
echo ""
echo "🔄 Visit https://meet.everjust.com to see the simplified homepage!"
