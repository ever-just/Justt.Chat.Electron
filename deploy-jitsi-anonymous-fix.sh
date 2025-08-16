#!/bin/bash

# Deploy Jitsi Anonymous Access Fix to EVERJUST Server
# This script updates the Jitsi configuration to enable anonymous access

set -e

echo "🎥 Deploying Jitsi Anonymous Access Fix..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy updated jitsi-docker-compose.yml to server
echo "📁 Copying updated Jitsi configuration to server..."
sshpass -p "$SERVER_PASSWORD" scp droplet-deployment/jitsi-docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and restart Jitsi services
echo "🔄 Restarting Jitsi services with anonymous access..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Stop current Jitsi services
echo "⏹️  Stopping Jitsi services..."
docker-compose -f jitsi-docker-compose.yml down

# Remove any existing Jitsi configuration to force regeneration
echo "🧹 Cleaning up old Jitsi configuration..."
rm -rf jitsi-config/

# Start Jitsi services with new anonymous configuration
echo "▶️  Starting Jitsi with anonymous access..."
docker-compose -f jitsi-docker-compose.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for Jitsi services to start..."
sleep 45

# Check service status
echo "✅ Checking Jitsi service status..."
docker-compose -f jitsi-docker-compose.yml ps

echo "🎉 Jitsi anonymous access fix deployment complete!"
echo "📱 Jitsi Meet should now allow anonymous access without authentication."
echo "🔗 Test at: https://meet.everjust.com"
EOF

echo "✅ Jitsi deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Wait 2-3 minutes for all Jitsi services to fully initialize"
echo "2. Test direct access to https://meet.everjust.com"
echo "3. Try creating a video call from Rocket.Chat"
echo "4. Verify no authentication prompt appears"
