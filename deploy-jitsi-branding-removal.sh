#!/bin/bash

# Deploy Jitsi Branding Removal to EVERJUST Server
# This script removes Jitsi logos and applies EVERJUST branding

set -e

echo "🎨 Deploying Jitsi Branding Removal..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy updated jitsi-docker-compose.yml to server
echo "📁 Copying updated Jitsi branding configuration to server..."
sshpass -p "$SERVER_PASSWORD" scp droplet-deployment/jitsi-docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and restart Jitsi services
echo "🔄 Restarting Jitsi services with EVERJUST branding..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Stop Jitsi services
echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

# Remove Jitsi configuration to force regeneration with new branding
echo "🧹 Cleaning up old Jitsi configuration for rebranding..."
rm -rf jitsi-config/

# Start Jitsi services with new branding configuration
echo "▶️  Starting Jitsi with EVERJUST branding (no Jitsi logos)..."
docker-compose -f jitsi-docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for Jitsi services to start with new branding..."
sleep 60

# Check service status
echo "✅ Checking Jitsi service status..."
docker-compose -f jitsi-docker-compose.yml ps

echo "🎉 Jitsi branding removal deployment complete!"
echo "📱 Jitsi Meet should now show EVERJUST branding instead of Jitsi logos."
echo "🔗 Test at: https://meet.everjust.com"
EOF

echo "✅ Branding deployment completed successfully!"
echo ""
echo "Changes applied:"
echo "- ❌ Removed Jitsi watermark and logos"
echo "- ❌ Hidden brand watermarks for guests"
echo "- ✅ Set app name to 'EVERJUST Video Call'"
echo "- ✅ Set provider name to 'EVERJUST'"
echo "- ❌ Hidden 'Invite More' header"
echo ""
echo "Next steps:"
echo "1. Wait 2-3 minutes for Jitsi to fully restart"
echo "2. Test at https://meet.everjust.com"
echo "3. Verify Jitsi logo is removed from interface"
echo "4. Check that EVERJUST branding appears instead"
