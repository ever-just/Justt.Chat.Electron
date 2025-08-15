#!/bin/bash

# Rocket.Chat Deployment Script for DigitalOcean Droplet
# This script automates the deployment of Rocket.Chat using Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Rocket.Chat Deployment Script for DigitalOcean${NC}"
echo "==========================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt-get update && apt-get upgrade -y

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Installing Docker...${NC}"
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
else
    echo -e "${GREEN}Docker is already installed${NC}"
fi

# Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Install Nginx for reverse proxy
echo -e "${YELLOW}Installing Nginx...${NC}"
apt-get install -y nginx certbot python3-certbot-nginx

# Create Rocket.Chat directory
ROCKETCHAT_DIR="/opt/rocketchat"
echo -e "${YELLOW}Creating Rocket.Chat directory at ${ROCKETCHAT_DIR}...${NC}"
mkdir -p ${ROCKETCHAT_DIR}
cd ${ROCKETCHAT_DIR}

# Create docker-compose.yml
echo -e "${YELLOW}Creating docker-compose.yml...${NC}"
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  rocketchat:
    image: rocketchat/rocket.chat:latest
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://mongo:27017/rocketchat?replicaSet=rs0
      MONGO_OPLOG_URL: mongodb://mongo:27017/local?replicaSet=rs0
      ROOT_URL: https://everjust.chat
      PORT: 3000
      DEPLOY_METHOD: docker
      # Email settings (configure as needed)
      # MAIL_URL: smtp://smtp.email:587
    depends_on:
      - mongo
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:7.0
    restart: unless-stopped
    command: mongod --oplogSize 128 --replSet rs0 --storageEngine=wiredTiger
    volumes:
      - ./data/db:/data/db
      - ./data/dump:/dump
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 60s

  mongo-init-replica:
    image: mongo:7.0
    command: >
      bash -c "
        until mongosh --host mongo:27017 --eval 'print(\"waited for connection\")'; do
          echo 'Waiting for mongo to be available...'
          sleep 5
        done
        echo 'Connected to mongo, initiating replica set...'
        mongosh --host mongo:27017 --eval '
          rs.initiate({
            _id: \"rs0\",
            members: [{ _id: 0, host: \"mongo:27017\" }]
          })
        '
        echo 'Replica set initiated!'
      "
    depends_on:
      - mongo
EOF

# Create .env file for environment variables
echo -e "${YELLOW}Creating .env file...${NC}"
cat > .env << EOF
# Rocket.Chat Environment Variables
ROCKETCHAT_VERSION=latest
MONGO_VERSION=7.0
ROOT_URL=https://everjust.chat
EOF

# Create data directories
echo -e "${YELLOW}Creating data directories...${NC}"
mkdir -p uploads data/db data/dump

# Set proper permissions
chown -R 1000:1000 uploads
chown -R 999:999 data

# Start Rocket.Chat
echo -e "${YELLOW}Starting Rocket.Chat with Docker Compose...${NC}"
docker-compose up -d

# Wait for Rocket.Chat to be ready
echo -e "${YELLOW}Waiting for Rocket.Chat to initialize (this may take a few minutes)...${NC}"
sleep 30

# Check if services are running
echo -e "${YELLOW}Checking service status...${NC}"
docker-compose ps

# Create Nginx configuration
echo -e "${YELLOW}Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/rocketchat << 'EOF'
upstream rocketchat {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name everjust.chat;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name everjust.chat;

    # SSL configuration will be added by certbot

    # Rocket.Chat configuration
    location / {
        proxy_pass http://rocketchat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Nginx-Proxy true;
        proxy_redirect off;

        # WebSocket support
        proxy_read_timeout 86400;
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

echo -e "${GREEN}✅ Rocket.Chat deployment completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Point your domain (everjust.chat) to this server's IP address"
echo "2. Run: certbot --nginx -d everjust.chat"
echo "3. Access Rocket.Chat at https://everjust.chat"
echo ""
echo "To view logs: docker-compose -f ${ROCKETCHAT_DIR}/docker-compose.yml logs -f"
echo "To stop Rocket.Chat: docker-compose -f ${ROCKETCHAT_DIR}/docker-compose.yml down"
echo "To start Rocket.Chat: docker-compose -f ${ROCKETCHAT_DIR}/docker-compose.yml up -d"
