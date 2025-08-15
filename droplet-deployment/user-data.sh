#!/bin/bash
# Automated Rocket.Chat deployment script for EVERJUST
# This runs automatically when the Droplet is created

set -e

# Log all output
exec > >(tee /var/log/rocketchat-deploy.log)
exec 2>&1

echo "Starting Rocket.Chat deployment at $(date)"

# Update system
apt-get update && apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install required packages
apt-get install -y nginx certbot python3-certbot-nginx

# Create deployment directory
mkdir -p /opt/rocketchat
cd /opt/rocketchat

# Create docker-compose.yml
cat > docker-compose.yml << 'DOCKEREOF'
version: '3.8'

services:
  rocketchat:
    image: rocketchat/rocket.chat:6.3.8
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://mongo:27017/rocketchat?replicaSet=rs0
      MONGO_OPLOG_URL: mongodb://mongo:27017/local?replicaSet=rs0
      ROOT_URL: https://everjust.chat
      PORT: 3000
      DEPLOY_METHOD: docker
      NODE_ENV: production
      OVERWRITE_SETTING_Site_Name: EVERJUST Chat
      OVERWRITE_SETTING_Site_Url: https://everjust.chat
      OVERWRITE_SETTING_From_Email: noreply@everjust.com
    depends_on:
      - mongo
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:5.0
    restart: unless-stopped
    volumes:
      - ./data/db:/data/db
    command: mongod --oplogSize 128 --replSet rs0
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 40s

  mongo-init-replica:
    image: mongo:5.0
    depends_on:
      - mongo
    command: >
      bash -c "
        sleep 10 &&
        mongosh --host mongo:27017 --eval \"
          rsconf = {
            _id: 'rs0',
            members: [{_id: 0, host: 'mongo:27017'}]
          };
          rs.initiate(rsconf);
        \" &&
        echo 'Replica set initialized'
      "
DOCKEREOF

# Create basic Nginx config for HTTP
cat > /etc/nginx/sites-available/rocketchat << 'NGINXEOF'
server {
    listen 80;
    server_name everjust.chat;

    location /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Nginx-Proxy true;
        proxy_redirect off;
    }
}
NGINXEOF

# Enable site and remove default
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Create webroot for Let's Encrypt
mkdir -p /var/www/letsencrypt

# Restart Nginx
systemctl restart nginx

# Start Docker containers
docker-compose up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 60

# Get SSL certificate
certbot --nginx -d everjust.chat --non-interactive --agree-tos --email company@everjust.com --redirect || true

# Set up cron for SSL renewal
(crontab -l 2>/dev/null; echo "0 0,12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Create status file
echo "Deployment completed at $(date)" > /opt/rocketchat/deployment-status.txt

# Enable firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "Deployment complete!"
