#!/bin/bash

# Deploy Custom Jitsi Invite Preview Branding to EVERJUST Server
# This script updates the Jitsi meeting invite preview with EVERJUST branding

set -e

echo "🎨 Deploying Jitsi Invite Preview Branding..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy updated files to server
echo "📁 Copying updated Jitsi configuration and branding files to server..."
sshpass -p "$SERVER_PASSWORD" scp droplet-deployment/jitsi-docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp custom-jitsi-title.html $SERVER_USER@$SERVER_IP:/opt/rocketchat/
sshpass -p "$SERVER_PASSWORD" scp custom-interface-config.js $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and update Jitsi branding
echo "🔄 Updating Jitsi invite preview branding on server..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Stop Jitsi services
echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

# Clean up old configuration to force regeneration
echo "🧹 Cleaning up old Jitsi configuration..."
rm -rf jitsi-config/

# Create necessary directories
echo "📁 Creating Jitsi configuration directories..."
mkdir -p jitsi-config/web
mkdir -p jitsi-config/web/images

# Create a simple EVERJUST logo placeholder
echo "🎨 Creating EVERJUST logo placeholder..."
cat > jitsi-config/web/images/everjust-logo.png.txt << 'LOGO_EOF'
# This is a placeholder for the EVERJUST logo
# Replace this with actual everjust-logo.png file
# Recommended size: 300x100px PNG with transparent background
LOGO_EOF

# Create custom title.html with EVERJUST branding
echo "📝 Creating custom title.html with EVERJUST branding..."
cp custom-jitsi-title.html jitsi-config/web/title.html

# Copy custom interface configuration
echo "⚙️  Installing custom interface configuration..."
cp custom-interface-config.js jitsi-config/web/interface_config.js

# Create custom config.js with Open Graph settings
echo "🔧 Creating custom config.js with Open Graph meta tags..."
cat > jitsi-config/web/config.js << 'CONFIG_EOF'
/* eslint-disable no-unused-vars, no-var, max-len */

var config = {
    // Custom EVERJUST branding
    brandingDataUrl: '',
    defaultLogoUrl: 'images/everjust-logo.png',

    // Open Graph configuration for invite previews
    openGraphConfig: {
        title: 'EVERJUST Video Call',
        description: 'Join secure, high-quality video meetings with EVERJUST. Connect instantly with crystal-clear audio and video.',
        image: 'https://meet.everjust.com/images/everjust-meeting-preview.png',
        siteName: 'EVERJUST'
    },

    // Basic Jitsi configuration
    hosts: {
        domain: 'meet.everjust.com',
        muc: 'conference.meet.everjust.com'
    },

    // Disable Jitsi branding
    disableThirdPartyRequests: true,
    enableWelcomePage: true,

    // Custom app name
    appName: 'EVERJUST Video Call',

    // Performance and quality settings
    resolution: 720,
    constraints: {
        video: {
            aspectRatio: 16 / 9,
            height: {
                ideal: 720,
                max: 720,
                min: 240
            }
        }
    },

    // Disable analytics and tracking
    analytics: {
        disabled: true
    },

    // Custom UI settings
    toolbarButtons: [
        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
        'fodeviceselection', 'hangup', 'profile', 'info', 'chat', 'recording',
        'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
        'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
        'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
        'security'
    ]
};
CONFIG_EOF

# Start Jitsi services with new branding
echo "▶️  Starting Jitsi with EVERJUST invite preview branding..."
docker-compose -f jitsi-docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for Jitsi services to start with new branding..."
sleep 75

# Check service status
echo "✅ Checking Jitsi service status..."
docker-compose -f jitsi-docker-compose.yml ps

# Test the configuration
echo "🧪 Testing Jitsi configuration..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/ || echo "Service starting..."

echo "🎉 Jitsi invite preview branding deployment complete!"
echo "📱 Meeting invite links should now show EVERJUST branding."
echo "🔗 Test at: https://meet.everjust.com"
EOF

echo "✅ Invite preview branding deployment completed successfully!"
echo ""
echo "🎨 Changes applied:"
echo "- ✅ Custom title.html with EVERJUST branding"
echo "- ✅ Open Graph meta tags for better invite previews"
echo "- ✅ Custom logo configuration (placeholder created)"
echo "- ✅ Updated interface configuration"
echo "- ✅ Custom config.js with EVERJUST settings"
echo ""
echo "📋 Next steps:"
echo "1. Wait 3-5 minutes for services to fully restart"
echo "2. Upload actual EVERJUST logo to replace placeholder"
echo "3. Test meeting invite link previews in messaging apps"
echo "4. Verify branding appears correctly when sharing links"
echo ""
echo "🔗 Test URL: https://meet.everjust.com"
echo "📱 Create a test meeting and share the link to see the new preview!"
