#!/bin/bash

# Complete Jitsi and Rocket.Chat Restart with Anonymous Access

set -e

echo "🚀 Complete system restart with Jitsi anonymous access..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

echo "🛑 Complete Docker cleanup..."
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose -f jitsi-docker-compose.yml down --remove-orphans 2>/dev/null || true
docker system prune -f
docker network prune -f

echo "📋 Checking Docker Compose files..."
ls -la *.yml

echo "▶️  Starting Rocket.Chat services..."
docker-compose up -d

echo "⏳ Waiting for Rocket.Chat to be ready..."
sleep 45

echo "▶️  Starting Jitsi services with anonymous access..."
docker-compose -f jitsi-docker-compose.yml up -d

echo "⏳ Waiting for Jitsi services to initialize..."
sleep 60

echo "✅ Service Status Check:"
echo "=== Rocket.Chat ==="
docker-compose ps

echo ""
echo "=== Jitsi Meet ==="
docker-compose -f jitsi-docker-compose.yml ps

echo ""
echo "=== All Running Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎉 All services should now be running!"
echo "🔗 Rocket.Chat: https://everjust.chat"
echo "🎥 Jitsi Meet: https://meet.everjust.com"
EOF

echo "✅ Complete restart finished!"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Wait 2-3 minutes for all services to fully initialize"
echo "2. Test Jitsi directly: https://meet.everjust.com"
echo "3. Test Rocket.Chat: https://everjust.chat"
echo "4. Try creating a video call from Rocket.Chat"
