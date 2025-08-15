# Quick Deploy Guide - Rocket.Chat on DigitalOcean Droplet

## 🚀 5-Minute Deployment

### 1. Create Droplet

1. Go to [DigitalOcean](https://cloud.digitalocean.com/droplets/new)
2. Select:
   - Ubuntu 22.04 LTS
   - Basic Plan → Regular Intel
   - $12/month (2GB RAM, 2 vCPUs)
   - Choose nearest datacenter
   - SSH key or password
   - Hostname: `rocketchat-everjust`

### 2. Configure DNS

In GoDaddy (or your DNS provider):
```
Type: A
Name: chat
Value: [Your-Droplet-IP]
TTL: 600
```

### 3. Deploy Rocket.Chat

SSH into your droplet:
```bash
ssh root@[Your-Droplet-IP]
```

Run these commands:
```bash
# Download and run deployment script
curl -o deploy.sh https://raw.githubusercontent.com/EVERJUST/deployment-scripts/main/rocketchat/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

Or manually:
```bash
# Install Docker
curl -fsSL https://get.docker.com | bash

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create directory
mkdir -p /opt/rocketchat && cd /opt/rocketchat

# Create docker-compose.yml
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
    depends_on:
      - mongo
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads

  mongo:
    image: mongo:7.0
    restart: unless-stopped
    command: mongod --oplogSize 128 --replSet rs0
    volumes:
      - ./data:/data/db

  mongo-init-replica:
    image: mongo:7.0
    command: mongosh --host mongo --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo:27017'}]})"
    depends_on:
      - mongo
EOF

# Create directories
mkdir -p uploads data
chown -R 1000:1000 uploads
chown -R 999:999 data

# Start services
docker-compose up -d

# Install Nginx
apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx
cat > /etc/nginx/sites-available/rocketchat << 'EOF'
server {
    listen 80;
    server_name everjust.chat;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 4. Setup SSL

```bash
certbot --nginx -d everjust.chat
```

### 5. Access Rocket.Chat

1. Open: https://everjust.chat
2. Create admin account
3. Complete setup wizard

## ✅ That's it! Your Rocket.Chat is ready!

### Useful Commands

```bash
# View logs
cd /opt/rocketchat && docker-compose logs -f

# Restart
cd /opt/rocketchat && docker-compose restart

# Stop
cd /opt/rocketchat && docker-compose down

# Update
cd /opt/rocketchat
docker-compose pull
docker-compose up -d
```

### Troubleshooting

If Rocket.Chat doesn't start:
```bash
# Check logs
docker-compose logs rocketchat
docker-compose logs mongo

# Restart services
docker-compose down
docker-compose up -d
```

### Backup

Daily backup cron job:
```bash
echo "0 2 * * * cd /opt/rocketchat && docker-compose exec -T mongo mongodump --archive=/data/backup-\$(date +\%Y\%m\%d).archive --db=rocketchat" | crontab -
```
