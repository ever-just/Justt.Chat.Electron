#!/bin/bash

# Fix Jitsi Port Conflict and Complete Anonymous Access Setup

set -e

echo "🔧 Fixing Jitsi port conflict and completing setup..."

# Server details
SERVER_IP="159.65.185.227"
SERVER_USER="root"
SERVER_PASSWORD="Weldon@80K"

# Connect to server and fix the port conflict
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/rocketchat

echo "🔍 Checking what's using port 8000..."
netstat -tulpn | grep :8000 || echo "Port 8000 not found in netstat"
lsof -i :8000 || echo "Port 8000 not found in lsof"

echo "🛑 Stopping all Docker containers to clear port conflicts..."
docker stop $(docker ps -q) 2>/dev/null || echo "No containers to stop"

echo "🧹 Cleaning up Docker networks..."
docker network prune -f

echo "▶️  Starting Rocket.Chat first..."
docker-compose up -d

echo "⏳ Waiting for Rocket.Chat to fully start..."
sleep 30

echo "▶️  Now starting Jitsi services..."
docker-compose -f jitsi-docker-compose.yml up -d

echo "⏳ Waiting for all services to initialize..."
sleep 60

echo "✅ Final service status check..."
echo "=== Rocket.Chat Services ==="
docker-compose ps

echo ""
echo "=== Jitsi Services ==="
docker-compose -f jitsi-docker-compose.yml ps

echo ""
echo "=== Port Usage ==="
netstat -tulpn | grep -E ':(3000|8000|8443|10000|4443)' || echo "No services found on expected ports"

echo "🎉 Jitsi anonymous access setup completed!"
EOF

echo "✅ Port conflict resolution completed!"
echo ""
echo "🧪 Test Instructions:"
echo "1. Visit https://meet.everjust.com directly"
echo "2. Try to create a room - should work without authentication"
echo "3. Test video calls from Rocket.Chat at https://everjust.chat"
