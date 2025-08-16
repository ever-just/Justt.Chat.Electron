#!/bin/bash

# DigitalOcean Droplet Creation Script
# This script creates a new Rocket.Chat droplet with bypassed setup wizard

echo "=== EVERJUST CHAT DROPLET DEPLOYMENT ===="
echo ""
echo "🚀 CREATING DROPLET WITH:"
echo "✅ Name: everjust-chat-v2"
echo "✅ Size: 2 vCPUs, 4GB RAM"
echo "✅ Image: Ubuntu 22.04"
echo "✅ Region: NYC1"
echo "✅ Latest Rocket.Chat (7.x series)"
echo "✅ Pre-configured admin: admin / supersecret"
echo "✅ Setup wizard: COMPLETELY BYPASSED"
echo ""

# Check if doctl is authenticated
if ! doctl account get &>/dev/null; then
    echo "❌ doctl is not authenticated"
    echo ""
    echo "Please run: doctl auth init"
    echo "Then run this script again"
    exit 1
fi

echo "✅ doctl is authenticated"
echo ""

# Create the droplet with user data
echo "Creating droplet..."
doctl compute droplet create everjust-chat-v2 \
    --size s-2vcpu-4gb \
    --image ubuntu-22-04-x64 \
    --region nyc1 \
    --user-data-file <(cat << 'EOF'
#!/bin/bash

# Rocket.Chat Auto-Deploy with Bypassed Setup Wizard
set -e

# Update system
apt-get update -y
apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | bash
systemctl enable docker
systemctl start docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create deployment directory
mkdir -p /opt/rocketchat
cd /opt/rocketchat

# Create docker-compose.yml with environment variables to bypass setup
cat > docker-compose.yml << 'EOFDOCKER'
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
      # BYPASS SETUP WIZARD - OFFICIAL ROCKET.CHAT METHOD
      INITIAL_USER: "yes"
      ADMIN_USERNAME: "admin"
      ADMIN_NAME: "EVERJUST Admin"
      ADMIN_EMAIL: "admin@everjust.com"
      ADMIN_PASS: "supersecret"
      OVERWRITE_SETTING_Show_Setup_Wizard: "completed"
      # Additional settings
      OVERWRITE_SETTING_FileUpload_Storage_Type: FileSystem
      OVERWRITE_SETTING_FileUpload_FileSystemPath: /app/uploads
      NODE_ENV: production
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

  mongo:
    image: mongo:6.0
    restart: unless-stopped
    volumes:
      - ./data/db:/data/db
      - ./data/configdb:/data/configdb
    command: mongod --replSet rs0 --oplogSize 128 --bind_ip_all
    healthcheck:
      test: echo "try { rs.status() } catch (err) { printjson(err); quit(1) }" | mongosh mongo:27017 --quiet
      interval: 10s
      timeout: 10s
      retries: 5
    ports:
      - "27017:27017"
EOFDOCKER

# Start Docker Compose services
docker-compose up -d

# Wait for MongoDB to start
sleep 30

# Initialize MongoDB replica set
docker-compose exec -T mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [ { _id: 0, host: 'mongo:27017' } ] })" || true

# Wait for services to be ready
sleep 60

# Install Nginx for reverse proxy
apt-get install nginx -y

# Configure Nginx
cat > /etc/nginx/sites-available/rocketchat << 'EOFNGINX'
upstream rocketchat {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name everjust.chat;

    location / {
        proxy_pass http://rocketchat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 360s;
        proxy_send_timeout 360s;
    }
}
EOFNGINX

# Enable Nginx configuration
rm -f /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/rocketchat
nginx -t
systemctl restart nginx
systemctl enable nginx

# Install Certbot for SSL
apt-get install certbot python3-certbot-nginx -y

# Create a completion marker
echo "Rocket.Chat deployment completed at $(date)" > /opt/rocketchat/deployment-complete.log
echo "Admin credentials: admin / supersecret" >> /opt/rocketchat/deployment-complete.log
echo "Setup wizard: BYPASSED" >> /opt/rocketchat/deployment-complete.log

EOF
) \
    --tag-names everjust,rocketchat,production \
    --wait \
    --format "ID,Name,PublicIPv4,Status"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DROPLET CREATED SUCCESSFULLY!"
    echo ""
    echo "⏰ DEPLOYMENT TIME: 3-5 minutes"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Wait 3-5 minutes for automatic deployment"
    echo "2. Get the droplet IP from the output above"
    echo "3. Update DNS to point everjust.chat to the new IP"
    echo "4. Access http://[NEW-IP]:3000"
    echo "5. Login with: admin / supersecret"
    echo "6. Configure SSL with: certbot --nginx -d everjust.chat"
    echo ""
    echo "✅ NO SETUP WIZARD - READY TO USE!"
else
    echo "❌ DROPLET CREATION FAILED"
    echo "Please check your doctl authentication and try again"
fi