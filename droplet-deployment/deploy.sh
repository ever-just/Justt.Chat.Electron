#!/bin/bash

# Rocket.Chat Deployment Script for DigitalOcean Droplet
# This script automates the deployment of Rocket.Chat using Docker Compose

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Rocket.Chat Deployment Script for EVERJUST${NC}"
echo "=============================================="

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
    curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo -e "${GREEN}Docker Compose is already installed${NC}"
fi

# Install Nginx
echo -e "${YELLOW}Installing Nginx...${NC}"
apt-get install -y nginx certbot python3-certbot-nginx

# Create deployment directory
echo -e "${YELLOW}Creating deployment directory...${NC}"
mkdir -p /opt/rocketchat
cd /opt/rocketchat

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
      # Uploads storage configuration
      OVERWRITE_SETTING_FileUpload_Storage_Type: FileSystem
      OVERWRITE_SETTING_FileUpload_FileSystemPath: /app/uploads
      # Performance settings
      NODE_ENV: production
      # Company branding
      OVERWRITE_SETTING_Site_Name: EVERJUST Chat
      OVERWRITE_SETTING_Site_Url: https://everjust.chat
      OVERWRITE_SETTING_From_Email: noreply@everjust.com
    depends_on:
      mongo:
        condition: service_healthy
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/info"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  mongo:
    image: mongo:5.0
    restart: unless-stopped
    volumes:
      - ./data/db:/data/db
      - ./data/configdb:/data/configdb
    command: mongod --oplogSize 128 --replSet rs0
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  # This container initializes the replica set
  mongo-init-replica:
    image: mongo:5.0
    depends_on:
      mongo:
        condition: service_healthy
    volumes:
      - ./scripts:/scripts
    command: >
      bash -c "
        mongosh --host mongo:27017 --eval \"
          rsconf = {
            _id: 'rs0',
            members: [
              {
                _id: 0,
                host: 'mongo:27017'
              }
            ]
          };
          rs.initiate(rsconf);
        \" &&
        echo 'Replica set initialized'
      "

volumes:
  mongodb_data:
  rocketchat_uploads:
EOF

# Create Nginx configuration
echo -e "${YELLOW}Creating Nginx configuration...${NC}"
cat > /etc/nginx/sites-available/rocketchat << 'EOF'
upstream rocketchat {
    server 127.0.0.1:3000;
}

# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name everjust.chat;

    # Let's Encrypt webroot verification
    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Server (will be activated after SSL cert is obtained)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name everjust.chat;

    # SSL certificates (will be configured by certbot)
    # ssl_certificate /etc/letsencrypt/live/everjust.chat/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/everjust.chat/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy configuration
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
echo -e "${YELLOW}Enabling Nginx site...${NC}"
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Create Let's Encrypt webroot directory
mkdir -p /var/www/letsencrypt

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx

# Start Docker Compose
echo -e "${YELLOW}Starting Rocket.Chat services...${NC}"
docker-compose pull
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 60

# Check if Rocket.Chat is responding
echo -e "${YELLOW}Checking Rocket.Chat status...${NC}"
if curl -f http://localhost:3000/api/info > /dev/null 2>&1; then
    echo -e "${GREEN}Rocket.Chat is running!${NC}"
else
    echo -e "${RED}Rocket.Chat is not responding yet. Please wait a few more minutes.${NC}"
fi

# Obtain SSL certificate
echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
certbot --nginx -d everjust.chat --non-interactive --agree-tos --email company@everjust.com --redirect

# Set up automatic SSL renewal
echo -e "${YELLOW}Setting up automatic SSL renewal...${NC}"
(crontab -l 2>/dev/null; echo "0 0,12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create backup script
echo -e "${YELLOW}Creating backup script...${NC}"
cat > /opt/rocketchat/backup.sh << 'BACKUP'
#!/bin/bash
# Backup script for Rocket.Chat

BACKUP_DIR="/opt/rocketchat/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec $(docker ps -qf "name=mongo") mongodump --out /dump
docker cp $(docker ps -qf "name=mongo"):/dump $BACKUP_DIR/mongo_$TIMESTAMP
docker exec $(docker ps -qf "name=mongo") rm -rf /dump

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$TIMESTAMP.tar.gz -C /opt/rocketchat uploads/

# Keep only last 7 days of backups
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
BACKUP

chmod +x /opt/rocketchat/backup.sh

# Add backup to cron
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/rocketchat/backup.sh >> /opt/rocketchat/backup.log 2>&1") | crontab -

# Set up monitoring alert
echo -e "${YELLOW}Setting up monitoring...${NC}"
cat > /opt/rocketchat/monitor.sh << 'MONITOR'
#!/bin/bash
# Simple monitoring script for Rocket.Chat

if ! curl -sf http://localhost:3000/api/info > /dev/null; then
    echo "Rocket.Chat is down! Attempting restart..."
    cd /opt/rocketchat && docker-compose restart rocketchat
fi
MONITOR

chmod +x /opt/rocketchat/monitor.sh

# Add monitoring to cron (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/rocketchat/monitor.sh >> /opt/rocketchat/monitor.log 2>&1") | crontab -

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 Rocket.Chat URL: ${GREEN}https://everjust.chat${NC}"
echo -e "📁 Installation directory: ${GREEN}/opt/rocketchat${NC}"
echo -e "📊 Logs: ${GREEN}docker-compose logs -f${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit https://everjust.chat to complete setup"
echo "2. Create your admin account"
echo "3. Configure your workspace settings"
echo ""
echo -e "${GREEN}Automatic features enabled:${NC}"
echo "✅ SSL certificate renewal (daily check)"
echo "✅ Daily backups at 2 AM (kept for 7 days)"
echo "✅ Health monitoring every 5 minutes"
echo "✅ Auto-restart on failure"
