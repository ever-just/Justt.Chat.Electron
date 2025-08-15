#!/bin/bash
# Simplified Rocket.Chat deployment script
set -e

# Log everything
exec > >(tee /var/log/rocketchat-deploy.log)
exec 2>&1

echo "Starting simplified Rocket.Chat deployment at $(date)"

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | bash

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Disable UFW temporarily to ensure connectivity
ufw disable

# Create directory
mkdir -p /opt/rocketchat
cd /opt/rocketchat

# Create simple docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3'

services:
  rocketchat:
    image: rocketchat/rocket.chat:6.3.8
    restart: always
    environment:
      - PORT=3000
      - ROOT_URL=http://159.89.189.121:3000
      - MONGO_URL=mongodb://mongo:27017/rocketchat?replicaSet=rs0
      - MONGO_OPLOG_URL=mongodb://mongo:27017/local?replicaSet=rs0
      - DEPLOY_METHOD=docker
    depends_on:
      - mongo
    ports:
      - 3000:3000

  mongo:
    image: mongo:5.0
    restart: always
    volumes:
      - ./data/db:/data/db
    command: mongod --oplogSize 128 --replSet rs0

  # Database replica set initialization
  mongo-init-replica:
    image: mongo:5.0
    command: >
      bash -c "
        sleep 5;
        mongosh --host mongo:27017 --eval \"
          rsconf = {
            _id: 'rs0',
            members: [{_id: 0, host: 'mongo:27017'}]
          };
          rs.initiate(rsconf);
        \";
      "
    depends_on:
      - mongo
EOF

# Start services
docker-compose up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Test if Rocket.Chat is responding
if curl -f http://localhost:3000/api/info; then
    echo "✅ Rocket.Chat is running successfully!"
else
    echo "⚠️ Rocket.Chat is not responding yet"
fi

echo "Deployment completed at $(date)"