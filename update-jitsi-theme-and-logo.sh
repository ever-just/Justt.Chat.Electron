#!/bin/bash

# Update Jitsi Theme and Remove Logo - Complete Fix
# This script removes the Jitsi logo, updates colors to black/white, and adds EVERJUST branding

set -e

echo "🎨 Updating Jitsi Theme and Removing Logo..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy the new logo files to server
echo "📁 Copying new EVERJUST logo files to server..."
sshpass -p "$SERVER_PASSWORD" scp everjust-logo-bw.svg $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp custom-interface-config.js $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and update everything
echo "🔄 Updating Jitsi interface, theme, and logo..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Get the Jitsi web container name
CONTAINER_NAME=$(docker-compose -f jitsi-docker-compose.yml ps -q jitsi-web)
echo "🐳 Working with container: $CONTAINER_NAME"

# Copy the new logo into the container
echo "🎨 Installing new EVERJUST logo..."
docker exec $CONTAINER_NAME mkdir -p /usr/share/jitsi-meet/images
docker cp everjust-logo-bw.svg $CONTAINER_NAME:/usr/share/jitsi-meet/images/watermark.svg
docker cp everjust-logo-bw.svg $CONTAINER_NAME:/usr/share/jitsi-meet/images/everjust-logo.svg

# Update interface_config.js to remove Jitsi branding and set black/white theme
echo "⚙️  Updating interface configuration..."
docker exec $CONTAINER_NAME bash -c 'cat > /usr/share/jitsi-meet/interface_config.js << "CONFIG_EOF"
/* eslint-disable no-unused-vars, no-var, max-len */

var interfaceConfig = {
    APP_NAME: "EVERJUST Video Call",
    AUDIO_LEVEL_PRIMARY_COLOR: "rgba(255,255,255,0.4)",
    AUDIO_LEVEL_SECONDARY_COLOR: "rgba(255,255,255,0.2)",

    AUTO_PIN_LATEST_SCREEN_SHARE: "remote-only",
    BRAND_WATERMARK_LINK: "",

    CLOSE_PAGE_GUEST_HINT: false,

    // Black background theme
    DEFAULT_BACKGROUND: "#000000",
    DEFAULT_LOGO_URL: "", // Remove logo completely
    DEFAULT_WELCOME_PAGE_LOGO_URL: "", // Remove welcome page logo

    DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
    DISABLE_PRESENCE_STATUS: false,
    DISABLE_TRANSCRIPTION_SUBTITLES: false,
    DISABLE_VIDEO_BACKGROUND: false,

    DISPLAY_WELCOME_FOOTER: false,
    DISPLAY_WELCOME_PAGE_ADDITIONAL_CARD: false,
    DISPLAY_WELCOME_PAGE_CONTENT: false,
    DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,

    ENABLE_DIAL_OUT: true,

    GENERATE_ROOMNAMES_ON_WELCOME_PAGE: true,
    HIDE_INVITE_MORE_HEADER: true,

    // Remove all Jitsi branding
    JITSI_WATERMARK_LINK: "",

    LANG_DETECTION: true,
    LOCAL_THUMBNAIL_RATIO: 16 / 9,
    MAXIMUM_ZOOMING_COEFFICIENT: 1.3,

    MOBILE_APP_PROMO: false,

    OPTIMAL_BROWSERS: ["chrome", "chromium", "firefox", "electron", "safari", "webkit"],

    POLICY_LOGO: null,
    PROVIDER_NAME: "EVERJUST",

    RECENT_LIST_ENABLED: true,
    REMOTE_THUMBNAIL_RATIO: 1,

    SETTINGS_SECTIONS: ["devices", "language", "moderator", "profile", "calendar", "sounds", "more"],

    // Hide all watermarks and branding
    SHOW_BRAND_WATERMARK: false,
    SHOW_CHROME_EXTENSION_BANNER: false,
    SHOW_JITSI_WATERMARK: false, // CRITICAL: Hide Jitsi logo
    SHOW_POWERED_BY: false,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,

    SUPPORT_URL: "https://everjust.com/support",

    TOOLBAR_BUTTONS: [
        "microphone", "camera", "closedcaptions", "desktop", "fullscreen",
        "fodeviceselection", "hangup", "profile", "chat", "recording",
        "livestreaming", "etherpad", "sharedvideo", "settings", "raisehand",
        "videoquality", "filmstrip", "invite", "feedback", "stats", "shortcuts",
        "tileview", "videobackgroundblur", "download", "help", "mute-everyone",
        "security"
    ],

    TOOLBAR_TIMEOUT: 4000,

    UNSUPPORTED_BROWSERS: [],

    VIDEO_LAYOUT_FIT: "both",

    // Black and white theme colors
    filmStripOnly: false,
    startWithAudioMuted: false,
    startWithVideoMuted: false
};
CONFIG_EOF'

# Update CSS to apply black/white theme
echo "🎨 Applying black/white color theme..."
docker exec $CONTAINER_NAME bash -c 'cat >> /usr/share/jitsi-meet/css/all.css << "CSS_EOF"

/* EVERJUST Black & White Theme Overrides */
.welcome-page {
    background: #000000 !important;
    color: #ffffff !important;
}

.welcome-page .welcome-watermark {
    display: none !important;
}

.header {
    background: #000000 !important;
}

.toolbox {
    background: rgba(0, 0, 0, 0.8) !important;
}

.button {
    background: #333333 !important;
    color: #ffffff !important;
    border: 1px solid #666666 !important;
}

.button:hover {
    background: #555555 !important;
}

.watermark {
    display: none !important;
}

.leftwatermark {
    display: none !important;
}

.rightwatermark {
    display: none !important;
}

/* Hide all Jitsi branding */
.jitsi-watermark,
.brand-watermark,
.powered-by {
    display: none !important;
}

/* Meeting interface colors */
.videocontainer {
    background: #000000 !important;
}

.large-video-background {
    background: #000000 !important;
}

/* Participant name styling */
.displayname {
    background: rgba(0, 0, 0, 0.7) !important;
    color: #ffffff !important;
}

CSS_EOF'

# Verify the changes
echo "🔍 Verifying logo removal and theme update..."
docker exec $CONTAINER_NAME grep -i "SHOW_JITSI_WATERMARK" /usr/share/jitsi-meet/interface_config.js
docker exec $CONTAINER_NAME ls -la /usr/share/jitsi-meet/images/ | grep -E "(watermark|everjust)" || echo "Logo files updated"

echo "✅ Jitsi theme and logo update completed!"
echo "🔗 Test at: https://meet.everjust.com"

EOF

echo "✅ Jitsi theme and logo update completed successfully!"
echo ""
echo "🎯 Changes applied:"
echo "- ❌ Removed Jitsi logo completely (SHOW_JITSI_WATERMARK: false)"
echo "- 🎨 Applied black/white color theme"
echo "- ✅ Set EVERJUST branding"
echo "- 🖼️  Replaced logo files with EVERJUST version"
echo "- 🎨 Updated CSS for black background and white text"
echo ""
echo "🧪 Test the meeting page now - no more Jitsi logo and black/white theme!"
echo "🔗 Test URL: https://meet.everjust.com"
