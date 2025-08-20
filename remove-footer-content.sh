#!/bin/bash

# Remove Footer Content - Keep Footer Box but Remove All Content
# Remove text and app store buttons while keeping the black footer container

set -e

echo "🧹 Removing footer content while keeping footer container..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and remove footer content
echo "🔄 Removing footer content on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

echo "🧹 Removing footer content while keeping footer box..."

# Add CSS to hide all footer content but keep the footer container
docker exec $CONTAINER_NAME bash -c '
echo "🎨 Adding CSS to hide footer content..."

# Add custom CSS to hide footer content
cat >> /usr/share/jitsi-meet/css/all.css << "CSS_EOF"

/* EVERJUST Footer Cleanup - Keep Footer Box, Remove Content */

/* Hide all footer text content */
.welcome .footer .footer-text,
.welcome .footer .footer-links,
.welcome .footer .footer-content,
.welcome .footer p,
.welcome .footer span,
.welcome .footer a {
    display: none !important;
}

/* Hide app store download buttons */
.welcome .footer .app-store-badges,
.welcome .footer .download-buttons,
.welcome .footer .mobile-download,
.welcome .footer .badge-link,
.welcome .footer .app-badge,
.welcome .footer .download-badge {
    display: none !important;
}

/* Hide any promotional content in footer */
.welcome .footer .promo-text,
.welcome .footer .promotional-content,
.welcome .footer .marketing-text {
    display: none !important;
}

/* Keep footer container but make it minimal */
.welcome .footer {
    min-height: 60px !important;
    padding: 20px !important;
    background: #000000 !important;
    border-top: 1px solid #333333 !important;
}

/* Hide any nested content containers */
.welcome .footer > div,
.welcome .footer > section,
.welcome .footer > article {
    display: none !important;
}

/* Hide F-Droid, Google Play, App Store buttons specifically */
.welcome .footer img[src*="fdroid"],
.welcome .footer img[src*="google-play"],
.welcome .footer img[src*="app-store"],
.welcome .footer img[src*="badge"] {
    display: none !important;
}

/* Hide any footer navigation or links */
.welcome .footer nav,
.welcome .footer ul,
.welcome .footer li {
    display: none !important;
}

/* Ensure footer stays at bottom but is clean */
.welcome .footer::after {
    content: "" !important;
    display: block !important;
    clear: both !important;
}

CSS_EOF

echo "✅ Added CSS to hide footer content"
'

# Also update interface config to disable footer elements
docker exec $CONTAINER_NAME bash -c '
echo "⚙️  Updating interface config to disable footer..."

# Disable welcome page footer
sed -i "s/DISPLAY_WELCOME_FOOTER: true/DISPLAY_WELCOME_FOOTER: false/g" /usr/share/jitsi-meet/interface_config.js

# Disable welcome page additional content
sed -i "s/DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false/DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false/g" /usr/share/jitsi-meet/interface_config.js
sed -i "s/DISPLAY_WELCOME_PAGE_CONTENT: false/DISPLAY_WELCOME_PAGE_CONTENT: false/g" /usr/share/jitsi-meet/interface_config.js
sed -i "s/DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false/DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false/g" /usr/share/jitsi-meet/interface_config.js

echo "✅ Updated interface config"
'

# Add more aggressive CSS to ensure all footer content is hidden
docker exec $CONTAINER_NAME bash -c '
echo "🎨 Adding more aggressive footer cleanup CSS..."

cat >> /usr/share/jitsi-meet/css/all.css << "CSS_EOF"

/* More Aggressive Footer Content Removal */

/* Hide everything inside footer except the container itself */
.welcome .footer * {
    display: none !important;
}

/* But keep the footer container visible */
.welcome .footer {
    display: block !important;
    visibility: visible !important;
}

/* Hide specific app download elements by common class names */
.app-store-link,
.google-play-link,
.f-droid-link,
.download-link,
.mobile-app-link,
.store-badge {
    display: none !important;
}

/* Hide any text nodes that might contain promotional content */
.footer-description,
.footer-subtitle,
.footer-tagline,
.download-text,
.mobile-text {
    display: none !important;
}

/* Ensure clean minimal footer appearance */
.welcome .footer {
    height: 60px !important;
    background-color: #000000 !important;
    border: none !important;
    margin: 0 !important;
}

CSS_EOF

echo "✅ Added aggressive footer cleanup CSS"
'

# Restart container to apply changes
echo "🔄 Restarting Jitsi web container..."
docker-compose -f jitsi-docker-compose.yml restart jitsi-web

sleep 20

# Verify the changes
echo "📋 Verifying footer content removal:"
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
docker exec $CONTAINER_NAME bash -c "
echo '✅ Interface config footer settings:'
grep -E 'DISPLAY_WELCOME_FOOTER' /usr/share/jitsi-meet/interface_config.js

echo ''
echo '✅ Custom CSS added (last 10 lines):'
tail -10 /usr/share/jitsi-meet/css/all.css
"

echo ""
echo "🎉 Footer content removal completed!"
echo ""
echo "📱 Footer should now show:"
echo "- ✅ Black footer box container (kept)"
echo "- ❌ All text content (removed)"
echo "- ❌ App Store buttons (removed)"
echo "- ❌ Google Play button (removed)"
echo "- ❌ F-Droid button (removed)"
echo "- ❌ Any promotional text (removed)"
echo ""
echo "🔗 Test: https://meet.everjust.com"
echo "💡 Hard refresh (Ctrl+F5) to see the clean footer"

EOF

echo "✅ Footer content removal completed!"
echo ""
echo "🎯 Changes applied:"
echo "- ✅ Kept black footer container box"
echo "- ❌ Removed all footer text content"
echo "- ❌ Removed App Store, Google Play, F-Droid buttons"
echo "- ❌ Removed promotional content"
echo "- ✅ Set DISPLAY_WELCOME_FOOTER: false"
echo "- ✅ Added aggressive CSS to hide all footer content"
echo ""
echo "🔄 Visit https://meet.everjust.com to see the clean minimal footer!"
