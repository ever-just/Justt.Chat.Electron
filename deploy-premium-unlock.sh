#!/bin/bash

# Deploy Premium Feature Unlock to EVERJUST Chat Server
# This script updates the running Rocket.Chat container with enterprise bypass settings

set -e

echo "🚀 Deploying Premium Feature Unlock to EVERJUST Chat Server..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Copy updated docker-compose.yml to server
echo "📁 Copying updated docker-compose.yml to server..."
sshpass -p "$SERVER_PASSWORD" scp droplet-deployment/docker-compose.yml $SERVER_USER@$SERVER_IP:/opt/rocketchat/

# Connect to server and restart services
echo "🔄 Restarting Rocket.Chat with new enterprise bypass settings..."
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

# Stop current services
echo "⏹️  Stopping current services..."
docker-compose down

# Start services with new configuration
echo "▶️  Starting services with enterprise bypass..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "✅ Checking service status..."
docker-compose ps

echo "🎉 Premium feature unlock deployment complete!"
echo "📱 Please refresh your browser and check the Layout settings again."
echo "🔗 Access your chat at: https://everjust.chat"
EOF

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Wait 1-2 minutes for the services to fully restart"
echo "2. Refresh your browser at https://everjust.chat"
echo "3. Go to Administration > Layout settings"
echo "4. The premium features should now be unlocked!"
